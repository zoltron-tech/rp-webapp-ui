"use client";

import { useCallback, useEffect } from "react";
import { FcImageFile } from "react-icons/fc";
import { MdCropFree, MdOutlineImage, MdRefresh } from "react-icons/md";
import styled from "styled-components";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 12px;
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
      ? `height: 240px; width: auto; max-width: none;`
      : `width: 100%; max-width: 480px;`}
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio ?? "5 / 2"};
  background: var(--bg-1);
  border-radius: 6px;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }

  @media (max-width: 480px) {
    ${({ $portrait }) => $portrait && `height: 200px;`}
  }
`;

const ImageEl = styled.div<{
  $src: string;
  $x: number;
  $y: number;
  $scale: number;
}>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-image: url(${(p) => p.$src});
  background-repeat: no-repeat;
  background-size: ${(p) => p.$scale * 100}% auto;
  background-position: ${(p) => `${p.$x}% ${p.$y}%`};
  pointer-events: none;
  user-select: none;
  touch-action: none;
`;

const ZoomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Seek = styled.input`
  appearance: none;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent) 100%);
  width: 160px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-hover);
    border: none;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.12);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-hover);
    border: none;
    cursor: pointer;
  }
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
`;

const ActionBarHint = styled.span`
  font-size: 11px;
  color: var(--text-tertiary, var(--text-secondary));
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  opacity: 0.7;
`;

const ActionBarButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
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
  gap: 4px;
  padding: 4px 12px 4px 10px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

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
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e?: any) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onScaleChange: (v: number) => void;
  onReset: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onChangeBanner?: () => void;
  onFit?: (fitScale: number) => void;
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
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onTouchStart,
  onTouchMove,
  onWheel,
  onScaleChange,
  onReset,
  onCancel,
  onConfirm,
  onChangeBanner,
  onFit,
  isUploading,
  confirmLabel,
  aspectRatio,
  portrait,
  viewportRef,
}: Props) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

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

  // Auto-fit once when the dialog opens (only when onFit is wired up)
  useEffect(() => {
    if (!open || !onFit) return;
    // Wait for the dialog animation to settle before reading viewport dimensions
    const t = setTimeout(computeFit, 160);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Content data-open={open}>
      <ActionBar>
        <ActionBarHint>Drag · Scroll to zoom</ActionBarHint>
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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          <ImageEl $src={src} $x={x} $y={y} $scale={scale} />
        </BannerRect>
      </ViewportWrap>

      <ZoomRow>
        <FcImageFile size={20} />
        <Seek
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          aria-label="Zoom"
        />
        <FcImageFile size={28} />
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
