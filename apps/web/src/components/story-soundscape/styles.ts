import styled from "styled-components";

/** Height of one cue lane, in pixels — shared with the drag engine. */
export const CUE_LANE_HEIGHT = 46;
/** Sticky cue-name gutter on desktop. */
export const CUE_GUTTER = 132;
/** Below this the ruler scrolls sideways rather than squeezing. */
export const MIN_BOARD_WIDTH = 560;

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

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: ${(p) => (p.$primary ? "#fff" : "var(--text)")};
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

export const Hint = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
`;

// ── Lane board ─────────────────────────────────────────────────────────────

export const Board = styled.div`
  position: relative;
  display: flex;
  border: 1px solid var(--bg-6);
  border-radius: 12px;
  background: var(--bg-2);
  overflow: hidden;
`;

export const Gutter = styled.div`
  flex-shrink: 0;
  width: ${CUE_GUTTER}px;
  border-right: 1px solid var(--bg-6);
  background: var(--bg-2);
  z-index: 2;

  @media (max-width: 700px) {
    display: none;
  }
`;

export const GutterHead = styled.div`
  height: 30px;
  border-bottom: 1px solid var(--bg-5);
`;

export const GutterRow = styled.div<{ $color?: string | null }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: ${CUE_LANE_HEIGHT}px;
  padding: 0 0.6rem;
  border-bottom: 1px solid var(--bg-4);
  font-size: var(--font-size-small);
  color: var(--text);
  min-width: 0;

  &::before {
    content: "";
    flex-shrink: 0;
    width: 4px;
    height: 18px;
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

export const Track = styled.div`
  position: relative;
  min-width: ${MIN_BOARD_WIDTH}px;
`;

/** The passage ruler: P1…Pn across the top. */
export const Ruler = styled.div`
  position: relative;
  display: flex;
  height: 30px;
  border-bottom: 1px solid var(--bg-5);
`;

export const RulerCell = styled.div<{ $current?: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  border-right: 1px solid var(--bg-4);
  color: ${(p) => (p.$current ? "var(--text)" : "var(--text-secondary)")};
  background: ${(p) =>
    p.$current
      ? "color-mix(in srgb, var(--accent) 16%, transparent)"
      : "transparent"};

  &:last-child {
    border-right: none;
  }
`;

export const CueRow = styled.div`
  position: relative;
  height: ${CUE_LANE_HEIGHT}px;
  border-bottom: 1px solid var(--bg-4);

  /* Mobile: the cue name rides in the row, since the gutter is hidden. */
  &::before {
    content: attr(data-cue-name);
    position: sticky;
    left: 0;
    display: none;
    font-size: 0.62rem;
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

/** Marks where the reader currently is, straight down the board. */
export const Playhead = styled.div`
  position: absolute;
  top: 30px;
  bottom: 0;
  pointer-events: none;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border-left: 1px solid var(--accent);
  border-right: 1px solid var(--accent);
  z-index: 1;
`;

export const Bar = styled.div<{
  $color?: string | null;
  $dragging?: boolean;
  $editable?: boolean;
  $live?: boolean;
}>`
  position: absolute;
  top: 8px;
  height: ${CUE_LANE_HEIGHT - 18}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.5rem;
  border-radius: 6px;
  color: #fff;
  font-size: var(--font-size-small);
  background: ${(p) => p.$color || "var(--accent)"};
  border: 1px solid
    ${(p) => (p.$live ? "#fff" : "rgba(0, 0, 0, 0.25)")};
  box-shadow: ${(p) =>
    p.$dragging
      ? "0 6px 18px rgba(0, 0, 0, 0.35)"
      : "0 1px 3px rgba(0, 0, 0, 0.25)"};
  cursor: ${(p) => (p.$editable ? "grab" : "pointer")};
  touch-action: pan-y;
  user-select: none;
  overflow: hidden;
  z-index: ${(p) => (p.$dragging ? 5 : 3)};

  /* Fade ramps drawn into the bar's own ends, so the shape of the cue is
     legible at a glance. */
  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 14px;
    pointer-events: none;
  }
  &::before {
    left: 0;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.35), transparent);
  }
  &::after {
    right: 0;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.35), transparent);
  }

  &:active {
    cursor: ${(p) => (p.$editable ? "grabbing" : "pointer")};
  }
`;

export const BarLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
`;

export const BarHandle = styled.span<{ $side: "start" | "end" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${(p) => (p.$side === "start" ? "left: 0;" : "right: 0;")}
  width: 10px;
  cursor: ew-resize;
  touch-action: none;
  z-index: 2;

  &::after {
    content: "";
    position: absolute;
    top: 28%;
    bottom: 28%;
    ${(p) => (p.$side === "start" ? "left: 3px;" : "right: 3px;")}
    width: 2px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.75);
  }
`;

export const EmptyBoard = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  font-size: var(--font-size-small);
  line-height: 1.6;
  color: var(--text-secondary);
`;

// ── Enable toggle ──────────────────────────────────────────────────────────

export const EnableButton = styled.button<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  cursor: pointer;
  white-space: nowrap;
  color: ${(p) => (p.$on ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$on ? "var(--accent)" : "var(--material-fill)")};
  border: 1px solid
    ${(p) => (p.$on ? "var(--accent)" : "var(--material-edge)")};

  &:hover {
    color: ${(p) => (p.$on ? "#fff" : "var(--text)")};
  }

  .badge {
    font-size: 0.66rem;
    opacity: 0.85;
  }
`;

// ── Waveform trimmer ───────────────────────────────────────────────────────

export const Trimmer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const TrimmerTrack = styled.div`
  position: relative;
  height: 72px;
  border-radius: 0.5rem;
  background: var(--bg-1);
  border: 1px solid var(--bg-6);
  overflow: hidden;
  touch-action: none;
`;

export const TrimmerCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

export const TrimmerHandle = styled.span<{ $side: "start" | "end" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  margin-left: -6px;
  cursor: ew-resize;
  touch-action: none;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 5px;
    width: 2px;
    background: var(--accent);
  }
`;

export const TrimmerPlayhead = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #fff;
  opacity: 0.85;
  pointer-events: none;
`;

export const TrimmerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const TrimmerPlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-6);

  &:hover {
    color: var(--text);
    border-color: var(--accent);
  }
`;

export const TrimmerNote = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const TrimmerReset = styled.button`
  flex-shrink: 0;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--bg-6);

  &:hover {
    border-color: var(--accent);
    color: var(--text);
  }
`;

// ── Cue sheet bits ─────────────────────────────────────────────────────────

export const SongList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 28svh;
  overflow-y: auto;
`;

export const SongItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.55rem;
  border-radius: 0.5rem;
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-small);
  color: var(--text);
  background: ${(p) =>
    p.$active
      ? "color-mix(in srgb, var(--accent) 14%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};

  span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

/** Chapter picker for the workspace's Sound view (mobile's navigation). */
export const ChapterPicker = styled.div`
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  -webkit-overflow-scrolling: touch;

  /* Desktop drives chapter selection from the workspace list panel. */
  @media (min-width: 1101px) {
    display: none;
  }
`;

export const ChapterPickerTab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  white-space: nowrap;
  font-size: var(--font-size-small);
  cursor: pointer;
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-3)")};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};
`;
