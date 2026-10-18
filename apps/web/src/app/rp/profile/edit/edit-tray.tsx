"use client";

import classNames from "classnames";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { BsCheck, BsX } from "react-icons/bs";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

type EditTrayProps = {
  open: boolean;
  title: string;
  /** Accessible name for the confirm (tick) button. */
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  children: ReactNode;
};

/**
 * Mobile slide-up tray for the edit-profile forms and pickers: title plus
 * circular cancel / confirm buttons, body scrolling inside the sheet.
 */
export const EditTray: FC<EditTrayProps> = ({
  open,
  title,
  confirmLabel,
  onCancel,
  onConfirm,
  children,
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
          <S.NoteTrayTitle>{title}</S.NoteTrayTitle>
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
              aria-label={confirmLabel}
              onClick={onConfirm}
            >
              <BsCheck size={18} />
            </S.NoteTrayActionButton>
          </S.NoteTrayActions>
        </S.NoteTrayHeaderBar>
        <S.NoteTrayBody>{children}</S.NoteTrayBody>
      </S.NoteTraySheet>
    </>
  );
};
