"use client";

import classNames from "classnames";
import { DropdownMenu } from "radix-ui";
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
}

export const AppDropdownMenu = ({
  items,
  trigger,
  showUnread,
  variant = "minimal",
  ...rest
}: AppDropdownMenuProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  return (
    <DropdownMenu.Root>
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
