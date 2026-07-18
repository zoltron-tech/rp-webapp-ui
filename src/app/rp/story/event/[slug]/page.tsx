"use client";
import classNames from "classnames";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsCalendar2Date } from "react-icons/bs";
import { FaBookmark, FaPlus } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { LuBookmarkPlus, LuBookOpen, LuScrollText } from "react-icons/lu";
import { TfiLocationPin } from "react-icons/tfi";
import { resolveAsterismStyle } from "@/components/asterism-styles";
import { CoverImage, ScrollJumpButton } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import EventThreadInput from "@/components/event-thread-input";
import { ProfileSongPlayer } from "@/components/profile-song";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext, useWindowDimensions } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type {
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventThread,
  StoryBoardEventThreadPage,
} from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import {
  deleteStoryBoardEventThreadAction,
  getStoryboardAction,
  getStoryboardEventAction,
  getStoryboardEventBookmarkAction,
  getStoryboardEventThreadsAction,
  saveStoryboardEventBookmarkAction,
} from "../../actions";
import { BookView } from "./book-view";
import { EventThread } from "./event-thread";
import * as S from "./styles";
import { ShouldRender } from "@novelist-world/ui";

/** Book mode is a desktop-only affordance — it needs the room for two pages. */
const BOOK_MODE_MIN_WIDTH = 1000;

/** Threads are fetched in page-aligned chunks of this size. */
const THREADS_PAGE_SIZE = 10;

type ReadingMode = "scroll" | "book";

const isThreadPage = (value: unknown): value is StoryBoardEventThreadPage =>
  !!value && typeof value === "object" && "threads" in value;

