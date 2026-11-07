/**
 * The spell-check engine: Hunspell (via `nspell`) plus a phonetic layer.
 *
 * Hunspell's own suggestions are edit-distance based and miss anything spelled
 * by ear ("sinagog", "nolidge", "sikology" return nothing useful). A Double
 * Metaphone index over the dictionary — built on the first `suggest`, about
 * 120 ms on a desktop — adds words that *sound* like the input, ranked by edit
 * distance, so those come back as synagogue, knowledge and psychology.
 *
 * Pure computation over the dictionary text the caller hands in. On web it
 * runs inside a worker (parsing ~550 KB and the brute-force suggest search
 * would stall typing on the main thread); on a phone it runs on the JS thread
 * at idle, with `suggest` only ever called when a menu opens.
 */

import { doubleMetaphone } from "double-metaphone";
import nspell from "nspell";

const MAX_SUGGESTIONS = 6;

/**
 * The longest word Hunspell's two-edit search is allowed to run on.
 *
 * When no word is one edit away, nspell falls back to every two-edit variant
 * — for a nine-letter word about a hundred thousand candidates, each checked
 * against the affix tables and all kept in memory. A worker shrugs that off;
 * a phone runs it on the JS thread, and on Hermes a keyboard mash
 * ("aksdhkjas") took seconds and ran an iPhone out of memory. Short words
 * cost little (nspell bounds the batch by length), and long real misspellings
 * are what the phonetic index is for ("nolidge" → knowledge).
 */
const DEEP_SEARCH_MAX_LENGTH = 7;

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/**
 * Whether any word is one edit from `word` (delete, transpose, replace,
 * insert) — about 54n + 25 dictionary lookups, stopping at the first hit.
 * That is when Hunspell's search ends at its cheap first level.
 */
const hasNeighbour = (word: string, known: (w: string) => boolean): boolean => {
  const n = word.length;
  for (let i = 0; i < n; i++) {
    if (known(word.slice(0, i) + word.slice(i + 1))) return true;
    if (
      i < n - 1 &&
      known(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2))
    )
      return true;
  }
  for (let i = 0; i <= n; i++) {
    for (const c of LETTERS) {
      if (i < n && c !== word[i]) {
        if (known(word.slice(0, i) + c + word.slice(i + 1))) return true;
      }
      if (known(word.slice(0, i) + c + word.slice(i))) return true;
    }
  }
  return false;
};

/** nspell keeps the parsed word list on `data`; the typings don't say so. */
type Speller = ReturnType<typeof nspell> & { data: Record<string, unknown> };

export interface SpellEngine {
  /** Whether the dictionary (plus added words) knows `word`. */
  correct: (word: string) => boolean;
  /** Corrections, best first; at most six. */
  suggest: (word: string) => string[];
  add: (word: string) => void;
  remove: (word: string) => void;
}

/** Damerau–Levenshtein (optimal string alignment) distance. */
const distance = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d.push(new Array<number>(n + 1).fill(0));
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
};

export const createSpellEngine = (
  aff: string,
  dic: string,
  personal: Iterable<string> = [],
): SpellEngine => {
  const speller = nspell(aff, dic) as Speller;
  for (const w of personal) speller.add(w);

  let phonetic: Map<string, string[]> | null = null;

  /** Metaphone code → dictionary words, built once. */
  const phoneticIndex = (): Map<string, string[]> => {
    if (phonetic) return phonetic;
    const index = new Map<string, string[]>();
    for (const word of Object.keys(speller.data)) {
      if (!/^[A-Za-z][a-z]+$/.test(word)) continue;
      const [primary, secondary] = doubleMetaphone(word);
      const codes = primary === secondary ? [primary] : [primary, secondary];
      for (const code of codes) {
        if (!code) continue;
        const bucket = index.get(code);
        if (bucket) bucket.push(word);
        else index.set(code, [word]);
      }
    }
    phonetic = index;
    return index;
  };

  /**
   * Words that sound like `word` within `limit` edits, nearest spelling
   * first. A lower-case input never gets proper nouns (no "Recife" for
   * "recieve").
   */
  const soundsLike = (word: string, limit: number): string[] => {
    const index = phoneticIndex();
    const [primary, secondary] = doubleMetaphone(word);
    const candidates = new Set<string>();
    for (const code of [primary, secondary]) {
      if (!code) continue;
      for (const w of index.get(code) ?? []) candidates.add(w);
    }
    const lower = word.toLowerCase();
    const allowProper = word[0] !== lower[0];
    return [...candidates]
      .filter((w) => allowProper || w[0] === w[0].toLowerCase())
      .map((w) => ({ d: distance(lower, w.toLowerCase()), w }))
      .filter(({ d, w }) => d <= limit && w.toLowerCase() !== lower)
      .sort((x, y) => x.d - y.d || x.w.length - y.w.length)
      .map(({ w }) => w);
  };

  const suggest = (word: string): string[] => {
    const out: string[] = [];
    const seen = new Set<string>();
    const push = (w: string) => {
      const key = w.toLowerCase();
      if (seen.has(key) || out.length >= MAX_SUGGESTIONS) return;
      seen.add(key);
      out.push(w);
    };
    // Hunspell only where its search stays cheap: a word one edit from
    // something real, or a short one (see `DEEP_SEARCH_MAX_LENGTH`).
    const own =
      word.length <= DEEP_SEARCH_MAX_LENGTH ||
      hasNeighbour(word.toLowerCase(), (w) => speller.correct(w))
        ? speller.suggest(word)
        : [];
    for (const w of own) push(w);
    // Sound-alikes may stray as far as longer words need ("nolidge" is three
    // edits from "knowledge"), but when Hunspell already has suggestions they
    // may be at most one edit farther than its best one — so a good list is
    // never padded with noise ("recieve" keeps "resew" out), while a weak one
    // ("foliage") still gets the phonetic match beside it.
    const loose = Math.max(2, Math.ceil(word.length / 2));
    const lower = word.toLowerCase();
    const best = own.length
      ? Math.min(...own.map((w) => distance(lower, w.toLowerCase()))) + 1
      : loose;
    const limit = Math.max(2, Math.min(loose, best));
    if (out.length < MAX_SUGGESTIONS) {
      for (const w of soundsLike(word, limit)) push(w);
    }
    return out;
  };

  return {
    add: (word) => {
      speller.add(word);
    },
    correct: (word) => speller.correct(word),
    remove: (word) => {
      speller.remove(word);
    },
    suggest,
  };
};
