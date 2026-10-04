import { HIGHLIGHT_COLORS } from "@nw/richtext";
import { ACCENT_DEFINITIONS } from "@nw/theme";
import { ACCENT_MAP } from "@nw/types/theme";

export interface HighlightSwatch {
  name: string;
  value: string;
}

/**
 * Web's `THEME_HIGHLIGHT_COLORS`: one swatch per profile palette, in palette
 * order, at the scale's vivid step 9 — each palette's own accent can sit at
 * step 6, which is too dark to read as highlighted text.
 */
export const THEME_HIGHLIGHT_COLORS: HighlightSwatch[] = Object.values(
  ACCENT_MAP,
).map((palette) => ({
  name: palette.charAt(0).toUpperCase() + palette.slice(1),
  value: ACCENT_DEFINITIONS[palette].accent[8],
}));

const SWATCHES = [...HIGHLIGHT_COLORS, ...THEME_HIGHLIGHT_COLORS];

const channels = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  const channel = (index: number) =>
    Number.parseInt(value.slice(index, index + 2), 16);
  return [channel(0), channel(2), channel(4)];
};

/**
 * What web's `applyHighlight` writes for a swatch: the text in the swatch
 * mixed 35% towards white, on the swatch at 16% — a highlighter pen, not a
 * block of paint. The solid swatch behind text of nearly its own colour was
 * what made a highlight hard to read here.
 *
 * The strings are the ones a browser serialises, so a highlight made on a
 * phone is stored exactly as one made on web.
 */
export const highlightStyle = (
  hex: string,
): { background: string; color: string } => {
  const [r, g, b] = channels(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.35);
  return {
    background: `rgba(${r}, ${g}, ${b}, 0.16)`,
    color: `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`,
  };
};

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;

/**
 * The swatch a stored highlight was made from, or null if it is none of ours.
 *
 * A highlight is stored as its tinted background, `rgba(r, g, b, 0.16)`;
 * earlier builds of this app stored the swatch itself, as hex. Either way the
 * red, green and blue are the swatch's.
 */
export const highlightSwatch = (background: string | null): string | null => {
  if (!background) return null;
  const value = background.trim().toLowerCase();
  const parts = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  const hex = parts
    ? toHex(Number(parts[1]), Number(parts[2]), Number(parts[3]))
    : value;
  return SWATCHES.find((swatch) => swatch.value.toLowerCase() === hex)
    ? hex
    : /^#[0-9a-f]{6}$/.test(hex)
      ? hex
      : null;
};
