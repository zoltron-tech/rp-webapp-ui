import type { Query, QueryClient, QueryKey } from "@tanstack/react-query";
import type { LocalStore } from "./db";

/**
 * How the store and the query cache stay the same thing.
 *
 * Two directions, each one function per entity:
 *
 *  - **Hydrate** — on open, and on every return to the foreground, each
 *    entity's rows are placed into the query cache with `updatedAt` set to the
 *    row's `fetched_at`. From then on react-query's own `staleTime` is the
 *    freshness window from LOCAL_DATA_PLAN.md 4.1: inside it no request is
 *    made, outside it the screen paints the row and refetches behind the paint.
 *  - **Persist** — a subscription on the query cache: every successful fetch,
 *    every `setQueryData` a socket frame or a mutation makes, lands in SQLite
 *    through the writer registered for that key's prefix. The shared hooks in
 *    `@nw/features` do not know the store exists.
 *
 * ## Never overwrite something newer
 *
 * Hydration checks the cache's `dataUpdatedAt` before writing. A screen that
 * has already fetched since the row was stored keeps what it fetched; the
 * background task's newer rows win over an older in-memory copy on the next
 * foreground. Persistence has the same rule in the other direction: a writer
 * stamps `fetched_at` with the query's `dataUpdatedAt`, not `Date.now()`.
 */

export interface Hydrator {
  /** Loads this entity's rows into the cache. Called with the store open. */
  hydrate: (store: LocalStore, queryClient: QueryClient) => Promise<void>;
  /** Writes a cache entry that starts with `prefix` to the store. */
  persist?: (
    store: LocalStore,
    key: QueryKey,
    data: unknown,
    updatedAt: number,
  ) => Promise<void>;
  /** The first element of every query key this entity owns. */
  prefix: string;
}

const hydrators: Hydrator[] = [];

/** Raised while hydration writes the cache, so persistence ignores those writes. */
let hydrating = 0;

export const registerHydrator = (hydrator: Hydrator) => {
  hydrators.push(hydrator);
};

/**
 * Puts `data` into the cache at `key` unless the cache already holds something
 * fetched after `updatedAt`.
 */
export const seedQuery = (
  queryClient: QueryClient,
  key: QueryKey,
  data: unknown,
  updatedAt: number,
) => {
  const state = queryClient.getQueryState(key);
  if (state && state.dataUpdatedAt >= updatedAt) return;
  // The cache notifies its subscribers synchronously, so the persist
  // subscription below sees this write while the flag is up and skips it —
  // the row is what we just read, writing it back would be a no-op with a
  // transaction's cost.
  hydrating += 1;
  try {
    queryClient.setQueryData(key, data, { updatedAt });
  } finally {
    hydrating -= 1;
  }
};

export const hydrateStore = async (
  store: LocalStore,
  queryClient: QueryClient,
): Promise<void> => {
  for (const hydrator of hydrators) {
    try {
      await hydrator.hydrate(store, queryClient);
    } catch (cause) {
      if (__DEV__) console.warn(`local-store: hydrate ${hydrator.prefix}`, cause);
    }
  }
};

/**
 * Starts writing cache updates through to the store. Returns the unsubscribe.
 *
 * Only `success` updates: a query entering `error` or `pending` has no data
 * worth writing, and `removed` is garbage collection, not deletion.
 */
export const attachPersistence = (
  store: LocalStore,
  queryClient: QueryClient,
): (() => void) => {
  const persist = (query: Query) => {
    if (query.state.status !== "success") return;
    const { queryKey, state } = query;
    const [prefix] = queryKey;
    if (typeof prefix !== "string") return;
    const hydrator = hydrators.find((h) => h.prefix === prefix && h.persist);
    if (!hydrator?.persist) return;
    void hydrator
      .persist(store, queryKey, state.data, state.dataUpdatedAt)
      .catch((cause) => {
        if (__DEV__) console.warn(`local-store: persist ${prefix}`, cause);
      });
  };

  const cache = queryClient.getQueryCache();
  const unsubscribe = cache.subscribe((event) => {
    if (hydrating > 0) return;
    // `added` is a restore from the AsyncStorage persister or a prefetch:
    // data that arrived without a fetch event. `updated`/`success` is a fetch
    // or a `setQueryData`.
    if (event.type === "added") persist(event.query);
    else if (event.type === "updated" && event.action.type === "success") {
      persist(event.query);
    }
  });

  // What the cache already holds — the persister restores before this store
  // is bound, and a screen may have fetched in the gap.
  for (const query of cache.getAll()) persist(query);

  return unsubscribe;
};
