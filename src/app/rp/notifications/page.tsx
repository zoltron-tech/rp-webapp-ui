"use client";

import { useCallback, useEffect, useState } from "react";
import { NotificcationsList } from "@/components/notification";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { getNotifications } from "../novelists/actions";

const PAGE_SIZE = 8;

export default function NotifiactionsPage() {
  const authState = useGlobalState("authState");
  const notifications = useGlobalState("notifications");
  const { baseDataLoader } = usePageRouter();
  const set = useGlobalStoreSet();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(
    async (pageNumber: number, append = false) => {
      const data = await baseDataLoader(() =>
        getNotifications(pageNumber, PAGE_SIZE),
      );

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      set({
        notifications: append ? [...(notifications || []), ...data] : data,
      });
    },
    [authState, notifications],
  );

  useEffect(() => {
    if (authState === "LOADING") return;
    if (notifications) return;

    fetchNotifications(1);
  }, [authState]);

  const loadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    await fetchNotifications(nextPage, true);

    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <NotificcationsList
      hasMore={hasMore}
      loadingMore={loadingMore}
      loadMore={loadMore}
    />
  );
}
