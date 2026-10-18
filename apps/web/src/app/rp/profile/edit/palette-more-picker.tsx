"use client";

import { ACCENT_MAP, type Accent, MORE_ACCENTS } from "@nw/types/theme";
import { RadioGroup } from "radix-ui";
import { type FC, useEffect, useState } from "react";
import { AppAlertDialog } from "@/components/dialog";
import { EditTray } from "./edit-tray";
import * as S from "./styled";

type PaletteMorePickerProps = {
  open: boolean;
  isMobile: boolean;
  /** The palette currently chosen in the form. */
  value: Accent;
  onCancel: () => void;
  onConfirm: (palette: Accent) => void;
};

/**
 * The palettes beyond the basic four, behind Edit profile's "More" tile:
 * a tray on mobile, a dialog on desktop. The choice is held here until
 * confirmed, then handed to the form like a tap on a basic swatch.
 */
export const PaletteMorePicker: FC<PaletteMorePickerProps> = ({
  open,
  isMobile,
  value,
  onCancel,
  onConfirm,
}) => {
  const [picked, setPicked] = useState<Accent>(value);

  useEffect(() => {
    if (open) setPicked(value);
  }, [open, value]);

  const body = (
    <S.PaletteGroup
      value={String(picked)}
      onValueChange={(v) => setPicked(Number(v) as Accent)}
      aria-label="More theme colors"
    >
      <S.PaletteRow>
        {MORE_ACCENTS.map((key) => {
          const color = ACCENT_MAP[key];
          return (
            <S.RadioItemContainer key={key} className={color}>
              <RadioGroup.Item
                className="radio-item"
                value={String(key)}
                id={`palette-more-${key}`}
                aria-label={`Palette ${color}`}
              />
              <label className="palette-name" htmlFor={`palette-more-${key}`}>
                {color}
              </label>
            </S.RadioItemContainer>
          );
        })}
      </S.PaletteRow>
    </S.PaletteGroup>
  );

  if (isMobile) {
    return (
      <EditTray
        open={open}
        title="More colors"
        confirmLabel="Use this color"
        onCancel={onCancel}
        onConfirm={() => onConfirm(picked)}
      >
        {body}
      </EditTray>
    );
  }

  return (
    <AppAlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      heading="More colors"
      text="Pick a theme color for the app and your profile."
      actionButtonLabel="Use color"
      closeButtonText="Cancel"
      actionColor="neutral"
      onConfirm={() => onConfirm(picked)}
      onCancel={onCancel}
      body={body}
    />
  );
};
