/**
 * Main-thread face of the spell checker: one lazily-started worker shared by
 * every editor on the page, a word-level result cache so repeated words cost
 * nothing, and the personal dictionary ("Add to dictionary") persisted in
 * localStorage.
 *
 * Nothing here touches the DOM; `use-spellcheck.ts` does the walking and the
 * painting.
 */

import type { SpellWorkerRequest, SpellWorkerResponse } from "./spell.worker";

export const SPELL_LANG = "en";
const DICT_BASE_URL = "/dict";
const PERSONAL_KEY = "nw.spell.personal";
const ENABLED_KEY = "nw.spell.enabled";
const CACHE_CAP = 5000;

type Listener = () => void;

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / quota — the in-memory copy still works for this session.
  }
};

/** Whether the user has turned the checker off (default on). */
export const isSpellEnabled = (): boolean => readJson(ENABLED_KEY, true);

export const setSpellEnabled = (enabled: boolean) => {
  writeJson(ENABLED_KEY, enabled);
  client.emit();
};

class SpellClient {
  private worker: Worker | null = null;
  private readyPromise: Promise<boolean> | null = null;
  private resolveReady: ((ok: boolean) => void) | null = null;
  private ready = false;
  private failed = false;
  private nextId = 1;
  private pending = new Map<
    number,
    (
      res: Extract<SpellWorkerResponse, { type: "checked" | "suggestions" }>,
    ) => void
  >();

  /** word → true when misspelled. Insertion-ordered so eviction is FIFO. */
  private results = new Map<string, boolean>();
  private suggestions = new Map<string, string[]>();
  private inflight = new Map<string, Promise<boolean>>();

  private personal = new Set<string>(
    readJson<string[]>(PERSONAL_KEY, []).map((w) => w.toLowerCase()),
  );
  private sessionIgnored = new Set<string>();
  private listeners = new Set<Listener>();

  /** True once the dictionary is parsed; false before, or if loading failed. */
  get isReady() {
    return this.ready;
  }

  get hasFailed() {
    return this.failed;
  }

  /** Start the worker (idempotent). Resolves true when the dictionary is up. */
  start(): Promise<boolean> {
    if (this.readyPromise) return this.readyPromise;
    this.readyPromise = new Promise<boolean>((resolve) => {
      this.resolveReady = resolve;
    });
    try {
      this.worker = new Worker(new URL("./spell.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      this.failed = true;
      this.resolveReady?.(false);
      return this.readyPromise;
    }
    this.worker.onmessage = (e: MessageEvent<SpellWorkerResponse>) =>
      this.onMessage(e.data);
    this.worker.onerror = () => {
      this.failed = true;
      this.resolveReady?.(false);
      this.emit();
    };
    this.send({
      baseUrl: DICT_BASE_URL,
      lang: SPELL_LANG,
      personal: [...this.personal],
      type: "init",
    });
    return this.readyPromise;
  }

  private send(msg: SpellWorkerRequest) {
    this.worker?.postMessage(msg);
  }

  private onMessage(msg: SpellWorkerResponse) {
    switch (msg.type) {
      case "ready":
        this.ready = true;
        this.resolveReady?.(true);
        this.emit();
        return;
      case "error":
        this.failed = true;
        this.resolveReady?.(false);
        this.emit();
        return;
      case "checked":
      case "suggestions": {
        const cb = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        cb?.(msg);
      }
    }
  }

  /** Session-only "Ignore" plus the persisted personal dictionary. */
  isIgnored(word: string): boolean {
    const lower = word.toLowerCase();
    return this.personal.has(lower) || this.sessionIgnored.has(lower);
  }

  /**
   * Which of `words` are unknown to the dictionary. Cached per word; only the
   * unseen ones cross to the worker, in one message. Before the dictionary is
   * ready nothing is reported as misspelled.
   */
  async check(words: Iterable<string>): Promise<Set<string>> {
    const misspelled = new Set<string>();
    if (!this.ready) {
      if (!this.readyPromise) void this.start();
      return misspelled;
    }
    const unknown: string[] = [];
    const waits: Promise<unknown>[] = [];
    for (const w of words) {
      if (this.isIgnored(w)) continue;
      const cached = this.results.get(w);
      if (cached !== undefined) {
        if (cached) misspelled.add(w);
        continue;
      }
      const flying = this.inflight.get(w);
      if (flying) {
        waits.push(flying.then((bad) => bad && misspelled.add(w)));
        continue;
      }
      unknown.push(w);
    }

    if (unknown.length > 0) {
      const batch = new Promise<string[]>((resolve) => {
        const id = this.nextId++;
        this.pending.set(id, (res) => {
          resolve(res.type === "checked" ? res.misspelled : []);
        });
        this.send({ id, type: "check", words: unknown });
      });
      for (const w of unknown) {
        const p = batch.then((bad) => bad.includes(w));
        this.inflight.set(w, p);
      }
      const bad = new Set(await batch);
      for (const w of unknown) {
        this.inflight.delete(w);
        this.remember(w, bad.has(w));
        if (bad.has(w)) misspelled.add(w);
      }
    }
    await Promise.all(waits);
    return misspelled;
  }

  private remember(word: string, bad: boolean) {
    if (this.results.size >= CACHE_CAP) {
      const oldest = this.results.keys().next().value;
      if (oldest !== undefined) this.results.delete(oldest);
    }
    this.results.set(word, bad);
  }

  /** Corrections for a misspelled word (cached for the session). */
  suggest(word: string): Promise<string[]> {
    const cached = this.suggestions.get(word);
    if (cached) return Promise.resolve(cached);
    if (!this.ready) return Promise.resolve([]);
    return new Promise((resolve) => {
      const id = this.nextId++;
      this.pending.set(id, (res) => {
        const list = res.type === "suggestions" ? res.suggestions : [];
        this.suggestions.set(word, list);
        resolve(list);
      });
      this.send({ id, type: "suggest", word });
    });
  }

  /** "Add to dictionary": persisted, applied to the worker, editors recheck. */
  addWord(word: string) {
    const lower = word.toLowerCase();
    if (this.personal.has(lower)) return;
    this.personal.add(lower);
    writeJson(PERSONAL_KEY, [...this.personal]);
    this.send({ type: "add", word });
    this.forget(word);
    this.emit();
  }

  /** "Ignore": this session only. */
  ignoreWord(word: string) {
    this.sessionIgnored.add(word.toLowerCase());
    this.forget(word);
    this.emit();
  }

  private forget(word: string) {
    // Drop every cached casing of the word so the next check asks again.
    const lower = word.toLowerCase();
    for (const key of [...this.results.keys()]) {
      if (key.toLowerCase() === lower) this.results.delete(key);
    }
  }

  /** Editors subscribe to recheck after dictionary / setting changes. */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    for (const fn of this.listeners) fn();
  }
}

const client = new SpellClient();

export const getSpellClient = () => client;
