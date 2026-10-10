import {
  CONVERSATIONS_PAGE_SIZE,
  MESSAGES_PAGE_SIZE,
  queryKeys,
} from "@nw/features";
import type { Conversation, Message } from "@nw/types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { LocalStore } from "./db";
import { registerHydrator, seedQuery } from "./hydrate";
import { prefetchMedia } from "./media";
import { serverDateToMs } from "./time";

/**
 * Conversations and their messages in the store.
 *
 * Three query keys feed two tables, all under the `conversations` prefix:
 *
 *  - `["conversations"]` — the inbox, an infinite query of `Conversation`
 *    pages. Persisted as a **replace**: every row in the pages is upserted
 *    with `confirmed_at = now`, and rows the server has not confirmed for
 *    24 h are deleted. That grace is what keeps a long inbox from flickering
 *    when only page 1 was walked, and the deletion is how a conversation one
 *    was removed from while offline disappears without a tombstone.
 *  - `["conversations", id]` — one conversation, as the header reads it.
 *    Upserted; its `position` is kept.
 *  - `["conversations", id, "messages"]` — a thread, pages newest-first.
 *    Persisted as a **window replace**: the rows between the oldest and the
 *    newest message in the pages are deleted and the pages inserted, so an
 *    edit, a reaction, or a message deleted by its author (which the socket
 *    or a reconcile removed from the pages) lands in the file as it is in
 *    memory. Rows older than the window are left alone: they are what the
 *    thread scrolls back into.
 *
 * `["conversations", id, "members"]` is not stored; it is one request and
 * changes rarely.
 *
 * ## Fourteen days
 *
 * `purgeOldMessages` deletes everything created more than `RETENTION_MS` ago.
 * It runs on open, after every message write, and in the background task —
 * the same window the server's cleanup job enforces, so a phone that stayed
 * offline does not keep what the server already destroyed.
 *
 * ## What is stored is what was shown
 *
 * Message bodies are the decrypted objects the hooks produced (decision 6.2
 * in LOCAL_DATA_PLAN.md); the file itself is the encryption boundary. A
 * message that could not be decrypted keeps its `e2eCiphertext`, exactly as
 * the in-memory cache does, and is retried on the next open.
 */

export const RETENTION_MS = 14 * 24 * 60 * 60 * 1000;
const CONFIRM_GRACE_MS = 24 * 60 * 60 * 1000;

type Pages<T> = InfiniteData<T[], unknown>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPages = <T>(value: unknown): value is Pages<T> =>
  isObject(value) && Array.isArray(value.pages);

const isConversation = (value: unknown): value is Conversation =>
  isObject(value) && typeof value.id === "string" && "isGroup" in value;

const isMessage = (value: unknown): value is Message =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.conversationId === "string";

/** Newest first, like the pages. */
const chunk = <T>(rows: T[], size: number): T[][] => {
  const pages: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    pages.push(rows.slice(index, index + size));
  }
  return pages;
};

const lastActivityOf = (conversation: Conversation): number =>
  Math.max(
    serverDateToMs(conversation.lastMessage?.createdAt),
    serverDateToMs(conversation.modifiedAt),
  );

// ─── Conversations ──────────────────────────────────────────────────────────

const upsertConversation = async (
  store: LocalStore,
  conversation: Conversation,
  fetchedAt: number,
  position: number | null,
) => {
  await store.db.runAsync(
    `INSERT INTO conversation (id, json, last_message_at, fetched_at, confirmed_at, position)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       json = excluded.json,
       last_message_at = excluded.last_message_at,
       fetched_at = excluded.fetched_at,
       confirmed_at = excluded.confirmed_at,
       position = CASE WHEN excluded.position < 0 THEN conversation.position ELSE excluded.position END`,
    conversation.id,
    JSON.stringify(conversation),
    lastActivityOf(conversation),
    fetchedAt,
    fetchedAt,
    position ?? -1,
  );
};

/** Faces and group pictures are kept; the preview's attachments are chat. */
const prefetchConversationMedia = (conversations: Conversation[]) => {
  prefetchMedia(
    conversations.flatMap((conversation) => [
      conversation.image,
      ...(conversation.members ?? []).map((member) => member.image),
      conversation.lastMessage?.sender?.image,
    ]),
    "general",
  );
  prefetchMedia(
    conversations.flatMap((conversation) => messageMedia(conversation.lastMessage)),
    "chat",
  );
};

