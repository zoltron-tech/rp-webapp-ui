import {
  type CheckContext,
  isCheckable,
  normalizeText,
  splitHyphenated,
  tokenize,
} from "@nw/spell/tokenizer";
import { useCallback, useEffect, useRef, useState } from "react";
import { spellStore } from "./store";

/**
 * Which words of a text are misspelled, as offsets into it — and the hook
 * that keeps those lists fresh for an editor's blocks.
 *
 * Web paints ranges with the Highlight API; a native field has no such
 * thing, so the flags are handed back to the editor, which splits its text
 * runs at them and draws the split pieces underlined (`block-input.tsx`,
 * `markdown-input.tsx`).
 */

export interface SpellFlag {
  start: number;
  end: number;
  word: string;
}

const EMPTY: SpellFlag[] = [];
const DEBOUNCE_MS = 300;
/** How long after the last keystroke the word under the caret is left alone. */
const TYPING_GRACE_MS = 1500;

/**
 * The misspelled words of `text`. `caret`, when given, is an offset whose
 * word is skipped — the one still being typed.
 */
export const flagText = (
  text: string,
  ignore: ReadonlySet<string>,
  caret: number | null = null,
): SpellFlag[] => {
  if (!text || !spellStore.isReady) return EMPTY;
  const normalized = normalizeText(text);
  const ctx: CheckContext = { ignore, text: normalized };
  const out: SpellFlag[] = [];
  for (const token of tokenize(normalized)) {
    if (!isCheckable(token, ctx)) continue;
    for (const part of splitHyphenated(token)) {
      if (!isCheckable(part, ctx)) continue;
      if (caret !== null && part.start <= caret && caret <= part.end) continue;
      if (spellStore.isMisspelled(part.word) === true) {
        out.push({ end: part.end, start: part.start, word: part.word });
      }
    }
  }
  return out.length ? out : EMPTY;
};

/** The flag whose word contains `offset`, if any. */
export const flagAt = (
  flags: readonly SpellFlag[],
  offset: number,
): SpellFlag | null =>
  flags.find((f) => f.start <= offset && offset <= f.end) ?? null;

export interface UseSpellFlagsOptions {
  /** Gate from the call site; the user setting is applied on top. */
  enabled?: boolean;
  /** Names that must never be flagged: muses, friends, story characters. */
  ignore: ReadonlySet<string>;
  /** Where the caret is right now, for the typing grace. Read, not watched. */
  getCaret: () => { index: number; offset: number } | null;
  /** When the text was last edited by typing (ms); 0 for never. */
  typingAt: number;
}

/**
 * Flags for each of `texts` (one per editor block; a chat draft is one),
 * recomputed 300 ms after they change and again when the dictionary does.
 * Each block's array keeps its identity while its flags are unchanged, so a
 * memoised block does not re-render for another block's typo.
 */
export const useSpellFlags = (
  texts: readonly string[],
  { enabled = true, getCaret, ignore, typingAt }: UseSpellFlagsOptions,
): readonly SpellFlag[][] => {
  const [flags, setFlags] = useState<readonly SpellFlag[][]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previous = useRef<{ texts: readonly string[]; flags: SpellFlag[][] }>({
    flags: [],
    texts: [],
  });
  const active = enabled && spellStore.enabled;

  const compute = useCallback(() => {
    if (!active || !spellStore.isReady) {
      previous.current = { flags: [], texts: [] };
      setFlags((current) => (current.length === 0 ? current : []));
      return;
    }
    const caret = getCaret();
    const typing = Date.now() - typingAt < TYPING_GRACE_MS;
    const next: SpellFlag[][] = texts.map((text, index) => {
      const skip =
        typing && caret && caret.index === index ? caret.offset : null;
      const fresh = flagText(text, ignore, skip);
      const old = previous.current.flags[index];
      // Same text, same flags: keep the old array so the block stays memoised.
      if (
        old &&
        previous.current.texts[index] === text &&
        old.length === fresh.length &&
        old.every(
          (f, i) => f.start === fresh[i].start && f.end === fresh[i].end,
        )
      ) {
        return old;
      }
      return fresh;
    });
    previous.current = { flags: next, texts };
    setFlags(next);
    // The word under the caret was spared: look at it once the grace is up.
    if (typing && caret) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(compute, TYPING_GRACE_MS);
    }
  }, [active, getCaret, ignore, texts, typingAt]);

  useEffect(() => {
    if (!active) {
      compute();
      return;
    }
    if (!spellStore.isReady) {
      if (!spellStore.hasFailed) void spellStore.start();
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(compute, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, compute]);

  // Dictionary ready / word added / setting flipped: recompute from scratch.
  useEffect(
    () =>
      spellStore.subscribe(() => {
        previous.current = { flags: [], texts: [] };
        compute();
      }),
    [compute],
  );

  return flags;
};
