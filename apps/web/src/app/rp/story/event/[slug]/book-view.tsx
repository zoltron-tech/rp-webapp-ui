"use client";

import type { StoryBoardEvent, StoryBoardEventThread } from "@nw/types";
import {
  type CSSProperties,
  type FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaBookmark } from "react-icons/fa6";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useWindowDimensions } from "@/hooks";
import { EMPTY_PAGE_MAP, type PageMap, paginate } from "@/lib/paginator";
import { ChapterFlow, useFlowItems } from "./chapter-pages";
import * as S from "./styles";

/** Gutter between the two halves of the spread. */
const SPINE_GAP = 0;

/**
 * How the page sizes itself to the screen.
 *
 * There are no stored page formats any more, so the book takes the room it is
 * given and makes a page out of it: as wide as fits, capped so a line never
 * runs past a comfortable measure, and as tall as the window leaves after the
 * chrome. That is the whole point of paginating at read time — the page is the
 * screen, not a trim size somebody picked in a settings panel months ago.
 */
const PAGE_MAX_WIDTH = 560;
const PAGE_MIN_WIDTH = 260;
const PAGE_MIN_HEIGHT = 320;
/** Inner margin as a fraction of page width, floored so it never disappears. */
const PAD_X_RATIO = 0.11;
const PAD_Y_RATIO = 0.085;
const PAD_X_MIN = 18;
const PAD_Y_MIN = 16;

/** Below this the spread shows one page at a time rather than two. */
const SINGLE_PAGE_BREAKPOINT = 820;

/** Varied line widths so the loading shimmer reads like ragged prose. */
const SHIMMER_LINE_WIDTHS = [
  "92%",
  "78%",
  "95%",
  "84%",
  "70%",
  "90%",
  "60%",
  "88%",
  "76%",
  "94%",
  "82%",
  "68%",
];

/** Keep snapping to the passage the reader opened at (sticky until the reader
 *  turns a page — the passage may not even be fetched yet). */
type Pending = { type: "target"; index: number };

type Props = {
  event: StoryBoardEvent;
  /** The loaded, contiguous window of the event's threads. */
  threads: StoryBoardEventThread[];
  /** Global index (in createdAt order) of `threads[0]`. */
  startIndex: number;
  /** Total threads in the event, loaded or not. */
  totalThreads: number;
  /** Global thread index to open the book at (e.g. a bookmark). */
  targetIndex?: number | null;
  /** The reader's saved bookmark — marks its page with a ribbon. */
  bookmarkIndex?: number | null;
  /** One-shot snap-to-thread command (nonce changes on every request). */
  jumpRequest?: { index: number; nonce: number } | null;
  /** Jump back to the saved bookmark (footer control). */
  onGoToBookmark?: () => void;
  /** Load the chunk before the window; resolves true when threads were added. */
  onNeedBefore?: () => Promise<boolean>;
  /** Load the chunk after the window; resolves true when threads were added. */
  onNeedAfter?: () => Promise<boolean>;
  /** Reports the global index of the thread the reader is currently on. */
  onPositionChange?: (threadIndex: number) => void;
};

/**
 * The book spread.
 *
 * Pages are decided here, at read time, against the screen the chapter is
 * actually being read on. A hidden copy of the flow is laid out at the page's
 * measure and `paginate` walks it for legal cut points — line-box boundaries,
 * never inside an image, a dialog embed, or the prose wrapping a float — then
 * takes the last one that fits each page. Each half of the spread is a clipped
 * window onto that flow, pushed up to its page's offset.
 *
 * This replaces a model where heights were measured once, frozen on the
 * server, and packed into the same pages for everybody. That gave stable page
 * numbers, but it forced the writing surface to be a fixed page geometry and
 * meant the reader's own text size could not move a break. The trade is
 * deliberate: numbers here describe this screen and this session, so they are
 * for orientation, not for citation.
 */
