import { listMarker, parseRichText } from "./parse";
import { richTextIsEmpty, serializeRichText } from "./serialize";
import type {
  RichAlign,
  RichBlock,
  RichImageBlock,
  RichInline,
  RichListStyle,
  RichMark,
  RichMention,
  RichNode,
  RichTextRun,
} from "./types";

/**
 * Editing the tree, without a DOM.
 *
 * The web editor edits by letting the browser edit — `contenteditable` and
 * `execCommand` do the work, and the editor reads the HTML back afterwards. A
 * phone has neither, so the tree `parse.ts` produces is edited *as data*: each
 * block is a string with formatting laid over it, the keyboard changes the
 * string, and every toolbar button is one of the functions below. The result
 * is written back through `serialize.ts`.
 *
 * Everything here is pure and platform-neutral, which is what makes it
 * testable — the native editor is a thin thing that calls these on keystrokes,
 * and the behaviour that matters (does bolding the middle of a word split the
 * run correctly, does deleting half a mention delete the whole chip, does
 * pressing return inside a list leave the list) is exercised without a device.
 *
 * ## Offsets
 *
 * Every position is an offset into the block's *plain text* — the string a
 * `TextInput` holds for that block. A text run contributes its characters, a
 * line break one `\n`, and a mention `@` plus its name. That last rule is what
 * lets a chip live inside a native text field at all: the field shows `@Ada`
 * as ordinary characters, styled, and the operations here treat those
 * characters as one indivisible thing.
 *
 * ## Mentions are atomic
 *
 * A deletion that touches any part of a mention removes the whole mention, and
 * a style applied across part of one leaves it alone. Web gets this for free
 * from `contenteditable="false"`; here it is the first thing `replaceRange`
 * checks, because a chip reading `@Ad` is a chip pointing at nobody.
 */

export type RichDocument = RichNode[];

export interface RichRange {
  start: number;
  end: number;
}

/** Everything a run carries besides its text. */
export interface RunStyle {
  marks: RichMark[];
  color?: string;
  background?: string;
  fontSize?: number;
  fontFamily?: string;
  href?: string;
}

export const EMPTY_STYLE: RunStyle = { marks: [] };

const styleOf = (run: RichTextRun): RunStyle => ({
  background: run.background,
  color: run.color,
  fontFamily: run.fontFamily,
  fontSize: run.fontSize,
  href: run.href,
  marks: [...run.marks],
});

const sameMarks = (a: RichMark[], b: RichMark[]): boolean =>
  a.length === b.length && a.every((mark) => b.includes(mark));

export const sameStyle = (a: RunStyle, b: RunStyle): boolean =>
  sameMarks(a.marks, b.marks) &&
  a.color === b.color &&
  a.background === b.background &&
  a.fontSize === b.fontSize &&
  a.fontFamily === b.fontFamily &&
  a.href === b.href;

const makeRun = (text: string, style: RunStyle): RichTextRun => {
  const run: RichTextRun = { marks: [...style.marks], text, type: "text" };
  if (style.color) run.color = style.color;
  if (style.background) run.background = style.background;
  if (style.fontSize) run.fontSize = style.fontSize;
  if (style.fontFamily) run.fontFamily = style.fontFamily;
  if (style.href) run.href = style.href;
  return run;
};

// ─── Plain text ──────────────────────────────────────────────────────────────

/** How a mention reads inside the field: `@` and the name. */
export const mentionText = (mention: RichMention): string => `@${mention.name}`;

export const inlineText = (inline: RichInline): string => {
  if (inline.type === "text") return inline.text;
  if (inline.type === "break") return "\n";
  return mentionText(inline);
};

export const inlineLength = (inline: RichInline): number =>
  inlineText(inline).length;

/** The block as the string a text field holds for it. */
export const blockText = (block: RichBlock): string =>
  block.children.map(inlineText).join("");

export const blockLength = (block: RichBlock): number =>
  block.children.reduce((total, child) => total + inlineLength(child), 0);

