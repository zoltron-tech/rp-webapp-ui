import type { AccentValue } from "@nw/types/theme";
import { ACCENT_DEFINITIONS, type ColorScale, JADE, OLIVE } from "./scales";

/**
 * Accent colour, as data.
 *
 * The web app gets this from CSS: `globals.css` imports the Radix scales and
 * each accent class remaps twelve `--accent-*` steps — and twelve `--bg-*`
 * ones — which every stylesheet then reads. React Native has no cascade and no
 * custom properties, so the same numbers have to exist as values, and they must
 * be *the same numbers* or the two clients drift the first time someone tweaks
 * a shade. They live in `./scales`, lifted from that stylesheet.
 *
 * **Jade is the default** — `ACCENT_MAP[0]`, what a novelist with no palette
 * preference sees.
 */

export type { ColorScale };

/** @radix-ui/colors, jade-dark. The default accent's scale. */
export { JADE, OLIVE };

/**
 * What a view actually asks for, named after the job rather than the step
 * number — mirroring the semantic aliases at the bottom of each accent block in
 * `globals.css`.
 */
export interface Accent {
  name: AccentValue;
  /** `--accent`. The logo tile, quiet accent surfaces. */
  surface: string;
  /** `--accent-hover`. Borders on those surfaces. */
  surfaceHover: string;
  /** `--accent-active`. */
  surfaceActive: string;
  /** Step 9 — the solid, saturated fill. Primary buttons. */
  solid: string;
  /** Step 10 — solid, hovered. */
  solidHover: string;
  /** Step 11 — accent text on a dark background. Links. */
  text: string;
  /** Step 12 — the boldest accent text. */
  textStrong: string;
  /** Step 3 — the faintest usable tint, for selected rows and unread marks. */
  tint: string;
  /** Step 4 — one step up from `tint`. */
  tintStrong: string;
}

/**
 * The neutral scale an accent is paired with — web's `--bg-1` … `--bg-12`.
 *
 * Not cosmetic: an accent class remaps the greys as well, so crimson is mauve
 * panels and cyan is gray ones. A client that read only the accent would paint
 * every theme on olive.
 */
export const getNeutral = (name: AccentValue = "jade"): ColorScale =>
  (ACCENT_DEFINITIONS[name] ?? ACCENT_DEFINITIONS.jade).neutral;

/**
 * One object per accent, built once.
 *
 * There are twelve accents and their steps never change, but this is called
 * inside render — several times per list row on the native client, which reads
 * the accent through a hook rather than a CSS variable. Returning a fresh
 * object each time made every memoised child fail its comparison on identity
 * alone, so the cache buys stable references as much as it saves the work.
 */
const ACCENTS = new Map<AccentValue, Accent>();

export const getAccent = (name: AccentValue = "jade"): Accent => {
  const key: AccentValue = ACCENT_DEFINITIONS[name] ? name : "jade";
  const cached = ACCENTS.get(key);
  if (cached) return cached;

  const definition = ACCENT_DEFINITIONS[key];
  const scale = definition.accent;

  const accent: Accent = {
    name: key,
    solid: scale[8],
    solidHover: scale[9],
    // Step numbers, not fixed indices: the six pastel accents put their quiet
    // surface at step 6, and the six saturated ones at step 9, exactly as their
    // classes do on web.
    surface: scale[definition.solid - 1],
    surfaceActive: scale[definition.active - 1],
    surfaceHover: scale[definition.hover - 1],
    text: scale[10],
    textStrong: scale[11],
    tint: scale[2],
    tintStrong: scale[3],
  };

  ACCENTS.set(key, accent);
  return accent;
};

/** The default accent, for code with no user to read a preference from. */
export const DEFAULT_ACCENT = getAccent("jade");

/**
 * Two colours mixed, the way `color-mix(in srgb, a X%, b)` mixes them.
 *
 * The web app builds several accent surfaces that way — the XP chip's fill is
 * `color-mix(in srgb, var(--accent) 20%, var(--bg-2))` — and React Native has
 * no equivalent, so the mix happens here instead of on the phone becoming a
 * hand-picked colour that drifts from the web one.
 *
 * Hex in, hex out. Both inputs must be `#rgb` or `#rrggbb`; anything else
 * returns `base` unchanged rather than throwing, because a bad colour should
 * cost a wrong shade rather than a blank screen.
 */
export const mixColors = (
  color: string,
  ratio: number,
  base: string,
): string => {
  const parse = (value: string): [number, number, number] | null => {
    const hex = value.trim().replace("#", "");
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;
    if (!/^[0-9a-f]{6}$/i.test(full)) return null;
    return [
      Number.parseInt(full.slice(0, 2), 16),
      Number.parseInt(full.slice(2, 4), 16),
      Number.parseInt(full.slice(4, 6), 16),
    ];
  };

  const a = parse(color);
  const b = parse(base);
  if (!a || !b) return base;

  const weight = Math.min(1, Math.max(0, ratio));
  const channel = (index: number) =>
    Math.round(a[index] * weight + b[index] * (1 - weight))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(0)}${channel(1)}${channel(2)}`;
};
