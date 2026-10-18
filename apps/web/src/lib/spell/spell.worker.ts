/// <reference lib="webworker" />

/**
 * The spell-check engine, off the main thread.
 *
 * Hunspell (via `nspell`) parses a ~550 KB dictionary on start-up and its
 * `suggest()` does a brute-force edit search per word — both would stall
 * typing if they ran next to the editor. The worker owns the engine
 * (`@nw/spell/engine`: Hunspell plus the phonetic layer); the main thread
 * (`spell-client.ts`) only ever sends word lists and gets back which of them
 * are unknown.
 *
 * Dictionary files are plain static assets under `/dict/<lang>/` (served by
 * the app, cached by the service worker), never bundled.
 */

import { createSpellEngine, type SpellEngine } from "@nw/spell/engine";

declare const self: DedicatedWorkerGlobalScope;

export type SpellWorkerRequest =
  | { type: "init"; lang: string; baseUrl: string; personal: string[] }
  | { type: "check"; id: number; words: string[] }
  | { type: "suggest"; id: number; word: string }
  | { type: "add"; word: string }
  | { type: "remove"; word: string };

export type SpellWorkerResponse =
  | { type: "ready"; lang: string }
  | { type: "error"; message: string }
  | { type: "checked"; id: number; misspelled: string[] }
  | { type: "suggestions"; id: number; word: string; suggestions: string[] };

let engine: SpellEngine | null = null;

const post = (msg: SpellWorkerResponse) => self.postMessage(msg);

const init = async (lang: string, baseUrl: string, personal: string[]) => {
  try {
    const [aff, dic] = await Promise.all([
      fetch(`${baseUrl}/${lang}/index.aff`).then((r) => {
        if (!r.ok) throw new Error(`aff ${r.status}`);
        return r.text();
      }),
      fetch(`${baseUrl}/${lang}/index.dic`).then((r) => {
        if (!r.ok) throw new Error(`dic ${r.status}`);
        return r.text();
      }),
    ]);
    engine = createSpellEngine(aff, dic, personal);
    post({ lang, type: "ready" });
  } catch (err) {
    post({
      message: err instanceof Error ? err.message : String(err),
      type: "error",
    });
  }
};

self.onmessage = (e: MessageEvent<SpellWorkerRequest>) => {
  const msg = e.data;
  switch (msg.type) {
    case "init":
      void init(msg.lang, msg.baseUrl, msg.personal);
      return;
    case "check": {
      if (!engine) {
        post({ id: msg.id, misspelled: [], type: "checked" });
        return;
      }
      const misspelled: string[] = [];
      for (const w of msg.words) {
        if (!engine.correct(w)) misspelled.push(w);
      }
      post({ id: msg.id, misspelled, type: "checked" });
      return;
    }
    case "suggest": {
      const suggestions = engine ? engine.suggest(msg.word) : [];
      post({ id: msg.id, suggestions, type: "suggestions", word: msg.word });
      return;
    }
    case "add":
      engine?.add(msg.word);
      return;
    case "remove":
      engine?.remove(msg.word);
      return;
  }
};
