"use client";

import classNames from "classnames";
import { type FC, type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styles";

type Props = {
  open: boolean;
  title: string;
  /** Omit for a read-only sheet (e.g. a non-member inspecting something). */
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  onClose: () => void;
  /** Roomier on desktop — for editors with a rich-text field. */
  wide?: boolean;
  /** Extra circular actions, sat left of the close button — for a read-only
   *  sheet that offers its own verbs (edit, archive, delete). */
  headerActions?: ReactNode;
  children: ReactNode;
};

/**
 * The storyboard workspace's editing surface: a centred dialog on desktop, a
 * bottom-sheet tray on mobile — title on the left, circular cancel/confirm on
 * the right, matching the tray header pattern used elsewhere in the app.
 */
export const ResponsiveSheet: FC<Props> = ({
  open,
  title,
  onConfirm,
  confirmDisabled,
  onClose,
  wide,
  headerActions,
  children,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={classNames(theme, accent)}>
      <S.SheetOverlay onClick={onClose} />
      <S.Sheet role="dialog" aria-modal aria-label={title} $wide={wide}>
        <S.SheetHeader>
          <S.SheetTitle>{title}</S.SheetTitle>
          {headerActions}
          <S.SheetActionButton
            type="button"
            aria-label="Cancel"
            title="Cancel"
            onClick={onClose}
          >
            <IoClose size={18} />
          </S.SheetActionButton>
          {onConfirm && (
            <S.SheetActionButton
              type="button"
              $variant="confirm"
              aria-label="Save"
              title="Save"
              disabled={confirmDisabled}
              onClick={onConfirm}
            >
              <IoCheckmark size={18} />
            </S.SheetActionButton>
          )}
        </S.SheetHeader>
        <S.SheetBody>{children}</S.SheetBody>
      </S.Sheet>
    </div>,
    document.body,
  );
};
