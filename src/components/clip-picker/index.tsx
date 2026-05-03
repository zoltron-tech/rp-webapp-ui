"use client";

import { type FC, useEffect, useState } from "react";
import { ChatVideoAttachment } from "@/components/common/chat-bubble";
import * as S from "@/components/sticker-picker/styled";
import type { ClipItem } from "@/pages/api/klipy-clips";

interface ClipPickerProps {
  onSelect: (clipUrl: string) => void;
}

const isVideoUrl = (url: string) =>
  /\.(mp4|webm|mov|m4v|ogv)(?:$|[?#])/i.test(url);

const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

export const ClipPicker: FC<ClipPickerProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [selectedClip, setSelectedClip] = useState<ClipItem | null>(null);
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

    fetch(`/api/klipy-clips${params}`)
      .then((r) => r.json())
      .then((data: { hasNext?: boolean; items: ClipItem[] }) => {
        if (!cancelled) {
          const nextClips = data.items ?? [];
          setClips(nextClips);
          setHasMore(Boolean(data.hasNext));
          setSelectedClip((prev) => {
            if (!prev) return null;
            return nextClips.find((clip) => clip.id === prev.id) ?? null;
          });
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
      const response = await fetch(`/api/klipy-clips${params}`);
      const data = (await response.json()) as {
        hasNext?: boolean;
        items: ClipItem[];
      };

      const nextItems = data.items ?? [];
      setClips((prev) => [...prev, ...nextItems]);
      setHasMore(Boolean(data.hasNext));
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <S.PickerBody>
      <S.SearchRow>
        <S.SearchInput
          autoFocus
          type="text"
          placeholder="Search clips..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </S.SearchRow>
      <S.GridScroller>
        {loading ? (
          <S.StatusText>Loading...</S.StatusText>
        ) : clips.length === 0 ? (
          <S.StatusText>No clips found</S.StatusText>
        ) : (
          <>
            <S.Grid
              style={{
                alignItems: "start",
                gridTemplateColumns: "1fr",
                width: "100%",
              }}
            >
              {clips.map((clip) => {
                const previewSrc = clip.previewUrl || clip.clipUrl;
                const isSelected = selectedClip?.id === clip.id;

                return (
                  <S.StickerCell
                    key={clip.id}
                    type="button"
                    title={clip.title}
                    onClick={() => {
                      setSelectedClip(clip);
                      onSelect(clip.clipUrl);
                    }}
                    style={{
                      aspectRatio: isSelected ? "auto" : "1 / 1",
                      border: isSelected
                        ? "2px solid var(--accent)"
                        : "1px solid transparent",
                      display: "flex",
                      flexDirection: "column",
                      gap: isSelected ? "8px" : undefined,
                      minWidth: 0,
                      overflow: "hidden",
                      padding: isSelected ? "8px" : "4px",
                      width: "100%",
                    }}
                  >
                    {isSelected ? (
                      // Stop touch/click events reaching the parent <button>
                      // so that native video controls work on real mobile browsers.
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        style={{
                          all: "unset",
                          display: "block",
                          width: "100%",
                        }}
                      >
                        <ChatVideoAttachment src={clip.clipUrl} />
                      </button>
                    ) : isVideoUrl(previewSrc) ? (
                      <video
                        src={previewSrc}
                        muted
                        playsInline
                        autoPlay
                        loop
                        preload="metadata"
                        style={{
                          borderRadius: "6px",
                          display: "block",
                          height: "100%",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                    ) : (
                      <img
                        src={previewSrc}
                        alt={clip.title}
                        loading="lazy"
                        style={{
                          borderRadius: "6px",
                          display: "block",
                          height: "100%",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                    )}
                  </S.StickerCell>
                );
              })}
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

export default ClipPicker;
