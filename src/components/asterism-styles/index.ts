import {
  type AsterismStyle,
  type AsterismStyleOption,
  DEFAULT_ASTERISM_STYLE,
} from "./types";

export type {
  AsterismLineVariant,
  AsterismStyle,
  AsterismStyleOption,
} from "./types";
export { DEFAULT_ASTERISM_STYLE } from "./types";

/** Styles offered in the chapter editor's dropdowns, in display order. */
export const ASTERISM_STYLES: AsterismStyleOption[] = [
  {
    description: "Three raised dots — the traditional scene break",
    glyph: "⁂",
    label: "Classic asterism",
    lineVariant: "gradient",
    value: "classic",
  },
  {
    description: "A single decorative leaf on a solid rule",
    glyph: "❦",
    label: "Fleuron",
    lineVariant: "solid",
    value: "fleuron",
  },
  {
    description: "A mirrored, flowing leaf on a dashed rule",
    glyph: "❧",
    label: "Flourish",
    lineVariant: "dashed",
    value: "flourish",
  },
  {
    description: "A bold diamond on a double rule",
    glyph: "❖",
    label: "Diamond",
    lineVariant: "double",
    value: "diamond",
  },
  {
    description: "A four-pointed star on a dotted rule",
    glyph: "✦",
    label: "Stars",
    lineVariant: "dotted",
    value: "stars",
  },
  {
    description: "A round dot on a beaded rule",
    glyph: "●",
    label: "Dots",
    lineVariant: "beaded",
    value: "dots",
  },
  {
    description: "No divider between passages",
    glyph: "",
    label: "None",
    lineVariant: "solid",
    value: "none",
  },
];

/** True when `value` is a known asterism style. */
export const isAsterismStyle = (
  value: string | null | undefined,
): value is AsterismStyle =>
  ASTERISM_STYLES.some((style) => style.value === value);

/** Resolves a saved key to its style option, falling back to the default
 *  style for any value the frontend doesn't recognize. */
export const resolveAsterismStyle = (
  value: string | null | undefined,
): AsterismStyleOption =>
  ASTERISM_STYLES.find((style) => style.value === value) ??
  ASTERISM_STYLES.find((style) => style.value === DEFAULT_ASTERISM_STYLE)!;
