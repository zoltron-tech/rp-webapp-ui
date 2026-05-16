import { ShouldRender } from "@novelist-world/ui";
import { type FC, type MouseEventHandler, useCallback, useState } from "react";
import {
  acceptFriendRequest,
  deleteFriendRequest,
} from "@/app/rp/profile/actions";
import { Button } from "@/components/common";
import { useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { NovelistWorldNotification } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDateFromUnix } from "@/utils/helpers";
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

  const handleClick: MouseEventHandler<HTMLElement> = useCallback(
    (_e) => {
      if (notification.type === "MUSE_CONNECTION_REQUEST")
        routeToPage(ROUTES.Muse.View(notification.target.urlProp));
      else if (
        ["PROMPT_COMMENT", "PROMPT_COMMENT_REPLY", "REPLY"].includes(
          notification.type,
        )
      )
        routeToPage(ROUTES.Thread.View(notification.target.urlProp));
      else if (notification.type === "FRIEND_REQUEST")
        routeToPage(ROUTES.Profile.View(notification.source.urlProp).Index);
      else if (notification.type === "REACTION")
        if (["COMMENT", "REPLY"].includes(notification.target.targetType))
          routeToPage(ROUTES.Thread.View(notification.target.urlProp));
        else if (notification.target.targetType === "PROMPT")
          routeToPage(ROUTES.Prompt.View(notification.target.urlProp));
    },
    [notification],
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
      </S.Content>
      <S.Extras>
        <ShouldRender preserveSpace if={!notification.isRead}>
          <S.unReadBadge />
        </ShouldRender>
      </S.Extras>
    </S.NotificationsBoxRoot>
  );
};
