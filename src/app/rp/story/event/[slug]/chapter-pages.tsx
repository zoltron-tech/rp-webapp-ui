"use client";

import { ShouldRender } from "@novelist-world/ui";
import type {
  ChapterPageLayout,
  StoryBoardEvent,
  StoryBoardEventThread,
} from "@nw/types";
import {
  type CSSProperties,
  type FC,
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BsCalendar2Date } from "react-icons/bs";
import { FaBookmark } from "react-icons/fa6";
import { TfiLocationPin } from "react-icons/tfi";
import { resolveAsterismStyle } from "@/components/asterism-styles";
import { CoverImage } from "@/components/common";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { toFormattedDate } from "@/utils/helpers";
import {
  getChapterPageLayoutAction,
  saveChapterPageMetricsAction,
} from "../../actions";
import { EventThread } from "./event-thread";
import * as S from "./styles";

/**
 * The chapter's page model — shared by the scrolling manuscript and the book
 * spread so both break the chapter in exactly the same places.
 *
 * The rules, in one place:
 *
 *  * Items (the title/overture block, then one per passage) are stacked at the
 *    story's page geometry and measured. Both readers render them through
 *    `ChapterItem` below, so a passage is the same height in either view — that
 *    identity is what makes the page numbers mean the same thing.
 *  * A page break falls between items: an item that would overrun the page it
 *    is on starts the next one instead.
 *  * An item taller than a page keeps its page and overruns it. The overrun
 *    still costs whole page numbers, so the manuscript marks it with a ghost
 *    break exactly where the book cuts the text.
 *  * The leftover space under the last item on a page is part of the model,
 *    not a rendering detail — it is why page N starts at the same offset in
 *    both readers.
 */

/** Height key for the composer, which is measured but never packed. */
export const COMPOSER_KEY = "__composer";

/** Height key for the in-place editor. Measured (so the passage's slot can be
 *  held open at the editor's size) but never packed, and never reported: it is
 *  the chrome around a passage, not the passage. */
export const EDITOR_KEY = "__editor";

/** Height key for the chapter's title/overture block (mirrors the backend). */
export const OVERTURE_KEY = "overture";

export type FlowItem =
  | { key: "overture"; kind: "overture" }
  | {
      key: string;
      kind: "thread";
      thread: StoryBoardEventThread;
      index: number;
    };

/** One page's worth of the flow, before the leftover space is added. */
export type PackedSheet = {
  keys: string[];
  /** Content height the items on this sheet use. */
  used: number;
  /** Where this sheet's first item sits in the stacked flow. */
  contentTop: number;
  /** Page numbers this sheet carries — more than one when it overruns. */
  span: number;
  startNumber: number;
  /** Blank space between the last item and the end of the sheet's last page. */
  leftover: number;
};

export type PackedChapter = {
  sheets: PackedSheet[];
  totalPages: number;
  /** Flow offset where each page starts, indexed by page number - 1. */
  pageTops: number[];
  /** Page number each item starts on, by item key. */
  pageOfItem: Map<string, number>;
  /** Sheet index each item was packed onto, by item key. */
  sheetOfItem: Map<string, number>;
  /** Offset of each item from the top of its sheet, by item key. Any item that
   *  spans pages starts a sheet, so this is 0 for everything that can straddle
   *  a break — which is what makes the keep-together pass stable. */
  offsetOfItem: Map<string, number>;
  /** Offset of each item from the top of the *chapter*, by item key. A reader
   *  holding only part of the chapter positions its flow with this. */
  topOfItem: Map<string, number>;
  totalContentHeight: number;
  /** Where the live composer sits, when the reader is writing one. */
  draft: {
    sheetIndex: number;
    /** Offset of the composer's top within its sheet. */
    startOffset: number;
    startPage: number;
    endPage: number;
    /** Blank space left on the composer's current page. */
    roomLeft: number;
  } | null;
};

