"use client";

import { ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import { AlertDialog } from "radix-ui";
import type { ReactNode } from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

interface AlertProps {
  heading: ReactNode;
  text: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  actionButtonLabel?: string;
  showConfirm?: boolean;
  closeButtonText?: string;
}

export const AppAlertDialog = ({
  heading,
  text,
  open,
  onOpenChange,
  onConfirm,
  actionButtonLabel = "Confirm",
  showConfirm = true,
  closeButtonText = "Cancel",
}: AlertProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <S.Overlay />
        <S.Content className={classNames([accent, theme])}>
          <S.Title>{heading}</S.Title>
          <S.Description>{text}</S.Description>

          <S.Actions>
            <AlertDialog.Cancel asChild>
              <S.CancelButton>{closeButtonText}</S.CancelButton>
            </AlertDialog.Cancel>
            <ShouldRender if={showConfirm}>
              <AlertDialog.Action asChild>
                <S.ActionButton onClick={onConfirm}>
                  {actionButtonLabel}
                </S.ActionButton>
              </AlertDialog.Action>
            </ShouldRender>
          </S.Actions>
        </S.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
