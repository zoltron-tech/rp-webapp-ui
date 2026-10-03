"use client";

import { type FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaBookmark } from "react-icons/fa6";
import { LuBookmarkPlus } from "react-icons/lu";
import * as S from "./styles";

type Props = {
  /** Whether a bookmark already exists somewhere in this read. */
  hasBookmark: boolean;
  /** Save a bookmark at the reader's current position. */
  onSave: () => void;
  /** Jump back to the saved bookmark. */
  onGoToBookmark: () => void;
  /** Hide entirely (e.g. logged out, or paginated book mode). */
  visible?: boolean;
  /** Slides the control out past the edge and disables it — a manual
   *  show/hide toggle, independent of `visible`. */
  slideOut?: boolean;
};

/**
 * Always-reachable floating bookmark control for the scroll reader. Lives in
 * a fixed corner via portal, so — unlike a header icon — it never scrolls out
 * of reach on a long passage, mobile included.
 */
export const BookmarkFAB: FC<Props> = ({
  hasBookmark,
  onSave,
  onGoToBookmark,
  visible = true,
  slideOut = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 450);
    return () => clearTimeout(timer);
  }, [justSaved]);

  if (!mounted || !visible) return null;

  const button = (
    <S.Wrap $slideOut={slideOut}>
      {hasBookmark && (
        <S.ResumeChip
          type="button"
          onClick={onGoToBookmark}
          aria-label="Jump to your bookmark"
        >
          <FaBookmark size={11} />
          Resume
        </S.ResumeChip>
      )}
      <S.SaveButton
        type="button"
        $pulse={justSaved}
        onClick={() => {
          onSave();
          setJustSaved(true);
        }}
        aria-label="Bookmark your current spot"
        title="Bookmark your current spot"
      >
        <LuBookmarkPlus size={22} />
      </S.SaveButton>
    </S.Wrap>
  );

  // Portal into main.page-container so the theme/accent CSS variables (set
  // as classes on that element) are inherited correctly.
  const container =
    document.querySelector("main.page-container") ?? document.body;
  return createPortal(button, container);
};
