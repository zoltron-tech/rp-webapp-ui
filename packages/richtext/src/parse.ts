import type {
  RichAlign,
  RichBlock,
  RichInline,
  RichListStyle,
  RichMark,
  RichNode,
  RichTextRun,
} from "./types";

/**
 * The editor's saved HTML, read without a DOM.
 *
 * A tokenizer rather than `innerHTML` + a tree walk, because this has to run on
 * a phone where there is no `document`. It is deliberately tolerant: the input
 * is markup a rich-text editor produced and a database stored, so unclosed
 * tags, stray attributes and tags nobody planned for are all normal. Anything
 * unrecognised renders its children and contributes no formatting of its own,
 * which degrades to plain text rather than to nothing.
 *
 * This is not a sanitiser and must not be mistaken for one. It ignores
 * `<script>` and `<style>` content, but that is because neither is text worth
 * rendering — the stored HTML is trusted the same way the web renderer trusts
 * it (see the `no-html-sanitizer` note).
 */

const MARKS: Record<string, RichMark> = {
  b: "bold",
  code: "code",
  del: "strike",
  em: "italic",
  i: "italic",
  s: "strike",
  strike: "strike",
  strong: "bold",
  u: "underline",
};

const BLOCK_TAGS = new Set([
  "blockquote",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "p",
  "pre",
]);

const IGNORED = new Set(["script", "style", "head", "title"]);

const ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const decode = (text: string): string =>
  text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    if (body.startsWith("#")) {
      const code =
        body.startsWith("#x") || body.startsWith("#X")
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });

interface Attributes {
  [name: string]: string;
}

const parseAttributes = (raw: string): Attributes => {
  const attributes: Attributes = {};
  const pattern =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match = pattern.exec(raw);
  while (match) {
    attributes[match[1].toLowerCase()] = decode(
      match[3] ?? match[4] ?? match[5] ?? "",
    );
    match = pattern.exec(raw);
  }
  return attributes;
};

const ALIGNMENTS = new Set(["left", "center", "right", "justify"]);

/** `style="text-align: center"` → the alignment, if it is one we render. */
const alignFromStyle = (style: string | undefined): RichAlign | undefined => {
  if (!style) return undefined;
  const match = /(?:^|;)\s*text-align\s*:\s*([^;]+)/i.exec(style);
  const value = match?.[1].trim().toLowerCase();
  return value && ALIGNMENTS.has(value) ? (value as RichAlign) : undefined;
};

/**
 * The three sizes the editor offers, in CSS pixels.
 *
 * It writes them as `var(--font-size-h2)` and friends, which mean nothing
 * without the stylesheet — so the tokens are resolved here, once, from the same
 * values `globals.css` declares. `--font-size-input` is the default and is
 * deliberately absent: recording it would mark every ordinary run as "sized".
 */
const FONT_SIZE_TOKENS: Record<string, number> = {
  "--font-size": 14,
  "--font-size-h1": 54,
  "--font-size-h2": 43,
  "--font-size-h3": 34,
  "--font-size-h4": 27,
  "--font-size-h5": 22,
  "--font-size-h6": 18,
  "--font-size-small": 12,
  "--font-size-xsmall": 10,
  "--font-size-xxsmall": 8,
  "--font-size-xxxsmall": 6,
};

/** The size the editor treats as "Normal"; a run at this size is unstyled. */
const DEFAULT_FONT_SIZE_PX = 16;

const declaration = (style: string, property: string): string | undefined => {
  const pattern = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, "i");
  const match = pattern.exec(style);
  return match ? match[1].trim() : undefined;
};

