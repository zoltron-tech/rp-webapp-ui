/**
 * Wires a contenteditable editor to the spell checker: walks its text nodes,
 * asks the worker which words are unknown, paints them through the Highlight
 * API, and drives the correction menu.
 *
 * Shared by `RichTextEditor` (posts, storyboard event threads) and
 * `ChatRichInput` (chat). The hook never mutates the editor's markup; the only
 * write it performs is the replacement the user picks, done through
 * `execCommand("insertText")` so undo and the editor's own `input` handling
 * keep working.
 */

import {
  type CheckContext,
  isCheckable,
  normalizeText,
  splitHyphenated,
  tokenize,
  type WordToken,
} from "@nw/spell/tokenizer";
import type React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  clearEditorRanges,
  setEditorRanges,
  supportsSpellHighlight,
} from "./highlighter";
import { getSpellClient, isSpellEnabled } from "./spell-client";
import { getSynonyms } from "./thesaurus";

export type SpellMenuMode =
  /** A misspelled word: corrections, synonyms of one of them, Add / Ignore. */
  | "spelling"
  /** A correctly spelled word the user asked about: synonyms only. */
  | "thesaurus";

export interface SpellMenuState {
  mode: SpellMenuMode;
  /** The word as written. */
  word: string;
  /** Viewport rectangle of the word (the menu anchors to it). */
  anchor: DOMRect;
  /** Dictionary corrections, best first (empty in thesaurus mode). */
  suggestions: string[];
  loadingSuggestions: boolean;
  /** Index into `suggestions` the keyboard / hover is on (Enter picks it). */
  focused: number;
  /** Thesaurus mode only: the word whose synonyms are shown. Always null in
   *  spelling mode, which lists corrections alone. */
  synonymsFor: string | null;
  synonyms: string[];
  loadingSynonyms: boolean;
}

interface Flagged {
  node: Text;
  start: number;
  end: number;
  word: string;
  range: Range;
}

interface NodeCache {
  text: string;
  tokens: WordToken[];
}

interface Options {
  editorRef: React.RefObject<HTMLElement | null>;
  /** Call-site switch (defaults to on). The user setting is applied on top. */
  enabled?: boolean;
  /** Names that must never be flagged: muses, friends, story characters. */
  ignoreWords?: Iterable<string>;
  /** True while another popover (mention list, image bar) owns the editor. */
  suspended?: boolean;
}

export interface SpellcheckApi {
  /** Highlight API available and the checker is on. Set `spellCheck={!active}`. */
  active: boolean;
  menu: SpellMenuState | null;
  /** Mouse/touch click inside the editor: opens the menu on a flagged word. */
  handleClick: (e: React.MouseEvent<HTMLElement>) => void;
  /** Double-click (word selection) on any word: thesaurus for a correct word,
   *  the full menu for a flagged one. */
  handleDoubleClick: (e: React.MouseEvent<HTMLElement>) => void;
  /** Returns true when the key was consumed by the menu. */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => boolean;
  closeMenu: () => void;
  setFocused: (index: number) => void;
  /** Replace the word with `replacement`, matching the original's casing. */
  pick: (replacement: string) => void;
  addToDictionary: () => void;
  ignoreWord: () => void;
}

const DEBOUNCE_MS = 300;

/** Elements whose text is never spell-checked. */
const SKIP_SELECTOR =
  ".mention-tag, .dialog-avatar-wrap, .dialog-delete, .dialog-name, a, code, pre";

/**
 * Whether a text node is user prose: not inside a chip/link/code, and inside
 * an editable host (dialog embeds are `contenteditable=false` cards with an
 * editable text island inside, so the nearest editable attribute wins).
 */
const isProseNode = (node: Text, editor: HTMLElement): boolean => {
  let el: HTMLElement | null = node.parentElement;
  while (el && el !== editor) {
    if (el.matches(SKIP_SELECTOR)) return false;
    const ce = el.getAttribute("contenteditable");
    if (ce === "false") return false;
    if (ce === "true" || ce === "") break;
    el = el.parentElement;
  }
  return true;
};

const caretIn = (
  editor: HTMLElement,
): { node: Node; offset: number } | null => {
  const active = document.activeElement;
  if (!active || !(active === editor || editor.contains(active))) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
  const r = sel.getRangeAt(0);
  if (!editor.contains(r.startContainer)) return null;
  return { node: r.startContainer, offset: r.startOffset };
};

const caretFromPoint = (
  x: number,
  y: number,
): { node: Node; offset: number } | null => {
  const doc = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };
  if (typeof doc.caretPositionFromPoint === "function") {
    const pos = doc.caretPositionFromPoint(x, y);
    return pos ? { node: pos.offsetNode, offset: pos.offset } : null;
  }
  if (typeof document.caretRangeFromPoint === "function") {
    const r = document.caretRangeFromPoint(x, y);
    return r ? { node: r.startContainer, offset: r.startOffset } : null;
  }
  return null;
};

