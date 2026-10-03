"use client";

import { type FC, useId } from "react";

/**
 * A soft two-scale texture for a board's background.
 *
 * A fine dot grid with a sparse cross-tick over it. Two scales rather than
 * one: the coarse ticks give the eye somewhere to land, the dots give the
 * surface its grain, and neither alone reads as anything but graph paper.
 *
 * Masked by a radial fade — full strength in the middle, gone by the edges.
 * That is the whole point of it being soft: it has to sit under a diagram
 * without competing with a single line or label.
 *
 * Renders as SVG *fragments* (defs plus a masked group), not as its own
 * `<svg>`, so it can be dropped either into a diagram's existing canvas or
 * into a plain background layer. Both rects are sized in percentages, so it
 * fills whatever viewBox or pixel box it lands in.
 *
 * Colours come from the consumer's stylesheet via `weaveCss`, so the texture
 * steps with the surface it is drawn on rather than carrying its own hexes.
 */
export const CanvasWeave: FC<{
  /**
   * Applied to the pattern tiles, so the texture can follow a board's own
   * pan and zoom. Tiling it this way keeps it to one rect however far the
   * board is dragged, rather than needing more tiles at the edges — and the
   * parallax is what makes a pan feel like moving over a surface.
   */
  transform?: string;
}> = ({ transform }) => {
  // SVG defs share a document-wide id space, so these are scoped per
  // instance. React's ids contain colons, which are legal in an id but a
  // nuisance to reference, so they are swapped out.
  const scope = useId().replace(/:/g, "-");
  const dotsId = `weave-dots-${scope}`;
  const crossId = `weave-cross-${scope}`;
  const fadeId = `weave-fade-${scope}`;
  const maskId = `weave-mask-${scope}`;

  return (
    <>
      <defs>
        <pattern
          id={dotsId}
          width={26}
          height={26}
          patternUnits="userSpaceOnUse"
          patternTransform={transform}
        >
          <circle className="weave-dot" cx={13} cy={13} r={1.1} />
        </pattern>
        <pattern
          id={crossId}
          width={130}
          height={130}
          patternUnits="userSpaceOnUse"
          patternTransform={transform}
        >
          <path className="weave-cross" d="M 65 57 V 73 M 57 65 H 73" />
        </pattern>
        <radialGradient id={fadeId} cx="50%" cy="45%" r="72%">
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="65%" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <g className="weave" mask={`url(#${maskId})`}>
        <rect width="100%" height="100%" fill={`url(#${dotsId})`} />
        <rect width="100%" height="100%" fill={`url(#${crossId})`} />
      </g>
    </>
  );
};
