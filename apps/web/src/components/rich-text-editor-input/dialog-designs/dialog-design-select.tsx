"use client";

import type { FC } from "react";
import * as S from "./dialog-design-select.styles";
import { DIALOG_DESIGNS, type DialogDesign } from "./index";

type Props = {
  value: DialogDesign;
  onChange: (design: DialogDesign) => void;
};

/** Dropdown that picks how embedded dialogs are displayed in the reader. */
export const DialogDesignSelect: FC<Props> = ({ value, onChange }) => (
  <S.Wrap>
    <S.Label htmlFor="dialog-design-select">Dialog style</S.Label>
    <S.Select
      id="dialog-design-select"
      value={value}
      onChange={(e) => onChange(e.target.value as DialogDesign)}
    >
      {DIALOG_DESIGNS.map((design) => (
        <option key={design.value} value={design.value}>
          {design.label}
        </option>
      ))}
    </S.Select>
  </S.Wrap>
);
