"use client";

import classNames from "classnames";
import { Popover } from "radix-ui";
import type React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  RiArrowDropDownLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiDeleteBin6Line,
  RiDoubleQuotesL,
  RiMarkPenLine,
} from "react-icons/ri";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, MentionTab } from "@/types";
import { MentionDropdown } from "../mention-dropdown";
import {
  ALIGNMENT_BUTTONS,
  BULLET_POINT_CATEGORIES,
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  DEFAULT_ORDERED_LIST_STYLE,
  DEFAULT_UNORDERED_LIST_STYLE,
  FONT_SIZES,
  FONTS,
  FORMAT_BUTTONS,
  HIGHLIGHT_COLORS,
  LIST_BUTTONS,
  ORDERED_LIST_STYLES,
  QUOTATION_MARK_CATEGORIES,
  UNORDERED_LIST_STYLES,
} from "./editor-config";
import { createMentionChip } from "./mention-chip";
import * as S from "./styled";

interface RichTextEditorProps {
  placeholder: string;
  value?: string;
  mentionTabs?: MentionTab[];
  onChange: (value: string) => void;
  onClear?: () => void;
  fullPage?: boolean;
  /** Start at one-line height and grow with content. */
  compact?: boolean;
}

export interface RichTextEditorHandle {
  insertGif: (url: string) => void;
  insertUploadingImage: (objectUrl: string) => void;
  replaceImageSrc: (oldSrc: string, newSrc: string) => void;
  removeImageBySrc: (src: string) => void;
  clear: () => void;
}

