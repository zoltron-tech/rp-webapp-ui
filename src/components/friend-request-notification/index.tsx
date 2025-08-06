"use client";
import { FC, HTMLProps } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";

import {
  acceptFriendRequest,
  deleteFriendRequest,
} from "@/app/rp/profile/actions";
import { API_MESSAGE } from "@/utils/constants";
import { Avatar } from "../common";
import * as S from "./styles";
import { NovelistWorldNotification } from "@/types";
import { toFormattedDateFromUnix } from "@/utils/helpers";

type Props = HTMLProps<HTMLDivElement> & {
  notification?: NovelistWorldNotification | null;
  removeMethod: (notification: NovelistWorldNotification) => void;
};

export const FriendRequestNotification: FC<Props> = ({
  notification,
  removeMethod,
  ...rest
}) => {
  const { push } = useRouter();

  const handleAcceptFriendRequest = async () => {
    if (!notification?.id) return;

    const response = await acceptFriendRequest(notification.id);

    if (response?.message === API_MESSAGE.Success) {
      removeMethod(notification);
    }
  };

  const handleDeleteFriendRequest = async () => {
    if (!notification?.id) return;

    const response = await deleteFriendRequest(notification.id);

    if (response?.message === API_MESSAGE.Success) {
      removeMethod(notification);
    }
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    notification: NovelistWorldNotification
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    if (notification.type === "MUSE_CONNECTION_REQUEST")
      push(`/rp/muse/${notification.target.urlProp}`);
    else if (
      ["PROMPT_COMMENT", "PROMPT_COMMENT_REPLY", "REPLY"].includes(
        notification.type
      )
    )
      push(`/rp/thread/${notification.target.urlProp}`);
    else if (notification.type === "FRIEND_REQUEST")
      push(`/rp/profile/${notification.source.urlProp}`);
  };

  Logger.info("FriendRequestNotification rendered");

  if (!notification) return <></>;

  return (
    <S.CardWrapper {...rest}>
      <S.Card
        className="muse-card"
        onClick={(e) => handleCardClick(e, notification)}
      >
        <S.CardHeader>
          <Avatar
            src={notification.source.image || ""}
            alt={""}
            size={40}
            name={"open"}
            hoverable
          />
          <S.NotificationBox>
            <S.Title>{notification.source.title}</S.Title>
            <S.Subtext>{notification.notificationText}</S.Subtext>
            <S.Date>
              {notification.date
                ? toFormattedDateFromUnix(notification.date)
                : ""}
            </S.Date>
          </S.NotificationBox>
          <S.NotificationActions>
            {/* <S.AcceptButton onClick={handleAcceptFriendRequest}>
              <FaCheck />
            </S.AcceptButton>
            <S.RemoveButton onClick={handleDeleteFriendRequest}>
              <RxCross2 />
            </S.RemoveButton> */}

            <S.unReadBadge />
          </S.NotificationActions>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};
