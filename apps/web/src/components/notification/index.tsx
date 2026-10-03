"use client";

import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { NoNotificationsArt } from "../book-art";
import { LoadMore } from "../load-more/page";
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

      {notifications?.map((request) => (
        <NotificationBox key={request.id} notification={request} />
      ))}

      {notifications?.length === 0 && (
        <S.EmptyState>
          <NoNotificationsArt />
          <S.EmptyStateTitle>No notifications yet</S.EmptyStateTitle>
          <S.EmptyStateBody>
            Friend requests, replies and reactions will show up here.
          </S.EmptyStateBody>
        </S.EmptyState>
      )}

      <LoadMore
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </S.ListRoot>
  );
};
