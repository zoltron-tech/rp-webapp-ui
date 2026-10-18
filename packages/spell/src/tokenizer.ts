/**
 * Word tokenizer + ignore rules for the spell checker. Pure: no DOM, no
 * dictionary. Runs on every text node of an editor after each change, so it
 * is deliberately small and allocation-light.
 *
 * Fiction-aware by design: Novelist World is full of muse names, invented
 * places and @handles, and every one of them would be "misspelled" to an
 * English dictionary. The rules here drop what the dictionary should never
 * see; the context names (muses, friends, story characters) are supplied by
 * the call site and matched in `isCheckable`.
 */

export interface WordToken {
  /** The word exactly as written (curly apostrophes normalised to `'`). */
  word: string;
  /** Offset of the first character within the source text. */
  start: number;
  /** Offset one past the last character within the source text. */
  end: number;
}

/**
 * Letters (any script, with combining marks) plus the in-word punctuation
 * Hunspell understands: apostrophes and hyphens. Digits are deliberately
 * excluded so "2nd", "H2O" and "1990s" never form a word.
 */
const WORD_RE = /[\p{L}\p{M}'’‘-]+/gu;

/** Characters the editors use for layout, never part of a word. */
const INVISIBLE_RE = /[​ ﻿]/g;

const URL_LIKE_RE = /^(https?:\/\/|www\.)/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Replace invisible spacers with plain spaces so offsets stay aligned. */
export const normalizeText = (text: string): string =>
  text.replace(INVISIBLE_RE, " ");

/** Curly quotes → straight apostrophe, so `don’t` checks as `don't`. */
export const normalizeWord = (word: string): string =>
  word.replace(/[’‘]/g, "'");

/**
 * Split text into candidate word tokens. Leading/trailing apostrophes and
 * hyphens are trimmed off (quotes like 'hello' or dashes between words), and
 * a trailing `'s` possessive is dropped so `Elara's` checks as `Elara`.
 */
export const tokenize = (text: string): WordToken[] => {
  const out: WordToken[] = [];
  const source = normalizeText(text);
  WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null = WORD_RE.exec(source);
  while (m) {
    let start = m.index;
    let end = start + m[0].length;
    // Trim punctuation off both ends.
    while (start < end && /['’‘-]/.test(source[start])) start++;
    while (end > start && /['’‘-]/.test(source[end - 1])) end--;
    if (end > start) {
      let word = normalizeWord(source.slice(start, end));
      if (/'s$/i.test(word) && word.length > 2) {
        word = word.slice(0, -2);
        end -= 2;
      }
      if (word.length > 0) out.push({ end, start, word });
    }
    m = WORD_RE.exec(source);
  }
  return out;
};

export interface CheckContext {
  /** Lower-cased words that are never flagged (names, personal dictionary). */
  ignore: ReadonlySet<string>;
  /** The raw text around the token, used for URL / handle detection. */
  text: string;
}

/**
 * Whether a token should be sent to the dictionary at all. Returns false for
 * everything a fiction composer legitimately contains that no dictionary
 * knows: @handles, #tags, URLs, emails, acronyms, single letters, anything
 * with digits glued on, and the names supplied by the call site.
 */
export const isCheckable = (token: WordToken, ctx: CheckContext): boolean => {
  const { word, start, end } = token;
  if (word.length < 2) return false;

  const lower = word.toLowerCase();
  if (ctx.ignore.has(lower)) return false;

  // ALL-CAPS tokens (acronyms, shouting) are left alone.
  if (word === word.toUpperCase() && word !== lower) return false;

  // Look at the characters hugging the token: a handle/tag prefix, or a word
  // that is really part of a URL / email / alphanumeric code.
  const text = ctx.text;
  const prev = start > 0 ? text[start - 1] : "";
  const next = end < text.length ? text[end] : "";
  if (prev === "@" || prev === "#") return false;
  if (/[\p{L}\p{N}_]/u.test(prev) || /[\p{L}\p{N}_]/u.test(next)) {
    // Letters on both sides of a hyphen/apostrophe are fine (we trimmed those);
    // digits or underscores glued to the word mean a code, not a word.
    if (/[\p{N}_]/u.test(prev) || /[\p{N}_]/u.test(next)) return false;
  }

  // Walk back to the previous whitespace to see what this word is part of.
  let s = start;
  while (s > 0 && !/\s/.test(text[s - 1])) s--;
  let e = end;
  while (e < text.length && !/\s/.test(text[e])) e++;
  const chunk = text.slice(s, e);
  if (URL_LIKE_RE.test(chunk) || EMAIL_RE.test(chunk)) return false;
  if (/^[@#]/.test(chunk)) return false;
  if (/\.[a-z]{2,}(\/|$)/i.test(chunk) && chunk.includes(".")) {
    // "novelist.world/rp" style bare domains.
    if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(chunk)) return false;
  }

  return true;
};

/**
 * Hyphenated words are checked part by part (Hunspell has no entry for
 * "ice-cold"). Returns the parts with offsets relative to the source text.
 */
export const splitHyphenated = (token: WordToken): WordToken[] => {
  if (!token.word.includes("-")) return [token];
  const parts: WordToken[] = [];
  let offset = token.start;
  for (const part of token.word.split("-")) {
    if (part.length > 0) {
      parts.push({ end: offset + part.length, start: offset, word: part });
    }
    offset += part.length + 1;
  }
  return parts;
};

/**
 * Turn a list of display names into ignorable words: every whitespace-separated
 * piece, lower-cased, apostrophes normalised. "Elara Vance" → elara, vance.
 */
export const namesToWords = (names: Iterable<string | null | undefined>) => {
  const out = new Set<string>();
  for (const name of names) {
    if (!name) continue;
    for (const t of tokenize(name)) {
      out.add(t.word.toLowerCase());
      // Keep the possessive-stripped and unstripped forms both.
      out.add(normalizeWord(name.slice(t.start, t.end)).toLowerCase());
    }
  }
  return out;
};

/** `Recieve` → `Receive`, `TEH` → `THE`; otherwise the replacement as given. */
export const matchCase = (original: string, replacement: string): string => {
  if (original.length > 1 && original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  const first = original[0];
  if (first && first === first.toUpperCase() && first !== first.toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
};
