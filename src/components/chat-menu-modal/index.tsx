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
import { TiGroup } from "react-icons/ti";

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

  const getConversationPreviewText = (
    conversation: Conversation,
    currentUsername?: string
  ): string => {
    const lastMsg = conversation.lastMessage;

    if (lastMsg?.message) {
      const prefix =
        lastMsg.sender.username === currentUsername
          ? "You:"
          : `${lastMsg.sender.username}:`;
      return `${prefix} ${lastMsg.message}`;
    }

    if (lastMsg?.attachments && lastMsg.attachments.length > 0) {
      const url = lastMsg.attachments[0]?.url.toLowerCase();

      if (!url) return `${lastMsg.sender.username} sent an attachment`;

      if (
        url.endsWith(".png") ||
        url.endsWith(".jpg") ||
        url.endsWith(".jpeg")
      ) {
        return `${lastMsg.sender.username} sent an image`;
      }

      if (url.endsWith(".mp4")) {
        return `${lastMsg.sender.username} sent a video`;
      }

      if (url.endsWith(".mp3")) {
        return `${lastMsg.sender.username} sent an audio`;
      }

      return `${lastMsg.sender.username} sent a file`;
    }

    return `You can now message ${conversation.name}`;
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
                          onAvatarClick(
                            conversation.lastMessage.sender.username
                          )
                        }
                        hoverable
                      />
                    )}
                    {conversation.isGroup && <TiGroup size={40} />}

                    <S.NotificationBox>
                      <S.Heading>{conversation.name}</S.Heading>
                      <S.Text>
                        {getConversationPreviewText(
                          conversation,
                          novelist?.username
                        )}
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
