"use client";

import classNames from "classnames";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

export { AppDropdownMenuMobile } from "./mobile";
export { AppDropdownMenuResponsive } from "./responsive";

type Variant = "bordered" | "minimal";

interface DropdownItem {
  label?: string;
  onClick?: () => void;
  variant?: "default" | "positive" | "danger";
  separator?: boolean;
  icon?: React.ReactNode;
}

interface AppDropdownMenuProps {
  items: DropdownItem[];
  trigger: React.ReactNode;
  showUnread?: boolean;
  variant?: Variant;
  headerContent?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AppDropdownMenu = ({
  items,
  trigger,
  showUnread,
  variant = "minimal",
  headerContent,
  open: controlledOpen,
  onOpenChange,
  ...rest
}: AppDropdownMenuProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <S.TriggerWrapper>
          <S.TriggerButton className={classNames([variant])}>
            {trigger}
          </S.TriggerButton>
          {showUnread && <S.ActionBadge />}
        </S.TriggerWrapper>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <S.Content
          side="bottom"
          align="end"
          className={classNames([accent, theme])}
        >
          {headerContent ? (
            <S.HeaderRow
              onClick={() => setOpen(false)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {headerContent}
            </S.HeaderRow>
          ) : null}
          {items.map((item, i) =>
            item.separator ? (
              <S.Separator key={`sep-${i}`} />
            ) : (
              <S.Item
                key={i}
                onClick={item.onClick}
                data-variant={item.variant || "default"}
              >
                {item.icon && <S.ItemIcon>{item.icon}</S.ItemIcon>}
                {item.label}
              </S.Item>
            ),
          )}
        </S.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
