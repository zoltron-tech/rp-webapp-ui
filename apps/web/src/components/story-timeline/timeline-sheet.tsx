"use client";

import type { StoryTimelineLane } from "@nw/types";
import { pluralize } from "@nw/utils";
import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import { AppAlertDialog } from "@/components/dialog";
import * as S from "./styles";

/** Timeline accents, drawn from the app's existing palette variables. */
export const TIMELINE_COLORS = [
  "#e5484d",
  "#f76b15",
  "#ffb224",
  "#46a758",
  "#12a594",
  "#0091ff",
  "#6e56cf",
  "#e93d82",
];

type Props = {
  open: boolean;
  /** Null when creating a new timeline. The wire shape is still a "lane" —
   *  only the reader-facing name changed. */
  lane: StoryTimelineLane | null;
  /** How many chapters sit on this timeline — deleting takes them all off. */
  chapterCount?: number;
  onClose: () => void;
  onSave: (lane: StoryTimelineLane) => unknown;
  onDelete?: (lane: StoryTimelineLane) => unknown;
};

/** Create/rename/recolor one timeline (a POV, a plotline, a faction). */
export const TimelineSheet: FC<Props> = ({
  open,
  lane,
  chapterCount = 0,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Held while a delete is in flight: no save and no closing until it lands.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!lane || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(lane);
    } finally {
      setDeleting(false);
    }
  };

  // Reset whenever the sheet opens on a different timeline.
  useEffect(() => {
    if (!open) return;
    setName(lane?.name ?? "");
    setColor(lane?.color ?? TIMELINE_COLORS[0]);
    setConfirmDelete(false);
  }, [open, lane]);

  const trimmed = name.trim();

  return (
    <ResponsiveSheet
      open={open}
      title={lane ? "Edit timeline" : "New timeline"}
      confirmDisabled={trimmed.length === 0 || deleting}
      onConfirm={() =>
        onSave({
          color,
          id: lane?.id ?? null,
          name: trimmed,
          ordinal: lane?.ordinal ?? 0,
        })
      }
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      <S.Field>
        Name
        <S.TextInput
          value={name}
          maxLength={60}
          placeholder="Kael · the drowned coast"
          onChange={(e) => setName(e.target.value)}
        />
      </S.Field>

      <S.Field as="div">
        Colour
        <S.SwatchRow>
          {TIMELINE_COLORS.map((swatch) => (
            <S.Swatch
              key={swatch}
              type="button"
              $color={swatch}
              $active={color === swatch}
              aria-label={`Timeline colour ${swatch}`}
              aria-pressed={color === swatch}
              onClick={() => setColor(swatch)}
            />
          ))}
        </S.SwatchRow>
      </S.Field>

      <S.Hint>
        A timeline is a thread of the story — a POV character, a plotline, a
        faction. It runs as one line across the board, and its chapters branch
        off it above and below.
      </S.Hint>

      {lane && onDelete && (
        <S.DangerButton
          type="button"
          disabled={deleting}
          onClick={() => setConfirmDelete(true)}
        >
          <FaRegTrashCan size={13} />
          Delete timeline
        </S.DangerButton>
      )}

      <AppAlertDialog
        heading="Delete this timeline?"
        text={
          chapterCount > 0
            ? `${chapterCount} ${pluralize("chapter", chapterCount)} ${chapterCount === 1 ? "comes" : "come"} off it and ${chapterCount === 1 ? "goes" : "go"} back to the unplaced shelf. The chapters themselves are not deleted.`
            : "No chapters sit on it, so nothing else changes."
        }
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        actionButtonLabel="Delete"
        actionColor="negative"
        closeOnConfirm
        onConfirm={handleDelete}
      />
    </ResponsiveSheet>
  );
};
