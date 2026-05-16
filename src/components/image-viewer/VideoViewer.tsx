"use client";

import classNames from "classnames";
import { Dialog } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaCompress,
  FaExpand,
  FaPause,
  FaPlay,
  FaVolumeHigh,
  FaVolumeLow,
  FaVolumeXmark,
} from "react-icons/fa6";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

interface VideoViewerProps {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const formatTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const VideoViewer = ({
  src,
  open,
  onOpenChange,
  onNext,
  onPrev,
}: VideoViewerProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);
  const playingRef = useRef(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const SWIPE_THRESHOLD = 60;

  /* ── Auto-play / reset on open or src change ───────────────────────────── */
  useEffect(() => {
    const v = videoRef.current;
    if (!open) {
      // Video element may already be unmounted by Dialog, guard with null check
      v?.pause();
      setPlaying(false);
      playingRef.current = false;
      setProgress(0);
      setCurrentTime(0);
      window.clearTimeout(hideTimer.current);
      setControlsVisible(true);
      return;
    }
    if (!v) return;
    setProgress(0);
    setCurrentTime(0);
    v.load();
    const t = setTimeout(() => {
      v.play()
        .then(() => {
          setPlaying(true);
          playingRef.current = true;
        })
        .catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [open, src]);

  /* ── Fullscreen listener ────────────────────────────────────────────────── */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* ── Prevent PIP (standard + iOS WebKit) ──────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (!v) return;

    // Chrome / Firefox / macOS Safari
    const onEnterPIP = () => {
      document.exitPictureInPicture().catch(() => {});
    };

    // iOS Safari uses a separate WebKit API
    const onWebKitPresentation = () => {
      const vid = v as HTMLVideoElement & {
        webkitPresentationMode?: string;
        webkitSetPresentationMode?: (mode: string) => void;
      };
      if (vid.webkitPresentationMode === "picture-in-picture") {
        vid.webkitSetPresentationMode?.("inline");
      }
    };

    v.addEventListener("enterpictureinpicture", onEnterPIP);
    v.addEventListener("webkitpresentationmodechanged", onWebKitPresentation);
    return () => {
      v.removeEventListener("enterpictureinpicture", onEnterPIP);
      v.removeEventListener(
        "webkitpresentationmodechanged",
        onWebKitPresentation,
      );
    };
  }, [open]);

  /* ── Cleanup hide timer on unmount ─────────────────────────────────────── */
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  /* ── Controls auto-hide ─────────────────────────────────────────────────── */
  const showControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playingRef.current) setControlsVisible(false);
    }, 3000);
  }, []);

  /* ── Play / pause ───────────────────────────────────────────────────────── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      playingRef.current = true;
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(
        () => setControlsVisible(false),
        3000,
      );
    } else {
      v.pause();
      setPlaying(false);
      playingRef.current = false;
      window.clearTimeout(hideTimer.current);
      setControlsVisible(true);
    }
  }, []);

  /* ── Seek ───────────────────────────────────────────────────────────────── */
  const seekRelative = useCallback((secs: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  }, []);

  /* ── Volume / mute ──────────────────────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = videoRef.current;
      if (!v) return;
      const val = parseFloat(e.target.value);
      v.volume = val;
      v.muted = val === 0;
      setVolume(val);
      setMuted(val === 0);
    },
    [],
  );

  /* ── Fullscreen ─────────────────────────────────────────────────────────── */
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  /* ── Video event handlers ───────────────────────────────────────────────── */
  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  }, []);

  const onEnded = useCallback(() => {
    setPlaying(false);
    playingRef.current = false;
    window.clearTimeout(hideTimer.current);
    setControlsVisible(true);
  }, []);

  /* ── Keyboard shortcuts ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          showControls();
          break;
        case "ArrowRight":
          if (e.altKey && !isFullscreen) onNext?.();
          else if (!e.altKey) {
            seekRelative(5);
            showControls();
          }
          break;
        case "ArrowLeft":
          if (e.altKey && !isFullscreen) onPrev?.();
          else if (!e.altKey) {
            seekRelative(-5);
            showControls();
          }
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          showControls();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    open,
    isFullscreen,
    onNext,
    onPrev,
    togglePlay,
    seekRelative,
    toggleMute,
    toggleFullscreen,
    showControls,
  ]);

  /* ── Swipe (mobile next/prev) ───────────────────────────────────────────── */
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      swipeStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      showControls();
    },
    [showControls],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeStart.current) return;
      const dx = e.changedTouches[0].clientX - swipeStart.current.x;
      const dy = e.changedTouches[0].clientY - swipeStart.current.y;
      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onNext?.();
        else onPrev?.();
      }
      swipeStart.current = null;
    },
    [onNext, onPrev],
  );

  const volumeIcon =
    muted || volume === 0 ? (
      <FaVolumeXmark size={14} />
    ) : volume < 0.5 ? (
      <FaVolumeLow size={14} />
    ) : (
      <FaVolumeHigh size={14} />
    );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <S.Root className={classNames(accent, theme)}>
          <Dialog.Overlay asChild>
            <S.Overlay />
          </Dialog.Overlay>

          <S.VideoContent
            onMouseMove={showControls}
            onMouseLeave={() => {
              if (playingRef.current) {
                window.clearTimeout(hideTimer.current);
                hideTimer.current = window.setTimeout(
                  () => setControlsVisible(false),
                  600,
                );
              }
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={() => onOpenChange(false)}
          >
            <S.VideoDialog
              ref={containerRef}
              className={classNames({ "controls-visible": controlsVisible })}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header with close button ─────────────────────────────── */}
              <S.VideoDialogHeader
                className={classNames({ visible: controlsVisible })}
                onClick={(e) => e.stopPropagation()}
              >
                <Dialog.Close asChild>
                  <S.VideoCloseButton aria-label="Close video">
                    ×
                  </S.VideoCloseButton>
                </Dialog.Close>
              </S.VideoDialogHeader>

              {/* ── Video + overlays ────────────────────────────────────── */}
              <S.VideoArea>
                {/* ── Video element ────────────────────────────────────────── */}
                <video
                  ref={videoRef}
                  src={src}
                  disablePictureInPicture
                  playsInline
                  draggable={false}
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onLoadedMetadata}
                  onEnded={onEnded}
                  onClick={togglePlay}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    cursor: "pointer",
                    display: "block",
                    maxHeight: "100%",
                    objectFit: "contain",
                    width: "100%",
                  }}
                >
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <track kind="captions" />
                </video>

                {/* ── Controls bar ───────────────────────────────────────── */}
                <S.VideoControlsBar
                  className={classNames({ visible: controlsVisible })}
                  onMouseEnter={showControls}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Seekbar */}
                  <S.VideoSeekBar onClick={handleSeek}>
                    <S.VideoSeekFill style={{ width: `${progress}%` }} />
                  </S.VideoSeekBar>

                  {/* Button row */}
                  <S.VideoControlRow>
                    {/* Play / Pause */}
                    <S.VideoIconBtn
                      onClick={togglePlay}
                      aria-label={playing ? "Pause" : "Play"}
                    >
                      {playing ? <FaPause size={14} /> : <FaPlay size={14} />}
                    </S.VideoIconBtn>

                    {/* Time */}
                    <S.VideoTimeDisplay>
                      {formatTime(currentTime)}{" "}
                      <span style={{ opacity: 0.45 }}>/</span>{" "}
                      {formatTime(duration)}
                    </S.VideoTimeDisplay>

                    <div style={{ flex: 1 }} />

                    {/* Volume */}
                    <S.VideoVolumeSpacer>
                      <S.VideoIconBtn
                        onClick={toggleMute}
                        aria-label={muted ? "Unmute" : "Mute"}
                      >
                        {volumeIcon}
                      </S.VideoIconBtn>
                      <S.VideoVolumeSlider
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                        style={
                          {
                            "--vol": `${(muted ? 0 : volume) * 100}%`,
                          } as React.CSSProperties
                        }
                      />
                    </S.VideoVolumeSpacer>

                    {/* Fullscreen */}
                    <S.VideoIconBtn
                      onClick={toggleFullscreen}
                      aria-label="Toggle fullscreen"
                    >
                      {isFullscreen ? (
                        <FaCompress size={13} />
                      ) : (
                        <FaExpand size={13} />
                      )}
                    </S.VideoIconBtn>
                  </S.VideoControlRow>
                </S.VideoControlsBar>

                {/* ── Prev / Next (hidden in fullscreen) ──────────────────────────── */}
                {onPrev && !isFullscreen && (
                  <S.NavButton
                    $side="left"
                    onClick={onPrev}
                    aria-label="Previous"
                  >
                    ‹
                  </S.NavButton>
                )}
                {onNext && !isFullscreen && (
                  <S.NavButton $side="right" onClick={onNext} aria-label="Next">
                    ›
                  </S.NavButton>
                )}
              </S.VideoArea>
            </S.VideoDialog>
          </S.VideoContent>
        </S.Root>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
