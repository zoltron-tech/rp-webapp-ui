"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiSupport } from "react-icons/bi";
import { BreadCrumb } from "@/components/breadcrumb";
import { ConversationCard } from "@/components/conversation-card";
import { LoadMore } from "@/components/load-more/page";
import { useSocket } from "@/context/socket";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { Conversation } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { ConversationPanel } from "./[conversationId]/conversation-panel";
import {
  getConversationByUsernameAction,
  getConversationsAction,
} from "./actions";
import * as S from "./styles";

const PAGE_SIZE = 15;

export default function ConversationsPage() {
  const user = useGlobalState("user");
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const cachedConversations = useGlobalState("cachedConversations");
  const conversationNavDirection = useGlobalState("conversationNavDirection");
  const lastReadConversationId = useGlobalState("lastReadConversationId");
  const setGlobalState = useGlobalStoreSet();
  const { lastIncomingMessage } = useSocket();
  const { baseDataLoader, routeToPage, stopPageLoading } = usePageRouter();
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

  // Lock outer page scroll while the panel is open
  useEffect(() => {
    if (!panelOpen) return;
    const el = document.querySelector(".page-container") as HTMLElement | null;
    if (!el) return;
    const saved = el.scrollTop;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = "";
      el.scrollTop = saved;
    };
  }, [panelOpen]);
  // ── /Panel state ───────────────────────────────────────────────────────────

  const [conversations, setConversations] = useState<Conversation[] | null>(
    cachedConversations ?? null,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [contactSupportLoading, setContactSupportLoading] = useState(false);
  // Capture direction on mount so we can animate even after clearing it
  const slideIn = useRef(conversationNavDirection === "back").current;

  // If we have cached data, stop the full-page loader immediately
  useEffect(() => {
    if (cachedConversations) {
      stopPageLoading();
    }
    // Clear nav direction after capturing it for the animation
    setGlobalState({ conversationNavDirection: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContactSupport = useCallback(async () => {
    setContactSupportLoading(true);
    const conversation = await baseDataLoader(() =>
      getConversationByUsernameAction("novelistworld"),
    );
    setContactSupportLoading(false);
    if (conversation) {
      routeToPage(ROUTES.Conversation.View(conversation.id));
    }
  }, [baseDataLoader, routeToPage]);

  const fetchConversations = useCallback(
    async (pageNumber: number, append = false) => {
      const rawResult = await getConversationsAction(pageNumber, PAGE_SIZE);

      // Stop the loader here in case it wasn't stopped yet (no cache on first visit)
      if (!append) stopPageLoading();

      const _conversations =
        rawResult && Array.isArray(rawResult)
          ? (rawResult as Conversation[])
          : null;

      if (!_conversations || _conversations.length === 0) {
        setHasMore(false);
        return false;
      }

      if (_conversations.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setConversations((prev) =>
        append ? [...(prev || []), ..._conversations] : _conversations,
      );

      // Keep the global cache in sync with page 1 data
      if (!append) {
        setGlobalState({ cachedConversations: _conversations });
      }

      return true;
    },
    [stopPageLoading, setGlobalState],
  );

  useEffect(() => {
    fetchConversations(1);
  }, [fetchConversations]);

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

  return (
    <>
      <S.Container $slideIn={slideIn}>
        <S.BreadcrumbRow>
          <BreadCrumb label="Conversations" username={user?.username ?? ""} />
          <S.SupportButton
            onClick={handleContactSupport}
            disabled={contactSupportLoading}
            aria-label="Contact Support"
            title="Contact Support"
          >
            <BiSupport size={18} />
          </S.SupportButton>
        </S.BreadcrumbRow>
        <S.ConversationListContainer>
          <S.ConversationListRoot>
            {conversations && conversations.length > 0 ? (
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
                <S.IllustrationWrap>
                  <svg
                    width="110"
                    height="96"
                    viewBox="0 0 110 96"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    {/* Back bubble */}
                    <rect
                      x="26"
                      y="4"
                      width="76"
                      height="48"
                      rx="14"
                      fill="var(--bg-5)"
                    />
                    <path d="M82 52 L96 68 L72 52Z" fill="var(--bg-5)" />
                    {/* Front bubble (accent-tinted) */}
                    <rect
                      x="8"
                      y="28"
                      width="72"
                      height="48"
                      rx="14"
                      fill="var(--accent)"
                      fillOpacity="0.12"
                    />
                    <rect
                      x="8"
                      y="28"
                      width="72"
                      height="48"
                      rx="14"
                      stroke="var(--accent)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M20 76 L8 92 L34 76Z"
                      fill="var(--accent)"
                      fillOpacity="0.12"
                    />
                    <path
                      d="M20 76 L8 92 L34 76Z"
                      stroke="var(--accent)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Typing dots */}
                    <circle cx="30" cy="52" r="4" fill="var(--accent)">
                      <animate
                        attributeName="opacity"
                        values="1;0.25;1"
                        dur="1.4s"
                        begin="0s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="44" cy="52" r="4" fill="var(--accent)">
                      <animate
                        attributeName="opacity"
                        values="1;0.25;1"
                        dur="1.4s"
                        begin="0.22s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="58" cy="52" r="4" fill="var(--accent)">
                      <animate
                        attributeName="opacity"
                        values="1;0.25;1"
                        dur="1.4s"
                        begin="0.44s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </S.IllustrationWrap>

                <S.EmptyStateHeading>No conversations yet</S.EmptyStateHeading>
                <S.EmptyStateBody>
                  Start by connecting with fellow novelists or discover new
                  stories to write together.
                </S.EmptyStateBody>

                <S.EmptyStateActions>
                  <S.EmptyStateButton
                    $primary
                    onClick={() => routeToPage(ROUTES.Fellows)}
                  >
                    Find Novelists
                  </S.EmptyStateButton>
                  <S.EmptyStateButton
                    onClick={() => routeToPage(ROUTES.explore)}
                  >
                    Explore
                  </S.EmptyStateButton>
                </S.EmptyStateActions>
              </S.EmptyStateRoot>
            )}
          </S.ConversationListRoot>

          <LoadMore
            hasMore={hasMore && !!conversations?.length}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            unreadCount={unreadBadgeCount}
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
    </>
  );
}
