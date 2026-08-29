import styled, { keyframes } from "styled-components";
import {
  boardSurface,
  weaveCss,
} from "@/components/common/canvas-weave/styles";

/** The thread running along a spotlit relationship, from its start toward its
 *  end — so a directed relationship reads as a direction, not just an
 *  arrowhead to go hunting for. */
const meshFlow = keyframes`
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
`;

/** The ring that breathes outward from the character in focus. Scale rather
 *  than r: the radius attribute animates unevenly across engines, while a
 *  transform on a fill-box origin is the same everywhere. */
const meshPulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  70% { transform: scale(1.45); opacity: 0; }
  100% { transform: scale(1.45); opacity: 0; }
`;

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

export const Spacer = styled.span`
  flex: 1;
`;

/** Mesh ⇄ table. The table is the accessible alternative, not a fallback. */
export const ModeToggle = styled.div`
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.2rem;
  border-radius: 999px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
`;

export const ModeButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-small);
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent)" : "transparent")};

  &:hover {
    color: ${(p) => (p.$active ? "#fff" : "var(--text)")};
  }
`;

export const Hint = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
`;

// ── Legend ─────────────────────────────────────────────────────────────────
// Always present: identity is never carried by colour alone.

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;

export const LegendItem = styled.button<{ $muted?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.1rem;
  border: none;
  background: none;
  cursor: pointer;
  /* Legend text wears text tokens, never the series colour. */
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  opacity: ${(p) => (p.$muted ? 0.4 : 1)};
  transition: opacity 0.15s ease, color 0.15s ease;

  &:hover {
    color: var(--text);
  }
`;

export const LegendSwatch = styled.svg`
  flex-shrink: 0;
  width: 26px;
  height: 10px;
  overflow: visible;
`;

/**
 * A group in the legend.
 *
 * Two controls, not one, and therefore not a single button: the chip's body
 * switches the field on and off, and the pencil beside it opens the group.
 * Nesting one button inside another is invalid markup and gives a screen
 * reader one control where there are plainly two.
 */
export const GroupChip = styled.div<{ $muted?: boolean }>`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  opacity: ${(p) => (p.$muted ? 0.45 : 1)};
  transition: opacity 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: var(--accent);
  }
`;

export const GroupChipToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  border: none;
  background: none;
  cursor: pointer;
  /* Chip text wears text tokens; the swatch carries the group's colour. */
  color: var(--text-secondary);
  font-size: var(--font-size-small);

  &:hover {
    color: var(--text);
  }

  .swatch {
    width: 11px;
    height: 11px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .count {
    opacity: 0.65;
  }
`;

export const GroupChipEdit = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.55rem 0.25rem 0.15rem;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);

  &:hover {
    color: var(--text);
  }
`;

/** The swatch strip on the focused character's panel: every group they are in. */
export const GroupTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }
`;

/** What a group looks like on the board, shown inside the group sheet. */
export const GroupPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  svg {
    flex-shrink: 0;
    width: 96px;
    height: 36px;
  }

  @media screen and (max-width: 800px) {
    svg {
      width: 76px;
    }
  }
`;

// ── The tone maker ─────────────────────────────────────────────────────────
// Lives inside the relationship sheet rather than behind a settings trip: an
// author reaches for a new colour in the moment they need it, while writing
// the relationship that needs it.

export const ToneMaker = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.7rem;
  border-radius: 0.5rem;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
`;

export const ToneMakerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

/** The stroke a line style draws as, shown on its own swatch in the picker. */
export const ToneStrokePreview = styled.svg`
  flex-shrink: 0;
  width: 26px;
  height: 10px;
  overflow: visible;
`;

/**
 * Retiring a tone. Quiet, and worded so it is plain that the relationships
 * drawn in it survive — the server falls them back to their built-in rather
 * than deleting them.
 */
export const ToneRetire = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-decoration: underline;

  &:hover {
    color: var(--tomato-9, #e5484d);
  }
`;

// ── Mesh ───────────────────────────────────────────────────────────────────

