"use client";

import { clamp } from "@nw/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Zoom limits. The real floor is the map's own fit scale — see `fitToContent`
 * — so MIN_ZOOM is only the guard that applies before an image has been
 * measured. Scale is in image pixels: 1 draws the image at full resolution,
 * MAX_ZOOM at four screen pixels per image pixel.
 */
export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 4;

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface ZoomLimits {
  min: number;
  max: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

/**
 * The most zoomed-out view: the whole image visible inside the stage (a
 * contain fit), centred. Nothing of the map is ever off-screen at the floor.
 */
const computeFit = (
  stageWidth: number,
  stageHeight: number,
  imageWidth: number,
  imageHeight: number,
): Transform | null => {
  if (stageWidth <= 0 || stageHeight <= 0) return null;
  if (imageWidth <= 0 || imageHeight <= 0) return null;
  const scale = Math.min(stageWidth / imageWidth, stageHeight / imageHeight);
  return {
    scale,
    x: (stageWidth - imageWidth * scale) / 2,
    y: (stageHeight - imageHeight * scale) / 2,
  };
};

/** Distance between two active pointers, for pinch zoom. */
const spread = (points: Map<number, { x: number; y: number }>) => {
  const [a, b] = Array.from(points.values());
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
};

const midpoint = (points: Map<number, { x: number; y: number }>) => {
  const [a, b] = Array.from(points.values());
  if (!a || !b) return { x: 0, y: 0 };
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
};

/**
 * Pan and zoom for the map stage.
 *
 * A plain `<img>` inside a CSS-transformed div, rather than a canvas: the pins
 * stay real DOM nodes, so they keep their crispness, their hit areas, and
 * their keyboard focus at every zoom level.
 */
export const usePanZoom = (enabled = true) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  /** The current zoom bounds, for the UI to reflect (readout, disabled buttons). */
  const [limits, setLimits] = useState<ZoomLimits>({
    max: MAX_ZOOM,
    min: MIN_ZOOM,
  });
  /** Live pointers, so a two-finger gesture can be told from a one-finger pan. */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const panRef = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  /** The fitted view — the map's most zoomed-out state, and what reset returns
   *  to. Null until an image has been measured. */
  const fitRef = useRef<Transform | null>(null);
  /** The measured image, so panning can be kept inside the stage. */
  const contentRef = useRef<{ width: number; height: number } | null>(null);
  const minRef = useRef(MIN_ZOOM);
  const maxRef = useRef(MAX_ZOOM);

  /**
   * Keeps the image on the stage: an overflowing axis may pan only until its
   * far edge meets the stage's, and an axis that fits stays centred. The map
   * can never be dragged out of the canvas.
   */
  const clampPan = useCallback(
    (candidate: Transform, stage: { width: number; height: number }) => {
      const content = contentRef.current;
      if (!content) return candidate;
      const width = content.width * candidate.scale;
      const height = content.height * candidate.scale;
      return {
        scale: candidate.scale,
        x:
          width <= stage.width
            ? (stage.width - width) / 2
            : clamp(candidate.x, stage.width - width, 0),
        y:
          height <= stage.height
            ? (stage.height - height) / 2
            : clamp(candidate.y, stage.height - height, 0),
      };
    },
    [],
  );

  /**
   * Measures the stage against the image and makes the fitted view both the
   * current view and the zoom floor. `keepZoom` leaves a reader who has zoomed
   * in where they are (a resize shouldn't yank the map back out); their pan is
   * still re-clamped against the new box.
   */
  const fitToContent = useCallback(
    (imageWidth: number, imageHeight: number, keepZoom = false) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const fit = computeFit(rect.width, rect.height, imageWidth, imageHeight);
      if (!fit) return;

      contentRef.current = { height: imageHeight, width: imageWidth };
      fitRef.current = fit;
      minRef.current = fit.scale;
      // A small image fits at well above 1×, so the ceiling has to clear the
      // floor or there would be no room left to zoom in at all.
      maxRef.current = Math.max(MAX_ZOOM, fit.scale * MAX_ZOOM);
      setLimits({ max: maxRef.current, min: minRef.current });

      setTransform((current) =>
        keepZoom && current.scale > fit.scale ? clampPan(current, rect) : fit,
      );
    },
    [clampPan],
  );

  const reset = useCallback(() => setTransform(fitRef.current ?? IDENTITY), []);

  /** Zooms about a point in client coordinates, so it stays put on screen. */
  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      setTransform((current) => {
        const next = clamp(
          current.scale * factor,
          minRef.current,
          maxRef.current,
        );
        const ratio = next / current.scale;
        const originX = clientX - rect.left;
        const originY = clientY - rect.top;
        return clampPan(
          {
            scale: next,
            x: originX - (originX - current.x) * ratio,
            y: originY - (originY - current.y) * ratio,
          },
          rect,
        );
      });
    },
    [clampPan],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      zoomAt(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    [zoomAt],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 2) {
        // A second finger turns the gesture into a pinch, not a pan.
        panRef.current = null;
        pinchRef.current = {
          distance: spread(pointersRef.current),
          scale: transform.scale,
        };
        return;
      }

      if (e.button !== 0) return;
      panRef.current = {
        tx: transform.x,
        ty: transform.y,
        x: e.clientX,
        y: e.clientY,
      };
    },
    [enabled, transform],
  );

  // Bound to the window rather than the stage so a pan that leaves the map
  // still tracks, and still ends, correctly.
  useEffect(() => {
    if (!enabled) return;

    const move = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const pinch = pinchRef.current;
      if (pinch && pointersRef.current.size === 2) {
        const distance = spread(pointersRef.current);
        if (pinch.distance <= 0) return;
        const centre = midpoint(pointersRef.current);
        const target = clamp(
          (pinch.scale * distance) / pinch.distance,
          minRef.current,
          maxRef.current,
        );
        setTransform((current) => {
          const stage = stageRef.current;
          if (!stage) return current;
          const rect = stage.getBoundingClientRect();
          const ratio = target / current.scale;
          const originX = centre.x - rect.left;
          const originY = centre.y - rect.top;
          return clampPan(
            {
              scale: target,
              x: originX - (originX - current.x) * ratio,
              y: originY - (originY - current.y) * ratio,
            },
            rect,
          );
        });
        return;
      }

      const pan = panRef.current;
      if (!pan) return;
      setTransform((current) => {
        const stage = stageRef.current;
        const next = {
          ...current,
          x: pan.tx + (e.clientX - pan.x),
          y: pan.ty + (e.clientY - pan.y),
        };
        return stage ? clampPan(next, stage.getBoundingClientRect()) : next;
      });
    };

    const end = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) pinchRef.current = null;
      if (pointersRef.current.size === 0) panRef.current = null;
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [enabled, clampPan]);

  // Wheel zoom has to be a non-passive native listener: React's onWheel is
  // passive, so it cannot stop the page scrolling underneath the map.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !enabled) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [enabled, zoomAt]);

  /** True while a pan is in flight, so a click can be told from a drag. */
  const isPanning = () => panRef.current !== null;

  return {
    fitToContent,
    isPanning,
    limits,
    onPointerDown,
    reset,
    stageRef,
    transform,
    zoomBy,
  };
};