/**
 * The items this client can actually render. The title/overture block belongs
 * to page one, so a window that starts mid-chapter leaves it out — rendering a
 * stand-in there would measure a height nobody else has and shift every page
 * after it.
 */
export const buildFlowItems = (
  threads: StoryBoardEventThread[],
  startIndex: number,
): FlowItem[] => [
  ...(startIndex === 0
    ? [{ key: OVERTURE_KEY, kind: "overture" } as FlowItem]
    : []),
  ...threads.map((thread, i) => ({
    index: startIndex + i,
    key: threadKey(String(thread.id ?? startIndex + i)),
    kind: "thread" as const,
    thread,
  })),
];

/** The page number an offset from the top of the chapter falls on. */
export const pageAtOffset = (packed: PackedChapter, offset: number): number => {
  let page = 1;
  for (let i = 0; i < packed.pageTops.length; i++) {
    if (packed.pageTops[i] <= offset) page = i + 1;
    else break;
  }
  return page;
};

/**
 * Packs measured items onto pages. Pure arithmetic — no DOM, no rendering, so
 * both readers can run it over the same heights and get the same answer.
 */
export const packChapter = ({
  keys: allKeys,
  heights,
  pageHeight,
  composerHeight = 0,
}: {
  /** Every item of the *whole chapter* in reading order — including passages
   *  this client has not loaded, so page numbers cover the chapter, not the
   *  chunk that happens to be on screen. */
  keys: string[];
  heights: Record<string, number>;
  pageHeight: number;
  composerHeight?: number;
}): PackedChapter => {
  const packed: { keys: string[]; used: number }[] = [{ keys: [], used: 0 }];
  for (const key of allKeys) {
    const height = heights[key] ?? 0;
    const current = packed[packed.length - 1];
    if (current.keys.length > 0 && current.used + height > pageHeight + 1) {
      packed.push({ keys: [key], used: height });
    } else {
      current.keys.push(key);
      current.used += height;
    }
  }
  // The composer belongs to the last page whatever it costs — it is where the
  // author is writing, and moving it would cost them their caret.
  packed[packed.length - 1].used += composerHeight;

  const sheets: PackedSheet[] = [];
  const pageTops: number[] = [];
  const pageOfItem = new Map<string, number>();
  const sheetOfItem = new Map<string, number>();
  const offsetOfItem = new Map<string, number>();
  const topOfItem = new Map<string, number>();

  let contentTop = 0;
  let pageNumber = 1;

  packed.forEach((page, sheetIndex) => {
    const span = Math.max(1, Math.ceil((page.used - 1) / pageHeight) || 1);
    const space = span * pageHeight;

    for (let step = 0; step < span; step++) {
      pageTops.push(contentTop + step * pageHeight);
    }

    // Which page each item opens on — the book uses this to turn to a passage.
    let cursor = 0;
    for (const key of page.keys) {
      pageOfItem.set(
        key,
        pageNumber + Math.min(span - 1, Math.floor(cursor / pageHeight)),
      );
      sheetOfItem.set(key, sheetIndex);
      offsetOfItem.set(key, cursor);
      topOfItem.set(key, contentTop + cursor);
      cursor += heights[key] ?? 0;
    }

    sheets.push({
      contentTop,
      keys: page.keys,
      leftover: space - page.used,
      span,
      startNumber: pageNumber,
      used: page.used,
    });

    pageNumber += span;
    contentTop += space;
  });

  const last = sheets[sheets.length - 1];
  const pageOfOffset = (offset: number) =>
    Math.min(last.span - 1, Math.floor(Math.max(0, offset - 1) / pageHeight));
  const startOffset = Math.max(0, last.used - composerHeight);

  return {
    draft: composerHeight
      ? {
          endPage: last.startNumber + pageOfOffset(last.used),
          roomLeft: Math.max(
            0,
            (pageOfOffset(last.used) + 1) * pageHeight - last.used,
          ),
          sheetIndex: sheets.length - 1,
          startOffset,
          startPage: last.startNumber + pageOfOffset(startOffset + 1),
        }
      : null,
    offsetOfItem,
    pageOfItem,
    pageTops,
    sheetOfItem,
    sheets,
    topOfItem,
    totalContentHeight: contentTop,
    totalPages: pageNumber - 1,
  };
};

