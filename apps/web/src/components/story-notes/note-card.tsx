"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StoryNote } from "@nw/types";
import type { FC } from "react";
import { LuArchive, LuArchiveRestore, LuLock } from "react-icons/lu";
import { RxDragHandleDots2 } from "react-icons/rx";
import { PushPinIcon } from "@/components/user-menu/user-menu-icons";
import { toFormattedDate } from "@/utils/helpers";
import { Ballot, votesLabel } from "./ballot";
import * as S from "./styles";

/**
 * What the card shows of a rich-text note: its prose, stripped of markup, and
 * its first embedded image — a note that is only a GIF still gets a thumbnail
 * rather than an empty sticky.
 */
export const summarise = (html: string | null | undefined) => {
  if (!html || typeof document === "undefined") {
    return { image: null as string | null, text: "" };
  }
  const scratch = document.createElement("div");
  scratch.innerHTML = html;
  return {
    image: scratch.querySelector("img")?.getAttribute("src") ?? null,
    text: (scratch.textContent ?? "").trim(),
  };
};

type Props = {
  note: StoryNote & { id: string };
  /** Off while searching or in the Archive tab, where the board order is
   *  not what is on screen and a drag would reorder something invisible. */
  sortable: boolean;
  /** A pin/archive toggle is in flight — both hold until it lands. */
  pending?: boolean;
  onOpen: (note: StoryNote) => void;
  onTogglePin: (note: StoryNote) => void;
  onToggleArchive: (note: StoryNote) => void;
};

export const NoteCard: FC<Props> = ({
  note,
  sortable,
  pending = false,
  onOpen,
  onTogglePin,
  onToggleArchive,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ disabled: !sortable, id: note.id });

  const { image, text } = summarise(note.content);
  const hasTitle = Boolean(note.title);
  const isPoll = note.noteType === "POLL";
  const totalVotes = note.totalVotes ?? 0;
  // A shared board is worth attributing: whoever touched it last owns the
  // state of it, falling back to whoever wrote it in the first place.
  const byline = note.modifiedByName ?? note.createdByName;

  return (
    <S.Card
      ref={setNodeRef}
      $color={note.color}
      $dragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <S.PinButton
        type="button"
        $active={note.isPinned}
        aria-pressed={note.isPinned}
        aria-label={note.isPinned ? "Unpin this note" : "Pin this note"}
        title={note.isPinned ? "Unpin" : "Pin"}
        disabled={pending}
        aria-busy={pending}
        onClick={() => onTogglePin(note)}
      >
        {/* One pin, either way — the button scales and angles it, so the
            control always reads as "pin" and its state reads off how the pin
            itself is sitting. */}
        <PushPinIcon size={28} />
      </S.PinButton>

      <S.CardOpen
        type="button"
        aria-label={
          isPoll
            ? `Open the poll ${note.title || ""} — ${votesLabel(totalVotes)}`
            : `Open ${note.title || "this note"}`
        }
        onClick={() => onOpen(note)}
      >
        {hasTitle && (
          <S.CardTitle title={note.title ?? ""}>{note.title}</S.CardTitle>
        )}
        {image && <S.CardThumb src={image} alt="" />}
        {text.length > 0 && <S.CardBody $titled={hasTitle}>{text}</S.CardBody>}

        {/* The card previews the result; voting happens in the note itself,
            since this whole surface is already the button that opens it. */}
        {isPoll && (
          <>
            <Ballot
              inline
              options={note.pollOptions ?? []}
              totalVotes={totalVotes}
              myVoteOptionId={note.myVoteOptionId}
              limit={3}
            />
            <S.BallotFoot as="span">
              {votesLabel(totalVotes)}
              {note.isPollClosed && (
                <>
                  ·
                  <LuLock size={11} />
                  Closed
                </>
              )}
            </S.BallotFoot>
          </>
        )}
      </S.CardOpen>

      <S.CardFooter>
        <S.Byline>
          {note.createdByImage && (
            <S.BylineAvatar src={note.createdByImage} alt="" />
          )}
          {byline ? `${byline} · ` : ""}
          {toFormattedDate(note.modifiedAt ?? note.createdAt ?? undefined)}
        </S.Byline>

        <S.CardAction
          type="button"
          aria-label={
            note.isArchived ? "Restore this note" : "Archive this note"
          }
          title={note.isArchived ? "Restore" : "Archive"}
          disabled={pending}
          aria-busy={pending}
          onClick={() => onToggleArchive(note)}
        >
          {note.isArchived ? (
            <LuArchiveRestore size={14} />
          ) : (
            <LuArchive size={14} />
          )}
        </S.CardAction>

        {sortable && (
          <S.DragHandle
            type="button"
            aria-label={`Drag to reorder ${note.title || "this note"}`}
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <RxDragHandleDots2 size={16} />
          </S.DragHandle>
        )}
      </S.CardFooter>
    </S.Card>
  );
};
