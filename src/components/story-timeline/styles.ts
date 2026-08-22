import styled, { css } from "styled-components";

/** Height of one lane row, in pixels. The drag engine converts a vertical
 *  drag into lane steps with this, so it must match the rendered row. */
export const LANE_HEIGHT = 64;
/** Width of the sticky lane-name gutter on desktop. */
export const LANE_GUTTER = 132;
/** Narrowest the axis is allowed to get before the track scrolls sideways. */
export const MIN_TRACK_WIDTH = 640;
/** The marker strip. */
export const MARKER_ROW_HEIGHT = 34;
/** The in-story dates, on their own strip above the markers so the two
 *  never collide. */
export const DATE_ROW_HEIGHT = 24;
/** Everything above the first lane row — what the vertical rules hang from. */
export const AXIS_HEIGHT = MARKER_ROW_HEIGHT + DATE_ROW_HEIGHT;

export const Root = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: var(--font-size);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const Spacer = styled.span`
  flex: 1;
`;

export const ToolButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  cursor: pointer;
  color: ${(p) => (p.$primary ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$primary ? "var(--accent)" : "var(--bg-3)")};
  border: 1px solid ${(p) => (p.$primary ? "var(--accent)" : "var(--bg-6)")};
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: ${(p) => (p.$primary ? "#fff" : "var(--text)")};
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

/** Board frame. On mobile the whole track scrolls sideways (as in the mock). */
export const Board = styled.div`
  position: relative;
  display: flex;
  border: 1px solid var(--bg-6);
  border-radius: 12px;
  background: var(--bg-2);
  overflow: hidden;
`;

/** Sticky lane names, desktop only — on mobile they sit above each row. */
export const Gutter = styled.div`
  flex-shrink: 0;
  width: ${LANE_GUTTER}px;
  border-right: 1px solid var(--bg-6);
  background: var(--bg-2);
  z-index: 2;

  @media (max-width: 700px) {
    display: none;
  }
`;

export const GutterHead = styled.div`
  height: ${AXIS_HEIGHT}px;
  border-bottom: 1px solid var(--bg-5);
`;

export const GutterRow = styled.div<{ $color?: string | null }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: ${LANE_HEIGHT}px;
  padding: 0 0.6rem;
  border-bottom: 1px solid var(--bg-4);
  font-size: var(--font-size-small);
  color: var(--text);
  min-width: 0;

  &::before {
    content: "";
    flex-shrink: 0;
    width: 4px;
    height: 22px;
    border-radius: 2px;
    background: ${(p) => p.$color || "var(--accent)"};
  }
`;

export const GutterName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GutterAction = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

export const Scroller = styled.div`
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
`;

/** The axis + lane rows. Wider than the viewport on small screens. */
export const Track = styled.div`
  position: relative;
  min-width: ${MIN_TRACK_WIDTH}px;
`;

/** The in-story dates of every placed chapter, always on show. */
export const DateRow = styled.div`
  position: relative;
  height: ${DATE_ROW_HEIGHT}px;
`;

export const AxisRow = styled.div`
  position: relative;
  height: ${MARKER_ROW_HEIGHT}px;
  border-bottom: 1px solid var(--bg-5);
`;

export const Marker = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 0.25rem;
  z-index: 1;

  &:hover {
    color: var(--text);
  }
`;

/** A chapter's in-story date, pinned to its start edge on the axis. Quiet
 *  while it simply sits there; lit up while that chapter is being dragged. */
export const EventDate = styled.div<{ $active?: boolean }>`
  position: absolute;
  top: 50%;
  white-space: nowrap;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.68rem;
  letter-spacing: 0.03em;
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-4)")};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};
  box-shadow: ${(p) => (p.$active ? "0 2px 6px rgba(0, 0, 0, 0.3)" : "none")};
  pointer-events: none;
  z-index: ${(p) => (p.$active ? 4 : 1)};
`;

/** The rule under the dragged chapter's date — what ties it to the exact
 *  start edge. */
export const DragLine = styled.div`
  position: absolute;
  top: ${AXIS_HEIGHT}px;
  bottom: 0;
  width: 1px;
  background: var(--accent);
  pointer-events: none;
  z-index: 4;
`;

/** The marker's rule, dropped down through every lane row. */
export const MarkerLine = styled.div`
  position: absolute;
  top: ${AXIS_HEIGHT}px;
  bottom: 0;
  width: 1px;
  background: var(--bg-5);
  pointer-events: none;
`;

export const LaneRow = styled.div<{ $dropTarget?: boolean }>`
  position: relative;
  height: ${LANE_HEIGHT}px;
  border-bottom: 1px solid var(--bg-4);
  background: ${(p) =>
    p.$dropTarget
      ? "color-mix(in srgb, var(--accent) 8%, transparent)"
      : "transparent"};

  /* Mobile: the lane name rides along inside the row, since the gutter is
     hidden and the track scrolls away from it. */
  &::before {
    content: attr(data-lane-name);
    position: sticky;
    left: 0;
    display: none;
    font-size: 0.65rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    padding: 2px 6px;
  }

  @media (max-width: 700px) {
    &::before {
      display: inline-block;
    }
  }
`;

const flashbackStripes = css`
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.14) 0 4px,
    transparent 4px 9px
  );
`;

export const Block = styled.div<{
  $color?: string | null;
  $flashback?: boolean;
  $dragging?: boolean;
  $editable?: boolean;
}>`
  position: absolute;
  top: 10px;
  height: ${LANE_HEIGHT - 22}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  border-radius: 7px;
  color: #fff;
  font-size: var(--font-size-small);
  background: ${(p) => p.$color || "var(--accent)"};
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: ${(p) =>
    p.$dragging
      ? "0 6px 18px rgba(0, 0, 0, 0.35)"
      : "0 1px 3px rgba(0, 0, 0, 0.25)"};
  cursor: ${(p) => (p.$editable ? "grab" : "pointer")};
  touch-action: pan-y;
  user-select: none;
  overflow: hidden;
  z-index: ${(p) => (p.$dragging ? 5 : 3)};

  ${(p) => p.$flashback && flashbackStripes}

  &:active {
    cursor: ${(p) => (p.$editable ? "grabbing" : "pointer")};
  }
`;

export const BlockLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
`;

/** Drag handles on a block's left/right edges. */
export const BlockHandle = styled.span<{ $side: "start" | "end" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${(p) => (p.$side === "start" ? "left: 0;" : "right: 0;")}
  width: 10px;
  cursor: ew-resize;
  touch-action: none;

  &::after {
    content: "";
    position: absolute;
    top: 30%;
    bottom: 30%;
    ${(p) => (p.$side === "start" ? "left: 3px;" : "right: 3px;")}
    width: 2px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.65);
  }
`;

/** Marks a block whose timeline order disagrees with its reading order. */
export const OutOfOrderDot = styled.span`
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25);
  pointer-events: none;
`;

export const EmptyBoard = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

// ── Unplaced shelf ─────────────────────────────────────────────────────────

export const Shelf = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px dashed var(--bg-6);
  border-radius: 12px;
`;

export const ShelfTitle = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const ShelfRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

export const ShelfChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  cursor: pointer;
  max-width: 100%;

  &:hover:not(:disabled) {
    border-color: var(--accent);
  }

  &:disabled {
    cursor: default;
  }

  .ordinal {
    color: var(--text-secondary);
    font-size: 0.7rem;
  }
`;

// The sheet chrome and form primitives are shared with the codex view, so the
// two editors look and behave identically.
export * from "@/components/common/responsive-sheet/styles";
