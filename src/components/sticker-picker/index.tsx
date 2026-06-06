"use client";

import { type FC, useEffect, useState } from "react";
import type { StickerItem } from "@/pages/api/klipy-stickers";
import * as S from "./styled";

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
  /** Autofocus the search input. Disable inside the mobile tray so the
   *  soft keyboard doesn't reopen. Defaults to true. */
  autoFocus?: boolean;
  /** Stretch to fill the parent height (tray) instead of the fixed dialog
   *  height. Defaults to false. */
  fill?: boolean;
}

const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export const StickerPicker: FC<StickerPickerProps> = ({
  onSelect,
  autoFocus = true,
  fill = false,
}) => {
  const [query, setQuery] = useState("");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);

    const params = debouncedQuery.trim()
      ? `?q=${encodeURIComponent(debouncedQuery.trim())}&limit=30&page=1`
      : `?limit=30&page=1`;

    fetch(`/api/klipy-stickers${params}`)
      .then((r) => r.json())
      .then((data: { hasNext?: boolean; items: StickerItem[] }) => {
        if (!cancelled) {
          setStickers(data.items ?? []);
          setHasMore(Boolean(data.hasNext));
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
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    const params = debouncedQuery.trim()
      ? `?q=${encodeURIComponent(debouncedQuery.trim())}&limit=30&page=${nextPage}`
      : `?limit=30&page=${nextPage}`;

    try {
      const response = await fetch(`/api/klipy-stickers${params}`);
      const data = (await response.json()) as {
        hasNext?: boolean;
        items: StickerItem[];
      };
      setStickers((prev) => [...prev, ...(data.items ?? [])]);
      setHasMore(Boolean(data.hasNext));
      setPage(nextPage);
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
          placeholder="Search stickers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </S.SearchRow>

      <S.GridScroller>
        {loading ? (
          <S.StatusText>Loading...</S.StatusText>
        ) : stickers.length === 0 ? (
          <S.StatusText>No stickers found</S.StatusText>
        ) : (
          <>
            <S.Grid>
              {stickers.map((sticker) => (
                <S.StickerCell
                  key={sticker.id}
                  type="button"
                  title={sticker.title}
                  onClick={() => onSelect(sticker.stickerUrl)}
                >
                  <S.StickerThumb
                    src={sticker.previewUrl}
                    alt={sticker.title}
                    loading="lazy"
                  />
                </S.StickerCell>
              ))}
            </S.Grid>
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
          </>
        )}
      </S.GridScroller>
    </S.PickerBody>
  );
};
