import { queryKeys } from "@nw/features";
import type { Comment, Reply } from "@nw/types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { LocalStore } from "./db";
import { registerHydrator, seedQuery } from "./hydrate";
import { prefetchMedia } from "./media";
import { serverDateToMs } from "./time";

/**
 * Threads in the store — the Threads tab's other half.
 *
 * The tab itself lists the threads you have replied into
 * (`["outgoing-threads"]`); that list is a paged feed and rides in
 * `feed_page` beside the Home and Explore feeds (`feeds.ts`, three pages,
 * replaced whole). What is kept *here* is what opening one of them shows:
 *
 *  - `["thread", id]` — the comment at the head of the thread, with the
 *    prompt it hangs off. One row per thread, `opened_at` bumped when the
 *    thread screen mounts (`markThreadOpened`), the table pruned to the
 *    `KEEP_RECENT` most recently opened and anything not opened in
 *    `KEEP_FOR_MS` — the same rule the novelists table keeps, for the same
 *    reason: what you were reading last week is worth a cold start; what you
 *    read a month ago is a fetch away.
 *  - `["thread", id, "replies"]` — the replies, newest first, as the screen
 *    pages them. Persisted as a **replace** of the thread's rows with what
 *    the pages hold (at most `KEEP_REPLY_PAGES` pages), so a reply deleted
 *    or edited since lands in the file as it is in memory. Hydrated back as
 *    `InfiniteData` cut into pages of the screen's size, `pageParams`
 *    counted `1..n`, so "load more" asks for the next page as if these had
 *    been fetched this session.
 *
 * Replies to a thread are a conversation of their own, which is why this
 * mirrors `chat.ts` rather than the feed tables: a thread is opened and read
 * to the bottom, and the bottom is what the reader comes back for.
 */

/** The thread screen's page size (`screens/thread.tsx`). */
export const REPLIES_PAGE_SIZE = 10;
const KEEP_REPLY_PAGES = 3;
const KEEP_RECENT = 10;
const KEEP_FOR_MS = 30 * 24 * 60 * 60 * 1000;
/** How many threads are placed in memory at bind; the rest wait to be opened. */
const HYDRATE_RECENT = 10;

type Pages<T> = InfiniteData<T[], unknown>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isComment = (value: unknown): value is Comment =>
  isObject(value) && typeof value.id === "string" && typeof value.promptId === "string";

const isReply = (value: unknown): value is Reply =>
  isObject(value) && typeof value.id === "string" && typeof value.commentId === "string";

const isPages = <T>(value: unknown): value is Pages<T> =>
  isObject(value) && Array.isArray(value.pages) && value.pages.every(Array.isArray);

const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    out.push(items.slice(index, index + size));
  }
  return out;
};

/** Everything a thread head draws: two faces, and a picture on either post. */
const commentMedia = (comment: Comment): (string | null | undefined)[] => [
  comment.source?.image,
  comment.source?.avatar?.src,
  comment.media,
  comment.prompt?.source?.image,
  comment.prompt?.source?.avatar?.src,
  comment.prompt?.media,
];

const replyMedia = (reply: Reply): (string | null | undefined)[] => [
  reply.source?.image,
  reply.source?.avatar?.src,
  reply.media,
];

/** Inside a transaction: keeps the ten most recently opened, drops the rest. */
const pruneThreads = async (store: LocalStore) => {
  await store.db.runAsync(
    `DELETE FROM thread
     WHERE opened_at < ?
        OR id NOT IN (SELECT id FROM thread ORDER BY opened_at DESC LIMIT ?)`,
    Date.now() - KEEP_FOR_MS,
    KEEP_RECENT,
  );
  await store.db.runAsync(
    "DELETE FROM reply WHERE thread_id NOT IN (SELECT id FROM thread)",
  );
};

export const upsertThread = async (
  store: LocalStore,
  comment: Comment,
  fetchedAt: number,
): Promise<void> => {
  prefetchMedia(commentMedia(comment), "general");
  await store.write(async () => {
    await store.db.runAsync(
      `INSERT INTO thread (id, json, fetched_at, opened_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         json = excluded.json,
         fetched_at = excluded.fetched_at`,
      comment.id,
      JSON.stringify(comment),
      fetchedAt,
      // A fresh row starts its thirty days at the fetch; opening it moves it
      // to the front of the ten.
      fetchedAt,
    );
    await pruneThreads(store);
  });
};

/** The thread is gone (a 404): its rows go too, so it cannot be shown from disk. */
export const deleteThread = async (store: LocalStore, threadId: string): Promise<void> => {
  await store.write(async () => {
    await store.db.runAsync("DELETE FROM reply WHERE thread_id = ?", threadId);
    await store.db.runAsync("DELETE FROM thread WHERE id = ?", threadId);
  });
};

