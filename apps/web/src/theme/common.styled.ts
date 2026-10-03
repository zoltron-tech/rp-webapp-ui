"use client";

import { setOpacity } from "@nw/utils/theme";
import { css } from "styled-components";
import { __DEV__ } from "@/utils/constants";
import type { Theme } from "@nw/theme";

const DEV_MODE = __DEV__;

export const NO_USER_SELECT = css`
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const NO_SCROLLBAR = css`
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

export const BORDER_TOP = css`
  border-top: 1px solid ${({ theme }: any) => theme.hoverGreyAlpha};
`;

export const AVATAR_IMAGE = css`
  border-radius: 50%;
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);

  img {
    object-fit: cover;
    border-radius: 50%;
    pointer-events: none;
  }
`;

export const SPIN = css`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const CARD_BG_BLUR = css`
  /* From https://css.glass */
  /* background: ${({ theme }: any) => theme.modalBackground}; */
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(13px);
  -webkit-backdrop-filter: blur(13px);
`;

export const BLUR_FILTER = css`
  filter: blur(80px);
  -webkit-filter: blur(80px);
  -moz-filter: blur(80px);
  -o-filter: blur(80px);
  -ms-filter: blur(80px);
`;

export const PILL = css`
  border-radius: 60px;
`;

export const DEV_MODE_BORDER = (color = "red") => css`
  ${DEV_MODE && `border: 1px solid ${color}`};
`;

export const BACKGROUND_FADE = (color: keyof Theme = "background") => css`
  background-color: ${({ theme }: any) => setOpacity(theme[color], 0.5)};
`;

export const BACKGROUND_BLUR = (color: keyof Theme = "background") => css`
  ${BACKGROUND_FADE(color)}
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
`;

export const BASE_TRANSITION = css`
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
`;

/**
 * Glass — the functional layer only: bars, sidebars, menus, sheets.
 *
 * Never on cards, rows or page backgrounds; those take MATERIAL. The values,
 * and their Reduce Transparency / Increase Contrast fallbacks, are tokens in
 * globals.css, so every glass surface degrades together. `panel` is the more
 * opaque fill, for larger surfaces that carry a lot of text. `clear` is the
 * thin variant for small controls that float over imagery.
 */
const GLASS_FILL = {
  bar: "--glass-fill-bar",
  clear: "--glass-fill-clear",
  panel: "--glass-fill-panel",
} as const;

export const GLASS = (variant: keyof typeof GLASS_FILL = "bar") => css`
  background-color: var(${GLASS_FILL[variant]});
  -webkit-backdrop-filter: blur(
      ${variant === "clear" ? "calc(var(--glass-blur) / 2)" : "var(--glass-blur)"}
    )
    saturate(var(--glass-saturate));
  backdrop-filter: blur(
      ${variant === "clear" ? "calc(var(--glass-blur) / 2)" : "var(--glass-blur)"}
    )
    saturate(var(--glass-saturate));
  box-shadow: inset 0 1px 0 var(--glass-highlight), var(--glass-shadow);

  /* Engines without backdrop-filter paint nothing behind the fill, which
     would leave the surface see-through over real content. */
  @supports not (
    (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
  ) {
    background-color: var(--bg-2);
  }
`;

/** Material — depth inside the content layer: a translucent fill and a
 *  hairline, with no backdrop blur. */
export const MATERIAL = css`
  background-color: var(--material-fill);
  border: 1px solid var(--material-edge);
`;

/** A content card on the material tier: translucent fill, hairline, a faint
 *  top highlight and a soft drop, so cards read as lifted panes over the
 *  page's ambient light. Still no blur — a feed is dozens of these. */
export const MATERIAL_CARD = css`
  background-color: var(--material-fill-strong);
  border: 1px solid var(--material-edge);
  box-shadow:
    inset 0 1px 0 var(--material-highlight),
    0 18px 40px -28px rgb(0 0 0 / 0.7);
`;

/** Chips and small controls sitting on photos and cover art. A fixed dark dim
 *  rather than theme tokens, because what is behind them is an image, not the
 *  page; 58% keeps white 11px text above 4.5:1 even over a white cover. No
 *  blur: a rail of covers would otherwise be dozens of blurred layers. */
export const MEDIA_CHIP = css`
  color: #fff;
  background-color: rgb(0 0 0 / 0.58);
  border: 1px solid rgb(255 255 255 / 0.16);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.12),
    0 2px 8px rgb(0 0 0 / 0.35);

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    background-color: rgb(0 0 0 / 0.85);
  }
