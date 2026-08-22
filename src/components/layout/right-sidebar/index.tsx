"use client";

import type { Novelist, PromptThreadComment } from "@nw/types";
import type { Conversation } from "@nw/types/conversation";
import { type FC, useEffect, useState } from "react";
import { FiCheck, FiFeather, FiUserPlus, FiUsers } from "react-icons/fi";
import { getConversationsAction } from "@/app/rp/conversations/actions";
import { getStrangerNovelistsAction } from "@/app/rp/home/actions";
import { getOutgoingThreadsAction } from "@/app/rp/outgoing-threads/actions";
import { sendFriendRequest } from "@/app/rp/profile/actions";
import { EmailVerifiedBadge } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { ConversationCard } from "@/components/conversation-card";
import { useSocket } from "@/context/socket";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { decryptConversations } from "@/utils/e2e-crypto";
import { toFormattedDateFromUnix } from "@/utils/helpers";
import * as S from "./styles";

const THREADS_PREVIEW_COUNT = 3;
const SUGGESTIONS_PREVIEW_COUNT = 4;
const CONVERSATIONS_PREVIEW_COUNT = 2;

/** The suggestions endpoint returns a couple of computed fields (mutual
 * friend count) beyond the strict Novelist type — the same looseness
 * NovelistPreviewCard already relies on for this exact data source. */
type SuggestionNovelist = Novelist & { mutualFriendCount?: number };

const ThreadRow: FC<{ thread: PromptThreadComment }> = ({ thread }) => {
  const { routeToPage } = usePageRouter();
  const accentColor =
    thread.source.useAccent && thread.source.accent
      ? thread.source.accent
      : null;
  const targetAccentColor =
    thread.target.useAccent && thread.target.accent
      ? thread.target.accent
      : null;

  return (
    <S.ThreadRow onClick={() => routeToPage(ROUTES.Thread.View(thread.parentId))}>
      <S.AvatarGroup>
        <S.PrimaryAvatarSlot>
          <AvatarNew
            src={thread.source.image}
            alt={thread.source.name}
            nwImage={thread.source.avatar}
            accentColor={accentColor}
          />
        </S.PrimaryAvatarSlot>
        <S.TargetAvatarSlot>
          <AvatarNew
            src={thread.target.image}
            alt={thread.target.name}
            nwImage={thread.target.avatar}
            accentColor={targetAccentColor}
          />
        </S.TargetAvatarSlot>
      </S.AvatarGroup>
      <S.ThreadInfo>
        <S.ThreadTitle>{thread.source.name.split(" ")[0]}</S.ThreadTitle>
        <S.ThreadMeta>
          with {thread.target.name.split(" ")[0]} ·{" "}
          {toFormattedDateFromUnix(thread.createdOn)}
        </S.ThreadMeta>
      </S.ThreadInfo>
      <S.ThreadStatusSlot>
        {thread.concluded ? (
          <S.ConcludedMark title="Thread concluded">
            <FiCheck size={11} />
          </S.ConcludedMark>
        ) : (
          thread.replyCount > 0 && (
            <S.UnreadCount>
              {thread.replyCount > 9 ? "9+" : thread.replyCount}
            </S.UnreadCount>
          )
        )}
      </S.ThreadStatusSlot>
    </S.ThreadRow>
  );
};

const SuggestionRow: FC<{ novelist: SuggestionNovelist }> = ({ novelist }) => {
  const { routeToPage } = usePageRouter();
  const { errorToast, successToast } = useUIContext();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || sent) return;
    setLoading(true);
    const response = await sendFriendRequest(novelist.id);
    setLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      setSent(true);
      successToast("Friend request sent");
    } else {
      errorToast("Could not send friend request. Please try again.");
    }
  };

  const mutualCount = novelist.mutualFriendCount ?? 0;

  return (
    <S.SuggestionRow
      onClick={() => routeToPage(ROUTES.Profile.View(novelist.username).Index)}
    >
      <AvatarNew
        src={novelist.image}
        alt={novelist.firstName}
        nwImage={novelist.avatar}
      />
      <S.ThreadInfo>
        <S.ThreadTitleRow>
          <S.ThreadTitle>
            {novelist.firstName} {novelist.lastName}
          </S.ThreadTitle>
          {novelist.isVerified && <EmailVerifiedBadge size={12} />}
        </S.ThreadTitleRow>
        <S.SuggestionUsername username={novelist.username} />
        <S.StatRow>
          {novelist.museCount > 0 && (
            <S.Stat>
              <FiFeather size={10} />
              <b>{novelist.museCount}</b>
            </S.Stat>
          )}
          {mutualCount > 0 && (
            <S.Stat>
              <FiUsers size={10} />
              <b>{mutualCount}</b> mutual
            </S.Stat>
          )}
        </S.StatRow>
      </S.ThreadInfo>
      <S.SuggestionAddButton onClick={onAdd} disabled={loading || sent}>
        {sent ? <>Sent</> : loading ? <>…</> : <><FiUserPlus size={12} /> Add</>}
      </S.SuggestionAddButton>
    </S.SuggestionRow>
  );
};

