import { queryKeys } from "@nw/features";
import type { Novelist, User } from "@nw/types";
import type { QueryClient } from "@tanstack/react-query";
import type { LocalStore } from "./db";
import { registerHydrator, seedQuery } from "./hydrate";
import { prefetchMedia } from "./media";
import { readMeta, writeMeta } from "./meta";

/**
 * Novelists in the store: your own, and the ten you opened most recently.
 *
 * Two query keys feed the table. `["session"]` is your own profile — the
 * object `useSession` resolves — stored with `is_self = 1`, so a cold start
 * can answer "who am I" from disk inside the session's own freshness window.
 * `["profile", username]` is anybody else's page.
 *
 * ## The ten, and the thirty days
 *
 * `opened_at` is bumped when a profile screen mounts (`markNovelistOpened`),
 * not when the row is fetched: a row that arrived as a seed for some other
 * screen has not been *opened*. After every write the table is pruned to
 * yourself plus the ten most recently opened, and anything not opened in
 * thirty days goes regardless (LOCAL_DATA_PLAN.md decision 6.6).
 *
 * ## A profile that is gone
 *
 * `["profile", username]` resolving to `null` is a 404 — the account was
 * deleted, or has blocked you. The row is deleted rather than kept, so a
 * blocked person's last known page cannot be shown from disk.
 */

const KEEP_RECENT = 10;
const KEEP_FOR_MS = 30 * 24 * 60 * 60 * 1000;

interface Row {
  fetched_at: number;
  is_self: number;
  json: string;
  opened_at: number;
  username: string;
}

const isNovelist = (value: unknown): value is Novelist =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Novelist).id === "string" &&
  typeof (value as Novelist).username === "string";

/** Every picture a profile carries, so the page is complete offline. */
const novelistMedia = (novelist: Novelist): (string | null | undefined)[] => [
  novelist.image,
  novelist.avatar?.src,
  novelist.banner?.src,
  ...(novelist.muses ?? []).map((muse) => muse.image),
  ...(novelist.friends ?? []).map((friend) => friend.image),
];

export const upsertNovelist = async (
  store: LocalStore,
  novelist: Novelist,
  options: { fetchedAt: number; self?: boolean },
): Promise<void> => {
  prefetchMedia(novelistMedia(novelist), "general");
  await store.write(async () => {
    await store.db.runAsync(
      `INSERT INTO novelist (id, username, json, fetched_at, opened_at, is_self)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         username = excluded.username,
         json = excluded.json,
         fetched_at = excluded.fetched_at,
         is_self = max(novelist.is_self, excluded.is_self)`,
      novelist.id,
      novelist.username,
      JSON.stringify(novelist),
      options.fetchedAt,
      // A fresh row starts its thirty days at the fetch; opening the profile
      // moves it to the front of the ten.
      options.fetchedAt,
      options.self ? 1 : 0,
    );
    // A username can move between accounts; the unique index would otherwise
    // reject the newer holder. The older row is stale by definition.
    await store.db.runAsync(
      "DELETE FROM novelist WHERE username = ? AND id <> ?",
      novelist.username,
      novelist.id,
    );
    await pruneNovelists(store);
  });
};

export const deleteNovelistByUsername = async (
  store: LocalStore,
  username: string,
): Promise<void> => {
  await store.db.runAsync(
    "DELETE FROM novelist WHERE username = ? AND is_self = 0",
    username,
  );
};

/** The profile screen opened this person. Bumps the LRU. */
export const markNovelistOpened = async (
  store: LocalStore,
  username: string,
): Promise<void> => {
  await store.write(async () => {
    await store.db.runAsync(
      "UPDATE novelist SET opened_at = ? WHERE username = ?",
      Date.now(),
      username,
    );
    await pruneNovelists(store);
  });
};

/** Inside a transaction: keeps self + the ten most recently opened, drops the rest. */
const pruneNovelists = async (store: LocalStore) => {
  await store.db.runAsync(
    `DELETE FROM novelist
     WHERE is_self = 0 AND (
       opened_at < ?
       OR id NOT IN (
         SELECT id FROM novelist WHERE is_self = 0
         ORDER BY opened_at DESC LIMIT ?
       )
     )`,
    Date.now() - KEEP_FOR_MS,
    KEEP_RECENT,
  );
};

export const readNovelistRows = (store: LocalStore) =>
  store.db.getAllAsync<Row>(
    "SELECT username, json, fetched_at, is_self, opened_at FROM novelist ORDER BY is_self DESC, opened_at DESC",
  );

registerHydrator({
  hydrate: async (store, queryClient: QueryClient) => {
    const rows = await readNovelistRows(store);
    for (const row of rows) {
      let novelist: unknown;
      try {
        novelist = JSON.parse(row.json);
      } catch {
        continue;
      }
      if (!isNovelist(novelist)) continue;
      seedQuery(
        queryClient,
        row.is_self ? queryKeys.session() : queryKeys.profile(row.username),
        novelist,
        row.fetched_at,
      );
    }
  },
  persist: async (store, key, data, updatedAt) => {
    if (key.length !== 2 || typeof key[1] !== "string") return;
    const username = key[1];
    if (data === null) {
      await deleteNovelistByUsername(store, username);
      return;
    }
    if (!isNovelist(data) || data.username !== username) return;
    await upsertNovelist(store, data, { fetchedAt: updatedAt });
  },
  prefix: "profile",
});

/**
 * The account (`["session", "user"]`): the palette and theme the app is
 * painted in. Not a novelist, so it rides in `meta` as one JSON value rather
 * than a table of its own. Without it an offline start, which answers "who am
 * I" from the novelist row, would paint the app in the novelist's palette
 * instead of the one the account chose — see `_layout.tsx`.
 */
const ACCOUNT_JSON = "account.json";
const ACCOUNT_AT = "account.at";

const isUser = (value: unknown): value is User =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as User).username === "string" &&
  typeof (value as User).palette === "string";

registerHydrator({
  // The novelist row is hydrated by the `profile` hydrator above (one pass
  // over the table); this one reads the account back.
  hydrate: async (store, queryClient: QueryClient) => {
    const [json, at] = await Promise.all([
      readMeta(store, ACCOUNT_JSON),
      readMeta(store, ACCOUNT_AT),
    ]);
    if (!json) return;
    try {
      const parsed: unknown = JSON.parse(json);
      if (!isUser(parsed)) return;
      seedQuery(queryClient, queryKeys.authUser(), parsed, Number(at ?? 0));
    } catch {
      // Replaced by the next sign-in.
    }
  },
  persist: async (store, key, data, updatedAt) => {
    if (key.length === 2 && key[1] === "user") {
      if (!isUser(data)) return;
      await writeMeta(store, ACCOUNT_JSON, JSON.stringify(data));
      await writeMeta(store, ACCOUNT_AT, String(updatedAt));
      return;
    }
    // `["session"]` only.
    if (key.length !== 1) return;
    if (!isNovelist(data)) return;
    await upsertNovelist(store, data, { fetchedAt: updatedAt, self: true });
  },
  prefix: "session",
});
