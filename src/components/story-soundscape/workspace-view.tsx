"use client";

import { type FC, useCallback, useEffect, useState } from "react";
import { getChapterSoundscapeAction } from "@/app/rp/story/actions";
import type { SoundCue, StoryBoardEvent } from "@/types";
import { StorySoundscapeBoard } from "./index";
import * as S from "./styles";

type Props = {
  chapters: StoryBoardEvent[];
  /** The chapter whose soundscape is being edited; owned by the workspace. */
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  canEdit: boolean;
};

/**
 * The Sound view inside the storyboard workspace.
 *
 * A soundscape belongs to one chapter, so this view is a chapter selection
 * plus that chapter's cue board. On desktop the selection is made from the
 * workspace's list panel; the inline picker here is what mobile uses, where
 * there is no panel.
 */
export const StorySoundscapeView: FC<Props> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  canEdit,
}) => {
  const [cues, setCues] = useState<SoundCue[]>([]);
  const [passageCount, setPassageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const chapter =
    chapters.find((candidate) => candidate.id === selectedChapterId) ?? null;

  const load = useCallback(async () => {
    if (!selectedChapterId) return;
    setLoading(true);
    const result = await getChapterSoundscapeAction(selectedChapterId);
    setLoading(false);
    if (!result || "message" in result) return;
    setCues(result.cues);
    setPassageCount(result.passageCount);
  }, [selectedChapterId]);

  useEffect(() => {
    setCues([]);
    setPassageCount(0);
    load();
  }, [load]);

  if (chapters.length === 0) {
    return (
      <S.Root>
        <S.HeaderRow>
          <S.Title>Soundscape</S.Title>
        </S.HeaderRow>
        <S.EmptyBoard>
          Cues are mounted to a chapter's passages, so this story needs a
          chapter first.
        </S.EmptyBoard>
      </S.Root>
    );
  }

  return (
    <S.Root>
      {/* Mobile's chapter picker — desktop drives this from the list panel. */}
      <S.ChapterPicker aria-label="Chapter">
        {chapters.map((candidate) => (
          <S.ChapterPickerTab
            key={candidate.id}
            type="button"
            $active={candidate.id === selectedChapterId}
            aria-pressed={candidate.id === selectedChapterId}
            onClick={() => candidate.id && onSelectChapter(candidate.id)}
          >
            {candidate.name}
          </S.ChapterPickerTab>
        ))}
      </S.ChapterPicker>

      {!chapter ? (
        <S.EmptyBoard>Pick a chapter to give it a soundscape.</S.EmptyBoard>
      ) : loading ? (
        <S.EmptyBoard>Loading {chapter.name}'s cues…</S.EmptyBoard>
      ) : (
        <StorySoundscapeBoard
          key={chapter.id}
          storyboardEventId={chapter.id ?? ""}
          cues={cues}
          passageCount={passageCount}
          // Nobody is reading along in the editor, so there is no playhead to
          // follow — park it on the first passage.
          currentPassage={0}
          canEdit={canEdit}
          onCuesChanged={setCues}
        />
      )}
    </S.Root>
  );
};
