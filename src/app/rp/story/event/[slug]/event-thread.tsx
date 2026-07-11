"use client";

import type { FC } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import {
  DEFAULT_DIALOG_DESIGN,
  isDialogDesign,
} from "@/components/rich-text-editor-input/dialog-designs";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import type { StoryBoardEventThread } from "@/types";
import { toFormattedDate } from "@/utils/helpers";
import * as S from "./styles";

type Props = {
  thread: StoryBoardEventThread;
  /** Whether the viewer can edit/delete this thread. */
  canManage: boolean;
  onEdit: (thread: StoryBoardEventThread) => void;
  onDelete: (thread: StoryBoardEventThread) => void;
  /**
   * "scroll" (default) renders the interactive reader passage; "book" renders
   * the same prose for the paginated flow — no controls, so pages stay clean.
   */
  variant?: "scroll" | "book";
};

/**
 * Displays a single event thread as a seamless passage of the story. Each
 * thread's embedded dialogs are always shown in the style its author fixed
 * when writing it (`thread.dialogDesign`) — readers can't override it.
 */
export const EventThread: FC<Props> = ({
  thread,
  canManage,
  onEdit,
  onDelete,
  variant = "scroll",
}) => {
  const message = thread.message ?? "";
  const isBook = variant === "book";
  const design = isDialogDesign(thread.dialogDesign)
    ? thread.dialogDesign
    : DEFAULT_DIALOG_DESIGN;

  const prose = (
    <RichTextRenderer
      savedText={message}
      disableCollapse
      dialogDesign={design}
      museDialogAttrs={thread.museDialogAttrs}
    />
  );

  if (isBook) {
    // Book edition: prose plus a compact byline, no interactive chrome.
    return (
      <S.Passage>
        {prose}
        <S.BookByline>
          <span className="author">{thread.author?.name}</span>
        </S.BookByline>
      </S.Passage>
    );
  }

  return (
    <S.Passage>
      {prose}
      <S.ByLine>
        <span className="author">{thread.author?.name}</span>
        <span className="dot">·</span>
        <span>{toFormattedDate(thread.createdAt || "")}</span>
        <span className="spacer" />
        {canManage && (
          <>
            <button
              type="button"
              className="thread-action"
              title="Edit thread"
              onClick={() => onEdit(thread)}
            >
              <GrEdit size={12} />
            </button>
            <button
              type="button"
              className="thread-action danger"
              title="Delete thread"
              onClick={() => onDelete(thread)}
            >
              <FaRegTrashCan size={12} />
            </button>
          </>
        )}
      </S.ByLine>
    </S.Passage>
  );
};
