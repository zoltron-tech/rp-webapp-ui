/**
 * Page geometry presets for the book layout.
 *
 * Pagination is a client-side presentation layer — the server never stores
 * page breaks. What it does store is the format (on the story), so page
 * geometry is deterministic given (format, font settings) and every co-author
 * sees the same page cuts.
 *
 * All numbers are CSS pixels in a fixed *design* coordinate space. The rendered
 * page is scaled as one unit to fit the viewport (same trick as `book-view`),
 * so the number of words per line — and therefore where each page breaks — is
 * identical on a phone and on a 4K monitor.
 *
 * Keep `PageFormat` in sync with the backend's `PageFormat.kt`.
 */

export type PageFormat = "A5" | "TRADE_6x9" | "A4" | "WEB";

export interface PageSpec {
  value: PageFormat;
  label: string;
  description: string;
  /** Outer page width, including padding. */
  width: number;
  /** Outer page height, including padding. */
  height: number;
  /** Horizontal padding (the page's inner margin). */
  padX: number;
  /** Vertical padding — the top margin; the page number sits in the bottom. */
  padY: number;
  /** Base font size for the flowing prose. */
  fontSize: number;
  /** Base line height, as a unitless multiplier. */
  lineHeight: number;
}

/**
 * Trim sizes at 96dpi-ish print proportions, scaled to a comfortable on-screen
 * measure (~60–70 characters per line at the given font size).
 */
export const PAGE_SPECS: Record<PageFormat, PageSpec> = {
  A4: {
    description: "210 × 297 mm — manuscript pages, more words per page.",
    fontSize: 17,
    height: 764,
    label: "A4",
    lineHeight: 1.7,
    padX: 72,
    padY: 64,
    value: "A4",
    width: 540,
  },
  A5: {
    description: "148 × 210 mm — a compact paperback page.",
    fontSize: 16,
    height: 638,
    label: "A5",
    lineHeight: 1.65,
    padX: 52,
    padY: 46,
    value: "A5",
    width: 450,
  },
  TRADE_6x9: {
    description: "6 × 9 in — the standard trade paperback.",
    fontSize: 17,
    height: 690,
    label: "Trade 6 × 9",
    lineHeight: 1.7,
    padX: 58,
    padY: 52,
    value: "TRADE_6x9",
    width: 460,
  },
  WEB: {
    description: "A wide, screen-first page — fewer, longer pages.",
    fontSize: 17,
    height: 620,
    label: "Web",
    lineHeight: 1.75,
    padX: 44,
    padY: 40,
    value: "WEB",
    width: 620,
  },
};

export const PAGE_FORMATS: PageSpec[] = [
  PAGE_SPECS.TRADE_6x9,
  PAGE_SPECS.A5,
  PAGE_SPECS.A4,
  PAGE_SPECS.WEB,
];

export const DEFAULT_PAGE_FORMAT: PageFormat = "TRADE_6x9";

/** Falls back to the default for anything the client doesn't recognize. */
export const resolvePageSpec = (format: string | null | undefined): PageSpec =>
  PAGE_SPECS[format as PageFormat] ?? PAGE_SPECS[DEFAULT_PAGE_FORMAT];

/** Width of the text column — the box the paginator measures against. */
export const contentWidth = (spec: PageSpec): number =>
  spec.width - spec.padX * 2;

/**
 * Height of the text column. The page number lives inside the bottom padding,
 * so the flow gets the full box between the margins.
 */
export const contentHeight = (spec: PageSpec): number =>
  spec.height - spec.padY * 2;
