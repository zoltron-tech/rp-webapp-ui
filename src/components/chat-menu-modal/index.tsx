"use client";

import { useAuthContext } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { IoChatbubblesSharp } from "react-icons/io5";
import { Avatar } from "../common";
import * as S from "./styles";
import { Conversation } from "@/types/conversation";
import { getConversationsAction } from "@/app/rp/novelists/actions";
import moment from "moment";

interface ChatMenuProps {}

export const ChatMenuModal: FC<ChatMenuProps> = ({}) => {
  const { state: authState } = useAuthContext();
  const { user, novelist } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>();
  const [loading, setLoading] = useState(true);
  const { push } = useRouter();

  const onAvatarClick = (username: string) => {
    push(`/rp/profile/${username}`);
  };

  const toFormattedDate = (unixTime: number): string => {
    const date = moment.unix(unixTime);
    const today = moment();

    if (date.isSame(today, "day")) {
      // Return only the time if the date is today
      return date.format("LT"); // 'LT' is locale-specific time format (e.g., 12:30 PM)
    } else if (date.isSame(today, "year")) {
      // Return only the month and day if it's the same year
      return date.format("MMMM D"); // e.g., 'August 23'
    } else {
      // Return the full date if it's not the same year
      return date.format("LL"); // 'LL' is locale-specific date format (e.g., August 23, 2024)
    }
  };

  const onMoreMessagesClick = () => {
    window.location.replace(`${process.env.RP_CHAT_URL}`);
  };

  const onOpenMessagesClick = (username: string) => {
    window.location.replace(`${process.env.RP_CHAT_URL}?username=${username}`);
  };

  const fetchConversations = async () => {
    setLoading(true);
    const _muse = await getConversationsAction();

    if (!_muse || "message" in _muse) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setConversations(_muse);
  };

  useEffect(() => {
    if (authState === "LOADING" || conversations) return;

    fetchConversations();
  }, [authState]);

  if (!user) return <></>;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        <IoChatbubblesSharp size={40} />
        <S.Menu className={classNames({ open })}>
          {conversations &&
            conversations.slice(0, 5).map((conversation) => (
              <S.CardWrapper
                onClick={() => onOpenMessagesClick(conversation.username)}
                key={conversation.username}
              >
                <S.Card className="muse-card">
                  <S.CardHeader>
                    <Avatar
                      src={conversation.image}
                      alt={conversation.username}
                      size={40}
                      key={conversation.username}
                      name={"open"}
                      onClick={() => onAvatarClick(conversation.username)}
                      hoverable
                    />
                    <S.NotificationBox>
                      <S.username username={conversation.username}></S.username>
                      <S.Text>
                        {conversation.username === conversation.senderUsername
                          ? ""
                          : "You: "}
                        {conversation.message}
                      </S.Text>
                      <S.Date>{toFormattedDate(conversation.createdAt)}</S.Date>
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
