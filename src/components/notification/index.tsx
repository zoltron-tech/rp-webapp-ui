"use client";

import { Separator } from "radix-ui";
import type { FC, HTMLProps } from "react";
import { StoreProvider } from "@/context/store/context";
import type { NovelistWorldNotification } from "@/types";
import { NotificationBox } from "./notificaction-box";
import { NotificationHeader } from "./notification-header";
import * as S from "./styled";

type NotificationProps = HTMLProps<HTMLElement> & {
  notifications: NovelistWorldNotification[] | null;
};

export const NotificcationsList: FC<NotificationProps> = ({
  notifications,
}) => {
  return (
    <StoreProvider storeId="global-store" initial={{ ...notifications }}>
      <S.ListRoot>
        <NotificationHeader />
        <Separator.Root className="separator" orientation="horizontal" />
        {notifications?.map((request) => (
          <NotificationBox
            key={request.id}
            notification={request}
          ></NotificationBox>
        ))}
      </S.ListRoot>
    </StoreProvider>
  );
};
