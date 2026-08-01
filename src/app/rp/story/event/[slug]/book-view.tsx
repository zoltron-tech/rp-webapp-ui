"use client";

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
import { contentHeight, contentWidth, resolvePageSpec } from "@/lib/paginator";
import type { StoryBoardEvent, StoryBoardEventThread } from "@/types";
import {
  ChapterFlow,
  pageAtOffset,
  useChapterPages,
  useFlowItems,
  useMeasuredHeights,
} from "./chapter-pages";
import * as S from "./styles";

/** Gutter between the two halves of the spread, in design pixels. */
const SPINE_GAP = 0;

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
  /** The story's page geometry preset — the same one the manuscript uses. */
  pageFormat?: string | null;
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
 * Pages come from the shared packer in `chapter-pages` — the same model the
 * scrolling manuscript renders — so page 7 in the book is page 7 in the
 * manuscript, cut in exactly the place the author was shown while writing.
 * Each half of the spread is a window onto that packed flow, pushed up to its
 * own page offset; nothing is re-flowed here, so the book cannot invent a
 * break the author never saw.
 */
export const BookView: FC<Props> = ({
  event,
  pageFormat,
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
  const spec = resolvePageSpec(pageFormat);
  const pageW = contentWidth(spec);
  const pageH = contentHeight(spec);
  const designWidth = spec.width * 2 + SPINE_GAP;
  const designHeight = spec.height;

  const stageRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<Pending | null>(
    targetIndex != null && targetIndex > 0
      ? { index: targetIndex, type: "target" }
      : null,
  );
  const busyRef = useRef(false);

  const { width: winW, height: winH } = useWindowDimensions();

  const [spread, setSpread] = useState(0);
  const [scale, setScale] = useState(0);
  const [loadingEdge, setLoadingEdge] = useState<"before" | "after" | null>(
    null,
  );

  const { heights, reportHeight } = useMeasuredHeights();
  const items = useFlowItems(threads, startIndex);
  // The book paginates the whole chapter from the heights frozen on the server,
  // so its page numbers are the chapter's — the same ones the manuscript shows.
  const { packed } = useChapterPages({
    canReport: false,
    measured: heights,
    pageFormat: spec.value,
    pageHeight: pageH,
    storyboardEventId: event.id ?? "",
  });

  const pageCount = packed.totalPages;
  const spreadCount = Math.max(1, Math.ceil(pageCount / 2));

  const hasMoreBefore = startIndex > 0;
  const hasMoreAfter = startIndex + threads.length < totalThreads;

  /** Where this window's passages sit in the chapter, and which pages they cover. */
  const flowTop = items.length ? (packed.topOfItem.get(items[0].key) ?? 0) : 0;
  const loadedFirstPage = items.length
    ? (packed.pageOfItem.get(items[0].key) ?? 1)
    : 1;
  const loadedLastPage = items.length
    ? pageAtOffset(
        packed,
        (packed.topOfItem.get(items[items.length - 1].key) ?? 0) +
          (heights[items[items.length - 1].key] ?? 0) -
          1,
      )
    : 1;

  /** Page number each loaded passage opens on, by global passage index. */
  const pageOfThread = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of items) {
      if (item.kind !== "thread") continue;
      const page = packed.pageOfItem.get(item.key);
      if (page !== undefined) map.set(item.index, page);
    }
    return map;
  }, [items, packed.pageOfItem]);

  // ── Fit the spread to whatever room is left on screen ────────────────────
  const recomputeScale = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // The vertical budget is measured, not guessed: everything above the stage
    // (top bar + chapter song) is whatever sits between the viewport top and
    // the stage, and everything below is the footer plus a breathing gap.
    const availW = stage.clientWidth || designWidth;
    const stageTop = Math.max(0, stage.getBoundingClientRect().top);
    const footer = footerRef.current;
    const footerH = footer
      ? footer.offsetHeight +
        parseFloat(getComputedStyle(footer).marginTop || "0")
      : 60;
    const availH = Math.max(360, (winH ?? 800) - stageTop - footerH - 24);
    setScale(
      Math.min(
        2.6,
        Math.max(0.4, Math.min(availW / designWidth, availH / designHeight)),
      ),
    );
  }, [designWidth, designHeight, winH]);

  useLayoutEffect(() => {
    recomputeScale();
  }, [recomputeScale, winW]);

  // The stage's own width changes independently of window resizes too — e.g.
  // the shared layout's LeftNav/RightSidebar sliding out over ~300ms as book
  // mode opens. Track the stage directly so scale grows in step with that.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => recomputeScale());
    observer.observe(stage);
    return () => observer.disconnect();
  }, [recomputeScale]);

  // ── Resolve a pending jump against the freshly packed chapter ───────────
  useEffect(() => {
    const pending = pendingRef.current;
    if (pending?.type === "target") {
      const page = pageOfThread.get(pending.index);
      // Stays pending: the passage may not be fetched yet, and content that
      // loads late can repack the chapter again.
      if (page !== undefined) {
        setSpread(Math.min(Math.floor((page - 1) / 2), spreadCount - 1));
      }
      return;
    }
    setSpread((current) => Math.min(current, spreadCount - 1));
  }, [pageOfThread, spreadCount]);

  // ── Keep the open spread's passages loaded ──────────────────────────────
  // The book knows how many pages the chapter has before it has fetched them,
  // so turning to a page outside the loaded window simply pulls that window
  // along — a chunk at a time until the spread is covered.
  useEffect(() => {
    if (loadingEdge !== null || busyRef.current) return;
    const left = spread * 2 + 1;
    const right = left + 1;

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

    if (left < loadedFirstPage && hasMoreBefore && onNeedBefore) {
      pull("before", onNeedBefore);
    } else if (right > loadedLastPage && hasMoreAfter && onNeedAfter) {
      pull("after", onNeedAfter);
    }
  }, [
    spread,
    loadedFirstPage,
    loadedLastPage,
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
      setSpread(Math.min(Math.floor((page - 1) / 2), spreadCount - 1));
    }
  }, [jumpRequest, pageOfThread, spreadCount]);

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

    const leftPage = spread * 2 + 1;
    const rightPage = leftPage + 1;
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
  }, [spread, pageOfThread, startIndex, onPositionChange]);

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

  const atStart = spread <= 0;
  const atEnd = spread >= spreadCount - 1;
  const leftPage = spread * 2 + 1;
  const rightPage = Math.min(leftPage + 1, pageCount);

  const stageW = designWidth * scale;
  const stageH = designHeight * scale;

  const bookmarkPage =
    bookmarkIndex !== null ? pageOfThread.get(bookmarkIndex) : undefined;
  const bookmarkOnSpread =
    bookmarkPage !== undefined &&
    (bookmarkPage === leftPage || bookmarkPage === rightPage);
  const ribbonLeft =
    bookmarkPage === leftPage ? spec.padX + 36 : designWidth - spec.padX - 60;

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

  /**
   * One half of the spread: the paper, and a window showing the slice of the
   * chapter that belongs to `pageNumber`. The left half carries the measuring
   * copy of the flow — its heights are what the packer runs on.
   */
  const renderHalf = (pageNumber: number, measuring: boolean) => {
    const top = packed.pageTops[pageNumber - 1] ?? 0;
    const beyondEnd = pageNumber > pageCount;
    // A page whose passages are not fetched yet has nothing to frame; the
    // effect below is already pulling them in.
    const unloaded =
      pageNumber < loadedFirstPage || pageNumber > loadedLastPage;
    return (
      <S.BookSheet
        style={{
          height: spec.height,
          padding: `${spec.padY}px ${spec.padX}px`,
          width: spec.width,
        }}
      >
        <S.BookWindow
          style={{
            height: pageH,
            left: spec.padX,
            top: spec.padY,
            width: pageW,
          }}
        >
          {!beyondEnd && (!unloaded || measuring) && (
            <S.BookWindowInner
              aria-hidden={!measuring}
              style={
                {
                  "--nw-page-media-max": `${pageH}px`,
                  fontSize: spec.fontSize,
                  lineHeight: spec.lineHeight,
                  // The flow holds only the loaded passages, so it is placed
                  // where they sit in the chapter, not at zero.
                  top: flowTop - top,
                  width: pageW,
                } as CSSProperties
              }
            >
              <ChapterFlow
                items={items}
                packed={packed}
                event={event}
                hasThreads={threads.length > 0}
                pageHeight={pageH}
                scale={scale || 1}
                onHeight={measuring ? reportHeight : undefined}
                bookmarkIndex={bookmarkIndex}
              />
            </S.BookWindowInner>
          )}
        </S.BookWindow>
        {!beyondEnd && (
          <S.BookPageNumber style={{ bottom: spec.padY / 3 }}>
            {pageNumber}
          </S.BookPageNumber>
        )}
      </S.BookSheet>
    );
  };

  return (
    <S.BookStage ref={stageRef}>
      <S.Spread
        style={{
          aspectRatio: `${designWidth} / ${designHeight}`,
          height: stageH || undefined,
          width: stageW || undefined,
        }}
      >
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
            height: designHeight,
            transform: `scale(${scale || 1})`,
            visibility: scale > 0 ? undefined : "hidden",
            width: designWidth,
          }}
        >
          {renderHalf(leftPage, true)}
          {renderHalf(leftPage + 1, false)}
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
            height: designHeight * (scale || 1),
            left: 0,
            top: 0,
            width: (designWidth / 2) * (scale || 1),
          }}
        />
        <S.PageReveal
          key={`reveal-right-${spread}`}
          $delayed
          style={{
            height: designHeight * (scale || 1),
            left: (designWidth / 2) * (scale || 1),
            top: 0,
            width: (designWidth / 2) * (scale || 1),
          }}
        />

        {/* Fore-edge page blocks: a visual cue that more pages wait on that
            side — hidden at the very first/last page. */}
        {!atStart && <S.PageStack $side="left" />}
        {!atEnd && <S.PageStack $side="right" />}

        {/* Turning to a page outside the loaded window has to fetch the next
            chunk of threads first — cover the (possibly stale) spread with a
            page-shaped shimmer until it resolves. */}
        {loadingEdge !== null && (
          <S.BookLoadingShimmer
            style={{ height: stageH || undefined, width: stageW || undefined }}
          >
            <S.BookShimmerPage>
              {SHIMMER_LINE_WIDTHS.map((width, i) => (
                <S.BookShimmerLine key={i} $width={width} />
              ))}
            </S.BookShimmerPage>
            <S.BookShimmerPage>
              {SHIMMER_LINE_WIDTHS.map((width, i) => (
                <S.BookShimmerLine key={i} $width={width} />
              ))}
            </S.BookShimmerPage>
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
