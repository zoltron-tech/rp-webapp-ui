/**
 * Paints misspelled-word ranges with the CSS Custom Highlight API.
 *
 * One registry entry (`nw-misspelling`, styled in `globals.css`) carries the
 * ranges of every editor on the page; each editor owns its own slice and the
 * Highlight is rebuilt when any slice changes. No markup is ever inserted into
 * the editors — their `innerHTML` is what gets saved, and a `<span>` around
 * a typo would leak straight into the post.
 */

export const HIGHLIGHT_NAME = "nw-misspelling";

const slices = new Map<Element, Range[]>();

/** Chrome/Edge 105+, Safari 17.2+, Firefox 140+. */
export const supportsSpellHighlight = (): boolean =>
  typeof CSS !== "undefined" &&
  "highlights" in CSS &&
  typeof Highlight !== "undefined";

const rebuild = () => {
  if (!supportsSpellHighlight()) return;
  const all: Range[] = [];
  for (const ranges of slices.values()) all.push(...ranges);
  if (all.length === 0) {
    CSS.highlights.delete(HIGHLIGHT_NAME);
    return;
  }
  CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...all));
};

export const setEditorRanges = (editor: Element, ranges: Range[]) => {
  if (ranges.length === 0) slices.delete(editor);
  else slices.set(editor, ranges);
  rebuild();
};

export const clearEditorRanges = (editor: Element) => {
  if (slices.delete(editor)) rebuild();
};
