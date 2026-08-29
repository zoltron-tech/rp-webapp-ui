import styled from "styled-components";

export const Stage = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  /*
   * The manuscript's own inset.
   *
   * The reading container drops its inline padding entirely on narrow screens
   * — the prose used to sit on a page sheet that carried its own margins, so
   * there was nothing to run into the edges. There is no sheet any more, so
   * the column owns its margins, and every child here (the composer, the
   * footer, the load-more buttons) gets them too.
   */
  padding-inline: clamp(16px, 4vw, 28px);
`;

/**
 * The manuscript: the loaded chapter as one continuous column.
 *
 * No paper, no sheet, no scale. The old version laid the prose out at a stored
 * page width and then scaled the whole thing to fit the viewport, so the
 * measure was fixed by a print format rather than by the window — small type
 * on a phone, a narrow column on a monitor. A reading measure capped in `ch`
 * does the one thing the page geometry was actually there for: keep the line
 * length comfortable, at whatever size the reader's own settings ask for.
 */
export const Manuscript = styled.div`
  box-sizing: border-box;
  width: 100%;
  /* ~68 characters — the measure that print formats were approximating. */
  max-width: 68ch;
  margin: 0.25rem auto 0.5rem;
  font-size: var(--font-size);
  line-height: 1.7;

  @media (max-width: 680px) {
    line-height: 1.65;
  }
`;

/** Marks the composer as unwritten prose rather than part of the chapter. */
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

  @media (max-width: 680px) {
    margin-bottom: 6px;
  }
`;

export const ComposerSlot = styled.div`
  position: relative;
  /* Room between the last written passage and the rule that opens the
     composer, so the prose is finished before the chrome starts. */
  margin-top: 28px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--bg-6) 70%, transparent);

  @media (max-width: 680px) {
    margin-top: 20px;
    padding-top: 8px;
  }
`;

/**
 * The composer when the reader is not at the end of the chapter. A new passage
 * joins the end, which is past the passages this window holds, so it is written
 * off the manuscript rather than where it would not land.
 */
export const DetachedComposer = styled.div`
  /*
   * Same width contract as the manuscript column beside it.
   *
   * The stage is a centring flex column, so a child that sets no width is
   * sized by its own content — which for the composer is its desktop
   * intrinsic width, whatever the screen. That is why this one laid out wide
   * and overflowed while the inline composer (nested inside the manuscript,
   * and so already constrained) looked right on the same screen.
   */
  box-sizing: border-box;
  width: 100%;
  max-width: 68ch;
  margin: 0.5rem 0 1rem;
  padding: 18px;
  border-radius: 8px;
  border: 1px dashed color-mix(in srgb, var(--accent) 45%, transparent);
  background: var(--bg-2);

  @media (max-width: 680px) {
    margin: 0.25rem 0 0.75rem;
    padding: 8px;
  }
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
