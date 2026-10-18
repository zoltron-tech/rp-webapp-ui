/**
 * Lemma + re-inflection for the thesaurus.
 *
 * Datamuse's `rel_syn` (WordNet) knows lemmas, not inflected forms: "asked"
 * returns nothing, "ask" returns plenty. This module proposes the lemma(s) of
 * an inflected word, each with a function that puts a synonym back into the
 * same form — so "asked" is looked up as "ask" and "inquire" comes back as
 * "inquired".
 *
 * Verbs and nouns go through `en-inflectors` (rules plus an irregular table:
 * flew → fly, children → child); adjectives through suffix rules here. The
 * proposals are not all real words ("cities" also yields "citie"), so the
 * caller checks them against the dictionary before looking anything up.
 *
 * Loaded lazily by `thesaurus.ts`, and kept free of DOM so it can be
 * unit-tested in node.
 */

import { Inflectors } from "en-inflectors";

export interface LemmaForm {
  /** The dictionary form to look up. Must be validated before use. */
  lemma: string;
  /** Puts a synonym of the lemma into the original word's form. */
  reinflect: (synonym: string) => string;
}

const same = (s: string) => s;

const safe = (fn: (w: string) => string) => (w: string) => {
  try {
    const out = fn(w);
    return out && /^[a-z'-]+$/i.test(out) ? out : w;
  } catch {
    return w;
  }
};

const past = safe((w) => new Inflectors(w).toPast());
const participle = safe((w) => new Inflectors(w).toPastParticiple());
const gerund = safe((w) => new Inflectors(w).toGerund());
const presentS = safe((w) => new Inflectors(w).toPresentS());
const plural = safe((w) => new Inflectors(w).toPlural());
const comparative = safe((w) => new Inflectors(w).comparative());
const superlative = safe((w) => new Inflectors(w).superlative());
const present = safe((w) => new Inflectors(w).toPresent());
const singular = safe((w) => new Inflectors(w).toSingular());

/** Base-form candidates for an -er / -est adjective: bigger → big, happiest
 *  → happy, nicer → nice, faster → fast. */
const adjectiveBases = (w: string, suffix: "er" | "est"): string[] => {
  const stem = w.slice(0, -suffix.length);
  if (stem.length < 2) return [];
  const out = [stem, `${stem}e`];
  if (/i$/.test(stem)) out.push(`${stem.slice(0, -1)}y`);
  if (/([b-df-hj-np-tv-z])\1$/.test(stem)) out.push(stem.slice(0, -1));
  return out;
};

/**
 * Lemma candidates for `word`, most likely first. The word itself is never
 * included; an empty list means it already looks like a lemma. Candidates
 * may be non-words — validate them against the dictionary.
 */
export const lemmaForms = (word: string): LemmaForm[] => {
  const w = word.toLowerCase();
  const out: LemmaForm[] = [];
  const seen = new Set<string>([w]);
  const add = (lemma: string, reinflect: (s: string) => string) => {
    if (!lemma || lemma.length < 2 || seen.has(lemma)) return;
    seen.add(lemma);
    out.push({ lemma, reinflect });
  };

  // Verbs: work out which form the word is in by re-deriving it from the
  // lemma; if none matches, fall back to the bare lemma's synonyms.
  const verb = present(w);
  if (verb !== w) {
    const form =
      past(verb) === w
        ? past
        : participle(verb) === w
          ? participle
          : gerund(verb) === w
            ? gerund
            : presentS(verb) === w
              ? presentS
              : same;
    add(verb, form);
  }

  const noun = singular(w);
  if (noun !== w) add(noun, plural(noun) === w ? plural : same);

  if (/est$/.test(w)) {
    for (const base of adjectiveBases(w, "est")) add(base, superlative);
  } else if (/er$/.test(w)) {
    for (const base of adjectiveBases(w, "er")) add(base, comparative);
  }

  return out;
};
