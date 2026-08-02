import styled, { css } from "styled-components";

export const Stage = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const paper = css`
  background: var(--bg-2);
  border-radius: 3px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.16),
    0 10px 24px -12px rgba(0, 0, 0, 0.35);
`;

/**
 * Reserves the scaled footprint of the manuscript, so the scrollbar measures
 * what the reader actually sees — the sheet inside is laid out at full page
 * width and only then scaled down to fit.
 */
export const ManuscriptSlot = styled.div`
  position: relative;
  flex-shrink: 0;
  margin: 0.25rem 0 0.5rem;
`;

/**
 * The manuscript: the whole loaded chapter as one unbroken sheet. Pages are
 * still the model underneath — they are just not drawn as separate cards any
 * more, so the prose runs on and only a page number in the margin marks where
 * one page gave way to the next.
 */
export const Sheet = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  transform-origin: top left;
  ${paper}
`;

/** The chapter flow itself, at the story's page geometry. */
export const FlowColumn = styled.div`
  position: relative;
`;

/**
 * Where a page ended, in the sheet's right margin. Deliberately quiet — it is
 * a reference mark for talking about the chapter, not a break in the reading.
 */
export const PageTick = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  /* Sits on the division itself, in the margin — never over the prose. */
  transform: translateY(-50%);
  pointer-events: none;
  user-select: none;
  font-family: var(--font);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  opacity: 0.4;

  /* A hairline fading in from the text side, so the number reads as a margin
     note rather than a rule drawn across the page. */
  &::before {
    content: "";
    width: 14px;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      color-mix(in srgb, var(--text-secondary) 55%, transparent)
    );
  }
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
 * The composer when the reader is not at the end of the chapter. A new passage
 * joins the end, which is past the passages this window holds, so it is written
 * off the manuscript rather than where it would not land.
 */
export const DetachedComposer = styled.div`
  margin: 0.5rem 0 1rem;
  padding: 18px;
  border-radius: 8px;
  border: 1px dashed color-mix(in srgb, var(--accent) 45%, transparent);
  background: var(--bg-2);
`;

/**
 * Off-screen twin of the flow. It is the copy the packer measures: it renders
 * every passage the same way for every reader, so pages do not move depending
 * on who is looking or what chrome their view adds.
 *
 * Its own box is collapsed to nothing: the unscaled flow is taller than the
 * scaled manuscript (much taller on mobile), and an absolutely-positioned
 * descendant still extends the scroll container's scrollable overflow — left
 * uncollapsed it adds phantom scroll space below the chapter. Clipping doesn't
 * affect layout sizes, so the children measure exactly the same.
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
