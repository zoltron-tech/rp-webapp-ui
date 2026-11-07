import { createSpellEngine, type SpellEngine } from "@nw/spell/engine";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { InteractionManager } from "react-native";
import affAsset from "../../../assets/dict/en/en_aff.aff";
import dicAsset from "../../../assets/dict/en/en_dic.dic";

/**
 * The phone's spell checker: one engine for the app, started at idle and
 * shared by every editor, plus the personal dictionary and the setting.
 *
 * Web runs the engine in a worker. A phone has no worker, so the dictionary
 * is parsed on the JS thread — once per app session, deferred with
 * `InteractionManager` until the screen that asked for it has settled, and
 * never during a keystroke. Checks are then synchronous lookups behind a
 * cache; `suggest` (the expensive call, which also builds the phonetic index
 * the first time) is deferred a tick so the strip can paint "Looking up…".
 */

const PERSONAL_KEY = "nw.spell.personal";
const ENABLED_KEY = "nw.spell.enabled";
const CACHE_CAP = 5000;

type Listener = () => void;

class SpellStore {
  private engine: SpellEngine | null = null;
  private starting: Promise<boolean> | null = null;
  private failed = false;
  private enabledFlag = true;
  private settingsLoaded: Promise<void> | null = null;
  private personal = new Set<string>();
  private sessionIgnored = new Set<string>();
  /** word → misspelled. Insertion-ordered so eviction is FIFO. */
  private results = new Map<string, boolean>();
  private suggestions = new Map<string, string[]>();
  private listeners = new Set<Listener>();

  get isReady() {
    return this.engine !== null;
  }

  get hasFailed() {
    return this.failed;
  }

  /** The user setting (default on); the call sites gate on it. */
  get enabled() {
    return this.enabledFlag;
  }

  /** Reads the setting and the personal dictionary once. */
  private loadSettings(): Promise<void> {
    if (this.settingsLoaded) return this.settingsLoaded;
    this.settingsLoaded = (async () => {
      try {
        const [enabled, personal] = await AsyncStorage.multiGet([
          ENABLED_KEY,
          PERSONAL_KEY,
        ]);
        if (enabled[1] !== null) this.enabledFlag = enabled[1] !== "false";
        if (personal[1]) {
          for (const w of JSON.parse(personal[1]) as string[]) {
            this.personal.add(w.toLowerCase());
          }
        }
      } catch {
        // Unreadable storage: defaults.
      }
      this.emit();
    })();
    return this.settingsLoaded;
  }

  /**
   * Starts the engine (idempotent): after interactions settle, the two
   * dictionary files are read from the asset bundle and parsed. Resolves
   * true when ready, false if the dictionary could not be loaded.
   */
  start(): Promise<boolean> {
    if (this.starting) return this.starting;
    this.starting = new Promise<boolean>((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        void (async () => {
          try {
            await this.loadSettings();
            const [aff, dic] = await Promise.all([
              Asset.fromModule(affAsset).downloadAsync(),
              Asset.fromModule(dicAsset).downloadAsync(),
            ]);
            if (!aff.localUri || !dic.localUri) throw new Error("no uri");
            const [affText, dicText] = await Promise.all([
              new File(aff.localUri).text(),
              new File(dic.localUri).text(),
            ]);
            this.engine = createSpellEngine(affText, dicText, this.personal);
            this.emit();
            resolve(true);
          } catch {
            this.failed = true;
            this.emit();
            resolve(false);
          }
        })();
      });
    });
    return this.starting;
  }

  /** Session-only "Ignore" plus the persisted personal dictionary. */
  isIgnored(word: string): boolean {
    const lower = word.toLowerCase();
    return this.personal.has(lower) || this.sessionIgnored.has(lower);
  }

  /** True when misspelled, false when known or ignored, null before ready. */
  isMisspelled(word: string): boolean | null {
    if (!this.engine) return null;
    if (this.isIgnored(word)) return false;
    const cached = this.results.get(word);
    if (cached !== undefined) return cached;
    const bad = !this.engine.correct(word);
    if (this.results.size >= CACHE_CAP) {
      const oldest = this.results.keys().next().value;
      if (oldest !== undefined) this.results.delete(oldest);
    }
    this.results.set(word, bad);
    return bad;
  }

  /** Corrections for a misspelled word, cached; deferred a tick (see above). */
  suggest(word: string): Promise<string[]> {
    const cached = this.suggestions.get(word);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = this.engine ? this.engine.suggest(word) : [];
        this.suggestions.set(word, list);
        resolve(list);
      }, 0);
    });
  }

  /** "Add to dictionary": persisted, applied to the engine, editors recheck. */
  addWord(word: string) {
    const lower = word.toLowerCase();
    if (this.personal.has(lower)) return;
    this.personal.add(lower);
    void AsyncStorage.setItem(PERSONAL_KEY, JSON.stringify([...this.personal]));
    this.engine?.add(word);
    this.forget(word);
    this.emit();
  }

  /** "Ignore": this session only. */
  ignoreWord(word: string) {
    this.sessionIgnored.add(word.toLowerCase());
    this.forget(word);
    this.emit();
  }

  setEnabled(enabled: boolean) {
    this.enabledFlag = enabled;
    void AsyncStorage.setItem(ENABLED_KEY, enabled ? "true" : "false");
    this.emit();
  }

  private forget(word: string) {
    const lower = word.toLowerCase();
    for (const key of [...this.results.keys()]) {
      if (key.toLowerCase() === lower) this.results.delete(key);
    }
  }

  /** Editors subscribe to recheck after dictionary / setting changes. */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private version = 0;

  /** Changes whenever subscribers should recompute. */
  snapshot(): number {
    return this.version;
  }

  private emit() {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
}

export const spellStore = new SpellStore();