export const BookView: FC<Props> = ({
  event,
  threads,
  startIndex,
  totalThreads,
  targetIndex = null,
  bookmarkIndex = null,
  jumpRequest = null,
  onGoToBookmark,
  onNeedBefore,
  onNeedAfter,
  onPositionChange,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<Pending | null>(
    targetIndex != null && targetIndex > 0
      ? { index: targetIndex, type: "target" }
      : null,
  );
  const busyRef = useRef(false);

  const { width: winW, height: winH } = useWindowDimensions();

  const [spread, setSpread] = useState(0);
  const [loadingEdge, setLoadingEdge] = useState<"before" | "after" | null>(
    null,
  );

  const items = useFlowItems(threads, startIndex);

  // ── The page, cut from the screen ────────────────────────────────────────

  /** Two pages side by side, unless the screen is too narrow to hold them. */
  const twoUp = (winW ?? 1024) >= SINGLE_PAGE_BREAKPOINT;

  const geometry = useMemo(() => {
    const stage = stageRef.current;
    const availW = stage?.clientWidth || winW || 1024;
    const halves = twoUp ? 2 : 1;
    const width = Math.max(
      PAGE_MIN_WIDTH,
      Math.min(PAGE_MAX_WIDTH, Math.floor((availW - SPINE_GAP) / halves)),
    );
    const padX = Math.max(PAD_X_MIN, Math.round(width * PAD_X_RATIO));

    // The vertical budget is measured, not guessed: whatever sits above the
    // stage (top bar, chapter song) plus the footer below it.
    const stageTop = Math.max(0, stage?.getBoundingClientRect().top ?? 0);
    const footer = footerRef.current;
    const footerH = footer
      ? footer.offsetHeight +
        parseFloat(getComputedStyle(footer).marginTop || "0")
      : 60;
    const height = Math.max(
      PAGE_MIN_HEIGHT,
      (winH ?? 800) - stageTop - footerH - 24,
    );
    const padY = Math.max(PAD_Y_MIN, Math.round(height * PAD_Y_RATIO));

    return {
      contentH: Math.max(80, height - padY * 2),
      contentW: Math.max(120, width - padX * 2),
      height,
      padX,
      padY,
      width,
    };
    // Recomputed whenever the window moves; `measureTick` also forces it after
    // the stage itself resizes (the nav sliding out, say).
  }, [winW, winH, twoUp]);

  /** Bumped to force a re-measure when something other than the window moves. */
  const [measureTick, setMeasureTick] = useState(0);
  const [pageMap, setPageMap] = useState<PageMap>(EMPTY_PAGE_MAP);

  /**
   * Cut the flow into pages.
   *
   * Runs against the hidden copy below, which is laid out at exactly the
   * page's measure. Deferred to an animation frame so rich text, images and
   * web fonts have landed before anything is measured — a cut taken over a
   * half-loaded image is a cut in the wrong place.
   */
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    let frame = 0;
    const run = () => {
      const measured = measureRef.current;
      if (!measured) return;
      setPageMap(paginate(measured, geometry.contentH));
    };
    frame = requestAnimationFrame(run);

    // Anything that changes the flow's height changes where the pages fall.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    });
    observer.observe(root);
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    });
    mutations.observe(root, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [geometry.contentH, measureTick]);

  const pages = pageMap.pages;
  /** Pages of the *loaded* run. The chapter may hold more either side. */
  const pageCount = Math.max(1, pages.length);
  const perSpread = twoUp ? 2 : 1;
  const spreadCount = Math.max(1, Math.ceil(pageCount / perSpread));

  const hasMoreBefore = startIndex > 0;
  const hasMoreAfter = startIndex + threads.length < totalThreads;

  /** The page each loaded passage opens on, by global passage index. */
  const pageOfThread = useMemo(() => {
    const map = new Map<number, number>();
    const indexOfKey = new Map<string, number>();
    for (const item of items) {
      if (item.kind === "thread") indexOfKey.set(item.key, item.index);
    }
    for (const page of pages) {
      for (const entry of page.items) {
        if (!entry.starts) continue;
        const index = indexOfKey.get(entry.key);
        if (index !== undefined && !map.has(index)) {
          map.set(index, page.index + 1);
        }
      }
    }
    return map;
  }, [items, pages]);

  // The stage's own width changes independently of window resizes — the
  // shared layout's nav sliding out as book mode opens, say. Geometry is
  // derived from it, so a stage resize has to re-derive it.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => setMeasureTick((n) => n + 1));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // ── Resolve a pending jump against the freshly cut pages ───────────
  useEffect(() => {
    const pending = pendingRef.current;
    if (pending?.type === "target") {
      const page = pageOfThread.get(pending.index);
      // Stays pending: the passage may not be fetched yet, and content that
      // loads late can repack the chapter again.
      if (page !== undefined) {
        setSpread(
          Math.min(Math.floor((page - 1) / perSpread), spreadCount - 1),
        );
      }
      return;
    }
    setSpread((current) => Math.min(current, spreadCount - 1));
  }, [pageOfThread, spreadCount, perSpread]);

  // ── Pull more of the chapter in at the ends ─────────────────────────────
  // The book only knows the pages of what it has loaded — page numbers are cut
  // from this run, not from the whole chapter — so the trigger is reaching an
  // end of that run rather than a page number outside it.
  useEffect(() => {
    if (loadingEdge !== null || busyRef.current) return;
    if (pages.length === 0) return;

    const pull = async (
      edge: "before" | "after",
      load: () => Promise<boolean>,
    ) => {
      busyRef.current = true;
      setLoadingEdge(edge);
      await load();
      busyRef.current = false;
      setLoadingEdge(null);
    };

    if (spread <= 0 && hasMoreBefore && onNeedBefore) {
      pull("before", onNeedBefore);
    } else if (spread >= spreadCount - 1 && hasMoreAfter && onNeedAfter) {
      pull("after", onNeedAfter);
    }
  }, [
    spread,
    spreadCount,
    pages.length,
    hasMoreBefore,
    hasMoreAfter,
    loadingEdge,
    onNeedBefore,
    onNeedAfter,
  ]);

  // Snap to a passage on demand (e.g. "go to bookmark" while the book is
  // open). The sticky target keeps re-snapping until the reader turns a page.
  useEffect(() => {
    if (!jumpRequest) return;
    pendingRef.current = { index: jumpRequest.index, type: "target" };
    const page = pageOfThread.get(jumpRequest.index);
    if (page !== undefined) {
      setSpread(Math.min(Math.floor((page - 1) / perSpread), spreadCount - 1));
    }
  }, [jumpRequest, pageOfThread, spreadCount, perSpread]);

  // `targetIndex` often lands after mount (the page-level bookmark/thread
  // fetch resolves after this component's own gating condition does), so the
  // `pendingRef` lazy-init above can miss it entirely. Re-arm whenever a new
  // target value shows up, same as an explicit jumpRequest.
  useEffect(() => {
    if (targetIndex == null) return;
    if (
      pendingRef.current?.type === "target" &&
      pendingRef.current.index === targetIndex
    )
      return;
    pendingRef.current = { index: targetIndex, type: "target" };
  }, [targetIndex]);

  // Report the passage the reader is on: the last one that starts at or before
  // the left page (it is the one flowing across this spread).
  useEffect(() => {
    if (!onPositionChange) return;
    if (pageOfThread.size === 0) return;

    const leftPage = spread * perSpread + 1;
    const rightPage = leftPage + perSpread - 1;
    let spanning: number | null = null;
    let starting: number | null = null;
    for (const [index, page] of Array.from(pageOfThread.entries()).sort(
      (a, b) => a[0] - b[0],
    )) {
      if (page < leftPage) spanning = index;
      if (starting === null && page >= leftPage && page <= rightPage) {
        starting = index;
      }
    }
    onPositionChange(spanning ?? starting ?? startIndex);
  }, [spread, perSpread, pageOfThread, startIndex, onPositionChange]);

  /**
   * Turning is pure navigation now: the chapter's page count is known up front,
   * so a turn just moves the spread and the effect above pulls in whatever
   * passages the new pages need.
   */
  const turn = useCallback(
    (dir: 1 | -1) => {
      // A manual turn releases the sticky open-at-bookmark snap.
      if (pendingRef.current?.type === "target") pendingRef.current = null;
      setSpread((current) =>
        Math.min(Math.max(current + dir, 0), spreadCount - 1),
      );
    },
    [spreadCount],
  );

  // Arrow-key page turning.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (el instanceof HTMLElement && el.isContentEditable) return;
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn]);

  const atStart = spread <= 0 && !hasMoreBefore;
  const atEnd = spread >= spreadCount - 1 && !hasMoreAfter;
  const leftPage = spread * perSpread + 1;
  const rightPage = Math.min(leftPage + perSpread - 1, pageCount);

  const spreadW = geometry.width * perSpread + (twoUp ? SPINE_GAP : 0);
  const spreadH = geometry.height;

  const bookmarkPage =
    bookmarkIndex !== null ? pageOfThread.get(bookmarkIndex) : undefined;
  const bookmarkOnSpread =
    bookmarkPage !== undefined &&
    bookmarkPage >= leftPage &&
    bookmarkPage <= rightPage;
  const ribbonLeft =
    bookmarkPage === leftPage
      ? geometry.padX + 36
      : spreadW - geometry.padX - 60;

  const morePrefix = hasMoreBefore ? "…" : "";
  const moreSuffix = hasMoreAfter ? "+" : "";
  const pageLabel =
    loadingEdge !== null
      ? "Turning the page…"
      : pageCount <= 1 && !morePrefix && !moreSuffix
        ? "One page"
        : leftPage === rightPage
          ? `Page ${morePrefix}${leftPage} of ${pageCount}${moreSuffix}`
          : `Pages ${morePrefix}${leftPage}–${rightPage} of ${pageCount}${moreSuffix}`;

  /** The type the page is set in — one place, so the hidden copy that gets
   *  measured and the visible page can never disagree. */
  const flowStyle = {
    "--nw-page-media-max": `${geometry.contentH}px`,
    width: geometry.contentW,
  } as CSSProperties;

  /**
   * One half of the spread: the paper, and a clipped window onto the flow,
   * pushed up so this page's slice is what shows.
   *
   * Every half renders the same flow at the same offset arithmetic — there is
   * no measuring copy among them, because measuring happens once, off-screen,
   * for the whole spread.
   */
  const renderHalf = (pageNumber: number) => {
    const page = pages[pageNumber - 1];
    /**
     * A page can come out taller than the window it is shown in: a single
     * block bigger than a whole page (a full-bleed image, one enormous dialog)
     * has no legal cut inside it, so the paginator lets it overrun rather than
     * slicing it in half. The window clips, which would put the overrun out of
     * sight entirely — so that one page is scaled down to fit instead. Nothing
     * is ever hidden; at worst an outsized block is drawn smaller.
     */
    const fit =
      page && page.height > geometry.contentH
        ? geometry.contentH / page.height
        : 1;
    return (
      <S.BookSheet
        key={pageNumber}
        style={{
          height: geometry.height,
          padding: `${geometry.padY}px ${geometry.padX}px`,
          width: geometry.width,
        }}
      >
        <S.BookWindow
          style={{
            height: geometry.contentH,
            left: geometry.padX,
            top: geometry.padY,
            width: geometry.contentW,
          }}
        >
          {page && (
            <S.BookWindowInner
              aria-hidden
              style={{
                ...flowStyle,
                top: -page.top * fit,
                transform: fit < 1 ? `scale(${fit})` : undefined,
                transformOrigin: "top left",
              }}
            >
              <ChapterFlow
                items={items}
                event={event}
                hasThreads={threads.length > 0}
                bookmarkIndex={bookmarkIndex}
              />
            </S.BookWindowInner>
          )}
        </S.BookWindow>
        {page && (
          <S.BookPageNumber style={{ bottom: geometry.padY / 3 }}>
            {pageNumber}
          </S.BookPageNumber>
        )}
      </S.BookSheet>
    );
  };

  return (
    <S.BookStage ref={stageRef}>
      {/* The copy the pages are cut from. Laid out at exactly the page's
          measure, off-screen, so the cuts it yields are the cuts the visible
          pages show. */}
      <S.BookMeasureLayer aria-hidden>
        <div ref={measureRef} style={flowStyle}>
          <ChapterFlow
            items={items}
            event={event}
            hasThreads={threads.length > 0}
            bookmarkIndex={bookmarkIndex}
          />
        </div>
      </S.BookMeasureLayer>

      <S.Spread style={{ height: spreadH, width: spreadW }}>
        <S.PageEdgeButton
          $side="left"
          onClick={() => turn(-1)}
          disabled={atStart || loadingEdge !== null}
          aria-label="Previous page"
        >
          <IoChevronBack />
        </S.PageEdgeButton>

        <S.BookPages
          style={{
            columnGap: SPINE_GAP,
            height: spreadH,
            width: spreadW,
          }}
        >
          {Array.from({ length: perSpread }, (_, offset) =>
            renderHalf(leftPage + offset),
          )}
        </S.BookPages>

        {/* Soft gutter shadow at the fold. */}
        <S.Spine />

        {/* Ribbon marking the page that holds the bookmarked passage. */}
        {bookmarkOnSpread && <S.BookmarkRibbon style={{ left: ribbonLeft }} />}

        {/* Paper "reveal" curtains: on each turn the pages swap underneath
            these opaque halves, which then wipe away from the top — left page
            first, then the right — so the new text fades in rather than the old
            page ever being seen leaving. Keyed by `spread` so the animation
            retriggers on every turn. */}
        <S.PageReveal
          key={`reveal-left-${spread}`}
          style={{
            height: spreadH,
            left: 0,
            top: 0,
            width: spreadW / perSpread,
          }}
        />
        {twoUp && (
          <S.PageReveal
            key={`reveal-right-${spread}`}
            $delayed
            style={{
              height: spreadH,
              left: spreadW / perSpread,
              top: 0,
              width: spreadW / perSpread,
            }}
          />
        )}

        {/* Fore-edge page blocks: a visual cue that more pages wait on that
            side — hidden at the very first/last page. */}
        {!atStart && <S.PageStack $side="left" />}
        {!atEnd && <S.PageStack $side="right" />}

        {/* Turning to a page outside the loaded window has to fetch the next
            chunk of threads first — cover the (possibly stale) spread with a
            page-shaped shimmer until it resolves. */}
        {loadingEdge !== null && (
          <S.BookLoadingShimmer style={{ height: spreadH, width: spreadW }}>
            {Array.from({ length: perSpread }, (_, half) => (
              <S.BookShimmerPage key={half}>
                {SHIMMER_LINE_WIDTHS.map((width, i) => (
                  <S.BookShimmerLine key={width + i} $width={width} />
                ))}
              </S.BookShimmerPage>
            ))}
          </S.BookLoadingShimmer>
        )}

        <S.PageEdgeButton
          $side="right"
          onClick={() => turn(1)}
          disabled={atEnd || loadingEdge !== null}
          aria-label="Next page"
        >
          <IoChevronForward />
        </S.PageEdgeButton>
      </S.Spread>

      <S.BookFooter ref={footerRef}>
        <S.PagerButton
          onClick={() => turn(-1)}
          disabled={atStart || loadingEdge !== null}
          aria-label="Previous page"
        >
          <IoChevronBack />
        </S.PagerButton>
        <S.PageIndicator>{pageLabel}</S.PageIndicator>
        <S.PagerButton
          onClick={() => turn(1)}
          disabled={atEnd || loadingEdge !== null}
          aria-label="Next page"
        >
          <IoChevronForward />
        </S.PagerButton>
        {bookmarkIndex !== null && onGoToBookmark && (
          <S.BookmarkPagerButton
            onClick={onGoToBookmark}
            disabled={loadingEdge !== null}
            aria-label="Go to your bookmark"
            title="Go to your bookmark"
          >
            <FaBookmark />
          </S.BookmarkPagerButton>
        )}
      </S.BookFooter>
    </S.BookStage>
  );
};
