"use client";
import { useAuthContext } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { PiChatsCircleDuotone } from "react-icons/pi";
import { Avatar } from "../common";
import * as S from "./styles";

interface ChatMenuProps {}

export const ChatMenuModal: FC<ChatMenuProps> = ({}) => {
  const { user, novelist } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { push } = useRouter();

  const onAvatarClick = (username: string) => {
    push(`/rp/profile/${username}`);
  };

  const onMoreMessagesClick = () => {
    push(`/rp/profile/messenger`);
  };

  Logger.info("ChatMenuModal rendered");

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <PiChatsCircleDuotone size={45} />
        <S.Menu className={classNames({ open })}>
          {novelist?.friends &&
            novelist?.friends.map((friend) => (
              <S.CardWrapper
                onClick={onMoreMessagesClick}
                key={friend.username}
              >
                <S.Card className="muse-card">
                  <S.CardHeader>
                    <Avatar
                      src={friend.image}
                      alt={friend.username}
                      size={40}
                      key={friend.username}
                      name={"open"}
                      onClick={() => onAvatarClick(friend.username)}
                      hoverable
                    />
                    <S.NotificationBox>
                      <S.username username={friend.username}></S.username>
                    </S.NotificationBox>
                  </S.CardHeader>
                </S.Card>
              </S.CardWrapper>
            ))}
          <S.CardWrapper key={"end"} className="end">
            <S.Card
              className="more-items-box"
              onClick={() => onMoreMessagesClick()}
            >
              <S.CardHeader>
                <S.Text>See all messages</S.Text>
              </S.CardHeader>
            </S.Card>
          </S.CardWrapper>
        </S.Menu>
      </S.ContentContainer>
    </S.PositionContainer>
  );
};
