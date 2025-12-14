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
import * as S from "./styled";

interface ImageViewerProps {
  src: string;
  alt?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export const AppImageViewer = ({
  src,
  alt = "",
  open,
  onOpenChange,
  children,
}: ImageViewerProps) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastDistance = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef<number | null>(null);

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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
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
      pointers.current.delete(e.pointerId);

      if (pointers.current.size < 2) {
        lastDistance.current = null;
        lastCenter.current = null;
      }

      if (pointers.current.size === 0 && scale !== 1) {
        reset();
      }
    },
    [reset, scale],
  );

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.Trigger asChild>
          <span>{children}</span>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <S.Root className={classNames(accent, theme)}>
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
                  transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
                  transition: isAnimating ? "transform 150ms ease-out" : "none",
                }}
              />
            </S.GestureContainer>

            <Dialog.Close asChild>
              <S.CloseButton aria-label="Close image">×</S.CloseButton>
            </Dialog.Close>
          </S.Content>
        </S.Root>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
