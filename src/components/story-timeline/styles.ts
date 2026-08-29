import styled, { css } from "styled-components";
import {
  boardSurface,
  weaveCss,
} from "@/components/common/canvas-weave/styles";

// ── Band geometry ──────────────────────────────────────────────────────────
// A timeline is drawn as a single horizontal thread (the spine). Chapters do
// not sit *in* a row: they branch off the spine, above it or below it, on a
// diagonal thread. Everything below is the px arithmetic that keeps the two
// halves symmetric, so a band's spine always lands on its exact centre — the
// drag engine converts a vertical drag into band steps and needs that.

/** Height of one chapter bar. Tall enough for two lines: the chapter's name,
 *  and its in-story date underneath. */
export const BAR_HEIGHT = 42;
/** Vertical pitch between stacked bars on the same side of the spine. */
export const LEVEL_GAP = 48;
/** Distance from the spine to the nearest bar — the thread's rise. */
export const STEM_RISE = 16;
/** Horizontal run of the thread, i.e. how far the diagonal leans. */
export const STEM_RUN = 16;
/** Breathing room between the outermost bar and the band's edge. */
export const BAND_PAD = 10;

/** Band height for a board whose deepest stack is `maxLevel` (0-based). */
export const bandHeight = (maxLevel: number) =>
  2 * (STEM_RISE + maxLevel * LEVEL_GAP + BAR_HEIGHT + BAND_PAD);

/** Offset from the spine to a bar's inner edge at `level`. */
export const levelOffset = (level: number) => STEM_RISE + level * LEVEL_GAP;

/** Width of the sticky timeline-name gutter on desktop. */
export const LANE_GUTTER = 132;
/** Narrowest the axis is allowed to get before the track scrolls sideways. */
export const MIN_TRACK_WIDTH = 640;
/** The marker strip — the only thing above the first band, and what the
 *  vertical rules hang from. In-story dates are not up here: each chapter
 *  carries its own date inside its bar, where it cannot be crowded out by a
 *  neighbour's. */
export const MARKER_ROW_HEIGHT = 34;
export const AXIS_HEIGHT = MARKER_ROW_HEIGHT;

/** The expanded detail card. Fixed so its placement can be solved in px
 *  before it is ever rendered, rather than measured after a paint.
 *
 *  Deliberately small: it is a glance at one chapter opened over a board the
 *  reader is still reading, not a page about it. Anything that needs more
 *  room than this belongs in the chapter's own sheet, which is one tap away
 *  on the bar itself. */
export const CARD_WIDTH = 210;
export const CARD_HEIGHT = 62;

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
  border-radius: 14px;
  ${boardSurface}
  overflow: hidden;
`;

/** Sticky timeline names, desktop only — on mobile they ride inside the band. */
export const Gutter = styled.div`
  flex-shrink: 0;
  width: ${LANE_GUTTER}px;
  border-right: 1px solid var(--bg-6);
  background: color-mix(in srgb, var(--bg-2) 82%, transparent);
  backdrop-filter: blur(4px);
  z-index: 2;

  @media (max-width: 700px) {
    display: none;
  }
`;

export const GutterHead = styled.div`
  height: ${AXIS_HEIGHT}px;
  border-bottom: 1px solid var(--bg-5);
`;

export const GutterRow = styled.div<{
  $color?: string | null;
  $height: number;
}>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: ${(p) => p.$height}px;
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

/** The axis + bands. Wider than the viewport on small screens, and never
 *  shorter than one detail card so an expanded chapter is never clipped. */
export const Track = styled.div`
  position: relative;
  min-width: ${MIN_TRACK_WIDTH}px;
  min-height: ${AXIS_HEIGHT + CARD_HEIGHT + 16}px;

  ${weaveCss}
`;

/** The board's texture, under everything and scrolling with the track so it
 *  covers the whole run of the timeline rather than just the viewport. */
export const Weave = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const AxisRow = styled.div`
  position: relative;
  height: ${MARKER_ROW_HEIGHT}px;
  border-bottom: 1px solid var(--bg-5);
