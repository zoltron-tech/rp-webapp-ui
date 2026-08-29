"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { StoryBoardEvent, StoryBoardEventThread } from "@nw/types";
import { type CSSProperties, type FC, type ReactNode, useMemo } from "react";
import { BsCalendar2Date } from "react-icons/bs";
import { FaBookmark } from "react-icons/fa6";
import { TfiLocationPin } from "react-icons/tfi";
import { resolveAsterismStyle } from "@/components/asterism-styles";
import { CoverImage } from "@/components/common";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { FLOW_ITEM_ATTR } from "@/lib/paginator";
import { toFormattedDate } from "@/utils/helpers";
import { EventThread } from "./event-thread";
import * as S from "./styles";

/**
 * The chapter's content flow — the passages, rendered.
 *
 * This used to own a page model as well: items were measured, their heights
 * frozen on the server, and both readers packed the chapter into numbered
 * pages from those stored numbers so every co-author saw identical cuts. That
 * bought stable page numbers at the cost of writing against a fixed page
 * geometry, and of a whole second layout engine running while you typed.
 *
 * Now this only renders. Where a page ends is decided at read time by the
 * book, against the screen it is actually being read on — see
 * `@/lib/paginator`. Nothing here measures anything, and the manuscript view
 * simply lets the prose run.
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
export const threadKey = (threadId: string) => `thread:${threadId}`;

/** How long a passage nobody has measured yet is assumed to be. */

/**
 * One item of the flow.
 *
 * Only a wrapper now. It used to measure itself, report its height to the
 * packer, and shove itself onto the next page when it would have straddled a
 * break — all of which existed to make a fixed page geometry work while
 * writing. The one thing kept is the marker attribute, which is how the
 * read-time paginator finds item boundaries when it decides where pages end.
 */
export const FlowItemBox: FC<{
  itemKey: string;
  elementRef?: (el: HTMLDivElement | null) => void;
  dataThreadIndex?: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ itemKey, elementRef, dataThreadIndex, style, children }) => (
  <S.ChapterFlowItem
    ref={elementRef}
    data-thread-index={dataThreadIndex}
    style={style}
    {...{ [FLOW_ITEM_ATTR]: itemKey }}
  >
    {children}
  </S.ChapterFlowItem>
);

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
  event: StoryBoardEvent;
  hasThreads: boolean;
  canManage?: boolean;
  /** Bookmark badges are interactive in the manuscript, inert in the book. */
  bookmarksInteractive?: boolean;
  bookmarkIndex?: number | null;
  /** Passage being edited in place. */
  editingThreadId?: string | null;
  /** The editor itself, mounted in the edited passage's own slot so the prose
   *  below it reflows as it grows. */
  editorNode?: ReactNode;
  /** Hands each passage's element out, for scroll jumps and position tracking. */
  registerThreadEl?: (index: number) => (el: HTMLDivElement | null) => void;
  onEdit?: (thread: StoryBoardEventThread) => void;
  onDelete?: (thread: StoryBoardEventThread) => void;
  onToggleBookmark?: (thread: number) => void;
};

/**
 * The chapter's flow: the overture, then every loaded passage, in order.
 *
 * Plain content. It carries no page geometry and no breaks — the manuscript
 * renders this straight, and the book measures a copy of it to decide where
 * its pages end.
 */
export const ChapterFlow: FC<ChapterFlowProps> = ({
  items,
  event,
  hasThreads,
  canManage = false,
  bookmarksInteractive = false,
  bookmarkIndex = null,
  editingThreadId = null,
  editorNode = null,
  registerThreadEl,
  onEdit,
  onDelete,
  onToggleBookmark,
}) => (
  <>
    {items.map((item) => {
      const isEditing =
        item.kind === "thread" &&
        editingThreadId !== null &&
        item.thread.id === editingThreadId;
      return (
        <FlowItemBox
          key={item.key}
          itemKey={item.key}
          dataThreadIndex={item.kind === "thread" ? item.index : undefined}
          elementRef={
            item.kind === "thread" ? registerThreadEl?.(item.index) : undefined
          }
        >
          {isEditing && editorNode ? (
            editorNode
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
        </FlowItemBox>
      );
    })}
  </>
);
