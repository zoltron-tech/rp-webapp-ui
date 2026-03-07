"use client";

import classNames from "classnames";
import { Popover, Tabs } from "radix-ui";
import type React from "react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, MentionTab } from "@/types";
import { AvatarNew } from "../common/avatar-new";
import { PromptEvent, useRunOn } from "../prompt-input/helpers";
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
  onClear,
}: RichTextEditorProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

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

  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const isApplyingTextStyleRef = useRef(false);
  const pendingFontRef = useRef<string | null>(null);
  const pendingFontSizeRef = useRef<string | null>(null);
  const unorderedListStyleRef = useRef<string>(DEFAULT_UNORDERED_LIST_STYLE);
  const orderedListStyleRef = useRef<string>(DEFAULT_ORDERED_LIST_STYLE);
  const bulletDropdownRef = useRef<HTMLDivElement | null>(null);
  const bulletDropdownPanelRef = useRef<HTMLDivElement | null>(null);
  const quotationDropdownRef = useRef<HTMLDivElement | null>(null);
  const quotationDropdownPanelRef = useRef<HTMLDivElement | null>(null);
  const alignmentDropdownRef = useRef<HTMLDivElement | null>(null);
  const alignmentDropdownPanelRef = useRef<HTMLDivElement | null>(null);

  // expose a clear function
  const clearEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      onChange("");
    }
    onClear?.();
  }, [onChange, onClear]);

  useRunOn([PromptEvent.Sent], clearEditor); // optional: auto clear on send

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
        editor.querySelectorAll('font[size="7"]').forEach((node) => {
          const el = node as HTMLElement;
          el.removeAttribute("size");
          el.style.fontSize = fontSize;
        });
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
        // Root mention container
        const mentionSpan = document.createElement("span");
        mentionSpan.className = "mention-tag";
        mentionSpan.contentEditable = "false";
        mentionSpan.dataset.type = item.type;
        mentionSpan.dataset.id = item.id;

        // Avatar
        const avatar = document.createElement("img");
        avatar.src = item.image;
        avatar.alt = item.displayName;
        avatar.className = "mention-avatar";

        // 🔥 Dynamic avatar URL based on type
        if (item.type === "NOVELIST") {
          avatar.src = `${process.env.RP_SERVICE_URL}/rp/portfolio/novelist/${item.id}/avatar`;
        } else if (item.type === "MUSE") {
          avatar.src = `${process.env.RP_SERVICE_URL}/rp/portfolio/muse/${item.id}/avatar`;
        }

        // Text
        const textSpan = document.createElement("span");
        textSpan.className = "mention-text";
        textSpan.textContent = item.displayName;

        mentionSpan.appendChild(avatar);
        mentionSpan.appendChild(textSpan);

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
              (t) => t.id === selectedTab,
            );
            const nextIndex = (currentIndex + 1) % mentionTabs.length;
            setSelectedTab(mentionTabs[nextIndex].id);
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

  // Handle click outside bullet dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bulletDropdownRef.current &&
        !bulletDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBulletDropdown(false);
      }
    };

    if (showBulletDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBulletDropdown]);

  // Scroll selected bullet into view when dropdown opens
  useEffect(() => {
    if (showBulletDropdown && bulletDropdownPanelRef.current) {
      // Find the selected button by value attribute
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

  // Handle click outside quotation dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        quotationDropdownRef.current &&
        !quotationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowQuotationDropdown(false);
      }
    };

    if (showQuotationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQuotationDropdown]);

  // Scroll to first quotation mark when dropdown opens
  useEffect(() => {
    if (showQuotationDropdown && quotationDropdownPanelRef.current) {
      // Scroll to first category
      const firstButton =
        quotationDropdownPanelRef.current.querySelector("button");
      if (firstButton) {
        firstButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [showQuotationDropdown]);

  // Handle click outside alignment dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        alignmentDropdownRef.current &&
        !alignmentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAlignmentDropdown(false);
      }
    };

    if (showAlignmentDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAlignmentDropdown]);

  return (
    <S.Container>
      <S.ToolbarRoot>
        <S.FontSelectRoot>
          <RiArrowDropDownLine className="font-select-dropdown-icon" />
          <S.FontSelect
            name="font-select"
            value={currentFont}
            onChange={(e) => handleFontChange(e.target.value)}
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </S.FontSelect>
        </S.FontSelectRoot>

        <S.FontSelectRoot>
          <RiArrowDropDownLine className="font-select-dropdown-icon" />
          <S.FontSelect
            name="font-size-select"
            value={currentFontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </S.FontSelect>
        </S.FontSelectRoot>

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

          {/* Alignment Selector Dropdown */}
          <S.AlignmentDropdownContainer ref={alignmentDropdownRef}>
            <S.FontSelectRoot>
              <RiArrowDropDownLine className="font-select-dropdown-icon" />
              <S.AlignmentSelectorButton
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAlignmentDropdown(!showAlignmentDropdown);
                }}
                onMouseDown={(e) => e.preventDefault()}
                title="Text Alignment"
              >
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
                <RiArrowDropDownLine />
              </S.AlignmentSelectorButton>
            </S.FontSelectRoot>

            {showAlignmentDropdown && (
              <S.AlignmentDropdownPanel ref={alignmentDropdownPanelRef}>
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
              </S.AlignmentDropdownPanel>
            )}
          </S.AlignmentDropdownContainer>

          <S.Divider />

          <S.ToggleGroup type="multiple">
            {LIST_BUTTONS.map((btn) => {
              const Icon = btn.icon;
              return (
                <Fragment key={btn.id}>
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

                  {btn.id === "unordered" && activeLists[btn.id] && (
                    <S.BulletDropdownContainer ref={bulletDropdownRef}>
                      <S.FontSelectRoot>
                        <RiArrowDropDownLine className="font-select-dropdown-icon" />
                        <S.BulletSelectorButton
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowBulletDropdown(!showBulletDropdown);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {UNORDERED_LIST_STYLES.find(
                            (s) => s.value === currentUnorderedListStyle,
                          )?.label || "•"}
                        </S.BulletSelectorButton>
                      </S.FontSelectRoot>

                      {showBulletDropdown && (
                        <S.BulletDropdownPanel ref={bulletDropdownPanelRef}>
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
                        </S.BulletDropdownPanel>
                      )}
                    </S.BulletDropdownContainer>
                  )}

                  {btn.id === "ordered" && activeLists[btn.id] && (
                    <S.FontSelectRoot>
                      <RiArrowDropDownLine className="font-select-dropdown-icon" />
                      <S.FontSelect
                        name="ordered-list-style-select"
                        value={currentOrderedListStyle}
                        onChange={(e) =>
                          handleOrderedListStyleChange(e.target.value)
                        }
                      >
                        {ORDERED_LIST_STYLES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </S.FontSelect>
                    </S.FontSelectRoot>
                  )}
                </Fragment>
              );
            })}
          </S.ToggleGroup>

          <S.Divider />

          {/* Quotation Mark Selector */}
          <S.QuotationDropdownContainer ref={quotationDropdownRef}>
            <S.FontSelectRoot>
              <RiArrowDropDownLine className="font-select-dropdown-icon" />
              <S.QuotationSelectorButton
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuotationDropdown(!showQuotationDropdown);
                }}
                onMouseDown={(e) => e.preventDefault()}
                title="Insert Quotation Mark"
              >
                "
              </S.QuotationSelectorButton>
            </S.FontSelectRoot>

            {showQuotationDropdown && (
              <S.QuotationDropdownPanel ref={quotationDropdownPanelRef}>
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
              </S.QuotationDropdownPanel>
            )}
          </S.QuotationDropdownContainer>
        </S.ToolbarSection>
      </S.ToolbarRoot>

      <S.EditorWrapper>
        <S.EditorContent
          ref={editorRef}
          contentEditable
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
              className={classNames([accent, theme])}
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
