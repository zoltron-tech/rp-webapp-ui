"use client";

import { type FC, useEffect, useState } from "react";
import { LuHistory } from "react-icons/lu";
import { MdOutlineDoNotDisturbOn } from "react-icons/md";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import type { StoryBoardEvent, StoryTimelineLane } from "@/types";
import * as S from "./styles";

export type BlockPlacement = {
  start: number;
  end: number;
  laneId: string | null;
  isFlashback: boolean;
};

type Props = {
  open: boolean;
  event: StoryBoardEvent | null;
  lanes: StoryTimelineLane[];
  /** 1-based position in reading order. */
  readingPosition: number;
  /** 1-based position in story-time order; null while unplaced. */
  chronoPosition: number | null;
  canEdit: boolean;
  onClose: () => void;
  onSave: (placement: BlockPlacement) => void;
  /** Returns the chapter to the unplaced shelf. */
  onUnplace: () => void;
};

const DEFAULT_SPAN = 8;

/**
 * A chapter's placement, opened by tapping its block (or an unplaced chip).
 *
 * On desktop this backs up the drag interactions; on mobile it *is* the edit
 * path — dragging a block around a 375px track is not a real gesture, so the
 * span is set with steppers instead.
 */
export const BlockSheet: FC<Props> = ({
  open,
  event,
  lanes,
  readingPosition,
  chronoPosition,
  canEdit,
  onClose,
  onSave,
  onUnplace,
}) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(DEFAULT_SPAN);
  const [laneId, setLaneId] = useState<string | null>(null);
  const [isFlashback, setIsFlashback] = useState(false);

  useEffect(() => {
    if (!open || !event) return;
    const placed = event.timelineStart != null && event.timelineEnd != null;
    setStart(placed ? (event.timelineStart as number) : 0);
    setEnd(placed ? (event.timelineEnd as number) : DEFAULT_SPAN);
    setLaneId(event.timelineLaneId ?? lanes[0]?.id ?? null);
    setIsFlashback(Boolean(event.isFlashback));
  }, [open, event, lanes]);

  if (!event) return null;

  // The reading order and the story-time order disagreeing is the whole point
  // of this view — surface it, and offer the flashback flag when it happens.
  const outOfOrder =
    chronoPosition !== null && chronoPosition !== readingPosition;

  return (
    <ResponsiveSheet
      open={open}
      title={event.name}
      onConfirm={
        canEdit
          ? () =>
              onSave({
                end: Math.max(start, end),
                isFlashback,
                laneId,
                start: Math.min(start, end),
              })
          : undefined
      }
      onClose={onClose}
    >
      <S.NoteRow>
        <span>
          Reads <b>{readingPosition}</b>
          {chronoPosition !== null ? (
            <>
              {" · happens "}
              <b>{chronoPosition}</b>
            </>
          ) : (
            " · not placed on the timeline yet"
          )}
        </span>
        {outOfOrder && (
          <span>
            This chapter is read out of story order — flag it as a flashback so
            readers see it that way.
          </span>
        )}
      </S.NoteRow>

      {!canEdit ? (
        <S.Hint>Only members of this story can change the timeline.</S.Hint>
      ) : (
        <>
          <S.Field as="div">
            Starts at
            <S.RangeRow>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={start}
                aria-label="Starts at"
                onChange={(e) => setStart(Number(e.target.value))}
              />
              <S.RangeValue>{start.toFixed(1)}</S.RangeValue>
            </S.RangeRow>
          </S.Field>

          <S.Field as="div">
            Ends at
            <S.RangeRow>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={end}
                aria-label="Ends at"
                onChange={(e) => setEnd(Number(e.target.value))}
              />
              <S.RangeValue>{end.toFixed(1)}</S.RangeValue>
            </S.RangeRow>
          </S.Field>

          <S.Field as="div">
            Lane
            <S.ChoiceRow>
              {lanes.length === 0 && (
                <S.Hint>Add a lane first — chapters sit on one each.</S.Hint>
              )}
              {lanes.map((lane) => (
                <S.Choice
                  key={lane.id}
                  type="button"
                  $active={laneId === lane.id}
                  $color={lane.color ?? null}
                  aria-pressed={laneId === lane.id}
                  onClick={() => setLaneId(lane.id)}
                >
                  {lane.name}
                </S.Choice>
              ))}
            </S.ChoiceRow>
          </S.Field>

          <S.ToggleRow
            type="button"
            $active={isFlashback}
            aria-pressed={isFlashback}
            onClick={() => setIsFlashback((v) => !v)}
          >
            <LuHistory size={16} />
            Flashback — reads later than it happens
          </S.ToggleRow>

          {event.timelineStart != null && (
            <S.DangerButton type="button" onClick={onUnplace}>
              <MdOutlineDoNotDisturbOn size={14} />
              Remove from the timeline
            </S.DangerButton>
          )}
        </>
      )}
    </ResponsiveSheet>
  );
};
