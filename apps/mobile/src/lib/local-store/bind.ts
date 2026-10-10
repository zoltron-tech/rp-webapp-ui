import type { QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";
import { getStore, type LocalStore, openStore } from "./db";
import { registerBackgroundRefresh } from "./background";
import { attachPersistence, hydrateStore } from "./hydrate";
import { clearMediaIndex, loadMediaIndex, purgeMedia } from "./media";
import { readMeta } from "./meta";
import { clearOutboxIndex, loadOutbox } from "./outbox";
import { refreshStore } from "./refresh";

// Entity modules register their hydrators as a side effect of being imported.
import "./chat";
import "./feeds";
import "./ice-breakers";
import "./interactions";
import "./notifications";
import "./novelists";

/**
 * The store's lifetime against the query cache.
 *
 * `bindStore` opens the file, hydrates the cache from it and starts writing
 * the cache through to it. Binding a second time for the same account is a
 * no-op; for a different account it unbinds the first.
 *
 * Every return to the foreground hydrates again: the background task writes
 * to the file while the app is suspended, and this is how those rows reach
 * the screens — `seedQuery` only replaces what is older than the row, so a
 * screen that refetched since is left alone.
 */

let bound: { store: LocalStore; unsubscribe: () => void } | null = null;
let appState: { remove: () => void } | null = null;

export const bindStore = async (
  userId: string,
  queryClient: QueryClient,
): Promise<LocalStore | null> => {
  if (bound?.store.userId === userId && getStore() === bound.store) {
    return bound.store;
  }
  unbindStore();

  const store = await openStore(userId);
  if (!store) return null;

  // The media index before anything draws, so the first paint reads files.
  await loadMediaIndex(store).catch(() => {});
  void purgeMedia(store).catch(() => {});
  // What was written offline, so the thread shows it and the drain can send it.
  await loadOutbox(store).catch(() => {});

  // Persistence first, so what the cache already fetched is written; then
  // hydration, whose own writes are flagged and not echoed back.
  const unsubscribe = attachPersistence(store, queryClient);
  bound = { store, unsubscribe };
  await hydrateStore(store, queryClient);

  appState = AppState.addEventListener("change", (next) => {
    if (next !== "active") return;
    if (getStore() !== store) return;
    void resumeStore(store, queryClient);
  });

  void registerBackgroundRefresh();
  return store;
};

/**
 * Coming back to the foreground: hydrate what the background wrote, and, when
 * no refresh of any kind has run for a while, run one here — the platform may
 * not have (a Xiaomi with the app restricted, an iPhone after a force quit),
 * and this is the path that always does.
 */
const RESUME_REFRESH_AFTER_MS = 30 * 60 * 1000;

const resumeStore = async (store: LocalStore, queryClient: QueryClient) => {
  const last = Number((await readMeta(store, "refresh.at").catch(() => null)) ?? 0);
  if (Date.now() - last > RESUME_REFRESH_AFTER_MS) {
    await refreshStore(store).catch(() => {});
    if (getStore() !== store) return;
  }
  await hydrateStore(store, queryClient);
};

export const unbindStore = (): void => {
  clearMediaIndex();
  clearOutboxIndex();
  bound?.unsubscribe();
  bound = null;
  appState?.remove();
  appState = null;
};
