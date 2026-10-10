"use client";

import { notificationSummary, useNotificationReadState } from "@nw/features";
import { type FC, useCallback, useState } from "react";
import { BsCheckAll } from "react-icons/bs";
import {
  getNotifications,
  patchNotifications,
} from "@/app/rp/novelists/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import * as S from "./styled";

type Props = {
  /** Of the rows loaded so far. */
  unread: number;
  total: number;
};

export const NotificationHeader: FC<Props> = ({ unread, total }) => {
  const [loading, setLoading] = useState(false);
  const { baseDataLoader } = usePageRouter();
  const authState = useGlobalState("authState");
  const set = useGlobalStoreSet();
  const { refreshCounts } = useNotificationReadState();

  const markNotificationsAsRead = useCallback(async () => {
    if (authState !== "LOGGED_IN" || loading) return;
    setLoading(true);
    await patchNotifications();
    const _notifications = await baseDataLoader(() => getNotifications(1, 30));
    set({ notifications: _notifications });
    void refreshCounts();
    setLoading(false);
  }, [authState, loading, baseDataLoader, set, refreshCounts]);

  return (
    <S.NotificationsHeaderRoot>
      <S.HeaderText>
        <S.NotificationsHeaderTitle>Notifications</S.NotificationsHeaderTitle>
        <S.HeaderSummary>{notificationSummary(unread, total)}</S.HeaderSummary>
      </S.HeaderText>
      {unread > 0 && (
        <S.MarkAllButton
          type="button"
          onClick={markNotificationsAsRead}
          disabled={loading}
        >
          <BsCheckAll size={15} aria-hidden="true" />
          Mark all read
        </S.MarkAllButton>
      )}
    </S.NotificationsHeaderRoot>
  );
};
