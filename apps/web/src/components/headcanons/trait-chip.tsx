"use client";

import type { FC } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import * as S from "./styles";
import { TraitGlyph } from "./trait-art";

type Props = {
  traitKey: string;
  label: string;
  group?: string | null;
  /** Drawn solid — picked in the picker, or the note being shown. */
  on?: boolean;
  /** Toggle semantics (the picker, a visitor showing a note). */
  pressed?: boolean;
  /** Shows a check at the end of an `on` chip. */
  checked?: boolean;
  /** Shows an × and labels the chip as a remove button. */
  removable?: boolean;
  hasNote?: boolean;
  disabled?: boolean;
  clash?: boolean;
  title?: string;
  onClick?: () => void;
};

/** One trait: its little drawing in a bubble, then the name. */
export const TraitChip: FC<Props> = ({
  traitKey,
  label,
  group,
  on,
  pressed,
  checked,
  removable,
  hasNote,
  disabled,
  clash,
  title,
  onClick,
}) => (
  <S.TraitChip
    type="button"
    $hue={S.traitHue(group)}
    $on={on}
    aria-pressed={pressed}
    aria-label={removable ? `Remove ${label}` : undefined}
    disabled={disabled}
    data-clash={clash || undefined}
    title={title}
    onClick={onClick}
  >
    <span className="bubble">
      <TraitGlyph traitKey={traitKey} group={group ?? undefined} size={18} />
    </span>
    <span className="label">{label}</span>
    {hasNote && <span className="dot" role="img" aria-label="has a note" />}
    {removable ? (
      <span className="mark" aria-hidden="true">
        <FiX size={12} strokeWidth={3} />
      </span>
    ) : (
      checked && (
        <span className="mark" aria-hidden="true">
          <FiCheck size={12} strokeWidth={3} />
        </span>
      )
    )}
  </S.TraitChip>
);
