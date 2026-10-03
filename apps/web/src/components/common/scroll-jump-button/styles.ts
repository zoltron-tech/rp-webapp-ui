import styled from "styled-components";
import { FOCUS_RING, GLASS, Z_INDEX } from "@/theme";

export const Button = styled.button<{
  $visible?: boolean;
  $position?: "top" | "bottom";
  $topOffset?: number;
  /** Extra right/block margin on desktop only — callers with roomier layouts
   *  (e.g. the storyboard reader) opt in; other consumers keep the default
   *  tighter offset. Ignored below the mobile breakpoint. */
  $edgeOffset?: number;
  /** Extra px pushed below the default top offset, mobile only — for making
   *  room for a control stacked above it (e.g. a show/hide toggle). */
  $mobileTopOffset?: number;
  /** Slides the button off past the edge and disables it, independent of
   *  $visible — a manual "hide the side controls" toggle rather than the
   *  scroll-position-driven fade. */
  $slideOut?: boolean;
}>`
  position: fixed;
  right: ${({ $edgeOffset = 0 }) => `calc(20px + ${$edgeOffset}px)`};
  /* A top-pinned button must clear the sticky app top bar it is portaled
     beneath, plus whatever extra sticky chrome the page stacks below that
     (e.g. the storyboard reader's own header) — callers pass $topOffset for
     the latter. */
  ${({ $position, $topOffset = 0, $edgeOffset = 0 }) =>
    $position === "top"
      ? `top: calc(var(--topbar-height, 60px) + 16px + ${$topOffset}px + ${$edgeOffset}px);`
      : `bottom: calc(20px + ${$edgeOffset}px);`}
  min-width: 0;
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  z-index: ${Z_INDEX.SCROLL_JUMP};
  /* Floats over the page, so it is functional-layer glass (portaled into
     main.page-container, where the glass tokens live). Monochrome glyph;
     the accent is the hover. */
  ${GLASS("bar")}
  border: 1px solid var(--glass-edge);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible === false ? 0 : 1)};
  pointer-events: ${({ $visible, $slideOut }) =>
    $visible === false || $slideOut ? "none" : "auto"};
  transform: translateX(${({ $slideOut }) => ($slideOut ? "150%" : "0")});
  transition: opacity 0.25s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease, transform 0.3s ease;

  &:hover {
    color: var(--accent-11, var(--accent));
    border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 40%, transparent);
  }

  ${FOCUS_RING}

  @media (max-width: 600px) {
    right: 22px;
    ${({ $position, $topOffset = 0, $mobileTopOffset = 0 }) =>
      $position === "top"
        ? `top: calc(var(--topbar-height, 45px) + 34px + ${$topOffset}px + ${$mobileTopOffset}px);`
        : "bottom: 22px;"}
    width: 44px;
    height: 44px;
  }
`;