/** What a message draws: its picture, its attachments, its sender's face. */
const messageMedia = (message: Message | null | undefined) =>
  message
    ? [message.image, ...(message.attachments ?? []).map((attachment) => attachment.url)]
    : [];

export const persistInbox = async (
  store: LocalStore,
  pages: Conversation[][],
  fetchedAt: number,
): Promise<void> => {
  const rows = pages.flat();
  prefetchConversationMedia(rows);
  await store.write(async () => {
    for (const [index, conversation] of rows.entries()) {
      await upsertConversation(store, conversation, fetchedAt, index);
    }
    // Everything just listed was confirmed at `fetchedAt`; what this removes
    // is only what the server has not shown for a day.
    await store.db.runAsync(
      "DELETE FROM conversation WHERE confirmed_at < ?",
      fetchedAt - CONFIRM_GRACE_MS,
    );
    // A thread without its conversation is a thread nobody can open — and
    // one whose owner may have been blocked or left. It goes too.
    await store.db.runAsync(
      "DELETE FROM message WHERE conversation_id NOT IN (SELECT id FROM conversation)",
    );
  });
};

/** A conversation the novelist left or was removed from: gone, with its thread. */
export const deleteConversation = async (
  store: LocalStore,
  conversationId: string,
): Promise<void> => {
  await store.write(async () => {
    await store.db.runAsync("DELETE FROM conversation WHERE id = ?", conversationId);
    await store.db.runAsync("DELETE FROM message WHERE conversation_id = ?", conversationId);
  });
};

// ─── Messages ───────────────────────────────────────────────────────────────

export const persistThread = async (
  store: LocalStore,
  conversationId: string,
  pages: Message[][],
  fetchedAt: number,
): Promise<void> => {
  const rows = pages.flat().filter(isMessage);
  if (rows.length === 0) return;
  prefetchMedia(rows.flatMap(messageMedia), "chat");
  prefetchMedia(
    rows.map((message) => message.sender?.image),
    "general",
  );
  const stamps = rows.map((message) => serverDateToMs(message.createdAt));
  const newest = Math.max(...stamps);
  const oldest = Math.min(...stamps);

  await store.write(async () => {
    await store.db.runAsync(
      "DELETE FROM message WHERE conversation_id = ? AND created_at BETWEEN ? AND ?",
      conversationId,
      oldest,
      newest,
    );
    for (const message of rows) {
      await store.db.runAsync(
        `INSERT INTO message (id, conversation_id, created_at, json, fetched_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           created_at = excluded.created_at,
           json = excluded.json,
           fetched_at = excluded.fetched_at`,
        message.id,
        conversationId,
        serverDateToMs(message.createdAt),
        JSON.stringify(message),
        fetchedAt,
      );
    }
    await store.db.runAsync(
      "DELETE FROM message WHERE created_at < ?",
      Date.now() - RETENTION_MS,
    );
  });
};

export const deleteMessages = async (
  store: LocalStore,
  ids: string[],
): Promise<void> => {
  if (ids.length === 0) return;
  await store.write(async () => {
    for (const id of ids) {
      await store.db.runAsync("DELETE FROM message WHERE id = ?", id);
    }
  });
};

/** The fourteen days, applied. Returns how many rows went. */
export const purgeOldMessages = async (store: LocalStore): Promise<number> => {
  const result = await store.db.runAsync(
    "DELETE FROM message WHERE created_at < ?",
    Date.now() - RETENTION_MS,
  );
  return result.changes;
};

/** The newest stored message's time for a thread, or 0. */
export const newestMessageAt = async (
  store: LocalStore,
  conversationId: string,
): Promise<number> => {
  const row = await store.db.getFirstAsync<{ at: number | null }>(
    "SELECT max(created_at) AS at FROM message WHERE conversation_id = ?",
    conversationId,
  );
  return row?.at ?? 0;
};

/** The conversations with the most recent activity — what the background task refreshes. */
export const mostRecentConversationIds = async (
  store: LocalStore,
  limit: number,
): Promise<string[]> => {
  const rows = await store.db.getAllAsync<{ id: string }>(
    "SELECT id FROM conversation ORDER BY last_message_at DESC LIMIT ?",
    limit,
  );
  return rows.map((row) => row.id);
};

// ─── Hydration ──────────────────────────────────────────────────────────────

