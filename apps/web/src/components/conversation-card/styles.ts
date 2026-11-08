import styled, { keyframes } from "styled-components";

/* `--kind` is the row's own hue, set inline from where the thread stands (see
   `@nw/features` inbox-kinds). Text never uses it raw: it is mixed toward the
   theme's text colour, so an unread time stays readable on a light theme and a
   dark one alike. The notification row is drawn the same way; the two lists
   are meant to read as one family. */

const pop = keyframes`
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

/* An inset, rounded tile. Unread is a faint wash of the row's own hue and the
   dot on the right; no bar on the edge, so nothing shifts when it is read. */
export const Card = styled.article`
  --face: 46px;
  --glyph: 20px;

  position: relative;
  display: flex;
  align-items: center;
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

  @media (hover: hover) {
    &:hover {
      background-color: var(--fill-hover);
    }

    &[data-unread]:hover {
      background-color: color-mix(in srgb, var(--kind) 15%, transparent);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: -2px;
  }

  &[data-compact] {
    --face: 38px;
    --glyph: 18px;
    gap: 10px;
    padding: 8px;
  }

  @media screen and (max-width: 800px) {
    --face: 42px;
    --glyph: 18px;
    gap: 10px;
    padding: 9px 10px;
  }
`;

/* The face, with the kind's glyph on its corner. With `data-pair` two smaller
   faces overlap on the diagonal: a group with no picture of its own. */
export const Faces = styled.div`
  position: relative;
  flex-shrink: 0;
  width: var(--face);
  height: var(--face);

  .avatar {
    position: absolute;
    width: var(--face);
    height: var(--face);
    min-width: 0;
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

  ${Card}[data-unread] & {
    animation: ${pop} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    ${Card}[data-unread] & {
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

/* The trailing column: built to the body's two line heights, so the time
   reads level with the name and the dot level with the preview. */
export const Meta = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

export const DotSlot = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 17px;
`;

/* Archive or bring back, from the row. Shown on hover and focus where there
   is a pointer, always on touch; its own focus ring, and its clicks stop
   here so they do not open the conversation. */
export const MoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin: -3px 0;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 0;

  @media (hover: hover) {
    opacity: 0;
    transition: opacity 0.15s ease;

    ${Card}:hover &,
    ${Card}:focus-within & {
      opacity: 1;
    }

    &:hover {
      background-color: var(--fill-hover);
      color: var(--text);
    }
  }

  &:focus-visible {
    opacity: 1;
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 1px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

/* "Archived" or "Archived · muted", after the name. Never squeezes the name
   to nothing: the name gives way first, then this. */
export const ArchiveTag = styled.span`
  flex-shrink: 0;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 1.3;
  color: var(--text-secondary);
`;

/** A conversation that will not push or buzz. */
export const MutedMark = styled.span`
  display: inline-flex;
  color: var(--text-secondary);
  line-height: 0;
`;

export const Timestamp = styled.time`
  flex-shrink: 0;
  font-size: 11px;
  /* The title's line height. */
  line-height: 18px;
  color: var(--text-secondary);
  white-space: nowrap;

  ${Card}[data-unread] & {
    color: color-mix(in srgb, var(--kind) 62%, var(--text));
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  line-height: 1.3;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${Card}[data-unread] & {
    font-weight: var(--font-weight-bold);
  }

  ${Card}[data-compact] & {
    font-size: 13px;
  }
`;

export const MessagePreview = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--font-weight-regular);
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${Card}[data-unread] & {
    color: var(--text);
    font-weight: var(--font-weight-medium);
  }
`;

export const Sender = styled.span`
  font-weight: var(--font-weight-medium);
`;

/* The last message's picture, when it was one. Left out of the sidebar's
   compact rows, where the text needs the width. */
export const Thumb = styled.img`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--material-edge);
  object-fit: cover;

  ${Card}[data-compact] & {
    display: none;
  }
`;

export const UnreadDot = styled.span`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--kind);
`;