// ─── Normalisation ───────────────────────────────────────────────────────────

/**
 * Adjacent runs with the same style, joined; empty runs, dropped.
 *
 * Every edit below splits runs at its boundaries and rarely bothers to join
 * them again, because doing it once here is simpler than doing it correctly
 * in each of them. A block that reads "hel" + "lo" in the same style is the
 * same block as "hello", and the field draws one `<Text>` fewer for it.
 */
export const normalizeInlines = (children: RichInline[]): RichInline[] => {
  const out: RichInline[] = [];
  for (const child of children) {
    if (child.type === "text" && child.text.length === 0) continue;
    const last = out[out.length - 1];
    if (
      child.type === "text" &&
      last?.type === "text" &&
      sameStyle(styleOf(last), styleOf(child))
    ) {
      out[out.length - 1] = { ...last, text: last.text + child.text };
      continue;
    }
    out.push(child);
  }
  return out;
};

const largestFontSize = (children: RichInline[]): number | undefined => {
  let largest = 0;
  for (const child of children) {
    if (child.type === "text" && child.fontSize) {
      largest = Math.max(largest, child.fontSize);
    }
  }
  return largest > 0 ? largest : undefined;
};

export const normalizeBlock = (block: RichBlock): RichBlock => {
  const children = normalizeInlines(block.children);
  const next: RichBlock = { ...block, children };

  // A block with text takes its size from the text. A block *without* any —
  // the empty line after a heading, or after an image — keeps whatever size
  // it was given, because that is the size the next character will take and
  // there is nowhere else to hold it.
  if (children.some((child) => child.type === "text")) {
    const fontSize = largestFontSize(children);
    if (fontSize) next.fontSize = fontSize;
    else delete next.fontSize;
  }

  return next;
};

/**
 * The whole document, made consistent.
 *
 * Two things only this level can do: give every list item the marker its
 * position in its list demands (numbering restarts after anything that is
 * not part of the same list), and make sure there is always a paragraph to
 * type into — a document that is empty, or that ends in an image, has no
 * caret position and the editor would have nowhere to put the keyboard.
 */
export const normalizeDocument = (doc: RichDocument): RichDocument => {
  const out: RichDocument = [];
  let list: RichListStyle | null = null;
  let count = 0;

  for (const node of doc) {
    if (node.type === "image") {
      list = null;
      out.push(node);
      continue;
    }

    const block = normalizeBlock(node);
    if (block.type === "listItem") {
      const own = block.list ?? { ordered: false };
      if (!list || !sameList(list, own)) {
        list = own;
        count = 0;
      }
      count += 1;
      out.push({ ...block, list: own, marker: listMarker(own, count) });
      continue;
    }

    list = null;
    out.push(block);
  }

  if (out.length === 0 || out[out.length - 1].type === "image") {
    out.push(emptyParagraph());
  }

  return out;
};

export const sameList = (a: RichListStyle, b: RichListStyle): boolean =>
  a.ordered === b.ordered && (a.style ?? "") === (b.style ?? "");

export const emptyParagraph = (): RichBlock => ({
  children: [],
  type: "paragraph",
});

// ─── Reading a block ─────────────────────────────────────────────────────────

/**
 * The style the next typed character would take at `offset`.
 *
 * Browsers take it from the character *before* the caret, which is what
 * makes typing at the end of a bold word continue in bold. A caret at the
 * start of the block takes the first run's; a caret right after a mention
 * takes nothing, because a chip's styling is the chip's and not the text's.
 */
export const styleAt = (block: RichBlock, offset: number): RunStyle => {
  // An empty line has no character to take a style from, but it can have a
  // size — the size the line after a heading types in. See `normalizeBlock`.
  if (block.children.length === 0) {
    return block.fontSize
      ? { fontSize: block.fontSize, marks: [] }
      : { ...EMPTY_STYLE };
  }

  let position = 0;
  let previous: RichInline | null = null;
  for (const child of block.children) {
    const length = inlineLength(child);
    if (offset > position && offset <= position + length) {
      return child.type === "text" ? styleOf(child) : { ...EMPTY_STYLE };
    }
    position += length;
    previous = child;
  }
  if (offset === 0) {
    const first = block.children[0];
    return first?.type === "text" ? styleOf(first) : { ...EMPTY_STYLE };
  }
  return previous?.type === "text" ? styleOf(previous) : { ...EMPTY_STYLE };
};

