"use client";

import { isReadingBreaker, participantName, SUPPORT_USERNAME } from "@nw/chat";
import {
  INBOX_FILTERS,
  type InboxFilter,
  inboxSections,
  inboxSummary,
  matchesInboxFilter,
} from "@nw/features";
import {
  type Conversation,
  type IceBreaker,
  INBOX_ARCHIVE_COPY,
  type InboxBucket,
} from "@nw/types";
import { bookCoverUrl } from "@nw/types/books";
import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiSupport } from "react-icons/bi";
import { FiArrowRight } from "react-icons/fi";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { IoBookOutline } from "react-icons/io5";
import { MdAdd, MdGroupAdd } from "react-icons/md";
import { FrozenSilenceArt, NoConversationsArt } from "@/components/book-art";
import { AvatarNew } from "@/components/common/avatar-new";
import {
  ConversationCard,
  isConversationUnread,
} from "@/components/conversation-card";
import { LoadMore } from "@/components/load-more/page";
import * as N from "@/components/notification/styled";
import { useSocket } from "@/context/socket";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { ROUTES } from "@/utils/constants/routes";
import { decryptConversations } from "@/utils/e2e-crypto";
import { ConversationPanel } from "./[conversationId]/conversation-panel";
import {
  getConversationByUsernameAction,
  getConversationsAction,
  getGroupCountAction,
  getIceBreakersAction,
  setConversationBucketAction,
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

/** Below this, scrolling the list is faster than typing a name. */
const SEARCH_THRESHOLD = 8;

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
  const { errorToast, successToast } = useUIContext();
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
  const [filter, setFilter] = useState<InboxFilter>("all");
  // The archive (BLOCK_BLACKLIST_PLAN.md B6): its own list, fetched the
  // first time its tab is opened and paged like the inbox.
  const [archived, setArchived] = useState<Conversation[] | null>(null);
  const [archivedPage, setArchivedPage] = useState(1);
  const [archivedHasMore, setArchivedHasMore] = useState(true);
  const [archivedLoading, setArchivedLoading] = useState(false);
  // Every row whose move is in flight, so one move settling never re-enables
  // another row's archive button mid-request.
  const [movingIds, setMovingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const showingArchive = filter === "archived";
  const [search, setSearch] = useState("");
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
    try {
      const conversation = await baseDataLoader(() =>
        // The account both clients message. Shared, so a change here cannot send
        // one client's support requests somewhere nobody is reading.
        getConversationByUsernameAction(SUPPORT_USERNAME),
      ).catch(() => null);
      if (!conversation) {
        errorToast("Could not open the support chat. Please try again.");
        return;
      }
      routeToPage(ROUTES.Conversation.View(conversation.id));
    } finally {
      setContactSupportLoading(false);
    }
  }, [baseDataLoader, errorToast, routeToPage]);

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

  const fetchArchived = useCallback(
    async (pageNumber: number, append = false) => {
      const result = await getConversationsAction(
        pageNumber,
        PAGE_SIZE,
        "ARCHIVED",
      );
      const rows = result && Array.isArray(result) ? result : [];
      const decrypted = rows.length ? await decryptConversations(rows) : [];
      setArchivedHasMore(decrypted.length >= PAGE_SIZE);
      setArchived((prev) =>
        append ? [...(prev ?? []), ...decrypted] : decrypted,
      );
      return decrypted.length > 0;
    },
    [],
  );

  // The archive loads when its tab is first opened, not with the inbox.
  useEffect(() => {
    if (!showingArchive || archived !== null) return;
    setArchivedLoading(true);
    void fetchArchived(1).finally(() => setArchivedLoading(false));
  }, [showingArchive, archived, fetchArchived]);

  /**
   * A row's archive button: moves it between the inbox and the archive. The
   * row leaves the list on screen at once; the other list is read again the
   * next time it is shown, since where the row sits there is the server's.
   */
  const handleMove = useCallback(
    async (conversation: Conversation) => {
      const to: InboxBucket =
        conversation.bucket === "ARCHIVED" ? "INBOX" : "ARCHIVED";
      const id = conversation.id;
      setMovingIds((prev) => new Set(prev).add(id));
      let result: unknown = null;
      try {
        result = await setConversationBucketAction(id, to).catch(() => null);
      } finally {
        setMovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
      if (result !== true) {
        errorToast("That conversation could not be moved. Try again.");
        return;
      }
      // The toast takes no action, so no Undo: the row's button in the other
      // list moves it back.
      successToast(
        to === "ARCHIVED"
          ? "Conversation archived."
          : "Conversation moved to inbox.",
      );
      const without = (list: Conversation[] | null) =>
        list ? list.filter((row) => row.id !== conversation.id) : list;
      if (to === "ARCHIVED") {
        setConversations(without);
        setArchived(null);
        // The right sidebar previews the inbox from this cache.
        setGlobalState((prev) => ({
          ...prev,
          cachedConversations: without(prev.cachedConversations ?? null),
        }));
      } else {
        setArchived(without);
        void fetchConversations(1);
      }
    },
    [errorToast, fetchConversations, setGlobalState, successToast],
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
    // One ice breaker per sender: the new one replaces the sender's old card.
    setIceBreakers((prev) => [
      iceBreaker,
      ...prev.filter((ib) => ib.sourceId !== iceBreaker.sourceId),
    ]);
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
    let count: Awaited<ReturnType<typeof getGroupCountAction>> | null = null;
    try {
      count = await getGroupCountAction();
    } catch {
      count = null;
    } finally {
      setCheckingGroupLimit(false);
    }

    if (typeof count !== "number") {
      errorToast("Could not verify your group limit. Please try again.");
      return;
    }

    setGlobalState({ groupCount: count });

    const groupLimit = novelist?.tier?.groupLimit ?? 0;
    if (count >= groupLimit) {
      errorToast(
        `You've reached your limit of ${groupLimit} groups.`,
      );
      return;
    }

    setCreateGroupOpen(true);
  }, [errorToast, novelist?.tier?.groupLimit, setGlobalState]);

  // After a group is created, refresh the conversations list from the backend
  // and bump the cached group count.
  const handleGroupCreated = useCallback(async () => {
    setGlobalState({ groupCount: (groupCount ?? 0) + 1 });
    successToast("Group created.");
    await fetchConversations(1).catch(() => null);
  }, [fetchConversations, groupCount, setGlobalState, successToast]);

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
    const bump = (prev: Conversation[] | null) => {
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
    };
    // An archived conversation's message stays in the archive: arriving does
    // not bring it back to the inbox.
    setConversations(bump);
    setArchived(bump);
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
    try {
      const loaded = await fetchConversations(nextPage, true);

      if (loaded) {
        setPage(nextPage);
      }
    } catch {
      errorToast("Could not load more conversations. Please try again.");
    } finally {
      setLoadingMore(false);
    }
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

    // The server's unread ids and the rows drawn as unread, together: the ids
    // cover conversations not loaded yet, the rows cover a message that
    // arrived since the ids were fetched.
    const waiting = new Set(unreadConversationIds ?? []);
    for (const conversation of conversations) {
      if (isConversationUnread(conversation, user?.username)) {
        waiting.add(conversation.id);
      }
    }
    return inboxSummary(waiting.size, conversations.length);
  }, [isLoading, conversations, unreadConversationIds, user?.username]);

  /*
   * The list in reading order: what is waiting on you, then by how long ago —
   * the sections the phone draws, from the same table. The filter and the
   * search act on what is loaded; the line under them says so when nothing
   * matches.
   */
  const sections = useMemo(() => {
    const query = search.trim().toLowerCase();
    const unread = (conversation: Conversation) =>
      isConversationUnread(conversation, user?.username);

    return inboxSections(
      ((showingArchive ? archived : conversations) ?? []).filter(
        (conversation) => {
          if (!matchesInboxFilter(conversation, filter, unread(conversation))) {
            return false;
          }
          if (!query) return true;
          if (conversation.isGroup) {
            return (conversation.name ?? "").toLowerCase().includes(query);
          }
          return (conversation.members ?? []).some(
            (member) =>
              member.userName !== user?.username &&
              `${participantName(member)} ${member.userName ?? ""}`
                .toLowerCase()
                .includes(query),
          );
        },
      ),
      unread,
    );
  }, [archived, conversations, filter, search, showingArchive, user?.username]);

  const narrowed = filter !== "all" || search.trim() !== "";
  const visibleList = showingArchive ? archived : conversations;
  const listHasMore = showingArchive ? archivedHasMore : hasMore;

  const loadMoreArchived = async () => {
    if (loadingMore || !archivedHasMore) return;
    setLoadingMore(true);
    const nextPage = archivedPage + 1;
    try {
      if (await fetchArchived(nextPage, true)) setArchivedPage(nextPage);
    } catch {
      errorToast("Could not load more conversations. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

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
                  {isReadingBreaker(iceBreaker) && iceBreaker.book ? (
                    <S.IceBreakerReadingBubble
                      title={`${iceBreaker.source.name} ${iceBreaker.message}`}
                    >
                      {iceBreaker.book.coverId ? (
                        <img
                          src={bookCoverUrl(iceBreaker.book.coverId, "S")}
                          alt=""
                        />
                      ) : (
                        <IoBookOutline size={14} />
                      )}
                      <span>{iceBreaker.book.title}</span>
                    </S.IceBreakerReadingBubble>
                  ) : (
                    <S.IceBreakerBubble
                      $color={iceBreaker.color}
                      title={iceBreaker.message}
                    >
                      {truncateIceBreakerMessage(iceBreaker.message)}
                    </S.IceBreakerBubble>
                  )}
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
              <N.Section aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <ConversationCardShimmer key={i} />
                ))}
              </N.Section>
            ) : (conversations && conversations.length > 0) ||
              showingArchive ? (
              <>
                <S.ListControls>
                  <N.Filters role="toolbar" aria-label="Filter conversations">
                    {INBOX_FILTERS.map(({ id, label }) => (
                      <N.FilterChip
                        key={id}
                        type="button"
                        aria-pressed={filter === id}
                        onClick={() => setFilter(id)}
                      >
                        {label}
                      </N.FilterChip>
                    ))}
                  </N.Filters>
                  {(visibleList?.length ?? 0) >= SEARCH_THRESHOLD && (
                    <S.SearchInput
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search conversations"
                      aria-label="Search conversations"
                    />
                  )}
                </S.ListControls>

                {sections.map((section) => (
                  <N.Section key={section.title} aria-label={section.title}>
                    <N.SectionTitle>{section.title}</N.SectionTitle>
                    {section.items.map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        onMove={handleMove}
                        moving={movingIds.has(conversation.id)}
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
                    ))}
                  </N.Section>
                ))}

                {showingArchive && archivedLoading && (
                  <N.Section aria-hidden="true">
                    {Array.from({ length: 3 }, (_, i) => (
                      <ConversationCardShimmer key={i} />
                    ))}
                  </N.Section>
                )}

                {sections.length === 0 &&
                  !(showingArchive && archivedLoading) && (
                    <N.FilterEmpty>
                      {showingArchive && !search.trim()
                        ? INBOX_ARCHIVE_COPY.emptyArchive
                        : `None of those in what is loaded so far${
                            listHasMore
                              ? ". Load more to look further back."
                              : "."
                          }`}
                    </N.FilterEmpty>
                  )}
              </>
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
                  {/* An empty inbox can still have an archive behind it. */}
                  <S.EmptyStateCta
                    type="button"
                    onClick={() => setFilter("archived")}
                  >
                    {INBOX_ARCHIVE_COPY.filter}
                    <FiArrowRight size={14} />
                  </S.EmptyStateCta>
                </S.EmptyStateActions>
              </S.EmptyStateRoot>
            )}
          </S.ConversationListRoot>

          <LoadMore
            hasMore={listHasMore && !!visibleList?.length}
            loadingMore={loadingMore}
            onLoadMore={showingArchive ? loadMoreArchived : loadMore}
            unreadCount={showingArchive ? 0 : unreadBadgeCount}
            endMarker={!!visibleList?.length && !narrowed}
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
