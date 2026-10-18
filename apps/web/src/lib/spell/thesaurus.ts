/**
 * The web thesaurus: `@nw/spell`'s core with `fetch` + a timeout, a
 * localStorage cache (the service worker also keeps Datamuse responses for a
 * week), and the dictionary worker to vet lemma candidates.
 *
 * Set `VITE_THESAURUS_ENABLED=false` to turn it off entirely.
 */

import { createThesaurus, type ThesaurusEntry } from "@nw/spell/thesaurus";
import { getSpellClient } from "./spell-client";

const CACHE_KEY = "nw.thesaurus.cache";
const TIMEOUT_MS = 2500;

export const isThesaurusEnabled = (): boolean =>
  import.meta.env.VITE_THESAURUS_ENABLED !== "false";

const thesaurus = createThesaurus({
  enabled: isThesaurusEnabled,
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
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as ThesaurusEntry[]) : null;
    },
    save: (entries) => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    },
  },
  unknownWords: async (words) => {
    const client = getSpellClient();
    return client.isReady ? client.check(words) : new Set();
  },
});

export const getSynonyms = thesaurus.getSynonyms;
