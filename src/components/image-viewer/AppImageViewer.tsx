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

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastDistance = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const hasInteracted = useRef(false);

  const minScale = 1;
  const maxScale = 4;

  const distance = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);

  const centerPoint = (a: any, b: any) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const reset = useCallback(() => {
    setIsAnimating(true);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setTimeout(() => setIsAnimating(false), 150);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
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

      if (pointers.current.size === 1 && scale > 1) {
        hasInteracted.current = true;

        setTranslate((t) => ({
          x: t.x + e.movementX,
          y: t.y + e.movementY,
        }));
      }

      if (pointers.current.size === 2) {
        hasInteracted.current = true;

        const pts = Array.from(pointers.current.values());
        const curDist = distance(pts[0], pts[1]);
        const curCenter = centerPoint(pts[0], pts[1]);

        if (lastDistance.current && lastCenter.current) {
          const factor = curDist / lastDistance.current;

          setScale((s) => Math.max(minScale, Math.min(maxScale, s * factor)));

          setTranslate((t) => ({
            x: t.x + (curCenter.x - lastCenter.current!.x),
            y: t.y + (curCenter.y - lastCenter.current!.y),
          }));
        }

        lastDistance.current = curDist;
        lastCenter.current = curCenter;
      }
    },
    [scale],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      pointers.current.delete(e.pointerId);

      if (pointers.current.size === 0 && hasInteracted.current) {
        hasInteracted.current = false;
        reset();
      }

      if (pointers.current.size < 2) {
        lastDistance.current = null;
        lastCenter.current = null;
      }
    },
    [reset],
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((s) => Math.max(minScale, Math.min(maxScale, s * factor)));
  }, []);

  useEffect(() => {
    if (!open) {
      hasInteracted.current = false;
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.Trigger asChild>
          <span>{children}</span>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <S.Overlay />
        <S.Content className={classNames(accent, theme)}>
          <S.GestureContainer
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            onDoubleClick={reset}
          >
            <S.Image
              src={src}
              alt={alt}
              draggable={false}
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transition: isAnimating ? "transform 150ms ease-out" : "none",
              }}
            />
          </S.GestureContainer>

          <Dialog.Close asChild>
            <S.CloseButton aria-label="Close image">×</S.CloseButton>
          </Dialog.Close>
        </S.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
