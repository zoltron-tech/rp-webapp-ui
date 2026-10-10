import type { LocalStore } from "./db";

/**
 * Small facts about the store itself: when each entity last synced, how the
 * run went, how long it took. What the development screen prints, and what
 * the background task reads to decide whether an entity is due.
 */

export const readMeta = async (
  store: LocalStore,
  key: string,
): Promise<string | null> => {
  const row = await store.db.getFirstAsync<{ value: string }>(
    "SELECT value FROM meta WHERE key = ?",
    key,
  );
  return row?.value ?? null;
};

export const writeMeta = async (
  store: LocalStore,
  key: string,
  value: string,
): Promise<void> => {
  await store.db.runAsync(
    "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value,
  );
};

export const readAllMeta = async (
  store: LocalStore,
): Promise<Record<string, string>> => {
  const rows = await store.db.getAllAsync<{ key: string; value: string }>(
    "SELECT key, value FROM meta ORDER BY key",
  );
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
};

/** Per-entity sync bookkeeping, under `sync.<entity>.*`. */
export const recordSync = async (
  store: LocalStore,
  entity: string,
  result: "ok" | "failed" | "skipped",
  durationMs: number,
  /**
   * The moment the sync *started*. A delta asked for "since the last sync"
   * must not skip what happened while that sync was in flight, so the moment
   * recorded is the one before the request went out, not after it came back.
   */
  at: number = Date.now() - durationMs,
): Promise<void> => {
  await store.write(async () => {
    await writeMeta(store, `sync.${entity}.at`, String(at));
    await writeMeta(store, `sync.${entity}.result`, result);
    await writeMeta(store, `sync.${entity}.ms`, String(Math.round(durationMs)));
  });
};

export const lastSyncedAt = async (
  store: LocalStore,
  entity: string,
): Promise<number> => Number((await readMeta(store, `sync.${entity}.at`)) ?? 0);
