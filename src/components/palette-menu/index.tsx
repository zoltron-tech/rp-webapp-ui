"use client";

import { ACCENT_MAP, type AccentValue } from "@nw/types/theme";
import classNames from "classnames";
import { Popover } from "radix-ui";
import { type FC, useCallback, useState } from "react";
import { IoColorPaletteOutline } from "react-icons/io5";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import * as S from "./styles";

const PALETTES = Object.values(ACCENT_MAP);

/**
 * Lets a signed-out reader repaint the landing page in any of the palettes an
 * account can be set to, before they have an account to set one on.
 *
 * The pick is a preview only: it lives in the in-memory store (see
 * `accentPreview` in StoreState), so navigating away or refreshing puts the
 * default palette back and nothing is written to the user or a cookie.
 */
type Props = {
  /** Carries the bar's `searchBarExpanded` class so the trigger collapses out
   *  of the way when the mobile search takes the row. */
  className?: string;
};

export const PaletteMenu: FC<Props> = ({ className }) => {
  const accent = useGlobalState("accent");
  const accentPreview = useGlobalState("accentPreview");
  const theme = useGlobalState("theme");
  const setGlobalState = useGlobalStoreSet();
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (value: AccentValue) => () => {
      setGlobalState({ accentPreview: value });
    },
    [setGlobalState],
  );

  return (
    <S.PositionContainer className={className}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <S.TriggerButton aria-label="Change colour palette">
            <IoColorPaletteOutline className="menu-icon" />
          </S.TriggerButton>
        </Popover.Trigger>

        <Popover.Portal>
          {/* Portalled out of the bar, so it has to re-declare the palette and
              theme classes the CSS variables hang off. */}
          <S.PopoverContent
            align="end"
            sideOffset={12}
            collisionPadding={12}
            className={classNames([accent, theme])}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <S.Header>
              <S.Title>Palette</S.Title>
              <S.Subtitle>Try a colour — just for this visit.</S.Subtitle>
            </S.Header>
            <S.PaletteGroup>
              {PALETTES.map((value) => (
                <S.PaletteOption
                  key={value}
                  className={classNames(value)}
                  data-selected={(accentPreview ?? accent) === value}
                >
                  <input
                    type="radio"
                    name="landing-palette"
                    value={value}
                    checked={(accentPreview ?? accent) === value}
                    onChange={handleSelect(value)}
                  />
                  <span className="palette-swatch" aria-hidden="true" />
                  <span className="palette-name">{value}</span>
                </S.PaletteOption>
              ))}
            </S.PaletteGroup>
          </S.PopoverContent>
        </Popover.Portal>
      </Popover.Root>
    </S.PositionContainer>
  );
};
