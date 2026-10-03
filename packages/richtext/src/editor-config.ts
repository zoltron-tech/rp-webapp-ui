import { BULLET_GLYPHS } from "./parse";
import type { RichAlign } from "./types";

/**
 * What the toolbar offers, on both clients.
 *
 * These are `apps/web/src/components/rich-text-editor-input/editor-config.tsx`'s
 * tables, minus the React icons: the three sizes, the fifteen swatches, the
 * bullet and numbering styles and the quotation marks. They are here rather
 * than copied into the native editor because every value is a *stored* value —
 * a bullet's name ends up in `data-list-style-type`, a swatch in a `span`'s
 * background — and two clients with two lists is how a bullet picked on one
 * becomes a disc on the other.
 */

/**
 * The three sizes, in the pixels the parser resolves them to.
 *
 * `undefined` is "Normal": the default size is deliberately not recorded on a
 * run (see `FONT_SIZE_TOKENS` in the parser), so choosing it is *removing* the
 * size rather than setting one.
 */
export const FONT_SIZES: { label: string; px: number | undefined }[] = [
  { label: "Heading", px: 43 },
  { label: "Subheading", px: 27 },
  { label: "Normal", px: undefined },
];

/** Web's fifteen highlight swatches, 4 × 4 with the last cell for "remove". */
export const HIGHLIGHT_COLORS: { name: string; value: string }[] = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
];

/**
 * The text colour web pairs with a highlight.
 *
 * `applyHighlight` sets the highlight to the swatch and the text to the swatch
 * mixed 35% towards white, so dark text stays legible on a saturated ground.
 * The same arithmetic, so a phone's highlight is the browser's highlight.
 */
export const highlightTextColor = (hex: string): string => {
  const value = hex.replace("#", "");
  const channel = (index: number) =>
    Number.parseInt(value.slice(index, index + 2), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.35);
  const out = [mix(channel(0)), mix(channel(2)), mix(channel(4))]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("");
  return `#${out}`;
};

export const ALIGNMENTS: { id: RichAlign; label: string }[] = [
  { id: "left", label: "Align left" },
  { id: "center", label: "Align centre" },
  { id: "right", label: "Align right" },
  { id: "justify", label: "Justify" },
];

export interface SymbolOption {
  label: string;
  value: string;
}

export interface SymbolCategory {
  name: string;
  symbols: SymbolOption[];
}

/** Web's `BULLET_POINT_CATEGORIES`, with the glyphs drawn from the one table. */
const bullets = (name: string, values: string[]): SymbolCategory => ({
  name,
  symbols: values.map((value) => ({
    label: BULLET_GLYPHS[value] ?? "•",
    value,
  })),
});

export const BULLET_POINT_CATEGORIES: SymbolCategory[] = [
  bullets("Basic Bullets", [
    "bullet",
    "middle-dot",
    "white-circle",
    "black-circle",
    "fisheye",
  ]),
  bullets("Arrows", [
    "arrow-two-head",
    "arrow-tail",
    "arrow-bar",
    "arrow-loop",
    "arrow-triple",
    "arrow-squiggle",
    "arrow-dashed",
    "arrow-white",
    "arrow-heavy",
    "arrow-heavy-right",
    "arrow-drafting",
    "arrow-round",
    "arrow-triangle-head",
    "arrow-triangle-heavy",
    "arrow-triangle-dashed",
    "arrow-triangle-heavy-dashed",
    "arrow-black",
    "arrow-top-light",
    "arrow-bottom-light",
    "arrowhead-black",
    "arrow-curved-down",
    "arrow-curved-up",
    "arrow-squat",
    "arrow-concave",
    "arrow-shadowed",
    "arrow-notched",
    "arrow-circled",
    "arrow-feathered",
    "arrow-feathered-black",
    "arrow-feathered-heavy",
    "arrow-wedge",
    "arrow-wedge-heavy",
    "arrow-open-outline",
    "arrow-simple",
    "arrow-open-head",
    "arrow-double",
  ]),
  bullets("Checkmarks & Boxes", [
    "ballot-box",
    "ballot-box-check",
    "ballot-box-x",
    "check-mark",
    "heavy-check-mark",
  ]),
  bullets("Circle Variants", [
    "circled-dot",
    "circled-ring",
    "circled-asterisk",
    "dotted-circle",
    "circle-vertical-fill",
    "bullseye",
    "white-bullet",
    "sun",
    "circled-white",
    "circled-black",
  ]),
  bullets("Dashes & Special", ["hyphen-bullet", "left-bullet", "right-bullet"]),
  bullets("Decorative", [
    "rotated-heavy-heart",
    "rotated-floral-heart",
    "reversed-floral-heart",
    "dharma-wheel",
    "asterisk-four-spoke",
    "heavy-asterisk",
    "open-asterisk",
  ]),
  bullets("Diamonds", [
    "black-diamond",
    "white-diamond",
    "white-diamond-black",
  ]),
  bullets("Squares & Boxes", [
    "black-square",
    "white-square",
    "small-square-filled",
    "small-filled",
    "inverse-bullet",
  ]),
  bullets("Stars", ["black-star", "white-star"]),
  bullets("Triangles & Pointers", [
    "small-triangle",
    "white-small-triangle",
    "triangle-right",
    "white-triangle-right",
    "pointer",
    "white-pointer",
    "triangular-bullet",
  ]),
];

