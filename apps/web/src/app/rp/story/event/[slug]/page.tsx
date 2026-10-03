"use client";
import type {
  SoundCue,
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventThread,
  StoryBoardEventThreadPage,
  StoryCharacter,
} from "@nw/types";
import classNames from "classnames";
import { useParams, useSearchParams, useSetSearchParams } from "@/lib/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBookmark, FaPlus } from "react-icons/fa6";
import { FiShare2 } from "react-icons/fi";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  LuBookmarkPlus,
  LuBookOpen,
  LuFileText,
  LuVolume2,
  LuVolumeX,
  LuWaves,
} from "react-icons/lu";
import {
  BookmarkFAB,
  ScrollJumpButton,
  SideControlsToggle,
} from "@/components/common";
import { DeletedContent } from "@/components/deleted-content";
import { AppAlertDialog } from "@/components/dialog";
import EventThreadInput from "@/components/event-thread-input";
import { ProfileSongPlayer } from "@/components/profile-song";
import { ShareChapterDialog } from "@/components/share-chapter-dialog";
import { StorySoundscapeBoard } from "@/components/story-soundscape";
import * as SS from "@/components/story-soundscape/styles";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext, useWindowDimensions } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useSoundscape } from "@/lib/soundscape";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import {
  deleteStoryBoardEventThreadAction,
  deleteStoryboardEventBookmarkAction,
  getChapterSoundscapeAction,
  getStoryboardAction,
  getStoryboardEventAction,
  getStoryboardEventBookmarkAction,
  getStoryboardEventThreadsAction,
  getStoryCharactersAction,
  saveStoryboardEventBookmarkAction,
} from "../../actions";
import { BookView } from "./book-view";
import { PaginatedChapterView } from "./paginated-chapter-view";
import * as S from "./styles";

/** Book mode is a desktop-only affordance — it needs the room for two pages. */
const BOOK_MODE_MIN_WIDTH = 1000;

/** Threads are fetched in page-aligned chunks of this size. */
const THREADS_PAGE_SIZE = 10;

/**
 * "scroll" is the paged reader — a scrolling stack of manuscript pages, with
 * the composer live on the last one. "book" is the two-page desktop spread.
 */
type ReadingMode = "scroll" | "book";

const isThreadPage = (value: unknown): value is StoryBoardEventThreadPage =>
  !!value && typeof value === "object" && "threads" in value;

