"use client";

import type { StoryTimelineMarker } from "@nw/types";
import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as S from "./styles";

type Props = {
  open: boolean;
  /** Null when creating a new marker. */
  marker: StoryTimelineMarker | null;
  onClose: () => void;
  onSave: (marker: StoryTimelineMarker) => unknown;
  onDelete?: (marker: StoryTimelineMarker) => unknown;
};

/**
 * Create/move/rename one axis marker. Markers are what make an abstract
 * position mean something — "The Drowning" at 40 is the only reason 35 reads
 * as "five years before it".
 */
export const MarkerSheet: FC<Props> = ({
  open,
  marker,
  onClose,
  onSave,
  onDelete,
}) => {
  const [label, setLabel] = useState("");
  const [position, setPosition] = useState(50);
  // Held while a delete is in flight: no second delete, no save, no closing.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!marker || !onDelete || deleting) return;
    setDeleting(true);
    try {
      await onDelete(marker);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setLabel(marker?.label ?? "");
    setPosition(marker?.position ?? 50);
  }, [open, marker]);

  const trimmed = label.trim();

  return (
    <ResponsiveSheet
      open={open}
      title={marker ? "Edit marker" : "New marker"}
      confirmDisabled={trimmed.length === 0 || deleting}
      onConfirm={() =>
        onSave({
          id: marker?.id ?? null,
          label: trimmed,
          ordinal: marker?.ordinal ?? 0,
          position,
        })
      }
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      <S.Field>
        Label
        <S.TextInput
          value={label}
          maxLength={80}
          placeholder="The Drowning"
          onChange={(e) => setLabel(e.target.value)}
        />
      </S.Field>

      <S.Field as="div">
        Position on the axis
        <S.RangeRow>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={position}
            aria-label="Position on the axis"
            onChange={(e) => setPosition(Number(e.target.value))}
          />
          <S.RangeValue>{position.toFixed(1)}</S.RangeValue>
        </S.RangeRow>
      </S.Field>

      <S.Hint>
        The axis is story time, not real dates — 0 is the earliest thing that
        happens, 100 the latest. Markers name the points that matter, and
        chapters snap to them as you drag.
      </S.Hint>

      {marker && onDelete && (
        <S.DangerButton
          type="button"
          disabled={deleting}
          aria-busy={deleting}
          onClick={handleDelete}
        >
          <FaRegTrashCan size={13} />
          Delete marker
        </S.DangerButton>
      )}
    </ResponsiveSheet>
  );
};
