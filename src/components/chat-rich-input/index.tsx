"use client";

import type { ReactNode } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MentionDataItem } from "@/types";
import { MentionDropdown } from "../mention-dropdown";
import { createMentionChip } from "../rich-text-editor-input/mention-chip";
import * as S from "./styled";

interface ChatRichInputProps {
  placeholder?: string;
  /** Plain-text value. Set to "" to clear the editor. */
  value: string;
  /** Fires with stripped plain text (for `hasValue` and external state). */
  onChange: (text: string) => void;
  /** Fires with raw innerHTML (for sending). */
  onHtmlChange: (html: string) => void;
  /** Called when Enter is pressed without Shift. */
  onSubmit?: () => void;
  /** When false, Enter always inserts a newline instead of calling `onSubmit`
   *  (Shift+Enter still inserts a newline either way). Defaults to true. */
  submitOnEnter?: boolean;
  mentionItems?: MentionDataItem[];
  /** When provided, muses are fetched dynamically from the server on each query change. */
  getMentionMuseItems?: (prefix: string) => Promise<MentionDataItem[]>;
  /** Optional node rendered inside the input area on the trailing edge. */
  trailingAction?: ReactNode;
}

export interface ChatRichInputHandle {
  /** Insert text at the current cursor position (or append if no selection).
   *  Pass `{ focus: false }` to append at the end without focusing the editor
   *  (used by the mobile tray so the soft keyboard doesn't pop up). */
  insertText(text: string, opts?: { focus?: boolean }): void;
  /** Focus the editor (raises the soft keyboard on mobile). */
  focus(): void;
  /** Blur the editor (dismisses the soft keyboard on mobile). */
  blur(): void;
}

export const ChatRichInput = forwardRef<
  ChatRichInputHandle,
  ChatRichInputProps
