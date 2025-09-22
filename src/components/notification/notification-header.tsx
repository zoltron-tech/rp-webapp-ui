"use client";

import { useCallback, useState } from "react";
import {
  getNotifications,
  patchNotifications,
} from "@/app/rp/novelists/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import * as S from "./styled";

export const NotificationHeader = () => {
  const [loading, setLoading] = useState(false);
  const authState = useGlobalState("authState");
  const set = useGlobalStoreSet();

  const fetchNotifications = useCallback(async () => {
    if (authState !== "LOGGED_IN") return;
    setLoading(true);
    const _notifications = await getNotifications();
    setLoading(false);

    set({ notifications: _notifications });
  }, [authState]);

  const markNotificationsAsRead = useCallback(async () => {
    console.log(authState);
    if (authState !== "LOGGED_IN") return;
    setLoading(true);
    console.log("andar");
    await patchNotifications();
    fetchNotifications();
    setLoading(false);
  }, [authState]);

  return (
    <S.NotificationsHeaderRoot>
      <S.NotificationHeaderText
        shape="rounded"
        onClick={() => markNotificationsAsRead()}
        loading={loading}
      >
        Mark all as read
      </S.NotificationHeaderText>
    </S.NotificationsHeaderRoot>
  );
};
