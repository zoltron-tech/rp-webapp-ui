"use client";

import { Separator } from "radix-ui";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { LoadMore } from "../load-more/page";
import { Spinner } from "../rich-text-editor-input/styled";
import { NotificationBox } from "./notificaction-box";
import { NotificationHeader } from "./notification-header";
import * as S from "./styled";

interface Props {
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}

export const NotificcationsList = ({
  hasMore,
  loadingMore,
  loadMore,
}: Props) => {
  const { stopPageLoading } = usePageRouter();
  const notifications = useGlobalState("notifications");

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.ListRoot>
      <NotificationHeader />
      <Separator.Root className="separator" orientation="horizontal" />

      {notifications?.map((request) => (
        <NotificationBox key={request.id} notification={request} />
      ))}

      <LoadMore
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </S.ListRoot>
  );
};