export const Stage = styled.div`
  position: relative;
  width: 100%;
  /* Declared here as well as on the <svg> inside it. The svg ought to be
     enough on its own, but touch-action is honoured inconsistently over SVG
     subtrees, and this div is a plain block box every engine agrees on — the
     used value is the intersection down the chain, so none here settles it.
     The touchmove handler in mesh.tsx is the third belt on the same trousers,
     for the engines that honour neither.

     No backticks anywhere in this file's comments: these are tagged template
     literals, and one would end the string mid-comment. */
  touch-action: none;
  /* Wide, because the relaxed shape is wider than it is tall and the board is
     now pannable — a bigger frame is more of the story, not just a bigger
     ring. */
  max-width: 760px;
  margin: 0 auto;
  border-radius: 14px;
  ${boardSurface}
  border: 1px solid var(--bg-6);
  overflow: hidden;
`;

/** Zoom and reset, over the board's top-right corner. */
export const Controls = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    color: var(--text);
    border-color: var(--accent);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const Canvas = styled.svg`
  display: block;
  width: 100%;
  height: auto;

  /* Every gesture inside the board is ours: one finger drags a character or
     pans, two pinch to zoom.

     This has to sit on the <svg> and nowhere else. Per the touch-action spec
     the property does not apply to SVG elements without a CSS layout box, so
     it is silently ignored on a <circle> or a <rect> — which is why declaring
     it on the node's hit target did nothing, and why a touch drag used to die
     the moment the browser decided the gesture was a page scroll. The <svg>
     is a replaced element and does have a box, so it takes it. */
  touch-action: none;

  ${weaveCss}

  /* The board catches a pan and a press-to-clear. */
  .board {
    fill: transparent;
    cursor: grab;
  }

  .board:active {
    cursor: grabbing;
  }

  .edge {
    fill: none;
    stroke-linecap: round;
    transition: stroke-width 0.16s ease;
  }

  /* A surface ring keeps crossing edges legible where they overlap. */
  .edge-halo {
    fill: none;
    stroke: var(--bg-2);
    stroke-linecap: round;
    pointer-events: none;
  }

  /* The travelling thread on a spotlit relationship. Drawn over the edge in
     its own colour, so the reader can see which way a directed relationship
     actually runs rather than hunting for the arrowhead. */
  .edge-flow {
    fill: none;
    stroke-linecap: round;
    stroke-dasharray: 2 22;
    opacity: 0.9;
    pointer-events: none;
  }

  .edge-tip {
    pointer-events: none;
  }

  /* A fat invisible stroke over each edge — the hit target is bigger than
     the mark, so a 1.5px line is still easy to hit. */
  .edge-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 18;
    cursor: pointer;
  }

  .edge-label {
    fill: var(--text-secondary);
    font-size: 13px;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
    paint-order: stroke;
    stroke: var(--bg-2);
    stroke-width: 3.5px;
    stroke-linejoin: round;
  }

  .edge-label.is-active {
    fill: var(--text);
  }

  /* The disc under a node. The ring itself is drawn last, over the avatar, so
     it must stay unfilled — a class fill would beat the fill attribute and
     hide the image. */
  .node-bg {
    fill: var(--bg-2);
  }

  /* The halo behind the character being followed. */
  .node-glow {
    fill: color-mix(in srgb, var(--accent) 22%, transparent);
    pointer-events: none;
  }

  .node-ring {
    fill: none;
    stroke: var(--bg-6);
    stroke-width: 1.5;
    transition: stroke 0.16s ease;
  }

  .node-ring.is-active {
    stroke: var(--accent);
    stroke-width: 3.5;
  }

  /* The focus signal for a character. A rectangular outline around a round
     avatar read as a white box stuck to the node, so focus is drawn as the
     shape the node already is: an accent ring pulsing out from its edge. */
  .node-pulse {
    fill: none;
    stroke: var(--accent);
    stroke-width: 3;
    transform-box: fill-box;
    transform-origin: center;
    pointer-events: none;
    opacity: 0.7;
  }

  /* A character in the cast but tied to nobody. Drawn open rather than closed
     so "not connected to anything" is visible on the character themself, not
     only inferable from the absence of lines. */
  .node-ring.is-loose {
    stroke-dasharray: 3 4;
    opacity: 0.7;
  }

  /* The group fields, under everything else.

     One translucent layer holding regions painted at full opacity, rather than
     a stack of translucent fields: inside the layer each region covers the ones
     it overlaps outright, so a point on the board carries exactly one colour —
     the blend of precisely the groups it belongs to. Stacked washes would
     instead give whichever group was made last the loudest say. */
  .clusters,
  .cluster-weave,
  .cluster-rims {
    pointer-events: none;
  }

  /* A group's name, over its field. Colour alone never carries identity, so
     every field says who it is in words as well. */
  .cluster-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
    paint-order: stroke;
    stroke: var(--bg-2);
    stroke-width: 4px;
    stroke-linejoin: round;
  }

  /* One arc per relationship, in that relationship's tone — a character's mix
     of bonds and grudges, read without following a single thread. */
  .node-collar {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    pointer-events: none;
  }

  .node-initial {
    fill: var(--text-secondary);
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
  }

  .node-label {
    fill: var(--text);
    font-size: 14px;
    dominant-baseline: middle;
    pointer-events: none;
    paint-order: stroke;
    stroke: var(--bg-2);
    stroke-width: 3.5px;
    stroke-linejoin: round;
  }

  /* Characters are draggable, so they take the pointer outright. (The
     touch-action that makes that work lives on the <svg> above — it would be
     ignored here.) */
  .node-hit {
    fill: transparent;
    cursor: grab;
  }

  .node-hit:active {
    cursor: grabbing;
  }

  .dimmed {
    opacity: 0.16;
  }

  [data-nw="mesh-edge"],
  [data-nw="mesh-node"] {
    transition: opacity 0.18s ease;
  }

  /* The mesh is keyboard-reachable, so its hit targets need a visible ring —
     SVG shapes get none by default. */
  .edge-hit:focus,
  .node-hit:focus {
    outline: none;
  }

  .edge-hit:focus-visible,
  .node-hit:focus-visible {
    outline: none;
    stroke: var(--accent);
    stroke-width: 2.5;
  }

  .node-hit:focus-visible {
    fill: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    .edge-flow {
      animation: ${meshFlow} 1.5s linear infinite;
    }

    .node-pulse {
      animation: ${meshPulse} 1.9s ease-out infinite;
    }
  }

  /* Motion is the only thing that goes; the spotlight, the collar and every
     other signal are static and survive the preference untouched. */
  @media (prefers-reduced-motion: reduce) {
    .edge-flow {
      opacity: 0.35;
      stroke-dasharray: none;
    }

    /* Still a ring, just a held one — focus stays visible without the beat. */
    .node-pulse {
      transform: scale(1.2);
      opacity: 0.5;
    }
  }
`;

