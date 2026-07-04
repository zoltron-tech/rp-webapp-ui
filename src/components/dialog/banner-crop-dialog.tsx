"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MdCropFree,
  MdOpenWith,
  MdOutlineImage,
  MdRefresh,
  MdZoomIn,
  MdZoomOut,
} from "react-icons/md";
import styled from "styled-components";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

const clampZoom = (v: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));
const clamp100 = (v: number) => Math.min(100, Math.max(0, v));

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 4px 2px;
  width: 100%;
`;

const ViewportWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const BannerRect = styled.div<{ $portrait?: boolean; $aspectRatio?: string }>`
  position: relative;
  ${({ $portrait }) =>
    $portrait
      ? `height: 260px; width: auto; max-width: none;`
      : `width: 100%; max-width: 480px;`}
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio ?? "5 / 2"};
  background:
    linear-gradient(var(--bg-1), var(--bg-1)) padding-box,
    repeating-conic-gradient(var(--bg-3) 0% 25%, var(--bg-2) 0% 50%) 0 / 20px 20px;
  border-radius: 10px;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  box-shadow:
    inset 0 0 0 1px var(--bg-6),
    0 6px 20px rgba(0, 0, 0, 0.28);
  &:active {
    cursor: grabbing;
  }

  @media (max-width: 480px) {
    ${({ $portrait }) => $portrait && `height: 220px;`}
  }
`;

/* Dynamic background props are applied via the `style` prop (inline) rather than
   styled-component props so rapid drag/zoom updates don't regenerate CSS classes. */
const ImageEl = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  pointer-events: none;
  user-select: none;
  touch-action: none;
`;

/* Rule-of-thirds guides — fade in while the user is composing (dragging). */
const Grid = styled.div<{ $active?: boolean }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.2s ease;
  background-image:
    linear-gradient(to right, transparent 33.2%, rgba(255, 255, 255, 0.4) 33.2%, rgba(255, 255, 255, 0.4) 33.5%, transparent 33.5%, transparent 66.5%, rgba(255, 255, 255, 0.4) 66.5%, rgba(255, 255, 255, 0.4) 66.8%, transparent 66.8%),
    linear-gradient(to bottom, transparent 33.2%, rgba(255, 255, 255, 0.4) 33.2%, rgba(255, 255, 255, 0.4) 33.5%, transparent 33.5%, transparent 66.5%, rgba(255, 255, 255, 0.4) 66.5%, rgba(255, 255, 255, 0.4) 66.8%, transparent 66.8%);
`;

const ZoomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ZoomStep = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: var(--bg-3);
    color: var(--text);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const ZoomBadge = styled.span`
  min-width: 46px;
  text-align: center;
  font-size: var(--font-size-small);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
`;

const Seek = styled.input<{ $pct: number }>`
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--accent) 0%,
    var(--accent) ${(p) => p.$pct}%,
    var(--bg-5) ${(p) => p.$pct}%,
    var(--bg-5) 100%
  );
  width: 150px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--accent);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--accent);
    cursor: pointer;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 0;

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

const ActionBarHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.02em;
  opacity: 0.75;

  @media (max-width: 480px) {
    display: none;
  }
`;

const ActionBarButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const ResetPill = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--bg-3);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    font-size: 10px;
    svg { width: 15px !important; height: 15px !important; }
  }
`;

