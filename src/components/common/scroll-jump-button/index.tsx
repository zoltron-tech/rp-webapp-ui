"use client";

import { type FC, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import * as S from "./styles";

type Props = {
  direction: "up" | "down";
  onClick: () => void;
  /** When false the button fades out but stays mounted so the transition plays */
  visible?: boolean;
  /** Accessible label — defaults to "Scroll to top" / "Scroll to bottom" */
  label?: string;
  /** Overrides the default chevron glyph (e.g. a "+" to add). */
  icon?: ReactNode;
  /** Where the button is pinned. Defaults to "bottom". */
  position?: "top" | "bottom";
  /** Extra px pushed below the default top offset — for pages that stack
   *  their own sticky header under the app top bar. Ignored for "bottom". */
  topOffset?: number;
  /** Extra right/block margin on desktop only (ignored on mobile) — for
   *  pages that want the button pulled further in from the edge. */
  edgeOffset?: number;
  /** Extra px pushed below the default top offset, mobile only — for making
   *  room for a control stacked above it. Ignored for "bottom". */
  mobileTopOffset?: number;
  /** Slides the button out past the edge and disables it — a manual
   *  show/hide toggle, independent of the scroll-driven `visible` fade. */
  slideOut?: boolean;
};

export const ScrollJumpButton: FC<Props> = ({
  direction,
  onClick,
  label,
  visible = true,
  icon,
  position = "bottom",
  topOffset = 0,
  edgeOffset = 0,
  mobileTopOffset = 0,
  slideOut = false,
}) => {
  const defaultLabel =
    direction === "up" ? "Scroll to top" : "Scroll to bottom";

  // Render into document.body via a portal so position:fixed is always
  // relative to the viewport, regardless of any parent overflow/transform.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const button = (
    <S.Button
      type="button"
      onClick={onClick}
      aria-label={label ?? defaultLabel}
      $visible={visible}
      $position={position}
      $topOffset={topOffset}
      $edgeOffset={edgeOffset}
      $mobileTopOffset={mobileTopOffset}
      $slideOut={slideOut}
    >
      {icon ??
        (direction === "up" ? (
          <FaChevronUp size={18} />
        ) : (
          <FaChevronDown size={18} />
        ))}
    </S.Button>
  );

  if (!mounted) return null;
  // Portal into main.page-container so the theme/accent CSS variables
  // (set as classes on that element) are inherited correctly.
  const container =
    document.querySelector("main.page-container") ?? document.body;
  return createPortal(button, container);
};
