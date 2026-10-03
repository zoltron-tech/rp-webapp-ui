/**
 * Saved rich text, understood once.
 *
 * `parseRichText` turns the editor's stored HTML into a tree with no DOM in
 * sight; `renderRichText` walks that tree into components the caller supplies;
 * `serializeRichText` writes the tree back as the markup the editor would have
 * produced; and `document.ts` edits the tree in place of a browser. The split
 * is the point: what a document *means* is the same on both clients, and how
 * it *looks* — and how it is *typed* — is not.
 */
export {
  applyTextChange,
  backgroundIn,
  blockLength,
  blockText,
  diffText,
  documentFromHtml,
  documentIsEmpty,
  documentToHtml,
  EMPTY_STYLE,
  emptyParagraph,
  fontFamilyIn,
  imageSources,
  inlineLength,
  inlineText,
  insertBlockAfter,
  insertImageAfter,
  insertMention,
  marksIn,
  mentionQuery,
  mentionText,
  mergeBlocks,
  normalizeBlock,
  normalizeDocument,
  normalizeInlines,
  type RichDocument,
  type RichRange,
  type RunStyle,
  removeBlock,
  replaceBlock,
  replaceRange,
  sameList,
  sameStyle,
  setBlockAlign,
  setBlockFontSize,
  setBlockType,
  setFontFamily,
  setHighlight,
  setListStyle,
  setMark,
  sliceInlines,
  splitBlock,
  styleAt,
  type TextChange,
  toggleList,
  toggleMark,
  updateImage,
} from "./document";
export {
  ALIGNMENTS,
  BULLET_POINT_CATEGORIES,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IMAGE_WRAP,
  DEFAULT_ORDERED_LIST_STYLE,
  DEFAULT_UNORDERED_LIST_STYLE,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  highlightTextColor,
  IMAGE_WIDTH_MAX,
  IMAGE_WIDTH_MIN,
  IMAGE_WRAPS,
  type ImageWrap,
  ORDERED_LIST_STYLES,
  QUOTATION_MARK_CATEGORIES,
  type SymbolCategory,
  type SymbolOption,
} from "./editor-config";
export {
  BULLET_GLYPHS,
  listMarker,
  parseRichText,
  richTextToPlainText,
} from "./parse";
export {
  type RichTextBlockProps,
  type RichTextComponents,
  type RichTextMentionProps,
  type RichTextRunProps,
  RichTextView,
  renderRichText,
} from "./render";
export {
  fontSizeToCss,
  richTextIsEmpty,
  serializeRichText,
} from "./serialize";
export type {
  RichAlign,
  RichBlock,
  RichImageBlock,
  RichInline,
  RichLineBreak,
  RichListStyle,
  RichMark,
  RichMention,
  RichNode,
  RichTextRun,
} from "./types";
