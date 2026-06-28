"use client";

import { useCallback } from "react";
import { FcImageFile } from "react-icons/fc";
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

/** Wide rectangular viewport matching the profile banner aspect ratio (~4:1). */
const BannerRect = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 10 / 3;
  background: var(--bg-1);
  border-radius: 6px;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  &:active {
    cursor: grabbing;
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

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const LeftActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChangeImageButton = styled.button`
  all: unset;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  padding: 6px 8px;
  border-radius: 4px;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: var(--text);
    background: var(--bg-4);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const RightActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ResetText = styled.button`
  all: unset;
  color: var(--accent);
  cursor: pointer;
  font-weight: var(--font-weight-bold);
  padding: 6px 8px;

  &:hover {
    color: var(--accent-hover);
  }
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
  isUploading?: boolean;
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
  isUploading,
  viewportRef,
}: Props) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Content data-open={open}>
      <ViewportWrap>
        <BannerRect
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
        <LeftActions>
          <ResetText type="button" onClick={onReset}>
            Reset
          </ResetText>
          {onChangeBanner && (
            <ChangeImageButton type="button" onClick={onChangeBanner}>
              Change image
            </ChangeImageButton>
          )}
        </LeftActions>

        <RightActions>
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
            {isUploading ? "Updating…" : "Update"}
          </UpdateButton>
        </RightActions>
      </Footer>
    </Content>
  );
}

export default BannerCropDialog;
