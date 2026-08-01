"use client";

import {
  type CSSProperties,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
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
  MeasuredItem,
  pageAtOffset,
  threadKey,
  useChapterPages,
  useFlowItems,
  useMeasuredHeights,
} from "./chapter-pages";
import * as P from "./paginated-chapter-view.styles";

/** Never let the pages get so small they stop being readable. */
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.25;

/** Pages this far from the viewport keep their content mounted. */
const VIRTUAL_WINDOW = 2;

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
  /** The passage being edited in place on its page, if any. */
  editingThreadId?: string | null;
  /**
   * The inline editor for `editingThreadId`. Mounted exactly once, on the live
   * edit page — the page the passage starts on, which grows with the editor
   * while every page after it reflows live, Word-style.
   */
  editor?: ReactNode;
  onEdit: (thread: StoryBoardEventThread) => void;
  onDelete: (thread: StoryBoardEventThread) => void;
  onToggleBookmark: (threadIndex: number) => void;
  /** Hands the page a passage opens on to the reader, for scroll jumps and the
   *  reading-position observer. */
  registerThreadEl: (index: number) => (el: HTMLDivElement | null) => void;
  hasOlder?: boolean;
  hasNewer?: boolean;
  loadingOlder?: boolean;
  loadingNewer?: boolean;
  onNeedBefore?: () => void;
  onNeedAfter?: () => void;
  /**
   * The live composer. It sits on the last page, which is the only page allowed
   * to grow — it keeps growing, marking each page boundary it crosses, until
   * the passage is saved and becomes pages like any other.
   */
  composer?: ReactNode;
};