type ActiveStyles = Record<string, boolean>;

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(
  (
    { placeholder = "", value, mentionTabs = [], onChange, fullPage, compact },
    editorHandleRef,
  ) => {
    const accent = useGlobalState("accent");
    const theme = useGlobalState("theme");

    const [mentionItems, setMentionItems] = useState<MentionDataItem[]>([]);
    const [isMentionLoading, setIsMentionLoading] = useState(false);

    const [currentFont, setCurrentFont] = useState<string>(DEFAULT_FONT);
    const [currentFontSize, setCurrentFontSize] =
      useState<string>(DEFAULT_FONT_SIZE);
    const [activeStyles, setActiveStyles] = useState<ActiveStyles>({});
    const [activeLists, setActiveLists] = useState<ActiveStyles>({});
    const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
    const [currentUnorderedListStyle, setCurrentUnorderedListStyle] =
      useState<string>(DEFAULT_UNORDERED_LIST_STYLE);
    const [currentOrderedListStyle, setCurrentOrderedListStyle] =
      useState<string>(DEFAULT_ORDERED_LIST_STYLE);
    const [activeAlign, setActiveAlign] = useState<
      "left" | "center" | "right" | "justify"
    >("left");

    const [showMentionPopover, setShowMentionPopover] =
      useState<boolean>(false);
    const [mentionSearch, setMentionSearch] = useState<string>("");
    const [mentionPosition, setMentionPosition] = useState<{
      bottom: number;
      left: number;
    }>({ bottom: 0, left: 0 });
    const [focusedItemIndex, setFocusedItemIndex] = useState<number>(0);
    const [showBulletDropdown, setShowBulletDropdown] =
      useState<boolean>(false);
    const [showQuotationDropdown, setShowQuotationDropdown] =
      useState<boolean>(false);
    const [showAlignmentDropdown, setShowAlignmentDropdown] =
      useState<boolean>(false);
    const [showOrderedDropdown, setShowOrderedDropdown] =
      useState<boolean>(false);
    const [showFontDropdown, setShowFontDropdown] = useState<boolean>(false);
    const [showFontSizeDropdown, setShowFontSizeDropdown] =
      useState<boolean>(false);
    const [showHighlightDropdown, setShowHighlightDropdown] =
      useState<boolean>(false);

    const editorRef = useRef<HTMLDivElement | null>(null);
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const [showScrollOverlay, setShowScrollOverlay] = useState(false);
    const [showScrollOverlayLeft, setShowScrollOverlayLeft] = useState(false);
    const savedSelectionRef = useRef<Range | null>(null);
    const isApplyingTextStyleRef = useRef(false);
    const pendingFontRef = useRef<string | null>(null);
    const pendingFontSizeRef = useRef<string | null>(null);
    const pendingHighlightRef = useRef<string | null>(null);
    const unorderedListStyleRef = useRef<string>(DEFAULT_UNORDERED_LIST_STYLE);
    const orderedListStyleRef = useRef<string>(DEFAULT_ORDERED_LIST_STYLE);
    const bulletDropdownPanelRef = useRef<HTMLDivElement | null>(null);
    const quotationDropdownPanelRef = useRef<HTMLDivElement | null>(null);

    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
      null,
    );
    const [imageResizePct, setImageResizePct] = useState<number>(100);
    const [imageResizeBarPos, setImageResizeBarPos] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const imageResizeBarRef = useRef<HTMLDivElement | null>(null);

    const checkToolbarOverflow = useCallback(() => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      const hasRightOverflow =
        toolbar.scrollWidth > toolbar.clientWidth &&
        toolbar.scrollLeft + toolbar.clientWidth < toolbar.scrollWidth - 1;
      const hasLeftOverflow = toolbar.scrollLeft > 1;
      setShowScrollOverlay(hasRightOverflow);
      setShowScrollOverlayLeft(hasLeftOverflow);
    }, []);

    const handleScrollRight = useCallback(() => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      toolbar.scrollBy({ behavior: "smooth", left: 120 });
    }, []);

    const handleScrollLeft = useCallback(() => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;
      toolbar.scrollBy({ behavior: "smooth", left: -120 });
    }, []);

    useEffect(() => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;

      checkToolbarOverflow();
      toolbar.addEventListener("scroll", checkToolbarOverflow);

      const observer = new ResizeObserver(checkToolbarOverflow);
      observer.observe(toolbar);

      return () => {
        toolbar.removeEventListener("scroll", checkToolbarOverflow);
        observer.disconnect();
      };
    }, [checkToolbarOverflow]);

    // Initialize the editor content on first render
    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;

      // Only set initial content if editor is empty
      if (!editor.innerHTML || editor.innerHTML === "<br>") {
        editor.innerHTML = value || ""; // set value if available
      }
    }, [value]);

    useEffect(() => {
      if (!showMentionPopover || !mentionTabs.length) return;

      let cancelled = false;

      const timeout = setTimeout(async () => {
        setIsMentionLoading(true);

        try {
          const results = await Promise.all(
            mentionTabs.map((tab) => tab.getData(mentionSearch)),
          );
          if (!cancelled) {
            setMentionItems(results.flat());
            setFocusedItemIndex(0);
          }
        } finally {
          if (!cancelled) setIsMentionLoading(false);
        }
      }, 250); // debounce

      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }, [mentionSearch, showMentionPopover, mentionTabs]);

    useEffect(() => {
      if (!showMentionPopover) {
        setMentionItems([]);
        setMentionSearch("");
      }
    }, [showMentionPopover]);

    const getFontAtSelection = useCallback((): string | null => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let element: Node | null = selection.anchorNode;
        while (element && element !== editorRef.current) {
          if (element.nodeType === Node.ELEMENT_NODE) {
            const el = element as HTMLElement;
            // Check inline style first (block-level or span)
            const inlineFont = el.style.fontFamily?.trim();
            if (inlineFont) {
              const cleanFont = inlineFont.replace(/['"]/g, "").trim();
              if (FONTS.includes(cleanFont)) return cleanFont;
            }
            // Fall back to computed (covers <font face="..."> inserted by execCommand)
            const computedFont = window.getComputedStyle(el).fontFamily;
            if (computedFont) {
              const cleanFont = computedFont
                .split(",")[0]
                .replace(/['"]/g, "")
                .trim();
              if (FONTS.includes(cleanFont)) return cleanFont;
            }
          }
          element = element.parentNode;
        }
      }
      return null;
    }, []);

    const getFontSizeAtSelection = useCallback((): string | null => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let element: Node | null = selection.anchorNode;
        while (element && element !== editorRef.current) {
          if (element.nodeType === Node.ELEMENT_NODE) {
            // Use getPropertyValue to correctly read CSS custom property values
            // (the typed .fontSize accessor returns "" for var(...) values)
            const inlineSize = (element as HTMLElement).style
              .getPropertyValue("font-size")
              .trim();
            if (
              inlineSize &&
              FONT_SIZES.some((size) => size.value === inlineSize)
            ) {
              return inlineSize;
            }
          }
          element = element.parentNode;
        }
      }
      return null;
    }, []);

    const isSelectionInsideEditor = useCallback(() => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || !editorRef.current) {
        return false;
      }

      return editorRef.current.contains(selection.anchorNode);
    }, []);

    const saveSelection = useCallback(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      }
    }, []);

    const restoreSelection = useCallback(() => {
      if (savedSelectionRef.current) {
        const selection = window.getSelection();
        if (!selection) return;
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }, []);

    const isSameRange = useCallback((a: Range | null, b: Range | null) => {
      if (!a || !b) return false;

      return (
        a.startContainer === b.startContainer &&
        a.startOffset === b.startOffset &&
        a.endContainer === b.endContainer &&
        a.endOffset === b.endOffset
      );
    }, []);

    const getAlignmentFromSelection = useCallback(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let element: Node | null = selection.anchorNode;
        while (element && element !== editorRef.current) {
          if (element.nodeType === Node.ELEMENT_NODE) {
            const style = window.getComputedStyle(element as Element);
            return (
              (style.textAlign as "left" | "center" | "right" | "justify") ||
              "left"
            );
          }
          element = element.parentNode;
        }
      }
      return "left";
    }, []);

    const getClosestListElement = useCallback(
      (listTag?: "UL" | "OL"): HTMLUListElement | HTMLOListElement | null => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;

        let element: Node | null = selection.anchorNode;
        while (element && element !== editorRef.current) {
          if (element.nodeType === Node.ELEMENT_NODE) {
            const el = element as HTMLElement;
            if (el.tagName === "UL" || el.tagName === "OL") {
              if (!listTag || el.tagName === listTag) {
                return el as HTMLUListElement | HTMLOListElement;
              }
            }
          }
          element = element.parentNode;
        }

        return null;
      },
      [],
    );

    // Returns all block-level elements (DIV/P/LI) touched by the current selection.
    // Falls back to the editor root for unwrapped first-line content.
    const getCurrentBlockElements = useCallback((): HTMLElement[] => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || !editorRef.current) return [];

      const editor = editorRef.current;
      const range = selection.getRangeAt(0);

      const getBlockParent = (node: Node | null): HTMLElement => {
        while (node && node !== editor) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (
              el.tagName === "DIV" ||
              el.tagName === "P" ||
              el.tagName === "LI"
            ) {
              return el;
            }
          }
          node = node.parentNode;
        }
        return editor;
      };

      if (range.collapsed) {
        return [getBlockParent(range.startContainer)];
      }

      const blocks = new Set<HTMLElement>();
      blocks.add(getBlockParent(range.startContainer));
      blocks.add(getBlockParent(range.endContainer));

      editor.querySelectorAll<HTMLElement>("div, p, li").forEach((el) => {
        if (range.intersectsNode(el)) {
          blocks.add(el);
        }
      });

      return Array.from(blocks);
    }, []);

    // Ensures the current selection lives inside a real block element (DIV/P/LI).
    // If the editor root is the only "block", wraps existing content in a <div>
    // and places the cursor inside it. Returns the block elements after wrapping.
    const ensureBlockWrappers = useCallback((): HTMLElement[] => {
      const editor = editorRef.current;
      if (!editor) return [];
      const existing = getCurrentBlockElements();
      if (existing.length > 0 && existing.every((b) => b !== editor)) {
        return existing;
      }

      const wrapper = document.createElement("div");
      const isEmpty =
        editor.childNodes.length === 0 ||
        editor.innerHTML === "<br>" ||
        editor.innerHTML.trim() === "";

      if (isEmpty) {
        wrapper.appendChild(document.createElement("br"));
        editor.innerHTML = "";
        editor.appendChild(wrapper);
      } else {
        while (editor.firstChild) {
          wrapper.appendChild(editor.firstChild);
        }
        editor.appendChild(wrapper);
      }

      const selection = window.getSelection();
      if (selection) {
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        savedSelectionRef.current = newRange.cloneRange();
      }

      return [wrapper];
    }, [getCurrentBlockElements]);

    const getListStyleAtSelection = useCallback(
      (listTag: "UL" | "OL", allowedStyles: string[]): string | null => {
        const list = getClosestListElement(listTag);
        if (!list) return null;

        const inlineStyle = list.style.listStyleType?.trim();
        if (inlineStyle && allowedStyles.includes(inlineStyle)) {
          return inlineStyle;
        }

        const computedStyle = window.getComputedStyle(list).listStyleType;
        if (computedStyle && allowedStyles.includes(computedStyle)) {
          return computedStyle;
        }

        return null;
      },
      [getClosestListElement],
    );

    const updateActiveStyles = useCallback(() => {
      const selection = window.getSelection();
      const isCollapsed = selection?.isCollapsed ?? true;
      const insideEditor = isSelectionInsideEditor();

      const styles: ActiveStyles = {};
      FORMAT_BUTTONS.forEach((btn) => {
        styles[btn.id] = document.queryCommandState(btn.command);
      });

      const listStyles: ActiveStyles = {};
      LIST_BUTTONS.forEach((btn) => {
        listStyles[btn.id] = document.queryCommandState(btn.command);
      });

      const selectedFont = getFontAtSelection();
      const selectedFontSize = getFontSizeAtSelection();
      const selectedUnorderedStyle = getListStyleAtSelection(
        "UL",
        UNORDERED_LIST_STYLES.map((item) => item.value),
      );
      const selectedOrderedStyle = getListStyleAtSelection(
        "OL",
        ORDERED_LIST_STYLES.map((item) => item.value),
      );
      const pendingFont = pendingFontRef.current;
      const pendingFontSize = pendingFontSizeRef.current;

      setActiveStyles(styles);
      setActiveLists(listStyles);
      setActiveAlign(getAlignmentFromSelection());

      // Highlight: walk from the selection ancestor and look for a span
      // carrying both inline color + background-color (our highlight signature).
      const sel = window.getSelection();
      const anchor = sel?.anchorNode ?? null;
      let cur: Node | null = anchor;
      const editorEl = editorRef.current;
      let highlightColor: string | null = null;
      while (cur && cur !== editorEl) {
        if (cur.nodeType === 1) {
          const el = cur as HTMLElement;
          if (el.style?.color && el.style?.backgroundColor) {
            highlightColor = el.style.color;
            break;
          }
        }
        cur = cur.parentNode;
      }
      // If the DOM walk found nothing but a highlight is queued for the next
      // typed characters (collapsed cursor case), surface the queued color so
      // the toolbar trigger reflects the active state immediately.
      if (!highlightColor && insideEditor && pendingHighlightRef.current) {
        highlightColor = pendingHighlightRef.current;
      }
      setActiveHighlight(highlightColor);

      setCurrentFont(() => {
        if (insideEditor && pendingFont) return pendingFont;
        if (selectedFont) return selectedFont;
        return DEFAULT_FONT;
      });

      setCurrentFontSize(() => {
        if (insideEditor && pendingFontSize) return pendingFontSize;
        if (selectedFontSize) return selectedFontSize;
        return DEFAULT_FONT_SIZE;
      });

      setCurrentUnorderedListStyle((prev) => {
        if (selectedUnorderedStyle) return selectedUnorderedStyle;
        if (isCollapsed && insideEditor) return prev;
        return DEFAULT_UNORDERED_LIST_STYLE;
      });

      setCurrentOrderedListStyle((prev) => {
        if (selectedOrderedStyle) return selectedOrderedStyle;
        if (isCollapsed && insideEditor) return prev;
        return DEFAULT_ORDERED_LIST_STYLE;
      });
    }, [
      getAlignmentFromSelection,
      getFontAtSelection,
      getFontSizeAtSelection,
      getListStyleAtSelection,
      isSelectionInsideEditor,
    ]);

    const execCommand = useCallback(
      (command: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false);
        // Use rAF so the browser finishes updating queryCommandState before we read it
        requestAnimationFrame(() => {
          updateActiveStyles();
        });
      },
      [updateActiveStyles],
    );

    const handleFormatClick = useCallback(
      (command: string) => {
        execCommand(command);
      },
      [execCommand],
    );

    // Highlight: applies foreColor (the picked color) and hiliteColor (a lighter
    // translucent version of the same color) to the current selection. Pass
    // `null` to clear an existing highlight.
    const findHighlightAncestor = useCallback(
      (node: Node | null): HTMLElement | null => {
        let cur: Node | null = node;
        const editor = editorRef.current;
        while (cur && cur !== editor) {
          if (cur.nodeType === 1) {
            const el = cur as HTMLElement;
            if (el.style?.color && el.style?.backgroundColor) {
              return el;
            }
          }
          cur = cur.parentNode;
        }
        return null;
      },
      [],
    );

    const applyHighlight = useCallback(
      (color: string | null) => {
        editorRef.current?.focus();

        // Capture the typing-state we want to preserve BEFORE restoreSelection
        // wipes it. restoreSelection + execCommand("foreColor"/"hiliteColor")
        // both reset the browser's pending inline-format queue, which would
        // otherwise drop bold/italic/underline and the active font.
        const wasBold = document.queryCommandState("bold");
        const wasItalic = document.queryCommandState("italic");
        const wasUnderline = document.queryCommandState("underline");
        const fontToReapply = pendingFontRef.current;
        const fontSizeToReapply = pendingFontSizeRef.current;

        restoreSelection();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const editor = editorRef.current;
        if (!editor) return;

        if (color === null) {
          const range = sel.getRangeAt(0);

          if (range.collapsed) {
            // Cursor only — don't strip any existing highlighted text. Instead,
            // if the cursor is inside a highlight span, split that span at the
            // cursor and move the caret into the parent (between the two halves)
            // so that subsequent typing inherits no highlight styling.
            const ancestor = findHighlightAncestor(range.startContainer);
            if (ancestor?.parentNode) {
              // Split: move everything after the cursor into a clone of the
              // highlight span placed just after the original.
              const after = range.cloneRange();
              after.setEndAfter(ancestor);
              const tail = after.extractContents();
              ancestor.parentNode.insertBefore(tail, ancestor.nextSibling);

              // Insert a zero-width text node between the two halves and place
              // the caret inside it. This guarantees the caret lives in a plain
              // text node owned by the parent (not inside either highlight
              // span), so subsequent typing produces unhighlighted text even
              // after the popover closes and focus bounces around.
              const parent = ancestor.parentNode;
              const marker = document.createTextNode("\u200B");
              parent.insertBefore(marker, ancestor.nextSibling);

              const newRange = document.createRange();
              newRange.setStart(marker, 1);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);

              // Remember this caret position so the next focus restore lands
              // here rather than back inside the (now-split) highlight span.
              saveSelection();
              onChange(editor.innerHTML);

              // Re-assert focus on the editor on the next frame in case the
              // closing popover (Radix) tries to steal focus back to the trigger.
              requestAnimationFrame(() => {
                editor.focus();
                const s = window.getSelection();
                if (s && marker.parentNode) {
                  const r = document.createRange();
                  r.setStart(marker, marker.length);
                  r.collapse(true);
                  s.removeAllRanges();
                  s.addRange(r);
                }
                // Re-apply preserved typing-state so toggling highlight off
                // doesn't drop the user's active bold/italic/underline/font.
                if (wasBold !== document.queryCommandState("bold")) {
                  document.execCommand("bold");
                }
                if (wasItalic !== document.queryCommandState("italic")) {
                  document.execCommand("italic");
                }
                if (wasUnderline !== document.queryCommandState("underline")) {
                  document.execCommand("underline");
                }
                if (fontToReapply) {
                  document.execCommand("fontName", false, fontToReapply);
                }
              });
            }
            // Clear highlight indicator immediately for the toggle-off case.
            pendingHighlightRef.current = null;
            setActiveHighlight(null);
          } else {
            // Range selection — unwrap any highlight spans intersecting it.
            const all = Array.from(
              editor.querySelectorAll<HTMLElement>("*"),
            ).filter((el) => el.style?.color && el.style?.backgroundColor);
            all.forEach((el) => {
              let intersects = false;
              try {
                intersects = range.intersectsNode(el);
              } catch {
                intersects = false;
              }
              if (!intersects) return;
              const parent = el.parentNode;
              if (!parent) return;
              while (el.firstChild) parent.insertBefore(el.firstChild, el);
              parent.removeChild(el);
            });
            editor.normalize();
            onChange(editor.innerHTML);
            pendingHighlightRef.current = null;
            setActiveHighlight(null);
          }
        } else {
          // Convert hex (#rrggbb) to a brighter foreground (mixed toward
          // white) and a slightly dimmer translucent background so the two
          // tones read as a soft highlighter pen.
          const hex = color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          // Brighten by mixing 35% white into the original hue.
          const mix = (c: number) => Math.round(c + (255 - c) * 0.35);
          const br = mix(r);
          const bg2 = mix(g);
          const bb = mix(b);
          const fg = `rgb(${br}, ${bg2}, ${bb})`;
          const bg = `rgba(${r}, ${g}, ${b}, 0.16)`;
          try {
            document.execCommand("styleWithCSS", false, "true");
          } catch {
            /* fallback to <font> tags on unsupported browsers */
          }
          document.execCommand("foreColor", false, fg);
          document.execCommand("hiliteColor", false, bg);

          // Re-apply previously active typing-state that execCommand wiped.
          if (wasBold !== document.queryCommandState("bold")) {
            document.execCommand("bold");
          }
          if (wasItalic !== document.queryCommandState("italic")) {
            document.execCommand("italic");
          }
          if (wasUnderline !== document.queryCommandState("underline")) {
            document.execCommand("underline");
          }
          if (fontToReapply) {
            document.execCommand("fontName", false, fontToReapply);
          }
          if (fontSizeToReapply) {
            // execCommand("fontSize") only accepts 1-7; rely on the block-level
            // font-size set by handleFontSizeChange. Nothing to do here.
          }

          // Optimistically reflect the chosen color in the toolbar trigger.
          // When the selection is collapsed, execCommand sets the typing state
          // but doesn't create a span yet, so updateActiveStyles can't detect
          // the highlight from the DOM. Setting it here makes the active
          // indicator show immediately and persists across the rAF refresh.
          pendingHighlightRef.current = fg;
          setActiveHighlight(fg);
        }

        // Don't refresh active styles after applying a color — when the cursor
        // is collapsed, no span exists yet and updateActiveStyles would
        // clobber the optimistic activeHighlight back to null. The next
        // selectionchange (after the popover closes / user types) will sync
        // the indicator from the real DOM.
      },
      [
        restoreSelection,
        saveSelection,
        onChange,
        findHighlightAncestor,
      ],
    );

    // Alignment options
    type AlignId = "left" | "center" | "right" | "justify";

    const handleAlignClick = useCallback(
      (alignId: AlignId, command: string) => {
        editorRef.current?.focus();
        restoreSelection();
        document.execCommand(command, false);
        setActiveAlign(alignId);
      },
      [restoreSelection],
    );

    const handleFontChange = useCallback(
      (fontName: string) => {
        isApplyingTextStyleRef.current = true;
        editorRef.current?.focus();
        restoreSelection();

        // Make sure there is a real block wrapper so the font sticks on the line.
        const blocks = ensureBlockWrappers();

        // Apply font-family at character level via execCommand for any selected text.
        document.execCommand("fontName", false, fontName);

        // execCommand inserts <font face="..."> — convert to styled spans for cleanliness
        const editor = editorRef.current;
        if (editor) {
          editor.querySelectorAll<HTMLElement>("font[face]").forEach((node) => {
            const face = node.getAttribute("face") ?? "";
            node.removeAttribute("face");
            node.style.fontFamily = face;
          });
        }

        // Also persist on the block so the toolbar can read it back and so
        // newly typed characters on this line keep the font even after the
        // browser's typing-style is cleared.
        for (const block of blocks) {
          if (block !== editor) {
            block.style.fontFamily = fontName;
          }
        }

        pendingFontRef.current = fontName;
        setCurrentFont(fontName);
        saveSelection();

        if (editor) {
          const content = editor.innerHTML;
          if (content && content.trim() !== "" && content !== "<br>") {
            onChange(content);
          }
        }

        requestAnimationFrame(() => {
          isApplyingTextStyleRef.current = false;
        });
      },
      [restoreSelection, saveSelection, ensureBlockWrappers, onChange],
    );

    const handleFontSizeChange = useCallback(
      (fontSize: string) => {
        isApplyingTextStyleRef.current = true;
        editorRef.current?.focus();
        restoreSelection();

        // Make sure there is a real block wrapper so the font-size sticks on the line.
        // Use setProperty so CSS custom-property values (var(--...)) are stored correctly;
        // the typed .fontSize setter silently ignores them.
        const blocks = ensureBlockWrappers();
        for (const block of blocks) {
          block.style.setProperty("font-size", fontSize);
        }

        const editorEl = editorRef.current;

        pendingFontSizeRef.current = fontSize;
        setCurrentFontSize(fontSize);
        saveSelection();

        // restoreSelection() above wipes the browser's pending typing-style,
        // so re-apply the active font-family for the next typed characters.
        const fontToReapply = pendingFontRef.current;
        if (fontToReapply) {
          document.execCommand("fontName", false, fontToReapply);
          if (editorEl) {
            editorEl
              .querySelectorAll<HTMLElement>("font[face]")
              .forEach((node) => {
                const face = node.getAttribute("face") ?? "";
                node.removeAttribute("face");
                node.style.fontFamily = face;
              });
          }
          saveSelection();
        }

        if (editorEl) {
          const content = editorEl.innerHTML;
          if (content && content.trim() !== "" && content !== "<br>") {
            onChange(content);
          }
        }

        requestAnimationFrame(() => {
          isApplyingTextStyleRef.current = false;
        });
      },
      [restoreSelection, saveSelection, ensureBlockWrappers, onChange],
    );

    const applyListStyleToClosest = useCallback(
      (listTag: "UL" | "OL", styleType: string) => {
        const list = getClosestListElement(listTag);
        if (!list) return;
        list.style.listStyleType = styleType;
        list.setAttribute("data-list-style-type", styleType);
      },
      [getClosestListElement],
    );

    const handleUnorderedListStyleChange = useCallback(
      (styleType: string) => {
        editorRef.current?.focus();
        restoreSelection();
        unorderedListStyleRef.current = styleType;
        setCurrentUnorderedListStyle(styleType);
        applyListStyleToClosest("UL", styleType);
        saveSelection();
        updateActiveStyles();
      },
      [
        applyListStyleToClosest,
        restoreSelection,
        saveSelection,
        updateActiveStyles,
      ],
    );

    const handleOrderedListStyleChange = useCallback(
      (styleType: string) => {
        editorRef.current?.focus();
        restoreSelection();
        orderedListStyleRef.current = styleType;
        setCurrentOrderedListStyle(styleType);
        applyListStyleToClosest("OL", styleType);
        saveSelection();
        updateActiveStyles();
      },
      [
        applyListStyleToClosest,
        restoreSelection,
        saveSelection,
        updateActiveStyles,
      ],
    );

    const handleListToggle = useCallback(
      (command: string, listType: "unordered" | "ordered") => {
        isApplyingTextStyleRef.current = true;
        editorRef.current?.focus();
        restoreSelection();
        document.execCommand(command, false);

        requestAnimationFrame(() => {
          if (listType === "unordered") {
            applyListStyleToClosest("UL", unorderedListStyleRef.current);
          } else {
            applyListStyleToClosest("OL", orderedListStyleRef.current);
          }

          saveSelection();
          updateActiveStyles();
          isApplyingTextStyleRef.current = false;
        });
      },
      [
        applyListStyleToClosest,
        restoreSelection,
        saveSelection,
        updateActiveStyles,
      ],
    );

    const handleQuotationMarkInsert = useCallback(
      (symbol: string) => {
        editorRef.current?.focus();
        restoreSelection();
        document.execCommand("insertText", false, symbol);
        saveSelection();
      },
      [restoreSelection, saveSelection],
    );

    const checkForMention = useCallback(() => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;

      if (textNode.nodeType !== Node.TEXT_NODE) {
        setShowMentionPopover(false);
        return;
      }

      const text = textNode.textContent || "";
      const cursorPos = range.startOffset;
      const textBeforeCursor = text.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        if (!textAfterAt.includes(" ")) {
          setMentionSearch(textAfterAt);

          const tempRange = document.createRange();
          tempRange.setStart(textNode, lastAtIndex);
          tempRange.setEnd(textNode, lastAtIndex + 1);
          const rect = tempRange.getBoundingClientRect();
          const DROPDOWN_MAX_WIDTH = 320;
          setMentionPosition({
            bottom: window.innerHeight - rect.top + 8,
            left: Math.max(
              8,
              Math.min(rect.left, window.innerWidth - DROPDOWN_MAX_WIDTH - 8),
            ),
          });

          setShowMentionPopover(true);
          setFocusedItemIndex(0);
          return;
        }
      }

      setShowMentionPopover(false);
    }, []);

    const handleInput = useCallback(() => {
      saveSelection();
      checkForMention();
      updateActiveStyles();

      const editor = editorRef.current;
      if (!editor) return;

      const content = editor.innerHTML;

      // Ignore empty or trivial content
      if (!content || content.trim() === "" || content === "<br>") {
        onChange("");
        return;
      }
      onChange(content);
    }, [saveSelection, checkForMention, updateActiveStyles, onChange]);

    const isImageUrl = useCallback((url: string): boolean => {
      // Check if URL ends with image/gif extensions
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i;
      if (imageExtensions.test(url)) return true;

      // Check for common image hosting patterns
      const imageHostPatterns = [
        /tenor\.com\/.*\.gif/i,
        /giphy\.com\/media/i,
        /imgur\.com.*\.(jpg|jpeg|png|gif|webp)/i,
        /media\.tenor\.com/i,
        /i\.imgur\.com/i,
      ];

      return imageHostPatterns.some((pattern) => pattern.test(url));
    }, []);

    const selectImageNode = useCallback((img: HTMLImageElement) => {
      const stored = img.getAttribute("data-width-pct");
      let pct: number;
      if (stored && !Number.isNaN(Number(stored))) {
        pct = Number(stored);
      } else {
        const containerSpan = img.parentElement as HTMLElement | null;
        const containerPct = containerSpan?.style.width;
        if (containerPct?.endsWith("%")) {
          pct = parseFloat(containerPct);
        } else {
          const editorWidth = editorRef.current?.clientWidth ?? 0;
          const imgWidth = img.getBoundingClientRect().width;
          pct =
            editorWidth > 0 ? Math.round((imgWidth / editorWidth) * 100) : 100;
        }
      }
      pct = Math.max(10, Math.min(100, pct));
      setSelectedImage(img);
      setImageResizePct(pct);
      const wrapperRect =
        editorRef.current?.parentElement?.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      if (wrapperRect) {
        setImageResizeBarPos({
          left: 0,
          top: imgRect.top - wrapperRect.top - 6,
        });
      }
    }, []);

    const insertImageFromUrl = useCallback(
      (url: string, uploading = false) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Find the block element the cursor is currently in
        const selection = window.getSelection();
        let currentBlock: HTMLElement | null = null;
        if (selection && selection.rangeCount > 0) {
          let node: Node | null = selection.getRangeAt(0).startContainer;
          while (node && node !== editor) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const tag = (node as HTMLElement).tagName;
              if (tag === "DIV" || tag === "P" || tag === "LI") {
                currentBlock = node as HTMLElement;
                break;
              }
            }
            node = node.parentNode;
          }
        }

        // Create image element — default to 50% of available width
        const defaultPct = 50;

        const img = document.createElement("img");
        img.src = url;
        img.className = "inline-image";
        img.alt = "Pasted image";
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.maxWidth = "none";
        img.style.maxHeight = "none";
        img.setAttribute("data-width-pct", String(defaultPct));

        const imgContainer = document.createElement("span");
        imgContainer.className = uploading
          ? "inline-image-container uploading"
          : "inline-image-container";
        imgContainer.contentEditable = "false";
        imgContainer.style.width = `${defaultPct}%`;
        imgContainer.appendChild(img);

        // Place image in its own block after the current block
        const imageBlock = document.createElement("div");
        imageBlock.appendChild(imgContainer);

        // Empty block after the image for the cursor
        const afterBlock = document.createElement("div");
        afterBlock.appendChild(document.createElement("br"));

        // Copy font/size from current block so styles are consistent
        if (currentBlock) {
          const fs = currentBlock.style.fontSize;
          const ff = currentBlock.style.fontFamily;
          if (fs) afterBlock.style.fontSize = fs;
          if (ff) afterBlock.style.fontFamily = ff;
        }

        if (currentBlock?.parentNode) {
          currentBlock.parentNode?.insertBefore(
            imageBlock,
            currentBlock.nextSibling,
          );
          imageBlock.parentNode?.insertBefore(
            afterBlock,
            imageBlock.nextSibling,
          );
        } else {
          editor.appendChild(imageBlock);
          editor.appendChild(afterBlock);
        }

        // Move cursor into the empty block after the image
        const newRange = document.createRange();
        newRange.setStart(afterBlock, 0);
        newRange.collapse(true);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }

        saveSelection();
        handleInput();

        // Keep the inserted media in view. The editor itself is the scroll
        // container; on mobile, opening/closing the picker often resets
        // scrollTop to 0, so we explicitly scroll the new block into view.
        const scrollMediaIntoView = () => {
          imageBlock.scrollIntoView({ block: "center", inline: "nearest" });
        };
        requestAnimationFrame(scrollMediaIntoView);
        // The image starts at height 0 — once it loads, scroll again so the
        // final position is correct.
        if (!img.complete) {
          img.addEventListener("load", scrollMediaIntoView, { once: true });
          img.addEventListener("error", scrollMediaIntoView, { once: true });
        }

        // Auto-show the resize bar for the just-inserted image
        requestAnimationFrame(() => {
          selectImageNode(img);
        });
      },
      [saveSelection, handleInput, selectImageNode],
    );

    const handleEditorClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("inline-image")) {
          selectImageNode(target as HTMLImageElement);
        } else if (!imageResizeBarRef.current?.contains(target)) {
          setSelectedImage(null);
          setImageResizeBarPos(null);
        }
      },
      [selectImageNode],
    );

    const handleImageResizeChange = useCallback(
      (pct: number) => {
        if (!selectedImage) return;
        const clamped = Math.max(10, Math.min(100, pct));
        // Apply % on the container span so the saved HTML is screen-independent
        const container = selectedImage.parentElement as HTMLElement | null;
        if (container) {
          container.style.width = `${clamped}%`;
        }
        selectedImage.style.width = "100%";
        selectedImage.style.height = "auto";
        selectedImage.style.maxWidth = "none";
        selectedImage.style.maxHeight = "none";
        selectedImage.setAttribute("data-width-pct", String(clamped));
        setImageResizePct(clamped);
        const editor = editorRef.current;
        if (editor) {
          const content = editor.innerHTML;
          if (content && content.trim() !== "" && content !== "<br>") {
            onChange(content);
          }
        }
      },
      [selectedImage, onChange],
    );

    const replaceImageSrc = useCallback(
      (oldSrc: string, newSrc: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        const images =
          editor.querySelectorAll<HTMLImageElement>(".inline-image");
        for (const img of images) {
          if (img.src === oldSrc || img.getAttribute("src") === oldSrc) {
            img.src = newSrc;
            img.parentElement?.classList.remove("uploading");
            break;
          }
        }
        const content = editor.innerHTML;
        if (content && content.trim() !== "" && content !== "<br>") {
          onChange(content);
        }
      },
      [onChange],
    );

    const removeImageBySrc = useCallback(
      (src: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        const images =
          editor.querySelectorAll<HTMLImageElement>(".inline-image");
        for (const img of images) {
          if (img.src === src || img.getAttribute("src") === src) {
            // Remove the whole image block div (container > imageBlock)
            const container = img.closest(".inline-image-container");
            const block = container?.parentElement;
            if (block && block !== editor) {
              block.remove();
            } else {
              container?.remove();
            }
            break;
          }
        }
        const content = editor.innerHTML;
        onChange(
          content && content.trim() !== "" && content !== "<br>" ? content : "",
        );
      },
      [onChange],
    );

    useImperativeHandle(
      editorHandleRef,
      () => ({
        clear: () => {
          if (editorRef.current) {
            editorRef.current.innerHTML = "";
            onChange("");
          }
        },
        insertGif: (url: string) => {
          editorRef.current?.focus();
          if (savedSelectionRef.current) {
            restoreSelection();
          } else if (editorRef.current) {
            // No prior cursor — place it at the very beginning of the editor
            const range = document.createRange();
            range.setStart(editorRef.current, 0);
            range.collapse(true);
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
          insertImageFromUrl(url);
        },
        insertUploadingImage: (objectUrl: string) => {
          editorRef.current?.focus();
          if (savedSelectionRef.current) {
            restoreSelection();
          } else if (editorRef.current) {
            const range = document.createRange();
            range.setStart(editorRef.current, 0);
            range.collapse(true);
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
          insertImageFromUrl(objectUrl, true);
        },
        removeImageBySrc,
        replaceImageSrc,
      }),
      [
        restoreSelection,
        insertImageFromUrl,
        replaceImageSrc,
        removeImageBySrc,
        onChange,
      ],
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        const pastedText = e.clipboardData.getData("text/plain").trim();

        // Check if pasted text is an image URL
        if (pastedText && isImageUrl(pastedText)) {
          e.preventDefault();
          insertImageFromUrl(pastedText);
          return;
        }

        // For other content, let default paste behavior work
      },
      [isImageUrl, insertImageFromUrl],
    );

    const insertMention = useCallback(
      (item: MentionDataItem) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent ?? "";
        const cursorPos = range.startOffset;
        const textBeforeCursor = text.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf("@");

        if (lastAtIndex !== -1) {
          const mentionSpan = createMentionChip(item);

          const beforeText = text.slice(0, lastAtIndex);
          const afterText = text.slice(cursorPos);

          textNode.textContent = beforeText;

          const afterTextNode = document.createTextNode(" " + afterText);
          const parent = textNode.parentNode;
          if (!parent) return;

          parent.insertBefore(mentionSpan, textNode.nextSibling);
          parent.insertBefore(afterTextNode, mentionSpan.nextSibling);

          const newRange = document.createRange();
          newRange.setStart(afterTextNode, 1);
          newRange.setEnd(afterTextNode, 1);

          selection.removeAllRanges();
          selection.addRange(newRange);
        }

        setShowMentionPopover(false);
        setMentionSearch("");
        handleInput();
        editorRef.current?.focus();
      },
      [editorRef, setShowMentionPopover, setMentionSearch, handleInput],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (showMentionPopover) {
          const currentItems = mentionItems;

          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              setFocusedItemIndex((prev) =>
                prev < currentItems.length - 1 ? prev + 1 : 0,
              );
              return;
            case "ArrowUp":
              e.preventDefault();
              setFocusedItemIndex((prev) =>
                prev > 0 ? prev - 1 : currentItems.length - 1,
              );
              return;
            case "Enter":
              if (currentItems.length > 0) {
                e.preventDefault();
                insertMention(currentItems[focusedItemIndex]);
              }
              return;
            case "Escape":
              e.preventDefault();
              setShowMentionPopover(false);
              return;
          }
        }

        // On Enter, carry block-level font/size forward to the new line
        if (e.key === "Enter") {
          const currentBlock = getCurrentBlockElements()[0];
          if (currentBlock && currentBlock !== editorRef.current) {
            const fontFamily = currentBlock.style.fontFamily;
            const fontSize = currentBlock.style.getPropertyValue("font-size");
            if (fontFamily || fontSize) {
              requestAnimationFrame(() => {
                const newBlock = getCurrentBlockElements()[0];
                if (newBlock && newBlock !== currentBlock) {
                  if (fontFamily) newBlock.style.fontFamily = fontFamily;
                  if (fontSize)
                    newBlock.style.setProperty("font-size", fontSize);
                  saveSelection();
                  const editor = editorRef.current;
                  if (editor) onChange(editor.innerHTML);
                }
              });
            }
          }
        }
      },
      [
        showMentionPopover,
        focusedItemIndex,
        insertMention,
        getCurrentBlockElements,
        saveSelection,
        onChange,
      ],
    );

    const handleSelectionChange = useCallback(() => {
      if (document.activeElement !== editorRef.current) return;

      const selection = window.getSelection();
      const currentRange =
        selection && selection.rangeCount > 0
          ? selection.getRangeAt(0).cloneRange()
          : null;

      const hasRealSelectionChange = !isSameRange(
        currentRange,
        savedSelectionRef.current,
      );

      if (!isApplyingTextStyleRef.current && hasRealSelectionChange) {
        pendingFontRef.current = null;
        pendingFontSizeRef.current = null;
        pendingHighlightRef.current = null;
      }

      saveSelection();
      updateActiveStyles();
    }, [isSameRange, saveSelection, updateActiveStyles]);

    const handleSave = useCallback(() => {
      const editor = editorRef.current;

      if (!editor) return;
      const content = editor.innerHTML;

      if (content?.trim() && content !== "<br>") {
        console.log(content);
      }
    }, []);

    useEffect(() => {
      if (!selectedImage) return;
      const handleOutside = (e: MouseEvent) => {
        const t = e.target as Node;
        if (
          !editorRef.current?.contains(t) &&
          !imageResizeBarRef.current?.contains(t)
        ) {
          setSelectedImage(null);
          setImageResizeBarPos(null);
        }
      };
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSelectedImage(null);
          setImageResizeBarPos(null);
        }
      };
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [selectedImage]);

    useEffect(() => {
      document.addEventListener("selectionchange", handleSelectionChange);
      return () =>
        document.removeEventListener("selectionchange", handleSelectionChange);
    }, [handleSelectionChange]);

    // Scroll selected bullet into view when dropdown opens
    useEffect(() => {
      if (showBulletDropdown && bulletDropdownPanelRef.current) {
        const selectedButton = bulletDropdownPanelRef.current.querySelector(
          `button[data-value="${currentUnorderedListStyle}"]`,
        );
        if (selectedButton) {
          selectedButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
        }
      }
    }, [showBulletDropdown, currentUnorderedListStyle]);

    return (
      <S.Container $fullPage={fullPage}>
        <S.ToolbarWrapper>
          <S.ToolbarRoot ref={toolbarRef}>
            {/* Font (language) — Radix Popover */}
            <Popover.Root
              open={showFontDropdown}
              onOpenChange={setShowFontDropdown}
            >
              <Popover.Trigger asChild>
                <S.DropdownTriggerBtn
                  onMouseDown={(e) => e.preventDefault()}
                  title="Font family"
                >
                  <S.FontTriggerValue style={{ fontFamily: currentFont }}>
                    {currentFont}
                  </S.FontTriggerValue>
                  <S.DropdownTriggerChevron>
                    <RiArrowDropDownLine size={16} />
                  </S.DropdownTriggerChevron>
                </S.DropdownTriggerBtn>
              </Popover.Trigger>
              <Popover.Portal>
                <S.DropdownPopoverContent
                  side="bottom"
                  sideOffset={6}
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  style={{
                    maxHeight: 280,
                    minWidth: "10rem",
                    overflowY: "auto",
                  }}
                  className={classNames("select-content", theme, accent)}
                >
                  {FONTS.map((f) => (
                    <S.OrderedListDropdownItem
                      key={f}
                      type="button"
                      $selected={currentFont === f}
                      onClick={() => {
                        handleFontChange(f);
                        setShowFontDropdown(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      style={{ fontFamily: f }}
                    >
                      {f}
                    </S.OrderedListDropdownItem>
                  ))}
                </S.DropdownPopoverContent>
              </Popover.Portal>
            </Popover.Root>

            {/* Font size — Radix Popover */}
            <Popover.Root
              open={showFontSizeDropdown}
              onOpenChange={setShowFontSizeDropdown}
            >
              <Popover.Trigger asChild>
                <S.DropdownTriggerBtn
                  onMouseDown={(e) => e.preventDefault()}
                  title="Font size"
                >
                  <S.DropdownTriggerValue style={{ fontSize: "0.9rem" }}>
                    {FONT_SIZES.find((s) => s.value === currentFontSize)
                      ?.shortLabel || currentFontSize}
                  </S.DropdownTriggerValue>
                  <S.DropdownTriggerChevron>
                    <RiArrowDropDownLine size={16} />
                  </S.DropdownTriggerChevron>
                </S.DropdownTriggerBtn>
              </Popover.Trigger>
              <Popover.Portal>
                <S.DropdownPopoverContent
                  side="bottom"
                  sideOffset={6}
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  style={{ minWidth: "6rem", padding: "0.375rem" }}
                  className={classNames("select-content", theme, accent)}
                >
                  {FONT_SIZES.map((size) => (
                    <S.OrderedListDropdownItem
                      key={size.value}
                      type="button"
                      $selected={currentFontSize === size.value}
                      onClick={() => {
                        handleFontSizeChange(size.value);
                        setShowFontSizeDropdown(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {size.label}
                    </S.OrderedListDropdownItem>
                  ))}
                </S.DropdownPopoverContent>
              </Popover.Portal>
            </Popover.Root>

            <S.Divider />

            <S.ToolbarSection>
              <S.ToggleGroup type="multiple">
                {FORMAT_BUTTONS.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <S.ToggleItem
                      key={btn.id}
                      value={btn.id}
                      $active={activeStyles[btn.id]}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleFormatClick(btn.command)}
                      title={btn.title}
                    >
                      <Icon size={20} />
                    </S.ToggleItem>
                  );
                })}
              </S.ToggleGroup>

              {/* Highlight color picker */}
              <Popover.Root
                open={showHighlightDropdown}
                onOpenChange={(open) => {
                  if (open) saveSelection();
                  setShowHighlightDropdown(open);
                }}
              >
                <Popover.Trigger asChild>
                  <S.DropdownTriggerBtn
                    onMouseDown={(e) => e.preventDefault()}
                    title="Highlight"
                    $active={!!activeHighlight}
                  >
                    <S.DropdownTriggerValue>
                      <RiMarkPenLine
                        size={20}
                        color={activeHighlight ?? undefined}
                      />
                    </S.DropdownTriggerValue>
                    <S.DropdownTriggerChevron>
                      <RiArrowDropDownLine size={16} />
                    </S.DropdownTriggerChevron>
                  </S.DropdownTriggerBtn>
                </Popover.Trigger>
                <Popover.Portal>
                  <S.DropdownPopoverContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className={classNames("select-content", theme, accent)}
                  >
                    <S.HighlightSwatchGrid>
                      {HIGHLIGHT_COLORS.map((c) => (
                        <S.HighlightSwatch
                          key={c.value}
                          type="button"
                          $color={c.value}
                          $active={
                            activeHighlight?.toLowerCase() ===
                            c.value.toLowerCase()
                          }
                          title={c.name}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applyHighlight(c.value);
                            setShowHighlightDropdown(false);
                          }}
                        />
                      ))}
                      <S.HighlightRemoveSwatch
                        type="button"
                        title="Remove highlight"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          applyHighlight(null);
                          setShowHighlightDropdown(false);
                        }}
                      />
                    </S.HighlightSwatchGrid>
                  </S.DropdownPopoverContent>
                </Popover.Portal>
              </Popover.Root>

              <S.Divider />

              {/* Alignment — Radix Popover */}
              <Popover.Root
                open={showAlignmentDropdown}
                onOpenChange={setShowAlignmentDropdown}
              >
                <Popover.Trigger asChild>
                  <S.DropdownTriggerBtn
                    onMouseDown={(e) => e.preventDefault()}
                    title="Text Alignment"
                  >
                    <S.DropdownTriggerValue>
                      {(() => {
                        const alignBtn = ALIGNMENT_BUTTONS.find(
                          (btn) => btn.id === activeAlign,
                        );
                        if (alignBtn) {
                          const Icon = alignBtn.icon;
                          return <Icon size={20} />;
                        }
                        return null;
                      })()}
                    </S.DropdownTriggerValue>
                    <S.DropdownTriggerChevron>
                      <RiArrowDropDownLine size={16} />
                    </S.DropdownTriggerChevron>
                  </S.DropdownTriggerBtn>
                </Popover.Trigger>
                <Popover.Portal>
                  <S.DropdownPopoverContent
                    side="bottom"
                    sideOffset={6}
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className={classNames("select-content", theme, accent)}
                    style={{
                      display: "grid",
                      gap: "0.375rem",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      minWidth: 180,
                      padding: "0.5rem",
                    }}
                  >
                    {ALIGNMENT_BUTTONS.map((btn) => {
                      const Icon = btn.icon;
                      return (
                        <S.AlignmentGridItem
                          key={btn.id}
                          type="button"
                          $selected={activeAlign === btn.id}
                          onClick={() => {
                            handleAlignClick(btn.id as AlignId, btn.command);
                            setShowAlignmentDropdown(false);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <Icon size={20} />
                        </S.AlignmentGridItem>
                      );
                    })}
                  </S.DropdownPopoverContent>
                </Popover.Portal>
              </Popover.Root>

              <S.Divider />

              {/* Lists */}
              <S.ToggleGroup type="multiple">
                {LIST_BUTTONS.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <S.ListOptionGroup key={btn.id}>
                      <S.ListOptionMain>
                        <S.ToggleItem
                          value={btn.id}
                          $active={activeLists[btn.id]}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            handleListToggle(
                              btn.command,
                              btn.id as "unordered" | "ordered",
                            )
                          }
                          title={btn.title}
                        >
                          <Icon size={20} />
                        </S.ToggleItem>
                      </S.ListOptionMain>

                      {btn.id === "unordered" && activeLists[btn.id] && (
                        <S.ListOptionSub>
                          <Popover.Root
                            open={showBulletDropdown}
                            onOpenChange={setShowBulletDropdown}
                          >
                            <Popover.Trigger asChild>
                              <S.ListSubTriggerBtn
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <S.DropdownTriggerValue>
                                  {UNORDERED_LIST_STYLES.find(
                                    (s) =>
                                      s.value === currentUnorderedListStyle,
                                  )?.label || "•"}
                                </S.DropdownTriggerValue>
                                <S.DropdownTriggerChevron>
                                  <RiArrowDropDownLine size={16} />
                                </S.DropdownTriggerChevron>
                              </S.ListSubTriggerBtn>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <S.DropdownPopoverContent
                                ref={bulletDropdownPanelRef}
                                side="bottom"
                                sideOffset={6}
                                align="start"
                                onOpenAutoFocus={(e) => e.preventDefault()}
                                onCloseAutoFocus={(e) => e.preventDefault()}
                                className={classNames(
                                  "select-content",
                                  theme,
                                  accent,
                                )}
                                style={{ maxHeight: 280, overflowY: "auto" }}
                              >
                                {Object.entries(BULLET_POINT_CATEGORIES).map(
                                  ([key, category]) => (
                                    <S.BulletCategoryGroup key={key}>
                                      <S.BulletCategoryTitle>
                                        {category.name}
                                      </S.BulletCategoryTitle>
                                      <S.BulletGrid>
                                        {category.symbols.map((symbol) => (
                                          <S.BulletGridItem
                                            key={symbol.value}
                                            type="button"
                                            data-value={symbol.value}
                                            $selected={
                                              currentUnorderedListStyle ===
                                              symbol.value
                                            }
                                            onClick={() => {
                                              handleUnorderedListStyleChange(
                                                symbol.value,
                                              );
                                              setShowBulletDropdown(false);
                                            }}
                                            onMouseDown={(e) =>
                                              e.preventDefault()
                                            }
                                            title={symbol.label}
                                          >
                                            {symbol.label}
                                          </S.BulletGridItem>
                                        ))}
                                      </S.BulletGrid>
                                    </S.BulletCategoryGroup>
                                  ),
                                )}
                              </S.DropdownPopoverContent>
                            </Popover.Portal>
                          </Popover.Root>
                        </S.ListOptionSub>
                      )}

                      {btn.id === "ordered" && activeLists[btn.id] && (
                        <S.ListOptionSub>
                          <Popover.Root
                            open={showOrderedDropdown}
                            onOpenChange={setShowOrderedDropdown}
                          >
                            <Popover.Trigger asChild>
                              <S.ListSubTriggerBtn
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <S.DropdownTriggerValue
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {ORDERED_LIST_STYLES.find(
                                    (s) => s.value === currentOrderedListStyle,
                                  )?.label || "1"}
                                </S.DropdownTriggerValue>
                                <S.DropdownTriggerChevron>
                                  <RiArrowDropDownLine size={16} />
                                </S.DropdownTriggerChevron>
                              </S.ListSubTriggerBtn>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <S.DropdownPopoverContent
                                side="bottom"
                                sideOffset={6}
                                align="start"
                                onOpenAutoFocus={(e) => e.preventDefault()}
                                onCloseAutoFocus={(e) => e.preventDefault()}
                                className={classNames(
                                  "select-content",
                                  theme,
                                  accent,
                                )}
                                style={{
                                  minWidth: "8rem",
                                  padding: "0.375rem",
                                }}
                              >
                                {ORDERED_LIST_STYLES.map((item) => (
                                  <S.OrderedListDropdownItem
                                    key={item.value}
                                    type="button"
                                    $selected={
                                      currentOrderedListStyle === item.value
                                    }
                                    onClick={() => {
                                      handleOrderedListStyleChange(item.value);
                                      setShowOrderedDropdown(false);
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                  >
                                    {item.label}
                                  </S.OrderedListDropdownItem>
                                ))}
                              </S.DropdownPopoverContent>
                            </Popover.Portal>
                          </Popover.Root>
                        </S.ListOptionSub>
                      )}
                    </S.ListOptionGroup>
                  );
                })}
              </S.ToggleGroup>

              <S.Divider />

              {/* Quotation — Radix Popover */}
              <Popover.Root
                open={showQuotationDropdown}
                onOpenChange={setShowQuotationDropdown}
              >
                <Popover.Trigger asChild>
                  <S.DropdownTriggerBtn
                    onMouseDown={(e) => e.preventDefault()}
                    title="Insert quotation mark"
                  >
                    <S.DropdownTriggerValue>
                      <RiDoubleQuotesL size={22} />
                    </S.DropdownTriggerValue>
                    <S.DropdownTriggerChevron>
                      <RiArrowDropDownLine size={16} />
                    </S.DropdownTriggerChevron>
                  </S.DropdownTriggerBtn>
                </Popover.Trigger>
                <Popover.Portal>
                  <S.DropdownPopoverContent
                    ref={quotationDropdownPanelRef}
                    side="bottom"
                    sideOffset={6}
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className={classNames("select-content", theme, accent)}
                    style={{
                      maxHeight: 280,
                      maxWidth: "min(20rem, calc(100vw - 1.5rem))",
                      overflowY: "auto",
                    }}
                  >
                    {Object.entries(QUOTATION_MARK_CATEGORIES).map(
                      ([key, category]) => (
                        <S.QuotationCategoryGroup key={key}>
                          <S.QuotationCategoryTitle>
                            {category.name}
                          </S.QuotationCategoryTitle>
                          <S.QuotationGrid>
                            {category.symbols.map((symbol) => (
                              <S.QuotationGridItem
                                key={symbol.id}
                                type="button"
                                onClick={() => {
                                  handleQuotationMarkInsert(symbol.value || "");
                                  setShowQuotationDropdown(false);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                title={symbol.id}
                              >
                                {symbol.label}
                              </S.QuotationGridItem>
                            ))}
                          </S.QuotationGrid>
                        </S.QuotationCategoryGroup>
                      ),
                    )}
                  </S.DropdownPopoverContent>
                </Popover.Portal>
              </Popover.Root>
            </S.ToolbarSection>
          </S.ToolbarRoot>

          {showScrollOverlayLeft && (
            <S.ToolbarScrollOverlayLeft>
              <S.ToolbarScrollBtnLeft
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleScrollLeft}
                title="Scroll toolbar left"
              >
                <RiArrowLeftSLine size={18} />
              </S.ToolbarScrollBtnLeft>
            </S.ToolbarScrollOverlayLeft>
          )}
          {showScrollOverlay && (
            <S.ToolbarScrollOverlay>
              <S.ToolbarScrollBtn
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleScrollRight}
                title="Scroll toolbar right"
              >
                <RiArrowRightSLine size={18} />
              </S.ToolbarScrollBtn>
            </S.ToolbarScrollOverlay>
          )}
        </S.ToolbarWrapper>

        <S.EditorWrapper $fullPage={fullPage}>
          <S.EditorContent
            ref={editorRef}
            contentEditable
            $dropdownOpen={
              showBulletDropdown ||
              showQuotationDropdown ||
              showAlignmentDropdown ||
              showOrderedDropdown ||
              showFontDropdown ||
              showFontSizeDropdown
            }
            $fullPage={fullPage}
            $compact={compact}
            onClick={handleEditorClick}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={(e) => {
              // Sync toolbar after Ctrl+B/I/U keyboard shortcuts
              if (e.ctrlKey || e.metaKey) {
                requestAnimationFrame(() => updateActiveStyles());
              }
            }}
            onPaste={handlePaste}
            data-placeholder={placeholder}
          />

          {showMentionPopover && (
            <MentionDropdown
              items={mentionItems}
              focusedIndex={focusedItemIndex}
              isLoading={isMentionLoading}
              onSelect={insertMention}
              className={classNames("select-content", theme, accent)}
              style={{
                bottom: mentionPosition.bottom,
                left: mentionPosition.left,
                top: "auto",
              }}
            />
          )}

          {selectedImage && imageResizeBarPos && (
            <S.ImageResizeBar
              ref={imageResizeBarRef}
              style={{
                top: imageResizeBarPos.top,
              }}
            >
              <S.ImageDeleteButton
                type="button"
                title="Remove image"
                aria-label="Remove image"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const src = selectedImage.src;
                  setSelectedImage(null);
                  setImageResizeBarPos(null);
                  removeImageBySrc(src);
                }}
              >
                <RiDeleteBin6Line size={15} />
              </S.ImageDeleteButton>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={imageResizePct}
                onChange={(e) =>
                  handleImageResizeChange(Number(e.target.value))
                }
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  accentColor: "var(--accent)",
                  cursor: "pointer",
                  flex: 1,
                  minWidth: 0,
                }}
              />
              <S.ImageResizeLabel>{imageResizePct}%</S.ImageResizeLabel>
              <S.ImageAcceptButton
                type="button"
                title="Accept size"
                aria-label="Accept size"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const imageBlock = selectedImage.closest(
                    ".inline-image-container",
                  )?.parentElement;
                  const afterBlock =
                    imageBlock?.nextElementSibling as HTMLElement | null;
                  setSelectedImage(null);
                  setImageResizeBarPos(null);
                  if (afterBlock) {
                    const range = document.createRange();
                    range.setStart(afterBlock, 0);
                    range.collapse(true);
                    const sel = window.getSelection();
                    if (sel) {
                      sel.removeAllRanges();
                      sel.addRange(range);
                    }
                  }
                  editorRef.current?.focus();
                }}
              >
                <RiCheckLine size={15} />
              </S.ImageAcceptButton>
            </S.ImageResizeBar>
          )}
        </S.EditorWrapper>

        {/* <S.SaveButtonWrapper>
        <S.SaveButton type="button" onClick={handleSave}>
          <TbZoomPan size={20} />
          Open in full screen
        </S.SaveButton>
      </S.SaveButtonWrapper> */}
      </S.Container>
    );
  },
);
