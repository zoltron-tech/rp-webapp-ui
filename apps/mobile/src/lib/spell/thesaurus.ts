import { createThesaurus, type ThesaurusEntry } from "@nw/spell/thesaurus";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { spellStore } from "./store";

/**
 * The phone's thesaurus: `@nw/spell`'s core with `fetch` + a timeout, an
 * AsyncStorage cache, and the dictionary to vet lemma candidates. Follows the
 * spell-check setting — no checker, no synonyms strip either.
 */

const CACHE_KEY = "nw.thesaurus.cache";
const TIMEOUT_MS = 2500;

const thesaurus = createThesaurus({
  enabled: () => spellStore.enabled,
  request: async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const r = await fetch(url, { signal: controller.signal });
      return r.ok ? ((await r.json()) as Array<{ word?: string }>) : [];
    } finally {
      clearTimeout(timer);
    }
  },
  storage: {
    load: async () => {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as ThesaurusEntry[]) : null;
    },
    save: (entries) => AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entries)),
  },
  unknownWords: async (words) => {
    const unknown = new Set<string>();
    for (const w of words)
      if (spellStore.isMisspelled(w) === true) unknown.add(w);
    return unknown;
  },
});

export const getSynonyms = thesaurus.getSynonyms;
