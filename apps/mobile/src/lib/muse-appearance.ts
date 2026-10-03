import type {
  ImageCropFilter,
  ImageFilter,
  Muse,
  MuseNavItem,
} from "@nw/types";
import { hasUsableCrop } from "@nw/utils";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { asColor, asHex } from "@/lib/color";

/**
 * How a character asked to be drawn — web's `getMuseAppearance` plus the two
 * pictures its page is built from, resolved once for the whole screen.
 *
 * Everything is opt-in, as on web: a null colour or a false flag means "the
 * default styling", so muses saved before these fields existed look as they
 * always did. Colours are sanitised here (`asColor`) because they are free text
 * from the web editor and React Native throws on one it cannot parse.
 */
export interface MuseLook {
  /** The muse's own accent, already gated on `useAccent`. Six-digit hex. */
  accent?: string;
  nameColor?: string;
  pennedByColor?: string;
  menuBackground?: string;
  menuText?: string;
  hideExpandedBackground: boolean;
  hideSideMenuBackground: boolean;
  /** The full-bleed picture behind everything, and how web filters it. */
  wallpaper: { filters: ImageFilter; uri: string | null };
  /** The portrait on the card, with the pan and zoom the author set. */
  card: { crop: ImageCropFilter | null; uri: string | null };
}

/** Web's `DEFAULT_BANNER_FILTERS`: what the wallpaper gets when none is set. */
const DEFAULT_WALLPAPER_FILTERS: ImageFilter = {
  blur: 20,
  brightness: 50,
  greyscale: 20,
};

/**
 * The wallpaper is blurred by twenty pixels and dimmed by half before anyone
 * sees it, so it is fetched small: a 3,000-pixel original convolved on the UI
 * thread was the most expensive thing on the page, and nothing in the result
 * survives that a 600-pixel source would not have.
 */
const WALLPAPER_SIZE = { fit: "inside" as const, h: 900, q: 60, w: 600 };

export const museLook = (
  muse: Muse | MuseNavItem | null | undefined,
): MuseLook => {
  const accent = muse?.useAccent ? asHex(muse.accent) : undefined;
  const extra = muse?.useExtraImages ?? false;

  const wallpaperSrc = (extra && muse?.wallpaper?.src) || muse?.image || null;
  const cardSrc = (extra && muse?.cardBackground?.src) || muse?.image || null;
  // Only the card background carries a crop; the `image` fallback is uncropped.
  const cardCrop =
    extra &&
    muse?.cardBackground?.src &&
    hasUsableCrop(muse.cardBackground.crop)
      ? muse.cardBackground.crop
      : null;

  return {
    accent,
    card: {
      crop: cardCrop,
      // `inside`, never `cover`: the crop is percentages of the un-cropped
      // picture, so a proxy that squared it off first would move the framing.
      uri: wsrvImage(cardSrc, IMAGE_SIZES.CARD_BG),
    },
    hideExpandedBackground: muse?.hideExpandedBackground ?? false,
    hideSideMenuBackground: muse?.hideSideMenuBackground ?? false,
    menuBackground: asColor(muse?.sideMenuBgColor),
    menuText: asHex(muse?.sideMenuTextColor),
    nameColor: asColor(muse?.nameColor),
    pennedByColor: asColor(muse?.pennedByColor),
    wallpaper: {
      filters:
        extra && muse?.wallpaper?.filterValues
          ? muse.wallpaper.filterValues
          : DEFAULT_WALLPAPER_FILTERS,
      uri: wsrvImage(wallpaperSrc, WALLPAPER_SIZE),
    },
  };
};

export const museName = (
  muse:
    | { firstName?: string | null; lastName?: string | null }
    | null
    | undefined,
): string => [muse?.firstName, muse?.lastName].filter(Boolean).join(" ");
