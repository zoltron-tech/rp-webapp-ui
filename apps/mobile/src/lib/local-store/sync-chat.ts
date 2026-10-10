import type { ApiClient } from "@nw/api";
import {
  getConversationMessagesAfter,
  getDeletedMessageIds,
} from "@nw/api/endpoints/conversation-detail";
import { getConversationChanges } from "@nw/api/endpoints/conversations";
import type { ChatCrypto } from "@nw/chat";
import { queryKeys } from "@nw/features";
import type { Conversation, Message } from "@nw/types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { deleteConversation, deleteMessages, newestMessageAt } from "./chat";
import type { LocalStore } from "./db";
import { lastSyncedAt, recordSync } from "./meta";
import { msToServerParam, serverDateToMs } from "./time";

/**
 * Reconciliation: making a local copy true again after time it was not
 * watching.
 *
 * Hydration (`chat.ts`) puts what the file holds into the cache, and the
 * freshness windows decide when a *page* is fetched again. Neither can learn
 * about a message deleted by its author or a conversation one was removed
 * from while the phone was off — those are absences, and a page fetch of what
 * exists does not list them. The delta routes from LOCAL_DATA_PLAN.md phase
 * 0b do: tombstones since a moment, exits since a moment, messages after a
 * moment.
 *
 * Each function here asks those routes with the moment the entity last
 * synced, applies the answer to the cache with `setQueryData` (the persist
 * subscription writes it to the file), and records the new moment. A backend
 * that does not have the routes yet answers 404, which the client functions
 * return as `null` — and the fallback is the page-1 refetch from the plan's
 * 4.4, which is what the app did before any of this existed.
 *
 * Nothing here runs on a timer. The inbox screen calls `reconcileInbox` when
 * it comes into focus; a conversation calls `reconcileThread` when it opens;
 * the background task calls both for the most recent threads.
 */

type Pages<T> = InfiniteData<T[], unknown>;

const SYNC_INBOX = "conversations";
const syncThread = (conversationId: string) => `thread.${conversationId}`;

/**
 * How far back the first reconcile looks when nothing was ever recorded:
 * the retention window, which is as far as the server keeps traces.
 */
const FIRST_SYNC_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000;

const sinceFor = (last: number) =>
  last > 0 ? last : Date.now() - FIRST_SYNC_LOOKBACK_MS;

export const reconcileInbox = async (
  store: LocalStore,
  queryClient: QueryClient,
  api: ApiClient,
): Promise<void> => {
  const started = Date.now();
  const since = sinceFor(await lastSyncedAt(store, SYNC_INBOX));

  const changes = await getConversationChanges(api, msToServerParam(since));
  if (changes === null || "message" in changes) {
    // The route is not there (404), or a backend that routes the path
    // somewhere else answers 400: either way the delta cannot be trusted,
    // and the honest fallback is the page-one refetch the app always did.
    await queryClient.invalidateQueries({
      exact: true,
      queryKey: queryKeys.conversations(),
    });
    await recordSync(store, SYNC_INBOX, "skipped", Date.now() - started);
    return;
  }

  for (const conversationId of changes.left) {
    queryClient.setQueryData<Pages<Conversation>>(
      queryKeys.conversations(),
      (previous) =>
        previous
          ? {
              ...previous,
              pages: previous.pages.map((page) =>
                page.filter((conversation) => conversation.id !== conversationId),
              ),
            }
          : previous,
    );
    queryClient.removeQueries({ queryKey: queryKeys.conversation(conversationId) });
    await deleteConversation(store, conversationId);
  }

  if (changes.conversations.length > 0) {
    // Something moved: the list's order is the server's to decide, and the
    // previews it carries are decrypted by the hook — one refetch of page
    // one, rather than a merge that would have to redo both.
    await queryClient.invalidateQueries({
      exact: true,
      queryKey: queryKeys.conversations(),
    });
  }

  await recordSync(store, SYNC_INBOX, "ok", Date.now() - started);
};

export const reconcileThread = async (
  store: LocalStore,
  queryClient: QueryClient,
  api: ApiClient,
  crypto: ChatCrypto,
  conversationId: string,
): Promise<void> => {
  const started = Date.now();
  const entity = syncThread(conversationId);
  const key = queryKeys.conversationMessages(conversationId);
  const since = sinceFor(await lastSyncedAt(store, entity));

  const deleted = await getDeletedMessageIds(api, conversationId, msToServerParam(since));
  if (deleted === null || "message" in deleted) {
    // No route (or not this route): refetch the thread's first page instead.
    await queryClient.invalidateQueries({ queryKey: key });
    await recordSync(store, entity, "skipped", Date.now() - started);
    return;
  }

  if (deleted.length > 0) {
    const gone = new Set(deleted);
    queryClient.setQueryData<Pages<Message>>(key, (previous) =>
      previous
        ? {
            ...previous,
            pages: previous.pages.map((page) =>
              page.filter((message) => !gone.has(message.id)),
            ),
          }
        : previous,
    );
    await deleteMessages(store, deleted);
  }

  // What arrived after the newest message the file holds. Nothing held means
  // nothing to be "after": the thread's own first fetch is the right read.
  const newest = await newestMessageAt(store, conversationId);
  if (newest > 0) {
    const arrived = await getConversationMessagesAfter(
      api,
      conversationId,
      msToServerParam(newest),
    );
    if (arrived && !("message" in arrived) && arrived.length > 0) {
      const decrypted = await crypto.decryptMessages(arrived, conversationId);
      queryClient.setQueryData<Pages<Message>>(key, (previous) => {
        if (!previous) return previous;
        const known = new Set(previous.pages.flat().map((message) => message.id));
        // Only what is genuinely newer: a backend without `after` answers page
        // one, whose older rows must not be stacked on top of the thread.
        const fresh = decrypted.filter(
          (message) =>
            !known.has(message.id) && serverDateToMs(message.createdAt) > newest,
        );
        if (fresh.length === 0) return previous;
        return {
          ...previous,
          pages: previous.pages.map((page, index) =>
            index === 0 ? [...fresh, ...page] : page,
          ),
        };
      });
    }
  }

  await recordSync(store, entity, "ok", Date.now() - started);
};
