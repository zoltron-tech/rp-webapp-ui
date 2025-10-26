"use client";

import { Separator } from "radix-ui";
import { useGlobalState } from "@/context/store/stores";
import { NotificationBox } from "./notificaction-box";
import { NotificationHeader } from "./notification-header";
import * as S from "./styled";

export const NotificcationsList = () => {
  const notifications = useGlobalState("notifications");

  return (
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
  );
};
