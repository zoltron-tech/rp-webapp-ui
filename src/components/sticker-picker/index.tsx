"use client";

import { type FC, useEffect, useState } from "react";
import type { StickerItem } from "@/pages/api/klipy-stickers";
import * as S from "./styled";

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
}

const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export const StickerPicker: FC<StickerPickerProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = debouncedQuery.trim()
      ? `?q=${encodeURIComponent(debouncedQuery.trim())}&limit=30`
      : `?limit=30`;

    fetch(`/api/klipy-stickers${params}`)
      .then((r) => r.json())
      .then((data: { items: StickerItem[] }) => {
        if (!cancelled) {
          setStickers(data.items ?? []);
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
        )}
      </S.GridScroller>
    </S.PickerBody>
  );
};
