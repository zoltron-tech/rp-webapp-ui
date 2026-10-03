/**
 * The shorthand people type into a chat box, and what it means on the wire.
 *
 * Web composes messages in a `contenteditable`, so bold is a keystroke and what
 * leaves the browser is already `<strong>`. A phone has no `contenteditable`
 * and no toolbar worth the vertical space, so the native composer takes the
 * convention every other messaging app has trained people on — `**bold**`,
 * `*italic*`, `~~strike~~`, `` `code` `` — and turns it into the *same* markup
 * the browser would have sent.
 *
 * That last part is why this lives here rather than in `apps/mobile`. The
 * output is read back by `@nw/richtext` on both clients and by the inbox
 * preview, so "what a message written on a phone contains" is a fact the two
 * clients have to agree on. Emitting Markdown on the wire instead would have
 * been simpler and wrong: web would render `**shouting**` as four literal
 * asterisks, and nothing would say why.
 *
 * Two functions are exported and one scanner does the work:
 *
 *  - `hasMarkdown` says whether the text uses any of the shorthand, which is
 *    what decides between sending it as HTML and sending it untouched.
 *  - `markdownToHtml` produces the editor's markup.
 *
 * `tokenizeMarkdown` is exported alongside them and is *lossless*: every
 * character of the input comes back exactly once, tagged with the marks in
 * force and with whether it is a delimiter. That property is load-bearing — the
 * native composer draws those tokens as the `TextInput`'s own children, so the
 * text on screen is literally the tokens joined back together, and a tokenizer
 * that dropped or tidied anything would silently eat what someone typed.
 */

export type MarkdownMark = "bold" | "italic" | "strike" | "code";

export interface MarkdownToken {
  /** The characters as typed, delimiters included. */
  text: string;
  /** Marks in force here, outermost first. */
  marks: MarkdownMark[];
  /**
   * True for the `**`, `*`, `~~` or backtick characters themselves.
   *
   * The composer dims these rather than hiding them: text that rewrites itself
   * as you type is disorienting, and removing the closing `**` from the field
   * would move the caret out from under the finger that just typed it.
   */
  delimiter: boolean;
}

/**
 * A delimiter, and what it turns on.
 *
 * Order matters. `**` is tried before `*`, or every bold opener is read as an
 * italic one wrapping an empty string. Code is tried first because a backtick
 * span suppresses everything inside it, which is the whole point of one.
 */
interface Rule {
  mark: MarkdownMark;
  open: string;
  /** Matches the delimiter, its content and its closer, anchored at an index. */
  pattern: RegExp;
  /** False for code: `` `**x**` `` is two asterisks, not bold. */
  nests: boolean;
}

/*
 * Each pattern requires a non-space immediately inside both delimiters, which
 * is what stops arithmetic and prose becoming accidental formatting: `2 * 3 *
 * 4` has spaces after every asterisk, and `a ** b` never opens. Content cannot
 * span a blank line either — an unclosed `*` at the top of a long message would
 * otherwise italicise everything below it until the next one.
 */
