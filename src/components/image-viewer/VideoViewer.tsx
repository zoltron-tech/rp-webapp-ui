"use client";

import classNames from "classnames";
import { Dialog } from "radix-ui";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".quicktime"];
const isVideoUrl = (url: string) => {
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

interface VideoViewerProps {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
  /** Source of the next media (image or video) — rendered off-screen so it slides in during swipe */
  nextSrc?: string;
  /** Source of the previous media (image or video) — rendered off-screen so it slides in during swipe */
  prevSrc?: string;
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
  nextSrc,
  prevSrc,
}: VideoViewerProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);
  const playingRef = useRef(false);
  const cardSwipeStart = useRef<{ x: number; y: number } | null>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const SLIDE_MS = 300;
  // Visual gap between the current media and its adjacent neighbors
  const SLIDE_GAP = 16;

  // Card-mode carousel drag — same model as AppImageViewer.
  // cardImgX is a shared translateX applied to all three slots; prev sits at
  // `right: calc(100% + GAP)`, current at center, next at `left: calc(100% + GAP)`.
  const [cardImgX, setCardImgX] = useState(0);
  const [cardImgTransition, setCardImgTransition] = useState(false);
  const cardAnimating = useRef(false);
  const cardContainerWidth = useRef(0);

  // Internal mirror of the three media sources, swapped atomically with the
  // parent's src update on snap completion so React commits a consistent frame.
  const [displayed, setDisplayed] = useState<{
    current: string;
    prev?: string;
    next?: string;
  }>({ current: src, next: nextSrc, prev: prevSrc });
  const lastPropsRef = useRef({ nextSrc, prevSrc, src });

  type SlotPosition = "prev" | "current" | "next";
  const slotList = useMemo<
    Array<{ src: string; position: SlotPosition }>
  >(() => {
    const list: Array<{ src: string; position: SlotPosition }> = [];
    if (displayed.prev) list.push({ position: "prev", src: displayed.prev });
    list.push({ position: "current", src: displayed.current });
    if (displayed.next) list.push({ position: "next", src: displayed.next });
    return list;
  }, [displayed]);

  // Sync internal displayed to incoming props when they change externally
  // (keyboard nav, button click) or to fill in a missing neighbor after our
  // optimistic post-snap swap.
  useLayoutEffect(() => {
    const last = lastPropsRef.current;
    if (
      last.src === src &&
      last.prevSrc === prevSrc &&
      last.nextSrc === nextSrc
    ) {
      return;
    }
    lastPropsRef.current = { nextSrc, prevSrc, src };
    setDisplayed({ current: src, next: nextSrc, prev: prevSrc });
  }, [src, prevSrc, nextSrc]);

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
      // Reset carousel transform so the next open starts cleanly
      setCardImgX(0);
      setCardImgTransition(false);
      cardAnimating.current = false;
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
    document.addEventListener("webkitfullscreenchange", onChange);

    // iOS Safari fires these events on the video element itself
    const v = videoRef.current;
    const onBegin = () => setIsFullscreen(true);
    const onEnd = () => setIsFullscreen(false);
    v?.addEventListener("webkitbeginfullscreen", onBegin);
    v?.addEventListener("webkitendfullscreen", onEnd);

    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      v?.removeEventListener("webkitbeginfullscreen", onBegin);
      v?.removeEventListener("webkitendfullscreen", onEnd);
    };
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
    type IOSVideo = HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    };
    const v = videoRef.current as IOSVideo | null;

    // iOS Safari: requestFullscreen is unsupported; use the video element API
    if (v?.webkitEnterFullscreen) {
      if (v.webkitDisplayingFullscreen) {
        v.webkitExitFullscreen?.();
      } else {
        v.webkitEnterFullscreen();
      }
      return;
    }

    // Standard browsers
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

  /* ── Card-mode carousel touch swipe (next/prev with live drag) ──────── */
  const onCardTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (cardAnimating.current) return;
      cardContainerWidth.current =
        (e.currentTarget as HTMLElement).offsetWidth || window.innerWidth;
      cardSwipeStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setCardImgTransition(false);
      showControls();
    },
    [showControls],
  );

  const onCardTouchMove = useCallback((e: React.TouchEvent) => {
    if (!cardSwipeStart.current || cardAnimating.current) return;
    const dx = e.touches[0].clientX - cardSwipeStart.current.x;
    const dy = e.touches[0].clientY - cardSwipeStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      setCardImgX(dx);
    }
  }, []);

  const onCardTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!cardSwipeStart.current || cardAnimating.current) return;
      const dx = e.changedTouches[0].clientX - cardSwipeStart.current.x;
      const dy = e.changedTouches[0].clientY - cardSwipeStart.current.y;
      cardSwipeStart.current = null;

      const cw = cardContainerWidth.current || window.innerWidth;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      const goingNext = dx < 0;

      // "Most in frame" rule: snap only when the neighbor occupies more than
      // half the container width.
      const snapToNeighbor =
        isHorizontal &&
        Math.abs(dx) > cw / 2 &&
        (goingNext ? !!onNext : !!onPrev);

      if (!snapToNeighbor) {
        setCardImgTransition(true);
        setCardImgX(0);
        setTimeout(() => setCardImgTransition(false), SLIDE_MS);
        return;
      }

      // Pause current video before sliding away — it may unmount on snap
      const v = videoRef.current;
      if (v && !v.paused) {
        v.pause();
        setPlaying(false);
        playingRef.current = false;
      }

      cardAnimating.current = true;
      const snapX = goingNext ? -(cw + SLIDE_GAP) : cw + SLIDE_GAP;

      setCardImgTransition(true);
      setCardImgX(snapX);

      setTimeout(() => {
        // Atomically swap internal displayed snapshot + reset track + parent
        // src update — all batched into one React commit. The new "current"
        // slot reuses the keyed wrapper that was previously at "next"/"prev",
        // so its underlying <img>/<video> element is preserved (no reload).
        setDisplayed((d) =>
          goingNext
            ? { current: d.next ?? d.current, next: undefined, prev: d.current }
            : {
                current: d.prev ?? d.current,
                next: d.current,
                prev: undefined,
              },
        );
        setCardImgTransition(false);
        setCardImgX(0);
        cardAnimating.current = false;

        if (goingNext) onNext?.();
        else onPrev?.();
      }, SLIDE_MS);
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
              <S.VideoArea
                onTouchStart={onCardTouchStart}
                onTouchMove={onCardTouchMove}
                onTouchEnd={onCardTouchEnd}
              >
                {/* Slotted carousel — current slot is the live video; prev/next
                    slots are static peeks (img or muted video preloads). Each
                    slot is keyed by URL so React preserves the underlying
                    media element across role changes. */}
                {slotList.map(({ src: slotSrc, position }) => {
                  const isCurrent = position === "current";
                  const slotIsVideo = isVideoUrl(slotSrc);
                  const positionStyle: React.CSSProperties =
                    position === "prev"
                      ? {
                          bottom: 0,
                          right: `calc(100% + ${SLIDE_GAP}px)`,
                          top: 0,
                          width: "100%",
                        }
                      : position === "next"
                        ? {
                            bottom: 0,
                            left: `calc(100% + ${SLIDE_GAP}px)`,
                            top: 0,
                            width: "100%",
                          }
                        : { inset: 0 };

                  return (
                    <div
                      key={slotSrc}
                      aria-hidden={!isCurrent}
                      style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "center",
                        pointerEvents: isCurrent ? undefined : "none",
                        position: "absolute",
                        ...positionStyle,
                        transform: `translateX(${cardImgX}px)`,
                        transition: cardImgTransition
                          ? `transform ${SLIDE_MS}ms ease-in-out`
                          : "none",
                        willChange: cardAnimating.current
                          ? "transform"
                          : "auto",
                      }}
                    >
                      {slotIsVideo ? (
                        isCurrent ? (
                          // Live video — controls + ref attached
                          <video
                            ref={videoRef}
                            src={slotSrc}
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
                        ) : (
                          // Peek video — muted, paused, preloaded
                          <video
                            src={slotSrc}
                            muted
                            playsInline
                            preload="metadata"
                            draggable={false}
                            style={{
                              borderRadius: "8px",
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                              pointerEvents: "none",
                            }}
                          >
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <track kind="captions" />
                          </video>
                        )
                      ) : (
                        <img
                          src={slotSrc}
                          alt=""
                          draggable={false}
                          style={{
                            borderRadius: "8px",
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </div>
                  );
                })}

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