/** `font-size: var(--font-size-h2)` or `font-size: 20px` → pixels. */
const fontSizeFromStyle = (style: string | undefined): number | undefined => {
  const value = style && declaration(style, "font-size");
  if (!value) return undefined;

  const token = /^var\(\s*(--[a-z0-9-]+)/i.exec(value);
  if (token) {
    const px = FONT_SIZE_TOKENS[token[1].toLowerCase()];
    return px && px !== DEFAULT_FONT_SIZE_PX ? px : undefined;
  }

  const px = /^([0-9.]+)px$/i.exec(value);
  if (px) {
    const size = Number.parseFloat(px[1]);
    return Number.isFinite(size) && size !== DEFAULT_FONT_SIZE_PX
      ? size
      : undefined;
  }

  return undefined;
};

/** The highlight the editor paints behind text. */
const backgroundFromStyle = (style: string | undefined): string | undefined =>
  style ? declaration(style, "background-color") : undefined;

/** A pixel length from a declaration, e.g. `max-width: 32px` → 32. */
const pixelsFromStyle = (
  style: string | undefined,
  property: string,
): number | undefined => {
  const value = style && declaration(style, property);
  const match = value && /^([0-9.]+)px$/i.exec(value);
  if (!match) return undefined;
  const pixels = Number.parseFloat(match[1]);
  return Number.isFinite(pixels) ? pixels : undefined;
};

/** `width: 32%` on an image container → 32. */
const widthPercentFromStyle = (
  style: string | undefined,
): number | undefined => {
  const value = style && declaration(style, "width");
  const match = value && /^([0-9.]+)%$/.exec(value);
  if (!match) return undefined;
  const percent = Number.parseFloat(match[1]);
  return Number.isFinite(percent) ? percent : undefined;
};

/** `style="color: #abc; font-weight: bold"` → the colour, if any. */
const colorFromStyle = (style: string | undefined): string | undefined => {
  if (!style) return undefined;
  const match = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style);
  return match ? match[1].trim() : undefined;
};

/**
 * `font-family: "Times New Roman"` → `Times New Roman`.
 *
 * The editor writes the family unquoted and the browser serialises it back
 * quoted when it has a space in it; both are one name here. The web default is
 * deliberately absent, as with sizes: recording it would mark every ordinary
 * run as "in a font".
 */
const DEFAULT_FONT_FAMILY = "Arial";

const fontFamilyFromStyle = (style: string | undefined): string | undefined => {
  const value = style && declaration(style, "font-family");
  if (!value) return undefined;
  const family = value
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
  return family && family !== DEFAULT_FONT_FAMILY ? family : undefined;
};

/**
 * The list style a `<ul>` or `<ol>` carries.
 *
 * The editor writes it twice — as a `list-style-type` in the inline style and
 * as `data-list-style-type` — because a browser refuses to keep an unknown
 * keyword in `listStyleType` but keeps any string in a data attribute. Either
 * is read, and the CSS defaults (`disc`, `decimal`) count as no style.
 */
const listStyleFromAttributes = (
  attributes: Attributes,
  ordered: boolean,
): RichListStyle => {
  const raw =
    attributes["data-list-style-type"] ??
    (attributes.style
      ? declaration(attributes.style, "list-style-type")
      : undefined);
  const style = raw?.trim();
  if (!style || style === (ordered ? "decimal" : "disc")) return { ordered };
  return { ordered, style };
};

/**
 * What the editor's picker symbol names look like on the page.
 *
 * The editor stores a *name* (`fisheye`, `arrow-heavy`) and draws the glyph
 * through CSS. The names and glyphs are its `BULLET_POINT_CATEGORIES`, kept
 * here so a phone can draw the same bullet a browser would rather than a disc
 * for every list that chose something else.
 */
