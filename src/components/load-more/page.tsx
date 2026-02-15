// components/load-more.tsx
"use client";

import { Spinner } from "../rich-text-editor-input/styled";
import * as S from "./styles";

interface LoadMoreProps {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const LoadMore = ({
  hasMore,
  loadingMore,
  onLoadMore,
}: LoadMoreProps) => {
  if (!hasMore) return null;

  return (
    <S.LoadMoreContainer>
      {loadingMore ? (
        <Spinner size={24} />
      ) : (
        <S.LoadMoreButton onClick={onLoadMore}>Load more</S.LoadMoreButton>
      )}
    </S.LoadMoreContainer>
  );
};