`;

/**
 * Glass for dialogs and bottom sheets.
 *
 * The regular panel glass read as an opaque slab here: an 80% fill over a 60%
 * black overlay leaves nothing to see through. This is the thinner fill with a
 * heavier blur doing the legibility work, a light catching the top edge, and a
 * deep drop so the dialog floats. Every token has a hard fallback because many
 * dialogs portal to <body>, where the theme classes (and so --bg-*) may be
 * absent — without them the fill would resolve to transparent.
 *
 * Pair with DIALOG_SCRIM, which dims without blurring: a blurred scrim that
 * wraps the panel would become its backdrop root and leave the glass nothing
 * but the scrim to sample (GLASS_REDESIGN_PLAN rule 9).
 */
export const GLASS_DIALOG = css`
  background-color: var(--glass-fill-dialog, var(--bg-2, #181917));
  background-image: linear-gradient(
    155deg,
    var(--glass-sheen, rgb(255 255 255 / 0.06)) 0%,
    transparent 42%
  );
  -webkit-backdrop-filter: blur(var(--glass-blur-dialog, 40px))
    saturate(var(--glass-saturate, 160%));
  backdrop-filter: blur(var(--glass-blur-dialog, 40px))
    saturate(var(--glass-saturate, 160%));
  border: 1px solid var(--glass-edge, rgb(255 255 255 / 0.11));
  box-shadow:
    inset 0 1px 0 var(--glass-highlight, rgb(255 255 255 / 0.07)),
    0 32px 80px -24px rgb(0 0 0 / 0.75);
  color: var(--text, #eceeec);

  @supports not (
    (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
  ) {
    background-color: var(--bg-2, #181917);
  }
`;

/** The dim behind a dialog. Deliberately no backdrop blur — see GLASS_DIALOG.
 *  Lighter than the old 60–72% black so the glass has a page to show. */
export const DIALOG_SCRIM = css`
  background-color: rgb(0 0 0 / 0.4);

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    background-color: rgb(0 0 0 / 0.72);
  }
`;

/** The one focus ring. Buttons reset with `all: unset` lose the browser's. */
export const FOCUS_RING = css`
  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }
`;

/**
 * Recessed text-entry well — inputs, textareas and select triggers on glass or
 * material. Focus trades the hairline for the accent plus a soft halo instead of
 * a hard outline, so a focused field reads as lit rather than boxed.
 */
export const FIELD = css`
  background-color: var(--field-fill, var(--bg-1));
  border: 1px solid var(--field-edge, var(--bg-6));
  border-radius: 12px;
  color: var(--text);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.75;
  }

  &:hover:not(:disabled):not(:focus) {
    border-color: color-mix(in srgb, var(--bg-12) 18%, transparent);
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: var(--accent-9, var(--accent));
    box-shadow: 0 0 0 3px
      var(--accent-a5, color-mix(in srgb, var(--accent) 35%, transparent));
  }
`;

/** The one primary action per surface: an accent pill with a lit top edge. */
export const PILL_PRIMARY = css`
  border-radius: 999px;
  border: 1px solid transparent;
  background-color: var(--accent);
  color: var(--text);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.14),
    0 8px 20px -10px rgb(0 0 0 / 0.6);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
  }

  &:disabled {
    background-color: var(--fill-pressed);
    color: var(--text-secondary);
    box-shadow: none;
    cursor: not-allowed;
  }

  ${FOCUS_RING}
`;

/** Secondary and cancel actions: a material pill that washes on hover. */
export const PILL_SECONDARY = css`
  border-radius: 999px;
  border: 1px solid var(--material-edge);
  background-color: var(--material-fill);
  color: var(--text);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: var(--fill-hover);
  }

  &:active:not(:disabled) {
    background-color: var(--fill-pressed);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${FOCUS_RING}
`;

/** Round 36px icon control (back, close, header actions) on the material tier. */
export const ICON_BUTTON = css`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--material-edge);
  background-color: var(--material-fill);
  color: var(--text);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: var(--fill-hover);
  }

  &:active {
    background-color: var(--fill-pressed);
  }

  svg {
    width: 18px;
    height: 18px;
  }

  ${FOCUS_RING}
`;

export const CARD_BORDER = css`
  border: 1px solid var(--bg-4);
`;
