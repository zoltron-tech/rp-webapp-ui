import { pSBC } from "@nw/theme";

/**
 * Colour strings that arrived from another client, made safe for a style.
 *
 * A muse's accent, name colour and side-menu colours are free text written by
 * the web editor. CSS ignores a colour it cannot parse; React Native throws on
 * one and takes the screen down with it, so anything not recognisably a colour
 * is dropped here rather than reaching a style.
 */
export const asColor = (
  value: string | null | undefined,
): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^#[0-9a-f]{3,8}$/i.test(trimmed) || /^rgba?\(/i.test(trimmed)
    ? trimmed
    : undefined;
};

/**
 * Six-digit hex, or nothing — what `mixColors` and `withAlpha` can read.
 *
 * `rgb()` and `rgba()` convert too (alpha dropped): fandom colours are stored
 * that way, and without it every fandom tint fell back to the theme accent.
 */
export const asHex = (value: string | null | undefined): string | undefined => {
  const color = asColor(value);
  if (!color) return undefined;
  const rgb = color.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i,
  );
  if (rgb) {
    return `#${rgb
      .slice(1, 4)
      .map((channel) =>
        Math.min(255, Number(channel)).toString(16).padStart(2, "0"),
      )
      .join("")}`;
  }
  const hex = color.replace("#", "");
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex}`;
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex
      .split("")
      .map((char) => char + char)
      .join("")}`;
  }
  return undefined;
};

/** WCAG relative luminance of a colour `asHex` can read; 0 for anything else. */
const luminance = (color: string): number => {
  const hex = asHex(color);
  if (!hex) return 0;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const s = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio between two opaque colours, 1–21. */
export const contrastRatio = (a: string, b: string): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/**
 * `color`, darkened a step at a time until it reaches `target` contrast
 * against every one of `backgrounds` — the lightest shade of the colour that
 * still reads, rather than a fixed darkening that is too little for gold and
 * too much for iris. Black if nothing short of it gets there.
 */
export const darkenToContrast = (
  color: string,
  target: number,
  backgrounds: string[],
): string => {
  for (let step = 0; step <= 95; step += 1) {
    const shade =
      step === 0 ? asHex(color) : asHex(pSBC(-step / 100, color) as string);
    if (!shade) break;
    if (backgrounds.every((bg) => contrastRatio(shade, bg) >= target)) {
      return shade;
    }
  }
  return "#000000";
};

/**
 * Web's `color-mix(in srgb, X 75%, #000)`: each channel scaled by `keep`.
 * Anything that is not a colour `asHex` can read is returned untouched.
 */
export const mixWithBlack = (color: string, keep: number): string => {
  const hex = asHex(color);
  if (!hex) return color;
  return `#${[1, 3, 5]
    .map((i) =>
      Math.round(Number.parseInt(hex.slice(i, i + 2), 16) * keep)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

/**
 * `#rrggbb` with an alpha channel — web's `color-mix(in srgb, X 70%,
 * transparent)`. Anything that is not a six-digit hex is returned untouched
 * rather than turned into a string the platform would silently drop.
 */
export const withAlpha = (color: string, alpha: number): string => {
  const hex = asHex(color);
  if (!hex) return color;
  const channel = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${channel}`;
};
