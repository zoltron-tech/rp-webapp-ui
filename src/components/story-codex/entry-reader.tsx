"use client";

import type { CodexCategory, CodexEntry, StoryBoardEvent } from "@nw/types";
import type { FC } from "react";
import { GrEdit } from "react-icons/gr";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { resolveCodexIcon } from "./icons";
import * as S from "./styles";

type Props = {
  open: boolean;
  entry: CodexEntry | null;
  category: CodexCategory | null;
  /** Chapters this entry is marked as appearing in. */
  chapters: StoryBoardEvent[];
  canEdit: boolean;
  onClose: () => void;
  onEdit: (entry: CodexEntry) => void;
  onOpenChapter: (chapterId: string) => void;
};

/**
 * Reading view for a codex entry: the card only shows a clamped preview, so
 * this is where an entry is actually read — by members and, just as
 * importantly, by anyone browsing a public story who cannot edit it.
 */
export const EntryReader: FC<Props> = ({
  open,
  entry,
  category,
  chapters,
  canEdit,
  onClose,
  onEdit,
  onOpenChapter,
}) => {
  if (!entry) return null;
  const Icon = resolveCodexIcon(entry.icon);

  return (
    <ResponsiveSheet open={open} wide title={entry.name} onClose={onClose}>
      <S.ReaderHead>
        {entry.image ? (
          <S.ReaderThumb src={entry.image} alt="" />
        ) : (
          <S.CardIcon $color={entry.color}>
            <Icon size={18} />
          </S.CardIcon>
        )}
        <S.ReaderMeta>
          <S.ReaderName>{entry.name}</S.ReaderName>
          {category && <S.ReaderCategory>{category.name}</S.ReaderCategory>}
        </S.ReaderMeta>
        {canEdit && (
          <S.ToolButton type="button" onClick={() => onEdit(entry)}>
            <GrEdit size={13} />
            Edit
          </S.ToolButton>
        )}
      </S.ReaderHead>

      {entry.description ? (
        <RichTextRenderer
          savedText={entry.description}
          disableCollapse
          accent={entry.color}
        />
      ) : (
        <F.Hint>
          No description yet.
          {canEdit && " Open it in the editor to write one."}
        </F.Hint>
      )}

      {chapters.length > 0 && (
        <S.ChapterRow>
          Appears in
          {chapters.map((chapter) => (
            <S.ChapterChip
              key={chapter.id}
              type="button"
              title={`Open ${chapter.name}`}
              onClick={() => chapter.id && onOpenChapter(chapter.id)}
            >
              {chapter.name}
            </S.ChapterChip>
          ))}
        </S.ChapterRow>
      )}
    </ResponsiveSheet>
  );
};
