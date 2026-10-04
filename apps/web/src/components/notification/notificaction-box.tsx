import { ShouldRender } from "@novelist-world/ui";
import { isStoredNotification, useNotificationReadState } from "@nw/features";
import type { NovelistWorldNotification } from "@nw/types";
import { type FC, type MouseEventHandler, useCallback, useState } from "react";
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
import * as S from "./styled";

type NotificationBoxProps = {
  notification: NovelistWorldNotification;
};

export const NotificationBox: FC<NotificationBoxProps> = ({ notification }) => {
  const { routeToPage } = usePageRouter();
  const { errorToast, successToast } = useUIContext();
  const set = useGlobalStoreSet();
  const [loading, setLoading] = useState(false);
  const { markRead } = useNotificationReadState();

  const removeFromStore = () => {
    set((prev) => ({
      notifications:
        prev.notifications?.filter((n) => n.id !== notification.id) ?? null,
    }));
  };

  const handleAccept = async () => {
    if (!notification.source?.id || loading) return;
    setLoading(true);
    const response = await acceptFriendRequest(notification.source.id);
    setLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      successToast("Friend request accepted");
      removeFromStore();
    } else {
      errorToast("Could not accept friend request. Please try again.");
    }
  };

  const handleDecline = async () => {
    if (!notification.source?.id || loading) return;
    setLoading(true);
    const response = await deleteFriendRequest(notification.source.id);
    setLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      successToast("Friend request declined");
      removeFromStore();
    } else {
      errorToast("Could not decline friend request. Please try again.");
    }
  };

  const handleReactToMuseConnection = async (accepted: boolean) => {
    if (!notification.id || loading) return;
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
      removeFromStore();
    } else {
      errorToast("Could not update the muse connection. Please try again.");
    }
  };

  const handleClick: MouseEventHandler<HTMLElement> = useCallback(
    (_e) => {
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
    },
    [notification, routeToPage, markRead, set],
  );

  return (
    <S.NotificationsBoxRoot
      onClick={handleClick}
      data-unread={!notification.isRead || undefined}
    >
      <AvatarNew
        src={notification.source.image}
        alt={notification.source.title}
      />
      <S.Content>
        <S.Title>{notification.source.title}</S.Title>
        <S.Subtext>{notification.notificationText}</S.Subtext>
        <S.StyledDate>
          {notification.date ? toFormattedDateFromUnix(notification.date) : ""}
        </S.StyledDate>
        {notification.type === "FRIEND_REQUEST" && (
          <S.ButtonRow onClick={(e) => e.stopPropagation()}>
            <Button
              variant="positive"
              className={loading ? "messaging" : undefined}
              onClick={handleAccept}
            >
              {loading ? "…" : "Accept"}
            </Button>
            <Button
              variant="negative"
              className={loading ? "messaging" : undefined}
              onClick={handleDecline}
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
              onClick={() => handleReactToMuseConnection(true)}
            >
              {loading ? "…" : "Accept"}
            </Button>
            <Button
              variant="negative"
              className={loading ? "messaging" : undefined}
              onClick={() => handleReactToMuseConnection(false)}
            >
              {loading ? "…" : "Decline"}
            </Button>
          </S.ButtonRow>
        )}
      </S.Content>
      <S.Extras>
        <ShouldRender preserveSpace if={!notification.isRead}>
          <S.unReadBadge />
        </ShouldRender>
      </S.Extras>
    </S.NotificationsBoxRoot>
  );
};
