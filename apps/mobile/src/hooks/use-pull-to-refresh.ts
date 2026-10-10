import { useCallback, useEffect, useRef, useState } from "react";
import { isOffline } from "@/lib/connectivity";

/**
 * The spinner a pull to refresh owes the reader — and only that one.
 *
 * Lists here used to hand `refreshing={query.isRefetching}` to their
 * `RefreshControl`. `isRefetching` is true for *any* background fetch over data
 * already on screen, and most of those nobody asked for: a tab mounting over a
 * cache entry another screen filled a minute ago (Home's suggestions rail reads
 * notifications, so the Notifications tab opened stale and refetched every
 * page), or a list persisted from the last launch. Each one drew the pull
 * spinner at the top of a page that was already showing its rows, which reads
 * as the page loading.
 *
 * So the control is told about the pulls it started, and nothing else. A
 * background refresh still happens; it just updates the rows where they are,
 * and a list with nothing yet shows its skeleton, not a spinner.
 *
 * `refresh` may return a promise (a `refetch`, or several at once); the spinner
 * holds until it settles.
 *
 * ## Offline
 *
 * A refetch with no network does not fail — react-query pauses it until the
 * connection returns (`lib/connectivity.ts`) — so a spinner tied to it would
 * turn until then. The pull is still made (it resumes on its own), but the
 * spinner is let go after a beat, which is also what tells the reader the
 * pull was heard.
 */
const OFFLINE_BEAT_MS = 600;

export const usePullToRefresh = (
  refresh: () => Promise<unknown> | unknown,
): { onRefresh: () => void; refreshing: boolean } => {
  const [refreshing, setRefreshing] = useState(false);

  // The latest `refresh` without making `onRefresh` change with it.
  const latest = useRef(refresh);
  latest.current = refresh;

  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void Promise.resolve()
      .then(() => {
        const run = Promise.resolve(latest.current()).catch(() => undefined);
        if (!isOffline()) return run;
        return new Promise((resolve) => setTimeout(resolve, OFFLINE_BEAT_MS));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted.current) setRefreshing(false);
      });
  }, []);

  return { onRefresh, refreshing };
};