`;

/**
 * A named point on the axis, drawn as a flag rather than loose type.
 *
 * These are the only thing giving an abstract position a meaning, so they have
 * to hold their own against the chapters: a bordered chip, and a stem tying it
 * down to the exact pixel it names.
 */
export const Marker = styled.div<{ $active?: boolean }>`
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 0.28rem;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};
  background: ${(p) => (p.$active ? "var(--bg-4)" : "var(--bg-3)")};
  font-size: 0.66rem;
  letter-spacing: 0.03em;
  color: ${(p) => (p.$active ? "var(--text)" : "var(--text-secondary)")};
  cursor: pointer;
  z-index: 2;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

  /* The pip that ties the flag to its position. */
  &::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${(p) =>
      p.$active
        ? "var(--accent)"
        : "color-mix(in srgb, var(--accent) 70%, transparent)"};
    transition: background 0.15s ease;
  }

  /* The stem down to where the dropped rule begins. */
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    width: 1px;
    /* Just far enough to meet the head of the dropped rule at the axis —
       longer and the two overlap in different colours. */
    height: 8px;
    transform: translateX(-50%);
    /* Accent, not grey: the stem hands straight over to the dropped rule's
       diamond head, and the two must read as one mark. */
    background: ${(p) =>
      p.$active
        ? "var(--accent)"
        : "color-mix(in srgb, var(--accent) 70%, transparent)"};
    transition: background 0.15s ease;
  }

  &:hover {
    color: var(--text);
    border-color: var(--accent);
  }

  &:hover::before,
  &:hover::after {
    background: var(--accent);
  }
`;

/** The rule under the dragged chapter's start edge — what ties it to the exact
 *  start edge. */
export const DragLine = styled.div`
  position: absolute;
  top: ${AXIS_HEIGHT}px;
  bottom: 0;
  width: 1px;
  background: var(--accent);
  pointer-events: none;
  z-index: 7;
`;

/** The marker's rule, dropped down through every band. */
/**
 * The rule a marker drops through every timeline.
 *
 * This is the one thing tying an abstract axis position to a name, so it is
 * drawn to be found: a 2px accent dash with more mark than gap, a diamond head
 * at the axis, and a soft column of light washing out either side of it. The
 * wash is what gives the rule presence without thickening the line itself —
 * weight enough to read across a tall board, still quiet enough that the
 * chapters crossing it stay the subject.
 *
 * It sits under the bars in paint order, so however prominent it gets it can
 * never obscure a chapter.
 *
 * Goes solid while its own marker is under the pointer, which is what makes
 * one rule followable all the way down a crowded board.
 */
export const MarkerLine = styled.div<{ $active?: boolean }>`
  position: absolute;
  top: ${AXIS_HEIGHT}px;
  bottom: 0;
  width: 2px;
  /* Centred on the position rather than hung to its right, so it lines up
     with the flag's own stem. */
  transform: translateX(-50%);
  background: ${(p) =>
    p.$active
      ? "var(--accent)"
      : `repeating-linear-gradient(
          to bottom,
          color-mix(in srgb, var(--accent) 72%, transparent) 0 8px,
          transparent 8px 14px
        )`};
  opacity: ${(p) => (p.$active ? 1 : 0.9)};
  pointer-events: none;
  transition: opacity 0.15s ease;

  /* The column of light. Wide and very faint — it reads as the rule having
     depth rather than as a second mark beside it. */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 16px;
    transform: translateX(-50%);
    background: linear-gradient(
      to right,
      transparent,
      color-mix(
        in srgb,
        var(--accent) ${(p) => (p.$active ? 18 : 10)}%,
        transparent
      ),
      transparent
    );
    transition: background 0.15s ease;
  }

  /* The head of the rule, at the axis, where the flag's stem hands over. */
  &::before {
    content: "";
    position: absolute;
    top: -4px;
    left: 50%;
    width: 7px;
    height: 7px;
    transform: translateX(-50%) rotate(45deg);
    background: var(--accent);
    box-shadow: 0 0 0 2px var(--bg-2);
  }