export const BULLET_GLYPHS: Record<string, string> = {
  "arrow-bar": "↦",
  "arrow-black": "➡",
  "arrow-bottom-light": "➣",
  "arrow-circled": "➲",
  "arrow-concave": "➨",
  "arrow-curved-down": "➥",
  "arrow-curved-up": "➦",
  "arrow-dashed": "⇢",
  "arrow-double": "⇒",
  "arrow-drafting": "➛",
  "arrow-feathered": "➳",
  "arrow-feathered-black": "➵",
  "arrow-feathered-heavy": "➸",
  "arrow-heavy": "➔",
  "arrow-heavy-right": "➙",
  "arrow-loop": "↬",
  "arrow-notched": "➱",
  "arrow-open-head": "⇾",
  "arrow-open-outline": "➾",
  "arrow-round": "➜",
  "arrow-shadowed": "➮",
  "arrow-simple": "→",
  "arrow-squat": "➧",
  "arrow-squiggle": "⇝",
  "arrow-tail": "↣",
  "arrow-top-light": "➢",
  "arrow-triangle-dashed": "➟",
  "arrow-triangle-head": "➝",
  "arrow-triangle-heavy": "➞",
  "arrow-triangle-heavy-dashed": "➠",
  "arrow-triple": "⇛",
  "arrow-two-head": "↠",
  "arrow-wedge": "➼",
  "arrow-wedge-heavy": "➽",
  "arrow-white": "⇨",
  "arrowhead-black": "➤",
  "asterisk-four-spoke": "✤",
  "ballot-box": "☐",
  "ballot-box-check": "☑",
  "ballot-box-x": "☒",
  "black-circle": "●",
  "black-diamond": "◆",
  "black-square": "■",
  "black-star": "★",
  bullet: "•",
  bullseye: "◎",
  "check-mark": "✓",
  "circle-vertical-fill": "◍",
  "circled-asterisk": "⊛",
  "circled-black": "⦿",
  "circled-dot": "⊙",
  "circled-ring": "⊚",
  "circled-white": "⦾",
  "dharma-wheel": "☸",
  "dotted-circle": "◌",
  fisheye: "◉",
  "heavy-asterisk": "✱",
  "heavy-check-mark": "✔",
  "hyphen-bullet": "⁃",
  "inverse-bullet": "◘",
  "left-bullet": "⁌",
  "middle-dot": "·",
  "open-asterisk": "✲",
  pointer: "►",
  "reversed-floral-heart": "☙",
  "right-bullet": "⁍",
  "rotated-floral-heart": "❧",
  "rotated-heavy-heart": "❥",
  "small-filled": "▪",
  "small-square-filled": "◾",
  "small-triangle": "▸",
  sun: "☉",
  "triangle-right": "▶",
  "triangular-bullet": "‣",
  "white-bullet": "◦",
  "white-circle": "○",
  "white-diamond": "◇",
  "white-diamond-black": "◈",
  "white-pointer": "▻",
  "white-small-triangle": "▹",
  "white-square": "□",
  "white-star": "☆",
  "white-triangle-right": "▷",
};

const toRoman = (value: number): string => {
  const numerals: [number, string][] = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let remaining = value;
  let out = "";
  for (const [amount, glyph] of numerals) {
    while (remaining >= amount) {
      out += glyph;
      remaining -= amount;
    }
  }
  return out;
};

const toAlpha = (value: number): string => {
  let remaining = value;
  let out = "";
  while (remaining > 0) {
    remaining -= 1;
    out = String.fromCharCode(97 + (remaining % 26)) + out;
    remaining = Math.floor(remaining / 26);
  }
  return out;
};

/** The marker for the `count`th item of a list drawn in `list`'s style. */
export const listMarker = (list: RichListStyle, count: number): string => {
  if (!list.ordered) return BULLET_GLYPHS[list.style ?? "bullet"] ?? "•";
  switch (list.style) {
    case "lower-alpha":
      return `${toAlpha(count)}.`;
    case "upper-alpha":
      return `${toAlpha(count).toUpperCase()}.`;
    case "lower-roman":
      return `${toRoman(count)}.`;
    case "upper-roman":
      return `${toRoman(count).toUpperCase()}.`;
    default:
      return `${count}.`;
  }
};

/** One open element, and what it contributes to the runs inside it. */
interface Frame {
  tag: string;
  marks: RichMark[];
  align?: RichAlign;
  background?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  href?: string;
  /** Set on an `.inline-image-container`: how wide the image inside it is. */
  widthPercent?: number;
  /** `data-wrap` on that container. */
  wrap?: string;
  /** Set on a `.mention-tag` span: collect its text instead of emitting runs. */
  mention?: { id: string; kind: "NOVELIST" | "MUSE"; image?: string };
}