/**
 * The chapter as a stack of pages.
 *
 * Every page is one component showing one page: a window onto the shared
 * chapter flow at the offset the packer assigned it. That is the same
 * construction the book spread uses, so page 7 here is page 7 there — the
 * manuscript is simply the book's pages laid out vertically.
 *
 * The exception is the page being written on. A live editor cannot be split
 * across two windows without losing the caret, so the draft page grows and
 * draws the boundaries it crosses; it settles into ordinary pages on save.
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
  const { width: winW } = useWindowDimensions();
  const [scale, setScale] = useState(1);
  const [visibleRange, setVisibleRange] = useState({ from: 0, to: 3 });
  const { heights, reportHeight } = useMeasuredHeights();

  // ── Fit the fixed-size page to the viewport ──────────────────────────────
  // Geometry never changes; only the whole-page scale does. That is what keeps
  // the pages the same shape from a 375px phone to a 4K monitor.
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

  const items = useFlowItems(threads, startIndex);
  const composerHeight = composer ? (heights[COMPOSER_KEY] ?? 0) : 0;

  /** The passage being edited in place, if it is among the loaded items. */
  const editKey = editingThreadId ? threadKey(editingThreadId) : null;
  const editing = Boolean(
    editKey && editor && items.some((item) => item.key === editKey),
  );
  /** The inline editor's measured height — it reports under the passage's own
   *  key, which is exactly what makes every page after it reflow live. */
  const editHeight = editing && editKey ? (heights[editKey] ?? 0) : 0;

  // Pages are the chapter's, not this window's: the packer runs over every
  // passage in the chapter using the heights frozen on the server, so page 12
  // is page 12 however the reader got here and on whatever machine.
  const { packed, settled } = useChapterPages({
    // While an inline edit is live the measured heights include the editor's
    // chrome — never freeze those on the server; reporting resumes (and
    // self-corrects) once the passage renders as prose again.
    canReport: canManage && !editing,
    composerHeight,
    measured: heights,
    pageFormat: spec.value,
    pageHeight: pageH,
    storyboardEventId: event.id ?? "",
  });

  const { draft } = packed;

  /** Where this window's first passage sits in the chapter's own flow. */
  const flowTop = items.length ? (packed.topOfItem.get(items[0].key) ?? 0) : 0;
  const firstPage = items.length
    ? (packed.pageOfItem.get(items[0].key) ?? 1)
    : 1;
  const lastLoadedKey = items.length ? items[items.length - 1].key : null;
  const lastPage = lastLoadedKey
    ? pageAtOffset(
        packed,
        (packed.topOfItem.get(lastLoadedKey) ?? 0) +
          (heights[lastLoadedKey] ?? 0) -
          1,
      )
    : 1;

  /** Passages opening on each page, so a scroll jump lands on the right page. */
  const threadsByPage = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const item of items) {
      if (item.kind !== "thread") continue;
      const page = packed.pageOfItem.get(item.key);
      if (page === undefined) continue;
      const list = map.get(page);
      if (list) list.push(item.index);
      else map.set(page, [item.index]);
    }
    return map;
  }, [items, packed.pageOfItem]);

  /**
   * The passage a page is showing — the last one to have started at or before
   * it, since a passage keeps flowing across the pages after its own. This is
   * what the reader reports as the reading position.
   */
  const leadThreadByPage = useMemo(() => {
    const map = new Map<number, number>();
    let current: number | null = null;
    for (let page = 1; page <= packed.totalPages; page++) {
      const opening = threadsByPage.get(page);
      if (opening?.length) current = opening[0];
      if (current !== null) map.set(page, current);
    }
    return map;
  }, [threadsByPage, packed.totalPages]);

  /**
   * The draft's page and where on it the composer begins. Pages before this one
   * are ordinary windows; this one is the live page, and it covers every page
   * number after it too.
   */
  const draftPage = draft?.startPage ?? packed.totalPages + 1;
  const draftOffsetOnPage = useMemo(() => {
    if (!draft) return 0;
    const sheet = packed.sheets[draft.sheetIndex];
    const top = sheet.contentTop + draft.startOffset;
    return Math.max(0, top - (packed.pageTops[draftPage - 1] ?? 0));
  }, [draft, packed.sheets, packed.pageTops, draftPage]);

  // ── The live edit page ───────────────────────────────────────────────────
  // Same construction as the draft page: the page the edited passage starts on
  // becomes the one page allowed to grow. Above the editor it frames what the
  // page already held; below it, the tail of the chapter that shares the
  // editor's last page — so every following page stays exactly in line.
  const editTop = editing && editKey ? (packed.topOfItem.get(editKey) ?? 0) : 0;
  const editStartPage = editing ? pageAtOffset(packed, editTop) : 0;
  const editEndPage = editing
    ? pageAtOffset(packed, editTop + Math.max(0, editHeight - 1))
    : 0;
  const editOffsetOnPage = editing
    ? Math.max(0, editTop - (packed.pageTops[editStartPage - 1] ?? 0))
    : 0;
  const editRoomAfter = editing
    ? Math.max(
        0,
        (packed.pageTops[editEndPage - 1] ?? 0) +
          pageH -
          (editTop + editHeight),
      )
    : 0;

  /**
   * The pages this window can actually show, as ordinary one-page windows.
   * Pages outside the loaded passages belong to a chunk that has not been
   * fetched — the reader turns back or reads on to reach them.
   */
  const staticPages = useMemo(() => {
    const last = Math.min(lastPage, composer ? draftPage - 1 : lastPage);
    return Array.from(
      { length: Math.max(0, last - firstPage + 1) },
      (_, i) => firstPage + i,
    );
  }, [firstPage, lastPage, composer, draftPage]);

  // ── Which pages are worth keeping mounted ────────────────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const slots = stage.querySelectorAll<HTMLElement>("[data-page-index]");
      let first: number | null = null;
      let last = 0;
      for (const slot of Array.from(slots)) {
        const rect = slot.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
        const index = Number(slot.dataset.pageIndex);
        if (first === null) first = index;
        last = index;
      }
      if (first === null) return;
      setVisibleRange((prev) => {
        const from = Math.max(0, first - VIRTUAL_WINDOW);
        const to = last + VIRTUAL_WINDOW;
        return prev.from === from && prev.to === to ? prev : { from, to };
      });
    };

    update();
    const scroller = document.querySelector<HTMLElement>("main.page-container");
    scroller?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [staticPages.length]);

  /** Style shared by every page card, live or not. */
  const pageStyle: CSSProperties = {
    padding: `${spec.padY}px ${spec.padX}px`,
    transform: `scale(${scale})`,
    width: spec.width,
  };

  const flowStyle = {
    "--nw-page-media-max": `${pageH}px`,
    fontSize: spec.fontSize,
    lineHeight: spec.lineHeight,
    width: pageW,
  } as CSSProperties;

  /** The flow, rendered read-write for a page window. */
  const flow = (
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
      editingHoleHeight={editHeight}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleBookmark={onToggleBookmark}
    />
  );

  /** One ordinary saved page: a one-page window onto the shared flow. */
  const renderStaticPage = (pageNumber: number) => {
    const index = pageNumber - firstPage;
    const mounted = index >= visibleRange.from && index <= visibleRange.to;
    const opensHere = threadsByPage.get(pageNumber);
    return (
      <P.PageSlot
        key={pageNumber}
        data-page-index={index}
        // Passages are found through the page they open on, and the slot —
        // unlike the page card — is mounted even when virtualized away, so
        // a jump to a far page still has something to scroll to.
        ref={(el: HTMLDivElement | null) => {
          for (const threadIndex of opensHere ?? []) {
            registerThreadEl(threadIndex)(el);
          }
        }}
        data-thread-index={leadThreadByPage.get(pageNumber)}
        style={{
          height: (spec.height + P.PAGE_GAP) * scale,
          width: spec.width * scale,
        }}
      >
        {mounted ? (
          <P.Page style={{ ...pageStyle, height: spec.height }}>
            <P.PageWindow
              style={{
                height: pageH,
                left: spec.padX,
                top: spec.padY,
                width: pageW,
              }}
            >
              <P.PageWindowInner
                style={{
                  ...flowStyle,
                  // The flow holds only the loaded passages, so it is
                  // placed where they sit in the chapter, not at zero.
                  top: flowTop - (packed.pageTops[pageNumber - 1] ?? 0),
                }}
              >
                {flow}
              </P.PageWindowInner>
            </P.PageWindow>
            <P.PageNumber style={{ bottom: spec.padY / 3 }}>
              {pageNumber}
            </P.PageNumber>
          </P.Page>
        ) : (
          <P.PagePlaceholder
            style={{
              height: spec.height * scale,
              width: spec.width * scale,
            }}
          />
        )}
      </P.PageSlot>
    );
  };

  /** Ghost breaks the draft crosses, in page-content coordinates. */
  const draftCuts = useMemo(() => {
    if (!composer) return [];
    const spill = draftOffsetOnPage + composerHeight - pageH;
    if (spill <= 8) return [];
    return Array.from(
      { length: Math.min(40, Math.ceil(spill / pageH)) },
      (_, i) => i + 1,
    );
  }, [composer, draftOffsetOnPage, composerHeight, pageH]);

  return (
    <P.Stage ref={stageRef}>
      {/* The copy the packer measures. It stays mounted whatever is scrolled
          out of view, so the page geometry never depends on what is on screen. */}
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

      {(editing
        ? staticPages.filter((pageNumber) => pageNumber < editStartPage)
        : staticPages
      ).map(renderStaticPage)}

      {/* The live edit page — the passage under edit, reopened where it lies.
          Grows with the editor; the pages after it reflow underneath because
          the editor's height is packed under the passage's own key. */}
      {editing && (
        <P.PageSlot
          data-page-index={editStartPage - firstPage}
          ref={(el: HTMLDivElement | null) => {
            for (let page = editStartPage; page <= editEndPage; page++) {
              for (const threadIndex of threadsByPage.get(page) ?? []) {
                registerThreadEl(threadIndex)(el);
              }
            }
          }}
          data-thread-index={leadThreadByPage.get(editStartPage)}
          style={{
            height:
              (Math.max(
                spec.height,
                spec.padY * 2 + editOffsetOnPage + editHeight + editRoomAfter,
              ) +
                P.PAGE_GAP) *
              scale,
            width: spec.width * scale,
          }}
        >
          <P.Page $live style={{ ...pageStyle, minHeight: spec.height }}>
            {/* What this page already held above the passage, framed exactly
                as the saved page frames it. */}
            <P.PageWindow
              style={{
                height: editOffsetOnPage,
                position: "relative",
                width: pageW,
              }}
            >
              <P.PageWindowInner
                style={{
                  ...flowStyle,
                  top: flowTop - (packed.pageTops[editStartPage - 1] ?? 0),
                }}
              >
                {flow}
              </P.PageWindowInner>
            </P.PageWindow>

            {/* The one mounted copy of the editor. It reports its height under
                the passage's key — the same number the flow's spacer holds —
                so the pack, and every page below, follows each keystroke.
                Keep-together is off here: it injects margins into live DOM,
                and this DOM is the contentEditable being saved. */}
            <MeasuredItem
              itemKey={editKey ?? ""}
              onHeight={reportHeight}
              scale={scale}
            >
              <div style={flowStyle}>
                <P.DraftBadge>
                  Editing — page {editStartPage}
                  {editEndPage > editStartPage && `–${editEndPage}`}
                </P.DraftBadge>
                {editor}
              </div>
            </MeasuredItem>

            {Array.from(
              { length: Math.max(0, editEndPage - editStartPage) },
              (_, i) => i + 1,
            ).map((step) => (
              <P.CutLine
                key={step}
                data-label={`Page ${editStartPage + step}`}
                style={{
                  left: spec.padX,
                  right: spec.padX,
                  top: spec.padY + pageH * step,
                }}
              />
            ))}

            {/* The tail of the chapter sharing the editor's last page. */}
            <P.PageWindow
              style={{
                height: editRoomAfter,
                position: "relative",
                width: pageW,
              }}
            >
              <P.PageWindowInner
                style={{
                  ...flowStyle,
                  top: flowTop - (editTop + editHeight),
                }}
              >
                {flow}
              </P.PageWindowInner>
            </P.PageWindow>

            <P.PageNumber style={{ bottom: spec.padY / 3 }}>
              {editStartPage}
              {editEndPage > editStartPage && `–${editEndPage}`}
            </P.PageNumber>
          </P.Page>
        </P.PageSlot>
      )}

      {editing &&
        staticPages
          .filter((pageNumber) => pageNumber > editEndPage)
          .map(renderStaticPage)}

      {/* The live page — where the author is writing. A new passage joins the
          end of the chapter, so it only belongs inline once the end is what is
          loaded; otherwise it is offered below, off the page stack. */}
      {composer && !hasNewer && (
        <P.PageSlot
          data-page-index={draftPage - firstPage}
          ref={(el: HTMLDivElement | null) => {
            for (const threadIndex of threadsByPage.get(draftPage) ?? []) {
              registerThreadEl(threadIndex)(el);
            }
          }}
          data-thread-index={leadThreadByPage.get(draftPage)}
          style={{
            height:
              (Math.max(
                spec.height,
                spec.padY * 2 + draftOffsetOnPage + composerHeight,
              ) +
                P.PAGE_GAP) *
              scale,
            width: spec.width * scale,
          }}
        >
          <P.Page $live style={{ ...pageStyle, minHeight: spec.height }}>
            {/* Whatever of this page was already written, framed exactly as the
                book will frame it. Sits in the flow (not absolutely placed) so
                the composer follows straight on from it. */}
            <P.PageWindow
              style={{
                height: draftOffsetOnPage,
                position: "relative",
                width: pageW,
              }}
            >
              <P.PageWindowInner
                style={{
                  ...flowStyle,
                  top: flowTop - (packed.pageTops[draftPage - 1] ?? 0),
                }}
              >
                {flow}
              </P.PageWindowInner>
            </P.PageWindow>

            {/* No keep-together here: the pass writes margins into live DOM,
                and this DOM is the contentEditable that gets serialized on
                save — injected pushes would persist into the passage HTML. */}
            <MeasuredItem
              itemKey={COMPOSER_KEY}
              onHeight={reportHeight}
              startOffset={draftOffsetOnPage}
              scale={scale}
            >
              <P.ComposerSlot>
                <P.DraftBadge>
                  Draft — page {draft?.startPage ?? 1}
                  {draft &&
                    draft.endPage > draft.startPage &&
                    `–${draft.endPage}`}
                  {draft && (
                    <span className="room">
                      {draft.roomLeft > 12
                        ? `· about ${Math.round(
                            draft.roomLeft / (spec.fontSize * spec.lineHeight),
                          )} lines left on this page`
                        : "· this page is full"}
                    </span>
                  )}
                </P.DraftBadge>
                {composer}
              </P.ComposerSlot>
            </MeasuredItem>

            {draftCuts.map((step) => (
              <P.CutLine
                key={step}
                data-label={`Page ${draftPage + step}`}
                style={{
                  left: spec.padX,
                  right: spec.padX,
                  top: spec.padY + pageH * step,
                }}
              />
            ))}

            <P.PageNumber style={{ bottom: spec.padY / 3 }}>
              {draftPage}
              {draftCuts.length > 0 && `–${draftPage + draftCuts.length}`}
            </P.PageNumber>
          </P.Page>
        </P.PageSlot>
      )}

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
          written here rather than on a page it would not land on. */}
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