/**
 * The marks in force over a range, for a toolbar to light up.
 *
 * A collapsed range asks about the caret; a real one asks about every text
 * run it touches, and a mark counts only if all of them carry it — the same
 * rule `queryCommandState` follows, and the one that makes tapping **B** on
 * a half-bold selection make it all bold rather than all plain.
 */
export const marksIn = (block: RichBlock, range: RichRange): RichMark[] => {
  const { end, start } = ordered(range);
  if (start === end) return styleAt(block, start).marks;

  const runs = textRunsIn(block, start, end);
  if (runs.length === 0) return [];
  return (
    ["bold", "italic", "underline", "strike", "code"] as RichMark[]
  ).filter((mark) => runs.every((run) => run.marks.includes(mark)));
};

/** The one highlight over a range, or null when there is none or several. */
export const backgroundIn = (
  block: RichBlock,
  range: RichRange,
): string | null => {
  const { end, start } = ordered(range);
  if (start === end) return styleAt(block, start).background ?? null;
  const runs = textRunsIn(block, start, end);
  if (runs.length === 0) return null;
  const first = runs[0].background ?? null;
  return runs.every((run) => (run.background ?? null) === first) ? first : null;
};

/** The one family over a range, or undefined when there is none or several. */
export const fontFamilyIn = (
  block: RichBlock,
  range: RichRange,
): string | undefined => {
  const { end, start } = ordered(range);
  if (start === end) return styleAt(block, start).fontFamily;
  const runs = textRunsIn(block, start, end);
  if (runs.length === 0) return undefined;
  const first = runs[0].fontFamily;
  return runs.every((run) => run.fontFamily === first) ? first : undefined;
};

const ordered = (range: RichRange): RichRange => ({
  end: Math.max(range.start, range.end),
  start: Math.min(range.start, range.end),
});

/** The text runs that overlap `[start, end)`, whole or in part. */
const textRunsIn = (
  block: RichBlock,
  start: number,
  end: number,
): RichTextRun[] => {
  const runs: RichTextRun[] = [];
  let position = 0;
  for (const child of block.children) {
    const length = inlineLength(child);
    if (child.type === "text" && position < end && position + length > start) {
      runs.push(child);
    }
    position += length;
  }
  return runs;
};

// ─── Editing a block ─────────────────────────────────────────────────────────

/**
 * `[start, end)` replaced by `text` in `style`.
 *
 * This is the one primitive under every keystroke: typing is a replacement of
 * an empty range, deleting is a replacement with an empty string, and a paste
 * is both. `\n` in the text becomes a line break rather than a new block —
 * splitting blocks is `splitBlock`'s, and the field decides which it wants.
 *
 * The returned `caret` is where the caret belongs afterwards. It is not
 * always `start + text.length`: a deletion that clipped a mention has removed
 * more than was asked for, and the caret has to land where the chip was.
 */
export const replaceRange = (
  block: RichBlock,
  range: RichRange,
  text: string,
  style: RunStyle,
): { block: RichBlock; caret: number } => {
  let { end, start } = ordered(range);

  // A chip is all or nothing. A caret *inside* one — which a native field
  // allows, since to it the chip is four ordinary characters — types after
  // it, as web's `contenteditable="false"` would have placed the caret there
  // to begin with. A range that cuts into one widens to take all of it.
  let position = 0;
  for (const child of block.children) {
    const length = inlineLength(child);
    if (child.type === "mention") {
      const chipEnd = position + length;
      if (start === end && start > position && start < chipEnd) {
        start = chipEnd;
        end = chipEnd;
      } else if (position < end && chipEnd > start) {
        start = Math.min(start, position);
        end = Math.max(end, chipEnd);
      }
    }
    position += length;
  }

  const before = sliceInlines(block.children, 0, start);
  const after = sliceInlines(block.children, end, blockLength(block));
  const inserted = inlinesFromText(text, style);

  return {
    block: normalizeBlock({
      ...block,
      children: [...before, ...inserted, ...after],
    }),
    caret: start + text.length,
  };
};

