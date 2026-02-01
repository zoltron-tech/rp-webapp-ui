"use client";

import classNames from "classnames";
import { Popover, Tabs } from "radix-ui";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { TbZoomPan } from "react-icons/tb";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, MentionTab } from "@/types";
import { AvatarNew } from "../common/avatar-new";
import {
  ALIGNMENT_BUTTONS,
  DEFAULT_FONT,
  FONTS,
  FORMAT_BUTTONS,
} from "./editor-config";
import * as S from "./styled";

interface RichTextEditorProps {
  placeholder: string;
  value?: string;
  mentionTabs?: MentionTab[];
  onChange: (value: string) => void;
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
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const [mentionItems, setMentionItems] = useState<MentionDataItem[]>([]);
  const [isMentionLoading, setIsMentionLoading] = useState(false);

  const [currentFont, setCurrentFont] = useState<string>(DEFAULT_FONT);
  const [activeStyles, setActiveStyles] = useState<ActiveStyles>({});
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

  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);

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

  const getFontAtSelection = useCallback((): string => {
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
    return DEFAULT_FONT;
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

  const updateActiveStyles = useCallback(() => {
    const styles: ActiveStyles = {};
    FORMAT_BUTTONS.forEach((btn) => {
      styles[btn.id] = document.queryCommandState(btn.command);
    });
    setActiveStyles(styles);
    setActiveAlign(getAlignmentFromSelection());
    setCurrentFont(getFontAtSelection());
  }, [getAlignmentFromSelection, getFontAtSelection]);

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
      editorRef.current?.focus();
      restoreSelection();
      document.execCommand("fontName", false, fontName);
      setCurrentFont(fontName);
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
  }, [checkForMention, updateActiveStyles, onChange]);

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
    if (document.activeElement === editorRef.current) {
      saveSelection();
      updateActiveStyles();
    }
  }, [saveSelection, updateActiveStyles]);

  const handleSave = useCallback(() => {
    const editor = editorRef.current;

    if (!editor) return;
    const content = editor.innerHTML;

    if (content && content.trim() && content !== "<br>") {
      console.log(content);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

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
        <S.Divider />

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

        <S.ToggleGroup type="single" value={activeAlign}>
          {ALIGNMENT_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            return (
              <S.ToggleItem
                key={btn.id}
                value={btn.id}
                $active={activeAlign === btn.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAlignClick(btn.id as AlignId, btn.command)}
                title={btn.title}
              >
                <Icon size={20} />
              </S.ToggleItem>
            );
          })}
        </S.ToggleGroup>
      </S.ToolbarRoot>

      <S.EditorWrapper>
        <S.EditorContent
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
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
