import styled, { css, keyframes } from "styled-components";

/** Vertical gap between two pages, in design pixels. */
export const PAGE_GAP = 28;

export const Stage = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/** Reserves the scaled footprint of a page so the scrollbar stays honest. */
export const PageSlot = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const paper = css`
  background: var(--bg-2);
  border-radius: 3px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.16),
    0 10px 24px -12px rgba(0, 0, 0, 0.35);
`;

/**
 * One page of the manuscript — the same rectangle the book spread puts side by
 * side, stacked down the screen instead. `$live` marks the page the author is
 * writing on, which is the only one allowed to grow past its own height.
 */
export const Page = styled.div<{ $live?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  transform-origin: top left;
  overflow: hidden;
  ${paper}
  ${(p) =>
    p.$live &&
    css`
      border: 1px dashed color-mix(in srgb, var(--accent) 45%, transparent);
    `}
`;

/** The clipped window showing this page's slice of the chapter. */
export const PageWindow = styled.div`
  position: absolute;
  overflow: hidden;
`;

/** The chapter flow, pushed up so the window frames the right page. */
export const PageWindowInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

/**
 * Off-screen twin of the flow. It is the copy the packer measures, so page
 * geometry stays known even for pages that are scrolled far away and unmounted.
 *
 * Its own box is collapsed to nothing: the unscaled flow is taller than the
 * scaled page stack (much taller on mobile), and an absolutely-positioned
 * descendant still extends the scroll container's scrollable overflow — left
 * uncollapsed it adds phantom scroll space below the last page. Clipping
 * doesn't affect layout sizes, so the children measure exactly the same.
 */
export const MeasureLayer = styled.div`
  position: absolute;
  top: 0;
  left: -100000px;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
`;

export const PageNumber = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  opacity: 0.75;
  user-select: none;
`;

/** Separates the last saved passage from the live composer beneath it. */
export const ComposerSlot = styled.div`
  position: relative;
  padding-top: 20px;
  border-top: 1px solid color-mix(in srgb, var(--bg-6) 70%, transparent);
`;

/** Marks the page the author is still writing on. */
export const DraftBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-family: var(--font);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.85;

  /* How much of the page is still empty — the author's cue to keep going or
     let the passage start clean on the next page. */
  .room {
    color: var(--text-secondary);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: none;
  }
`;

/**
 * Where the draft crosses onto the next page. Only the live page ever draws
 * these: a saved page cannot overrun, because it is a window one page tall.
 */
export const CutLine = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 2;
  border-top: 1px solid color-mix(in srgb, var(--accent) 75%, transparent);

  &::after {
    content: attr(data-label);
    position: absolute;
    right: 0;
    top: 4px;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--accent);
    background: var(--bg-2);
    padding: 0 4px;
    border-radius: 3px;
  }
`;

/**
 * The composer when the reader is not at the end of the chapter. A new passage
 * joins the end, which is a page this window cannot show, so it is written off
 * the page stack rather than on a page it would not land on.
 */
export const DetachedComposer = styled.div`
  margin: 0.5rem 0 1rem;
  padding: 18px;
  border-radius: 8px;
  border: 1px dashed color-mix(in srgb, var(--accent) 45%, transparent);
  background: var(--bg-2);
`;

const shimmer = keyframes`
  0% { opacity: 0.35; }
  50% { opacity: 0.65; }
  100% { opacity: 0.35; }
`;

/** Stand-in for a page scrolled far enough away to be worth unmounting. */
export const PagePlaceholder = styled.div`
  position: absolute;
  inset: 0;
  animation: ${shimmer} 1.6s ease-in-out infinite;
  ${paper}
`;

export const EdgeButton = styled.button`
  align-self: center;
  margin: 0.5rem 0;
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--text);
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 0 1.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;
