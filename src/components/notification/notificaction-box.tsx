import { ShouldRender } from "@novelist-world/ui";
import { type FC, type MouseEventHandler, useCallback } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import type { NovelistWorldNotification } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDateFromUnix } from "@/utils/helpers";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styled";

type NotificationBoxProps = {
  notification: NovelistWorldNotification;
};

export const NotificationBox: FC<NotificationBoxProps> = ({ notification }) => {
  const { routeToPage } = usePageRouter();
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
    },
    [notification],
  );

  return (
    <S.NotificationsBoxRoot onClick={handleClick}>
      <S.Content>
        <AvatarNew
          src={notification.source.image}
          alt={notification.source.title}
        />
        <S.Text>
          <S.Title>{notification.source.title}</S.Title>
          <S.Subtext>{notification.notificationText}</S.Subtext>
        </S.Text>
      </S.Content>
      <S.Extras>
        <ShouldRender preserveSpace if={!notification.isRead}>
          <S.unReadBadge />
        </ShouldRender>
        <S.StyledDate>
          {notification.date ? toFormattedDateFromUnix(notification.date) : ""}
        </S.StyledDate>
      </S.Extras>
    </S.NotificationsBoxRoot>
  );
};
