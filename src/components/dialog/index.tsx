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
  onConfirm?: () => void;
  actionButtonLabel?: string;
  showConfirm?: boolean;
  closeButtonText?: string;
  actionColor?: "negative" | "neutral";
  isConfirmDisabled?: boolean;
}

export const AppAlertDialog = ({
  heading,
  text,
  body,
  open,
  onOpenChange,
  onConfirm,
  actionButtonLabel = "Confirm",
  showConfirm = true,
  closeButtonText = "Cancel",
  actionColor = "negative",
  isConfirmDisabled = false,
}: AlertProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <S.Overlay />
        <S.Content className={classNames([accent, theme])}>
          <S.Title>{heading}</S.Title>

          {body ? (
            <div style={{ marginTop: "20px" }}>{body}</div>
          ) : (
            <S.Description>{text}</S.Description>
          )}

          <S.Actions>
            <AlertDialog.Cancel asChild>
              <S.CancelButton>{closeButtonText}</S.CancelButton>
            </AlertDialog.Cancel>

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
