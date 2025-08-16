"use client";

import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { IoChatbubblesSharp } from "react-icons/io5";
import { TiGroup } from "react-icons/ti";
import { getConversationsAction } from "@/app/rp/novelists/actions";
import { useGlobalState } from "@/context/store/stores";
import type { Conversation } from "@/types/conversation";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate, toggleState } from "@/utils/helpers";
import { Avatar } from "../common";
import * as S from "./styles";

type ChatMenuProps = {};

export const ChatMenuModal: FC<ChatMenuProps> = ({}) => {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>();
  const [_loading, setLoading] = useState(true);
  const { push } = useRouter();

  const onAvatarClick = (username: string) => {
    push(ROUTES.Profile.View(username).Index);
  };

  const getConversationPreviewText = (
    conversation: Conversation,
    currentUsername?: string,
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

  const unreadCount =
    conversations?.filter((n) => n.lastMessage && !n.lastMessage.isRead)
      .length || 0;

  return (
    <S.PositionContainer>
      <S.ContentContainer onClick={toggleState(setOpen)}>
        {unreadCount > 0 && <S.UnreadBadge>{unreadCount}</S.UnreadBadge>}

        <S.IconWrapper>
          <IoChatbubblesSharp className="menu-icon" />
        </S.IconWrapper>
        <S.Menu className={classNames({ open })}>
          {conversations?.slice(0, 5).map((conversation) => (
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
                        onAvatarClick(conversation.lastMessage.sender.username)
                      }
                      hoverable
                    />
                  )}
                  {conversation.isGroup && <TiGroup size={40} />}

                  <S.NotificationBox>
                    <Flex
                      style={{
                        justifyContent: "space-between",
                        width: "95%",
                      }}
                    >
                      <Flex direction="column" align="flex-start" gap={"0px"}>
                        <S.Heading>{conversation.name}</S.Heading>
                        <S.Text
                          className={
                            conversation.lastMessage?.isRead ? "" : "unread"
                          }
                        >
                          {getConversationPreviewText(
                            conversation,
                            novelist?.username,
                          )}
                        </S.Text>
                      </Flex>
                      {conversation.lastMessage &&
                        !conversation.lastMessage.isRead && (
                          <S.UnreadMessageIcon />
                        )}
                    </Flex>

                    <S.StyledDate>
                      {conversation.lastMessage?.createdAt
                        ? toFormattedDate(conversation.lastMessage.createdAt)
                        : ""}
                    </S.StyledDate>
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
