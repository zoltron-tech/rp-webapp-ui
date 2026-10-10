import type { SQLiteDatabase } from "expo-sqlite";

/**
 * The schema, as a list of steps.
 *
 * `PRAGMA user_version` says which step the file is at; opening runs every
 * step after it, in one transaction each. A step is appended, never edited:
 * a file written by an older build must still be brought forward by the same
 * sequence the newer build ran on a fresh file.
 *
 * ## Why so few columns
 *
 * Each table keeps the entity exactly as the hooks consume it, as one `json`
 * column, so there is no mapping layer to drift from the shared `@nw/types`.
 * The columns beside it exist only for `WHERE`, `ORDER BY` and `DELETE`: the
 * 14-day purge, the LRU of novelists, the newest-first notification feed.
 *
 * ## When a step cannot carry data forward
 *
 * It does not have to. This is a cache: a step that changes a shape may simply
 * `DELETE` the table's rows and let the next sync refill it, which is what
 * `CACHE_VERSION` in `query-persister.ts` does for the other tier. The cost is
 * one re-fetch; the alternative is a screen rendering an object that is
 * missing half its properties.
 */

type Step = (db: SQLiteDatabase) => Promise<void>;

const STEPS: Step[] = [
  // v1 — the five entities of LOCAL_DATA_PLAN.md section 4.2.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      CREATE TABLE novelist (
        id TEXT PRIMARY KEY NOT NULL,
        username TEXT NOT NULL UNIQUE,
        json TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        opened_at INTEGER NOT NULL,
        is_self INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX novelist_opened ON novelist (is_self DESC, opened_at DESC);

      CREATE TABLE conversation (
        id TEXT PRIMARY KEY NOT NULL,
        json TEXT NOT NULL,
        last_message_at INTEGER NOT NULL,
        fetched_at INTEGER NOT NULL,
        confirmed_at INTEGER NOT NULL,
        position INTEGER NOT NULL
      );
      CREATE INDEX conversation_order ON conversation (position ASC);

      CREATE TABLE message (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        json TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
      );
      CREATE INDEX message_thread ON message (conversation_id, created_at DESC);

      CREATE TABLE notification (
        id TEXT PRIMARY KEY NOT NULL,
        created_at INTEGER NOT NULL,
        is_read INTEGER NOT NULL,
        is_seen INTEGER NOT NULL,
        json TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
      );
      CREATE INDEX notification_feed ON notification (created_at DESC);

      CREATE TABLE ice_breaker (
        source_id TEXT PRIMARY KEY NOT NULL,
        json TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
      );

      CREATE TABLE sync_cursor (
        entity TEXT PRIMARY KEY NOT NULL,
        cursor TEXT,
        synced_at INTEGER NOT NULL
      );
    `);
  },
  // v2 — the media index (`media.ts`): one row per downloaded URL.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE media (
        url TEXT PRIMARY KEY NOT NULL,
        path TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        kind TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        last_used_at INTEGER NOT NULL,
        expires_at INTEGER
      );
      CREATE INDEX media_expiry ON media (expires_at);
      CREATE INDEX media_lru ON media (kind, last_used_at);
    `);
  },
  // v3 — the Home and Explore feeds (`feeds.ts`): one row per page, at most
  // `FEED_KEEP_PAGES` per feed, replaced whole on every write.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE feed_page (
        feed TEXT NOT NULL,
        page INTEGER NOT NULL,
        json TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        PRIMARY KEY (feed, page)
      );
    `);
  },
  // v4 — the outbox (`outbox.ts`): messages written while offline, waiting
  // for a connection. One row per message, in the order they were written.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE outbox (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL,
        json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX outbox_order ON outbox (created_at ASC);
    `);
  },
  // v5 — threads (`interactions.ts`): the comment at the head of a thread
  // you opened (with the prompt it hangs off), and its replies. The Threads
  // tab's own list rides in `feed_page` as the `outgoing-threads` feed.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE thread (
        id TEXT PRIMARY KEY NOT NULL,
        json TEXT NOT NULL,
        fetched_at INTEGER NOT NULL,
        opened_at INTEGER NOT NULL
      );
      CREATE INDEX thread_opened ON thread (opened_at DESC);

      CREATE TABLE reply (
        id TEXT PRIMARY KEY NOT NULL,
        thread_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        json TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
      );
      CREATE INDEX reply_thread ON reply (thread_id, created_at DESC);
    `);
  },
];

export const SCHEMA_VERSION = STEPS.length;

/**
 * Brings the file to `SCHEMA_VERSION`. Returns the version it started at.
 *
 * `withTransactionAsync`, never `withExclusiveTransactionAsync`: the exclusive
 * flavour runs on a *second* native connection, which never received
 * `PRAGMA key` and therefore reads the file as ciphertext — "file is not a
 * database". The same rule holds for every write in this store.
 */
export const migrate = async (db: SQLiteDatabase): Promise<number> => {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const from = row?.user_version ?? 0;

  for (let version = from; version < STEPS.length; version += 1) {
    await db.withTransactionAsync(async () => {
      await STEPS[version](db);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }

  return from;
};
