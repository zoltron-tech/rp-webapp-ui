"use client";

import classNames from "classnames";
import { AlertDialog } from "radix-ui";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

interface AlertProps {
  heading: string;
  text: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
}

export const AppAlertDialog = ({
  heading,
  text,
  open,
  onOpenChange,
  onConfirm,
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
              <S.CancelButton>Cancel</S.CancelButton>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <S.ActionButton onClick={onConfirm}>Confirm</S.ActionButton>
            </AlertDialog.Action>
          </S.Actions>
        </S.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
