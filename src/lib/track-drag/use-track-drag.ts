"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pointer-driven move/resize for blocks laid out on a horizontal track.
 *
 * dnd-kit (used for chapter reordering) sorts — it has no notion of an edge
 * handle or of a continuous axis, which is exactly what a timeline block and a
 * sound cue both need. This is the shared engine for those: the timeline
 * (§3) and the sound-cue lane board (§6) drive the same interaction, so the
 * behaviour is written once.
 *
 * It deals only in *axis units* (whatever the caller's axis is measured in) and
 * knows nothing about what is being dragged.
 */

export type TrackDragMode = "move" | "resize-start" | "resize-end";

/** Maps the track element's pixels onto the caller's axis units. */
export interface TrackGeometry {
  /** Left edge of the track, in client pixels. */
  left: number;
  /** Track width, in client pixels. */
  width: number;
  /** Axis value at the track's left edge. */
  axisMin: number;
  /** Axis value at the track's right edge. */
  axisMax: number;
}

export interface TrackDragState<T> {
  /** What is being dragged. */
  item: T;
  mode: TrackDragMode;
  /** Live span, in axis units, updated on every pointer move. */
  start: number;
  end: number;
  /** Live lane index while dragging vertically; null when lanes aren't used. */
  laneIndex: number | null;
}

interface Options<T> {
  /** Measures the track at drag start (its box can move between drags). */
  getGeometry: () => TrackGeometry | null;
  /** Snap the dragged edges to these axis values when within [snapThreshold]. */
  snapTargets?: number[];
  /** Snap radius, in axis units. */
  snapThreshold?: number;
  /** Smallest span a block may be resized to, in axis units. */
  minSpan?: number;
  /** Row height in pixels; omit to disable lane changes. */
  laneHeight?: number;
  /** Number of lanes, for clamping a vertical drag. */
  laneCount?: number;
  /** Fired on every pointer move, for optimistic rendering. */
  onPreview?: (state: TrackDragState<T>) => void;
  /** Fired once on pointer-up, with the settled span. */
  onCommit: (state: TrackDragState<T>) => void;
}

export interface TrackDragHandle<T> {
  /** Current drag, or null when idle. */
  drag: TrackDragState<T> | null;
  /** Attach to a block (`move`) or to its edge handles. */
  begin: (
    e: React.PointerEvent,
    item: T,
    mode: TrackDragMode,
    span: { start: number; end: number; laneIndex?: number | null },
  ) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Pulls `value` onto the nearest target inside the snap radius. */
const snap = (value: number, targets: number[], threshold: number) => {
  let best = value;
  let bestDistance = threshold;
  for (const target of targets) {
    const distance = Math.abs(target - value);
    if (distance <= bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
};

export const useTrackDrag = <T>({
  getGeometry,
  snapTargets = [],
  snapThreshold = 0,
  minSpan = 0,
  laneHeight,
  laneCount = 0,
  onPreview,
  onCommit,
}: Options<T>): TrackDragHandle<T> => {
  const [drag, setDrag] = useState<TrackDragState<T> | null>(null);

  /** The live drag, mirrored outside React so pointer handlers see it fresh. */
  const sessionRef = useRef<{
    state: TrackDragState<T>;
    geometry: TrackGeometry;
    origin: { x: number; y: number };
    startSpan: { start: number; end: number };
    startLane: number | null;
    pointerId: number;
  } | null>(null);

  // Everything the pointer handlers read lives in refs: the listeners are
  // bound once per drag, and an inline arrow (or a fresh `snapTargets` array)
  // in the consumer's JSX must not tear them down mid-gesture.
  const optionsRef = useRef({
    laneCount,
    laneHeight,
    minSpan,
    onCommit,
    onPreview,
    snapTargets,
    snapThreshold,
  });
  optionsRef.current = {
    laneCount,
    laneHeight,
    minSpan,
    onCommit,
    onPreview,
    snapTargets,
    snapThreshold,
  };

  const begin = useCallback(
    (
      e: React.PointerEvent,
      item: T,
      mode: TrackDragMode,
      span: { start: number; end: number; laneIndex?: number | null },
    ) => {
      // Ignore secondary buttons — right-click opens the block's own menu.
      if (e.button !== 0) return;
      const geometry = getGeometry();
      if (!geometry || geometry.width <= 0) return;

      e.preventDefault();
      e.stopPropagation();

      const state: TrackDragState<T> = {
        end: span.end,
        item,
        laneIndex: span.laneIndex ?? null,
        mode,
        start: span.start,
      };
      sessionRef.current = {
        geometry,
        origin: { x: e.clientX, y: e.clientY },
        pointerId: e.pointerId,
        startLane: span.laneIndex ?? null,
        startSpan: { end: span.end, start: span.start },
        state,
      };
      setDrag(state);
    },
    [getGeometry],
  );

  // Bound once per gesture (not per pointer move): `active` only flips at the
  // start and end of a drag, so the listeners survive the whole thing.
  const active = drag !== null;

  useEffect(() => {
    if (!active) return;

    const move = (e: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || e.pointerId !== session.pointerId) return;

      const { laneCount, laneHeight, minSpan, snapThreshold, snapTargets } =
        optionsRef.current;
      const { geometry, origin, startSpan, startLane, state } = session;
      const axisSpan = geometry.axisMax - geometry.axisMin;
      const perPixel = axisSpan / geometry.width;
      const delta = (e.clientX - origin.x) * perPixel;

      let start = startSpan.start;
      let end = startSpan.end;

      if (state.mode === "move") {
        const width = end - start;
        start = clamp(
          snap(startSpan.start + delta, snapTargets, snapThreshold),
          geometry.axisMin,
          geometry.axisMax - width,
        );
        end = start + width;
      } else if (state.mode === "resize-start") {
        start = clamp(
          snap(startSpan.start + delta, snapTargets, snapThreshold),
          geometry.axisMin,
          end - minSpan,
        );
      } else {
        end = clamp(
          snap(startSpan.end + delta, snapTargets, snapThreshold),
          start + minSpan,
          geometry.axisMax,
        );
      }

      // Dragging the body vertically moves the block between lanes; resizing
      // an edge never does.
      let laneIndex = startLane;
      if (
        state.mode === "move" &&
        laneHeight &&
        laneHeight > 0 &&
        startLane !== null
      ) {
        const rows = Math.round((e.clientY - origin.y) / laneHeight);
        laneIndex = clamp(startLane + rows, 0, Math.max(0, laneCount - 1));
      }

      const next: TrackDragState<T> = { ...state, end, laneIndex, start };
      session.state = next;
      setDrag(next);
      optionsRef.current.onPreview?.(next);
    };

    const finish = (e: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || e.pointerId !== session.pointerId) return;
      sessionRef.current = null;
      setDrag(null);
      optionsRef.current.onCommit(session.state);
    };

    const cancel = () => {
      sessionRef.current = null;
      setDrag(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [active]);

  return { begin, drag };
};
