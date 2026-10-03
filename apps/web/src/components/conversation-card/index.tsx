"use client";

import { conversationPreviewText } from "@nw/chat";
import type { Conversation } from "@nw/types";
import { type FC, useEffect } from "react";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { toLocalDate } from "@/utils/helpers";
import { EmailVerifiedBadge } from "../common";
import { AdminBadge } from "../common/admin-badge";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type ConversationCardProps = {
  conversation: Conversation;
  /** When provided (mobile panel mode), called instead of routing to the conversation page. */
  onOpen?: (conversationId: string, targetUserName: string) => void;
};

const formatInboxTimestamp = (value: string) => {
  if (!value) return "";

  const localMoment = toLocalDate(value);
  if (!localMoment || !localMoment.isValid()) return value;

  const date = localMoment.toDate();
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  const isSameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    ...(isSameYear ? {} : { year: "numeric" }),
  }).format(date);
};

/*
 * The preview rules moved to `@nw/chat`, so the inbox on a phone summarises a
 * message the same way this card does. They were a full second copy of the
 * extension lists and an HTML-stripping regex; the shared version parses with
 * `@nw/richtext` instead, which is the same parse the message bubble runs.
 */

const isMessageUnread = (isRead?: boolean) => {
  if (isRead === undefined) return false;
  return !isRead;
};

export const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  onOpen,
}) => {
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage } = usePageRouter();
  // The prefetch that used to live here is gone: React Router has no
  // equivalent and Vite already code-splits per route, so the chunk for this
  // destination is fetched on hover/click by the router itself.
  const { lastMessage } = conversation;
  const sender =
    lastMessage?.sender?.name || lastMessage?.sender?.username || "";
  // 20 characters, as this card has always truncated free text at.
  const preview = conversationPreviewText(conversation, 20);
  const timestamp = formatInboxTimestamp(
    lastMessage?.createdAt || conversation.modifiedAt || conversation.createdAt,
  );
  const unread = isMessageUnread(lastMessage?.isRead);

  const otherMember = conversation.members?.find(
    (member) => member.userName !== user?.username,
  );
  const displayName = conversation.isGroup
    ? conversation.name || "Untitled conversation"
    : `${otherMember?.firstName} ${otherMember?.lastName}`.trim() ||
      otherMember?.userName ||
      conversation.name ||
      "Untitled conversation";

  const openConversation = () => {
    const targetUserName =
      otherMember?.userName || lastMessage?.sender?.username;

    setGlobalState({ activeConversation: conversation });

    if (onOpen) {
      onOpen(conversation.id, targetUserName || "");
      return;
    }

    const conversationRoute = ROUTES.Conversation.View(conversation.id);
    const route = targetUserName
      ? `${conversationRoute}?target=${encodeURIComponent(targetUserName)}`
      : conversationRoute;

    // Cache conversation so the detail page can render header immediately
    setGlobalState({
      conversationNavDirection: "forward",
    });
    routeToPage(route, { skipLoading: true });
  };

  return (
    <S.Card className={unread ? "unread" : ""} onClick={openConversation}>
      <S.Header>
        <AvatarNew
          src={conversation.image ?? null}
          alt={displayName}
          username={otherMember?.userName}
          nwImage={conversation.isGroup ? undefined : otherMember?.avatar}
        />
        <S.Content>
          <S.ContentMain>
            <S.TopRow>
              <S.Title className={unread ? "unread" : ""}>
                {displayName}
              </S.Title>
              {conversation.isGroup && <S.GroupTag>Group</S.GroupTag>}
              {!conversation.isGroup &&
                otherMember?.isVerified &&
                (otherMember.userName === "novelistworld" ? (
                  <AdminBadge size={12} />
                ) : (
                  <EmailVerifiedBadge size={12} />
                ))}
            </S.TopRow>
            <S.MessagePreview className={unread ? "unread" : ""}>
              <S.Sender className={unread ? "unread" : ""}>
                {sender ? `${sender}: ` : ""}
              </S.Sender>
              {preview}
            </S.MessagePreview>
          </S.ContentMain>
          <S.Extras>
            <S.Timestamp className={unread ? "unread" : ""}>
              {timestamp}
            </S.Timestamp>
            {unread && <S.UnreadDot />}
          </S.Extras>
        </S.Content>
      </S.Header>
    </S.Card>
  );
};

export default ConversationCard;
