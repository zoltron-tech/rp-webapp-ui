import { queryKeys } from "@nw/features";
import type { NotificationFeed, NovelistWorldNotification } from "@nw/types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { LocalStore } from "./db";
import { registerHydrator, seedQuery } from "./hydrate";
import { prefetchMedia } from "./media";

/**
 * The notification feed in the store.
 *
 * One query key, `["notifications", "feed"]`: an infinite query whose pages
 * are `{ items, nextCursor }`. Persisted as an upsert of every item plus the
 * **cap** from LOCAL_DATA_PLAN.md decision 6.5 — the newest 200 rows, none
 * older than 90 days. Read/seen flags ride along: the screen's optimistic
 * "mark all read" is a `setQueryData`, which the persist subscription writes
 * through like any other.
 *
 * ## One page back, and the cursor to continue from
 *
 * The feed pages by server cursor, and the store has no way to recreate the
 * cursors between pages. So hydration hands the cache a single page holding
 * every stored row, newest first, with `nextCursor` set to the last cursor
 * the server gave — kept in `sync_cursor` — so "load more" carries on from
 * where the last fetch stopped rather than from nothing.
 *
 * `["notification-counts"]` is not stored: the badge's number must never be
 * a day old, and its 30-second poll is cheap.
 */

const KEEP_ROWS = 200;
const KEEP_FOR_MS = 90 * 24 * 60 * 60 * 1000;
const CURSOR = "notifications";

type Pages = InfiniteData<NotificationFeed, unknown>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFeedPages = (value: unknown): value is Pages =>
  isObject(value) &&
  Array.isArray(value.pages) &&
  value.pages.every((page) => isObject(page) && Array.isArray(page.items));

const isNotification = (value: unknown): value is NovelistWorldNotification =>
  isObject(value) && typeof value.id === "string" && typeof value.date === "number";

/** Seconds from some rows, milliseconds from others — the same rule `kinds.ts` applies. */
const dateMs = (date: number) => (date < 1e12 ? date * 1000 : date);

export const persistNotifications = async (
  store: LocalStore,
  pages: NotificationFeed[],
  fetchedAt: number,
): Promise<void> => {
  const items = pages.flatMap((page) => page.items).filter(isNotification);
  const last = pages[pages.length - 1];
  prefetchMedia(
    items.flatMap((item) => [
      item.source?.image,
      ...(item.actors ?? []).map((actor) => actor.image),
    ]),
    "general",
  );
  await store.write(async () => {
    for (const item of items) {
      await store.db.runAsync(
        `INSERT INTO notification (id, created_at, is_read, is_seen, json, fetched_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           created_at = excluded.created_at,
           is_read = excluded.is_read,
           is_seen = excluded.is_seen,
           json = excluded.json,
           fetched_at = excluded.fetched_at`,
        item.id,
        dateMs(item.date),
        item.isRead ? 1 : 0,
        item.isSeen ? 1 : 0,
        JSON.stringify(item),
        fetchedAt,
      );
    }
    if (last) {
      await store.db.runAsync(
        `INSERT INTO sync_cursor (entity, cursor, synced_at) VALUES (?, ?, ?)
         ON CONFLICT(entity) DO UPDATE SET cursor = excluded.cursor, synced_at = excluded.synced_at`,
        CURSOR,
        last.nextCursor,
        fetchedAt,
      );
    }
    await pruneNotifications(store);
  });
};

/** Inside a transaction: the cap. */
const pruneNotifications = async (store: LocalStore) => {
  await store.db.runAsync(
    `DELETE FROM notification
     WHERE created_at < ?
        OR id NOT IN (SELECT id FROM notification ORDER BY created_at DESC LIMIT ?)`,
    Date.now() - KEEP_FOR_MS,
    KEEP_ROWS,
  );
};

registerHydrator({
  hydrate: async (store, queryClient: QueryClient) => {
    const rows = await store.db.getAllAsync<{ fetched_at: number; json: string }>(
      "SELECT json, fetched_at FROM notification ORDER BY created_at DESC",
    );
    if (rows.length === 0) return;

    const items: NovelistWorldNotification[] = [];
    let oldestFetch = Number.POSITIVE_INFINITY;
    for (const row of rows) {
      try {
        const parsed: unknown = JSON.parse(row.json);
        if (!isNotification(parsed)) continue;
        items.push(parsed);
        oldestFetch = Math.min(oldestFetch, row.fetched_at);
      } catch {
        // Replaced by the next sync.
      }
    }
    if (items.length === 0) return;

    const cursor = await store.db.getFirstAsync<{ cursor: string | null }>(
      "SELECT cursor FROM sync_cursor WHERE entity = ?",
      CURSOR,
    );

    seedQuery(
      queryClient,
      queryKeys.notifications(),
      {
        pageParams: [null],
        pages: [{ items, nextCursor: cursor?.cursor ?? null }],
      } satisfies Pages,
      oldestFetch,
    );
  },
  persist: async (store, key, data, updatedAt) => {
    if (key.length !== 2 || key[1] !== "feed") return;
    if (!isFeedPages(data)) return;
    await persistNotifications(store, data.pages, updatedAt);
  },
  prefix: "notifications",
});
