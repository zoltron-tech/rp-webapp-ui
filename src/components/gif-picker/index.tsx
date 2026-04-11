"use client";

import { type FC, useEffect, useState } from "react";
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
  const [gifs, setGifs] = useState<GifItem[][]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = debouncedQuery.trim()
      ? `?q=${encodeURIComponent(debouncedQuery.trim())}&limit=30`
      : `?limit=30`;

    fetch(`/api/klipy-gifs${params}`)
      .then((r) => r.json())
      .then((data: { items: GifItem[] }) => {
        if (!cancelled) {
          const grouped = [];
          // fill row first, then column
          const gifsPerColumn = Math.ceil(data.items.length / GIF_COLUMNS);

          for (let i = 0; i < data.items.length; i += gifsPerColumn) {
            const group = data.items.slice(i, i + gifsPerColumn);
            grouped.push(group);
          }
          setGifs(grouped);

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
        ) : gifs.length === 0 ? (
          <S.StatusText>No GIFs found</S.StatusText>
        ) : (
          gifs.map((gifcolumn) => (
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
          ))
        )}
      </S.GridOuterScroller>
    </S.PickerBody>
  );
};