/** `Recieve` → `Receive`, `TEH` → `THE`; otherwise the replacement as given. */
const matchCase = (original: string, replacement: string): string => {
  if (original.length > 1 && original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  const first = original[0];
  if (first && first === first.toUpperCase() && first !== first.toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
};

const client = getSpellClient();
const subscribe = (fn: () => void) => client.subscribe(fn);
const snapshot = () => isSpellEnabled();

export const useSpellcheck = ({
  editorRef,
  enabled = true,
  ignoreWords,
  suspended = false,
}: Options): SpellcheckApi => {
  const userEnabled = useSyncExternalStore(subscribe, snapshot, () => true);
  const supported = useMemo(() => supportsSpellHighlight(), []);
  const active = supported && enabled && userEnabled;

  const ignoreSet = useMemo(() => {
    const s = new Set<string>();
    if (ignoreWords) for (const w of ignoreWords) s.add(w.toLowerCase());
    return s;
  }, [ignoreWords]);
  const ignoreRef = useRef(ignoreSet);

  const cacheRef = useRef(new WeakMap<Text, NodeCache>());
  const flaggedRef = useRef<Flagged[]>([]);
  const caretWordRef = useRef<Flagged | null>(null);
  const genRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const activeRef = useRef(active);
  const suspendedRef = useRef(suspended);

  const [menu, setMenu] = useState<SpellMenuState | null>(null);
  const menuEntryRef = useRef<Flagged | null>(null);

  activeRef.current = active;
  suspendedRef.current = suspended;

  const closeMenu = useCallback(() => {
    menuEntryRef.current = null;
    setMenu(null);
  }, []);

  /** One full pass over the editor. `ignoreCaret` flags the word being typed too. */
  const runCheck = useCallback(
    async (ignoreCaret = false) => {
      const editor = editorRef.current;
      if (!editor) return;
      if (!activeRef.current) {
        clearEditorRanges(editor);
        flaggedRef.current = [];
        return;
      }
      if (!client.isReady) {
        if (!client.hasFailed) void client.start();
        return;
      }

      const gen = ++genRef.current;
      const caret = ignoreCaret ? null : caretIn(editor);
      const cache = cacheRef.current;
      const ignore = ignoreRef.current;
      const candidates: Array<{ node: Text; token: WordToken }> = [];
      const words = new Set<string>();
      caretWordRef.current = null;

      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n) {
        const node = n as Text;
        n = walker.nextNode();
        if (!isProseNode(node, editor)) continue;
        const text = normalizeText(node.data);
        let entry = cache.get(node);
        if (!entry || entry.text !== text) {
          const ctx: CheckContext = { ignore, text };
          const tokens: WordToken[] = [];
          for (const t of tokenize(text)) {
            if (!isCheckable(t, ctx)) continue;
            for (const part of splitHyphenated(t)) {
              if (isCheckable(part, ctx)) tokens.push(part);
            }
          }
          entry = { text, tokens };
          cache.set(node, entry);
        }
        for (const token of entry.tokens) {
          if (
            caret &&
            caret.node === node &&
            token.start <= caret.offset &&
            caret.offset <= token.end
          ) {
            // Still being typed — leave it alone until the caret moves on.
            caretWordRef.current = {
              end: token.end,
              node,
              range: document.createRange(),
              start: token.start,
              word: token.word,
            };
            continue;
          }
          candidates.push({ node, token });
          words.add(token.word);
        }
      }

      const misspelled = await client.check(words);
      if (gen !== genRef.current || !editorRef.current) return;

      const flagged: Flagged[] = [];
      for (const { node, token } of candidates) {
        if (!misspelled.has(token.word)) continue;
        if (!node.isConnected || token.end > node.data.length) continue;
        try {
          const range = document.createRange();
          range.setStart(node, token.start);
          range.setEnd(node, token.end);
          flagged.push({
            end: token.end,
            node,
            range,
            start: token.start,
            word: token.word,
          });
        } catch {
          // The node changed under us; the next pass will redo it.
        }
      }
      flaggedRef.current = flagged;
      setEditorRanges(
        editor,
        flagged.map((f) => f.range),
      );
    },
    [editorRef],
  );

  const schedule = useCallback(
    (delay = DEBOUNCE_MS, ignoreCaret = false) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void runCheck(ignoreCaret);
      }, delay);
    },
    [runCheck],
  );

  // Names changed (e.g. story characters loaded): recheck from scratch.
  useEffect(() => {
    ignoreRef.current = ignoreSet;
    cacheRef.current = new WeakMap();
    schedule(0);
  }, [ignoreSet, schedule]);

  // Dictionary / setting changes from any editor: recheck from scratch.
  useEffect(() => {
    return client.subscribe(() => {
      cacheRef.current = new WeakMap();
      schedule(0);
    });
  }, [schedule]);

  // Editor lifecycle: observe edits, start the worker on first focus, check
  // on blur, follow the caret out of the word being typed.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !active) {
      if (editor) clearEditorRanges(editor);
      flaggedRef.current = [];
      return;
    }

    const observer = new MutationObserver(() => {
      closeMenu();
      schedule();
    });
    observer.observe(editor, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    const onFocus = () => {
      void client.start().then((ok) => ok && schedule(0));
    };
    const onBlur = () => {
      closeMenu();
      schedule(0, true);
    };
    const onSelectionChange = () => {
      const pending = caretWordRef.current;
      if (!pending) return;
      const caret = caretIn(editor);
      const stillInside =
        caret &&
        caret.node === pending.node &&
        pending.start <= caret.offset &&
        caret.offset <= pending.end;
      if (!stillInside) schedule(50);
    };
    const onCompositionStart = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
    const onCompositionEnd = () => schedule();

    editor.addEventListener("focus", onFocus);
    editor.addEventListener("blur", onBlur);
    editor.addEventListener("compositionstart", onCompositionStart);
    editor.addEventListener("compositionend", onCompositionEnd);
    document.addEventListener("selectionchange", onSelectionChange);

    // Prefilled content (editing a thread / message) gets its first pass now.
    if (client.isReady) schedule(0);

    return () => {
      observer.disconnect();
      editor.removeEventListener("focus", onFocus);
      editor.removeEventListener("blur", onBlur);
      editor.removeEventListener("compositionstart", onCompositionStart);
      editor.removeEventListener("compositionend", onCompositionEnd);
      document.removeEventListener("selectionchange", onSelectionChange);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      clearEditorRanges(editor);
      flaggedRef.current = [];
    };
  }, [editorRef, active, schedule, closeMenu]);

  // The menu is anchored to viewport coordinates: any scroll or resize moves
  // the word out from under it. The menu's own scrollbar is not that — the
  // capture-phase listener sees it too, so it is filtered out here.
  useEffect(() => {
    if (!menu) return;
    const onScroll = (e: Event) => {
      const t = e.target;
      if (t instanceof Element && t.closest("[data-spell-menu]")) return;
      closeMenu();
    };
    const onResize = () => closeMenu();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [menu, closeMenu]);

  // Suspended by another popover: drop ours.
  useEffect(() => {
    if (suspended) closeMenu();
  }, [suspended, closeMenu]);

  const findFlagged = useCallback(
    (node: Node, offset: number): Flagged | null =>
      flaggedRef.current.find(
        (f) => f.node === node && f.start <= offset && offset <= f.end,
      ) ?? null,
    [],
  );

  /** Any word (flagged or not) at a caret position, as a menu entry. */
  const wordAt = useCallback(
    (node: Node, offset: number): Flagged | null => {
      const editor = editorRef.current;
      if (!editor || node.nodeType !== Node.TEXT_NODE) return null;
      const text = node as Text;
      if (!editor.contains(text) || !isProseNode(text, editor)) return null;
      const token = tokenize(normalizeText(text.data)).find(
        (t) => t.start <= offset && offset <= t.end,
      );
      if (!token) return null;
      const range = document.createRange();
      range.setStart(text, token.start);
      range.setEnd(text, token.end);
      return {
        end: token.end,
        node: text,
        range,
        start: token.start,
        word: token.word,
      };
    },
    [editorRef],
  );

  const requestedSynonymsRef = useRef<string | null>(null);

  const openMenuFor = useCallback((entry: Flagged, mode: SpellMenuMode) => {
    menuEntryRef.current = entry;
    requestedSynonymsRef.current = null;
    const anchor = entry.range.getBoundingClientRect();
    const thesaurus = mode === "thesaurus";
    setMenu({
      anchor,
      focused: 0,
      loadingSuggestions: !thesaurus,
      loadingSynonyms: false,
      mode,
      suggestions: [],
      synonyms: [],
      synonymsFor: thesaurus ? entry.word : null,
      word: entry.word,
    });
    if (thesaurus) return;
    void client.suggest(entry.word).then((suggestions) => {
      if (menuEntryRef.current !== entry) return;
      setMenu((m) =>
        m && m.word === entry.word
          ? { ...m, loadingSuggestions: false, suggestions }
          : m,
      );
    });
  }, []);

  // Load synonyms whenever the chosen target changes. The previous chips stay
  // on screen (dimmed) until the new set lands, so the menu never collapses.
  const target = menu?.synonymsFor ?? null;
  useEffect(() => {
    if (!target || target === requestedSynonymsRef.current) return;
    requestedSynonymsRef.current = target;
    const entry = menuEntryRef.current;
    setMenu((m) => (m ? { ...m, loadingSynonyms: true } : m));
    void getSynonyms(target).then((synonyms) => {
      if (menuEntryRef.current !== entry) return;
      setMenu((m) =>
        m && m.synonymsFor === target
          ? { ...m, loadingSynonyms: false, synonyms }
          : m,
      );
    });
  }, [target]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!activeRef.current || suspendedRef.current) return;
      // The second click of a double-click is handled by handleDoubleClick.
      if (e.detail > 1) return;
      const pos = caretFromPoint(e.clientX, e.clientY);
      const entry = pos ? findFlagged(pos.node, pos.offset) : null;
      if (entry) openMenuFor(entry, "spelling");
      else if (menuEntryRef.current) closeMenu();
    },
    [findFlagged, openMenuFor, closeMenu],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!activeRef.current || suspendedRef.current) return;
      const pos = caretFromPoint(e.clientX, e.clientY);
      if (!pos) return;
      const flagged = findFlagged(pos.node, pos.offset);
      if (flagged) {
        openMenuFor(flagged, "spelling");
        return;
      }
      const entry = wordAt(pos.node, pos.offset);
      if (entry) openMenuFor(entry, "thesaurus");
    },
    [findFlagged, wordAt, openMenuFor],
  );

  const pick = useCallback(
    (choice: string) => {
      const entry = menuEntryRef.current;
      const editor = editorRef.current;
      closeMenu();
      if (!entry || !editor || !entry.node.isConnected) return;
      const sel = window.getSelection();
      if (!sel) return;
      const replacement = matchCase(entry.word, choice);
      editor.focus();
      sel.removeAllRanges();
      sel.addRange(entry.range);
      if (!document.execCommand("insertText", false, replacement)) {
        // No execCommand: swap the text and tell the editor ourselves.
        entry.range.deleteContents();
        const text = document.createTextNode(replacement);
        entry.range.insertNode(text);
        const after = document.createRange();
        after.setStartAfter(text);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
        editor.dispatchEvent(new Event("input", { bubbles: true }));
      }
    },
    [editorRef, closeMenu],
  );

  const addToDictionary = useCallback(() => {
    const entry = menuEntryRef.current;
    closeMenu();
    if (entry) client.addWord(entry.word);
    editorRef.current?.focus();
  }, [editorRef, closeMenu]);

  const ignoreWord = useCallback(() => {
    const entry = menuEntryRef.current;
    closeMenu();
    if (entry) client.ignoreWord(entry.word);
    editorRef.current?.focus();
  }, [editorRef, closeMenu]);

  const setFocused = useCallback((index: number) => {
    setMenu((m) => (m ? { ...m, focused: index } : m));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>): boolean => {
      if (!activeRef.current) return false;

      if (!menu) {
        // Ctrl/Cmd + . opens the menu for the word under the caret: the full
        // menu when it is flagged, the thesaurus otherwise.
        if ((e.ctrlKey || e.metaKey) && e.key === "." && editorRef.current) {
          const caret = caretIn(editorRef.current);
          if (!caret) return false;
          const flagged = findFlagged(caret.node, caret.offset);
          const entry = flagged ?? wordAt(caret.node, caret.offset);
          if (entry) {
            e.preventDefault();
            openMenuFor(entry, flagged ? "spelling" : "thesaurus");
            return true;
          }
        }
        return false;
      }

      const count = menu.suggestions.length;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (count > 0) setFocused((menu.focused + 1) % count);
          return true;
        case "ArrowUp":
          e.preventDefault();
          if (count > 0) setFocused((menu.focused - 1 + count) % count);
          return true;
        case "Enter":
        case "Tab": {
          // Always consumed while open: with the word selected (thesaurus
          // mode) a stray Enter would replace it with a line break.
          e.preventDefault();
          const choice = menu.suggestions[menu.focused];
          if (choice) pick(choice);
          else closeMenu();
          return true;
        }
        case "Escape":
          e.preventDefault();
          closeMenu();
          return true;
        default:
          // Any other key: the user is typing again.
          closeMenu();
          return false;
      }
    },
    [
      menu,
      editorRef,
      findFlagged,
      wordAt,
      openMenuFor,
      setFocused,
      pick,
      closeMenu,
    ],
  );

  return {
    active,
    addToDictionary,
    closeMenu,
    handleClick,
    handleDoubleClick,
    handleKeyDown,
    ignoreWord,
    menu,
    pick,
    setFocused,
  };
};
