"use client";

import classNames from "classnames";
import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styles";

type Props = {
  open: boolean;
  title: string;
  /**
   * Omit for a read-only sheet (e.g. a non-member inspecting something).
   * May return a Promise: the confirm button then spins and the sheet can't be
   * dismissed (or confirmed twice) until it settles.
   */
  onConfirm?: () => unknown;
  confirmDisabled?: boolean;
  onClose: () => void;
  /** Roomier on desktop — for editors with a rich-text field. */
  wide?: boolean;
  /** Extra circular actions, sat left of the close button — for a read-only
   *  sheet that offers its own verbs (edit, archive, delete). */
  headerActions?: ReactNode;
  /**
   * One size whatever the content: the sheet keeps the same height and width
   * whether it holds two lines or twenty, and only its body scrolls. Opt-in,
   * so the storyboard sheets keep sizing to their content.
   */
  fixed?: boolean;
  /** Pinned under the scrolling body — counts, hints, the sheet's own verbs. */
  footer?: ReactNode;
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
  fixed,
  footer,
  children,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const [pending, setPending] = useState(false);
  // Ref guards a double tap that lands before the pending re-render.
  const pendingRef = useRef(false);

  const requestClose = () => {
    if (pendingRef.current) return;
    onClose();
  };

  const handleConfirm = () => {
    if (pendingRef.current || confirmDisabled || !onConfirm) return;
    const result = onConfirm();
    if (!result || typeof (result as PromiseLike<unknown>).then !== "function") {
      return;
    }
    pendingRef.current = true;
    setPending(true);
    Promise.resolve(result)
      .catch((error) => {
        console.error("Sheet confirm failed", error);
      })
      .finally(() => {
        pendingRef.current = false;
        setPending(false);
      });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pendingRef.current) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={classNames(theme, accent)}>
      <S.SheetOverlay onClick={requestClose} />
      <S.Sheet
        role="dialog"
        aria-modal
        aria-label={title}
        $wide={wide}
        $fixed={fixed}
      >
        <S.SheetHeader>
          <S.SheetTitle>{title}</S.SheetTitle>
          {headerActions}
          <S.SheetActionButton
            type="button"
            aria-label="Cancel"
            title="Cancel"
            disabled={pending}
            onClick={requestClose}
          >
            <IoClose size={18} />
          </S.SheetActionButton>
          {onConfirm && (
            <S.SheetActionButton
              type="button"
              $variant="confirm"
              aria-label={pending ? "Saving" : "Save"}
              title="Save"
              // Busy keeps full colour (aria-disabled) so the spinner reads
              // as progress, not a greyed-out button.
              disabled={confirmDisabled && !pending}
              aria-disabled={pending || confirmDisabled}
              aria-busy={pending}
              onClick={handleConfirm}
            >
              {pending ? (
                <S.SheetSpinner aria-hidden />
              ) : (
                <IoCheckmark size={18} />
              )}
            </S.SheetActionButton>
          )}
        </S.SheetHeader>
        <S.SheetBody>{children}</S.SheetBody>
        {footer && <S.SheetFooter>{footer}</S.SheetFooter>}
      </S.Sheet>
    </div>,
    document.body,
  );
};
