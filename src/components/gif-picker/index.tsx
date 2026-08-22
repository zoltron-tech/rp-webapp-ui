"use client";

import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { type FC, useEffect, useState } from "react";
import type { GifItem } from "@/pages/api/klipy-gifs";
import * as S from "./styled";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  /** Autofocus the search input. Disable inside the mobile tray so the
   *  soft keyboard doesn't reopen. Defaults to true. */
  autoFocus?: boolean;
  /** Stretch to fill the parent height (tray) instead of the fixed dialog
   *  height. Defaults to false. */
  fill?: boolean;
}
export const GifPicker: FC<GifPickerProps> = ({
  onSelect,
  autoFocus = true,
  fill = false,
}) => {
  const [query, setQuery] = useState("");
  const [gifItems, setGifItems] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = debouncedQuery.trim()
      ? `?q=${encodeURIComponent(debouncedQuery.trim())}&limit=30`
      : `?limit=30`;

    fetch(`/api/klipy-gifs${params}`)
      .then((r) => r.json())
      .then((data: { items: GifItem[]; next?: string | null }) => {
        if (!cancelled) {
          setGifItems(data.items ?? []);
          setNextCursor(data.next ?? null);
          setHasMore(Boolean(data.next));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);

    const params = debouncedQuery.trim()
      ? `?q=${encodeURIComponent(debouncedQuery.trim())}&limit=30&pos=${encodeURIComponent(nextCursor)}`
      : `?limit=30&pos=${encodeURIComponent(nextCursor)}`;

    try {
      const response = await fetch(`/api/klipy-gifs${params}`);
      const data = (await response.json()) as {
        items: GifItem[];
        next?: string | null;
      };
      setGifItems((prev) => [...prev, ...(data.items ?? [])]);
      setNextCursor(data.next ?? null);
      setHasMore(Boolean(data.next));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <S.PickerBody $fill={fill}>
      <S.SearchRow>
        <S.SearchInput
          autoFocus={autoFocus}
          type="text"
          placeholder="Search GIFs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </S.SearchRow>

      <S.GridOuterScroller>
        {loading ? (
          <S.StatusText>Loading...</S.StatusText>
        ) : gifItems.length === 0 ? (
          <S.StatusText>No GIFs found</S.StatusText>
        ) : (
          <>
            <S.GifGrid>
              {gifItems.map((gif) => (
                <S.GifCell
                  key={gif.id}
                  type="button"
                  title={gif.title}
                  onClick={() => onSelect(gif.gifUrl)}
                >
                  <S.GifThumb
                    src={gif.previewUrl}
                    alt={gif.title}
                    loading="lazy"
                  />
                </S.GifCell>
              ))}
            </S.GifGrid>
            {hasMore && (
              <S.LoadMoreRow>
                <S.LoadMoreButton
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </S.LoadMoreButton>
              </S.LoadMoreRow>
            )}
          </>
        )}
      </S.GridOuterScroller>
    </S.PickerBody>
  );
};
