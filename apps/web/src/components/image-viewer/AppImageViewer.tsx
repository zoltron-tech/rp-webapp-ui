"use client";

import classNames from "classnames";
import { Dialog } from "radix-ui";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".quicktime"];
const isVideoUrl = (url: string) => {
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

interface ImageViewerProps {
  src: string;
  alt?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
  /** Source of the next image — rendered off-screen so it slides in during swipe */
  nextSrc?: string;
  /** Source of the previous image — rendered off-screen so it slides in during swipe */
  prevSrc?: string;
  children?: ReactNode;
  /** Optional caption region rendered under the image in card mode (e.g. description + reactions). */
  overlay?: ReactNode;
}

export const AppImageViewer = ({
  src,
  alt = "",
  open,
  onOpenChange,
  onNext,
  onPrev,
  nextSrc,
  prevSrc,
  children,
  overlay,
}: ImageViewerProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const [viewMode, setViewMode] = useState<"card" | "zoom">("card");
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastDistance = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef<number | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeCancelled = useRef(false);
  const cardSwipeStart = useRef<{ x: number; y: number } | null>(null);
  // Guards the backdrop click that fires after switching from zoom → card mode
  const justSwitchedToCard = useRef(false);
  const switchToCardTimer = useRef<number>(0);

  const SWIPE_THRESHOLD = 50;
  const SLIDE_MS = 300;
  // Visual gap between the current image and its adjacent neighbors
  const SLIDE_GAP = 16;

  // Card-mode carousel drag
  // cardImgX is the shared translateX applied to ALL three image slots simultaneously.
  // prev sits at `right: calc(100% + GAP)`, current at center, next at `left: calc(100% + GAP)`
  // — they all translate together so the user sees adjacent images peeking in during drag.
  const [cardImgX, setCardImgX] = useState(0);
  const [cardImgTransition, setCardImgTransition] = useState(false);
  const cardAnimating = useRef(false);
  // Width of the ImageCardArea, captured on touch-start for accurate snap math
  const cardContainerWidth = useRef(0);

  // Internal mirror of the three image sources. Normally tracks props 1:1, but
  // on snap completion we atomically swap these in the SAME React batch as the
  // parent's src update so the painted frame is always consistent (no flicker).
  const [displayed, setDisplayed] = useState<{
    current: string;
    prev?: string;
    next?: string;
  }>({ current: src, next: nextSrc, prev: prevSrc });
  // Snapshot of the last props we synced from — lets us detect external prop
  // changes (e.g. keyboard nav) vs. our own optimistic swap.
  const lastPropsRef = useRef({ nextSrc, prevSrc, src });

  const minScale = 1;
  const maxScale = 4;

  const reset = useCallback(() => {
    setIsAnimating(true);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setTimeout(() => setIsAnimating(false), 150);
  }, []);

  const updateTransform = (
    newScale: number,
    newTranslate: { x: number; y: number },
  ) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setScale(newScale);
      setTranslate(newTranslate);
    });
  };

  const distance = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  const centerPoint = (a: any, b: any) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  /* ── Switch zoom → card (guards the stray click that fires after the tap) ── */
  const switchToCard = useCallback(() => {
    setViewMode("card");
    window.clearTimeout(switchToCardTimer.current);
    justSwitchedToCard.current = true;
    switchToCardTimer.current = window.setTimeout(() => {
      justSwitchedToCard.current = false;
    }, 300);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      swipeStart.current = { x: e.clientX, y: e.clientY };
      swipeCancelled.current = false;
    } else if (pointers.current.size === 2) {
      swipeCancelled.current = true;
      const pts = Array.from(pointers.current.values());
      lastDistance.current = distance(pts[0], pts[1]);
      lastCenter.current = centerPoint(pts[0], pts[1]);
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return;

      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2) {
        const pts = Array.from(pointers.current.values());
        const curDist = distance(pts[0], pts[1]);
        const curCenter = centerPoint(pts[0], pts[1]);

        if (lastDistance.current && lastCenter.current) {
          const factor = curDist / lastDistance.current;
          const newScale = Math.max(
            minScale,
            Math.min(maxScale, scale * factor),
          );
          const newTranslate = {
            x: translate.x + (curCenter.x - lastCenter.current.x),
            y: translate.y + (curCenter.y - lastCenter.current.y),
          };
          updateTransform(newScale, newTranslate);
        }

        lastDistance.current = curDist;
        lastCenter.current = curCenter;
      }
    },
    [scale, translate],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const endX = e.clientX;
      const endY = e.clientY;
      const startPos = swipeStart.current;
      pointers.current.delete(e.pointerId);

      if (pointers.current.size < 2) {
        lastDistance.current = null;
        lastCenter.current = null;
      }

      if (pointers.current.size === 0) {
        // Pure tap with scale=1 → switch back to card mode
        if (!swipeCancelled.current && startPos && scale === 1) {
          const dx = Math.abs(endX - startPos.x);
          const dy = Math.abs(endY - startPos.y);
          if (dx < 8 && dy < 8) {
            switchToCard();
            swipeStart.current = null;
            return;
          }
        }
        swipeStart.current = null;
        if (scale !== 1) reset();
      }
    },
    [reset, scale, switchToCard],
  );

  /* ── Card mode touch swipe (next/prev) ──────────────────────────────────── */
  const onCardTouchStart = useCallback((e: React.TouchEvent) => {
    if (cardAnimating.current) return;
    cardContainerWidth.current =
      (e.currentTarget as HTMLElement).offsetWidth || window.innerWidth;
    cardSwipeStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setCardImgTransition(false);
  }, []);

  const onCardTouchMove = useCallback((e: React.TouchEvent) => {
    if (!cardSwipeStart.current || cardAnimating.current) return;
    const dx = e.touches[0].clientX - cardSwipeStart.current.x;
    const dy = e.touches[0].clientY - cardSwipeStart.current.y;
    // Only drag horizontally; let the browser handle vertical scrolling
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

      // "Most in frame" rule: snap to neighbor only when that image occupies
      // more than half the container width (i.e. |dx| > cw/2).
      const snapToNeighbor =
        isHorizontal &&
        Math.abs(dx) > cw / 2 &&
        (goingNext ? !!onNext : !!onPrev);

      if (!snapToNeighbor) {
        // Spring back to center
        setCardImgTransition(true);
        setCardImgX(0);
        setTimeout(() => setCardImgTransition(false), SLIDE_MS);
        return;
      }

      // Slide the whole track to reveal the neighbor image, then swap src
      cardAnimating.current = true;
      const snapX = goingNext ? -(cw + SLIDE_GAP) : cw + SLIDE_GAP;

      setCardImgTransition(true);
      setCardImgX(snapX);

      setTimeout(() => {
        // Atomically: swap the internal displayed snapshot to reflect the
        // post-snap layout AND reset the track to 0 with no transition, all
        // batched with the parent's src update below. React 18 batches every
        // setState call in this tick (ours + parent's) into a single commit,
        // so the rendered output already shows the new image at center —
        // there is no intermediate frame where stale slot positions can paint.
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

        // Inform parent — its setState batches with ours into one commit.
        if (goingNext) onNext?.();
        else onPrev?.();
      }, SLIDE_MS);
    },
    [onNext, onPrev],
  );

  // Keep the internal displayed snapshot in sync with incoming props.
  // Runs on every render where props differ from the last seen props. Fires
  // for both external nav (keyboard / nav-button click) and the parent
  // catching up after our optimistic swap. In the latter case the props
  // already match `displayed.current`, so the setDisplayed below is a no-op.
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
    setDisplayed((d) => {
      // Parent caught up to our optimistic swap — just fill in any missing neighbor.
      if (d.current === src) {
        return { current: src, next: nextSrc, prev: prevSrc };
      }
      // External nav (or first render) — fully resync
      return { current: src, next: nextSrc, prev: prevSrc };
    });
  }, [src, prevSrc, nextSrc]);

  useEffect(() => () => window.clearTimeout(switchToCardTimer.current), []);

  // Build the rendered slot list. Each slot is keyed by its image URL so
  // React preserves the underlying <img> element when its role changes
  // (e.g. "next" → "current" after a swipe). The IMG never unmounts and
  // its `src` attribute never changes, so the browser never reloads or
  // re-paints the image — making any flicker frame impossible.
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

  useEffect(() => {
    if (!open) {
      reset();
      setViewMode("card");
      setCardImgX(0);
      setCardImgTransition(false);
      cardAnimating.current = false;
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open || viewMode === "zoom") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext?.();
      else if (e.key === "ArrowLeft") onPrev?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onNext, onPrev, viewMode]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.Trigger asChild>
          <span>{children}</span>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <S.Root className={classNames(accent, theme)}>
          <Dialog.Overlay asChild>
            <S.Overlay />
          </Dialog.Overlay>

          {viewMode === "card" ? (
            /* ── Card mode: centered dialog, nav buttons, swipe ─────────── */
            <S.ImageCardContent
              onClick={() => {
                if (!justSwitchedToCard.current) onOpenChange?.(false);
              }}
            >
              <S.ImageCard onClick={(e) => e.stopPropagation()}>
                <S.ImageCardHeader>
                  <Dialog.Close asChild>
                    <S.ImageCardClose aria-label="Close image">
                      ×
                    </S.ImageCardClose>
                  </Dialog.Close>
                </S.ImageCardHeader>
                <S.ImageCardArea
                  onTouchStart={onCardTouchStart}
                  onTouchMove={onCardTouchMove}
                  onTouchEnd={onCardTouchEnd}
                >
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
                        onClick={
                          isCurrent && !slotIsVideo
                            ? () =>
                                !cardAnimating.current && setViewMode("zoom")
                            : undefined
                        }
                        style={{
                          alignItems: "center",
                          cursor:
                            isCurrent && !slotIsVideo ? "zoom-in" : "default",
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
                          // Video peek — muted, paused, shows first frame
                          // while sliding in. When this slot becomes the
                          // "current" after a snap, the parent will close
                          // this viewer and open VideoViewer with the same
                          // URL (cached by the browser from this preload).
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
                        ) : (
                          <img
                            src={slotSrc}
                            alt={isCurrent ? alt : ""}
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
                  {onPrev && (
                    <S.NavButton
                      $side="left"
                      aria-label="Previous image"
                      onClick={onPrev}
                    >
                      ‹
                    </S.NavButton>
                  )}
                  {onNext && (
                    <S.NavButton
                      $side="right"
                      aria-label="Next image"
                      onClick={onNext}
                    >
                      ›
                    </S.NavButton>
                  )}
                </S.ImageCardArea>
                {overlay}
              </S.ImageCard>
            </S.ImageCardContent>
          ) : (
            /* ── Zoom mode: full-screen, pinch/pan, tap image to go back ── */
            <S.Content className="touch-container">
              <S.GestureContainer
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onDoubleClick={reset}
              >
                <S.Image
                  src={src}
                  alt={alt}
                  draggable={false}
                  style={{
                    cursor: scale > 1 ? "grab" : "zoom-out",
                    transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
                    transition: isAnimating
                      ? "transform 150ms ease-out"
                      : "none",
                  }}
                />
              </S.GestureContainer>

              <Dialog.Close asChild>
                <S.CloseButton aria-label="Close image">×</S.CloseButton>
              </Dialog.Close>
            </S.Content>
          )}
        </S.Root>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