/** Text with `\n` in it, as runs and breaks. */
const inlinesFromText = (text: string, style: RunStyle): RichInline[] => {
  if (!text) return [];
  const out: RichInline[] = [];
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    if (index > 0) out.push({ type: "break" });
    if (line) out.push(makeRun(line, style));
  });
  return out;
};

/**
 * The inlines covering `[start, end)`, with runs split at the edges.
 *
 * A mention that is only partly inside is left out: the callers that want
 * atomic behaviour have already widened their range around it, and the ones
 * that do not (styling) should not be handed half a chip.
 */
export const sliceInlines = (
  children: RichInline[],
  start: number,
  end: number,
): RichInline[] => {
  const out: RichInline[] = [];
  let position = 0;
  for (const child of children) {
    const length = inlineLength(child);
    const from = Math.max(start, position);
    const to = Math.min(end, position + length);
    if (from < to || (length === 0 && position >= start && position < end)) {
      if (child.type === "text") {
        out.push({
          ...child,
          text: child.text.slice(from - position, to - position),
        });
      } else if (from === position && to === position + length) {
        out.push(child);
      }
    }
    position += length;
  }
  return out;
};

/**
 * A run restyled across `[start, end)`.
 *
 * The three-way split — before, inside, after — is what every style edit
 * comes down to. Mentions and breaks pass through untouched whatever the
 * range says.
 */
const mapRunsIn = (
  block: RichBlock,
  range: RichRange,
  update: (style: RunStyle) => RunStyle,
): RichBlock => {
  const { end, start } = ordered(range);
  const children: RichInline[] = [];
  let position = 0;

  for (const child of block.children) {
    const length = inlineLength(child);
    const from = Math.max(start, position);
    const to = Math.min(end, position + length);

    if (child.type !== "text" || from >= to) {
      children.push(child);
    } else {
      const style = styleOf(child);
      const head = child.text.slice(0, from - position);
      const body = child.text.slice(from - position, to - position);
      const tail = child.text.slice(to - position);
      if (head) children.push(makeRun(head, style));
      children.push(makeRun(body, update(style)));
      if (tail) children.push(makeRun(tail, style));
    }

    position += length;
  }

  return normalizeBlock({ ...block, children });
};

/**
 * A mark added to, or taken from, every run in the range.
 *
 * Added unless every run already carries it, in which case removed — the
 * `queryCommandState` rule again. A collapsed range changes nothing here; the
 * editor keeps a pending style for that case, because "bold from here on" is
 * a fact about the next keystroke rather than about the document.
 */
export const toggleMark = (
  block: RichBlock,
  range: RichRange,
  mark: RichMark,
): RichBlock => {
  const { end, start } = ordered(range);
  if (start === end) return block;
  const remove = marksIn(block, range).includes(mark);
  return mapRunsIn(block, range, (style) => ({
    ...style,
    marks: remove
      ? style.marks.filter((entry) => entry !== mark)
      : style.marks.includes(mark)
        ? style.marks
        : [...style.marks, mark],
  }));
};

/** The mark as a fact about the whole range, rather than a toggle. */
export const setMark = (
  block: RichBlock,
  range: RichRange,
  mark: RichMark,
  on: boolean,
): RichBlock =>
  mapRunsIn(block, range, (style) => ({
    ...style,
    marks: on
      ? style.marks.includes(mark)
        ? style.marks
        : [...style.marks, mark]
      : style.marks.filter((entry) => entry !== mark),
  }));