/**
 * An object without its `undefined` keys.
 *
 * A node that says `align: undefined` and one that says nothing about
 * alignment mean the same thing, and the editing model compares nodes
 * structurally — so they had better *be* the same thing.
 */
const compact = <T extends object>(value: T): T => {
  const out = { ...value };
  for (const key of Object.keys(out) as (keyof T)[]) {
    if (out[key] === undefined) delete out[key];
  }
  return out;
};

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

export const parseRichText = (html: string | null | undefined): RichNode[] => {
  if (!html) return [];

  const nodes: RichNode[] = [];
  const stack: Frame[] = [];

  let block: RichBlock | null = null;
  /** Nesting of `<ol>`/`<ul>`; each level counts its own items. */
  const ordered: { count: number; list: RichListStyle }[] = [];
  let mentionText = "";

  const inMention = () => stack.some((frame) => frame.mention);

  /** The nearest enclosing element's alignment, for a block that sets none. */
  const inheritedAlign = (): RichAlign | undefined => {
    for (let index = stack.length - 1; index >= 0; index -= 1) {
      if (stack[index].align) return stack[index].align;
    }
    return undefined;
  };

  const openBlock = (
    type: RichBlock["type"],
    level?: number,
    marker?: string,
    align?: RichAlign,
    list?: RichListStyle,
    fontSize?: number,
  ) => {
    closeBlock();
    block = compact({
      align,
      children: [],
      fontSize,
      level,
      list,
      marker,
      type,
    });
  };

  const closeBlock = () => {
    if (!block) return;

    // A block with nothing but whitespace is the editor's spacing, not content.
    // A block holding only a `<br>` is different: that is the blank line
    // someone typed between two paragraphs, and a browser gives it a line's
    // height. It survives as a block with no children — see `trimEdges`.
    const meaningful = block.children.some(
      (child) => child.type !== "text" || child.text.trim().length > 0,
    );

    if (meaningful) {
      const trimmed = trimEdges(block);
      const largest = trimmed.children.reduce(
        (size, child) =>
          child.type === "text" && child.fontSize
            ? Math.max(size, child.fontSize)
            : size,
        0,
      );
      // The text decides the size when there is text. An empty sized line —
      // `<div style="font-size: …"><br></div>`, the blank line after a
      // heading — keeps the size its element carried, which is the size the
      // editor will type in when the caret lands there.
      if (largest > 0) trimmed.fontSize = largest;
      else if (trimmed.children.some((child) => child.type === "text")) {
        delete trimmed.fontSize;
      }
      nodes.push(trimmed);
    }

    block = null;
  };

  const push = (inline: RichInline) => {
    if (!block) block = { children: [], type: "paragraph" };
    block.children.push(inline);
  };

  const pushText = (text: string) => {
    if (!text) return;

    // Marks accumulate down the tree; the others are last-wins, which is what
    // the cascade does with an inline style on a nested element.
    const marks: RichMark[] = [];
    let background: string | undefined;
    let color: string | undefined;
    let fontFamily: string | undefined;
    let fontSize: number | undefined;
    let href: string | undefined;

    for (const frame of stack) {
      for (const mark of frame.marks)
        if (!marks.includes(mark)) marks.push(mark);
      if (frame.background) background = frame.background;
      if (frame.color) color = frame.color;
      if (frame.fontFamily) fontFamily = frame.fontFamily;
      if (frame.fontSize) fontSize = frame.fontSize;
      if (frame.href) href = frame.href;
    }

    const run: RichTextRun = { marks, text, type: "text" };
    if (background) run.background = background;
    if (color) run.color = color;
    if (fontFamily) run.fontFamily = fontFamily;
    if (fontSize) run.fontSize = fontSize;
    if (href) run.href = href;
    push(run);
  };

  const pattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let cursor = 0;
  let match = pattern.exec(html);

  /**
   * Text, exactly as stored.
   *
   * The web renderer styles saved content `white-space: pre-wrap`, so both the
   * newlines *and* the runs of spaces are what the author typed and what a
   * browser shows. Profiles lean on this hard: leading spaces are how people
   * centre and indent a line without a CSS tool.
   *
   * Collapsing whitespace the way ordinary HTML does is what turned a
   * plain-text profile into one unbroken paragraph, and what pulled indented
   * lines back to the margin.
   */
  const emitText = (raw: string) => {
    if (!raw) return;

    const text = decode(raw);
    if (!text) return;

    if (inMention()) {
      // A chip is one line whatever its markup says.
      mentionText += text.replace(/\s+/g, " ");
      return;
    }
    if (stack.some((frame) => IGNORED.has(frame.tag))) return;

    const lines = text.split("\n");
    lines.forEach((line, index) => {
      if (index > 0) push({ type: "break" });
      pushText(line);
    });
  };

  while (match) {
    emitText(html.slice(cursor, match.index));
    cursor = match.index + match[0].length;

    const closing = match[0][1] === "/";
    const tag = match[1].toLowerCase();
    const attributes = closing ? {} : parseAttributes(match[2] ?? "");
    const selfClosing =
      !closing && (VOID_TAGS.has(tag) || /\/\s*$/.test(match[2] ?? ""));

    if (closing) {
      if (tag === "ol" || tag === "ul") {
        closeBlock();
        ordered.pop();
      } else if (BLOCK_TAGS.has(tag)) {
        closeBlock();
      }

      // Unwind to the matching frame; markup that never closed is dropped
      // rather than left holding formatting open over the rest of the document.
      const index = stack.map((frame) => frame.tag).lastIndexOf(tag);
      if (index !== -1) {
        const frame = stack[index];
        if (frame.mention) {
          const name = mentionText.trim();
          mentionText = "";
          stack.length = index;
          push({
            id: frame.mention.id,
            image: frame.mention.image,
            kind: frame.mention.kind,
            name,
            type: "mention",
          });
        } else {
          stack.length = index;
        }
      }

      match = pattern.exec(html);
      continue;
    }

    if (tag === "br") {
      if (!inMention()) push({ type: "break" });
      match = pattern.exec(html);
      continue;
    }

    if (tag === "img") {
      const src = attributes.src ?? "";
      if (src && !inMention()) {
        closeBlock();
        const container = [...stack]
          .reverse()
          .find((frame) => frame.widthPercent !== undefined);
        const authored = Number.parseFloat(attributes["data-width-pct"] ?? "");
        const style = attributes.style;

        // An image the editor placed is sized by its container; anything
        // pasted in carries its own pixel limits instead.
        const maxWidth =
          pixelsFromStyle(style, "max-width") ??
          pixelsFromStyle(style, "width");
        const maxHeight =
          pixelsFromStyle(style, "max-height") ??
          pixelsFromStyle(style, "height");

        nodes.push(
          compact({
            align: inheritedAlign(),
            alt: attributes.alt,
            maxHeight,
            maxWidth,
            src,
            type: "image",
            widthPercent: Number.isFinite(authored)
              ? authored
              : container?.widthPercent,
            wrap:
              attributes["data-wrap"] ??
              [...stack].reverse().find((frame) => frame.wrap)?.wrap,
          }),
        );
      } else if (src && inMention()) {
        const frame = stack.find((entry) => entry.mention);
        if (frame?.mention && !frame.mention.image) frame.mention.image = src;
      }
      match = pattern.exec(html);
      continue;
    }

    if (tag === "ol" || tag === "ul") {
      closeBlock();
      ordered.push({
        count: 0,
        list: listStyleFromAttributes(attributes, tag === "ol"),
      });
      match = pattern.exec(html);
      continue;
    }

    const align = alignFromStyle(attributes.style) ?? inheritedAlign();
    const blockFontSize = fontSizeFromStyle(attributes.style);

    if (tag === "li") {
      const list = ordered[ordered.length - 1];
      if (list) list.count += 1;
      openBlock(
        "listItem",
        undefined,
        list ? listMarker(list.list, list.count) : "•",
        align,
        list?.list ?? { ordered: false },
        blockFontSize,
      );
    } else if (tag === "blockquote") {
      openBlock("quote", undefined, undefined, align, undefined, blockFontSize);
    } else if (/^h[1-6]$/.test(tag)) {
      openBlock(
        "heading",
        Number.parseInt(tag.slice(1), 10),
        undefined,
        align,
        undefined,
        blockFontSize,
      );
    } else if (tag === "p" || tag === "div" || tag === "pre") {
      openBlock(
        "paragraph",
        undefined,
        undefined,
        align,
        undefined,
        blockFontSize,
      );
    }

    if (!selfClosing) {
      const mark = MARKS[tag];
      const className = attributes.class ?? "";
      const isMention = className.split(/\s+/).includes("mention-tag");

      stack.push({
        align: alignFromStyle(attributes.style),
        background: backgroundFromStyle(attributes.style),
        color: colorFromStyle(attributes.style),
        // `execCommand("fontName")` writes `<font face>`; the editor rewrites
        // it to a styled span, but content saved mid-edit can still carry one.
        fontFamily:
          fontFamilyFromStyle(attributes.style) ??
          (tag === "font" && attributes.face
            ? fontFamilyFromStyle(`font-family: ${attributes.face}`)
            : undefined),
        fontSize: fontSizeFromStyle(attributes.style),
        href: tag === "a" ? attributes.href : undefined,
        marks: mark ? [mark] : [],
        mention: isMention
          ? {
              id: attributes["data-id"] ?? "",
              image: undefined,
              kind: attributes["data-type"] === "MUSE" ? "MUSE" : "NOVELIST",
            }
          : undefined,
        tag,
        widthPercent: className.split(/\s+/).includes("inline-image-container")
          ? widthPercentFromStyle(attributes.style)
          : undefined,
        wrap: attributes["data-wrap"],
      });
    }

    match = pattern.exec(html);
  }

  emitText(html.slice(cursor));
  closeBlock();

  return trimTrailing(nodes);
};

