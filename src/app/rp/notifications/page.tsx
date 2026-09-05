"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NotificcationsList } from "@/components/notification";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { getNotifications } from "../novelists/actions";

const PAGE_SIZE = 20;

export default function NotifiactionsPage() {
  const authState = useGlobalState("authState");
  const notifications = useGlobalState("notifications");
  const { baseDataLoader } = usePageRouter();
  const set = useGlobalStoreSet();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const initialLoadDone = useRef(false);

  const fetchPage = useCallback(
    async (pageNumber: number, append: boolean) => {
      const data = await baseDataLoader(() =>
        getNotifications(pageNumber, PAGE_SIZE),
      );

      if (!data || data.length === 0) {
        setHasMore(false);
        // Record the empty result on a first page, so the list can tell
        // "loaded, nothing here" apart from "still loading" (both of which
        // otherwise leave `notifications` undefined) and show its empty state.
        if (!append) set({ notifications: [] });
        return;
      }

      setHasMore(data.length >= PAGE_SIZE);

      // Use functional updater to avoid stale closure on the notifications list.
      if (append) {
        set((prev) => ({
          notifications: [...(prev.notifications ?? []), ...data],
        }));
      } else {
        set({ notifications: data });
      }
    },
    [baseDataLoader, set],
  );

  useEffect(() => {
    if (authState === "LOADING") return;
    // Always (re)fetch page 1 on mount so `hasMore` reflects the current state,
    // even when the store already holds cached notifications from a previous visit.
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    setPage(1);
    fetchPage(1, false);
  }, [authState, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchPage(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, page, fetchPage]);

  return (
    <NotificcationsList
      hasMore={hasMore}
      loadingMore={loadingMore}
      loadMore={loadMore}
    />
  );
}