const ChangePill = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 10px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size-xsmall);
  font-family: var(--font);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s;

  svg {
    width: 16px !important;
    height: 16px !important;
    flex-shrink: 0;
  }

  &:hover {
    background: var(--accent-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    font-size: var(--font-size-xxsmall);
    svg { width: 15px !important; height: 15px !important; }
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
`;

const CancelButton = styled.button`
  all: unset;
  padding: 6px 14px;
  border-radius: 4px;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--bg-6);
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--bg-4);
    color: var(--text);
    border-color: var(--bg-8);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const UpdateButton = styled.button`
  all: unset;
  padding: 6px 16px;
  border-radius: 4px;
  background-color: var(--accent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
  }

  &:disabled {
    background-color: var(--bg-6);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

type Props = {
  open: boolean;
  src: string;
  x: number;
  y: number;
  scale: number;
  onOpenChange: (open: boolean) => void;
  /** Commits the final pan position once the drag gesture settles. */
  onPan: (x: number, y: number) => void;
  onScaleChange: (v: number) => void;
  onReset: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onChangeBanner?: () => void;
  onFit?: (fitScale: number) => void;
  /** Auto-run "Fit" once when the dialog opens. Enable only for a freshly
   *  uploaded image; leave off when editing an existing crop so the saved
   *  position is preserved. */
  autoFit?: boolean;
  isUploading?: boolean;
  confirmLabel?: string;
  aspectRatio?: string;
  portrait?: boolean;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
};

export function BannerCropDialog({
  open,
  src,
  x,
  y,
  scale,
  onOpenChange,
  onPan,
  onScaleChange,
  onReset,
  onCancel,
  onConfirm,
  onChangeBanner,
  onFit,
  autoFit,
  isUploading,
  confirmLabel,
  aspectRatio,
  portrait,
  viewportRef,
}: Props) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);
  const [dragging, setDragging] = useState(false);

  const zoomPct = Math.round(((scale - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100);
  const stepZoom = (dir: 1 | -1) => onScaleChange(clampZoom(scale + dir * ZOOM_STEP));

  // ── Imperative pan ──────────────────────────────────────────────────────────
  // Dragging updates the image's background-position directly on the DOM node so
  // no React state churns per frame (which would re-render the whole host page and
  // regenerate styled-components classes). The committed x/y are pushed to the
  // parent only when the gesture ends, via onPan.
  const imgRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef({ x, y });
  const panStart = useRef<{ px: number; py: number; bx: number; by: number } | null>(null);
  const pinchDist = useRef<number | null>(null);

  // Keep the live position in sync with externally-driven changes (reset, fit,
  // opening a new image) whenever we are not mid-drag.
  useEffect(() => {
    if (!panStart.current) liveRef.current = { x, y };
  }, [x, y]);

  const applyPan = (nx: number, ny: number) => {
    liveRef.current = { x: nx, y: ny };
    if (imgRef.current) imgRef.current.style.backgroundPosition = `${nx}% ${ny}%`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.isPrimary === false) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    panStart.current = { px: e.clientX, py: e.clientY, bx: liveRef.current.x, by: liveRef.current.y };
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = panStart.current;
    if (!start || !viewportRef?.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = ((e.clientX - start.px) / rect.width) * 100;
    const dy = ((e.clientY - start.py) / rect.height) * 100;
    applyPan(clamp100(start.bx - dx), clamp100(start.by - dy));
  };

  const endPan = () => {
    if (!panStart.current) return;
    panStart.current = null;
    setDragging(false);
    onPan(liveRef.current.x, liveRef.current.y);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    onScaleChange(clampZoom(scale + (e.deltaY < 0 ? ZOOM_STEP / 5 : -ZOOM_STEP / 5)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDist.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const delta = (dist - pinchDist.current) * 0.01;
      pinchDist.current = dist;
      onScaleChange(clampZoom(scale + delta));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchDist.current = null;
  };

  const computeFit = useCallback(() => {
    if (!src || !viewportRef?.current) return;
    const img = new window.Image();
    img.onload = () => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const { naturalWidth, naturalHeight } = img;
      // At scale=1 the rendered image height = vpW × (imgH/imgW).
      // If that's shorter than vpH there's a vertical gap, so zoom until
      // rendered height = vpH → fitScale = (vpH/vpW) × (imgW/imgH).
      // When the image is already tall enough, max(1, …) keeps scale at 1.
      const fitScale = Math.max(
        1,
        (rect.height / rect.width) * (naturalWidth / naturalHeight),
      );
      onFit?.(Math.min(fitScale, 3));
    };
    img.src = src;
  }, [src, viewportRef, onFit]);

  // Auto-fit once when the dialog opens — only for a freshly uploaded image
  // (autoFit). Editing an existing crop keeps the saved position.
  useEffect(() => {
    if (!open || !onFit || !autoFit) return;
    // Wait for the dialog animation to settle before reading viewport dimensions
    const t = setTimeout(computeFit, 160);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Content data-open={open}>
      <ActionBar>
        <ActionBarHint>
          <MdOpenWith size={14} />
          Drag to reposition · scroll to zoom
        </ActionBarHint>
        <ActionBarButtons>
          <ResetPill type="button" onClick={onReset}>
            <MdRefresh size={13} />
            Reset
          </ResetPill>
          {onFit && (
            <ResetPill type="button" onClick={computeFit}>
              <MdCropFree size={13} />
              Fit
            </ResetPill>
          )}
          {onChangeBanner && (
            <ChangePill type="button" onClick={onChangeBanner}>
              <MdOutlineImage size={13} />
              Change image
            </ChangePill>
          )}
        </ActionBarButtons>
      </ActionBar>

      <ViewportWrap>
        <BannerRect
          $portrait={portrait}
          $aspectRatio={aspectRatio}
          ref={viewportRef as any}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ImageEl
            ref={imgRef}
            style={{
              backgroundImage: src ? `url(${src})` : undefined,
              backgroundSize: `${scale * 100}% auto`,
              backgroundPosition: `${x}% ${y}%`,
            }}
          />
          <Grid $active={dragging} />
        </BannerRect>
      </ViewportWrap>

      <ZoomRow>
        <ZoomStep
          type="button"
          onClick={() => stepZoom(-1)}
          disabled={scale <= ZOOM_MIN}
          aria-label="Zoom out"
        >
          <MdZoomOut size={20} />
        </ZoomStep>
        <Seek
          type="range"
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={0.01}
          value={scale}
          $pct={zoomPct}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          aria-label="Zoom"
        />
        <ZoomStep
          type="button"
          onClick={() => stepZoom(1)}
          disabled={scale >= ZOOM_MAX}
          aria-label="Zoom in"
        >
          <MdZoomIn size={20} />
        </ZoomStep>
        <ZoomBadge>{Math.round(scale * 100)}%</ZoomBadge>
      </ZoomRow>

      <Footer>
        <CancelButton
          type="button"
          onClick={() => {
            onCancel();
            handleClose();
          }}
        >
          Cancel
        </CancelButton>
        <UpdateButton
          type="button"
          onClick={() => {
            onConfirm();
            handleClose();
          }}
          disabled={Boolean(isUploading)}
        >
          {confirmLabel ?? (isUploading ? "Updating…" : "Update")}
        </UpdateButton>
      </Footer>
    </Content>
  );
}

export default BannerCropDialog;
