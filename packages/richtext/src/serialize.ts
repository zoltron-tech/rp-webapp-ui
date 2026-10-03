import type {
  RichBlock,
  RichImageBlock,
  RichInline,
  RichListStyle,
  RichNode,
  RichTextRun,
} from "./types";

/**
 * The tree, written back as the markup the web editor would have produced.
 *
 * `parse.ts` is the other direction, and the two are a pair: what one reads
 * the other writes, in the same tags with the same attributes, so a document
 * can go browser → phone → browser without the browser noticing it left. That
 * is the whole contract. A phone that saved `<strong>` where the editor writes
 * `<b>`, or dropped the `data-width-pct` on an image, would produce a page
 * that *renders* the same and *edits* differently — the toolbar's state
 * detection reads the exact tags it wrote.
 *
 * ## What the editor writes, tag for tag
 *
 * - Blocks are `<div>`s, with `text-align` and `font-size` as inline styles on
 *   the block. The editor applies a size to the *line* (`ensureBlockWrappers`
 *   + `style.setProperty("font-size", …)`), so a block whose runs all share
 *   one size is written that way; a run whose size differs from its block's
 *   carries its own `<span style="font-size">`.
 * - `execCommand("bold")` and friends write `<b>`, `<i>`, `<u>`; strike and
 *   code have no toolbar button but are read by the parser and written here
 *   as `<strike>` and `<code>` so pasted content survives a round trip.
 * - Colour and highlight are one `<span style="color; background-color">`,
 *   which is what `styleWithCSS` makes `foreColor` + `hiliteColor` produce.
 * - Lists are `<ul>`/`<ol>` with `list-style-type` in *both* the inline style
 *   and `data-list-style-type` — see `listStyleFromAttributes` for why twice.
 * - A mention is `createMentionChip`'s markup exactly.
 * - An image is `insertImageFromUrl`'s: a block, a non-editable container
 *   sized in percent, the image inside it sized to the container.
 *
 * ## What is deliberately not here
 *
 * No sanitising, for the reason `parse.ts` gives. Text is entity-escaped so
 * that a typed `<` is a `<` on the page rather than the start of a tag, and
 * that is the extent of it.
 */

