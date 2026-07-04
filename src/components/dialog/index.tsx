"use client";

import classNames from "classnames";
import { AlertDialog } from "radix-ui";
import type { ReactNode } from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

interface AlertProps {
  heading: ReactNode;
  text: ReactNode;
  body?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  actionButtonLabel?: string;
  showConfirm?: boolean;
  closeButtonText?: string;
  actionColor?: "negative" | "neutral";
  isConfirmDisabled?: boolean;
  isCancelHidden?: boolean;
}

export const AppAlertDialog = ({
  heading,
  text,
  body,
  open,
  onOpenChange,
  onCancel,
  onConfirm,
  actionButtonLabel = "Confirm",
  showConfirm = true,
  closeButtonText = "Cancel",
  actionColor = "negative",
  isConfirmDisabled = false,
  isCancelHidden = false,
}: AlertProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <S.Overlay />
        <S.Content
          className={classNames([accent, theme])}
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
                <S.CancelButton>{closeButtonText}</S.CancelButton>
              </AlertDialog.Cancel>
            )}

            {showConfirm && (
              <S.ActionButton
                onClick={onConfirm}
                colorVariant={actionColor}
                disabled={isConfirmDisabled}
              >
                {actionButtonLabel}
              </S.ActionButton>
            )}
          </S.Actions>
        </S.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
