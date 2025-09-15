"use client";

import classNames from "classnames";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { IoMdNotifications } from "react-icons/io";
import { getNotifications } from "@/app/rp/novelists/actions";
import { useGlobalState } from "@/context/store/stores";
import type { NovelistWorldNotification } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { FriendRequestNotification } from "../friend-request-notification";
import * as S from "./styles";
import { IconWrapper } from "./styles";

type NotificationsMenuProps = {};

function checkIsMobile() {
  const minWidth = 768; // Minimum width for desktop devices
  return window.innerWidth < minWidth || screen.width < minWidth;
}

export const NotificationsMenu: FC<NotificationsMenuProps> = ({}) => {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const { push } = useRouter();

  const [notifications, setNotifications] = useState<
    NovelistWorldNotification[] | null
  >(null);
  const [open, setOpen] = useState(false);
  const [_loading, setLoading] = useState(true);
  const isMobile = useMemo(() => checkIsMobile(), []);

  const handleSeeAllClick = useCallback(() => {
    push(ROUTES.Notification);
  }, []);

  const handleClick = useCallback(() => {
    if (isMobile) {
      handleSeeAllClick();
      return;
    }

    toggleState(setOpen)();
  }, [isMobile]);

  const fetchNotifications = useCallback(async () => {
    if (authState !== "LOGGED_IN") return;
    setLoading(true);
    const _notifications = await getNotifications();
    setLoading(false);
    setNotifications(_notifications);
  }, [authState]);

  const removeFriendRequestNotification = async (
    novelistToRemove: NovelistWorldNotification,
  ) => {
    if (!notifications) return;

    const updatedFriendRequests = notifications.filter(
      (notification) => notification.id !== novelistToRemove.id,
    );

    setNotifications(updatedFriendRequests);
  };

  useEffect(() => {
    if (authState === "LOADING" || notifications) return;

    fetchNotifications();
  }, [authState]);

  Logger.info("NotificationsMenu rendered");

  if (!user) return <></>;

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={handleClick}>
        {unreadCount > 0 && (
          <S.NotificationBadge>{unreadCount}</S.NotificationBadge>
        )}
        <IconWrapper>
          <IoMdNotifications className="menu-icon" />
        </IconWrapper>
        <S.Menu className={classNames({ open })}>
          {notifications?.slice(0, 5).map((request) => (
            <FriendRequestNotification
              key={request.id}
              notification={request}
              removeMethod={removeFriendRequestNotification}
            ></FriendRequestNotification>
          ))}
          <S.CardWrapper key={"end"} className="end">
            <S.Card className="more-items-box" onClick={handleSeeAllClick}>
              <S.CardHeader>
                <S.Text>See all notifications</S.Text>
              </S.CardHeader>
            </S.Card>
          </S.CardWrapper>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
