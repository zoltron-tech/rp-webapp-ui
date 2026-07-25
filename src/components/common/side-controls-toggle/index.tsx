"use client";

import { type FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuPanelRightClose, LuPanelRightOpen } from "react-icons/lu";
import * as S from "./styles";

type Props = {
  /** Whether the side controls (scroll buttons, bookmark FAB) are shown. */
  shown: boolean;
  onClick: () => void;
  /** Extra px pushed below the default top offset — clears a page's own
   *  sticky header, same as ScrollJumpButton's `topOffset`. */
  topOffset?: number;
};

/**
 * Mobile-only control that slides the reader's floating side buttons
 * (scroll-to-top/bottom, bookmark) in and out of view, so they don't crowd a
 * small screen while reading.
 */
export const SideControlsToggle: FC<Props> = ({
  shown,
  onClick,
  topOffset = 0,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const button = (
    <S.Toggle
      type="button"
      onClick={onClick}
      $topOffset={topOffset}
      aria-label={shown ? "Hide side controls" : "Show side controls"}
      title={shown ? "Hide side controls" : "Show side controls"}
    >
      {shown ? (
        <LuPanelRightClose size={17} />
      ) : (
        <LuPanelRightOpen size={17} />
      )}
    </S.Toggle>
  );

  // Portal into main.page-container so the theme/accent CSS variables (set
  // as classes on that element) are inherited correctly.
  const container =
    document.querySelector("main.page-container") ?? document.body;
  return createPortal(button, container);
};
