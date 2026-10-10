import type { IceBreaker } from "@nw/types";
import type { QueryClient } from "@tanstack/react-query";
import type { LocalStore } from "./db";
import { registerHydrator, seedQuery } from "./hydrate";
import { prefetchMedia } from "./media";

/**
 * The ice-breaker rail in the store.
 *
 * One query key, `["ice-breakers"]` (local to `hooks/use-ice-breakers.ts`),
 * one small list with no paging. Persisted as a **replace-all**: what the
 * server answered is the whole rail, so rows it did not list are gone. Own
 * create and delete invalidate the key, and the refetch lands here.
 */

export const ICE_BREAKERS_KEY = ["ice-breakers"] as const;

const isIceBreaker = (value: unknown): value is IceBreaker =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as IceBreaker).sourceId === "string";

export const persistIceBreakers = async (
  store: LocalStore,
  iceBreakers: IceBreaker[],
  fetchedAt: number,
): Promise<void> => {
  prefetchMedia(
    iceBreakers.map((iceBreaker) => iceBreaker.source?.image),
    "general",
  );
  await store.write(async () => {
    await store.db.runAsync("DELETE FROM ice_breaker");
    for (const iceBreaker of iceBreakers) {
      await store.db.runAsync(
        "INSERT INTO ice_breaker (source_id, json, fetched_at) VALUES (?, ?, ?)",
        iceBreaker.sourceId,
        JSON.stringify(iceBreaker),
        fetchedAt,
      );
    }
  });
};

registerHydrator({
  hydrate: async (store, queryClient: QueryClient) => {
    const rows = await store.db.getAllAsync<{ fetched_at: number; json: string }>(
      "SELECT json, fetched_at FROM ice_breaker",
    );
    if (rows.length === 0) return;
    const iceBreakers: IceBreaker[] = [];
    let oldestFetch = Number.POSITIVE_INFINITY;
    for (const row of rows) {
      try {
        const parsed: unknown = JSON.parse(row.json);
        if (!isIceBreaker(parsed)) continue;
        iceBreakers.push(parsed);
        oldestFetch = Math.min(oldestFetch, row.fetched_at);
      } catch {
        // Replaced by the next sync.
      }
    }
    if (iceBreakers.length === 0) return;
    seedQuery(queryClient, ICE_BREAKERS_KEY, iceBreakers, oldestFetch);
  },
  persist: async (store, key, data, updatedAt) => {
    if (key.length !== 1 || !Array.isArray(data)) return;
    await persistIceBreakers(store, data.filter(isIceBreaker), updatedAt);
  },
  prefix: "ice-breakers",
});