/** Follows the pointer over the mesh. */
export const Tooltip = styled.div`
  position: absolute;
  z-index: 3;
  pointer-events: none;
  max-width: 220px;
  padding: 0.4rem 0.55rem;
  border-radius: 8px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  font-size: var(--font-size-small);
  line-height: 1.4;
  color: var(--text);

  .pair {
    color: var(--text-secondary);
    font-size: 0.7rem;
  }

  .tone {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--text-secondary);
    font-size: 0.7rem;
  }

  .swatch {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
`;

export const Empty = styled.div`
  padding: 2.5rem 1rem;
  text-align: center;
  font-size: var(--font-size-small);
  line-height: 1.6;
  color: var(--text-secondary);
`;

// ── Table view ─────────────────────────────────────────────────────────────

export const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--bg-6);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-small);
  background: var(--bg-2);

  th,
  td {
    padding: 0.5rem 0.6rem;
    text-align: left;
    border-bottom: 1px solid var(--bg-4);
    white-space: nowrap;
  }

  th {
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    font-weight: normal;
  }

  td {
    color: var(--text);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: var(--bg-3);
  }
`;

export const ToneCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-secondary);

  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }
`;

export const RowAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
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

// ── Selection detail ───────────────────────────────────────────────────────

export const Detail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
`;

export const DetailHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const DetailName = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: var(--font-weight-bold);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DetailAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

export const DetailRow = styled.button`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.35rem 0.4rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-small);
  color: var(--text);

  &:hover {
    background: var(--bg-3);
    border-color: var(--bg-6);
  }

  .stroke {
    flex-shrink: 0;
    width: 22px;
    height: 3px;
    border-radius: 2px;
  }

  .who {
    color: var(--text-secondary);
  }
`;