/**
 * Things a page break must never cut through: an embedded muse dialog, an
 * image, or any other embedded media.
 */
const KEEP_TOGETHER_SELECTOR =
  ".dialog-embed, .inline-image-container, figure, img, video, iframe, canvas";

/** Block-level element a push is applied to, so the whole block travels. */
const BLOCK_SELECTOR = "p, div, figure, blockquote, li, section, table";

/**
 * Leaf text blocks (the editor writes one div per paragraph) shorter than this
 * fraction of a page are kept whole too — otherwise a break falling inside a
 * passage slices a line of prose in half, showing the top of the glyphs on one
 * page and the bottom on the next. Longer paragraphs keep flowing and the
 * break falls inside them: pushing those would leave page-sized holes.
 */
const KEEP_BLOCK_MAX_RATIO = 0.2;

/**
 * Pushes anything that would straddle a page break onto the next page.
 *
 * Word calls this keep-together. It runs on the item's real DOM (the rich text
 * is injected imperatively, so there is no declarative structure to reason
 * about) and is idempotent: every pass first restores the margins the previous
 * one added, then recomputes from scratch. Only items that start a sheet can
 * span pages, so the offsets this reads never move underneath it.
 */
export const applyKeepTogether = ({
  root,
  pageHeight,
  startOffset,
  scale,
}: {
  root: HTMLElement;
  pageHeight: number;
  startOffset: number;
  scale: number;
}) => {
  for (const pushed of Array.from(
    root.querySelectorAll<HTMLElement>("[data-nw-page-push]"),
  )) {
    pushed.style.marginTop = pushed.dataset.nwPagePush ?? "";
    delete pushed.dataset.nwPagePush;
  }
  if (pageHeight <= 0 || scale <= 0) return;

  // Every guard candidate in document order — order matters, because each
  // push moves everything after it and later rects are re-read.
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      `${KEEP_TOGETHER_SELECTOR}, ${BLOCK_SELECTOR}`,
    ),
  );

  for (const node of candidates) {
    const isProtected = node.matches(KEEP_TOGETHER_SELECTOR);
    if (isProtected) {
      // Only the outermost protected node travels; its insides come along.
      if (node.parentElement?.closest(KEEP_TOGETHER_SELECTOR)) continue;
    } else {
      // A leaf text block — one written line of the passage. Anything inside
      // a protected node is already covered by it, and container blocks are
      // handled through their own leaves.
      if (node.closest(KEEP_TOGETHER_SELECTOR)) continue;
      if (node.querySelector(BLOCK_SELECTOR)) continue;
      if (!(node.textContent ?? "").trim()) continue;
    }

    // Rects are re-read per node: an earlier push moved everything after it.
    const rootTop = root.getBoundingClientRect().top;
    const rect = node.getBoundingClientRect();
    const height = rect.height / scale;
    // Taller than its limit: no push can save it, and pushing would only
    // waste a page. It keeps flowing and the break falls inside it.
    const limit = isProtected ? pageHeight : pageHeight * KEEP_BLOCK_MAX_RATIO;
    if (height <= 0 || height > limit) continue;

    const top = (rect.top - rootTop) / scale + startOffset;
    const pageEnd = (Math.floor(top / pageHeight) + 1) * pageHeight;
    if (top + height <= pageEnd + 0.5) continue;

    const block = isProtected
      ? node.closest<HTMLElement>(BLOCK_SELECTOR)
      : node;
    const target =
      block && block !== root && root.contains(block) ? block : node;
    target.dataset.nwPagePush = target.style.marginTop;
    const current = parseFloat(getComputedStyle(target).marginTop) || 0;
    target.style.marginTop = `${current + (pageEnd - top)}px`;
  }
};

