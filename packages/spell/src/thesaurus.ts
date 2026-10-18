/**
 * The thesaurus core: Datamuse (`rel_syn`, WordNet-backed) with lemma
 * fallback, behind a cache the client provides.
 *
 * Datamuse only knows lemmas, so an inflected word ("asked", "houses",
 * "bigger") is looked up through its lemma(s) and every synonym is put back
 * into the original form (`inflect.ts`, loaded on first use). The lemma
 * proposals include non-words ("cities" → "citie"), so the client's
 * dictionary is asked which ones are real before anything is fetched.
 *
 * Only ever called with a single word, never the text. The client decides
 * how to fetch (web: `fetch` + a timeout; phone: the same), where to persist
 * the cache (localStorage / AsyncStorage) and whether the feature is on.
 */

export type ThesaurusEntry = [word: string, synonyms: string[]];

export interface ThesaurusOptions {
  /** Performs the GET and returns the parsed JSON rows; [] on any failure. */
  request: (url: string) => Promise<Array<{ word?: string }>>;
  /** Persisted cache, if any. `load` runs once, lazily. */
  storage?: {
    load: () => Promise<ThesaurusEntry[] | null>;
    save: (entries: ThesaurusEntry[]) => Promise<void> | void;
  };
  /** Which of `words` the dictionary does NOT know (so they are skipped). */
  unknownWords?: (words: string[]) => Promise<Set<string>>;
  /** Kill switch; read on every call. */
  enabled?: () => boolean;
  maxResults?: number;
  cacheCap?: number;
}

export interface Thesaurus {
  /** Synonyms for `word` in the word's own form. Empty on any failure. */
  getSynonyms: (word: string) => Promise<string[]>;
}

const ENDPOINT = "https://api.datamuse.com/words";

export const createThesaurus = ({
  request,
  storage,
  unknownWords,
  enabled = () => true,
  maxResults = 8,
  cacheCap = 300,
}: ThesaurusOptions): Thesaurus => {
  const memory = new Map<string, string[]>();
  const inflight = new Map<string, Promise<string[]>>();
  let loaded: Promise<void> | null = null;

  const load = () => {
    if (loaded) return loaded;
    loaded = (async () => {
      try {
        const entries = (await storage?.load()) ?? [];
        for (const [w, s] of entries) memory.set(w, s);
      } catch {
        // Corrupt or unavailable storage: start empty.
      }
    })();
    return loaded;
  };

  const remember = (key: string, list: string[]) => {
    if (memory.size >= cacheCap) {
      const oldest = memory.keys().next().value;
      if (oldest !== undefined) memory.delete(oldest);
    }
    memory.set(key, list);
    try {
      void storage?.save([...memory.entries()].slice(-cacheCap));
    } catch {
      // Quota / private mode — the in-memory copy still serves this session.
    }
  };

  /** One `rel_syn` call: single words only, lower-cased, never the query. */
  const fetchSynonyms = async (word: string): Promise<string[]> => {
    const url = `${ENDPOINT}?rel_syn=${encodeURIComponent(word)}&max=${maxResults * 2}`;
    try {
      const rows = await request(url);
      return rows
        .map((row) => row.word ?? "")
        .filter((w) => w && w !== word && !w.includes(" "));
    } catch {
      return [];
    }
  };

  const lookup = async (key: string): Promise<string[]> => {
    const direct = await fetchSynonyms(key);
    if (direct.length > 0) return direct.slice(0, maxResults);

    const { lemmaForms } = await import("./inflect");
    let forms = lemmaForms(key);
    if (forms.length === 0) return [];
    if (unknownWords) {
      const unknown = await unknownWords(forms.map((f) => f.lemma));
      forms = forms.filter((f) => !unknown.has(f.lemma));
    }
    if (forms.length === 0) return [];

    const lists = await Promise.all(forms.map((f) => fetchSynonyms(f.lemma)));
    const seen = new Set<string>([key]);
    const out: string[] = [];
    // Interleave the forms (verb, noun, …) so an ambiguous word like "houses"
    // offers both readings instead of eight verbs.
    const max = Math.max(...lists.map((l) => l.length));
    for (let i = 0; i < max && out.length < maxResults; i++) {
      forms.forEach((form, fi) => {
        const syn = lists[fi][i];
        if (!syn || out.length >= maxResults) return;
        const shaped = form.reinflect(syn).toLowerCase();
        if (!seen.has(shaped) && !shaped.includes(" ")) {
          seen.add(shaped);
          out.push(shaped);
        }
      });
    }
    return out;
  };

  const getSynonyms = async (word: string): Promise<string[]> => {
    if (!enabled()) return [];
    await load();
    const key = word.toLowerCase();
    const cached = memory.get(key);
    if (cached) return cached;
    const flying = inflight.get(key);
    if (flying) return flying;

    const p = lookup(key)
      .then((list) => {
        remember(key, list);
        return list;
      })
      .catch(() => [] as string[])
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  };

  return { getSynonyms };
};
