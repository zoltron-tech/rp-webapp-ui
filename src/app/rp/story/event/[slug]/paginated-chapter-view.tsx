"use client";

import {
  type CSSProperties,
  type FC,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWindowDimensions } from "@/hooks";
import { contentHeight, contentWidth, resolvePageSpec } from "@/lib/paginator";
import type { StoryBoardEvent, StoryBoardEventThread } from "@/types";
import {
  ChapterFlow,
  COMPOSER_KEY,
  EDITOR_KEY,
  MeasuredItem,
  threadKey,
  useChapterPages,
  useFlowItems,
  useMeasuredHeights,
} from "./chapter-pages";
import * as P from "./paginated-chapter-view.styles";

/** Never let the manuscript get so small it stops being readable. */
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.25;

type Props = {
  event: StoryBoardEvent;
  /** The story's page geometry preset (a `PageFormat`). */
  pageFormat?: string | null;
  /** The loaded, contiguous window of the chapter's passages. */
  threads: StoryBoardEventThread[];
  /** Global index (in createdAt order) of `threads[0]`. */
  startIndex: number;
  /** Total passages in the chapter, loaded or not. */
  totalThreads: number;
  /** Whether the reader may edit/delete passages (a story member). */
  canManage: boolean;
  /** Whether to offer the per-passage bookmark badge. */
  isLoggedIn: boolean;
  /** The reader's saved spot, as a global passage index. */
  bookmarkIndex: number | null;
  /** The passage being edited in place, if any. */
  editingThreadId?: string | null;
  /**
   * The inline editor for `editingThreadId`. Mounted exactly once, in the
   * passage's own place in the flow, so everything below it reflows live.
   */
  editor?: ReactNode;
  onEdit: (thread: StoryBoardEventThread) => void;
  onDelete: (thread: StoryBoardEventThread) => void;
  onToggleBookmark: (threadIndex: number) => void;
  /** Hands each passage's element to the reader, for scroll jumps and the
   *  reading-position observer. */
  registerThreadEl: (index: number) => (el: HTMLDivElement | null) => void;
  hasOlder?: boolean;
  hasNewer?: boolean;
  loadingOlder?: boolean;
  loadingNewer?: boolean;
  onNeedBefore?: () => void;
  onNeedAfter?: () => void;
  /** The live composer, written at the end of the chapter. */
  composer?: ReactNode;
};

/**
 * The chapter as one continuous manuscript.
 *
 * Pages are still the model underneath — the packer runs over the whole
 * chapter using the heights frozen on the server, so page 12 here is page 12
 * in the book. What this view drops is the *drawing* of them: no stack of
 * paper cards, no gaps, no clipped windows. The prose runs on unbroken and
 * each page division is marked only by its number, quietly, in the right
 * margin where the page gave out.
 */
