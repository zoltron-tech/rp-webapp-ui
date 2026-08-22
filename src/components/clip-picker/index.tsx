"use client";

import { formatTime } from "@nw/utils";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { type FC, useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi2";
import * as S from "@/components/sticker-picker/styled";
import type { ClipItem } from "@/pages/api/klipy-clips";

interface ClipPickerProps {
  onSelect: (clipUrl: string) => void;
  autoFocus?: boolean;
  fill?: boolean;
}

const ClipCell: FC<{
  clip: ClipItem;
  isSelected: boolean;
  onActivate: (clip: ClipItem) => void;
  onSend: (clip: ClipItem) => void;
}> = ({ clip, isSelected, onActivate, onSend }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isSelected && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isSelected]);

  const handleClick = () => {
    onActivate(clip);
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const onSeek = (e: React.MouseEvent<HTMLButtonElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = pct * duration;
  };

  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: isSelected
          ? "2px solid var(--accent)"
          : "1px solid var(--bg-6)",
        borderRadius: "10px",
        marginBottom: "6px",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Video area — click to play/pause */}
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={handleClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "block",
          padding: 0,
          position: "relative",
          width: "100%",
        }}
      >
        <video
          ref={videoRef}
          src={clip.clipUrl}
          playsInline
          preload="metadata"
          disablePictureInPicture
          style={{ display: "block", width: "100%" }}
          onLoadedMetadata={() => {
            const v = videoRef.current;
            if (!v) return;
            setDuration(v.duration || 0);
            if (v.duration > 0) v.currentTime = Math.min(0.5, v.duration);
          }}
          onTimeUpdate={() => {
            const v = videoRef.current;
            if (!v) return;
            setCurrentTime(v.currentTime);
            setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        >
          <track kind="captions" />
        </video>
        {/* Play/pause icon overlay */}
        <div
          style={{
            alignItems: "center",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            left: 0,
            opacity: playing ? 0 : 0.8,
            pointerEvents: "none",
            position: "absolute",
            right: 0,
            top: 0,
            transition: "opacity 0.15s",
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "rgba(0,0,0,0.55)",
              borderRadius: "50%",
              display: "flex",
              height: 36,
              justifyContent: "center",
              width: 36,
            }}
          >
            {playing ? (
              <FaPause color="#fff" size={14} />
            ) : (
              <FaPlay color="#fff" size={14} style={{ marginLeft: 2 }} />
            )}
          </div>
        </div>
      </button>

      {/* Seekbar row */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 6,
          padding: "6px 8px",
        }}
      >
        <span
          style={{
            color: "var(--text-secondary)",
            flexShrink: 0,
            fontSize: 11,
          }}
        >
          {formatTime(currentTime)}
        </span>

        {/* Seek button styled as a progress bar */}
        <button
          type="button"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          role="slider"
          onClick={onSeek}
          onKeyDown={(e) => {
            const v = videoRef.current;
            if (!v || !duration) return;
            if (e.key === "ArrowLeft")
              v.currentTime = Math.max(0, v.currentTime - 5);
            if (e.key === "ArrowRight")
              v.currentTime = Math.min(duration, v.currentTime + 5);
          }}
          style={{
            background: "var(--bg-6)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            flex: 1,
            height: 4,
            padding: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              background: "var(--accent)",
              borderRadius: 4,
              height: "100%",
              pointerEvents: "none",
              width: `${progress}%`,
            }}
          />
        </button>

        <span
          style={{
            color: "var(--text-secondary)",
            flexShrink: 0,
            fontSize: 11,
          }}
        >
          {formatTime(duration)}
        </span>

        {/* Send button — only visible when this clip is selected */}
        {isSelected && (
          <button
            type="button"
            aria-label="Send clip"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSend(clip);
            }}
            style={{
              alignItems: "center",
              background: "var(--accent)",
              border: "none",
              borderRadius: "50%",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              flexShrink: 0,
              height: 28,
              justifyContent: "center",
              marginLeft: 2,
              width: 28,
            }}
          >
            <HiPaperAirplane
              size={13}
              style={{ transform: "rotate(-30deg)" }}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export const ClipPicker: FC<ClipPickerProps> = ({
  onSelect,
  autoFocus = true,
  fill = false,
}) => {
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
            return nextClips.find((c) => c.id === prev.id) ?? null;
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
      setClips((prev) => [...prev, ...(data.items ?? [])]);
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
            <div style={{ padding: "0 6px" }}>
              {clips.map((clip) => (
                <ClipCell
                  key={clip.id}
                  clip={clip}
                  isSelected={selectedClip?.id === clip.id}
                  onActivate={(c) => setSelectedClip(c)}
                  onSend={(c) => onSelect(c.clipUrl)}
                />
              ))}
            </div>
            {hasMore && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "4px",
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
