"use client";

import { type FC, useEffect, useMemo, useState } from "react";
import type { GifItem } from "@/pages/api/klipy-gifs";
import * as S from "./styled";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}
const GIF_COLUMNS = 3;

const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export const GifPicker: FC<GifPickerProps> = ({ onSelect }) => {
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

  const groupedGifs = useMemo(() => {
    if (gifItems.length === 0) return [];
    const gifsPerColumn = Math.ceil(gifItems.length / GIF_COLUMNS);
    const grouped: GifItem[][] = [];
    for (let i = 0; i < gifItems.length; i += gifsPerColumn) {
      grouped.push(gifItems.slice(i, i + gifsPerColumn));
    }
    return grouped;
  }, [gifItems]);

  return (
    <S.PickerBody>
      <S.SearchRow>
        <S.SearchInput
          autoFocus
          type="text"
          placeholder="Search GIFs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </S.SearchRow>

      <S.GridOuterScroller>
        {loading ? (
          <S.StatusText>Loading...</S.StatusText>
        ) : groupedGifs.length === 0 ? (
          <S.StatusText>No GIFs found</S.StatusText>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <div style={{ display: "flex" }}>
              {groupedGifs.map((gifcolumn) => (
                <S.GifGrid key={gifcolumn[0].id}>
                  {gifcolumn.map((gif) => (
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
              ))}
            </div>
            {hasMore && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "12px 8px 8px",
                }}
              >
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--bg-6)",
                    borderRadius: "8px",
                    color: "var(--text)",
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    opacity: loadingMore ? 0.7 : 1,
                    padding: "8px 12px",
                  }}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </S.GridOuterScroller>
    </S.PickerBody>
  );
};