type Props = {
  /** Whether the sidebar should be slid into view. Stays mounted either way
   * so the show/hide transitions instead of an instant mount/unmount (and
   * so its preview fetches don't re-run on every book-mode toggle). */
  visible: boolean;
};

/** Right sidebar — top conversations, a couple of "awaiting reply" outgoing
 * threads, plus a few friend suggestions. Shown on every page (not just
 * home), so it fetches its own preview data instead of relying on a page
 * having already loaded it, preferring whatever's cached in global state
 * first. */
export const RightSidebar: FC<Props> = ({ visible }) => {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const cachedOutgoingThreads = useGlobalState("cachedOutgoingThreads");
  const cachedSuggestions = useGlobalState("friendSuggestions");
  const cachedConversations = useGlobalState("cachedConversations");
  const unreadReplyCount = useGlobalState("unreadReplyCount");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage } = usePageRouter();
  const { lastIncomingMessage } = useSocket();
  const [threads, setThreads] = useState<PromptThreadComment[] | undefined>(
    cachedOutgoingThreads?.slice(0, THREADS_PREVIEW_COUNT),
  );
  const [suggestions, setSuggestions] = useState<
    SuggestionNovelist[] | undefined
  >(cachedSuggestions?.slice(0, SUGGESTIONS_PREVIEW_COUNT) ?? undefined);
  const [conversations, setConversations] = useState<
    Conversation[] | undefined
  >(cachedConversations?.slice(0, CONVERSATIONS_PREVIEW_COUNT) ?? undefined);
  const [conversationsLoading, setConversationsLoading] = useState(
    !cachedConversations,
  );

  useEffect(() => {
    if (!cachedOutgoingThreads) {
      getOutgoingThreadsAction(1, THREADS_PREVIEW_COUNT).then((result) => {
        if (result && !("message" in result)) {
          setThreads(result);
          setGlobalState({ cachedOutgoingThreads: result });
        }
      });
    }
    if (!cachedSuggestions) {
      getStrangerNovelistsAction(1, SUGGESTIONS_PREVIEW_COUNT).then((result) => {
        if (result && !("message" in result)) setSuggestions(result);
      });
    }
    if (!cachedConversations) {
      getConversationsAction(1, CONVERSATIONS_PREVIEW_COUNT).then(
        async (result) => {
          if (result && Array.isArray(result)) {
            const decrypted = await decryptConversations(result);
            setConversations(decrypted);
            setGlobalState({ cachedConversations: decrypted });
          }
          setConversationsLoading(false);
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Other components (e.g. the conversation panel, on open/read) patch
  // isRead flags straight into the global cachedConversations store without
  // going through a socket event — mirror those changes into our local slice.
  useEffect(() => {
    if (!cachedConversations) return;
    setConversations(cachedConversations.slice(0, CONVERSATIONS_PREVIEW_COUNT));
  }, [cachedConversations]);

  // The thread page refetches cachedOutgoingThreads after a reply/conclude —
  // mirror those changes into our local slice so the awaiting-replies preview
  // updates too.
  useEffect(() => {
    if (!cachedOutgoingThreads) return;
    setThreads(cachedOutgoingThreads.slice(0, THREADS_PREVIEW_COUNT));
  }, [cachedOutgoingThreads]);

  // Live-update the preview when a message arrives for one of the conversations
  // already shown, then re-sort so the most recently active one floats to top.
  useEffect(() => {
    if (!lastIncomingMessage) return;
    const isMine = lastIncomingMessage.sender?.username === user?.username;
    const incomingMsg = isMine
      ? { ...lastIncomingMessage, isRead: true }
      : lastIncomingMessage;
    setConversations((prev) => {
      if (!prev) return prev;
      const updated = prev.map((conv) =>
        conv.id === incomingMsg.conversationId
          ? { ...conv, lastMessage: incomingMsg }
          : conv,
      );
      return [...updated].sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? a.modifiedAt ?? "";
        const bTime = b.lastMessage?.createdAt ?? b.modifiedAt ?? "";
        return bTime.localeCompare(aTime);
      });
    });
  }, [lastIncomingMessage, user?.username]);

  if (!novelist) return null;

  return (
    <S.RightSidebarWrap $visible={visible}>
      <S.Panel>
        <S.PanelHeader>
          <S.PanelHeaderLeft>
            <S.PanelTitle>Conversations</S.PanelTitle>
          </S.PanelHeaderLeft>
          <S.ViewAllLink onClick={() => routeToPage(ROUTES.conversations)}>
            See all
          </S.ViewAllLink>
        </S.PanelHeader>
        {conversationsLoading ? (
          Array.from({ length: CONVERSATIONS_PREVIEW_COUNT }, (_, i) => (
            <S.ConversationRowShimmer key={i}>
              <S.ShimmerAvatar />
              <S.ShimmerLines>
                <S.ShimmerLine $width="55%" />
                <S.ShimmerLine $width="80%" />
              </S.ShimmerLines>
            </S.ConversationRowShimmer>
          ))
        ) : conversations?.length ? (
          <S.ConversationsList>
            {conversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </S.ConversationsList>
        ) : (
          <S.EmptyState>No conversations yet</S.EmptyState>
        )}
      </S.Panel>
      <S.Panel>
        <S.PanelHeader>
          <S.PanelHeaderLeft>
            <S.PanelTitle>Awaiting replies</S.PanelTitle>
            {Boolean(unreadReplyCount) && (
              <S.PendingCount>
                {(unreadReplyCount ?? 0) > 9 ? "9+" : unreadReplyCount}
              </S.PendingCount>
            )}
          </S.PanelHeaderLeft>
          <S.ViewAllLink onClick={() => routeToPage(ROUTES.outgoingThreads)}>
            View all
          </S.ViewAllLink>
        </S.PanelHeader>
        {threads?.length ? (
          threads.map((thread) => <ThreadRow key={thread.id} thread={thread} />)
        ) : (
          <S.EmptyState>You're all caught up ✨</S.EmptyState>
        )}
      </S.Panel>
      {Boolean(suggestions?.length) && (
        <S.Panel>
          <S.PanelHeader>
            <S.PanelHeaderLeft>
              <S.PanelTitle>Friend suggestions</S.PanelTitle>
            </S.PanelHeaderLeft>
            <S.ViewAllLink onClick={() => routeToPage(ROUTES.Fellows)}>
              See all
            </S.ViewAllLink>
          </S.PanelHeader>
          {suggestions!.map((suggestion) => (
            <SuggestionRow key={suggestion.id} novelist={suggestion} />
          ))}
        </S.Panel>
      )}
      <S.SidebarFooter>
        <S.SidebarFooterLinks>
          <S.SidebarFooterLink href={ROUTES.PrivacyPolicy}>
            Privacy Policy
          </S.SidebarFooterLink>
          <S.SidebarFooterDot>·</S.SidebarFooterDot>
          <S.SidebarFooterLink href={ROUTES.Terms}>
            Terms &amp; Conditions
          </S.SidebarFooterLink>
          <S.SidebarFooterDot>·</S.SidebarFooterDot>
          <S.SidebarFooterLink href={ROUTES.FAQs}>FAQs</S.SidebarFooterLink>
        </S.SidebarFooterLinks>
        <S.SidebarFooterCopyright>
        Zoltron Tech © {new Date().getFullYear()}
        </S.SidebarFooterCopyright>
      </S.SidebarFooter>
    </S.RightSidebarWrap>
  );
};
