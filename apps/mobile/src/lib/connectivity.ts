import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useSyncExternalStore } from "react";
import { AppState } from "react-native";

/**
 * Whether the phone can reach anything — one answer for the whole app.
 *
 * Two readers, one source. `expo-network` reports the platform's view of the
 * connection (Wi-Fi with no internet behind it counts as off); that goes to
 * react-query's `onlineManager`, which *pauses* every fetch rather than
 * letting it fail — a query that already has data keeps it, and a query with
 * none waits in `pending` / `paused` instead of reporting an error it would
 * have to be talked out of. The same answer is kept here as a module store
 * for the screens, which need it synchronously and from render.
 *
 * ## What offline looks like to a screen
 *
 * Nothing changes for what was already fetched, or hydrated from the local
 * store (`lib/local-store`): the rows are on screen and stay there. The gaps
 * are the queries that have nothing — a thread never opened, a rail never
 * fetched, a profile never visited — and `isOfflineGap` is the one rule for
 * recognising one: no data, and either the fetch is paused on the network or
 * the error it hit was the network. `components/offline.tsx` is what a gap
 * looks like; `components/list-status.tsx` draws it for every list that uses
 * `ListStatus`, so most screens need no change at all.
 *
 * ## Why not the fetch failure alone
 *
 * A fetch that fails with "Network request failed" is the honest signal, but
 * it arrives *after* a round trip has been attempted and retried, and it puts
 * the query in `error` — a state react-query will not leave until something
 * refetches it. The platform's answer arrives before any request is made and
 * lifts itself when the connection returns (`refetchOnReconnect` does the
 * rest). The failure is still recognised, for the second or two before the
 * platform has noticed, and for a connection that exists but goes nowhere.
 */

let offline = false;
let started = false;
const listeners = new Set<() => void>();

/** `isInternetReachable` is `null` while unknown; only a definite `false` counts. */
const judge = (state: Network.NetworkState): boolean =>
  state.isConnected === false || state.isInternetReachable === false;

const set = (next: boolean) => {
  if (next === offline) return;
  offline = next;
  for (const listener of listeners) listener();
};

/**
 * How often the state is re-read while the app is in front.
 *
 * The listener is the fast path, but it is not trusted alone: on the Xiaomi
 * flipping airplane mode on with the app open never reached it, while a
 * fresh read answered correctly. So the state is also read on every return
 * to the foreground and on a slow tick while in front — one cheap native
 * call, and the one way to be sure.
 */
const POLL_MS = 10_000;

/** Wires the platform's connectivity to react-query and to `useOffline`. Once. */
export const startConnectivity = (): void => {
  if (started) return;
  started = true;
  onlineManager.setEventListener((setOnline) => {
    const apply = (state: Network.NetworkState) => {
      const next = judge(state);
      setOnline(!next);
      set(next);
    };
    const read = () => {
      void Network.getNetworkStateAsync().then(apply).catch(() => {});
    };

    read();
    const subscription = Network.addNetworkStateListener(apply);

    let timer: ReturnType<typeof setInterval> | null = null;
    const stopPolling = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const startPolling = () => {
      if (timer) return;
      timer = setInterval(read, POLL_MS);
    };
    if (AppState.currentState === "active") startPolling();
    const appState = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        read();
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      subscription.remove();
      appState.remove();
      stopPolling();
    };
  });
};

export const isOffline = (): boolean => offline;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Re-renders when the connection comes or goes. */
export const useOffline = (): boolean =>
  useSyncExternalStore(subscribe, isOffline, () => false);

/** The messages a fetch fails with when the network, not the server, is the problem. */
const NETWORK_FAILURE =
  /network request failed|failed to fetch|internet connection appears to be offline|could not connect to the server|unable to resolve host|connection abort|network is unreachable|timed out|ECONNREFUSED|ENETUNREACH|ETIMEDOUT|EHOSTUNREACH/i;

export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return NETWORK_FAILURE.test(message);
};

/**
 * Whether `query` has nothing to show *because* the network is gone — the
 * state a screen draws the offline notice for, rather than a spinner that
 * never ends or a "That did not load" that was never the server's fault.
 */
export const isOfflineGap = (
  query: {
    error?: unknown;
    fetchStatus?: "fetching" | "idle" | "paused";
    isPending: boolean;
  },
  offlineNow: boolean = offline,
): boolean => {
  if (offlineNow && query.isPending && query.fetchStatus === "paused") return true;
  if (isNetworkError(query.error)) return true;
  // Offline, and the last attempt failed: whatever it said, the fix is the same.
  return offlineNow && Boolean(query.error);
};
