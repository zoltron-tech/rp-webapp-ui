"use client";

import { useCallback, useState } from "react";
import {
  getNotifications,
  patchNotifications,
} from "@/app/rp/novelists/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import * as S from "./styled";

export const NotificationHeader = () => {
  const [loading, setLoading] = useState(false);
  const { baseDataLoader } = usePageRouter();
  const authState = useGlobalState("authState");
  const set = useGlobalStoreSet();

  const markNotificationsAsRead = useCallback(async () => {
    if (authState !== "LOGGED_IN") return;
    setLoading(true);
    await patchNotifications();
    const _notifications = await baseDataLoader(() => getNotifications(1, 8));
    set({ notifications: _notifications });
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
