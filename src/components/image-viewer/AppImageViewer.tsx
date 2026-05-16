"use client";

import classNames from "classnames";
import { Dialog } from "radix-ui";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useGlobalState } from "@/context/store/stores";
import { useNsfwCheck } from "@/hooks/use-nsfw-check";
import * as S from "./styled";

interface ImageViewerProps {
  src: string;
  alt?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
  children?: ReactNode;
  skipNsfwCheck?: boolean;
}

export const AppImageViewer = ({
  src,
  alt = "",
  open,
  onOpenChange,
  onNext,
  onPrev,
  children,
  skipNsfwCheck,
}: ImageViewerProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const [nsfwRevealed, setNsfwRevealed] = useState(false);
  const isNsfw = useNsfwCheck(src || null, skipNsfwCheck);
  const showNsfwOverlay = isNsfw === true && !nsfwRevealed;
  const showBlur = !!src && (isNsfw === null || showNsfwOverlay);

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
    cardSwipeStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onCardTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!cardSwipeStart.current) return;
      const dx = e.changedTouches[0].clientX - cardSwipeStart.current.x;
      const dy = e.changedTouches[0].clientY - cardSwipeStart.current.y;
      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onNext?.();
        else onPrev?.();
      }
      cardSwipeStart.current = null;
    },
    [onNext, onPrev],
  );

  useEffect(() => () => window.clearTimeout(switchToCardTimer.current), []);

  useEffect(() => {
    if (!open) {
      reset();
      setViewMode("card");
      setNsfwRevealed(false);
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
                  onTouchEnd={onCardTouchEnd}
                >
                  <S.Image
                    src={src}
                    alt={alt}
                    draggable={false}
                    onClick={() => !showNsfwOverlay && setViewMode("zoom")}
                    style={{
                      borderRadius: "8px",
                      cursor: showNsfwOverlay ? "default" : "zoom-in",
                      filter: showBlur ? "blur(24px)" : undefined,
                      transform: "none",
                      transition: "filter 0.3s ease",
                    }}
                  />
                  {showNsfwOverlay && (
                    <S.NsfwOverlay>
                      <S.NsfwLabel>⚠️ Sensitive content</S.NsfwLabel>
                      <S.NsfwRevealButton
                        type="button"
                        onClick={() => setNsfwRevealed(true)}
                      >
                        See anyway
                      </S.NsfwRevealButton>
                    </S.NsfwOverlay>
                  )}
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
