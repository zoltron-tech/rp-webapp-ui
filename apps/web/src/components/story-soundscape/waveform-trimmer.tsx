"use client";

import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { LuPause, LuPlay } from "react-icons/lu";
import * as S from "./styles";

/** How many peak columns to draw — enough detail without a slow decode pass. */
const PEAK_BUCKETS = 400;

type Props = {
  /** Playable audio url. */
  src: string;
  clipStart: number | null;
  clipEnd: number | null;
  onChange: (clip: { start: number | null; end: number | null }) => void;
};

/**
 * Waveform clip trimmer.
 *
 * Decodes the track once, reduces it to peaks, and draws them to a canvas;
 * the handles pick the slice the cue plays. Preview plays only that slice, so
 * the author hears exactly what a reader will.
 */
export const WaveformTrimmer: FC<Props> = ({
  src,
  clipStart,
  clipEnd,
  onChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<"start" | "end" | null>(null);

  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  const start = clipStart ?? 0;
  const end = clipEnd ?? duration;

  // ── Decode ───────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setPeaks(null);
    setError(null);

    const decode = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`status ${response.status}`);
        const bytes = await response.arrayBuffer();

        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) throw new Error("no AudioContext");

        // A throwaway context: this one only decodes, it never plays.
        const context = new Ctor();
        const buffer = await context.decodeAudioData(bytes);
        await context.close();
        if (cancelled) return;

        const channel = buffer.getChannelData(0);
        const bucketSize = Math.max(
          1,
          Math.floor(channel.length / PEAK_BUCKETS),
        );
        const reduced: number[] = [];
        for (let i = 0; i < PEAK_BUCKETS; i++) {
          let peak = 0;
          const from = i * bucketSize;
          const to = Math.min(channel.length, from + bucketSize);
          for (let j = from; j < to; j++) {
            const value = Math.abs(channel[j]);
            if (value > peak) peak = value;
          }
          reduced.push(peak);
        }

        setPeaks(reduced);
        setDuration(buffer.duration);
      } catch {
        if (!cancelled) {
          // A cross-origin track without CORS headers can't be decoded. The
          // cue still plays; only the visual trim is unavailable.
          setError("Couldn't read the waveform for this track.");
        }
      }
    };

    decode();
    return () => {
      cancelled = true;
    };
  }, [src]);

  // ── Draw ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);

    const style = getComputedStyle(canvas);
    const inside = style.getPropertyValue("--accent").trim() || "#6e56cf";
    const outside = style.getPropertyValue("--text-secondary").trim() || "#888";

    const columnWidth = width / peaks.length;
    const mid = height / 2;
    const startX = duration > 0 ? (start / duration) * width : 0;
    const endX = duration > 0 ? (end / duration) * width : width;

    peaks.forEach((peak, index) => {
      const x = index * columnWidth;
      // Everything outside the clip is dimmed — the slice is the point.
      ctx.fillStyle = x >= startX && x <= endX ? inside : outside;
      ctx.globalAlpha = x >= startX && x <= endX ? 1 : 0.35;
      const barHeight = Math.max(1, peak * (height - 2));
      ctx.fillRect(
        x,
        mid - barHeight / 2,
        Math.max(1, columnWidth - 0.5),
        barHeight,
      );
    });
    ctx.globalAlpha = 1;
  }, [peaks, start, end, duration]);

  // ── Handles ──────────────────────────────────────────────────────────────

  const secondsAt = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || duration <= 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      return Math.min(duration, Math.max(0, ratio * duration));
    },
    [duration],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const handle = dragRef.current;
      if (!handle) return;
      const seconds = secondsAt(e.clientX);
      if (handle === "start") {
        onChange({ end: clipEnd, start: Math.min(seconds, end - 0.1) });
      } else {
        onChange({ end: Math.max(seconds, start + 0.1), start: clipStart });
      }
    };
    const end_ = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end_);
    window.addEventListener("pointercancel", end_);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end_);
      window.removeEventListener("pointercancel", end_);
    };
  }, [secondsAt, onChange, clipStart, clipEnd, start, end]);

  // ── Slice preview ────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const playSlice = useCallback(() => {
    if (playing) {
      stop();
      return;
    }
    const element = new Audio(src);
    element.crossOrigin = "anonymous";
    element.currentTime = start;
    audioRef.current = element;
    setPlaying(true);

    const watch = window.setInterval(() => {
      if (!audioRef.current) {
        window.clearInterval(watch);
        return;
      }
      setPlayhead(audioRef.current.currentTime);
      // Stop at the clip's end, not the track's — that is the whole point.
      if (audioRef.current.currentTime >= end) {
        window.clearInterval(watch);
        stop();
      }
    }, 60);

    element.addEventListener("ended", () => {
      window.clearInterval(watch);
      stop();
    });
    element.play().catch(() => stop());
  }, [playing, src, start, end, stop]);

  const percent = (seconds: number) =>
    duration > 0 ? (seconds / duration) * 100 : 0;

  if (error) return <S.TrimmerNote>{error}</S.TrimmerNote>;
  if (!peaks) return <S.TrimmerNote>Reading the waveform…</S.TrimmerNote>;

  return (
    <S.Trimmer>
      <S.TrimmerTrack ref={trackRef}>
        <S.TrimmerCanvas ref={canvasRef} />

        <S.TrimmerHandle
          $side="start"
          style={{ left: `${percent(start)}%` }}
          aria-label="Clip start"
          onPointerDown={(e) => {
            e.preventDefault();
            dragRef.current = "start";
          }}
        />
        <S.TrimmerHandle
          $side="end"
          style={{ left: `${percent(end)}%` }}
          aria-label="Clip end"
          onPointerDown={(e) => {
            e.preventDefault();
            dragRef.current = "end";
          }}
        />
        {playing && (
          <S.TrimmerPlayhead style={{ left: `${percent(playhead)}%` }} />
        )}
      </S.TrimmerTrack>

      <S.TrimmerRow>
        <S.TrimmerPlayButton
          type="button"
          aria-label={playing ? "Stop the preview" : "Preview the clip"}
          onClick={playSlice}
        >
          {playing ? <LuPause size={14} /> : <LuPlay size={14} />}
        </S.TrimmerPlayButton>
        <S.TrimmerNote>
          {start.toFixed(1)}s – {end.toFixed(1)}s of {duration.toFixed(1)}s
        </S.TrimmerNote>
        <S.TrimmerReset
          type="button"
          onClick={() => onChange({ end: null, start: null })}
        >
          Whole track
        </S.TrimmerReset>
      </S.TrimmerRow>
    </S.Trimmer>
  );
};
