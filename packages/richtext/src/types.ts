/**
 * What a saved rich-text document means, with no opinion about how it looks.
 *
 * The web renderer works by handing the stored HTML to `innerHTML` and then
 * walking the resulting DOM — which is fine on a browser and impossible on a
 * phone. This tree is the same document expressed as data, so both clients can
 * agree on what an About section *contains* before either decides how to draw
 * it.
 */

/** Character-level formatting. Marks nest, so a run carries a set of them. */
export type RichMark = "bold" | "italic" | "underline" | "strike" | "code";

export interface RichTextRun {
  type: "text";
  text: string;
  marks: RichMark[];
  /** An inline colour the editor stored, when there is one. */
  color?: string;
  /** The highlight behind the text — the editor's `background-color`. */
  background?: string;
  /**
   * Size in CSS pixels, when the author chose one.
   *
   * Absent means the default. The editor offers three sizes and writes them as
   * `var(--font-size-*)`; those are resolved to pixels here so a client with no
   * CSS variables can still tell a heading from body text.
   */
  fontSize?: number;
  /** Set when the run sits inside a link. */
  href?: string;
  /**
   * The typeface the author chose, when it is not the default.
   *
   * Carried rather than rendered: the twelve faces the web editor offers are
   * web fonts nothing on a phone has, so the native renderer draws every run in
   * the system face. It is here so that a document edited on a phone is
   * written back with the fonts it arrived with — dropping them would mean a
   * one-word correction from a phone silently reset a page of typography.
   */
  fontFamily?: string;
}

/**
 * A novelist or muse chip.
 *
 * Stored as `<span class="mention-tag" data-type data-id>` with an avatar and a
 * name inside it — see `mention-chip.ts`. Parsed into one node because the two
 * inner elements are presentation, and a client that renders chips differently
 * should not have to reverse-engineer them.
 */
export interface RichMention {
  type: "mention";
  id: string;
  kind: "NOVELIST" | "MUSE";
  name: string;
  image?: string;
}

export interface RichLineBreak {
  type: "break";
}

export type RichInline = RichTextRun | RichMention | RichLineBreak;

/**
 * An image, always its own block.
 *
 * In HTML an `<img>` is inline; in React Native an `<Image>` cannot live inside
 * a `<Text>`. Promoting images to blocks at parse time is what stops every
 * consumer having to discover that separately.
 */
export interface RichImageBlock {
  type: "image";
  src: string;
  alt?: string;
  /** The alignment of the block the image sits in. */
  align?: RichAlign;
  /**
   * How wide the author sized it, as a percentage of the text column.
   *
   * The editor stores this as `data-width-pct` on the image and a matching
   * `width: N%` on its container. Ignoring it renders every inline image full
   * width, which is wrong for the many profiles that place a small centred GIF.
   */
  widthPercent?: number;
  /**
   * A hard pixel cap the image carries on itself.
   *
   * Not everything in an About came from the editor's image tool. Pasted
   * content brings its own markup — a Discord emoji arrives as an `<img>` with
   * `max-width: 32px` and no container at all — and sizing that to the column
   * turns a 32px emoji into a full-width banner.
   */
  maxWidth?: number;
  maxHeight?: number;
  /**
   * `data-wrap` from the editor: `full`, `inline-left` or `inline-right`.
   *
   * Web floats prose around the last two. Carried through so the web renderer
   * can reproduce the markup it was given rather than a guess at it.
   */
  wrap?: string;
}

/**
 * How a block is aligned.
 *
 * The editor writes this as an inline `text-align` on the block element, and
 * profiles lean on it heavily — centred headers, right-aligned columns of
 * prose. Dropping it turns a carefully laid-out About into a wall of
 * left-aligned text, which is what the first native version did.
 */
export type RichAlign = "left" | "center" | "right" | "justify";

export interface RichBlock {
  type: "paragraph" | "heading" | "quote" | "listItem";
  children: RichInline[];
  align?: RichAlign;
  /**
   * The largest `fontSize` among this block's runs.
   *
   * Derived rather than authored, and here because line height is a block
   * property that depends on its contents: a 43px run inside a block laid out
   * for 16px text overlaps the line above it. CSS works this out itself; React
   * Native does not.
   */
  fontSize?: number;
  /** 1–6, for headings. */
  level?: number;
  /** Set on list items: the marker to show. */
  marker?: string;
  /**
   * Which list a list item belongs to, and how that list is styled.
   *
   * `marker` is what to *draw*; this is what to *write back*. The editor
   * stores a `list-style-type` on the `<ul>`/`<ol>` — a symbol name from its
   * bullet picker (`fisheye`, `arrow-heavy`) or a CSS keyword (`lower-roman`)
   * — and adjacent items with the same one belong to the same list. Without
   * it a serializer could only ever write plain `<ul>`s, and every custom
   * bullet chosen on web would be lost the first time a phone saved the page.
   */
  list?: RichListStyle;
}

export interface RichListStyle {
  ordered: boolean;
  /** The editor's `list-style-type` value, when it is not the default. */
  style?: string;
}

export type RichNode = RichBlock | RichImageBlock;