/**
 * Empty runs and stray breaks at the edges of one block.
 *
 * Whole runs only — a run's own text is never rewritten. Under `pre-wrap` the
 * spaces at the start of a line are content: they are how a profile indents or
 * centres something without a CSS tool, and trimming them silently redraws
 * someone's layout.
 *
 * What does go is markup that carries no text: the `<br>` in `<div><br></div>`
 * leaves an empty block behind, which is exactly the blank line a browser
 * renders there.
 */
const trimEdges = (block: RichBlock): RichBlock => {
  const children = [...block.children];

  const disposable = (child: RichInline) =>
    child.type === "break" ||
    (child.type === "text" && child.text.trim().length === 0);

  while (children.length > 0 && disposable(children[0])) children.shift();
  while (children.length > 0 && disposable(children[children.length - 1])) {
    children.pop();
  }

  return { ...block, children };
};

/**
 * Trailing empty blocks, dropped.
 *
 * The editor leaves them behind whenever someone presses return at the end, and
 * the web renderer trims the same thing off the DOM before measuring — without
 * it a profile ends in a gap nobody typed.
 */
const trimTrailing = (nodes: RichNode[]): RichNode[] => {
  const out = [...nodes];
  while (out.length > 0) {
    const last = out[out.length - 1];
    if (last.type === "image") break;
    const empty = last.children.every(
      (child) => child.type === "text" && !child.text.trim(),
    );
    if (!empty) break;
    out.pop();
  }
  return out;
};

/** The document as plain text — for previews, sharing and accessibility. */
export const richTextToPlainText = (nodes: RichNode[]): string =>
  nodes
    .map((node) => {
      if (node.type === "image") return node.alt ?? "";
      return node.children
        .map((child) =>
          child.type === "text"
            ? child.text
            : child.type === "mention"
              ? `@${child.name}`
              : "\n",
        )
        .join("");
    })
    .filter((line) => line.trim().length > 0)
    .join("\n");
