import { css } from "styled-components";

/**
 * How the weave is painted, for whichever stylesheet contains it.
 *
 * Theme tokens rather than fixed colours, so the texture steps with the
 * surface it sits on. Quiet on purpose: it is decoration, it takes no
 * pointers, and it must never compete with a line or a name drawn over it.
 *
 * Interpolate this into the styled component that wraps the SVG — the
 * component itself only carries class names.
 */
export const weaveCss = css`
  .weave {
    pointer-events: none;
  }

  .weave-dot {
    fill: var(--bg-5);
    opacity: 0.55;
  }

  .weave-cross {
    fill: none;
    stroke: var(--bg-5);
    stroke-width: 1;
    stroke-linecap: round;
    opacity: 0.4;
  }
`;

/**
 * The accent wash a board sits on, under the weave. Paired with it everywhere
 * so the two boards read as the same surface.
 */
export const boardSurface = css`
  background:
    radial-gradient(
      circle at 50% 42%,
      color-mix(in srgb, var(--accent) 7%, transparent) 0%,
      transparent 62%
    ),
    var(--bg-2);
`;
