"use client";

/**
 * CardCropEditor
 *
 * Lets the user drag and zoom an image to choose how it will be cropped
 * when displayed on the 4:5 muse card.
 *
 * We encode the result into `ImageCropFilter` as:
 *   x      = CSS background-position-x  (0–100 %)
 *   y      = CSS background-position-y  (0–100 %)
 *   width  = CSS background-size        (100 = 1×, 200 = 2×, …)
 *   height = same as width (uniform scale)
 *   src    = image URL
 *
 * This lets the renderer reproduce the exact same look without needing
 * the original natural image dimensions.  The backend can use x/y/width
 * as pixel values if it ever needs to do server-side cropping (with the
 * natural dimensions as the scaling reference), but for UI display the
 * CSS encoding is sufficient.
 */

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ImageCropFilter } from "@/types";
import * as S from "./styled";

type Props = {
  src: string;
  crop?: ImageCropFilter | null;
  /** Called whenever the user adjusts position or zoom */
  onChange: (crop: ImageCropFilter) => void;
  /** Hide the internal label/hint — use when the parent provides its own heading */
  hideHeader?: boolean;
};

/**
 * Encode internal (bgX%, bgY%, scale) → ImageCropFilter.
 * x/y are background-position percentages (0–100).
 * width/height are the scale * 100 (100 = 1×, 200 = 2×, …).
 */
function toCropFilter(
  src: string,
  bgX: number,
  bgY: number,
  scale: number,
): ImageCropFilter {
  const scalePct = Math.round(scale * 100);
  return {
    height: scalePct,
    src,
    width: scalePct,
    x: Math.round(bgX),
    y: Math.round(bgY),
  };
}

/**
 * Decode ImageCropFilter → internal (bgX%, bgY%, scale).
 * Handles both the new CSS-percentage encoding and the legacy
 * pixel-based encoding (where width >> 100 indicates pixels).
 */
function fromCropFilter(crop: ImageCropFilter): {
  bgX: number;
  bgY: number;
  scale: number;
} {
  // New encoding: width is scale * 100 (always 100–300 range)
  if (crop.width > 0 && crop.width <= 300) {
    return {
      bgX: crop.x,
      bgY: crop.y,
      scale: crop.width / 100,
    };
  }
  // Legacy pixel encoding – fall back to centered view at 1× scale
  return { bgX: 50, bgY: 50, scale: 1 };
}

export function CardCropEditor({ src, crop, onChange, hideHeader }: Props) {
  const [bgX, setBgX] = useState(50);
  const [bgY, setBgY] = useState(50);
  const [scale, setScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{
    px: number;
    py: number;
    bx: number;
    by: number;
  } | null>(null);

  // Seed state from crop prop when src changes
  useEffect(() => {
    if (crop) {
      const parsed = fromCropFilter(crop);
      setBgX(parsed.bgX);
      setBgY(parsed.bgY);
      setScale(parsed.scale);
    } else {
      setBgX(50);
      setBgY(50);
      setScale(1);
    }
  }, [src]); // intentionally only on src change so dragging doesn't re-seed

  const emitChange = useCallback(
    (x: number, y: number, s: number) => {
      onChange(toCropFilter(src, x, y, s));
    },
    [src, onChange],
  );

  // ── Pointer drag ────────────────────────────────────────────────────────────

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { bx: bgX, by: bgY, px: e.clientX, py: e.clientY };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();

    // How many percent does 1px of drag correspond to in bg-position?
    // Moving right → image shifts right → bgX increases
    const dx = ((e.clientX - dragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.py) / rect.height) * 100;

    const newX = Math.min(100, Math.max(0, dragStart.current.bx - dx));
    // -dy: drag down (positive dy) decreases bgY → content shifts down in viewport
    const newY = Math.min(100, Math.max(0, dragStart.current.by - dy));

    setBgX(newX);
    setBgY(newY);
    emitChange(newX, newY, scale);
  };

  const onPointerUp = () => {
    dragStart.current = null;
  };

  // ── Wheel zoom ──────────────────────────────────────────────────────────────

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const next = Math.min(3, Math.max(1, scale + delta));
    setScale(next);
    emitChange(bgX, bgY, next);
  };

  // ── Slider zoom ─────────────────────────────────────────────────────────────

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setScale(next);
    emitChange(bgX, bgY, next);
  };

  return (
    <S.CropEditorSection>
      {!hideHeader && (
        <>
          <S.CropEditorLabel>Card Image Positioning</S.CropEditorLabel>
          <S.CropEditorHint>
            Drag the preview to reposition the image. Use the slider (or scroll)
            to zoom.
          </S.CropEditorHint>
        </>
      )}

      <S.CropViewport
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <S.CropImage $src={src} $x={bgX} $y={bgY} $scale={scale} />
      </S.CropViewport>

      <S.CropScaleRow>
        <label htmlFor="crop-scale">
          <span>Zoom</span>
          <span className="value">{scale.toFixed(2)}×</span>
        </label>
        <input
          id="crop-scale"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={scale}
          onChange={handleScaleChange}
        />
      </S.CropScaleRow>
    </S.CropEditorSection>
  );
}
