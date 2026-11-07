"use client";

import type { MentionDataItem } from "@nw/types";
import type React from "react";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styled";

/** Anything with a viewport rect, e.g. the `Range` around the typed "@". */
export interface MentionAnchor {
  getBoundingClientRect(): DOMRect;
}

export interface MentionDropdownProps {
  items: MentionDataItem[];
  focusedIndex: number;
  isLoading?: boolean;
  onSelect: (item: MentionDataItem) => void;
  onHover?: (index: number) => void;
  emptyMessage?: string;
  /**
   * When given, the dropdown is portaled to `<body>` and placed in viewport
   * coordinates next to the anchor, so no clipping or scaled ancestor of the
   * editor can cut it off. Without it, it lays out where it is rendered and
   * the caller positions it through `style`.
   */
  anchor?: MentionAnchor | null;
  style?: React.CSSProperties;
  className?: string;
}

const SECTION_LABEL: Record<MentionDataItem["type"], string> = {
  MUSE: "Muses",
  NOVELIST: "Novelists",
};

const GUTTER = 8;
const GAP = 6;
/** Mirrors `max-height` in styled.ts. */
const MAX_HEIGHT = 15 * 16;

type Placement = {
  left: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  items,
  focusedIndex,
  isLoading,
  onSelect,
  onHover,
  emptyMessage = "No results found",
  anchor,
  style,
  className,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Placement | null>(null);

  // Above the "@" when the list fits there (or there is more room above),
  // else below it. Height is capped to the room on the chosen side and the
  // left edge is clamped to the viewport, so the list never leaves the screen.
  // The visual viewport is the bound: on mobile it excludes the keyboard.
  const place = useCallback(() => {
    const el = listRef.current;
    if (!anchor || !el) return;
    const rect = anchor.getBoundingClientRect();
    const vv = window.visualViewport;
    const visibleTop = vv ? vv.offsetTop : 0;
    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const visibleRight = vv ? vv.offsetLeft + vv.width : window.innerWidth;

    const wanted = Math.min(MAX_HEIGHT, el.scrollHeight);
    const roomAbove = rect.top - GAP - visibleTop - GUTTER;
    const roomBelow = visibleBottom - GUTTER - rect.bottom - GAP;
    const left = Math.max(
      GUTTER,
      Math.min(rect.left, visibleRight - el.offsetWidth - GUTTER),
    );

    setPos(
      roomAbove >= wanted || roomAbove >= roomBelow
        ? {
            bottom: window.innerHeight - rect.top + GAP,
            left,
            maxHeight: Math.max(0, roomAbove),
          }
        : {
            left,
            maxHeight: Math.max(0, roomBelow),
            top: rect.bottom + GAP,
          },
    );
  }, [anchor]);

  // Re-place when the anchor moves to a new "@" or the content (and so the
  // wanted height) changes.
  useLayoutEffect(() => {
    place();
  }, [place, items, isLoading]);

  useEffect(() => {
    if (!anchor) return;
    const vv = window.visualViewport;
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    vv?.addEventListener("resize", place);
    vv?.addEventListener("scroll", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
      vv?.removeEventListener("resize", place);
      vv?.removeEventListener("scroll", place);
    };
  }, [anchor, place]);

  // Keep the keyboard-focused row visible while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  const dropdown = (
    <S.Dropdown
      ref={listRef}
      role="listbox"
      aria-label="Mention suggestions"
      data-mention-dropdown=""
      style={
        anchor
          ? {
              ...style,
              bottom: pos?.bottom,
              left: pos?.left ?? 0,
              maxHeight: pos ? Math.min(MAX_HEIGHT, pos.maxHeight) : undefined,
              position: "fixed",
              top: pos?.top,
              visibility: pos ? "visible" : "hidden",
            }
          : style
      }
      className={className}
    >
      {isLoading ? (
        <S.LoadingWrapper>
          <S.Spinner />
        </S.LoadingWrapper>
      ) : items.length > 0 ? (
        items.map((item, index) => (
          // A label wherever the type changes. Items are never reordered, so
          // `focusedIndex` (owned by the editor's arrow-key handling) still
          // lines up with what is on screen.
          <Fragment key={`${item.type}-${item.id}`}>
            {item.type !== items[index - 1]?.type && (
              <S.SectionLabel aria-hidden>
                {SECTION_LABEL[item.type]}
              </S.SectionLabel>
            )}
            <S.Item
              type="button"
              role="option"
              aria-selected={index === focusedIndex}
              data-index={index}
              $focused={index === focusedIndex}
              onMouseEnter={() => onHover?.(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
            >
              <AvatarNew src={item.image} alt={item.displayName} />
              <S.Name>{item.displayName}</S.Name>
              {item.type === "MUSE" && item.pennedBy && (
                <S.Meta>by {item.pennedBy.username}</S.Meta>
              )}
            </S.Item>
          </Fragment>
        ))
      ) : (
        <S.Empty>{emptyMessage}</S.Empty>
      )}
    </S.Dropdown>
  );

  return anchor ? createPortal(dropdown, document.body) : dropdown;
};
