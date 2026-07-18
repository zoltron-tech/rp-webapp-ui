"use client";

import {
  type FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BsCalendar2Date } from "react-icons/bs";
import { FaBookmark } from "react-icons/fa6";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { TfiLocationPin } from "react-icons/tfi";
import { resolveAsterismStyle } from "@/components/asterism-styles";
import { CoverImage } from "@/components/common";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { useWindowDimensions } from "@/hooks";
import type { StoryBoardEvent, StoryBoardEventThread } from "@/types";
import { toFormattedDate } from "@/utils/helpers";
import { EventThread } from "./event-thread";
import * as S from "./styles";
import { ShouldRender } from "@novelist-world/ui";

/* ── Fixed design geometry ────────────────────────────────────────────────
   The book is always laid out at these exact pixel dimensions and then the
   whole page is visually scaled to fit the screen. Because the layout never
   changes, the number of words per line — and where every page breaks — is
   identical on every monitor. */
const COLUMN_GAP = 60;
const DESIGN_COL_WIDTH = 430;
/** Must match the `ScaledPage` padding in styles.ts. */
const DESIGN_PAD_X = 60;
const DESIGN_PAD_Y = 52;
const DESIGN_FLOW_WIDTH = DESIGN_COL_WIDTH * 2 + COLUMN_GAP;
const DESIGN_STAGE_WIDTH = DESIGN_FLOW_WIDTH + DESIGN_PAD_X * 2;
const DESIGN_FLOW_HEIGHT = 556;
const DESIGN_STAGE_HEIGHT = DESIGN_FLOW_HEIGHT + DESIGN_PAD_Y * 2;
/** Width of one page half — from the outer edge to the spine (the center). */
const DESIGN_HALF_WIDTH = DESIGN_STAGE_WIDTH / 2;
const PITCH = DESIGN_COL_WIDTH + COLUMN_GAP;

/** Column a thread starts on, per loaded thread (global index → column). */
type ThreadColumn = { index: number; col: number };

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

