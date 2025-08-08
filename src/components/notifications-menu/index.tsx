"use client";

import { FC, useState, useEffect } from "react";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { IoMdNotifications } from "react-icons/io";

import * as S from "./styles";
import { getNotifications } from "@/app/rp/novelists/actions";
import { NovelistWorldNotification } from "@/types";
import { FriendRequestNotification } from "../friend-request-notification";
import { IconWrapper } from "./styles";
import { useGlobalState } from "@/context/store/stores";

interface NotificationsMenuProps {}

export const NotificationsMenu: FC<NotificationsMenuProps> = ({}) => {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");

  const [notifications, setNotifications] = useState<
    NovelistWorldNotification[] | null
  >(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const _notifications = await getNotifications();
    setLoading(false);
    setNotifications(_notifications);
  };

  const removeFriendRequestNotification = async (
    novelistToRemove: NovelistWorldNotification
  ) => {
    if (!notifications) return;

    const updatedFriendRequests = notifications.filter(
      (notification) => notification.id !== novelistToRemove.id
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
          {notifications &&
            notifications.map((request) => (
              <FriendRequestNotification
                key={request.source.title}
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
