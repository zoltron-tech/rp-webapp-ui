// components/load-more.tsx
"use client";

import { Spinner } from "../mention-dropdown/styled";
import * as S from "./styles";

interface LoadMoreProps {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  unreadCount?: number;
}

export const LoadMore = ({
  hasMore,
  loadingMore,
  onLoadMore,
  unreadCount,
}: LoadMoreProps) => {
  if (!hasMore) return null;

  return (
    <S.LoadMoreContainer>
      <S.LoadMoreButton onClick={onLoadMore} disabled={loadingMore}>
        {loadingMore ? <Spinner size={16} /> : "Load more..."}
        {!loadingMore && !!unreadCount && (
          <S.UnreadDot>{unreadCount > 99 ? "99+" : unreadCount}</S.UnreadDot>
        )}
      </S.LoadMoreButton>
    </S.LoadMoreContainer>
  );
};
