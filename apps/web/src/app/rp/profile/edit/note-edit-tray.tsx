"use client";

import classNames from "classnames";
import { type FC, useEffect, useState } from "react";
import { BsCheck, BsX } from "react-icons/bs";
import { useGlobalState } from "@/context/store/stores";
import { NoteDialogBody } from "./note-dialog-body";
import * as S from "./styled";

type NoteEditTrayProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  value: string;
  onChange: (value: string) => void;
  color: string | null;
  onColorChange: (color: string | null) => void;
  emoji: string | null;
  onEmojiChange: (emoji: string | null) => void;
};

export const NoteEditTray: FC<NoteEditTrayProps> = ({
  open,
  onCancel,
  onConfirm,
  ...bodyProps
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  // Keep tray rendered during close animation
  const [rendered, setRendered] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      setIsClosing(false);
    } else {
      // open went false — play slide-out if currently visible
      setIsClosing(true);
    }
  }, [open]);

  // Lock body scroll while tray is visible
  useEffect(() => {
    if (rendered) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [rendered]);

  if (!rendered) return null;

  const handleSheetAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (isClosing) {
      setRendered(false);
      setIsClosing(false);
    }
  };

  return (
    <>
      <S.NoteTrayOverlay
        $closing={isClosing}
        onClick={onCancel}
      />
      <S.NoteTraySheet
        $closing={isClosing}
        onAnimationEnd={handleSheetAnimationEnd}
        className={classNames([accent, theme])}
      >
        <S.NoteTrayHandle />
        <S.NoteTrayHeaderBar>
          <S.NoteTrayTitle>Edit your note</S.NoteTrayTitle>
          <S.NoteTrayActions>
            <S.NoteTrayActionButton
              type="button"
              $variant="cancel"
              aria-label="Cancel"
              onClick={onCancel}
            >
              <BsX size={18} />
            </S.NoteTrayActionButton>
            <S.NoteTrayActionButton
              type="button"
              $variant="confirm"
              aria-label="Save note"
              onClick={onConfirm}
            >
              <BsCheck size={18} />
            </S.NoteTrayActionButton>
          </S.NoteTrayActions>
        </S.NoteTrayHeaderBar>
        <S.NoteTrayBody>
          <NoteDialogBody {...bodyProps} />
        </S.NoteTrayBody>
      </S.NoteTraySheet>
    </>
  );
};
