import styled from "styled-components";
import { Z_INDEX } from "@/theme";

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

/** Desktop icon rail — the workspace's primary navigation. */
export const Rail = styled.nav`
  flex-shrink: 0;
  position: sticky;
  top: ${STICKY_TOP};
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.4rem;
  border-radius: 14px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);

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
  font-size: 0.62rem;
  letter-spacing: 0.02em;
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent)" : "transparent")};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    color: ${(p) => (p.$active ? "#fff" : "var(--text)")};
    background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-4)")};
  }
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
    background: color-mix(in srgb, var(--bg-2) 92%, transparent);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--bg-6);
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
  font-size: 0.6rem;
  padding: 0;
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-secondary)")};

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