/**
 * Colour and highlight over a range. `null` clears.
 *
 * Web writes both together: `applyHighlight` sets `hiliteColor` to the swatch
 * and `foreColor` to a lightened version of it, and removing the highlight
 * removes both. This takes them as a pair for the same reason.
 */
export const setHighlight = (
  block: RichBlock,
  range: RichRange,
  highlight: { background: string; color: string } | null,
): RichBlock =>
  mapRunsIn(block, range, (style) => ({
    ...style,
    background: highlight?.background,
    color: highlight?.color,
  }));

/** Web's `fontName` command over a selection. `undefined` is the default face. */
export const setFontFamily = (
  block: RichBlock,
  range: RichRange,
  fontFamily: string | undefined,
): RichBlock => mapRunsIn(block, range, (style) => ({ ...style, fontFamily }));

/**
 * The block's size, applied to every run in it.
 *
 * A block property rather than a run one, deliberately: the web toolbar sets
 * `font-size` on the *line*, and a native text field cannot mix sizes on a
 * line without reflowing on every keystroke (see `markdown-input.tsx`). One
 * size per block is what both constraints agree on. `undefined` is the
 * default size.
 */
export const setBlockFontSize = (
  block: RichBlock,
  fontSize: number | undefined,
): RichBlock =>
  normalizeBlock({
    ...block,
    children: block.children.map((child) =>
      child.type === "text"
        ? makeRun(child.text, { ...styleOf(child), fontSize })
        : child,
    ),
  });

export const setBlockAlign = (
  block: RichBlock,
  align: RichAlign | undefined,
): RichBlock => {
  const next = { ...block };
  if (align && align !== "left") next.align = align;
  else delete next.align;
  return next;
};

/**
 * Return, pressed at `offset`.
 *
 * The right half keeps the left half's alignment, size and list membership,
 * which is what the web editor's `handleKeyDown` carries forward on Enter and
 * what a browser does for a list. The one exception is a list item that is
 * *empty*: return there leaves the list, because that is how every editor
 * ends one — the alternative is a list nobody can escape from.
 */
export const splitBlock = (
  block: RichBlock,
  offset: number,
): [RichBlock, RichBlock] => {
  const length = blockLength(block);

  if (block.type === "listItem" && length === 0) {
    const left: RichBlock = { ...block, type: "paragraph" };
    delete left.list;
    delete left.marker;
    return [left, emptyParagraph()];
  }

  const style = styleAt(block, offset);
  const left = normalizeBlock({
    ...block,
    children: sliceInlines(block.children, 0, offset),
  });
  const right = normalizeBlock({
    ...block,
    children: sliceInlines(block.children, offset, length),
  });

  // An empty right half still types in the size the line had — the size is
  // a block property, and the block was split, not restyled.
  if (right.children.length === 0 && style.fontSize) {
    right.fontSize = style.fontSize;
  }

  return [left, right];
};

/** Backspace at the start of `b`: `b`'s content joins the end of `a`. */
export const mergeBlocks = (a: RichBlock, b: RichBlock): RichBlock =>
  normalizeBlock({ ...a, children: [...a.children, ...b.children] });

/**
 * A mention chip in place of the `@query` that summoned it.
 *
 * Web's `insertMention`: the text from the `@` to the caret is replaced by the
 * chip and a space, and the caret lands after the space so typing continues
 * as prose. The space is the one character that keeps two chips from
 * touching.
 */
export const insertMention = (
  block: RichBlock,
  at: number,
  caret: number,
  mention: Omit<RichMention, "type">,
): { block: RichBlock; caret: number } => {
  const before = sliceInlines(block.children, 0, at);
  const after = sliceInlines(block.children, caret, blockLength(block));
  const chip: RichMention = { ...mention, type: "mention" };
  const children = [...before, chip, makeRun(" ", EMPTY_STYLE), ...after];
  return {
    block: normalizeBlock({ ...block, children }),
    caret: at + inlineLength(chip) + 1,
  };
};