`;

// ── One timeline ───────────────────────────────────────────────────────────

export const Band = styled.div<{ $height: number; $dropTarget?: boolean }>`
  position: relative;
  height: ${(p) => p.$height}px;
  border-bottom: 1px solid var(--bg-4);
  background: ${(p) =>
    p.$dropTarget
      ? "color-mix(in srgb, var(--accent) 8%, transparent)"
      : "transparent"};
`;

/** The timeline itself: one horizontal thread across the whole board. */
export const Spine = styled.div<{ $color?: string | null }>`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 1px;
  /* Fades out at both ends, so a timeline reads as running on past the board
     rather than stopping dead at its edge. */
  background: linear-gradient(
    to right,
    transparent 0%,
    ${(p) => p.$color || "var(--accent)"} 4%,
    ${(p) => p.$color || "var(--accent)"} 96%,
    transparent 100%
  );
  opacity: 0.5;
  pointer-events: none;
`;

/** Where a chapter's thread leaves the spine — its true start position. */
export const Node = styled.span<{ $color?: string | null; $active?: boolean }>`
  position: absolute;
  width: ${(p) => (p.$active ? 10 : 8)}px;
  height: ${(p) => (p.$active ? 10 : 8)}px;
  border-radius: 50%;
  background: ${(p) => p.$color || "var(--accent)"};
  /* Punched out of the spine it sits on, so the thread reads as leaving the
     line rather than crossing it. */
  box-shadow:
    0 0 0 3px var(--bg-2),
    ${(p) =>
      p.$active
        ? `0 0 0 5px color-mix(in srgb, ${p.$color || "var(--accent)"} 35%, transparent)`
        : "0 0 0 0 transparent"};
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: width 0.15s ease, height 0.15s ease, box-shadow 0.15s ease;
  z-index: 3;
`;

/**
 * The diagonal thread from the spine out to a bar.
 *
 * Drawn as a gradient stripe rather than an SVG line: the box's left edge is
 * a percentage of the track while its height is in pixels, which no single
 * SVG coordinate system expresses. A corner-keyword gradient's 50% stop runs
 * exactly corner to corner whatever the box's aspect, so the stripe stays on
 * the diagonal at any stack depth.
 */
export const Stem = styled.span<{
  $side: "above" | "below";
  $color?: string | null;
}>`
  position: absolute;
  pointer-events: none;
  z-index: 2;
  opacity: 0.8;
  background: ${(p) => {
    const color = p.$color || "var(--accent)";
    // "above" leans up-and-right (/), "below" leans down-and-right (\).
    const axis = p.$side === "above" ? "to bottom right" : "to top right";
    return `linear-gradient(${axis},
      transparent calc(50% - 0.9px),
      ${color} calc(50% - 0.9px),
      ${color} calc(50% + 0.9px),
      transparent calc(50% + 0.9px))`;
  }};
`;

const flashbackStripes = css`
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.14) 0 4px,
    transparent 4px 9px
  );
