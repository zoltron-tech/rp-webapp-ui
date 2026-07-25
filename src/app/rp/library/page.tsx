"use client";

import { useCallback, useEffect, useState } from "react";
import { getRandomStories } from "@/app/rp/home/actions";
import { LoadMore } from "@/components/load-more/page";
import { StoryCard } from "@/components/story-card";
import { usePageRouter } from "@/hooks/use-page-router";
import type { StoryBoard } from "@/types";
import * as S from "./styles";

const PAGE_SIZE = 12;

export default function LibraryPage() {
  const { stopPageLoading } = usePageRouter();

  const [stories, setStories] = useState<StoryBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRandomStories(1, PAGE_SIZE).then((data) => {
      if (cancelled) return;
      const list = Array.isArray(data) ? data : [];
      setStories(list);
      setHasMore(list.length >= PAGE_SIZE);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await getRandomStories(nextPage, PAGE_SIZE);
    const list = Array.isArray(data) ? data : [];
    setStories((prev) => [...prev, ...list]);
    setHasMore(list.length >= PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, page]);

  return (
    <S.Container>
      <S.Header>
        <S.Title>Library</S.Title>
        <S.Subtitle>Browse every story on Novelist World</S.Subtitle>
      </S.Header>

      <S.Grid>
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <S.Shimmer key={i} />
            ))
          : stories.map((storyBoard) => (
              <StoryCard key={storyBoard.id} storyBoard={storyBoard} />
            ))}
      </S.Grid>

      {!loading && stories.length === 0 && (
        <S.Empty>No stories to show yet.</S.Empty>
      )}

      {!loading && stories.length > 0 && (
        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          endMarker
        />
      )}
    </S.Container>
  );
}
