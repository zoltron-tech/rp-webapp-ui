"use client";

import classNames from "classnames";
import { type FC, useCallback, useEffect, useState } from "react";
import { IoMdNotifications } from "react-icons/io";
import { getNotifications } from "@/app/rp/novelists/actions";
import { useGlobalState } from "@/context/store/stores";
import type { NovelistWorldNotification } from "@/types";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { FriendRequestNotification } from "../friend-request-notification";
import * as S from "./styles";
import { IconWrapper } from "./styles";

type NotificationsMenuProps = {};

export const NotificationsMenu: FC<NotificationsMenuProps> = ({}) => {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");

  const [notifications, setNotifications] = useState<
    NovelistWorldNotification[] | null
  >(null);
  const [open, setOpen] = useState(false);
  const [_loading, setLoading] = useState(true);

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
      <S.ContentContainer onClick={toggleState(setOpen)}>
        {unreadCount > 0 && (
          <S.NotificationBadge>{unreadCount}</S.NotificationBadge>
        )}
        <IconWrapper>
          <IoMdNotifications className="menu-icon" />
        </IconWrapper>
        <S.Menu className={classNames({ open })}>
          {notifications?.map((request) => (
            <FriendRequestNotification
              key={request.id}
              notification={request}
              removeMethod={removeFriendRequestNotification}
            ></FriendRequestNotification>
          ))}
          <S.CardWrapper key={"end"} className="end">
            <S.Card className="more-items-box">
              <S.CardHeader>
                <S.Text>See all friend requests</S.Text>
              </S.CardHeader>
            </S.Card>
          </S.CardWrapper>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