const escapeText = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttribute = (text: string): string =>
  escapeText(text).replace(/"/g, "&quot;");

/**
 * Pixels back to the editor's tokens.
 *
 * The inverse of `FONT_SIZE_TOKENS` in the parser: a size the editor offers is
 * written as the `var(--font-size-*)` it chose, so the stylesheet keeps
 * deciding what a heading measures. Anything else — a pasted `20px` — is
 * written as the pixels it arrived as.
 */
const FONT_SIZE_TOKENS: Record<number, string> = {
  6: "--font-size-xxxsmall",
  8: "--font-size-xxsmall",
  10: "--font-size-xsmall",
  12: "--font-size-small",
  14: "--font-size",
  18: "--font-size-h6",
  22: "--font-size-h5",
  27: "--font-size-h4",
  34: "--font-size-h3",
  43: "--font-size-h2",
  54: "--font-size-h1",
};

export const fontSizeToCss = (px: number): string => {
  const token = FONT_SIZE_TOKENS[px];
  return token ? `var(${token})` : `${px}px`;
};

const styleAttribute = (declarations: (string | null)[]): string => {
  const style = declarations.filter((entry): entry is string => Boolean(entry));
  return style.length ? ` style="${style.join("; ")}"` : "";
};

/** The one size every text run in a block shares, or undefined. */
const uniformFontSize = (block: RichBlock): number | undefined => {
  let size: number | undefined;
  let seen = false;
  for (const child of block.children) {
    if (child.type !== "text") continue;
    // "No size yet" and "the default size" are different answers: a block
    // whose first run is unsized and second is a heading is mixed, not a
    // heading.
    if (!seen) {
      size = child.fontSize;
      seen = true;
    } else if (child.fontSize !== size) {
      return undefined;
    }
  }
  // No text at all: the block's own size is the size the line types in, and
  // the only place it can be written is on the block.
  return seen ? size : block.fontSize;
};

const serializeRun = (run: RichTextRun, blockFontSize?: number): string => {
  let html = escapeText(run.text);

  // Innermost first, so the marks end up nested in the order the editor's
  // `execCommand` would have nested them: `<b><i><u>text</u></i></b>`.
  if (run.marks.includes("code")) html = `<code>${html}</code>`;
  if (run.marks.includes("strike")) html = `<strike>${html}</strike>`;
  if (run.marks.includes("underline")) html = `<u>${html}</u>`;
  if (run.marks.includes("italic")) html = `<i>${html}</i>`;
  if (run.marks.includes("bold")) html = `<b>${html}</b>`;

  if (run.href) html = `<a href="${escapeAttribute(run.href)}">${html}</a>`;

  const style = styleAttribute([
    run.color ? `color: ${run.color}` : null,
    run.background ? `background-color: ${run.background}` : null,
    run.fontFamily ? `font-family: ${run.fontFamily}` : null,
    run.fontSize !== undefined && run.fontSize !== blockFontSize
      ? `font-size: ${fontSizeToCss(run.fontSize)}`
      : null,
  ]);
  if (style) html = `<span${style}>${html}</span>`;

  return html;
};

const serializeInline = (
  inline: RichInline,
  blockFontSize?: number,
): string => {
  if (inline.type === "break") return "<br>";

  if (inline.type === "mention") {
    return (
      `<span class="mention-tag" contenteditable="false" data-type="${inline.kind}" data-id="${escapeAttribute(inline.id)}">` +
      `<img src="${escapeAttribute(inline.image ?? "")}" alt="${escapeAttribute(inline.name)}" class="mention-avatar">` +
      `<span class="mention-text">${escapeText(inline.name)}</span>` +
      "</span>"
    );
  }

  return serializeRun(inline, blockFontSize);
};

const blockStyle = (block: RichBlock, fontSize?: number): string =>
  styleAttribute([
    block.align ? `text-align: ${block.align}` : null,
    fontSize !== undefined ? `font-size: ${fontSizeToCss(fontSize)}` : null,
  ]);

const serializeChildren = (block: RichBlock, fontSize?: number): string => {
  // A block with nothing in it is the blank line the author pressed return
  // for. The editor writes it as `<div><br></div>`, and a browser gives that
  // a line's height where an empty `<div>` gets none.
  if (block.children.length === 0) return "<br>";
  return block.children
    .map((child) => serializeInline(child, fontSize))
    .join("");
};

const serializeBlock = (block: RichBlock): string => {
  const fontSize = uniformFontSize(block);
  const inner = serializeChildren(block, fontSize);

  switch (block.type) {
    case "heading": {
      const level = Math.min(6, Math.max(1, block.level ?? 2));
      return `<h${level}${blockStyle(block, fontSize)}>${inner}</h${level}>`;
    }
    case "quote":
      return `<blockquote${blockStyle(block, fontSize)}>${inner}</blockquote>`;
    case "listItem":
      return `<li${blockStyle(block, fontSize)}>${inner}</li>`;
    default:
      return `<div${blockStyle(block, fontSize)}>${inner}</div>`;
  }
};

const serializeImage = (image: RichImageBlock): string => {
  const alt = image.alt ? ` alt="${escapeAttribute(image.alt)}"` : "";
  const wrapper = styleAttribute([
    image.align ? `text-align: ${image.align}` : null,
  ]);

  // Sized by the editor: the container carries the percentage and the image
  // fills it. This is `insertImageFromUrl`'s markup, attribute for attribute.
  if (image.widthPercent !== undefined) {
    const pct = Math.round(image.widthPercent);
    // Written only when the node carries one. The editor always sets it on
    // insertion, and both clients read an absent one as `full` — so writing
    // the default for a node that never had it would only make the round
    // trip stop being a fixed point.
    const wrap = image.wrap
      ? ` data-wrap="${escapeAttribute(image.wrap)}"`
      : "";
    return (
      `<div${wrapper}>` +
      `<span class="inline-image-container" contenteditable="false" style="width: ${pct}%"${wrap}>` +
      `<img src="${escapeAttribute(image.src)}" class="inline-image"${alt} style="width: 100%; height: auto; max-width: none; max-height: none" data-width-pct="${pct}">` +
      "</span></div>"
    );
  }

  // Pasted in with its own pixel caps, which are kept as it brought them.
  const caps = styleAttribute([
    image.maxWidth !== undefined ? `max-width: ${image.maxWidth}px` : null,
    image.maxHeight !== undefined ? `max-height: ${image.maxHeight}px` : null,
  ]);
  return `<div${wrapper}><img src="${escapeAttribute(image.src)}"${alt}${caps}></div>`;
};

const sameList = (a: RichListStyle, b: RichListStyle): boolean =>
  a.ordered === b.ordered && (a.style ?? "") === (b.style ?? "");

const openList = (list: RichListStyle): string => {
  const tag = list.ordered ? "ol" : "ul";
  if (!list.style) return `<${tag}>`;
  return `<${tag} style="list-style-type: ${list.style}" data-list-style-type="${escapeAttribute(list.style)}">`;
};

/**
 * The tree as the editor's HTML.
 *
 * Consecutive list items with the same list style are one `<ul>`/`<ol>`; the
 * parser reads them back as separate items with a shared `list`, so the pair
 * agree. Everything else is one element per node.
 */
export const serializeRichText = (nodes: RichNode[]): string => {
  const out: string[] = [];
  let open: RichListStyle | null = null;

  const closeList = () => {
    if (!open) return;
    out.push(open.ordered ? "</ol>" : "</ul>");
    open = null;
  };

  for (const node of nodes) {
    if (node.type === "image") {
      closeList();
      out.push(serializeImage(node));
      continue;
    }

    if (node.type === "listItem") {
      const list = node.list ?? { ordered: false };
      if (!open || !sameList(open, list)) {
        closeList();
        out.push(openList(list));
        open = list;
      }
      out.push(serializeBlock(node));
      continue;
    }

    closeList();
    out.push(serializeBlock(node));
  }

  closeList();
  return out.join("");
};

/**
 * Whether there is anything worth saving.
 *
 * Blank lines are not content — a document of three empty paragraphs is what
 * the editor holds after someone presses return a few times and thinks better
 * of it. An image or a mention is, whatever the text around it says.
 */
export const richTextIsEmpty = (nodes: RichNode[]): boolean =>
  nodes.every(
    (node) =>
      node.type !== "image" &&
      node.children.every((child) =>
        child.type === "text"
          ? child.text.trim().length === 0
          : child.type === "break",
      ),
  );
