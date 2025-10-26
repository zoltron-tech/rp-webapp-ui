"use client";

import { useCallback, useEffect, useState } from "react";
import { PageLoader } from "@/components/layout";
import { NotificcationsList } from "@/components/notification";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { getNotifications } from "../novelists/actions";

export default function NotifiactionsPage({}) {
  const [loading, setLoading] = useState(true);
  const authState = useGlobalState("authState");
  const notifications = useGlobalState("notifications");
  const set = useGlobalStoreSet();

  const fetchNotifications = useCallback(async () => {
    if (authState !== "LOGGED_IN") return;
    setLoading(true);
    const _notifications = await getNotifications();
    setLoading(false);

    set({ notifications: _notifications });
  }, [authState]);

  useEffect(() => {
    if (authState === "LOADING" || notifications) return;

    fetchNotifications();
  }, [authState]);

  // if (loading) return <PageLoader />;

  return <NotificcationsList />;
}