const hydrateInbox = async (store: LocalStore, queryClient: QueryClient) => {
  const rows = await store.db.getAllAsync<{
    fetched_at: number;
    id: string;
    json: string;
  }>("SELECT id, json, fetched_at FROM conversation ORDER BY position ASC");
  if (rows.length === 0) return;

  const conversations: Conversation[] = [];
  let oldestFetch = Number.POSITIVE_INFINITY;
  for (const row of rows) {
    try {
      const parsed: unknown = JSON.parse(row.json);
      if (!isConversation(parsed)) continue;
      conversations.push(parsed);
      oldestFetch = Math.min(oldestFetch, row.fetched_at);
      seedQuery(queryClient, queryKeys.conversation(row.id), parsed, row.fetched_at);
    } catch {
      // A row that does not parse is a row the next sync replaces.
    }
  }
  if (conversations.length === 0) return;

  const pages = chunk(conversations, CONVERSATIONS_PAGE_SIZE);
  seedQuery(
    queryClient,
    queryKeys.conversations(),
    {
      pageParams: pages.map((_, index) => index + 1),
      pages,
    } satisfies Pages<Conversation>,
    oldestFetch,
  );
};

/** How many threads are placed in memory at bind; the rest wait to be opened. */
const HYDRATE_RECENT_THREADS = 10;

/**
 * One thread into the cache, from disk. The conversation screen calls this
 * as it opens (see `hooks/use-reconcile.ts`), so a thread that was not among
 * the recent few still paints from the file before its first fetch.
 */
export const hydrateThread = async (
  store: LocalStore,
  queryClient: QueryClient,
  conversationId: string,
): Promise<void> => hydrateThreads(store, queryClient, [conversationId]);

/**
 * Not every stored thread at bind: fourteen days of messages across every
 * conversation is more decrypted text than the screens about to mount can
 * use, held in memory for the whole session. The recent few are placed now
 * and the rest on demand.
 */
const hydrateThreads = async (
  store: LocalStore,
  queryClient: QueryClient,
  only?: string[],
) => {
  await purgeOldMessages(store);
  const ids = only ?? (await mostRecentConversationIds(store, HYDRATE_RECENT_THREADS));
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(", ");
  const rows = await store.db.getAllAsync<{
    conversation_id: string;
    fetched_at: number;
    json: string;
  }>(
    `SELECT conversation_id, json, fetched_at FROM message
     WHERE conversation_id IN (${placeholders})
     ORDER BY conversation_id, created_at DESC`,
    ...ids,
  );

  const byConversation = new Map<
    string,
    { messages: Message[]; oldestFetch: number }
  >();
  for (const row of rows) {
    try {
      const parsed: unknown = JSON.parse(row.json);
      if (!isMessage(parsed)) continue;
      const entry = byConversation.get(row.conversation_id) ?? {
        messages: [],
        oldestFetch: Number.POSITIVE_INFINITY,
      };
      entry.messages.push(parsed);
      entry.oldestFetch = Math.min(entry.oldestFetch, row.fetched_at);
      byConversation.set(row.conversation_id, entry);
    } catch {
      // Replaced by the next sync.
    }
  }

  for (const [conversationId, { messages, oldestFetch }] of byConversation) {
    const pages = chunk(messages, MESSAGES_PAGE_SIZE);
    seedQuery(
      queryClient,
      queryKeys.conversationMessages(conversationId),
      {
        pageParams: pages.map((_, index) => index + 1),
        pages,
      } satisfies Pages<Message>,
      oldestFetch,
    );
  }
};

registerHydrator({
  hydrate: async (store, queryClient) => {
    await hydrateInbox(store, queryClient);
    await hydrateThreads(store, queryClient);
  },
  persist: async (store, key, data, updatedAt) => {
    if (key.length === 1) {
      if (isPages<Conversation>(data)) {
        await persistInbox(store, data.pages, updatedAt);
      }
      return;
    }
    if (typeof key[1] !== "string") return;
    const conversationId = key[1];

    if (key.length === 2) {
      if (isConversation(data) && data.id === conversationId) {
        prefetchConversationMedia([data]);
        await store.write(() =>
          upsertConversation(store, data, updatedAt, null),
        );
      }
      return;
    }

    if (key.length === 3 && key[2] === "messages" && isPages<Message>(data)) {
      await persistThread(store, conversationId, data.pages, updatedAt);
    }
  },
  prefix: "conversations",
});