/** Web's `ORDERED_LIST_STYLES`. The value is the CSS keyword the browser draws. */
export const ORDERED_LIST_STYLES: SymbolOption[] = [
  { label: "1", value: "decimal" },
  { label: "a", value: "lower-alpha" },
  { label: "A", value: "upper-alpha" },
  { label: "i", value: "lower-roman" },
  { label: "I", value: "upper-roman" },
];

export const DEFAULT_UNORDERED_LIST_STYLE = "bullet";
export const DEFAULT_ORDERED_LIST_STYLE = "decimal";

/** Web's `QUOTATION_MARK_CATEGORIES`. Inserted as text, so label is value. */
const quotes = (name: string, values: string[]): SymbolCategory => ({
  name,
  symbols: values.map((value) => ({ label: value, value })),
});

export const QUOTATION_MARK_CATEGORIES: SymbolCategory[] = [
  quotes("Angle Quotes", ["«", "»", "‹", "›"]),
  quotes("Double Quotes", ["“", "”", "„", "‟", "＂"]),
  quotes("Fullwidth", ["＇", "`", "ˊ"]),
  quotes("Ornamental", ["❛", "❜", "❝", "❞"]),
  quotes("Prime Marks", ["′", "″", "‴", "⁗", "‵", "‶", "‷"]),
  quotes("Reversed Marks", ["〝", "〞", "〟"]),
  quotes("Single Quotes", ["'", "'", "‚", "‛"]),
  quotes("Symbolic", [
    "✦",
    "⊹",
    "˚",
    "₊",
    "⋆",
    "✱",
    "✲",
    "✳",
    "✴",
    "✵",
    "✶",
    "𐙚",
    "𐙛",
    "𐙜",
    "𐙝",
    "𐙞",
    "𐙟",
    "𐙠",
    "𐙡",
    "𐙢",
    "𐙣",
    "⁀➷",
    "╰┈➤",
    "╰─➤",
    "╰┈➔",
    "╰─➔",
    "╰┈➘",
    "╰─➘",
    "╰┈➙",
    "╰─➙",
  ]),
];

/** Web's `IMAGE_WRAPS`, and its default. */
export type ImageWrap = "full" | "inline-left" | "inline-right";
export const IMAGE_WRAPS: { id: ImageWrap; label: string }[] = [
  { id: "full", label: "Own line" },
  { id: "inline-left", label: "Text right" },
  { id: "inline-right", label: "Text left" },
];
export const DEFAULT_IMAGE_WRAP: ImageWrap = "full";

/** Web's image resize bounds. */
export const IMAGE_WIDTH_MIN = 10;
export const IMAGE_WIDTH_MAX = 100;
export const DEFAULT_IMAGE_WIDTH = 50;
