import {
  getConversationMessages,
  sendConversationMessage,
} from "@nw/api/endpoints/conversation-detail";
import { getComment, getReplies } from "@nw/api/endpoints/thread";
import { getConversations, getIceBreakers } from "@nw/api/endpoints/conversations";
import {
  getNotificationFeed,
  getNovelist,
  getUserNovelist,
} from "@nw/api/endpoints/novelists";
import {
  CONVERSATIONS_PAGE_SIZE,
  MESSAGES_PAGE_SIZE,
  NOTIFICATIONS_PAGE_SIZE,
} from "@nw/features";
import { api } from "@/lib/api";
import { chatCrypto } from "@/lib/chat-crypto";
import {
  mostRecentConversationIds,
  persistInbox,
  persistThread,
  purgeOldMessages,
} from "./chat";
import type { LocalStore } from "./db";
import { FEEDS, fetchFeedPages, persistFeed, purgeOldFeedPages } from "./feeds";
import { persistIceBreakers } from "./ice-breakers";
import {
  deleteThread,
  persistReplies,
  recentThreadIds,
  REPLIES_PAGE_SIZE,
  upsertThread,
} from "./interactions";
import { drainMediaQueue, purgeMedia } from "./media";
import { recordSync, writeMeta } from "./meta";
import { persistNotifications } from "./notifications";
import { readNovelistRows, upsertNovelist } from "./novelists";
import { drainOutbox, isOutboxPost, sendableByRest, sendPost } from "./outbox";
import { noteReactivated } from "@/lib/welcome-back";

/**
 * One refresh of the store from the server, without React.
 *
 * This is the step list from LOCAL_DATA_PLAN.md 4.5, written against the
 * module-level `api` and `chatCrypto` rather than the hooks, so it can run
 * where there is no component tree: the background task, and the foreground
 * when it returns after a long absence. The screens learn about what it wrote
 * through the next hydration (`bind.ts` hydrates on every return to the
 * foreground).
 *
 * ## Bounded
 *
 * Every step checks the deadline before it starts and the task's expiration
 * flag between requests. iOS gives the processing task a budget it does not
 * promise; a step that does not get to run is simply next time's.
 *
 * ## Never wipes
 *
 * A 401 here means the session died while the app was closed. The foreground
 * owns that — `setSessionLostHandler` in `_layout.tsx` — and this function
 * leaves the file exactly as it was. See `background.ts` for the guard that
 * keeps the handler from firing during a run.
 */

/** How many threads a run refreshes; each is one request plus decryption. */
const RECENT_THREADS = 5;
/** How many opened prompt threads a run refreshes; each is two requests. */
const RECENT_PROMPT_THREADS = 5;
/** Profiles opened within this window are kept fresh; older ones are not worth the request. */
const RECENT_PROFILE_MS = 7 * 24 * 60 * 60 * 1000;

export interface RefreshOptions {
  /** Epoch ms after which no new step starts. */
  deadline?: number;
  /** Polled between requests; true means stop as soon as possible. */
  expired?: () => boolean;
}

type Step = { name: string; run: () => Promise<void> };

