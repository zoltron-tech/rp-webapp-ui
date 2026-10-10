"use client";

import { conversationPreview } from "@nw/chat";
import {
  inboxGroupFaces,
  inboxHue,
  inboxKind,
  inboxSpeaker,
  inboxThumbnail,
  isLastMessageMine,
  isMuted,
} from "@nw/features";
import type { Conversation } from "@nw/types";
import type { CSSProperties, FC, KeyboardEvent } from "react";
import { TbBellOff } from "react-icons/tb";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { toInboxTime, wsrvImage } from "@/utils/helpers";
import { EmailVerifiedBadge } from "../common";
import { AdminBadge } from "../common/admin-badge";
import { AvatarNew } from "../common/avatar-new";
import { INBOX_ICONS } from "./kinds";
import * as S from "./styles";

type ConversationCardProps = {
  conversation: Conversation;
  /** Tighter, for the right sidebar's preview. */
  compact?: boolean;
  /** When provided (mobile panel mode), called instead of routing to the conversation page. */
  onOpen?: (conversationId: string, targetUserName: string) => void;
};

/** The preview picture, at three device pixels per point. */
const THUMB_IMAGE = { fit: "cover", h: 120, w: 120 } as const;

/**
 * Whether a conversation is waiting on the reader: its last message is
 * someone else's and has not been read. Your own unread message is theirs to
 * read, not yours.
 */
export const isConversationUnread = (
  conversation: Conversation,
  myUsername: string | null | undefined,
): boolean =>
  conversation.lastMessage?.isRead === false &&
  !isLastMessageMine(conversation, myUsername);

/**
 * One conversation, in the inbox and in the right sidebar alike.
 *
 * Drawn in the notification row's language. Who it is with is the avatar — two
 * of them, overlapped, for a group with no picture of its own. Where the
 * thread stands is the small coloured glyph on its corner, from
 * `@nw/features`, the table the phone reads too.
 */
export const ConversationCard: FC<ConversationCardProps> = ({
  compact,
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
  const myUsername = user?.username;

  // The sentence, not the markup around it; CSS ellipsises at the row's width.
  const { describes, text } = conversationPreview(conversation);
  const speaker = inboxSpeaker(conversation, myUsername, describes);
  const unread = isConversationUnread(conversation, myUsername);
  // No push and no sound for this one; the row says so, because nothing else does.
  const muted = isMuted(conversation.mutedUntil);

  const kind = inboxKind(conversation, myUsername);
  const Glyph = INBOX_ICONS[kind];
  const thumb = inboxThumbnail(conversation);

  const otherMember = conversation.members?.find(
    (member) => member.userName !== user?.username,
  );
  const displayName = conversation.isGroup
    ? conversation.name || "Untitled conversation"
    : `${otherMember?.firstName} ${otherMember?.lastName}`.trim() ||
      otherMember?.userName ||
      conversation.name ||
      "Untitled conversation";

  // A group's own picture when it has one; otherwise the people in it.
  const groupFaces =
    conversation.isGroup && !conversation.image
      ? inboxGroupFaces(conversation, myUsername)
      : [];
  const pair = groupFaces.length > 1;

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

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openConversation();
  };

  return (
    <S.Card
      tabIndex={0}
      onClick={openConversation}
      onKeyDown={onKeyDown}
      data-unread={unread || undefined}
      data-compact={compact || undefined}
      style={{ "--kind": inboxHue(kind) } as CSSProperties}
    >
      <S.Faces data-pair={pair || undefined}>
        {pair ? (
          <>
            <AvatarNew
              className="face-back"
              src={groupFaces[1].image || null}
              nwImage={groupFaces[1].avatar}
              alt=""
            />
            <AvatarNew
              className="face-front"
              src={groupFaces[0].image || null}
              nwImage={groupFaces[0].avatar}
              alt={displayName}
            />
          </>
        ) : (
          <AvatarNew
            src={conversation.image ?? null}
            alt={displayName}
            username={otherMember?.userName}
            nwImage={conversation.isGroup ? undefined : otherMember?.avatar}
          />
        )}
        <S.Glyph aria-hidden="true">
          <Glyph />
        </S.Glyph>
      </S.Faces>

      <S.Body>
        <S.NameRow>
          <S.Title>{displayName}</S.Title>
          {!conversation.isGroup &&
            otherMember?.isVerified &&
            (otherMember.userName === "novelistworld" ? (
              <AdminBadge size={12} />
            ) : (
              <EmailVerifiedBadge size={12} />
            ))}
        </S.NameRow>
        <S.MessagePreview>
          {speaker && <S.Sender>{speaker}</S.Sender>}
          {text}
        </S.MessagePreview>
      </S.Body>

      {thumb && (
        <S.Thumb src={wsrvImage(thumb, THUMB_IMAGE)} alt="" loading="lazy" />
      )}
      {/* When, and whether it is unread: a column of its own at the row's
          trailing edge, so the time sits in the same place on every row and a
          picture goes to its left rather than pushing it inward. */}
      <S.Meta>
        <S.Timestamp>
          {toInboxTime(
            lastMessage?.createdAt ||
              conversation.modifiedAt ||
              conversation.createdAt,
          )}
        </S.Timestamp>
        <S.DotSlot>
          {/* Muted and unread: both, the bell before the dot. */}
          {muted && (
            <S.MutedMark role="img" aria-label="Muted" title="Muted">
              <TbBellOff size={13} />
            </S.MutedMark>
          )}
          {unread && <S.UnreadDot role="img" aria-label="Unread" />}
        </S.DotSlot>
      </S.Meta>
    </S.Card>
  );
};

export default ConversationCard;
