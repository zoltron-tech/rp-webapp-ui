import type { Muse, MuseNavItem } from "@nw/types";

/**
 * Advanced appearance overrides configured on the muse (Edit character →
 * Appearance → Advanced). Everything is opt-in: a null colour or a false flag
 * means "render the default styling", so profiles saved before these fields
 * existed are unaffected.
 */
export type MuseAppearance = {
  /** Accent colour, already gated on `useAccent` (undefined when disabled). */
  accent: string | undefined;
  nameColor: string | null;
  pennedByColor: string | null;
  sideMenuBgColor: string | null;
  sideMenuTextColor: string | null;
  hideExpandedBackground: boolean;
  hideSideMenuBackground: boolean;
};

/** Treats blank/whitespace-only colours as unset. */
const color = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export function getMuseAppearance(
  muse?: Muse | MuseNavItem | null,
): MuseAppearance {
  return {
    accent: muse?.useAccent ? (muse.accent ?? undefined) : undefined,
    hideExpandedBackground: muse?.hideExpandedBackground ?? false,
    hideSideMenuBackground: muse?.hideSideMenuBackground ?? false,
    nameColor: color(muse?.nameColor),
    pennedByColor: color(muse?.pennedByColor),
    sideMenuBgColor: color(muse?.sideMenuBgColor),
    sideMenuTextColor: color(muse?.sideMenuTextColor),
  };
}
