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

  @media (max-width: 480px) {
    padding: 8px 4px;
  }
`;

const ViewportWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const Square = styled.div`
  position: relative;
  width: min(320px, 100%);
  aspect-ratio: 1 / 1;
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 92%;
  height: 92%;
  background-image: url(${(p) => p.$src});
  background-repeat: no-repeat;
  /* Two-value size: width% auto — height scales proportionally (fit by width),
     so a tall image overflows top/bottom and can be panned vertically.
     background-position selects which slice shows; this is aspect-ratio- and
     resolution-independent and matches the Muse cardBackground model. */
  background-size: ${(p) => p.$scale * 100}% auto;
  background-position: ${(p) => `${p.$x}% ${p.$y}%`};
  pointer-events: none;
  user-select: none;
  touch-action: none;
`;

const CircleBorderMask = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 92%;
  height: 92%;
  border-radius: 50%;
  border: 4px solid var(--accent);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
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

const LeftActions = styled.div``;
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
  isUploading?: boolean;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
};

export function AvatarCropDialog({
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
  isUploading,
  viewportRef,
}: Props) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    // Presentational content — parent dialog will control portals
    <Content data-open={open}>
      <ViewportWrap>
        <Square
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
          <CircleBorderMask />
        </Square>
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

export default AvatarCropDialog;
