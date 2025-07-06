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
import { FaPeopleGroup } from "react-icons/fa6";

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

  const toFormattedDate = (stringdate: string): string => {
    const today = moment().format("YYYY-MM-DD");
    const messageDate = moment.utc(stringdate).local();

    const isToday = messageDate.isSame(today, "day");
    const formattedDate = isToday
      ? messageDate.format("h:mm A")
      : messageDate.format("MMM D, h:mm A");

    return formattedDate;
  };

  const onMoreMessagesClick = () => {
    window.location.replace(`${process.env.RP_CHAT_URL}`);
  };

  const onOpenMessagesClick = (conversationId: string) => {
    window.location.replace(`${process.env.RP_CHAT_URL}?id=${conversationId}`);
  };

  const fetchConversations = async () => {
    setLoading(true);
    const _muse = await getConversationsAction(1, 5);

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
                onClick={() => onOpenMessagesClick(conversation.id)}
                key={conversation.id}
              >
                <S.Card className="muse-card">
                  <S.CardHeader>
                    {!conversation.isGroup && (
                      <Avatar
                        src={conversation.image}
                        alt={conversation.id}
                        size={40}
                        key={conversation.id}
                        name={"open"}
                        onClick={() =>
                          onAvatarClick(conversation.lastMessage.senderUsername)
                        }
                        hoverable
                      />
                    )}
                    {conversation.isGroup && <FaPeopleGroup size={40} />}

                    <S.NotificationBox>
                      <S.Heading>{conversation.name}</S.Heading>
                      <S.Text>
                        {conversation.lastMessage?.message
                          ? `${
                              conversation.lastMessage.senderUsername ===
                              novelist?.username
                                ? "You: "
                                : ""
                            }${conversation.lastMessage.message}`
                          : "You can now message " + conversation.name}
                      </S.Text>
                      <S.Date>
                        {conversation.lastMessage?.createdAt
                          ? toFormattedDate(conversation.lastMessage.createdAt)
                          : ""}
                      </S.Date>
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
