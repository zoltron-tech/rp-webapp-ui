"use client";

import { SUPPORT_USERNAME } from "@nw/chat";
import type { Conversation, IceBreaker } from "@nw/types";
import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiSupport } from "react-icons/bi";
import { FiArrowRight } from "react-icons/fi";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { MdAdd, MdGroupAdd } from "react-icons/md";
import { FrozenSilenceArt, NoConversationsArt } from "@/components/book-art";
import { AvatarNew } from "@/components/common/avatar-new";
import { ConversationCard } from "@/components/conversation-card";
import { LoadMore } from "@/components/load-more/page";
import { useSocket } from "@/context/socket";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { ROUTES } from "@/utils/constants/routes";
import { decryptConversations } from "@/utils/e2e-crypto";
import { pluralize } from "@/utils/helpers";
import { ConversationPanel } from "./[conversationId]/conversation-panel";
import {
  getConversationByUsernameAction,
  getConversationsAction,
  getGroupCountAction,
  getIceBreakersAction,
} from "./actions";
import { CreateGroupDialog } from "./create-group-dialog";
import { CreateIceBreakerDialog } from "./create-ice-breaker-dialog";
import {
  getSourceRingAccent,
  truncateIceBreakerMessage,
} from "./ice-breaker-helpers";
import * as S from "./styles";
import { ViewIceBreakerDialog } from "./view-ice-breaker-dialog";

const ConversationCardShimmer = () => (
  <S.ShimmerItem>
    <S.ShimmerAvatar />
    <S.ShimmerContent>
      <S.ShimmerContentMain>
        <S.ShimmerLine $width="45%" />
        <S.ShimmerLine $width="70%" $height={11} />
      </S.ShimmerContentMain>
      <S.ShimmerExtras>
        <S.ShimmerLine $width="36px" $height={10} />
      </S.ShimmerExtras>
    </S.ShimmerContent>
  </S.ShimmerItem>
);

const IceBreakerCardShimmer = () => (
  <S.IceBreakerCard>
    <S.IceBreakerAvatarStack>
      <S.IceBreakerCardShimmerBubble />
      <S.IceBreakerCardShimmerAvatar />
    </S.IceBreakerAvatarStack>
    <S.IceBreakerCardShimmerName />
  </S.IceBreakerCard>
);

const PAGE_SIZE = 15;

