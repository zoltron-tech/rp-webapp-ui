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
};

export const ScrollJumpButton: FC<Props> = ({
  direction,
  onClick,
  label,
  visible = true,
  icon,
  position = "bottom",
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
