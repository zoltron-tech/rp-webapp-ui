"use client";

import { Popover, Tabs } from "radix-ui";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RiArrowDropDownLine, RiDoubleQuotesL } from "react-icons/ri";
import type { MentionDataItem, MentionTab } from "@/types";
import { AvatarNew } from "../common/avatar-new";
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
}

interface Position {
  top: number;
  left: number;
}

type ActiveStyles = Record<string, boolean>;

export const RichTextEditor = ({
  placeholder = "",
  value,
  mentionTabs = [],
  onChange,
}: RichTextEditorProps) => {
  const [mentionItems, setMentionItems] = useState<MentionDataItem[]>([]);
  const [isMentionLoading, setIsMentionLoading] = useState(false);

  const [currentFont, setCurrentFont] = useState<string>(DEFAULT_FONT);
  const [currentFontSize, setCurrentFontSize] =
    useState<string>(DEFAULT_FONT_SIZE);
  const [activeStyles, setActiveStyles] = useState<ActiveStyles>({});
  const [activeLists, setActiveLists] = useState<ActiveStyles>({});
  const [currentUnorderedListStyle, setCurrentUnorderedListStyle] =
    useState<string>(DEFAULT_UNORDERED_LIST_STYLE);
  const [currentOrderedListStyle, setCurrentOrderedListStyle] =
    useState<string>(DEFAULT_ORDERED_LIST_STYLE);
  const [activeAlign, setActiveAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("left");

  const [showMentionPopover, setShowMentionPopover] = useState<boolean>(false);
  const [mentionSearch, setMentionSearch] = useState<string>("");
  const [mentionPosition, setMentionPosition] = useState<Position>({
    left: 0,
    top: 0,
  });
  const [selectedTab, setSelectedTab] = useState<string>(
    mentionTabs[0]?.id || "users",
  );
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(0);
  const [showBulletDropdown, setShowBulletDropdown] = useState<boolean>(false);
  const [showQuotationDropdown, setShowQuotationDropdown] =
    useState<boolean>(false);
  const [showAlignmentDropdown, setShowAlignmentDropdown] =
    useState<boolean>(false);
  const [showOrderedDropdown, setShowOrderedDropdown] =
    useState<boolean>(false);
  const [showFontDropdown, setShowFontDropdown] = useState<boolean>(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] =
    useState<boolean>(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const isApplyingTextStyleRef = useRef(false);
  const pendingFontRef = useRef<string | null>(null);
  const pendingFontSizeRef = useRef<string | null>(null);
  const unorderedListStyleRef = useRef<string>(DEFAULT_UNORDERED_LIST_STYLE);
  const orderedListStyleRef = useRef<string>(DEFAULT_ORDERED_LIST_STYLE);
  const bulletDropdownPanelRef = useRef<HTMLDivElement | null>(null);
  const quotationDropdownPanelRef = useRef<HTMLDivElement | null>(null);

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
    if (!showMentionPopover) return;

    const tab = mentionTabs.find((t) => t.id === selectedTab);
    if (!tab) return;

    let cancelled = false;

    const timeout = setTimeout(async () => {
      setIsMentionLoading(true);

      try {
        const items = await tab.getData(mentionSearch);
        if (!cancelled) {
          setMentionItems(items);
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
  }, [mentionSearch, selectedTab, showMentionPopover, mentionTabs]);

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
          const computedFont = window.getComputedStyle(
            element as Element,
          ).fontFamily;
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
          const inlineSize = (element as HTMLElement).style.fontSize?.trim();
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

    setCurrentFont((prev) => {
      if (isCollapsed && insideEditor && pendingFont) return pendingFont;
      if (selectedFont) return selectedFont;
      if (isCollapsed && insideEditor) return prev;
      return DEFAULT_FONT;
    });

    setCurrentFontSize((prev) => {
      if (isCollapsed && insideEditor && pendingFontSize)
        return pendingFontSize;
      if (selectedFontSize) return selectedFontSize;
      if (isCollapsed && insideEditor) return prev;
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
      restoreSelection();
      document.execCommand(command, false);
      updateActiveStyles();
    },
    [restoreSelection, updateActiveStyles],
  );

  const handleFormatClick = useCallback(
    (command: string) => {
      execCommand(command);
    },
    [execCommand],
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
      document.execCommand("fontName", false, fontName);
      pendingFontRef.current = fontName;
      setCurrentFont(fontName);
      saveSelection();
      requestAnimationFrame(() => {
        isApplyingTextStyleRef.current = false;
      });
    },
    [restoreSelection, saveSelection],
  );

  const handleFontSizeChange = useCallback(
    (fontSize: string) => {
      isApplyingTextStyleRef.current = true;
      editorRef.current?.focus();
      restoreSelection();
      document.execCommand("fontSize", false, "7");

      const editor = editorRef.current;
      if (editor) {
        const selection = window.getSelection();
        const range =
          selection && selection.rangeCount > 0
            ? selection.getRangeAt(0)
            : null;

        if (range) {
          editor.querySelectorAll('font[size="7"]').forEach((node) => {
            // Only adjust nodes that intersect with the current selection/range
            if (!range.intersectsNode(node)) {
              return;
            }
            const el = node as HTMLElement;
            el.removeAttribute("size");
            el.style.fontSize = fontSize;
          });
        }
      }

      pendingFontSizeRef.current = fontSize;
      setCurrentFontSize(fontSize);
      saveSelection();
      requestAnimationFrame(() => {
        isApplyingTextStyleRef.current = false;
      });
    },
    [restoreSelection, saveSelection],
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
        const editorRect = editorRef.current?.getBoundingClientRect();
        if (editorRect) {
          setMentionPosition({
            left: rect.left - editorRect.left,
            top: rect.bottom - editorRect.top + 8,
          });
        }

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

  const insertImageFromUrl = useCallback(
    (url: string) => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // Create image container
      const imgContainer = document.createElement("span");
      imgContainer.className = "inline-image-container";
      imgContainer.contentEditable = "false";

      // Create image element
      const img = document.createElement("img");
      img.src = url;
      img.className = "inline-image";
      img.alt = "Pasted image";

      imgContainer.appendChild(img);

      // Insert image at cursor position
      range.deleteContents();
      range.insertNode(imgContainer);

      // Add space after image
      const spaceNode = document.createTextNode(" ");
      imgContainer.parentNode?.insertBefore(
        spaceNode,
        imgContainer.nextSibling,
      );

      // Move cursor after the image
      const newRange = document.createRange();
      newRange.setStartAfter(spaceNode);
      newRange.setEndAfter(spaceNode);
      selection.removeAllRanges();
      selection.addRange(newRange);

      saveSelection();
      handleInput();
    },
    [saveSelection, handleInput],
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
          case "Tab": {
            e.preventDefault();
            const currentIndex = mentionTabs.findIndex(
              (t: any) => t.id === selectedTab,
            );
            const nextIndex = (currentIndex + 1) % mentionTabs.length;
            setSelectedTab((mentionTabs[nextIndex] as any).id);
            setFocusedItemIndex(0);
            return;
          }
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
    },
    [
      showMentionPopover,
      // getCurrentTabData,
      selectedTab,
      focusedItemIndex,
      insertMention,
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
    <S.Container>
      <S.ToolbarRoot>
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
              <S.DropdownTriggerValue
                style={{
                  fontFamily: currentFont,
                  fontSize: "0.9rem",
                  maxWidth: "7rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentFont}
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
              style={{ maxHeight: 280, minWidth: "10rem", overflowY: "auto" }}
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
                {FONT_SIZES.find((s) => s.value === currentFontSize)?.label ||
                  currentFontSize}
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
                                (s) => s.value === currentUnorderedListStyle,
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
                                        onMouseDown={(e) => e.preventDefault()}
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
                            style={{ minWidth: "8rem", padding: "0.375rem" }}
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

      <S.EditorWrapper>
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
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          data-placeholder={placeholder}
        />

        <Popover.Root
          open={showMentionPopover}
          onOpenChange={setShowMentionPopover}
        >
          <S.PopoverAnchor
            style={{
              height: 1,
              left: mentionPosition.left,
              top: mentionPosition.top,
              width: 1,
            }}
          />
          <Popover.Portal>
            <S.PopoverContent
              sideOffset={5}
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Tabs.Root
                value={selectedTab}
                onValueChange={(val) => {
                  setSelectedTab(val);
                  setFocusedItemIndex(0);
                }}
              >
                <S.TabsList>
                  {mentionTabs.map((tab) => (
                    <S.TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </S.TabsTrigger>
                  ))}
                </S.TabsList>

                {mentionTabs.map((tab) => (
                  <S.TabsContent key={tab.id} value={tab.id}>
                    {isMentionLoading ? (
                      <S.LoadingWrapper>
                        <S.Spinner />
                      </S.LoadingWrapper>
                    ) : mentionItems.length > 0 ? (
                      mentionItems.map((item, index) => (
                        <S.MentionItem
                          key={item.id}
                          $focused={index === focusedItemIndex}
                          onClick={() => insertMention(item)}
                          datatype={item.type}
                        >
                          <AvatarNew src={item.image} alt={item.displayName} />
                          <S.MentionName>{item.displayName}</S.MentionName>
                        </S.MentionItem>
                      ))
                    ) : (
                      <S.EmptyMessage>
                        No {tab.label.toLowerCase()} found
                      </S.EmptyMessage>
                    )}
                  </S.TabsContent>
                ))}
              </Tabs.Root>
            </S.PopoverContent>
          </Popover.Portal>
        </Popover.Root>
      </S.EditorWrapper>

      {/* <S.SaveButtonWrapper>
        <S.SaveButton type="button" onClick={handleSave}>
          <TbZoomPan size={20} />
          Open in full screen
        </S.SaveButton>
      </S.SaveButtonWrapper> */}
    </S.Container>
  );
};