>(function ChatRichInput(
  {
    placeholder = "Write a message...",
    value,
    onChange,
    onHtmlChange,
    onSubmit,
    submitOnEnter = true,
    mentionItems = [],
    getMentionMuseItems,
    trailingAction,
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [showMention, setShowMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [dynamicMuses, setDynamicMuses] = useState<MentionDataItem[]>([]);
  const mentionAnchorRef = useRef<{ node: Node; offset: number } | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  // Tracks the most recent plain text emitted via onChange so the value-sync
  // effect below can distinguish echoes of our own typing from genuine external
  // value changes (e.g. when the parent prefills text for editing a message).
  const lastEmittedRef = useRef<string>("");

  useImperativeHandle(ref, () => ({
    blur() {
      editorRef.current?.blur();
    },
    focus() {
      editorRef.current?.focus();
    },
    insertText(text: string, opts?: { focus?: boolean }) {
      const editor = editorRef.current;
      if (!editor) return;

      // Append-without-focus path: keeps the soft keyboard down (mobile tray).
      if (opts?.focus === false) {
        editor.appendChild(document.createTextNode(text));
        emitChange(editor);
        return;
      }

      editor.focus();
      const sel = window.getSelection();
      if (!sel) return;

      // Restore saved range (from before the editor lost focus), or fall back
      // to placing the cursor at the end of the editor content.
      let range: Range;
      if (savedRangeRef.current) {
        range = savedRangeRef.current;
        savedRangeRef.current = null;
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false); // collapse to end
      }

      range.deleteContents();
      const node = document.createTextNode(text);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      emitChange(editor);
    },
  }));

  // Sync external value changes into the contenteditable editor. Handles two
  // cases: the parent clearing the field (value === "") after a send, and the
  // parent programmatically setting text (e.g. prefilling when the user edits an
  // existing message). Echoes of our own onChange emissions are ignored so live
  // typing isn't disrupted and the caret position is preserved.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value === lastEmittedRef.current) return;

    if (value === "") {
      const currentContent = editor.innerHTML;
      if (currentContent !== "" && currentContent !== "<br>") {
        editor.innerHTML = "";
        setIsEmpty(true);
        setShowMention(false);
        mentionAnchorRef.current = null;
        onChange("");
        onHtmlChange("");
      }
      lastEmittedRef.current = "";
      return;
    }

    // Programmatic text set — populate the editor, sync the HTML, and move the
    // caret to the end so the user can immediately continue editing.
    editor.textContent = value;
    lastEmittedRef.current = value;
    setIsEmpty(false);
    setShowMention(false);
    mentionAnchorRef.current = null;
    onHtmlChange(value);

    editor.focus();
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [value, onChange, onHtmlChange]);

  const emitChange = useCallback(
    (editor: HTMLDivElement) => {
      const raw = editor.innerText || editor.textContent || "";
      const text = raw
        .replace(/\u200B/g, "") // strip zero-width spaces
        .replace(/\u00A0/g, " ") // normalise non-breaking spaces
        .trim();
      setIsEmpty(text.length === 0);
      lastEmittedRef.current = text;
      onChange(text);

      // Normalize contenteditable <div> line-breaks into <br>, then strip trailing <br>s
      const html = editor.innerHTML
        .replace(/<div[^>]*><br\s*\/?>\s*<\/div>/gi, "<br>") // empty div → br
        .replace(/<div[^>]*>/gi, "<br>") // opening div → br
        .replace(/<\/div>/gi, "") // remove closing divs
        .replace(/(<br\s*\/?>\s*)+$/gi, "") // strip trailing brs
        .trim();
      onHtmlChange(html);
    },
    [onChange, onHtmlChange],
  );

  /**
   * Attempts to convert a complete *italic* or **bold** markdown pattern
   * immediately before the cursor into the corresponding HTML element.
   * Returns true when a replacement was made.
   */
  const tryApplyFormatting = useCallback((): boolean => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return false;

    const offset = range.startOffset;
    const textBefore = (node.textContent ?? "").slice(0, offset);

    // ── Bold: **word** ────────────────────────────────────────────────────
    const boldMatch = textBefore.match(/\*\*([^*\n]+)\*\*$/);
    if (boldMatch) {
      const start = offset - boldMatch[0].length;
      const replaceRange = document.createRange();
      replaceRange.setStart(node, start);
      replaceRange.setEnd(node, offset);
      replaceRange.deleteContents();

      const strong = document.createElement("strong");
      strong.textContent = boldMatch[1];
      replaceRange.insertNode(strong);

      // Insert a plain text node so the cursor leaves the bold context
      const anchor = document.createTextNode("\u200B");
      strong.after(anchor);

      const after = document.createRange();
      after.setStart(anchor, 1);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      return true;
    }

    // ── Italic: *word* (opening * not preceded by *) ──────────────────────
    const italicMatch = textBefore.match(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)$/);
    if (italicMatch) {
      const start = offset - italicMatch[0].length;
      const replaceRange = document.createRange();
      replaceRange.setStart(node, start);
      replaceRange.setEnd(node, offset);
      replaceRange.deleteContents();

      const em = document.createElement("em");
      em.textContent = italicMatch[1];
      replaceRange.insertNode(em);

      // Insert a plain text node so the cursor leaves the italic context
      const anchor = document.createTextNode("\u200B");
      em.after(anchor);

      const after = document.createRange();
      after.setStart(anchor, 1);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      return true;
    }

    return false;
  }, []);

  const insertMention = useCallback(
    (item: MentionDataItem) => {
      const editor = editorRef.current;
      const anchor = mentionAnchorRef.current;
      if (!editor || !anchor) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const curRange = sel.getRangeAt(0);

      // Delete from the @ character to the current cursor position
      const deleteRange = document.createRange();
      deleteRange.setStart(anchor.node, anchor.offset - 1); // include @
      deleteRange.setEnd(curRange.startContainer, curRange.startOffset);
      deleteRange.deleteContents();

      // Insert non-editable mention chip
      const span = createMentionChip(item);
      deleteRange.insertNode(span);

      // Trailing space so cursor has somewhere to land outside the chip
      const spacer = document.createTextNode("\u00A0");
      span.after(spacer);

      const afterRange = document.createRange();
      afterRange.setStart(spacer, 1);
      afterRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(afterRange);

      setShowMention(false);
      setMentionQuery("");
      mentionAnchorRef.current = null;
      emitChange(editor);
    },
    [emitChange],
  );

  // Fetch muses dynamically whenever the mention query changes (debounced)
  useEffect(() => {
    if (!getMentionMuseItems || !showMention) return;
    const timer = setTimeout(() => {
      getMentionMuseItems(mentionQuery).then(setDynamicMuses);
    }, 200);
    return () => clearTimeout(timer);
  }, [mentionQuery, showMention, getMentionMuseItems]);

  // Reset dynamic muses when dropdown closes
  useEffect(() => {
    if (!showMention) setDynamicMuses([]);
  }, [showMention]);

  const filteredItems = useMemo(() => {
    const query = mentionQuery.toLowerCase();
    const staticFiltered = mentionItems.filter((item) =>
      item.displayName.toLowerCase().includes(query),
    );
    if (getMentionMuseItems) {
      // Combine static (novelist) items with server-fetched muse items
      return [...staticFiltered, ...dynamicMuses];
    }
    return staticFiltered;
  }, [mentionItems, mentionQuery, dynamicMuses, getMentionMuseItems]);

  // Keep focusedIndex within bounds as the filtered list changes
  useEffect(() => {
    setFocusedIndex((i) =>
      filteredItems.length === 0 ? 0 : Math.min(i, filteredItems.length - 1),
    );
  }, [filteredItems.length]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const formatted = tryApplyFormatting();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      emitChange(editor);
      return;
    }

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node.nodeType === Node.TEXT_NODE) {
      const textBefore = (node.textContent ?? "").slice(0, offset);

      // ── Update active mention query ──────────────────────────────────────
      if (showMention && mentionAnchorRef.current) {
        const anchor = mentionAnchorRef.current;
        if (anchor.node === node && offset >= anchor.offset) {
          const query = textBefore.slice(anchor.offset);
          if (query.includes(" ")) {
            // Space typed → close dropdown
            setShowMention(false);
            mentionAnchorRef.current = null;
          } else {
            setMentionQuery(query);
            setFocusedIndex(0);
          }
          emitChange(editor);
          return;
        }
        // Cursor moved away from the anchor → close
        setShowMention(false);
        mentionAnchorRef.current = null;
      }

      // ── Detect fresh @ trigger ───────────────────────────────────────────
      if (!formatted) {
        const lastChar = textBefore[textBefore.length - 1];
        if (lastChar === "@") {
          setMentionQuery("");
          setShowMention(true);
          setFocusedIndex(0);
          mentionAnchorRef.current = { node, offset };
        }
      }
    } else if (showMention) {
      setShowMention(false);
      mentionAnchorRef.current = null;
    }

    emitChange(editor);
  }, [showMention, tryApplyFormatting, emitChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // ── Mention navigation ───────────────────────────────────────────────
      if (showMention && filteredItems.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, filteredItems.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          const item = filteredItems[focusedIndex];
          if (item) {
            e.preventDefault();
            insertMention(item);
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowMention(false);
          mentionAnchorRef.current = null;
          return;
        }
      }

      // ── Enter submits (Shift+Enter = newline) ────────────────────────────
      // On mobile/touch devices, Enter should insert a newline, not submit.
      // Callers that want Enter to always insert a newline (no submit-on-enter
      // behavior at all) pass `submitOnEnter={false}`.
      if (e.key === "Enter" && !e.shiftKey) {
        if (!submitOnEnter) return;
        const isTouchDevice =
          typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;
        e.preventDefault();
        onSubmit?.();
      }
    },
    [
      showMention,
      filteredItems,
      focusedIndex,
      insertMention,
      onSubmit,
      submitOnEnter,
    ],
  );

  return (
    <S.InputWrap>
      {showMention && filteredItems.length > 0 && (
        <MentionDropdown
          items={filteredItems}
          focusedIndex={focusedIndex}
          onSelect={insertMention}
          onHover={setFocusedIndex}
          showType
          style={{ bottom: "calc(100% + 6px)", left: 0, right: 0 }}
        />
      )}
      <S.Editor
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-empty={isEmpty ? "true" : undefined}
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
          }
        }}
      />
      {trailingAction ? (
        <S.TrailingAction>{trailingAction}</S.TrailingAction>
      ) : null}
    </S.InputWrap>
  );
});
