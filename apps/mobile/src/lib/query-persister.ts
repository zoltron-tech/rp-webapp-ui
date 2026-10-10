import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Query } from "@tanstack/react-query";

/**
 * The disk tier under the query cache.
 *
 * Everything cached was in memory and nowhere else, which is why the app came
 * back from a cold start with nothing: a friends list somebody had scrolled
 * through a minute before their phone locked was re-fetched from scratch. A
 * native feed does not do that — it paints the last thing it knew from disk and
 * reconciles behind the paint — and this is that tier.
 *
 * ## What is written, and what is deliberately not
 *
 * Only the queries listed in `PERSISTED_PREFIXES`. That is a whitelist rather
 * than a blocklist, because the failure modes are not symmetrical: forgetting
 * to persist something costs a re-fetch, and forgetting to *exclude* something
 * writes it to unencrypted device storage forever.
 *
 * Conversations and messages are excluded by that rule and would be excluded on
 * their own merits anyway. Chat content is encrypted at rest server-side; the
 * client decrypts it to render it, and writing those decrypted bodies into
 * AsyncStorage — which is a plaintext SQLite table an unlocked device hands to
 * any backup — would quietly undo the whole arrangement. The session and the
 * account are excluded for the same reason.
 */

const STORAGE_KEY = "nw-query-cache";

/**
 * Bumped when a cached shape changes.
 *
 * A dehydrated cache written by an older build is restored into a newer one
 * that may expect different fields on the same key. There is no migration path
 * for a cache, so the answer is to throw it away — the cost is one re-fetch,
 * against a screen rendering an object that is missing half its properties.
 */
const CACHE_VERSION = "v2";

/** A day. Older than this and a re-fetch is the honest answer anyway. */
export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * The query-key prefixes allowed onto disk.
 *
 * `profile` covers both a novelist (`["profile", username]`) and their friends
 * (`["profile", username, "friends"]`), which is the pair the friends screen
 * renders from.
 *
 * `explore` and `home` — the discovery feed and the home page's rails and
 * activity — used to be here too. They moved into the encrypted local store
 * (`local-store/feeds.ts`, v2 of this cache), which keeps their first pages
 * and refreshes them in the background; keeping a second, plaintext copy here
 * would have been exactly the leak the whitelist exists to prevent.
 *
 * A prompt's comments are deliberately *not* here (`["prompt", id,
 * "comments"]`). They are fetched only when somebody opens a card, they are one
 * request, and persisting them would put a copy of every thread the reader has
 * glanced at on disk for a day to save a fetch nobody is waiting on.
 */
const PERSISTED_PREFIXES = new Set(["leaderboard", "profile"]);

export const shouldPersistQuery = (query: Query): boolean => {
  const [prefix] = query.queryKey;
  if (typeof prefix !== "string") return false;
  if (!PERSISTED_PREFIXES.has(prefix)) return false;
  // A failed query has no data worth keeping, and restoring one puts a screen
  // into an error state over a network blip that is long since over.
  return query.state.status === "success";
};

export const queryPersister = createAsyncStoragePersister({
  key: STORAGE_KEY,
  storage: AsyncStorage,
  // Long enough to coalesce a burst of writes while a list pages in, short
  // enough that the cache is on disk before someone locks their phone.
  throttleTime: 1_000,
});

export const persistBuster = CACHE_VERSION;

/**
 * Wipes the persisted cache.
 *
 * `useLogout` already calls `queryClient.clear()`, which empties memory. Without
 * this the next launch would restore the *previous* user's profiles and friends
 * from disk, on a device that is now signed out or signed in as somebody else.
 */
export const purgePersistedQueries = () => queryPersister.removeClient();
