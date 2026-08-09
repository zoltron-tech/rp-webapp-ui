import styled from "styled-components";

/**
 * Chrome for the storyboard guide's stages.
 *
 * Only the *frame* lives here — the rail, the tab bar and the sheet outline.
 * Everything inside a frame is the app's own component, imported from where it
 * really lives, so a stage goes stale the day the real screen changes rather
 * than quietly drifting from it.
 *
 * The frames are scaled down a step from the real thing: they sit inside a
 * dialog that is itself only 375px wide at the baseline.
 */

/**
 * The root every stage's flow is placed against.
 *
 * Positioned, so the travelling pointer's offsets are measured from here — see
 * `stage-motion`'s `centreWithin`.
 */
export const Flow = styled.div`
  position: relative;
  min-width: 0;
`;

/** Rail + canvas on desktop; canvas + bottom tab bar on a phone, as it is. */
export const Workspace = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;

  @media (max-width: 700px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const Rail = styled.nav`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.3rem;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);

  /* The phone gets the tab bar below instead — the same swap the workspace
     itself makes at its breakpoint. */
  @media (max-width: 700px) {
    display: none;
  }
`;

export const RailButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  width: 58px;
  padding: 0.4rem 0.2rem;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-size: 0.6rem;
  letter-spacing: 0.02em;
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent)" : "transparent")};

  &:hover {
    color: ${(p) => (p.$active ? "#fff" : "var(--text)")};
    background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-4)")};
  }
`;

/** The mobile tab bar, shown in place rather than pinned to the viewport. */
export const TabBar = styled.nav`
  display: none;

  @media (max-width: 700px) {
    display: flex;
    order: 2;
    width: 100%;
    align-items: stretch;
    height: 50px;
    border-radius: 10px;
    background: var(--bg-2);
    border: 1px solid var(--bg-6);
  }
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.55rem;
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-secondary)")};

  span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Canvas = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.6rem;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);

  @media (max-width: 700px) {
    order: 1;
    width: 100%;
    box-sizing: border-box;
  }
`;

export const CanvasHead = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const CanvasNote = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
`;

/** A chapter, as the chapters view lists them. */
export const ChapterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.45rem 0.55rem;
  border-radius: 9px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  font-size: var(--font-size-small);
  color: var(--text);
`;

export const ChapterOrdinal = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-5);
  color: var(--text-secondary);
  font-size: 0.65rem;
`;

export const ChapterName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * A sheet, drawn in place instead of over the page.
 *
 * The header and body inside it are the real [ResponsiveSheet] parts, so what
 * the reader sees here is what opens when they tap New entry — minus the
 * portal, which would land it on top of the guide.
 */
export const SheetFrame = styled.div`
  /* The width the real sheet opens at on a desktop — a full-bleed one would
     be a screen the app never shows. On a phone it is full width, as it is. */
  width: 100%;
  max-width: 420px;
  /* Left, not centred: the stage pins its model to the top-left corner, and a
     sheet floating in the middle of an otherwise empty model reads as a
     mistake. */
  margin: 0;
  border-radius: 12px;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  overflow: hidden;

  @media (max-width: 700px) {
    max-width: none;
    /* The tray meets the bottom of the screen; only its top corners round. */
    border-radius: 14px 14px 0 0;
    border-bottom: none;
  }
`;

/** The codex view's own frame, so its cards sit on the page colour. */
export const CodexFrame = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
`;

/** Rows of the category manager, stacked as the real one stacks them. */
export const ManagerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;
