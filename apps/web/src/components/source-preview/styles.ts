import { Popover } from "radix-ui";
import styled, { keyframes } from "styled-components";
import { FOCUS_RING, Z_INDEX } from "@/theme";

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const fall = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
`;

/* The avatar in a post header, as a button: it opens the preview rather than
   leaving the page. Reset to look exactly like the anchor it replaced. */
export const Trigger = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  ${FOCUS_RING}
`;

/* No glass panel of its own: the embed card is already a framed surface, so
   the popover is just where it sits. Width fits the 375px baseline with a
   16px gutter each side and stays at the card's own cap on desktop. */
export const Content = styled(Popover.Content)`
  width: min(360px, calc(100vw - 32px));
  z-index: ${Z_INDEX.MODAL};
  outline: none;
  transform-origin: var(--radix-popover-content-transform-origin);

  /* The cards keep a pixel min-width for shrink-to-fit parents; here the
     popover sets the width, so let the card follow it. */
  & > a,
  & > div {
    min-width: 0;
    max-width: none;
  }

  &[data-state="open"] {
    animation: ${rise} 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  &[data-state="closed"] {
    animation: ${fall} 0.12s ease forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-state="open"],
    &[data-state="closed"] {
      animation-duration: 0.01ms;
    }
  }
`;