/**
 * Web's `checkForMention`: the `@word` the caret is at the end of, if any.
 *
 * The last `@` before the caret opens a query as long as nothing after it is
 * a space — so `@ada` is a query and `email me @ home` is not. Returns where
 * the `@` is, which is what `insertMention` needs back.
 */
export const mentionQuery = (
  text: string,
  caret: number,
): { at: number; query: string } | null => {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf("@");
  if (at === -1) return null;
  const query = before.slice(at + 1);
  if (/\s/.test(query)) return null;
  return { at, query };
};

/**
 * What changed between two versions of a field's text.
 *
 * Longest common prefix, then longest common suffix that does not overlap it.
 * `[start, end)` is what was removed from `previous` and `inserted` is what
 * took its place — a keystroke is one character inserted at a collapsed
 * range, a backspace is nothing inserted over one character, and autocorrect
 * is a word over a word.
 */
export const diffText = (
  previous: string,
  next: string,
): { end: number; inserted: string; start: number } => {
  const limit = Math.min(previous.length, next.length);
  let prefix = 0;
  while (prefix < limit && previous[prefix] === next[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < limit - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  return {
    end: previous.length - suffix,
    inserted: next.slice(prefix, next.length - suffix),
    start: prefix,
  };
};

export type TextChange =
  | { kind: "split"; left: RichBlock; right: RichBlock }
  | { kind: "edit"; block: RichBlock; caret: number };

/**
 * A field's text changed: what the block becomes.
 *
 * Return is the one keystroke a native field cannot report as a key: it
 * arrives as a `\n` in the new text. Exactly one newline, inserted and
 * nothing removed, is a return and splits the block. A newline arriving with
 * other characters is a paste, and stays inside the block as a line break.
 * Everything else is `replaceRange` over the diff, in `typing`'s style when
 * one is pinned and the style at the caret otherwise.
 */
export const applyTextChange = (
  block: RichBlock,
  previous: string,
  next: string,
  typing?: RunStyle,
): TextChange => {
  const { end, inserted, start } = diffText(previous, next);

  if (inserted === "\n" && start === end) {
    const [left, right] = splitBlock(block, start);
    return { kind: "split", left, right };
  }

  const result = replaceRange(
    block,
    { end, start },
    inserted,
    typing ?? styleAt(block, start),
  );
  return { block: result.block, caret: result.caret, kind: "edit" };
};

// ─── Editing the document ────────────────────────────────────────────────────

export const insertBlockAfter = (
  doc: RichDocument,
  index: number,
  ...blocks: RichNode[]
): RichDocument => [
  ...doc.slice(0, index + 1),
  ...blocks,
  ...doc.slice(index + 1),
];

export const replaceBlock = (
  doc: RichDocument,
  index: number,
  ...blocks: RichNode[]
): RichDocument => [...doc.slice(0, index), ...blocks, ...doc.slice(index + 1)];

export const removeBlock = (doc: RichDocument, index: number): RichDocument =>
  normalizeDocument([...doc.slice(0, index), ...doc.slice(index + 1)]);

/**
 * An image, in its own block after `index`, with a paragraph after it.
 *
 * `insertImageFromUrl` does exactly this: the picture goes in a block of its
 * own after the current line, and an empty line follows it so the caret has
 * somewhere to go. Fifty percent is web's default width for a new image.
 */
export const insertImageAfter = (
  doc: RichDocument,
  index: number,
  image: Omit<RichImageBlock, "type">,
): { doc: RichDocument; caret: number } => {
  const block: RichImageBlock = {
    widthPercent: 50,
    wrap: "full",
    ...image,
    type: "image",
  };
  const paragraph = emptyParagraph();
  const current = doc[index];
  // The line after the image types in the size the line before it had, as
  // web copies `font-size` from the current block onto the block it adds.
  if (current && current.type !== "image" && current.fontSize) {
    paragraph.fontSize = current.fontSize;
  }
  return {
    caret: index + 2,
    doc: normalizeDocument(insertBlockAfter(doc, index, block, paragraph)),
  };
};

export const updateImage = (
  doc: RichDocument,
  index: number,
  patch: Partial<Omit<RichImageBlock, "type" | "src">>,
): RichDocument => {
  const node = doc[index];
  if (!node || node.type !== "image") return doc;
  const next: RichImageBlock = { ...node, ...patch };
  for (const key of Object.keys(next) as (keyof RichImageBlock)[]) {
    if (next[key] === undefined) delete next[key];
  }
  return replaceBlock(doc, index, next);
};

/**
 * The block made a list item, or a list item made a paragraph.
 *
 * `insertUnorderedList` on a line that is already a bulleted list removes the
 * bullet; on a numbered one it changes the numbering. Same three outcomes
 * here, decided by what the block is now.
 */
export const toggleList = (
  doc: RichDocument,
  index: number,
  ordered: boolean,
  style?: string,
): RichDocument => {
  const node = doc[index];
  if (!node || node.type === "image") return doc;

  if (node.type === "listItem" && (node.list?.ordered ?? false) === ordered) {
    const block: RichBlock = { ...node, type: "paragraph" };
    delete block.list;
    delete block.marker;
    return normalizeDocument(replaceBlock(doc, index, block));
  }

  const list: RichListStyle = style ? { ordered, style } : { ordered };
  const block: RichBlock = { ...node, list, type: "listItem" };
  delete block.level;
  return normalizeDocument(replaceBlock(doc, index, block));
};

/**
 * The style of the whole list `index` sits in.
 *
 * Web's `applyListStyleToClosest` sets it on the `<ul>`, which is every item
 * at once; here the list is the run of adjacent items sharing a style, and
 * all of them take the new one.
 */
export const setListStyle = (
  doc: RichDocument,
  index: number,
  style: string | undefined,
): RichDocument => {
  const node = doc[index];
  if (!node || node.type !== "listItem") return doc;
  const own = node.list ?? { ordered: false };

  const inGroup = (candidate: RichNode | undefined): candidate is RichBlock =>
    candidate?.type === "listItem" &&
    sameList(candidate.list ?? { ordered: false }, own);

  let first = index;
  while (first > 0 && inGroup(doc[first - 1])) first -= 1;
  let last = index;
  while (last < doc.length - 1 && inGroup(doc[last + 1])) last += 1;

  const list: RichListStyle = style
    ? { ordered: own.ordered, style }
    : { ordered: own.ordered };
  const out = doc.map((entry, position) =>
    position >= first && position <= last && entry.type === "listItem"
      ? { ...entry, list }
      : entry,
  );
  return normalizeDocument(out);
};

export const setBlockType = (
  doc: RichDocument,
  index: number,
  type: "paragraph" | "quote",
): RichDocument => {
  const node = doc[index];
  if (!node || node.type === "image") return doc;
  const block: RichBlock = { ...node, type };
  delete block.list;
  delete block.marker;
  delete block.level;
  return normalizeDocument(replaceBlock(doc, index, block));
};

// ─── In and out ──────────────────────────────────────────────────────────────

/** The editor's saved HTML as a document that can be edited. */
export const documentFromHtml = (
  html: string | null | undefined,
): RichDocument => normalizeDocument(parseRichText(html));

/** The document as the editor's saved HTML. Empty when there is nothing in it. */
export const documentToHtml = (doc: RichDocument): string =>
  richTextIsEmpty(doc) ? "" : serializeRichText(doc);

export const documentIsEmpty = (doc: RichDocument): boolean =>
  richTextIsEmpty(doc);

/**
 * The image URLs a document refers to.
 *
 * The composer uploads pictures as they are inserted and deletes the upload
 * when the picture is removed before the post is sent (`prompt-text-field`'s
 * tracked URLs). Knowing which are still referenced is how it tells.
 */
export const imageSources = (doc: RichDocument): string[] =>
  doc.flatMap((node) => (node.type === "image" ? [node.src] : []));