/** Collects the measured height of every flow item. */
export const useMeasuredHeights = () => {
  const [heights, setHeights] = useState<Record<string, number>>({});
  const reportHeight = useCallback((key: string, height: number) => {
    setHeights((prev) =>
      prev[key] === height ? prev : { ...prev, [key]: height },
    );
  }, []);
  return { heights, reportHeight };
};

/** The item key a passage id is measured and packed under. */
export const threadKey = (threadId: string) => `thread:${threadId}`;

/** How long a passage nobody has measured yet is assumed to be. */
const FALLBACK_HEIGHT = 320;

/** Quiet period before a client reports what it measured. */
const REPORT_DEBOUNCE_MS = 1200;

/**
 * The chapter's pages, as everyone else sees them.
 *
 * Heights are the one machine-dependent input to pagination, so they are
 * frozen on the server: this hook packs the whole chapter from the stored
 * numbers, measures only the passages this client actually rendered, and — if
 * the reader is a member — reports anything the server did not know yet. A
 * passage nobody has measured is estimated until someone does, so page numbers
 * are stable the moment the chapter has been read once by a member.
 */
export const useChapterPages = ({
  storyboardEventId,
  pageFormat,
  pageHeight,
  measured,
  composerHeight = 0,
  canReport,
}: {
  storyboardEventId: string;
  pageFormat: string;
  pageHeight: number;
  /** What this client measured of the passages it has loaded. */
  measured: Record<string, number>;
  composerHeight?: number;
  /** Members decide the pages; readers only read them. */
  canReport: boolean;
}) => {
  const [layout, setLayout] = useState<ChapterPageLayout | null>(null);
  /** Heights the server already knows, so they are not reported twice. */
  const storedRef = useRef<Record<string, number>>({});
  const reportTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLayout(null);
    storedRef.current = {};
    getChapterPageLayoutAction(storyboardEventId, pageFormat).then((result) => {
      if (cancelled || !result || "message" in result) return;
      storedRef.current = result.heights;
      setLayout(result);
    });
    return () => {
      cancelled = true;
    };
  }, [storyboardEventId, pageFormat]);

  /** Stored heights, overridden by anything this client measured first-hand. */
  const heights = useMemo(() => {
    const merged: Record<string, number> = { ...(layout?.heights ?? {}) };
    for (const [key, value] of Object.entries(measured)) merged[key] = value;
    return merged;
  }, [layout?.heights, measured]);

  /** Every item of the chapter in reading order — loaded or not. */
  const keys = useMemo(() => {
    const order = layout?.order ?? [];
    return [OVERTURE_KEY, ...order.map(threadKey)];
  }, [layout?.order]);

  /** Passages nobody has measured yet, standing in at a typical length. */
  const packHeights = useMemo(() => {
    const known = keys.map((key) => heights[key]).filter(Boolean) as number[];
    const estimate = known.length
      ? Math.round(known.reduce((sum, h) => sum + h, 0) / known.length)
      : FALLBACK_HEIGHT;
    const filled: Record<string, number> = {};
    for (const key of keys) filled[key] = heights[key] ?? estimate;
    return filled;
  }, [keys, heights]);

  const packed = useMemo(
    () =>
      packChapter({
        composerHeight,
        heights: packHeights,
        keys,
        pageHeight,
      }),
    [keys, packHeights, pageHeight, composerHeight],
  );

  /** Whether every passage in the chapter has a real measurement behind it. */
  const settled = keys.every((key) => heights[key] !== undefined);

  // Report what the server did not know. Debounced, because heights land in
  // bursts as rich text, images and fonts settle.
  useEffect(() => {
    if (!canReport || !layout) return;
    const fresh: Record<string, number> = {};
    for (const [key, value] of Object.entries(measured)) {
      if (key === COMPOSER_KEY || key === EDITOR_KEY) continue;
      if (storedRef.current[key] !== value) fresh[key] = value;
    }
    if (Object.keys(fresh).length === 0) return;

    if (reportTimer.current) clearTimeout(reportTimer.current);
    reportTimer.current = setTimeout(() => {
      // Claim them first: a slow round trip must not queue the same report
      // again on the next height that lands.
      storedRef.current = { ...storedRef.current, ...fresh };
      saveChapterPageMetricsAction(storyboardEventId, {
        engine: layout.engine,
        format: pageFormat,
        heights: fresh,
      }).then((result) => {
        if (!result || "message" in result) return;
        storedRef.current = result.heights;
        setLayout(result);
      });
    }, REPORT_DEBOUNCE_MS);

    return () => {
      if (reportTimer.current) clearTimeout(reportTimer.current);
    };
  }, [measured, canReport, layout, pageFormat, storyboardEventId]);

  return { keys, layoutLoaded: layout !== null, packed, settled };
};

