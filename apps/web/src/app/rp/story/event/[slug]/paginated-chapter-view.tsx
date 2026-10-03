"use client";

import type { StoryBoardEvent, StoryBoardEventThread } from "@nw/types";
import type { FC, ReactNode } from "react";
import { ChapterFlow, useFlowItems } from "./chapter-pages";
import * as P from "./paginated-chapter-view.styles";

type Props = {
  event: StoryBoardEvent;
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
  /** The inline editor for `editingThreadId`, mounted in that passage's own
   *  place in the flow so everything below it reflows live. */
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
 * Deliberately has no idea what a page is. It used to: the chapter was laid
 * out against a stored page format, packed into numbered pages from heights
 * frozen on the server, and marked with a page number in the margin wherever
 * one gave out — with a badge under the composer telling you which page your
 * draft had landed on and how many lines were left on it.
 *
 * None of that helped anyone write. It made the writing surface a fixed
 * measure that had nothing to do with the window it was in, it re-packed the
 * whole chapter on every keystroke, and the numbers it showed were only ever
 * true for one page geometry. Where a page ends is a reading decision, so the
 * book makes it at read time, against the screen it is being read on.
 *
 * What is left is prose in a readable column, running on.
 */
export const PaginatedChapterView: FC<Props> = ({
  event,
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
  const items = useFlowItems(threads, startIndex);

  /** The composer belongs at the end of the chapter, so it is only written
   *  inline when the end is what is loaded. */
  const inlineComposer = Boolean(composer) && !hasNewer;
  const editing = Boolean(editingThreadId && editor);

  return (
    <P.Stage>
      {hasOlder && (
        <P.EdgeButton
          type="button"
          onClick={onNeedBefore}
          disabled={loadingOlder}
        >
          {loadingOlder ? "Turning back…" : "Read earlier passages"}
        </P.EdgeButton>
      )}

      <P.Manuscript>
        <ChapterFlow
          items={items}
          event={event}
          hasThreads={threads.length > 0}
          canManage={canManage}
          bookmarksInteractive={isLoggedIn}
          bookmarkIndex={bookmarkIndex}
          editingThreadId={editing ? editingThreadId : null}
          editorNode={editing ? editor : null}
          registerThreadEl={registerThreadEl}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleBookmark={onToggleBookmark}
        />

        {inlineComposer && (
          <P.ComposerSlot>
            <P.DraftBadge>Draft — joins the end of the chapter</P.DraftBadge>
            {composer}
          </P.ComposerSlot>
        )}
      </P.Manuscript>

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
        <P.DetachedComposer>
          <P.DraftBadge>Draft — joins the end of the chapter</P.DraftBadge>
          {composer}
        </P.DetachedComposer>
      )}

      <P.Footer>
        {totalThreads} {totalThreads === 1 ? "passage" : "passages"}
        {canManage && composer ? " · writing" : ""}
      </P.Footer>
    </P.Stage>
  );
};
