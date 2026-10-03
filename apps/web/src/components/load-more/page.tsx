// components/load-more.tsx
"use client";

import { EndOfList } from "../end-of-list";
import { Spinner } from "../mention-dropdown/styled";
import * as S from "./styles";

interface LoadMoreProps {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  unreadCount?: number;
  /** When true and there's nothing more to load, render the end-of-list
   *  marker instead of nothing. Pass true only once the list has content
   *  (e.g. `items.length > 0`) so the marker never shows for an empty list. */
  endMarker?: boolean;
}

export const LoadMore = ({
  hasMore,
  loadingMore,
  onLoadMore,
  unreadCount,
  endMarker,
}: LoadMoreProps) => {
  if (!hasMore) return endMarker ? <EndOfList /> : null;

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
