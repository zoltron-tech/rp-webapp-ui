"use client";

import classNames from "classnames";
import { AlertDialog } from "radix-ui";
import { type ReactNode, useRef, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

interface AlertProps {
  heading: ReactNode;
  text: ReactNode;
  body?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  /**
   * May return a Promise: the confirm button then shows a spinner and the
   * dialog can't be dismissed until it settles.
   */
  onConfirm?: () => unknown;
  /**
   * Close the dialog (via `onOpenChange(false)`) once `onConfirm` finishes —
   * on success AND failure. Use for yes/no confirmations; leave off for forms
   * that must stay open when validation fails.
   */
  closeOnConfirm?: boolean;
  /** Show the confirm spinner for work the caller tracks itself. */
  isConfirmLoading?: boolean;
  actionButtonLabel?: string;
  showConfirm?: boolean;
  closeButtonText?: string;
  actionColor?: "negative" | "neutral";
  isConfirmDisabled?: boolean;
  isCancelHidden?: boolean;
  /** "lg" widens the dialog on mobile — use for content that needs more room, e.g. image crop viewports. */
  size?: "default" | "lg";
}

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  !!value && typeof (value as PromiseLike<unknown>).then === "function";

export const AppAlertDialog = ({
  heading,
  text,
  body,
  open,
  onOpenChange,
  onCancel,
  onConfirm,
  closeOnConfirm = false,
  isConfirmLoading = false,
  actionButtonLabel = "Confirm",
  showConfirm = true,
  closeButtonText = "Cancel",
  actionColor = "negative",
  isConfirmDisabled = false,
  isCancelHidden = false,
  size = "default",
}: AlertProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const [pending, setPending] = useState(false);
  // Ref guards double-clicks that land before the pending re-render.
  const pendingRef = useRef(false);
  const busy = pending || isConfirmLoading;

  const close = () => {
    if (closeOnConfirm) onOpenChange?.(false);
  };

  const handleConfirm = () => {
    if (pendingRef.current || isConfirmLoading || isConfirmDisabled) return;
    let result: unknown;
    try {
      result = onConfirm?.();
    } catch (error) {
      close();
      throw error;
    }
    if (!isThenable(result)) {
      close();
      return;
    }
    pendingRef.current = true;
    setPending(true);
    Promise.resolve(result)
      .catch((error) => {
        console.error("Dialog confirm failed", error);
      })
      .finally(() => {
        pendingRef.current = false;
        setPending(false);
        close();
      });
  };

  // No Escape / overlay / Cancel dismissal while the confirm is in flight.
  const handleOpenChange = (next: boolean) => {
    if (!next && (pendingRef.current || isConfirmLoading)) return;
    onOpenChange?.(next);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        {/* Radix portals render in document.body, but React synthetic events
            still bubble through the React tree — so clicks inside the dialog
            would reach the onClick of whatever rendered <AppAlertDialog>
            (e.g. a clickable muse card). Stop propagation here so dialog
            interactions never trigger the parent's click handler. */}
        <S.Overlay onClick={(e) => e.stopPropagation()} />
        <S.Content
          className={classNames([accent, theme])}
          $size={size}
          onClick={(e) => e.stopPropagation()}
          onOpenAutoFocus={(e) => {
            if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
              e.preventDefault();
            }
          }}
        >
          <S.Title>{heading}</S.Title>

          {body ? <S.Body>{body}</S.Body> : <S.Description>{text}</S.Description>}

          <S.Actions>
            {!isCancelHidden && (
              <AlertDialog.Cancel onClick={onCancel} asChild>
                <S.CancelButton disabled={busy}>{closeButtonText}</S.CancelButton>
              </AlertDialog.Cancel>
            )}

            {showConfirm && (
              <S.ActionButton
                type="button"
                onClick={handleConfirm}
                colorVariant={actionColor}
                // Busy keeps its colour (aria-disabled, not disabled) so the
                // spinner reads as progress rather than a greyed-out button.
                disabled={isConfirmDisabled && !busy}
                aria-disabled={busy || isConfirmDisabled}
                aria-busy={busy}
                $busy={busy}
              >
                {busy && <S.ButtonSpinner aria-hidden />}
                {actionButtonLabel}
              </S.ActionButton>
            )}
          </S.Actions>
        </S.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