const RULES: Rule[] = [
  {
    mark: "code",
    nests: false,
    open: "`",
    pattern: /^`([^`\n]+)`/,
  },
  {
    mark: "bold",
    nests: true,
    open: "**",
    pattern: /^\*\*(\S(?:[^\n]*?\S)?)\*\*/,
  },
  {
    mark: "strike",
    nests: true,
    open: "~~",
    pattern: /^~~(\S(?:[^\n]*?\S)?)~~/,
  },
  {
    mark: "italic",
    nests: true,
    open: "*",
    pattern: /^\*(\S(?:[^*\n]*?\S)?)\*/,
  },
  {
    mark: "italic",
    nests: true,
    open: "_",
    // Underscores only count at a word boundary, so `snake_case_names` and
    // `__init__` survive being typed into a chat about code.
    pattern: /^_(\S(?:[^_\n]*?\S)?)_(?![A-Za-z0-9])/,
  },
];

/** `_italic_` must not fire mid-word; `*italic*` may. */
const startsWord = (text: string, index: number): boolean => {
  if (index === 0) return true;
  return !/[A-Za-z0-9]/.test(text.charAt(index - 1));
};

const scan = (
  text: string,
  marks: MarkdownMark[],
  out: MarkdownToken[],
): void => {
  let plain = "";

  const flush = () => {
    if (!plain) return;
    out.push({ delimiter: false, marks, text: plain });
    plain = "";
  };

  let index = 0;
  while (index < text.length) {
    const rest = text.slice(index);
    let matched = false;

    for (const rule of RULES) {
      // A mark already in force is not reopened: `**a **b** c**` is one bold
      // span with literal asterisks inside, not a nesting puzzle.
      if (marks.includes(rule.mark)) continue;
      if (rule.open === "_" && !startsWord(text, index)) continue;

      const match = rule.pattern.exec(rest);
      if (!match) continue;

      flush();
      const inner = match[1] as string;
      const nested = [...marks, rule.mark];

      out.push({ delimiter: true, marks: nested, text: rule.open });
      if (rule.nests) {
        scan(inner, nested, out);
      } else {
        out.push({ delimiter: false, marks: nested, text: inner });
      }
      out.push({ delimiter: true, marks: nested, text: rule.open });

      index += match[0].length;
      matched = true;
      break;
    }

    if (matched) continue;
    plain += text.charAt(index);
    index += 1;
  }

  flush();
};

/**
 * Every character of `text`, tagged with the marks around it.
 *
 * Concatenating `token.text` in order gives back exactly what was passed in.
 * Nothing is dropped, reordered or normalised.
 */
export const tokenizeMarkdown = (text: string): MarkdownToken[] => {
  if (!text) return [];
  const tokens: MarkdownToken[] = [];
  scan(text, [], tokens);
  return tokens;
};

/** Does this text actually use any of the shorthand? */
export const hasMarkdown = (text: string): boolean =>
  tokenizeMarkdown(text).some((token) => token.delimiter);

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const TAGS: Record<MarkdownMark, string> = {
  bold: "strong",
  code: "code",
  italic: "em",
  strike: "s",
};

/** Wraps escaped text in the tags for its marks, outermost first. */
const wrap = (text: string, marks: MarkdownMark[]): string => {
  let html = escapeHtml(text);
  for (let index = marks.length - 1; index >= 0; index -= 1) {
    const tag = TAGS[marks[index] as MarkdownMark];
    html = `<${tag}>${html}</${tag}>`;
  }
  return html;
};

const sameMarks = (a: MarkdownMark[], b: MarkdownMark[]): boolean =>
  a.length === b.length && a.every((mark, index) => mark === b[index]);

/**
 * One line of a message, as inline HTML.
 *
 * Adjacent runs carrying identical marks are merged first, so an unformatted
 * sentence is one text node rather than one per character.
 *
 * Nesting is expressed by repetition rather than by containment: `**a *b* c**`
 * becomes `<strong>a </strong><strong><em>b</em></strong><strong> c</strong>`,
 * not one `<strong>` wrapping three children. Both render identically in every
 * consumer — `parseRichText` accumulates marks down the tree exactly the same
 * way — and the flat form falls straight out of a lossless token stream, where
 * the nested form would need a second tree built only to be flattened again.
 */
const lineToHtml = (line: string): string => {
  const runs: { marks: MarkdownMark[]; text: string }[] = [];

  for (const token of tokenizeMarkdown(line)) {
    if (token.delimiter) continue;
    const previous = runs[runs.length - 1];
    if (previous && sameMarks(previous.marks, token.marks)) {
      previous.text += token.text;
    } else {
      runs.push({ marks: token.marks, text: token.text });
    }
  }

  return runs.map((run) => wrap(run.text, run.marks)).join("");
};

/**
 * The message as the rich editor would have saved it.
 *
 * One `<div>` per line, which is what a `contenteditable` produces and
 * therefore what `parseRichText` is tuned for; an empty line becomes
 * `<div><br></div>` so a deliberate blank line survives the round trip instead
 * of collapsing.
 *
 * Callers should send plain text unchanged when `hasMarkdown` is false. Wrapping
 * an unformatted message in markup is not harmless: `isMediaOnlyMessage` stops
 * recognising a bare GIF URL, and the inbox preview starts describing sentences
 * it used to quote.
 */
export const markdownToHtml = (text: string): string =>
  text
    .split("\n")
    .map((line) => {
      const html = lineToHtml(line);
      return `<div>${html || "<br>"}</div>`;
    })
    .join("");