export default function StoryboardEventPage({}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const setSearchParams = useSetSearchParams();
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();

  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { successToast, errorToast } = useUIContext();
  const { width: winW } = useWindowDimensions();

  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  /** The story's own characters — offered as dialog speakers in the composer,
   *  beside the novelist's own muses. */
  const [storyCharacters, setStoryCharacters] = useState<StoryCharacter[]>([]);
  const [storyboardEvent, setStoryBoardEvent] =
    useState<StoryBoardEvent | null>(null);
  const [notFound, setNotFound] = useState(false);
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
  /** The chapter's audio cues, and whether the cue board is open. */
  const [soundCues, setSoundCues] = useState<SoundCue[]>([]);
  const [soundBoardOpen, setSoundBoardOpen] = useState(false);
  /**
   * The passage the reader is on, as state rather than only a ref: the
   * soundscape engine has to re-evaluate whenever it changes.
   */
  const [currentPassage, setCurrentPassage] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  // Window size is only known on the client; gate window-dependent UI behind a
  // mount flag so the server and first client render agree (no hydration skew).
  const [mounted, setMounted] = useState(false);
  // Whether the scroll reader is scrolled far enough up to warrant the
  // jump-to-bottom button (hidden once the reader is already near the end).
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // Whether the scroll reader is scrolled far enough down to warrant the
  // jump-to-top button (hidden once the reader is already near the top).
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  // Mobile: reader-controlled show/hide for the floating side buttons
  // (scroll-to-top/bottom, bookmark), so they don't crowd a small screen.
  const [sideControlsShown, setSideControlsShown] = useState(true);
  const storyboardEventId = params?.slug as string;
  const { routeToPage, baseDataLoader, stopPageLoading } = usePageRouter();

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
  // Never leave the reader stuck in a mode the viewport can't show. The paged
  // reader scales to any width, so only the two-page book is gated.
  const effectiveMode: ReadingMode =
    mode === "book" && !canUseBook ? "scroll" : mode;

  // Book mode needs the full width — hide the shared layout's LeftNav/
  // RightSidebar while it's active, restore them on mode change/unmount.
  useEffect(() => {
    setGlobalState({ hideAppSidebars: effectiveMode === "book" });
    return () => setGlobalState({ hideAppSidebars: false });
  }, [effectiveMode, setGlobalState]);

  const loadedEnd = windowStart + storyboardEventThreads.length;
  const hasOlder = windowStart > 0;
  const hasNewer = totalCount !== null && loadedEnd < totalCount;

  const onBackClick = () => {
    if (!storyboardEvent?.storyBoardId) return;
    routeToPage(ROUTES.Story.View(storyboardEvent.storyBoardId));
  };

  const fetchStoryboard = async (storyboardId: string) => {
    const _storyboard = await baseDataLoader(() =>
      getStoryboardAction(storyboardId),
    );
    setStoryBoard(_storyboard);

    // Fetched alongside the story rather than with the threads: the pool is
    // the same for every passage on the page, and the composer needs it before
    // the author reaches for the speaker picker.
    const characters = await getStoryCharactersAction(storyboardId);
    if (characters && !("message" in characters))
      setStoryCharacters(characters);
  };

  /* `baseDataLoader` collapses a deleted chapter and a failed request into the
   * same null, so the action is called directly — only a 404 should show the
   * torn-page scene. */
  const fetchStoryboardEvent = async () => {
    const _storyboardEvent = await getStoryboardEventAction(storyboardEventId);
    stopPageLoading();

    if (_storyboardEvent === null) {
      setNotFound(true);
      return;
    }

    if ("message" in _storyboardEvent) return;

    setStoryBoardEvent(_storyboardEvent);
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
        setCurrentPassage(resolved);
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

  /** The page's scroll container — the document itself (see rp/styles.ts). */
  const getScroller = () => document.scrollingElement as HTMLElement | null;

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
      setScrollTarget(null);
      return;
    }

    // Late-loading images/embeds inside the passage reflow the page after
    // the initial jump and drift the scroll position — keep re-aligning
    // until the content settles instead of firing once and clearing
    // immediately (which used to land on the wrong spot until the reader
    // hit "Resume" a second time).
    el.scrollIntoView({ block: "start" });
    let settle: ReturnType<typeof setTimeout>;
    const realign = () => {
      el.scrollIntoView({ block: "start" });
      clearTimeout(settle);
      settle = setTimeout(() => setScrollTarget(null), 400);
    };
    settle = setTimeout(() => setScrollTarget(null), 400);

    const observer = new MutationObserver(realign);
    observer.observe(el, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    const images = el.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", realign);
    });

    return () => {
      observer.disconnect();
      clearTimeout(settle);
      images.forEach((img) => img.removeEventListener("load", realign));
    };
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
          const next = Math.min(...visible);
          currentIndexRef.current = next;
          setCurrentPassage(next);
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
    // Document scrolling fires scroll events on window, not on
    // document.scrollingElement — the reads above still use the element.
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [effectiveMode, storyboardEventThreads, mounted]);

  // A chapter's cues are small and everyone who can read the chapter can hear
  // them, so they load with it rather than behind the enable toggle.
  const loadSoundscape = useCallback(async () => {
    const result = await getChapterSoundscapeAction(storyboardEventId);
    if (!result || "message" in result) return;
    setSoundCues(result.cues);
  }, [storyboardEventId]);

  useEffect(() => {
    if (authState === "LOADING") return;
    loadSoundscape();
  }, [authState, loadSoundscape]);

  const soundscape = useSoundscape({
    cues: soundCues,
    position: currentPassage,
  });

  const handleBookPosition = useCallback((threadIndex: number) => {
    currentIndexRef.current = threadIndex;
    setCurrentPassage(threadIndex);
  }, []);

  const switchMode = (next: ReadingMode) => {
    if (next === mode) return;
    // Hand the current position to book mode so it opens on the right
    // spread. Coming back to scroll mode intentionally does NOT jump the
    // page's scroll position to match — it just stays where it already is.
    if (next === "book") {
      setBookTarget(currentIndexRef.current);
      // The book is read-only; abandon an in-place edit rather than carry
      // its editor into a view that cannot show it.
      setEditingThread(null);
    }
    setMode(next);
  };

  const saveBookmarkAt = async (threadIndex: number) => {
    const saved = await saveStoryboardEventBookmarkAction({
      storyBoardEventId: storyboardEventId,
      threadIndex,
    });

    if (saved && "threadIndex" in saved) {
      setBookmarkIndex(threadIndex);
      successToast("Bookmark saved — you'll pick up right here.");
      // Mirror the bookmark into the URL so the spot is shareable. Best
      // effort only — some mobile in-app browsers restrict history writes,
      // and that's not worth losing the saved bookmark over.
      setSearchParams((params) => params.set("t", String(threadIndex)));
    } else {
      errorToast("Could not save the bookmark. Please try again.");
    }
  };

  const handleSaveBookmark = () => saveBookmarkAt(currentIndexRef.current);

  const handleRemoveBookmark = async () => {
    const result = await deleteStoryboardEventBookmarkAction(storyboardEventId);

    if (result.message === API_MESSAGE.Success) {
      setBookmarkIndex(null);
      successToast("Bookmark removed.");
      setSearchParams((params) => params.delete("t"));
    } else {
      errorToast("Could not remove the bookmark. Please try again.");
    }
  };

  /** Divider badge under a passage: bookmarks it, or clears the bookmark if
   *  that passage is already the saved spot. */
  const handleTogglePassageBookmark = (threadIndex: number) => {
    if (bookmarkIndex === threadIndex) {
      handleRemoveBookmark();
    } else {
      saveBookmarkAt(threadIndex);
    }
  };

  /** Jumps the active reader to the saved bookmark, loading its chunk if
   *  it lies outside the current window. */
  const goToBookmark = async () => {
    if (bookmarkIndex === null) return;
    const inWindow = bookmarkIndex >= windowStart && bookmarkIndex < loadedEnd;
    if (inWindow) {
      currentIndexRef.current = bookmarkIndex;
      setCurrentPassage(bookmarkIndex);
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

  const canCompose = authState === "LOGGED_IN" && isMember;
  const showComposer = canCompose && effectiveMode === "scroll";

  /** The end-of-chapter composer — sits on the last page as its final item,
   *  where new writing grows the page exactly like a Word document. */
  const composerNode = (
    <EventThreadInput
      key="new-thread"
      variant="inline"
      editorPlaceholder="Continue the story… @ to mention novelists or muses"
      storyBoardEventId={storyboardEventId}
      storyCharacters={storyCharacters}
      onSend={() => {
        // Scroll to the bottom afterwards so the saved passage and the
        // composer beneath it both come into view.
        pendingScrollBottomRef.current = true;
        jumpToIndex(null, true);
      }}
    />
  );

  /** The in-place editor for the passage being edited. Mounted once, on the
   *  page the passage lives on — the page reflows around it as it grows. */
  const inlineEditorNode = editingThread ? (
    <EventThreadInput
      key={editingThread.id}
      variant="inline"
      storyBoardEventId={storyboardEventId}
      storyCharacters={storyCharacters}
      initialThread={editingThread}
      onSend={() => {
        setEditingThread(null);
        // The passage re-renders in place; the reader stays where they are.
        refreshWindow();
      }}
      onCancel={() => setEditingThread(null)}
    />
  ) : null;

  if (notFound) return <DeletedContent label="Chapter" />;

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
              title="Manuscript pages — scroll through them, write on the last"
            >
              <LuFileText />
              Pages
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
        {/* Browsers block audio before a gesture, so the soundscape only ever
            starts from this tap — which is also the master mute. */}
        {soundCues.length > 0 && (
          <SS.EnableButton
            type="button"
            $on={soundscape.enabled}
            onClick={soundscape.toggle}
            aria-pressed={soundscape.enabled}
            title={
              soundscape.enabled
                ? "Mute this chapter's soundscape"
                : "Play this chapter's soundscape"
            }
          >
            {soundscape.enabled ? (
              <LuVolume2 size={15} />
            ) : (
              <LuVolumeX size={15} />
            )}
            Sound
            {soundscape.activeCount > 0 && (
              <span className="badge">{soundscape.activeCount}</span>
            )}
          </SS.EnableButton>
        )}

        {authState === "LOGGED_IN" && isMember && (
          <S.BookmarkButton
            $accent={soundBoardOpen}
            onClick={() => setSoundBoardOpen((open) => !open)}
            aria-label="Edit this chapter's soundscape"
            title="Edit this chapter's soundscape"
          >
            <LuWaves size={17} />
          </S.BookmarkButton>
        )}

        <S.BookmarkButton
          onClick={() => setShowShareDialog(true)}
          aria-label="Share this chapter"
          title="Share this chapter"
        >
          <FiShare2 size={17} />
        </S.BookmarkButton>
      </S.TopBar>

      {/* Cue editor — members only, and only while they ask for it. */}
      {soundBoardOpen && authState === "LOGGED_IN" && isMember && (
        <S.ChapterSong>
          <StorySoundscapeBoard
            storyboardEventId={storyboardEventId}
            cues={soundCues}
            passageCount={totalCount ?? storyboardEventThreads.length}
            currentPassage={currentPassage}
            canEdit={isMember}
            onCuesChanged={setSoundCues}
          />
        </S.ChapterSong>
      )}

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
        storyboardEvent && (
          <PaginatedChapterView
            event={storyboardEvent}
            threads={storyboardEventThreads}
            startIndex={windowStart}
            totalThreads={totalCount ?? storyboardEventThreads.length}
            canManage={isMember}
            isLoggedIn={authState === "LOGGED_IN"}
            bookmarkIndex={bookmarkIndex}
            editingThreadId={editingThread?.id ?? null}
            editor={inlineEditorNode}
            onEdit={(t) => setEditingThread(t)}
            onDelete={(t) => setThreadToDelete(t)}
            onToggleBookmark={handleTogglePassageBookmark}
            registerThreadEl={registerThreadEl}
            hasOlder={hasOlder}
            hasNewer={hasNewer}
            loadingOlder={loadingOlder}
            loadingNewer={loadingNewer}
            onNeedBefore={loadOlder}
            onNeedAfter={loadNewer}
            // One write surface at a time: the composer yields while a
            // passage is being edited in place.
            composer={showComposer && !editingThread ? composerNode : undefined}
          />
        )
      )}

      {effectiveMode === "scroll" && (
        <SideControlsToggle
          shown={sideControlsShown}
          onClick={() => setSideControlsShown((shown) => !shown)}
          topOffset={66}
        />
      )}

      {effectiveMode === "scroll" && (
        <ScrollJumpButton
          direction="up"
          position="top"
          topOffset={66}
          edgeOffset={16}
          mobileTopOffset={50}
          slideOut={!sideControlsShown}
          visible={showScrollToTop}
          onClick={scrollToTop}
          label="Jump to the top of the page"
        />
      )}

      {effectiveMode === "scroll" && (
        <ScrollJumpButton
          direction="down"
          icon={
            authState === "LOGGED_IN" && isMember ? (
              <FaPlus size={18} />
            ) : undefined
          }
          edgeOffset={16}
          slideOut={!sideControlsShown}
          visible={showScrollToBottom}
          onClick={scrollToBottom}
          label="Jump to the latest passage"
        />
      )}

      {/* Always-reachable bookmark control — the header's bookmark icons
          scroll out of reach on a long passage (mobile especially), so this
          floats in a fixed corner instead. */}
      <BookmarkFAB
        visible={effectiveMode === "scroll" && authState === "LOGGED_IN"}
        slideOut={!sideControlsShown}
        hasBookmark={bookmarkIndex !== null}
        onSave={handleSaveBookmark}
        onGoToBookmark={goToBookmark}
      />

      <ShareChapterDialog
        event={storyboardEvent}
        storyboardName={storyboard?.name ?? ""}
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </S.ParentContainer>
  );
}
