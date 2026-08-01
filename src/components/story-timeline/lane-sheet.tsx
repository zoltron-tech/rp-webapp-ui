"use client";

import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import type { StoryTimelineLane } from "@/types";
import * as S from "./styles";

/** Lane accents, drawn from the app's existing palette variables. */
export const LANE_COLORS = [
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
  /** Null when creating a new lane. */
  lane: StoryTimelineLane | null;
  onClose: () => void;
  onSave: (lane: StoryTimelineLane) => void;
  onDelete?: (lane: StoryTimelineLane) => void;
};

/** Create/rename/recolor one timeline lane (a POV, a plotline, a faction). */
export const LaneSheet: FC<Props> = ({
  open,
  lane,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);

  // Reset whenever the sheet opens on a different lane.
  useEffect(() => {
    if (!open) return;
    setName(lane?.name ?? "");
    setColor(lane?.color ?? LANE_COLORS[0]);
  }, [open, lane]);

  const trimmed = name.trim();

  return (
    <ResponsiveSheet
      open={open}
      title={lane ? "Edit lane" : "New lane"}
      confirmDisabled={trimmed.length === 0}
      onConfirm={() =>
        onSave({
          color,
          id: lane?.id ?? null,
          name: trimmed,
          ordinal: lane?.ordinal ?? 0,
        })
      }
      onClose={onClose}
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
          {LANE_COLORS.map((swatch) => (
            <S.Swatch
              key={swatch}
              type="button"
              $color={swatch}
              $active={color === swatch}
              aria-label={`Lane colour ${swatch}`}
              aria-pressed={color === swatch}
              onClick={() => setColor(swatch)}
            />
          ))}
        </S.SwatchRow>
      </S.Field>

      <S.Hint>
        A lane is a thread of the story — a POV character, a plotline, a
        faction. Chapters sit on one lane each.
      </S.Hint>

      {lane && onDelete && (
        <S.DangerButton type="button" onClick={() => onDelete(lane)}>
          <FaRegTrashCan size={13} />
          Delete lane
        </S.DangerButton>
      )}
    </ResponsiveSheet>
  );
};