type Pending =
  /** Keep snapping to the thread the reader opened at (sticky until the
      reader turns a page — late-loading images can reflow the columns). */
  | { type: "target"; index: number }
  /** A next-page turn that had to fetch more threads first. */
  | { type: "advance"; fromSpread: number }
  /** A previous-page turn that had to fetch earlier threads first. */
  | { type: "retreat"; anchorIndex: number };

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
 * Paginated "book" reader. The whole event (title page → narration → passages)
 * is laid out as a single CSS multi-column flow at a fixed design size; the
 * stage is then scaled as one unit to fit the screen, so typography and page
 * breaks are identical regardless of monitor size. Turning a page past either
 * end of the loaded window fetches the neighbouring chunk of threads first.
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
  const flowRef = useRef<HTMLDivElement>(null);
  const threadColsRef = useRef<ThreadColumn[]>([]);
  const pendingRef = useRef<Pending | null>(
    targetIndex != null && targetIndex > 0
      ? { index: targetIndex, type: "target" }
      : null,
  );
  const busyRef = useRef(false);

  const { width: winW, height: winH } = useWindowDimensions();

  const [spread, setSpread] = useState(0);
  const [spreadCount, setSpreadCount] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [scale, setScale] = useState(0);
  const [loadingEdge, setLoadingEdge] = useState<"before" | "after" | null>(
    null,
  );
  // Bumped after every geometry pass so position reporting sees fresh columns.
  const [layoutVersion, setLayoutVersion] = useState(0);

  const hasMoreBefore = startIndex > 0;
  const hasMoreAfter = startIndex + threads.length < totalThreads;

  const overtureAsterism = resolveAsterismStyle(event.overtureAsterism);
  const passageAsterism = resolveAsterismStyle(event.passageAsterism);

  const recompute = useCallback(() => {
    const flow = flowRef.current;
    const stage = stageRef.current;
    if (!flow || !stage) return;

    // Fit the fixed-size page into the available box, preserving its aspect.
    // The vertical budget is measured, not guessed: everything above the stage
    // (top bar + chapter song) is whatever sits between the viewport top and
    // the stage, and everything below is the footer plus the page's own bottom
    // padding. Reserving the real chrome keeps header + song + book + nav all
    // on one screen at 100% zoom instead of pushing the footer past the fold.
    const availW = stage.clientWidth || DESIGN_STAGE_WIDTH;
    const stageTop = Math.max(0, stage.getBoundingClientRect().top);
    const footer = footerRef.current;
    const footerH = footer
      ? footer.offsetHeight +
        parseFloat(getComputedStyle(footer).marginTop || "0")
      : 60;
    // Only a small breathing gap below the footer is reserved (not the page's
    // full bottom padding), so the book fills as much height as it can.
    const availH = Math.max(360, (winH ?? 800) - stageTop - footerH - 24);
    setScale(
      Math.min(
        2.6,
        Math.max(
          0.4,
          Math.min(availW / DESIGN_STAGE_WIDTH, availH / DESIGN_STAGE_HEIGHT),
        ),
      ),
    );

    // The flow's geometry is fixed, so only the flowed length can change.
    const total = flow.scrollWidth;
    const cols = Math.max(1, Math.round((total + COLUMN_GAP) / PITCH));
    const spreads = Math.max(1, Math.ceil(cols / 2));

    // Record which column each thread starts on (offsetLeft is measured in
    // the flow's own, unscaled coordinate space).
    threadColsRef.current = Array.from(
      flow.querySelectorAll<HTMLElement>("[data-thread-index]"),
    ).map((el) => ({
      col: Math.round(el.offsetLeft / PITCH),
      index: Number(el.dataset.threadIndex),
    }));

    setPageCount(cols);
    setSpreadCount(spreads);

    const colOf = (index: number) =>
      threadColsRef.current.find((t) => t.index === index)?.col;

    const pending = pendingRef.current;
    if (pending?.type === "target") {
      const col = colOf(pending.index);
      if (col != null) {
        setSpread(Math.min(Math.floor(col / 2), spreads - 1));
      }
      // stays pending: content that loads late may shift the columns again
    } else if (pending?.type === "advance") {
      // Only resolve once the fetched threads actually grew the book.
      if (spreads - 1 > pending.fromSpread) {
        setSpread(pending.fromSpread + 1);
        pendingRef.current = null;
      }
    } else if (pending?.type === "retreat") {
      // Only resolve once threads before the anchor are laid out.
      const hasEarlier = threadColsRef.current.some(
        (t) => t.index < pending.anchorIndex,
      );
      if (hasEarlier) {
        const col = colOf(pending.anchorIndex);
        const anchorSpread = col != null ? Math.floor(col / 2) : 1;
        setSpread(Math.max(anchorSpread - 1, 0));
        pendingRef.current = null;
      }
    } else {
      setSpread((s) => Math.min(s, spreads - 1));
    }

    setLayoutVersion((v) => v + 1);
  }, [winH]);

  // Recompute geometry on mount, on resize, and when the window of loaded
  // threads changes.
  useLayoutEffect(() => {
    recompute();
  }, [recompute, winW, threads.length, startIndex, event.id]);

  // The rich-text renderer injects its HTML after paint, and images/embeds
  // change the flowed width once they load. Re-measure whenever the flow's
  // contents actually change, plus on image load and a settle pass for fonts.
  useEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(flow, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    const onLoad = () => schedule();
    flow.addEventListener("load", onLoad, true); // capture: <img> load doesn't bubble

    const settle = setTimeout(recompute, 400);

    return () => {
      observer.disconnect();
      flow.removeEventListener("load", onLoad, true);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [recompute, threads.length, event.id]);

  // Snap to a thread on demand (e.g. "go to bookmark" while the book is
  // open). The sticky target keeps re-snapping until the reader turns a page.
  useEffect(() => {
    if (!jumpRequest) return;
    pendingRef.current = { index: jumpRequest.index, type: "target" };
    recompute();
  }, [jumpRequest, recompute]);

  // Report the thread the reader is on: the last thread that starts at or
  // before the current left page (it is the one flowing across this spread).
  useEffect(() => {
    if (!onPositionChange) return;
    const map = threadColsRef.current;
    if (map.length === 0) return;

    const leftCol = spread * 2;
    const rightCol = leftCol + 1;
    let spanning: number | null = null;
    let starting: number | null = null;
    for (const t of map) {
      if (t.col < leftCol) spanning = t.index;
      if (starting == null && t.col >= leftCol && t.col <= rightCol) {
        starting = t.index;
      }
    }
    onPositionChange(spanning ?? starting ?? startIndex);
  }, [spread, layoutVersion, startIndex, onPositionChange]);

  const turn = useCallback(
    async (dir: 1 | -1) => {
      if (busyRef.current) return;
      // A manual turn releases the sticky open-at-bookmark snap.
      if (pendingRef.current?.type === "target") pendingRef.current = null;

      if (dir === 1) {
        if (spread < spreadCount - 1) {
          setSpread(spread + 1);
          return;
        }
        if (!hasMoreAfter || !onNeedAfter) return;
        busyRef.current = true;
        setLoadingEdge("after");
        pendingRef.current = { fromSpread: spread, type: "advance" };
        const loaded = await onNeedAfter();
        if (!loaded) pendingRef.current = null;
        busyRef.current = false;
        setLoadingEdge(null);
      } else {
        if (spread > 0) {
          setSpread(spread - 1);
          return;
        }
        if (!hasMoreBefore || !onNeedBefore) return;
        busyRef.current = true;
        setLoadingEdge("before");
        pendingRef.current = { anchorIndex: startIndex, type: "retreat" };
        const loaded = await onNeedBefore();
        if (!loaded) pendingRef.current = null;
        busyRef.current = false;
        setLoadingEdge(null);
      }
    },
    [
      spread,
      spreadCount,
      hasMoreAfter,
      hasMoreBefore,
      onNeedAfter,
      onNeedBefore,
      startIndex,
    ],
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
  const leftPage = spread * 2 + 1;
  const rightPage = Math.min(leftPage + 1, pageCount);

  const stageW = DESIGN_STAGE_WIDTH * scale;
  const stageH = DESIGN_STAGE_HEIGHT * scale;

  // Ribbon over the page half where the bookmarked passage starts (fresh
  // after every layout pass — `layoutVersion` re-renders us).
  const bookmarkCol =
    bookmarkIndex !== null
      ? threadColsRef.current.find((t) => t.index === bookmarkIndex)?.col
      : undefined;
  const bookmarkOnSpread =
    bookmarkCol !== undefined &&
    bookmarkCol >= spread * 2 &&
    bookmarkCol <= spread * 2 + 1;
  const ribbonLeft =
    bookmarkCol !== undefined && bookmarkCol % 2 === 0
      ? DESIGN_PAD_X + 36
      : DESIGN_STAGE_WIDTH - DESIGN_PAD_X - 60;

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

  return (
    <S.BookStage ref={stageRef}>
      <S.Spread style={{ height: stageH, width: stageW || undefined }}>
        <S.PageEdgeButton
          $side="left"
          onClick={() => turn(-1)}
          disabled={atStart || loadingEdge !== null}
          aria-label="Previous page"
        >
          <IoChevronBack />
        </S.PageEdgeButton>

        <S.ScaledPage
          style={{
            height: DESIGN_STAGE_HEIGHT,
            transform: `scale(${scale || 1})`,
            visibility: scale > 0 ? undefined : "hidden",
            width: DESIGN_STAGE_WIDTH,
          }}
        >
          <S.Flow
            ref={flowRef}
            $offset={spread * 2 * PITCH}
            style={{
              columnGap: `${COLUMN_GAP}px`,
              columnWidth: `${DESIGN_COL_WIDTH}px`,
              height: DESIGN_FLOW_HEIGHT,
              width: DESIGN_FLOW_WIDTH,
            }}
          >
            {startIndex === 0 ? (
              <>
                <S.BookTitleBlock>
                  {event.image && (
                    <S.BookCoverFrame>
                      <CoverImage src={event.image} nwImage={event.avatar} />
                    </S.BookCoverFrame>
                  )}
                  <S.EyebrowRule>Chapter</S.EyebrowRule>
                  <S.BookEventTitle>{event.name}</S.BookEventTitle>
                  <S.MetaRow>
                    {event.eventTime && (
                      <span className="meta">
                        <BsCalendar2Date size={13} />
                        {toFormattedDate(event.eventTime)}
                      </span>
                    )}
                    {event.location && (
                      <span className="meta">
                        <TfiLocationPin size={13} />
                        {event.location}
                      </span>
                    )}
                  </S.MetaRow>
                  {overtureAsterism.value !== "none" && (
                    <S.Asterism $tight $variant={overtureAsterism.lineVariant}>
                      <span className="glyph">{overtureAsterism.glyph}</span>
                    </S.Asterism>
                  )}
                </S.BookTitleBlock>

                <div className="book-overture">
                  <ShouldRender if={Boolean(event?.description && event?.description.length > 0)}>
                  <RichTextRenderer
                    savedText={event.description ?? ""}
                    disableCollapse
                  />
                  </ShouldRender>
                </div>
              </>
            ) : (
              // Mid-story window: a slim continuation header instead of the
              // full title page (the earlier pages are a turn away).
              <S.BookTitleBlock>
                <S.EyebrowRule>Continued</S.EyebrowRule>
                <S.BookEventTitle as="h2">{event.name}</S.BookEventTitle>
              </S.BookTitleBlock>
            )}

            {threads.map((thread, i) => (
              <div
                key={thread.id ?? startIndex + i}
                data-thread-index={startIndex + i}
              >
                {passageAsterism.value !== "none" && (
                  <S.Asterism $tight $variant={passageAsterism.lineVariant}>
                    <span className="glyph">{passageAsterism.glyph}</span>
                  </S.Asterism>
                )}
                <EventThread
                  thread={thread}
                  canManage={false}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  variant="book"
                />
              </div>
            ))}
          </S.Flow>

          {/* Soft gutter shadow at the fold. */}
          <S.Spine />

          {/* Ribbon marking the page that holds the bookmarked passage. */}
          {bookmarkOnSpread && (
            <S.BookmarkRibbon style={{ left: ribbonLeft }} />
          )}

          {/* Paper "reveal" curtains: on each turn the flow jumps to the new
              spread underneath these opaque halves, which then wipe away from
              the top — left page first, then the right — so the new text fades
              in rather than the old page ever being seen leaving. Keyed by
              `spread` so the animation retriggers on every turn. */}
          <S.PageReveal
            key={`reveal-left-${spread}`}
            style={{
              height: DESIGN_STAGE_HEIGHT,
              left: 0,
              top: 0,
              width: DESIGN_HALF_WIDTH,
            }}
          />
          <S.PageReveal
            key={`reveal-right-${spread}`}
            $delayed
            style={{
              height: DESIGN_STAGE_HEIGHT,
              left: DESIGN_HALF_WIDTH,
              top: 0,
              width: DESIGN_HALF_WIDTH,
            }}
          />
        </S.ScaledPage>

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
