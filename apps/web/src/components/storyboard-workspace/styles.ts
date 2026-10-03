import styled from "styled-components";
import { FOCUS_RING, GLASS, Z_INDEX } from "@/theme";

/** The top bar is fixed over the page's scroll container, so anything sticky
 *  inside it has to clear the bar rather than slide under it — the same math
 *  LeftNav uses for its own fixed offset. */
const STICKY_TOP = "calc(var(--topbar-height, 60px) + 12px)";

/** Below this the rail gives way to the mobile tab bar. */
export const WORKSPACE_BREAKPOINT = 900;
/** Height of the mobile tab bar, reserved so the canvas can clear it. */
export const MOBILE_TAB_BAR_HEIGHT = 56;

export const Frame = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  width: 100%;
  margin-top: 1.25rem;

  @media (max-width: ${WORKSPACE_BREAKPOINT}px) {
    display: block;
    /* Clear the fixed tab bar, plus the phone's home indicator. */
    padding-bottom: calc(
      ${MOBILE_TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 0.75rem
    );
  }
`;

/** Holds the guide trigger above the frame, aligned with the canvas's edge. */
export const UtilityRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  /* Pulls the frame's own top margin in, so the button reads as attached to
     the workspace below it rather than floating between two sections. */
  margin-bottom: -0.6rem;
`;

/** "Guide" — opens the storyboard walkthrough. Quiet until it is wanted. */
export const GuideButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 34px;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  background: var(--material-fill);
  border: 1px solid var(--material-edge);
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--fill-hover);
    color: var(--text);
  }

  ${FOCUS_RING}

  @media (max-width: ${WORKSPACE_BREAKPOINT}px) {
    font-size: var(--font-size-xsmall);
    padding: 0.3rem 0.6rem;
  }
`;

/** Desktop icon rail — the workspace's primary navigation. */
export const Rail = styled.nav`
  flex-shrink: 0;
  position: sticky;
  top: ${STICKY_TOP};
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.4rem;
  border-radius: 18px;
  /* Sticky workspace navigation is the functional layer: glass. */
  ${GLASS("panel")}
  border: 1px solid var(--glass-edge);

  @media (max-width: ${WORKSPACE_BREAKPOINT}px) {
    display: none;
  }
`;

export const RailButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  width: 62px;
  padding: 0.5rem 0.25rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  /* 11px floor for the rail captions. */
  font-size: 0.6875rem;
  letter-spacing: 0.01em;
  color: ${(p) => (p.$active ? "var(--text)" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--fill-pressed)" : "transparent")};
  box-shadow: ${(p) =>
    p.$active ? "inset 0 1px 0 var(--material-highlight)" : "none"};
  transition: background 0.15s ease, color 0.15s ease;

  svg {
    color: ${(p) => (p.$active ? "var(--accent-11)" : "currentColor")};
  }

  &:hover {
    color: var(--text);
    background: ${(p) =>
      p.$active ? "var(--fill-pressed)" : "var(--fill-hover)"};
  }

  ${FOCUS_RING}
`;

/** The canvas: whichever view is active. */
export const Canvas = styled.div`
  flex: 1;
  min-width: 0;
`;

/**
 * A view stays mounted once it has been opened, so switching back to it never
 * refetches. Hidden rather than unmounted.
 */
export const ViewSlot = styled.div<{ $active: boolean }>`
  display: ${(p) => (p.$active ? "block" : "none")};
`;

/** Mobile: full-bleed canvas with a fixed bottom tab bar, as in the mock. */
export const TabBar = styled.nav`
  display: none;

  @media (max-width: ${WORKSPACE_BREAKPOINT}px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: ${Z_INDEX.SCROLL_JUMP};
    display: flex;
    align-items: stretch;
    height: calc(${MOBILE_TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    ${GLASS("bar")}
    border-top: 1px solid var(--glass-edge);
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
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.6875rem;
  padding: 0;
  color: ${(p) => (p.$active ? "var(--accent-11)" : "var(--text-secondary)")};

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
`;

// ── Chapters view ──────────────────────────────────────────────────────────

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

export const SectionName = styled.h2`
  margin: 0;
  font-size: var(--font-size);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const Spacer = styled.span`
  flex: 1;
`;

export const ChapterGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const EmptyCanvas = styled.div`
  padding: 2.5rem 1rem;
  text-align: center;
  font-size: var(--font-size-small);
  line-height: 1.6;
  color: var(--text-secondary);
`;