export const refreshStore = async (
  store: LocalStore,
  options: RefreshOptions = {},
): Promise<{ failed: string[]; ran: string[]; skipped: string[] }> => {
  const outOfTime = () =>
    (options.deadline !== undefined && Date.now() > options.deadline) ||
    options.expired?.() === true;

  const steps: Step[] = [
    {
      // What was written offline goes out first, so the fetches below bring
      // it back as real rows. Posts go out as the composer would send them;
      // REST only carries message words sent as yourself, the rest waits for
      // the socket (`outbox.ts`).
      name: "outbox",
      run: async () => {
        const { stopped } = await drainOutbox(
          store,
          async (entry) => {
            if (outOfTime()) return false;
            if (isOutboxPost(entry)) return sendPost(api, entry);
            const wire = await chatCrypto.encryptMessageText(
              entry.conversationId,
              entry.text,
            );
            const result = await sendConversationMessage(api, {
              conversationId: entry.conversationId,
              message: wire,
            });
            return result === true;
          },
          sendableByRest,
        );
        if (stopped) throw new Error("outbox");
      },
    },
    {
      name: "purge",
      run: async () => {
        await purgeOldMessages(store);
        await purgeOldFeedPages(store);
      },
    },
    {
      name: "self",
      run: async () => {
        const result = await getUserNovelist(api);
        if ("message" in result) throw new Error(String(result.message));
        // This load may be the one that switched a disabled account back on.
        if (result.reactivated) noteReactivated();
        await upsertNovelist(store, result, { fetchedAt: Date.now(), self: true });
      },
    },
    {
      name: "conversations",
      run: async () => {
        const result = await getConversations(api, 1, CONVERSATIONS_PAGE_SIZE);
        if (!result || "message" in result) throw new Error("conversations");
        const decrypted = await chatCrypto.decryptConversations(result);
        await persistInbox(store, [decrypted], Date.now());
      },
    },
    {
      name: "threads",
      run: async () => {
        const ids = await mostRecentConversationIds(store, RECENT_THREADS);
        for (const conversationId of ids) {
          if (outOfTime()) return;
          const result = await getConversationMessages(
            api,
            conversationId,
            1,
            MESSAGES_PAGE_SIZE,
          );
          if (!result || "message" in result) continue;
          const decrypted = await chatCrypto.decryptMessages(result, conversationId);
          await persistThread(store, conversationId, [decrypted], Date.now());
        }
      },
    },
    {
      name: "notifications",
      run: async () => {
        const result = await getNotificationFeed(api, null, NOTIFICATIONS_PAGE_SIZE);
        if (!result || "message" in result) throw new Error("notifications");
        await persistNotifications(store, [result], Date.now());
      },
    },
    {
      name: "ice-breakers",
      run: async () => {
        const result = await getIceBreakers(api);
        if (!result || "message" in result) throw new Error("ice-breakers");
        await persistIceBreakers(store, result, Date.now());
      },
    },
    {
      // Home and Explore: the first pages of each feed, replaced whole. One
      // feed failing does not stop the next; the step fails only if none
      // could be written.
      name: "feeds",
      run: async () => {
        let written = 0;
        let failed = 0;
        for (const feed of FEEDS) {
          if (outOfTime()) break;
          try {
            const pages = await fetchFeedPages(api, feed, outOfTime);
            if (pages.length === 0) continue;
            await persistFeed(store, feed, pages, Date.now());
            written += 1;
          } catch {
            failed += 1;
          }
        }
        if (written === 0 && failed > 0) throw new Error("feeds");
      },
    },
    {
      // The prompt threads opened most recently: the head and the first page
      // of replies, so the Threads tab opens them from disk.
      name: "interactions",
      run: async () => {
        const ids = await recentThreadIds(store, RECENT_PROMPT_THREADS);
        for (const threadId of ids) {
          if (outOfTime()) return;
          const head = await getComment(api, threadId);
          if (head === null) {
            await deleteThread(store, threadId);
            continue;
          }
          if ("message" in head) continue;
          await upsertThread(store, head, Date.now());
          const replies = await getReplies(api, threadId, 1, REPLIES_PAGE_SIZE);
          if (!replies || "message" in replies) continue;
          await persistReplies(store, threadId, [replies], Date.now());
        }
      },
    },
    {
      // Expired chat pictures go; whatever the steps above queued is fetched
      // while there is time left, so the next open draws from files.
      name: "media",
      run: async () => {
        await purgeMedia(store);
        if (options.deadline !== undefined) await drainMediaQueue(options.deadline);
        else await drainMediaQueue(Date.now() + 60_000);
      },
    },
    {
      name: "profiles",
      run: async () => {
        const cutoff = Date.now() - RECENT_PROFILE_MS;
        const rows = await readNovelistRows(store);
        for (const row of rows) {
          if (row.is_self || row.opened_at < cutoff) continue;
          if (outOfTime()) return;
          const result = await getNovelist(api, row.username);
          if (result === null) continue; // gone or blocked: left for the foreground's 404 handling
          if ("message" in result) continue;
          await upsertNovelist(store, result, { fetchedAt: Date.now() });
        }
      },
    },
  ];

  const ran: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  for (const step of steps) {
    if (outOfTime()) {
      skipped.push(step.name);
      continue;
    }
    const started = Date.now();
    try {
      await step.run();
      ran.push(step.name);
      await recordSync(store, step.name, "ok", Date.now() - started);
    } catch {
      failed.push(step.name);
      await recordSync(store, step.name, "failed", Date.now() - started).catch(
        () => {},
      );
    }
  }

  await writeMeta(store, "refresh.at", String(Date.now())).catch(() => {});
  return { failed, ran, skipped };
};