export const PaginatedChapterView: FC<Props> = ({
  event,
  pageFormat,
  threads,
  startIndex,
  totalThreads,
  canManage,
  isLoggedIn,
  bookmarkIndex,
  editingThreadId = null,
  editor,
  onEdit,
  onDelete,
  onToggleBookmark,
  registerThreadEl,
  hasOlder = false,
  hasNewer = false,
  loadingOlder = false,
  loadingNewer = false,
  onNeedBefore,
  onNeedAfter,
  composer,
}) => {
  const spec = resolvePageSpec(pageFormat);
  const pageW = contentWidth(spec);
  const pageH = contentHeight(spec);

  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const { width: winW } = useWindowDimensions();
  const [scale, setScale] = useState(1);
  /** The sheet's own (unscaled) height, so its scaled footprint can be held. */
  const [sheetHeight, setSheetHeight] = useState(0);
  const { heights, reportHeight } = useMeasuredHeights();

  // ── Fit the fixed page width to the viewport ─────────────────────────────
  // Geometry never changes; only the whole-sheet scale does. That is what keeps
  // the measure — and so the page breaks — the same from a 375px phone to a 4K
  // monitor.
  const recomputeScale = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const available = stage.clientWidth;
    if (available <= 0) return;
    setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, available / spec.width)));
  }, [spec.width]);

  useLayoutEffect(() => {
    recomputeScale();
  }, [recomputeScale, winW]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(recomputeScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [recomputeScale]);

  // The sheet is transformed, so its scaled height is invisible to layout —
  // measure it and let the slot around it reserve the room.
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const measure = () => setSheetHeight(sheet.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);

  const items = useFlowItems(threads, startIndex);
  /** The composer only costs the chapter a draft's worth of room when it is
   *  written at the end of it — mid-chapter it is detached, off the flow. */
  const inlineComposer = Boolean(composer) && !hasNewer;
  const composerHeight = inlineComposer ? (heights[COMPOSER_KEY] ?? 0) : 0;

  /** The passage being edited in place, if it is among the loaded items. */
  const editKey = editingThreadId ? threadKey(editingThreadId) : null;
  const editing = Boolean(
    editKey && editor && items.some((item) => item.key === editKey),
  );
  /** The editor's measured height. The measured copy of the flow holds the
   *  passage's slot open at exactly this height, which is what makes the pages
   *  below it reflow as the author types. */
  const editHeight = editing ? (heights[EDITOR_KEY] ?? 0) : 0;

  // Pages are the chapter's, not this window's: the packer runs over every
  // passage in the chapter using the heights frozen on the server, so page 12
  // is page 12 however the reader got here and on whatever machine.
  const { packed, settled } = useChapterPages({
    // While an inline edit is live the measured height of the edited passage is
    // the editor's — never freeze that on the server; reporting resumes (and
    // self-corrects) once the passage renders as prose again.
    canReport: canManage && !editing,
    composerHeight,
    measured: heights,
    pageFormat: spec.value,
    pageHeight: pageH,
    storyboardEventId: event.id ?? "",
  });

  const { draft } = packed;

  /**
   * Where each page ended, as an offset down the rendered flow.
   *
   * The pack lays the chapter out in sheets, each carrying one page number (or
   * several, when a single passage overruns) plus the blank tail that fills out
   * its last page. This view renders no blank tails, so a page's end is simply
   * its content's end: walk the sheets this window actually renders, stacking
   * their used height, and mark every page boundary on the way.
   */
  const pageTicks = useMemo(() => {
    if (items.length === 0) return [];
    const firstKey = items[0].key;
    const lastKey = items[items.length - 1].key;
    const firstSheet = packed.sheetOfItem.get(firstKey);
    const lastSheet = packed.sheetOfItem.get(lastKey);
    if (firstSheet === undefined || lastSheet === undefined) return [];

    /** How much of the flow this window renders — nothing may be marked past
     *  it, since the sheets it sits on also carry passages nobody loaded. */
    const rendered =
      items.reduce((sum, item) => sum + (heights[item.key] ?? 0), 0) +
      composerHeight;

    const ticks: { page: number; top: number }[] = [];
    // The window can open mid-sheet: back the cursor up by however much of the
    // sheet was already spent before its first rendered passage.
    let cursor = -(packed.offsetOfItem.get(firstKey) ?? 0);
    for (let index = firstSheet; index <= lastSheet; index++) {
      const sheet = packed.sheets[index];
      if (!sheet) break;
      for (let step = 0; step < sheet.span; step++) {
        const top = cursor + Math.min((step + 1) * pageH, sheet.used);
        if (top > 0 && top <= rendered + 2) {
          ticks.push({ page: sheet.startNumber + step, top });
        }
      }
      cursor += sheet.used;
    }
    return ticks;
  }, [items, packed, heights, pageH, composerHeight]);

  const flowStyle = {
    // The flow is drawn at `scale`, so anything inside it that is chrome rather
    // than prose — the composer, the in-place editor — can size itself in the
    // real pixels the writer sees instead of the page pixels it is laid out in.
    "--nw-composer-scale": scale,
    "--nw-page-media-max": `${pageH}px`,
    fontSize: spec.fontSize,
    lineHeight: spec.lineHeight,
    width: pageW,
  } as CSSProperties;

  return (
    <P.Stage ref={stageRef}>
      {/* The copy the packer measures. It renders every passage the same way
          for every reader — no edit controls, no live editor — so the page
          breaks never depend on who is reading or what they are doing. */}
      <P.MeasureLayer aria-hidden style={flowStyle}>
        <ChapterFlow
          items={items}
          packed={packed}
          event={event}
          hasThreads={threads.length > 0}
          pageHeight={pageH}
          editingThreadId={editing ? editingThreadId : null}
          editingHoleHeight={editHeight}
          onHeight={reportHeight}
        />
      </P.MeasureLayer>

      {hasOlder && (
        <P.EdgeButton
          type="button"
          onClick={onNeedBefore}
          disabled={loadingOlder}
        >
          {loadingOlder ? "Turning back…" : "Read earlier passages"}
        </P.EdgeButton>
      )}

      <P.ManuscriptSlot
        style={{ height: sheetHeight * scale, width: spec.width * scale }}
      >
        <P.Sheet
          ref={sheetRef}
          style={{
            padding: `${spec.padY}px ${spec.padX}px`,
            transform: `scale(${scale})`,
            width: spec.width,
          }}
        >
          <P.FlowColumn style={flowStyle}>
            <ChapterFlow
              items={items}
              packed={packed}
              event={event}
              hasThreads={threads.length > 0}
              pageHeight={pageH}
              scale={scale}
              canManage={canManage}
              bookmarksInteractive={isLoggedIn}
              bookmarkIndex={bookmarkIndex}
              editingThreadId={editing ? editingThreadId : null}
              // The one mounted copy of the editor, in the passage's own slot.
              // Keep-together is off around it: it injects margins into live
              // DOM, and this DOM is the contentEditable being saved.
              editorNode={
                editing ? (
                  <MeasuredItem
                    itemKey={EDITOR_KEY}
                    onHeight={reportHeight}
                    scale={scale}
                  >
                    {editor}
                  </MeasuredItem>
                ) : null
              }
              showLeftover={false}
              registerThreadEl={registerThreadEl}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleBookmark={onToggleBookmark}
            />

            {/* The live end of the chapter. A new passage joins the end, so it
                is written here only when the end is what is loaded. */}
            {inlineComposer && (
              <MeasuredItem
                itemKey={COMPOSER_KEY}
                onHeight={reportHeight}
                scale={scale}
              >
                <P.ComposerSlot $bleed={spec.padX}>
                  <P.DraftBadge>
                    Draft — page {draft?.startPage ?? packed.totalPages}
                    {draft &&
                      draft.endPage > draft.startPage &&
                      `–${draft.endPage}`}
                    {draft && (
                      <span className="room">
                        {draft.roomLeft > 12
                          ? `· about ${Math.round(
                              draft.roomLeft /
                                (spec.fontSize * spec.lineHeight),
                            )} lines left on this page`
                          : "· this page is full"}
                      </span>
                    )}
                  </P.DraftBadge>
                  {composer}
                </P.ComposerSlot>
              </MeasuredItem>
            )}
          </P.FlowColumn>

          {pageTicks.map((tick) => (
            <P.PageTick
              key={tick.page}
              style={{
                right: Math.round(spec.padX / 4),
                top: spec.padY + tick.top,
              }}
            >
              {tick.page}
            </P.PageTick>
          ))}
        </P.Sheet>
      </P.ManuscriptSlot>

      {hasNewer && (
        <P.EdgeButton
          type="button"
          onClick={onNeedAfter}
          disabled={loadingNewer}
        >
          {loadingNewer ? "Turning the page…" : "Read on"}
        </P.EdgeButton>
      )}

      {/* Reading mid-chapter: a new passage still joins the end, so it is
          written here rather than in a place it would not land. */}
      {composer && hasNewer && (
        <P.DetachedComposer style={{ width: spec.width * scale }}>
          <P.DraftBadge>
            Draft — joins the end of the chapter, page {packed.totalPages}
          </P.DraftBadge>
          {composer}
        </P.DetachedComposer>
      )}

      <P.Footer>
        {packed.totalPages} {packed.totalPages === 1 ? "page" : "pages"} ·{" "}
        {totalThreads} {totalThreads === 1 ? "passage" : "passages"}
        {canManage && composer ? " · writing" : ""}
        {!settled && " · measuring"}
      </P.Footer>
    </P.Stage>
  );
};
