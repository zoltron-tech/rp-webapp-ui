"use client";

import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiGif } from "react-icons/hi2";
import { MdOutlineKeyboard, MdOutlineVideoLibrary } from "react-icons/md";
import { RiEmojiStickerLine } from "react-icons/ri";
import { ClipPicker } from "@/components/clip-picker";
import { GifPicker } from "@/components/gif-picker";
import { StickerPicker } from "@/components/sticker-picker";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

export type TrayTab = "gif" | "sticker" | "clip";

const TAB_META: Record<TrayTab, { label: string; icon: React.ReactNode }> = {
  clip: { icon: <MdOutlineVideoLibrary size={14} />, label: "Clips" },
  gif: { icon: <HiGif size={14} />, label: "GIF" },
  sticker: { icon: <RiEmojiStickerLine size={14} />, label: "Stickers" },
};

type MediaTrayProps = {
  /** Active tab, or null when the tray should be closed. */
  tab: TrayTab | null;
  /** Pills to display (order preserved). */
  tabs: TrayTab[];
  /** Captured soft-keyboard height; the tray matches it. */
  keyboardHeight: number;
  onTabChange: (tab: TrayTab) => void;
  /** Keyboard button — close the tray and bring the keyboard back. */
  onRequestKeyboard: () => void;
  onSelectGif?: (url: string) => void;
  onSelectSticker?: (url: string) => void;
  onSelectClip?: (url: string) => void;
  /** Fired when the tray expands to full-height / collapses back. Lets the
   *  composer hide itself while the sheet is expanded (Discord-style). */
  onExpandedChange?: (expanded: boolean) => void;
};

export function MediaTray({
  tab,
  tabs,
  keyboardHeight,
  onTabChange,
  onRequestKeyboard,
  onSelectGif,
  onSelectSticker,
  onSelectClip,
  onExpandedChange,
}: MediaTrayProps) {
  // Keep the tray (and its last content) mounted while it slides out.
  const [renderTab, setRenderTab] = useState<TrayTab | null>(tab);
  const [open, setOpen] = useState(false);
  // Full-height (expanded) vs. keyboard-height (collapsed) bottom-sheet state.
  const [expanded, setExpandedState] = useState(false);
  const expandedRef = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // The tray is portaled to <body>, outside `.page-container`, so it must carry
  // the theme/accent classes itself to inherit the design CSS variables.
  const theme = useGlobalState("theme");
  const accent = useGlobalState("accent");

  const setExpanded = (value: boolean) => {
    if (expandedRef.current === value) return;
    expandedRef.current = value;
    setExpandedState(value);
    onExpandedChange?.(value);
  };

  useEffect(() => {
    if (tab) {
      setRenderTab(tab);
      const raf = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(raf);
    }
    setOpen(false);
    setExpanded(false);
    const timer = setTimeout(() => setRenderTab(null), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Discord/Meta-style drag behaviour: while collapsed, the first upward swipe
  // expands the sheet (instead of scrolling the grid). While expanded, a
  // downward swipe once the grid is scrolled to the top collapses it again.
  useEffect(() => {
    const root = rootRef.current;
    if (renderTab === null || !root) return;

    let startY = 0;
    let scroller: HTMLElement | null = null;
    let handled = false;
    let active = false;

    const findScroller = (target: EventTarget | null): HTMLElement | null => {
      let el = target as HTMLElement | null;
      const boundary = bodyRef.current;
      while (el && el !== boundary && el !== root) {
        const oy = getComputedStyle(el).overflowY;
        if (
          (oy === "auto" || oy === "scroll") &&
          el.scrollHeight > el.clientHeight
        ) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      scroller = findScroller(e.target);
      handled = false;
      active = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active || handled) return;
      const dy = e.touches[0].clientY - startY;
      if (!expandedRef.current) {
        // Collapsed: block the inner scroll and expand on the first swipe up.
        if (dy < -6) {
          setExpanded(true);
          handled = true;
        }
        e.preventDefault();
      } else {
        // Expanded: collapse when pulling down at the very top of the grid.
        const atTop = (scroller?.scrollTop ?? 0) <= 0;
        if (atTop && dy > 24) {
          setExpanded(false);
          handled = true;
          e.preventDefault();
        }
      }
    };

    const onEnd = () => {
      active = false;
    };

    root.addEventListener("touchstart", onStart, { passive: true });
    root.addEventListener("touchmove", onMove, { passive: false });
    root.addEventListener("touchend", onEnd);
    root.addEventListener("touchcancel", onEnd);
    return () => {
      root.removeEventListener("touchstart", onStart);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTab]);

  if (renderTab === null || typeof document === "undefined") return null;

  return createPortal(
    <S.TrayRoot
      ref={rootRef}
      $open={open}
      $expanded={expanded}
      className={classNames(theme, accent)}
      style={{ ["--tray-height" as string]: `${keyboardHeight}px` }}
    >
      <S.TrayHeader>
        <S.TrayTabs>
          <S.TrayTabsIndicator
            $count={tabs.length}
            $index={Math.max(0, tabs.indexOf(renderTab))}
          />
          {tabs.map((t) => (
            <S.TrayTabPill
              key={t}
              type="button"
              $active={renderTab === t}
              // Prevent focus shifting to the pill (would close the tray on
              // some browsers) and keep the keyboard down.
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onTabChange(t)}
            >
              {TAB_META[t].icon}
              {TAB_META[t].label}
            </S.TrayTabPill>
          ))}
        </S.TrayTabs>
        <S.TrayKeyboardButton
          type="button"
          aria-label="Show keyboard"
          onPointerDown={(e) => e.preventDefault()}
          onClick={onRequestKeyboard}
        >
          <MdOutlineKeyboard size={20} />
        </S.TrayKeyboardButton>
      </S.TrayHeader>

      <S.TrayBody ref={bodyRef}>
        {renderTab === "gif" && onSelectGif && (
          <GifPicker fill autoFocus={false} onSelect={onSelectGif} />
        )}
        {renderTab === "sticker" && onSelectSticker && (
          <StickerPicker fill autoFocus={false} onSelect={onSelectSticker} />
        )}
        {renderTab === "clip" && onSelectClip && (
          <ClipPicker fill autoFocus={false} onSelect={onSelectClip} />
        )}
      </S.TrayBody>
    </S.TrayRoot>,
    document.body,
  );
}