/** The thread screen opened this thread. Bumps the LRU. */
export const markThreadOpened = async (store: LocalStore, threadId: string): Promise<void> => {
  await store.write(async () => {
    await store.db.runAsync(
      "UPDATE thread SET opened_at = ? WHERE id = ?",
      Date.now(),
      threadId,
    );
    await pruneThreads(store);
  });
};

export const persistReplies = async (
  store: LocalStore,
  threadId: string,
  pages: Reply[][],
  fetchedAt: number,
): Promise<void> => {
  const rows = pages.slice(0, KEEP_REPLY_PAGES).flat().filter(isReply);
  prefetchMedia(rows.flatMap(replyMedia), "general");
  await store.write(async () => {
    // The pages are the thread as it stands; what they no longer hold was
    // deleted, or lies past the pages kept.
    await store.db.runAsync("DELETE FROM reply WHERE thread_id = ?", threadId);
    for (const reply of rows) {
      await store.db.runAsync(
        `INSERT INTO reply (id, thread_id, created_at, json, fetched_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           thread_id = excluded.thread_id,
           created_at = excluded.created_at,
           json = excluded.json,
           fetched_at = excluded.fetched_at`,
        reply.id,
        threadId,
        serverDateToMs(reply.createdOn),
        JSON.stringify(reply),
        fetchedAt,
      );
    }
  });
};

/** The threads opened most recently, newest first. The refresh walks these. */
export const recentThreadIds = async (store: LocalStore, limit: number): Promise<string[]> => {
  const rows = await store.db.getAllAsync<{ id: string }>(
    "SELECT id FROM thread ORDER BY opened_at DESC LIMIT ?",
    limit,
  );
  return rows.map((row) => row.id);
};

/**
 * One thread into the cache, from disk. The thread screen calls this as it
 * opens, so a thread that was not among the recent few still paints from
 * the file before its first fetch.
 */
export const hydrateThreadPage = async (
  store: LocalStore,
  queryClient: QueryClient,
  threadId: string,
): Promise<void> => hydrateThreads(store, queryClient, [threadId]);

const hydrateThreads = async (
  store: LocalStore,
  queryClient: QueryClient,
  only?: string[],
) => {
  const ids = only ?? (await recentThreadIds(store, HYDRATE_RECENT));
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(", ");

  const heads = await store.db.getAllAsync<{ fetched_at: number; id: string; json: string }>(
    `SELECT id, json, fetched_at FROM thread WHERE id IN (${placeholders})`,
    ...ids,
  );
  for (const row of heads) {
    try {
      const parsed: unknown = JSON.parse(row.json);
      if (!isComment(parsed)) continue;
      seedQuery(queryClient, queryKeys.thread(row.id), parsed, row.fetched_at);
    } catch {
      // Replaced by the next sync.
    }
  }

  const rows = await store.db.getAllAsync<{ fetched_at: number; json: string; thread_id: string }>(
    `SELECT thread_id, json, fetched_at FROM reply
     WHERE thread_id IN (${placeholders})
     ORDER BY thread_id, created_at DESC`,
    ...ids,
  );
  const byThread = new Map<string, { oldestFetch: number; replies: Reply[] }>();
  for (const row of rows) {
    try {
      const parsed: unknown = JSON.parse(row.json);
      if (!isReply(parsed)) continue;
      const entry = byThread.get(row.thread_id) ?? {
        oldestFetch: Number.POSITIVE_INFINITY,
        replies: [],
      };
      entry.replies.push(parsed);
      entry.oldestFetch = Math.min(entry.oldestFetch, row.fetched_at);
      byThread.set(row.thread_id, entry);
    } catch {
      // Replaced by the next sync.
    }
  }
  for (const [threadId, { oldestFetch, replies }] of byThread) {
    const pages = chunk(replies, REPLIES_PAGE_SIZE);
    seedQuery(
      queryClient,
      queryKeys.threadReplies(threadId),
      { pageParams: pages.map((_, index) => index + 1), pages } satisfies Pages<Reply>,
      oldestFetch,
    );
  }
};

registerHydrator({
  hydrate: async (store, queryClient) => {
    await hydrateThreads(store, queryClient);
  },
  persist: async (store, key, data, updatedAt) => {
    if (typeof key[1] !== "string") return;
    const threadId = key[1];
    if (key.length === 2) {
      if (data === null) {
        await deleteThread(store, threadId);
        return;
      }
      if (isComment(data) && data.id === threadId) {
        await upsertThread(store, data, updatedAt);
      }
      return;
    }
    if (key.length === 3 && key[2] === "replies" && isPages<Reply>(data)) {
      await persistReplies(store, threadId, data.pages, updatedAt);
    }
  },
  prefix: "thread",
});
