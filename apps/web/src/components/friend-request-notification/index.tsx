"use client";
import { isStoredNotification, useNotificationReadState } from "@nw/features";
import type { NovelistWorldNotification } from "@nw/types";
import { type FC, useState } from "react";
import { reactToMuseConnectionAction } from "@/app/rp/muse/connection-actions";
import {
  acceptFriendRequest,
  deleteFriendRequest,
} from "@/app/rp/profile/actions";
import { Button } from "@/components/common";
import { useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { toFormattedDateFromUnix } from "@/utils/helpers";
import { notificationRoute } from "@/utils/notification-route";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type Props = {
  notification?: NovelistWorldNotification | null;
  removeMethod: (notification: NovelistWorldNotification) => void;
  onClose?: () => void;
};

export const FriendRequestNotification: FC<Props> = ({
  notification,
  removeMethod,
  onClose,
}) => {
  const { routeToPage } = usePageRouter();
  const { errorToast, successToast } = useUIContext();
  const [loading, setLoading] = useState(false);
  const { markRead } = useNotificationReadState();
  const set = useGlobalStoreSet();

  const _handleAcceptFriendRequest = async () => {
    if (!notification?.source?.id || loading) return;
    setLoading(true);
    const response = await acceptFriendRequest(notification.source.id);
    setLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      successToast("Friend request accepted");
      removeMethod(notification);
    } else {
      errorToast("Could not accept friend request. Please try again.");
    }
  };

  const _handleDeleteFriendRequest = async () => {
    if (!notification?.source?.id || loading) return;
    setLoading(true);
    const response = await deleteFriendRequest(notification.source.id);
    setLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      successToast("Friend request declined");
      removeMethod(notification);
    } else {
      errorToast("Could not decline friend request. Please try again.");
    }
  };

  const _handleReactToMuseConnection = async (accepted: boolean) => {
    if (!notification?.id || loading) return;
    setLoading(true);
    const response = await reactToMuseConnectionAction(
      notification.id,
      accepted,
    );
    setLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      successToast(
        accepted ? "Muse connection accepted" : "Muse connection declined",
      );
      removeMethod(notification);
    } else {
      errorToast("Could not update the muse connection. Please try again.");
    }
  };

  const handleClick = () => {
    if (!notification) return;
    onClose?.();

    if (!notification.isRead && isStoredNotification(notification.type)) {
      void markRead(notification.id);
      set((prev) => ({
        notifications:
          prev.notifications?.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          ) ?? null,
      }));
    }

    const route = notificationRoute(notification);
    if (route) routeToPage(route);
  };

  if (!notification) return null;

  return (
    <S.Item $unread={!notification.isRead} onClick={handleClick}>
      <AvatarNew
        src={notification.source.image || ""}
        alt={notification.source.title || "Avatar"}
      />
      <S.Body>
        <S.Name>{notification.source.title}</S.Name>
        <S.Text>{notification.notificationText}</S.Text>
        <S.Meta>
          <S.Timestamp>
            {notification.date
              ? toFormattedDateFromUnix(notification.date)
              : ""}
          </S.Timestamp>
        </S.Meta>
        {notification.type === "FRIEND_REQUEST" && (
          <S.ButtonRow onClick={(e) => e.stopPropagation()}>
            <Button
              variant="positive"
              className={loading ? "messaging" : undefined}
              onClick={_handleAcceptFriendRequest}
            >
              {loading ? "…" : "Accept"}
            </Button>
            <Button
              variant="negative"
              className={loading ? "messaging" : undefined}
              onClick={_handleDeleteFriendRequest}
            >
              {loading ? "…" : "Decline"}
            </Button>
          </S.ButtonRow>
        )}
        {notification.type === "MUSE_CONNECTION_REQUEST" && (
          <S.ButtonRow onClick={(e) => e.stopPropagation()}>
            <Button
              variant="positive"
              className={loading ? "messaging" : undefined}
              onClick={() => _handleReactToMuseConnection(true)}
            >
              {loading ? "…" : "Accept"}
            </Button>
            <Button
              variant="negative"
              className={loading ? "messaging" : undefined}
              onClick={() => _handleReactToMuseConnection(false)}
            >
              {loading ? "…" : "Decline"}
            </Button>
          </S.ButtonRow>
        )}
      </S.Body>
      {!notification.isRead && <S.UnreadDot aria-label="Unread" />}
    </S.Item>
  );
};