export default function StoryboardEventPage({}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");

  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { successToast, errorToast } = useUIContext();
  const { width: winW } = useWindowDimensions();

  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  const [storyboardEvent, setStoryBoardEvent] =
    useState<StoryBoardEvent | null>(null);
  const [storyboardEventThreads, setStoryBoardEventThreads] = useState<
    StoryBoardEventThread[]
  >([]);
  /** Global index (createdAt order) of the first loaded thread. */
  const [windowStart, setWindowStart] = useState(0);
  /** Total threads in the event; null until the first page arrives. */
  const [totalCount, setTotalCount] = useState<number | null>(null);
  /** Thread index the scroll reader should jump to once it is rendered. */
  const [scrollTarget, setScrollTarget] = useState<number | null>(null);
  /** Thread index the book opens at (captured when book mode is entered). */
  const [bookTarget, setBookTarget] = useState<number | null>(null);
  /** The reader's saved bookmark (global thread index), if any. */
  const [bookmarkIndex, setBookmarkIndex] = useState<number | null>(null);
  /** One-shot command telling a mounted BookView to snap to a thread. */
  const [jumpRequest, setJumpRequest] = useState<{
    index: number;
    nonce: number;
  } | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [editingThread, setEditingThread] =
    useState<StoryBoardEventThread | null>(null);
  const [threadToDelete, setThreadToDelete] =
    useState<StoryBoardEventThread | null>(null);
  const [mode, setMode] = useState<ReadingMode>("scroll");
  // Window size is only known on the client; gate window-dependent UI behind a
  // mount flag so the server and first client render agree (no hydration skew).
  const [mounted, setMounted] = useState(false);
  // Whether the scroll reader is scrolled far enough up to warrant the
  // jump-to-bottom button (hidden once the reader is already near the end).
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // Whether the scroll reader is scrolled far enough down to warrant the
  // jump-to-top button (hidden once the reader is already near the top).
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const storyboardEventId = params?.slug as string;
  const { routeToPage, baseDataLoader } = usePageRouter();

  /** Global index of the thread the reader is currently on. */
  const currentIndexRef = useRef(0);
  /** Wrapper element of each rendered thread, keyed by global index. */
  const threadElsRef = useRef(new Map<number, HTMLDivElement>());
  const loadingEdgeRef = useRef(false);
  /** Set after saving a passage (new or edited) so the reader scrolls to the
   *  very bottom, bringing the passage and the composer into view. */
  const pendingScrollBottomRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const isMember =
    !!user?.username &&
    !!storyboard &&
    (storyboard.createdBy?.username === user.username ||
      storyboard.members.some((member) => member.username === user.username));

  const canUseBook = mounted && (winW ?? 0) >= BOOK_MODE_MIN_WIDTH;
  // Never leave the reader stuck in a mode the viewport can't show.
  const effectiveMode: ReadingMode = canUseBook ? mode : "scroll";

  const loadedEnd = windowStart + storyboardEventThreads.length;
  const hasOlder = windowStart > 0;
  const hasNewer = totalCount !== null && loadedEnd < totalCount;

  const overtureAsterism = resolveAsterismStyle(
    storyboardEvent?.overtureAsterism,
  );
  const passageAsterism = resolveAsterismStyle(
    storyboardEvent?.passageAsterism,
  );

  const onBackClick = () => {
    if (!storyboardEvent?.storyBoardId) return;
    routeToPage(ROUTES.Story.View(storyboardEvent.storyBoardId));
  };

  const fetchStoryboard = async (storyboardId: string) => {
    const _storyboard = await baseDataLoader(() =>
      getStoryboardAction(storyboardId),
    );
    setStoryBoard(_storyboard);
  };

  const fetchStoryboardEvent = async () => {
    const _storyboardEvent = await baseDataLoader(() =>
      getStoryboardEventAction(storyboardEventId),
    );
    setStoryBoardEvent(_storyboardEvent);
    if (_storyboardEvent !== null)
      fetchStoryboard(_storyboardEvent.storyBoardId);
  };

  const fetchThreadPage = useCallback(
    async (pageNumber: number): Promise<StoryBoardEventThreadPage | null> => {
      const page = await getStoryboardEventThreadsAction(
        storyboardEventId,
        pageNumber,
        THREADS_PAGE_SIZE,
      );
      return isThreadPage(page) ? page : null;
    },
    [storyboardEventId],
  );

  /**
   * Replaces the loaded window with the chunk containing `target` (or the
   * final chunk when `toEnd`), and remembers the position so the active
   * reader can jump there.
   */
  const jumpToIndex = useCallback(
    async (target: number | null, toEnd = false) => {
      let pageNumber = 1;
      if (toEnd) {
        pageNumber = Math.max(
          1,
          Math.ceil(((totalCount ?? 0) + 1) / THREADS_PAGE_SIZE),
        );
      } else if (target !== null) {
        pageNumber = Math.floor(target / THREADS_PAGE_SIZE) + 1;
      }

      let page = await fetchThreadPage(pageNumber);
      if (!page) return;
      // The requested chunk can be past the end (stale bookmark, deleted
      // threads) — fall back to the real last chunk.
      if (page.threads.length === 0 && page.totalCount > 0) {
        pageNumber = Math.max(
          1,
          Math.ceil(page.totalCount / THREADS_PAGE_SIZE),
        );
        page = await fetchThreadPage(pageNumber);
        if (!page) return;
      }

      const start = (pageNumber - 1) * THREADS_PAGE_SIZE;
      setStoryBoardEventThreads(page.threads);
      setWindowStart(start);
      setTotalCount(page.totalCount);

      const lastIndex = Math.max(0, page.totalCount - 1);
      const resolved = toEnd
        ? lastIndex
        : target !== null
          ? Math.min(target, lastIndex)
          : null;
      if (resolved !== null) {
        currentIndexRef.current = resolved;
        setScrollTarget(resolved);
        setBookTarget(resolved);
      }
    },
    [fetchThreadPage, totalCount],
  );

  /** Opens the reader at the `?t=` URL param (or the start if no param). */
  const initThreads = async () => {
    let target: number | null = null;
    const tParam = searchParams?.get("t");
    if (tParam && /^\d+$/.test(tParam)) {
      target = parseInt(tParam, 10);
    }
    // Fetch the bookmark for display in UI, but don't auto-jump to it.
    if (authState === "LOGGED_IN") {
      const bookmark =
        await getStoryboardEventBookmarkAction(storyboardEventId);
      if (bookmark) {
        setBookmarkIndex(bookmark.threadIndex);
      }
    }
    await jumpToIndex(target);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyboardEvent) return;

    fetchStoryboardEvent();
    initThreads();
  }, [authState]);

  /** Prepends the chunk before the window; true when threads were added. */
  const loadOlder = useCallback(async (): Promise<boolean> => {
    if (loadingEdgeRef.current || windowStart <= 0) return false;
    loadingEdgeRef.current = true;
    setLoadingOlder(true);

    const pageNumber = windowStart / THREADS_PAGE_SIZE;
    const page = await fetchThreadPage(pageNumber);
    let added = false;
    if (page && page.threads.length > 0) {
      setStoryBoardEventThreads((prev) => [...page.threads, ...prev]);
      setWindowStart((start) => start - page.threads.length);
      setTotalCount(page.totalCount);
      added = true;
    }

    loadingEdgeRef.current = false;
    setLoadingOlder(false);
    return added;
  }, [fetchThreadPage, windowStart]);

  /** Appends the chunk after the window; true when threads were added. */
  const loadNewer = useCallback(async (): Promise<boolean> => {
    if (loadingEdgeRef.current || !hasNewer) return false;
    loadingEdgeRef.current = true;
    setLoadingNewer(true);

    const pageNumber = loadedEnd / THREADS_PAGE_SIZE + 1;
    const page = await fetchThreadPage(pageNumber);
    let added = false;
    if (page && page.threads.length > 0) {
      setStoryBoardEventThreads((prev) => [...prev, ...page.threads]);
      setTotalCount(page.totalCount);
      added = true;
    }

    loadingEdgeRef.current = false;
    setLoadingNewer(false);
    return added;
  }, [fetchThreadPage, hasNewer, loadedEnd]);

  /** Refetches the chunks covering the current window (edits, deletions). */
  const refreshWindow = useCallback(async () => {
    const firstPage = windowStart / THREADS_PAGE_SIZE + 1;
    const lastPage =
      Math.floor(
        (windowStart + Math.max(storyboardEventThreads.length - 1, 0)) /
          THREADS_PAGE_SIZE,
      ) + 1;
    const pageNumbers: number[] = [];
    for (let p = firstPage; p <= lastPage; p++) pageNumbers.push(p);

    const pages = await Promise.all(pageNumbers.map(fetchThreadPage));
    if (pages.some((page) => page === null)) return;

    const threads = pages.flatMap((page) => page?.threads ?? []);
    const total = pages[pages.length - 1]?.totalCount ?? threads.length;
    // The window may now extend past the end (a deletion); clamp to reality.
    if (threads.length === 0 && total > 0) {
      await jumpToIndex(null, true);
      return;
    }
    setStoryBoardEventThreads(threads);
    setTotalCount(total);
  }, [
    fetchThreadPage,
    jumpToIndex,
    storyboardEventThreads.length,
    windowStart,
  ]);

  /** The page's scroll container (see rp/styles.ts — the app scrolls here,
   *  not the window). */
  const getScroller = () =>
    document.querySelector<HTMLElement>("main.page-container");

  const scrollToBottom = useCallback(() => {
    const scroller = getScroller();
    if (!scroller) return;
    scroller.scrollTo({ behavior: "smooth", top: scroller.scrollHeight });
  }, []);

  const scrollToTop = useCallback(() => {
    const scroller = getScroller();
    if (!scroller) return;
    scroller.scrollTo({ behavior: "smooth", top: 0 });
  }, []);

  // Scroll reader: jump to the remembered position once its thread renders.
  useEffect(() => {
    if (scrollTarget === null || effectiveMode !== "scroll") return;
    const el = threadElsRef.current.get(scrollTarget);
    if (!el) return;
    // A freshly added passage scrolls all the way to the bottom so the new
    // text and the composer beneath it both come into view (same as the
    // jump-to-latest button); otherwise align the target to the top.
    if (pendingScrollBottomRef.current) {
      pendingScrollBottomRef.current = false;
      scrollToBottom();
    } else {
      el.scrollIntoView({ block: "start" });
    }
    setScrollTarget(null);
  }, [scrollTarget, effectiveMode, storyboardEventThreads, scrollToBottom]);

  // Honor a queued scroll-to-bottom that isn't tied to a scrollTarget jump —
  // e.g. after editing a passage in place, which refreshes the window without
  // moving the reading position.
  useEffect(() => {
    if (!pendingScrollBottomRef.current || scrollTarget !== null) return;
    if (effectiveMode !== "scroll") return;
    pendingScrollBottomRef.current = false;
    scrollToBottom();
  }, [storyboardEventThreads, scrollTarget, effectiveMode, scrollToBottom]);

  // Picking a passage to edit populates the composer at the foot of the
  // reader; scroll to the bottom so it and its input come into view.
  useEffect(() => {
    if (editingThread && effectiveMode === "scroll") scrollToBottom();
  }, [editingThread, effectiveMode, scrollToBottom]);

  // Scroll reader: track the topmost visible passage as the reading position.
  useEffect(() => {
    if (effectiveMode !== "scroll") return;
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.threadIndex,
          );
          if (Number.isNaN(index)) continue;
          if (entry.isIntersecting) visible.add(index);
          else visible.delete(index);
        }
        if (visible.size > 0) {
          currentIndexRef.current = Math.min(...visible);
        }
      },
      { rootMargin: "-80px 0px -35% 0px" },
    );
    threadElsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [effectiveMode, storyboardEventThreads]);

  // Scroll reader: reveal the jump-to-bottom button while there is a
  // meaningful distance left below, hide it once the reader nears the end.
  useEffect(() => {
    if (effectiveMode !== "scroll") {
      setShowScrollToBottom(false);
      setShowScrollToTop(false);
      return;
    }
    const scroller = getScroller();
    if (!scroller) return;

    const update = () => {
      const distanceToBottom =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      setShowScrollToBottom(distanceToBottom > 400);
      setShowScrollToTop(scroller.scrollTop > 400);
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [effectiveMode, storyboardEventThreads, mounted]);

  const handleBookPosition = useCallback((threadIndex: number) => {
    currentIndexRef.current = threadIndex;
  }, []);

  const switchMode = (next: ReadingMode) => {
    if (next === mode) return;
    // Hand the current position across so the reader resumes in place.
    if (next === "book") setBookTarget(currentIndexRef.current);
    else setScrollTarget(currentIndexRef.current);
    setMode(next);
  };

  const handleSaveBookmark = async () => {
    const threadIndex = currentIndexRef.current;
    const saved = await saveStoryboardEventBookmarkAction({
      storyBoardEventId: storyboardEventId,
      threadIndex,
    });

    if (saved && "threadIndex" in saved) {
      setBookmarkIndex(threadIndex);
      successToast("Bookmark saved — you'll pick up right here.");
      // Mirror the bookmark into the URL so the spot is shareable.
      const url = new URL(window.location.href);
      url.searchParams.set("t", String(threadIndex));
      window.history.replaceState(null, "", url.toString());
    } else {
      errorToast("Could not save the bookmark. Please try again.");
    }
  };

  /** Jumps the active reader to the saved bookmark, loading its chunk if
   *  it lies outside the current window. */
  const goToBookmark = async () => {
    if (bookmarkIndex === null) return;
    const inWindow = bookmarkIndex >= windowStart && bookmarkIndex < loadedEnd;
    if (inWindow) {
      currentIndexRef.current = bookmarkIndex;
      setScrollTarget(bookmarkIndex);
    } else {
      await jumpToIndex(bookmarkIndex);
    }
    // Snap an already-mounted book to the spot (mount targets won't re-fire).
    setJumpRequest({ index: bookmarkIndex, nonce: Date.now() });
  };

  const handleDeleteThread = async () => {
    if (!threadToDelete?.id) return;

    const response = await deleteStoryBoardEventThreadAction(threadToDelete.id);

    if (response.message === API_MESSAGE.Success) {
      successToast("Thread deleted.");
      if (editingThread?.id === threadToDelete.id) setEditingThread(null);
      // Refetch so the window stays contiguous and page-aligned.
      await refreshWindow();
    } else {
      errorToast("Could not delete the thread. Please try again.");
    }

    setThreadToDelete(null);
  };

  const registerThreadEl = (index: number) => (el: HTMLDivElement | null) => {
    if (el) threadElsRef.current.set(index, el);
    else threadElsRef.current.delete(index);
  };

  const showComposer =
    authState === "LOGGED_IN" && isMember && effectiveMode === "scroll";

  return (
    <S.ParentContainer className={classNames([accent, theme])}>
      <AppAlertDialog
        heading="Delete this thread?"
        text="This action is permanent. Are you sure?"
        open={Boolean(threadToDelete)}
        onOpenChange={(open: boolean) => {
          if (!open) setThreadToDelete(null);
        }}
        onConfirm={handleDeleteThread}
        actionButtonLabel="Delete"
      />

      {/* Quiet top strip: back · story · readers · bookmark · reading mode */}
      <S.TopBar>
        <S.BackButton onClick={onBackClick} aria-label="Back to story">
          <IoArrowBackOutline size={22} />
        </S.BackButton>
        <S.Breadcrumb onClick={onBackClick}>{storyboard?.name}</S.Breadcrumb>
        <S.TopBarSpacer />
        <S.MemberStack>
          {storyboard?.members.map((member) => (
            <S.Avatar
              key={member.username}
              src={member?.image ?? null}
              alt=""
              size={34}
            />
          ))}
        </S.MemberStack>
        {authState === "LOGGED_IN" && bookmarkIndex !== null && (
          <S.BookmarkButton
            $accent
            onClick={goToBookmark}
            aria-label={`Go to your bookmark (passage ${bookmarkIndex + 1})`}
            title={`Go to your bookmark (passage ${bookmarkIndex + 1})`}
          >
            <FaBookmark size={15} />
          </S.BookmarkButton>
        )}
        {authState === "LOGGED_IN" && (
          <S.BookmarkButton
            onClick={handleSaveBookmark}
            aria-label="Bookmark your current spot"
            title="Bookmark your current spot"
          >
            <LuBookmarkPlus size={19} />
          </S.BookmarkButton>
        )}
        {canUseBook && (
          <S.ModeToggle role="tablist" aria-label="Reading mode">
            <S.ModeButton
              type="button"
              role="tab"
              aria-selected={effectiveMode === "scroll"}
              $active={effectiveMode === "scroll"}
              onClick={() => switchMode("scroll")}
            >
              <LuScrollText />
              Scroll
            </S.ModeButton>
            <S.ModeButton
              type="button"
              role="tab"
              aria-selected={effectiveMode === "book"}
              $active={effectiveMode === "book"}
              onClick={() => switchMode("book")}
            >
              <LuBookOpen />
              Book
            </S.ModeButton>
          </S.ModeToggle>
        )}
      </S.TopBar>

      {storyboardEvent?.song && (
        <S.ChapterSong>
          <ProfileSongPlayer
            key={
              storyboardEvent.song.spotifyTrackId ??
              storyboardEvent.song.songId ??
              storyboardEvent.song.title
            }
            song={storyboardEvent.song}
            slim
            block
          />
        </S.ChapterSong>
      )}

      {effectiveMode === "book" && storyboardEvent ? (
        <BookView
          event={storyboardEvent}
          threads={storyboardEventThreads}
          startIndex={windowStart}
          totalThreads={totalCount ?? storyboardEventThreads.length}
          targetIndex={bookTarget}
          bookmarkIndex={bookmarkIndex}
          jumpRequest={jumpRequest}
          onGoToBookmark={goToBookmark}
          onNeedBefore={loadOlder}
          onNeedAfter={loadNewer}
          onPositionChange={handleBookPosition}
        />
      ) : (
        <S.Book>
          {/* Title page */}
          <S.TitlePage>
            {storyboardEvent?.image && (
              <S.CoverFrame>
                <CoverImage
                  src={storyboardEvent.image}
                  nwImage={storyboardEvent.avatar}
                />
              </S.CoverFrame>
            )}
            <S.EyebrowRule>Chapter</S.EyebrowRule>
            <S.EventTitle>{storyboardEvent?.name}</S.EventTitle>
            <S.MetaRow>
              {storyboardEvent?.eventTime && (
                <span className="meta">
                  <BsCalendar2Date size={13} />
                  {toFormattedDate(storyboardEvent.eventTime)}
                </span>
              )}
              {storyboardEvent?.location && (
                <span className="meta">
                  <TfiLocationPin size={13} />
                  {storyboardEvent.location}
                </span>
              )}
            </S.MetaRow>
          </S.TitlePage>

          {/* Opening narration */}
          {overtureAsterism.value !== "none" && (
            <S.Asterism $variant={overtureAsterism.lineVariant}>
              <span className="glyph">{overtureAsterism.glyph}</span>
            </S.Asterism>
          )}
          <S.Overture>
            <ShouldRender if={Boolean(storyboardEvent?.description && storyboardEvent?.description.length > 0)}>
            <RichTextRenderer
              savedText={storyboardEvent?.description ?? ""}
              disableCollapse
            />
            </ShouldRender>
          </S.Overture>

          {/* Passages — one seamless flow of the story */}
          <S.ThreadFlow>
            {hasOlder && (
              <S.LoadMoreButton
                type="button"
                onClick={loadOlder}
                disabled={loadingOlder}
              >
                {loadingOlder ? "Turning back…" : "Read earlier passages"}
              </S.LoadMoreButton>
            )}
            {storyboardEventThreads.length === 0 ? (
              <S.EmptyPassages>
                The story waits for its first words…
              </S.EmptyPassages>
            ) : (
              storyboardEventThreads.map((thread, i) => (
                <div
                  key={thread.id ?? windowStart + i}
                  ref={registerThreadEl(windowStart + i)}
                  data-thread-index={windowStart + i}
                >
                  {passageAsterism.value !== "none" && (
                    <S.Asterism $tight $variant={passageAsterism.lineVariant}>
                      <span className="glyph">{passageAsterism.glyph}</span>
                    </S.Asterism>
                  )}
                  {bookmarkIndex === windowStart + i && (
                    <S.BookmarkedMark>
                      <FaBookmark />
                      Bookmarked
                    </S.BookmarkedMark>
                  )}
                  <EventThread
                    thread={thread}
                    canManage={isMember}
                    onEdit={(t) => setEditingThread(t)}
                    onDelete={(t) => setThreadToDelete(t)}
                  />
                </div>
              ))
            )}
            {hasNewer && (
              <S.LoadMoreButton
                type="button"
                onClick={loadNewer}
                disabled={loadingNewer}
              >
                {loadingNewer ? "Turning the page…" : "Read on"}
              </S.LoadMoreButton>
            )}
          </S.ThreadFlow>
        </S.Book>
      )}

      {showComposer && (
        <S.ComposerWrap>
          <div className="separator" />
          <S.ComposerHint>Add to the story</S.ComposerHint>
          {editingThread && (
            <S.EditingBanner>
              <span>Editing a passage</span>
              <button type="button" onClick={() => setEditingThread(null)}>
                Cancel
              </button>
            </S.EditingBanner>
          )}
          <EventThreadInput
            key={editingThread?.id ?? "new-thread"}
            storyBoardEventId={storyboardEventId}
            initialThread={editingThread}
            onSend={() => {
              const wasEditing = Boolean(editingThread);
              setEditingThread(null);
              // Either way, scroll to the bottom afterwards so the saved
              // passage and the composer are both in view. An edit refreshes
              // in place; a new passage joins at the end.
              pendingScrollBottomRef.current = true;
              if (wasEditing) refreshWindow();
              else jumpToIndex(null, true);
            }}
          />
        </S.ComposerWrap>
      )}

      {effectiveMode === "scroll" && (
        <ScrollJumpButton
          direction="up"
          position="top"
          visible={showScrollToTop}
          onClick={scrollToTop}
          label="Jump to the top of the page"
        />
      )}

      {effectiveMode === "scroll" && (
        <ScrollJumpButton
          direction="down"
          icon={<FaPlus size={18} />}
          visible={showScrollToBottom}
          onClick={scrollToBottom}
          label="Jump to the latest passage"
        />
      )}
    </S.ParentContainer>
  );
}
