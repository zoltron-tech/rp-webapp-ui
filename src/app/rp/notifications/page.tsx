"use client";

import { useCallback, useEffect, useState } from "react";
import { PageLoader } from "@/components/layout";
import { NotificcationsList } from "@/components/notification";
import { useGlobalState } from "@/context/store/stores";
import type { NovelistWorldNotification } from "@/types";
import { getNotifications } from "../novelists/actions";

export default function NotifiactionsPage({}) {
  const [loading, setLoading] = useState(true);
  const authState = useGlobalState("authState");

  const [notifications, setNotifications] = useState<
    NovelistWorldNotification[] | null
  >(null);

  const fetchNotifications = useCallback(async () => {
    if (authState !== "LOGGED_IN") return;
    setLoading(true);
    const _notifications = await getNotifications();
    setLoading(false);
    setNotifications(_notifications);
  }, [authState]);

  useEffect(() => {
    if (authState === "LOADING" || notifications) return;

    fetchNotifications();
  }, [authState]);

  if (loading) return <PageLoader />;

  return <NotificcationsList notifications={notifications} />;
}