/**
 * One flow item: keeps dialogs and media off page breaks, then reports its
 * laid-out height to the packer.
 */
export const MeasuredItem: FC<{
  itemKey: string;
  onHeight?: (key: string, height: number) => void;
  elementRef?: (el: HTMLDivElement | null) => void;
  dataThreadIndex?: number;
  style?: CSSProperties;
  /** Page content height; enables the keep-together pass when set. */
  pageHeight?: number;
  /** This item's offset from the top of its sheet. */
  startOffset?: number;
  /** The view's display scale, so measured rects convert to design pixels. */
  scale?: number;
  children: ReactNode;
}> = ({
  itemKey,
  onHeight,
  elementRef,
  dataThreadIndex,
  style,
  pageHeight = 0,
  startOffset = 0,
  scale = 1,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // `offsetHeight` is the unscaled layout height and excludes the spacers
    // around it, so the packing maths stays in the page's own coordinates and
    // can never feed back into what it measures.
    const report = () => {
      if (pageHeight > 0) {
        applyKeepTogether({ pageHeight, root: el, scale, startOffset });
      }
      onHeight?.(itemKey, el.offsetHeight);
    };
    report();
    // Rich text is injected in an effect; images and web fonts land later.
    const observer = new ResizeObserver(report);
    observer.observe(el);
    // The renderer also swaps DOM in place (dialog designs hydrate after
    // mount). A swap that leaves the total height unchanged still moves
    // content across page boundaries, so watch the DOM itself, not just the
    // size. Attribute changes are deliberately ignored — the keep-together
    // pass writes styles, and observing them would loop.
    const mutations = new MutationObserver(report);
    mutations.observe(el, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [itemKey, onHeight, pageHeight, startOffset, scale]);

  return (
    <S.ChapterFlowItem
      ref={(el: HTMLDivElement | null) => {
        ref.current = el;
        elementRef?.(el);
      }}
      data-thread-index={dataThreadIndex}
      style={style}
    >
      {children}
    </S.ChapterFlowItem>
  );
};

type ChapterItemProps = {
  item: FlowItem;
  event: StoryBoardEvent;
  /** Whether the chapter has any passages at all (for the empty state). */
  hasThreads: boolean;
  canManage: boolean;
  /** Bookmark badges are interactive in the manuscript, inert in the book —
   *  but they always occupy their space, so both readers measure the same. */
  bookmarksInteractive: boolean;
  bookmarkIndex: number | null;
  onEdit?: (thread: StoryBoardEventThread) => void;
  onDelete?: (thread: StoryBoardEventThread) => void;
  onToggleBookmark?: (threadIndex: number) => void;
};

const noop = () => {};

/**
 * The contents of one flow item. Both readers render passages through this, so
 * a passage occupies the same height — and therefore breaks in the same place —
 * whether it is being read in the manuscript or in the book.
 */
export const ChapterItem: FC<ChapterItemProps> = ({
  item,
  event,
  hasThreads,
  canManage,
  bookmarksInteractive,
  bookmarkIndex,
  onEdit,
  onDelete,
  onToggleBookmark,
}) => {
  const overtureAsterism = resolveAsterismStyle(event.overtureAsterism);
  const passageAsterism = resolveAsterismStyle(event.passageAsterism);

  if (item.kind === "overture") {
    return (
      <>
        <S.TitlePage>
          {event.image && (
            <S.CoverFrame>
              <CoverImage src={event.image} nwImage={event.avatar} />
            </S.CoverFrame>
          )}
          <S.EyebrowRule>Chapter</S.EyebrowRule>
          <S.EventTitle>{event.name}</S.EventTitle>
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
        </S.TitlePage>
        {overtureAsterism.value !== "none" && (
          <S.Asterism $variant={overtureAsterism.lineVariant}>
            <span className="glyph">{overtureAsterism.glyph}</span>
          </S.Asterism>
        )}
        <ShouldRender if={Boolean(event.description?.length)}>
          <S.Overture>
            <RichTextRenderer
              savedText={event.description ?? ""}
              disableCollapse
            />
          </S.Overture>
        </ShouldRender>
        {!hasThreads && (
          <S.EmptyPassages>
            The story waits for its first words…
          </S.EmptyPassages>
        )}
      </>
    );
  }

  const { thread, index } = item;
  const bookmarked = bookmarkIndex === index;

  return (
    <>
      {passageAsterism.value !== "none" && (
        <S.Asterism $tight $variant={passageAsterism.lineVariant}>
          <span className="glyph">{passageAsterism.glyph}</span>
        </S.Asterism>
      )}
      {/* Always rendered — hidden rather than dropped when it can't be used, so
          the passage is the same height for every reader and in every view. */}
      <S.PassageBookmarkToggle
        type="button"
        $active={bookmarked}
        onClick={
          bookmarksInteractive ? () => onToggleBookmark?.(index) : undefined
        }
        style={
          bookmarksInteractive
            ? undefined
            : { pointerEvents: "none", visibility: "hidden" }
        }
        aria-hidden={!bookmarksInteractive}
        tabIndex={bookmarksInteractive ? undefined : -1}
        aria-label={
          bookmarked
            ? "Remove bookmark from this passage"
            : "Bookmark this passage"
        }
        title={
          bookmarked
            ? "Remove bookmark from this passage"
            : "Bookmark this passage"
        }
      >
        <FaBookmark />
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </S.PassageBookmarkToggle>
      <EventThread
        thread={thread}
        canManage={canManage}
        onEdit={onEdit ?? noop}
        onDelete={onDelete ?? noop}
      />
    </>
  );
};

/** Convenience: the flow items of a chapter window, memoised. */
export const useFlowItems = (
  threads: StoryBoardEventThread[],
  startIndex: number,
) => useMemo(() => buildFlowItems(threads, startIndex), [threads, startIndex]);

type ChapterFlowProps = {
  items: FlowItem[];
  packed: PackedChapter;
  event: StoryBoardEvent;
  hasThreads: boolean;
  pageHeight: number;
  /** Display scale of the surrounding page, for the keep-together maths. */
  scale?: number;
  /** Only one copy of the flow reports heights — the one the packer runs on. */
  onHeight?: (key: string, height: number) => void;
  canManage?: boolean;
  bookmarksInteractive?: boolean;
  bookmarkIndex?: number | null;
  /** Passage being edited in place. Every copy of the flow renders a blank
   *  spacer of the editor's height in its place — the editor itself is
   *  mounted exactly once, on the live edit page, because a contentEditable
   *  cannot be duplicated across page windows. */
  editingThreadId?: string | null;
  /** Current measured height of the inline editor (the spacer's height). */
  editingHoleHeight?: number;
  /**
   * The editor itself, for a reader that renders the flow whole (the
   * manuscript). It takes the edited passage's slot instead of a spacer, so
   * there is nothing to keep in sync — it is measured under the passage's own
   * key and everything below it reflows as it grows.
   */
  editorNode?: ReactNode;
  /**
   * Whether items keep dialogs, media and short paragraphs off a page break by
   * pushing them onto the next page. A reader that frames pages needs it — the
   * push is what fills out the page edge. A reader that shows the flow unbroken
   * must not run it: with no page edge drawn, a push is just a hole in the
   * prose, ending nowhere the reader can see.
   */
  applyBreaks?: boolean;
  /**
   * The blank tail under the last item on a page. A reader that frames pages
   * needs it — it is what puts the next page's first line in the same place
   * everywhere. A reader that shows the flow unbroken drops it: there is no
   * page edge there to fill.
   */
  showLeftover?: boolean;
  /** Hands each passage's element out, for scroll jumps and position tracking. */
  registerThreadEl?: (index: number) => (el: HTMLDivElement | null) => void;
  onEdit?: (thread: StoryBoardEventThread) => void;
  onDelete?: (thread: StoryBoardEventThread) => void;
  onToggleBookmark?: (threadIndex: number) => void;
};

/**
 * The chapter's whole flow, laid out at page width.
 *
 * Every page in either reader is a clipped window onto one of these — the
 * manuscript stacks the windows down the screen, the book puts two of them side
 * by side. Because the flow is the same in both, page N frames the same words
 * wherever it is read. The blank tail under the last passage on a page is
 * rendered here, since it is what puts the next page's first line in the same
 * place in both readers.
 */
export const ChapterFlow: FC<ChapterFlowProps> = ({
  items,
  packed,
  event,
  hasThreads,
  pageHeight,
  scale = 1,
  onHeight,
  canManage = false,
  bookmarksInteractive = false,
  bookmarkIndex = null,
  editingThreadId = null,
  editingHoleHeight = 0,
  editorNode = null,
  applyBreaks = true,
  showLeftover = true,
  registerThreadEl,
  onEdit,
  onDelete,
  onToggleBookmark,
}) => (
  <>
    {items.map((item) => {
      const sheetIndex = packed.sheetOfItem.get(item.key) ?? 0;
      const sheet = packed.sheets[sheetIndex];
      const closesSheet = sheet?.keys[sheet.keys.length - 1] === item.key;
      const isEditingHole =
        item.kind === "thread" &&
        editingThreadId !== null &&
        item.thread.id === editingThreadId;
      return (
        <Fragment key={item.key}>
          <MeasuredItem
            itemKey={item.key}
            onHeight={onHeight}
            pageHeight={isEditingHole || !applyBreaks ? 0 : pageHeight}
            startOffset={packed.offsetOfItem.get(item.key) ?? 0}
            scale={scale}
            dataThreadIndex={item.kind === "thread" ? item.index : undefined}
            elementRef={
              item.kind === "thread"
                ? registerThreadEl?.(item.index)
                : undefined
            }
          >
            {isEditingHole && editorNode ? (
              // The editor in the passage's own slot — measured under the
              // passage's key, so the pages below follow every keystroke.
              editorNode
            ) : isEditingHole ? (
              // Blank spacer holding the editor's spot open. It tracks the
              // editor's height, so every page after it reflows live — the
              // measure layer re-reports the same number, keeping the pack
              // stable.
              <div style={{ height: editingHoleHeight }} />
            ) : (
              <ChapterItem
                item={item}
                event={event}
                hasThreads={hasThreads}
                canManage={canManage}
                bookmarksInteractive={bookmarksInteractive}
                bookmarkIndex={bookmarkIndex}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleBookmark={onToggleBookmark}
              />
            )}
          </MeasuredItem>
          {showLeftover && closesSheet && sheet.leftover > 0 && (
            <div style={{ height: sheet.leftover }} />
          )}
        </Fragment>
      );
    })}
  </>
);
