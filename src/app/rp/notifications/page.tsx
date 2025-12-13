"use client";

import { useCallback, useEffect } from "react";
import { NotificcationsList } from "@/components/notification";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { getNotifications } from "../novelists/actions";

export default function NotifiactionsPage({}) {
  const authState = useGlobalState("authState");
  const notifications = useGlobalState("notifications");
  const { baseDataLoader } = usePageRouter();

  const set = useGlobalStoreSet();

  const fetchNotifications = useCallback(async () => {
    const _notifications = await baseDataLoader(() => getNotifications());
    set({ notifications: _notifications });
  }, [authState]);

  useEffect(() => {
    if (authState === "LOADING" || notifications) return;

    fetchNotifications();
  }, [authState]);

  return <NotificcationsList />;
}
