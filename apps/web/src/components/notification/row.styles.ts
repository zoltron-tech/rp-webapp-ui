import styled, { keyframes } from "styled-components";

/* `--kind` is the row's own hue, set inline from its type (see kinds.tsx).
   Text never uses it raw: it is mixed toward the theme's text colour, so the
   kicker stays readable on a light theme and a dark one alike. */

const pop = keyframes`
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

/* An inset, rounded tile. Unread is a faint wash of the row's own hue and the
   dot on the right; no bar on the edge, so nothing shifts when it is read. */
export const Row = styled.div`
  --face: 44px;
  --glyph: 20px;

  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 14px;
  cursor: pointer;
  font-family: var(--font);
  color: var(--text);
  text-align: left;
  transition: background-color 0.15s ease;

  &[data-unread] {
    background-color: color-mix(in srgb, var(--kind) 9%, transparent);
  }

  &:hover {
    background-color: var(--fill-hover);
  }

  &[data-unread]:hover {
    background-color: color-mix(in srgb, var(--kind) 15%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: -2px;
  }

  &[data-compact] {
    --face: 38px;
    --glyph: 18px;
    gap: 10px;
    padding: 9px 10px;
  }

  @media screen and (max-width: 800px) {
    --face: 40px;
    --glyph: 18px;
    gap: 10px;
    padding: 9px 10px;
  }
`;

/* The avatar, with the type's glyph on its corner. With `data-pair` two
   smaller faces overlap on the diagonal: a row that stands for a crowd. */
export const Faces = styled.div`
  position: relative;
  flex-shrink: 0;
  width: var(--face);
  height: var(--face);

  .avatar {
    position: absolute;
    width: var(--face);
    height: var(--face);
  }

  &[data-pair] .avatar {
    width: calc(var(--face) * 0.7);
    height: calc(var(--face) * 0.7);
  }

  &[data-pair] .face-back {
    top: 0;
    left: 0;
    opacity: 0.85;
  }

  &[data-pair] .face-front {
    right: 0;
    bottom: 0;
    /* A ring in the page's colour parts it from the face behind. */
    outline: 2px solid var(--bg-2);
  }
`;

export const Glyph = styled.span`
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--glyph);
  height: var(--glyph);
  border-radius: 50%;
  background-color: var(--kind);
  color: #fff;
  /* Parts the badge from the avatar under it. */
  box-shadow: 0 0 0 2px var(--bg-2);

  svg {
    width: 58%;
    height: 58%;
  }

  ${Row}[data-unread] & {
    animation: ${pop} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    ${Row}[data-unread] & {
      animation: none;
    }
  }
`;

export const Body = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Kicker = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.3;
  color: color-mix(in srgb, var(--kind) 62%, var(--text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Sentence = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-secondary);
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  strong {
    font-weight: 600;
    color: var(--text);
  }

  ${Row}[data-unread] & {
    color: var(--text);
  }
`;

export const Time = styled.time`
  font-size: 11px;
  line-height: 1.3;
  color: var(--text-secondary);
`;

export const Actions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;

  /* Compact pills, not bars: capped so they do not stretch across a wide row. */
  .button {
    flex: 0 1 120px;
    min-width: 0;
    font-size: 12px !important;
    padding: 6px 12px !important;
  }

  .button.messaging {
    background-color: var(--accent-hover);
    cursor: wait;
    pointer-events: none;
  }
`;

export const UnreadDot = styled.span`
  flex-shrink: 0;
  align-self: center;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--kind);
`;
