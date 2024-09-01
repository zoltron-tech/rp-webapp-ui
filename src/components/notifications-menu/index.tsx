"use client";

import { FC, useState, useEffect } from "react";

import { useAuthContext } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { IoPeopleCircle } from "react-icons/io5";
import * as S from "./styles";
import { getFriendRequests } from "@/app/rp/novelists/actions";
import { Novelist } from "@/types";
import { FriendRequestNotification } from "../friend-request-notification";

interface NotificationsMenuProps {}

export const NotificationsMenu: FC<NotificationsMenuProps> = ({}) => {
  const { user, state } = useAuthContext();
  const [friendRequests, setFriendRequests] = useState<Novelist[] | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { push } = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    const _friendRequests = await getFriendRequests();

    if (!_friendRequests || "message" in _friendRequests) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setFriendRequests(_friendRequests);
  };

  const removeFriendRequestNotification = async (
    novelistToRemove: Novelist
  ) => {
    if (!friendRequests) return;

    const updatedFriendRequests = friendRequests.filter(
      (novelist) => novelist.id !== novelistToRemove.id
    );

    setFriendRequests(updatedFriendRequests);
  };

  useEffect(() => {
    if (state === "LOADING" || friendRequests) return;

    fetchNotifications();
  }, [state]);

  Logger.info("NotificationsMenu rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <IoPeopleCircle size={45} />
        <S.Menu className={classNames({ open })}>
          {friendRequests &&
            friendRequests.map((request) => (
              <FriendRequestNotification
                key={request.username}
                novelist={request}
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
