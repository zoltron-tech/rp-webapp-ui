import { useCallback, useEffect, useRef, useState } from "react";

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
 */
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
      .then(() => latest.current())
      .catch(() => undefined)
      .finally(() => {
        if (mounted.current) setRefreshing(false);
      });
  }, []);

  return { onRefresh, refreshing };
};