export default function ConversationsPage() {
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const cachedConversations = useGlobalState("cachedConversations");
  const conversationNavDirection = useGlobalState("conversationNavDirection");
  const lastReadConversationId = useGlobalState("lastReadConversationId");
  const groupCount = useGlobalState("groupCount");
  const setGlobalState = useGlobalStoreSet();
  const { lastIncomingMessage } = useSocket();
  const { baseDataLoader, routeToPage, stopPageLoading } = usePageRouter();
  const { errorToast } = useUIContext();
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 680;

  // ── Panel state (mobile pre-rendered overlay) ──────────────────────────────
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelClosing, setPanelClosing] = useState(false);
  // Stays true after the first open so the panel remains mounted (fast re-opens).
  const [hasOpenedPanel, setHasOpenedPanel] = useState(false);
  const [openConversationId, setOpenConversationId] = useState("");
  const [openTargetUserName, setOpenTargetUserName] = useState("");
  const swipeTouchStartX = useRef<number | null>(null);

  const handleOpenConversation = useCallback(
    (
      conversationId: string,
      targetUserName: string,
      conversation: Conversation,
    ) => {
      setGlobalState({ activeConversation: conversation });
      setOpenConversationId(conversationId);
      setOpenTargetUserName(targetUserName);
      setPanelOpen(true);
      setHasOpenedPanel(true);
      // Optimistically mark the conversation as read in the local list so
      // the card reflects the read state immediately on swipe-back, before
      // any network request completes.
      setConversations((prev) => {
        if (!prev) return prev;
        return prev.map((conv) => {
          if (conv.id !== conversationId) return conv;
          if (!conv.lastMessage || conv.lastMessage.isRead) return conv;
          return {
            ...conv,
            lastMessage: { ...conv.lastMessage, isRead: true },
          };
        });
      });
    },
    [setGlobalState],
  );

  const handlePanelClose = useCallback(() => {
    setPanelClosing(true);
    setTimeout(() => {
      setPanelOpen(false);
      setPanelClosing(false);
    }, 260);
  }, []);

  // Lock outer page scroll while the panel is open. The document scrolls,
  // not .page-container (see rp/styles.ts).
  useEffect(() => {
    if (!panelOpen) return;
    const el = document.scrollingElement as HTMLElement | null;
    if (!el) return;
    const saved = el.scrollTop;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = "";
      el.scrollTop = saved;
    };
  }, [panelOpen]);
  // ── /Panel state ───────────────────────────────────────────────────────────

  const [isLoading, setIsLoading] = useState(!cachedConversations);
  const [conversations, setConversations] = useState<Conversation[] | null>(
    cachedConversations ?? null,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [contactSupportLoading, setContactSupportLoading] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [checkingGroupLimit, setCheckingGroupLimit] = useState(false);
  const [iceBreakers, setIceBreakers] = useState<IceBreaker[]>([]);
  const [iceBreakersLoading, setIceBreakersLoading] = useState(true);
  const [createIceBreakerOpen, setCreateIceBreakerOpen] = useState(false);
  const [viewIceBreaker, setViewIceBreaker] = useState<IceBreaker | null>(null);
  const [viewIceBreakerOpen, setViewIceBreakerOpen] = useState(false);
  // Capture direction on mount so we can animate even after clearing it
  const slideIn = useRef(conversationNavDirection === "back").current;

  // Stop the full-page loader on mount; shimmers handle the loading state.
  useEffect(() => {
    stopPageLoading();
    setGlobalState({ conversationNavDirection: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContactSupport = useCallback(async () => {
    setContactSupportLoading(true);
    const conversation = await baseDataLoader(() =>
      // The account both clients message. Shared, so a change here cannot send
      // one client's support requests somewhere nobody is reading.
      getConversationByUsernameAction(SUPPORT_USERNAME),
    );
    setContactSupportLoading(false);
    if (conversation) {
      routeToPage(ROUTES.Conversation.View(conversation.id));
    }
  }, [baseDataLoader, routeToPage]);

  const fetchConversations = useCallback(
    async (pageNumber: number, append = false) => {
      const rawResult = await getConversationsAction(pageNumber, PAGE_SIZE);

      const encryptedConversations =
        rawResult && Array.isArray(rawResult)
          ? (rawResult as Conversation[])
          : null;

      if (!encryptedConversations || encryptedConversations.length === 0) {
        setHasMore(false);
        if (!append) setIsLoading(false);
        return false;
      }

      const _conversations = await decryptConversations(encryptedConversations);

      setHasMore(_conversations.length >= PAGE_SIZE);

      setConversations((prev) =>
        append ? [...(prev || []), ..._conversations] : _conversations,
      );

      if (!append) {
        setIsLoading(false);
        setGlobalState({ cachedConversations: _conversations });
      }

      return true;
    },
    [setGlobalState],
  );

  // Always fetch page 1 on mount. Cached data (a small preview slice seeded
  // by the right sidebar) paints instantly so there's no shimmer, but it's
  // not a full page — only the fetch gives us the authoritative list and a
  // correct hasMore, so the Load more / end-of-list choice is right from the
  // start instead of after a wasted click.
  useEffect(() => {
    fetchConversations(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const result = await getIceBreakersAction();
      if (result && Array.isArray(result)) {
        setIceBreakers(result);
      }
      setIceBreakersLoading(false);
    })();
  }, []);

  const handleIceBreakerCreated = useCallback((iceBreaker: IceBreaker) => {
    setIceBreakers((prev) => [iceBreaker, ...prev]);
  }, []);

  const handleOpenIceBreaker = useCallback((iceBreaker: IceBreaker) => {
    setViewIceBreaker(iceBreaker);
    setViewIceBreakerOpen(true);
  }, []);

  const handleIceBreakerDeleted = useCallback((iceBreaker: IceBreaker) => {
    setIceBreakers((prev) =>
      prev.filter((ib) => ib.sourceId !== iceBreaker.sourceId),
    );
  }, []);

  // Re-check the live group count against the user's tier limit before
  // letting them open the create-group dialog.
  const handleCreateGroupClick = useCallback(async () => {
    setCheckingGroupLimit(true);
    const count = await getGroupCountAction();
    setCheckingGroupLimit(false);

    if (typeof count !== "number") {
      errorToast("Could not verify your group limit. Please try again.");
      return;
    }

    setGlobalState({ groupCount: count });

    const groupLimit = novelist?.tier?.groupLimit ?? 0;
    if (count >= groupLimit) {
      errorToast(
        `You've reached your group limit of ${groupLimit}. Upgrade your tier to create more.`,
      );
      return;
    }

    setCreateGroupOpen(true);
  }, [errorToast, novelist?.tier?.groupLimit, setGlobalState]);

  // After a group is created, refresh the conversations list from the backend
  // and bump the cached group count.
  const handleGroupCreated = useCallback(async () => {
    setGlobalState({ groupCount: (groupCount ?? 0) + 1 });
    await fetchConversations(1);
  }, [fetchConversations, groupCount, setGlobalState]);

  // Update the matching conversation's lastMessage when a new real-time message arrives,
  // then re-sort so the most recently active conversation floats to the top.
  useEffect(() => {
    if (!lastIncomingMessage) return;
    // Messages sent by the current user are already read — prevent the card
    // from showing an unread/new badge for the user's own messages.
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

  // When the open conversation panel marks messages as read, patch the local
  // list so the card immediately drops its unread styling on swipe-back.
  useEffect(() => {
    if (!lastReadConversationId) return;
    setConversations((prev) => {
      if (!prev) return prev;
      return prev.map((conv) => {
        if (conv.id !== lastReadConversationId) return conv;
        if (!conv.lastMessage || conv.lastMessage.isRead) return conv;
        return { ...conv, lastMessage: { ...conv.lastMessage, isRead: true } };
      });
    });
  }, [lastReadConversationId]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const loaded = await fetchConversations(nextPage, true);

    if (loaded) {
      setPage(nextPage);
    }

    setLoadingMore(false);
  };

  const unreadBadgeCount = useMemo(() => {
    if (!unreadConversationIds?.length || !hasMore) return 0;
    const fetchedIds = new Set(conversations?.map((c) => c.id) ?? []);
    return unreadConversationIds.filter((id) => !fetchedIds.has(id)).length;
  }, [unreadConversationIds, conversations, hasMore]);

  const headerSubtitle = useMemo(() => {
    if (isLoading) return "Loading your conversations…";
    if (!conversations || conversations.length === 0) {
      return "You're all caught up";
    }

    const unreadCount = unreadConversationIds?.length ?? 0;
    if (unreadCount === 0) return "No new messages";

    return `${unreadCount} unread ${pluralize("conversation", unreadCount)}`;
  }, [isLoading, conversations, unreadConversationIds]);

  return (
    <>
      <S.Container $slideIn={slideIn}>
        <S.BreadcrumbRow>
          <S.PageHeaderLeft>
            <S.PageHeaderIcon>
              <HiOutlineChatBubbleLeftRight />
            </S.PageHeaderIcon>
            <S.PageHeaderText>
              <S.PageHeaderTitle>Conversations</S.PageHeaderTitle>
              <S.PageHeaderSubtitle>{headerSubtitle}</S.PageHeaderSubtitle>
            </S.PageHeaderText>
          </S.PageHeaderLeft>
          <S.BreadcrumbActions>
            <S.SupportButton
              onClick={handleCreateGroupClick}
              disabled={checkingGroupLimit}
              aria-label="Create group"
              title="Create group"
            >
              <MdGroupAdd size={18} />
            </S.SupportButton>
            <S.SupportButton
              onClick={handleContactSupport}
              disabled={contactSupportLoading}
              aria-label="Contact Support"
              title="Contact Support"
            >
              <BiSupport size={18} />
            </S.SupportButton>
          </S.BreadcrumbActions>
        </S.BreadcrumbRow>
        <S.IceBreakerRail>
          <S.IceBreakerAddButton
            type="button"
            onClick={() => setCreateIceBreakerOpen(true)}
            aria-label="Add ice breaker"
            title="Share what's on your mind"
          >
            <span className="icon">
              <HiOutlineSparkles size={20} />
              <span className="plus-badge">
                <MdAdd size={14} />
              </span>
            </span>
            <span>Add</span>
          </S.IceBreakerAddButton>

          {iceBreakersLoading &&
            Array.from({ length: 5 }, (_, i) => (
              <IceBreakerCardShimmer key={i} />
            ))}

          {!iceBreakersLoading && iceBreakers.length === 0 && (
            <S.IceBreakerEmptyState>
              <FrozenSilenceArt />
              <span>Silence is icy. Click the button to break the ice.</span>
            </S.IceBreakerEmptyState>
          )}

          {iceBreakers.map((iceBreaker) => {
            const ringAccent = getSourceRingAccent(iceBreaker.source);
            return (
              <S.IceBreakerCard
                key={iceBreaker.sourceId}
                onClick={() => handleOpenIceBreaker(iceBreaker)}
              >
                <S.IceBreakerAvatarStack>
                  <S.IceBreakerBubble
                    $color={iceBreaker.color}
                    title={iceBreaker.message}
                  >
                    {truncateIceBreakerMessage(iceBreaker.message)}
                  </S.IceBreakerBubble>
                  <S.IceBreakerAvatarRing
                    className={classNames(ringAccent.className)}
                    $ringColor={ringAccent.color}
                  >
                    <AvatarNew
                      src={iceBreaker.source.image ?? null}
                      alt={iceBreaker.source.name}
                      nwImage={iceBreaker.source.avatar}
                    />
                  </S.IceBreakerAvatarRing>
                </S.IceBreakerAvatarStack>
                <S.IceBreakerSenderName>
                  {iceBreaker.source.name.split(" ")[0]}
                </S.IceBreakerSenderName>
              </S.IceBreakerCard>
            );
          })}
        </S.IceBreakerRail>
        <S.ConversationListContainer>
          <S.ConversationListRoot>
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <ConversationCardShimmer key={i} />
              ))
            ) : conversations && conversations.length > 0 ? (
              <S.ConversationList>
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <ConversationCard
                      conversation={conversation}
                      onOpen={
                        isMobile
                          ? (convId, target) =>
                              handleOpenConversation(
                                convId,
                                target,
                                conversation,
                              )
                          : undefined
                      }
                    />
                  </li>
                ))}
              </S.ConversationList>
            ) : (
              <S.EmptyStateRoot>
                <NoConversationsArt />
                <S.EmptyStateHeading>No conversations yet</S.EmptyStateHeading>
                <S.EmptyStateBody>
                  Connect with fellow novelists, or find a story to write
                  together.
                </S.EmptyStateBody>
                <S.EmptyStateActions>
                  <S.EmptyStateCta
                    type="button"
                    $primary
                    onClick={() => routeToPage(ROUTES.Fellows)}
                  >
                    Find novelists
                    <FiArrowRight size={14} />
                  </S.EmptyStateCta>
                  <S.EmptyStateCta
                    type="button"
                    onClick={() => routeToPage(ROUTES.explore)}
                  >
                    Explore
                    <FiArrowRight size={14} />
                  </S.EmptyStateCta>
                </S.EmptyStateActions>
              </S.EmptyStateRoot>
            )}
          </S.ConversationListRoot>

          <LoadMore
            hasMore={hasMore && !!conversations?.length}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            unreadCount={unreadBadgeCount}
            endMarker={!!conversations?.length}
          />
        </S.ConversationListContainer>
      </S.Container>

      {isMobile && hasOpenedPanel && (
        <S.ConversationSheet
          $open={panelOpen}
          $closing={panelClosing}
          onTouchStart={(e) => {
            swipeTouchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (swipeTouchStartX.current === null) return;
            const deltaX =
              (e.changedTouches[0]?.clientX ?? 0) - swipeTouchStartX.current;
            swipeTouchStartX.current = null;
            if (deltaX > 60) handlePanelClose();
          }}
        >
          <ConversationPanel
            conversationId={openConversationId}
            targetUserName={openTargetUserName}
            onBack={handlePanelClose}
            isPanel
            active={panelOpen}
          />
        </S.ConversationSheet>
      )}

      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        groupCount={groupCount ?? 0}
        groupLimit={novelist?.tier?.groupLimit ?? 0}
        onCreated={handleGroupCreated}
      />

      <CreateIceBreakerDialog
        open={createIceBreakerOpen}
        onOpenChange={setCreateIceBreakerOpen}
        novelist={novelist}
        onCreated={handleIceBreakerCreated}
      />

      <ViewIceBreakerDialog
        open={viewIceBreakerOpen}
        onOpenChange={setViewIceBreakerOpen}
        iceBreaker={viewIceBreaker}
        novelist={novelist}
        onDeleted={handleIceBreakerDeleted}
      />
    </>
  );
}
