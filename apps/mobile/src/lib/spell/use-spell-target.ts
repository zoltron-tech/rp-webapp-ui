import { normalizeText, tokenize } from "@nw/spell/tokenizer";
import { useCallback, useEffect, useRef, useState } from "react";
import { flagAt, type SpellFlag } from "./flags";
import { spellStore } from "./store";
import { getSynonyms } from "./thesaurus";

/**
 * What the suggestion strip is about, from where the caret or selection is.
 *
 * - The caret inside a flagged word → spelling: corrections, Add, Ignore.
 * - A selection that is exactly one word (the phone's long-press / double-tap
 *   selection) → thesaurus when the word is fine, spelling when it is flagged.
 *
 * Web opens a popover on click; a phone has no hover and a popover over the
 * keyboard's edge would be half off-screen, so the strip sits between the
 * field and the keyboard like the mention list. Nothing is fetched until a
 * target exists, and a target is only re-announced when it actually changes,
 * so a caret moving through plain text costs no renders.
 */

export interface SpellTarget {
  mode: "spelling" | "thesaurus";
  word: string;
  start: number;
  end: number;
}

export interface SpellStripState {
  target: SpellTarget | null;
  suggestions: string[];
  loading: boolean;
}

interface Inputs {
  text: string;
  selection: { start: number; end: number } | null;
  flags: readonly SpellFlag[];
}

const keyOf = (t: SpellTarget | null) =>
  t ? `${t.mode}:${t.start}:${t.end}:${t.word}` : "";

/** The target for a text, selection and flag list, or null. */
export const targetFor = ({
  flags,
  selection,
  text,
}: Inputs): SpellTarget | null => {
  if (!selection || !spellStore.enabled) return null;
  const { start, end } = selection;
  if (start === end) {
    const flag = flagAt(flags, start);
    return flag ? { ...flag, mode: "spelling" } : null;
  }
  // One whole word selected (a trailing space from the platform's word
  // selection is tolerated).
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  const picked = normalizeText(text.slice(lo, hi));
  const trimmed = picked.trim();
  if (!trimmed || trimmed.length !== picked.trimStart().length) return null;
  const tokens = tokenize(trimmed);
  if (tokens.length !== 1 || tokens[0].word !== trimmed) return null;
  const from = lo + picked.indexOf(trimmed);
  const to = from + trimmed.length;
  const flagged = flags.find((f) => f.start === from && f.end === to);
  return {
    end: to,
    mode: flagged ? "spelling" : "thesaurus",
    start: from,
    word: flagged ? flagged.word : trimmed,
  };
};

/**
 * Tracks the strip's target and loads what it shows. `refresh` is for the
 * editor's selection handler; flag changes refresh on their own.
 */
export const useSpellTarget = (
  read: () => Inputs,
  /** Whatever `read` draws its flags from; a change re-reads. */
  flags: unknown,
): SpellStripState & { refresh: () => void; clear: () => void } => {
  const [target, setTarget] = useState<SpellTarget | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const key = useRef("");

  const refresh = useCallback(() => {
    const next = targetFor(read());
    const k = keyOf(next);
    if (k === key.current) return;
    key.current = k;
    setTarget(next);
  }, [read]);

  const clear = useCallback(() => {
    key.current = "";
    setTarget(null);
  }, []);

  // Flags landing after the debounce may put the caret inside a new typo.
  useEffect(() => {
    refresh();
  }, [flags, refresh]);

  useEffect(() => {
    if (!target) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    setSuggestions([]);
    const load =
      target.mode === "spelling"
        ? spellStore.suggest(target.word)
        : getSynonyms(target.word);
    void load.then((list) => {
      if (!live) return;
      setSuggestions(list);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [target]);

  return { clear, loading, refresh, suggestions, target };
};
