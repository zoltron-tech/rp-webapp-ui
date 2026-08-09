import styled from "styled-components";

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
  /* The mesh reads at a fixed comfortable size; a full-width canvas only
     blows the ring up without showing more. */
  max-width: 480px;
  margin: 0 auto;
  border-radius: 14px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  overflow: hidden;
`;

export const Canvas = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  touch-action: pan-y;

  /* Recessive scaffolding — the ring is a guide, not data. */
  .ring {
    fill: none;
    stroke: var(--bg-5);
    stroke-width: 1;
  }

  .edge {
    fill: none;
    stroke-linecap: round;
    cursor: pointer;
    transition: opacity 0.16s ease;
  }

  /* A 2px surface ring keeps crossing edges legible where they overlap. */
  .edge-halo {
    fill: none;
    stroke: var(--bg-2);
    stroke-linecap: round;
    pointer-events: none;
  }

  /* A fat invisible stroke over each edge — the hit target is bigger than
     the mark, so a 1.5px line is still easy to hit. */
  .edge-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 16;
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
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  /* The disc under a node. The ring itself is drawn last, over the avatar, so
     it must stay unfilled — a class fill would beat the fill attribute and
     hide the image. */
  .node-bg {
    fill: var(--bg-2);
  }

  .node-ring {
    fill: none;
    stroke: var(--bg-6);
    stroke-width: 1.5;
    transition: stroke 0.16s ease;
  }

  .node-ring.is-active {
    stroke: var(--accent);
    stroke-width: 2.5;
  }

  .node-initial {
    fill: var(--text-secondary);
    font-size: 15px;
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
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  .node-hit {
    fill: transparent;
    cursor: pointer;
  }

  .dimmed {
    opacity: 0.12;
  }

  /* The mesh is keyboard-reachable, so its hit targets need a visible ring —
     SVG shapes get none by default. */
  .edge-hit:focus-visible,
  .node-hit:focus-visible {
    outline: none;
    stroke: var(--accent);
    stroke-width: 2.5;
  }

  .node-hit:focus-visible {
    fill: none;
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
