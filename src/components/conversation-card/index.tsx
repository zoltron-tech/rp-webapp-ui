"use client";

import type { Conversation } from "@nw/types";
import { useRouter } from "next/navigation";
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

const IMAGE_EXTS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "bmp",
  "svg",
  "tiff",
  "avif",
]);
const GIF_EXTS = new Set(["gif"]);
const VIDEO_EXTS = new Set([
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "flv",
  "wmv",
  "m4v",
]);
const AUDIO_EXTS = new Set([
  "mp3",
  "wav",
  "ogg",
  "flac",
  "aac",
  "m4a",
  "opus",
  "weba",
]);
const URL_RE = /^https?:\/\/\S+$/i;
const HTML_TAG_RE = /<(strong|em|b|i|span|br|div)\b/i;

/** Converts a rich-text HTML string to plain text for use in previews. */
const htmlToPlainText = (html: string): string => {
  // Replace mention chips with @displayName
  const withMentions = html.replace(
    /<span[^>]*class="mention-tag"[^>]*>.*?<span[^>]*class="mention-text"[^>]*>(.*?)<\/span>.*?<\/span>/gi,
    "@$1",
  );
  // Strip remaining tags and artefacts, then measure clean length for trimming
  return withMentions
    .replace(/<br\s*\/?>/gi, " ") // line breaks → space in preview
    .replace(/<div[^>]*>/gi, " ") // div openings → space
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\u200B/g, "") // zero-width spaces used as cursor anchors
    .replace(/\s+/g, " ") // collapse multiple spaces left by removed tags
    .trim();
};

const getLinkPreview = (url: string): string => {
  try {
    const { pathname } = new URL(url);
    const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
    if (GIF_EXTS.has(ext)) return "Sent a GIF";
    if (IMAGE_EXTS.has(ext)) return "Sent an image";
    if (VIDEO_EXTS.has(ext)) return "Sent a video";
    if (AUDIO_EXTS.has(ext)) return "Sent an audio clip";
  } catch {
    // fall through
  }
  return "Sent a link";
};

const getMessagePreview = (conversation: Conversation) => {
  const message = conversation.lastMessage;
  if (!message) return "Start a conversation";

  const hasText = !!message.message?.trim();
  if (hasText) {
    const raw = message.message.trim();
    if (URL_RE.test(raw)) return getLinkPreview(raw);
    const text = HTML_TAG_RE.test(raw) ? htmlToPlainText(raw) : raw;
    return text.length > 20 ? `${text.slice(0, 20)}...` : text;
  }

  if (message.image) return "Sent an image";
  if (message.attachments?.length) {
    return `Sent ${message.attachments.length} attachment${message.attachments.length > 1 ? "s" : ""}`;
  }

  const messageType = message.type?.toLowerCase();
  if (messageType?.includes("image")) return "Sent an image";
  if (messageType?.includes("video")) return "Sent a video";
  if (messageType?.includes("audio")) return "Sent an audio clip";
  if (messageType?.includes("file")) return "Sent a file";

  return "Sent a message";
};

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
  const router = useRouter();

  // Prefetch the conversation route so the first click is instant
  useEffect(() => {
    router.prefetch(ROUTES.Conversation.View(conversation.id));
  }, [router, conversation.id]);
  const { lastMessage } = conversation;
  const sender =
    lastMessage?.sender?.name || lastMessage?.sender?.username || "";
  const preview = getMessagePreview(conversation);
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