`;

/** A chapter, hanging off the spine on its thread. */
export const Bar = styled.div<{
  $color?: string | null;
  $flashback?: boolean;
  $dragging?: boolean;
  $editable?: boolean;
  $active?: boolean;
}>`
  position: absolute;
  height: ${BAR_HEIGHT}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  padding: 0 0.45rem;
  border-radius: 7px;
  color: #fff;
  font-size: var(--font-size-small);
  /* A shallow top-light gradient rather than a flat fill — enough to read as
     an object sitting on the board, not so much that it tints the accent. */
  background:
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.14),
      rgba(0, 0, 0, 0.08)
    ),
    ${(p) => p.$color || "var(--accent)"};
  border: 1px solid
    ${(p) => (p.$active ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.28)")};
  box-shadow: ${(p) =>
    p.$dragging || p.$active
      ? "0 8px 20px rgba(0, 0, 0, 0.38)"
      : "0 1px 3px rgba(0, 0, 0, 0.28)"};
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  cursor: ${(p) => (p.$editable ? "grab" : "pointer")};
  touch-action: pan-y;
  user-select: none;
  overflow: hidden;
  z-index: ${(p) => (p.$dragging ? 6 : p.$active ? 5 : 4)};

  ${(p) => p.$flashback && flashbackStripes}

  &:active {
    cursor: ${(p) => (p.$editable ? "grabbing" : "pointer")};
  }
`;

/** The bar's first line: the marks, the chapter's name, and the expand
 *  control. */
export const BarTopRow = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
`;

export const BarLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
  pointer-events: none;
`;

/** The bar's second line: the chapter's in-story date, where it belongs to
 *  one chapter rather than competing for room on a shared strip. */
export const BarDate = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.66rem;
  letter-spacing: 0.02em;
  line-height: 1.2;
  opacity: 0.85;
  pointer-events: none;
`;

/** The one way into a chapter's detail card, on every device. Toggles, so
 *  the same button that opened the card closes it. */
export const ExpandButton = styled.button<{ $active?: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: ${(p) =>
    p.$active ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.22)"};
  color: ${(p) => (p.$active ? "rgba(0, 0, 0, 0.75)" : "#fff")};
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: ${(p) =>
      p.$active ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.4)"};
  }
`;

/** Drag handles on a bar's left/right edges. */
export const BarHandle = styled.span<{ $side: "start" | "end" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${(p) => (p.$side === "start" ? "left: 0;" : "right: 0;")}
  width: 8px;
  cursor: ew-resize;
  touch-action: none;

  &::after {
    content: "";
    position: absolute;
    top: 28%;
    bottom: 28%;
    ${(p) => (p.$side === "start" ? "left: 2px;" : "right: 2px;")}
    width: 2px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.65);
  }
`;

/** Marks a bar whose timeline order disagrees with its reading order. */
export const OutOfOrderDot = styled.span`
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25);
  pointer-events: none;
`;

/** The timeline's name, riding inside the band on mobile where the sticky
 *  gutter is hidden and the track scrolls away from it. */
export const BandName = styled.span`
  position: sticky;
  left: 0;
  display: none;
  float: left;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  padding: 2px 6px;
  z-index: 3;

  @media (max-width: 700px) {
    display: inline-block;
  }
`;

// ── Expanded detail card ───────────────────────────────────────────────────

export const Card = styled.div<{ $accent?: string | null }>`
  position: absolute;
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.4rem 0.4rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: color-mix(in srgb, var(--bg-3) 96%, transparent);
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.42);
  z-index: 20;
  overflow: hidden;

  /* The chapter's accent, run as a spine down the leading edge rather than a
     border — it ties the card to the bar it was opened from at a glance, and
     costs no height, which a card this short cannot spare. */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    background: linear-gradient(
      to bottom,
      ${(p) => p.$accent || "var(--accent)"},
      color-mix(
        in srgb,
        ${(p) => p.$accent || "var(--accent)"} 45%,
        transparent
      )
    );
  }
`;

export const CardCover = styled.div`
  flex-shrink: 0;
  /* 2:3, the ratio the covers are cropped at — the frame has to keep it or
     an author's framing is not what gets shown. */
  width: 32px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
`;

export const CardTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  font-size: 0.75rem;
  color: var(--text);
  font-weight: 600;
  line-height: 1.25;
  padding-right: 0.9rem;

  /* The name itself clips; the flashback mark beside it must not. */
  b {
    min-width: 0;
    font-weight: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    flex-shrink: 0;
    opacity: 0.75;
  }
`;

/** Date and place on one line: the date as a tinted chip, the place trailing
 *  off it in plain type, so the two are told apart without a second row. */
export const CardFacts = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
`;

export const CardDate = styled.span<{ $accent?: string | null }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  max-width: 62%;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.61rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
  background: color-mix(
    in srgb,
    ${(p) => p.$accent || "var(--accent)"} 20%,
    transparent
  );

  svg {
    flex-shrink: 0;
    opacity: 0.8;
  }
`;

export const CardPlace = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  min-width: 0;
  font-size: 0.61rem;
  line-height: 1.4;
  color: var(--text-secondary);

  svg {
    flex-shrink: 0;
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CardClose = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
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
