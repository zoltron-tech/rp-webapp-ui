"use client";

import { useNotifications } from "@nw/features";
import { useEffect } from "react";
import { NotificcationsList } from "@/components/notification";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";

/**
 * Pagination, the `hasMore` rule and the "loaded but empty" case all moved into
 * `useNotifications` in `@nw/features`, where the mobile list reads them too.
 * What is left here is this app's own concern: the global store still holds
 * `notifications` for the notifications *menu* in the top bar, so the query's
 * result is mirrored into it.
 */
export default function NotifiactionsPage() {
  const authState = useGlobalState("authState");
  const set = useGlobalStoreSet();

  const { notifications, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useNotifications({ enabled: authState !== "LOADING" });

  useEffect(() => {
    set({ notifications });
  }, [notifications, set]);

  return (
    <NotificcationsList
      hasMore={hasNextPage}
      loadingMore={isFetchingNextPage}
      loadMore={() => {
        void fetchNextPage();
      }}
    />
  );
}
