import styled, { css, keyframes } from "styled-components";

/* ─────────────────────────────────────────────────────────────────────────────
   Hero backdrop.

   Replaces the S3 wallpaper PNG the hero used to load. Drawn rather than
   fetched, so it costs no request, never pops in late, scales to any viewport,
   and follows the reader's accent instead of being locked to one photograph's
   colour.

   Four layers, back to front: an aurora wash, a faint ruled-paper field, a
   constellation of writers with threads drawn between them, and ink motes
   drifting up through it all.
   ──────────────────────────────────────────────────────────────────────────── */

const stillness = (rules: ReturnType<typeof css>) => css`
  @media (prefers-reduced-motion: reduce) {
    ${rules}
  }
`;

const auroraDrift = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.55; }
  50%      { transform: translate3d(2.5%, -3%, 0) scale(1.12); opacity: 0.85; }
`;

/* Scales rather than animating `r`. `r` is SVG geometry: changing it re-runs
   layout and paint for the circle every frame and cannot be composited, while
   a transform stays on the compositor. Same look, far cheaper across 18 of
   them. See backdrop-2.styles for the fuller note on this. */
const twinkle = keyframes`
  0%, 100% { opacity: 0.18; transform: scale(0.72); }
  50%      { opacity: 0.9; transform: scale(1.25); }
`;

const threadPulse = keyframes`
  0%, 100% { opacity: 0.14; }
  50%      { opacity: 0.4; }
`;

const moteRise = keyframes`
  0%   { opacity: 0; transform: translateY(14px); }
  18%  { opacity: 0.7; }
  80%  { opacity: 0.45; }
  100% { opacity: 0; transform: translateY(-120px); }
`;

export const Backdrop = styled.svg`
  position: absolute;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;

  .aurora {
    transform-box: fill-box;
    transform-origin: center;
    will-change: transform, opacity;
    animation: ${auroraDrift} 22s ease-in-out infinite;
  }
  .aurora.a2 { animation-duration: 27s; animation-delay: -6s; }
  .aurora.a3 { animation-duration: 19s; animation-delay: -12s; }

  /* Deliberately still. This rect is masked, and animating a masked element
     makes the browser re-composite the mask's offscreen buffer every frame
     across the whole field; the ruled paper reads the same held steady. */
  .rules {
    opacity: 0.68;
  }

  /* Writers in the field. Staggered so the sky never blinks in unison. */
  .star {
    transform-box: fill-box;
    transform-origin: center;
    will-change: transform, opacity;
    animation: ${twinkle} 5.2s ease-in-out infinite;
  }
  .s1 { animation-delay: 0s; }
  .s2 { animation-delay: 0.7s; }
  .s3 { animation-delay: 1.4s; }
  .s4 { animation-delay: 2.1s; }
  .s5 { animation-delay: 2.8s; }
  .s6 { animation-delay: 3.5s; }
  .s7 { animation-delay: 4.2s; }
  .s8 { animation-delay: 1.1s; }
  .s9 { animation-delay: 2.4s; }
  .s10 { animation-delay: 3.9s; }

  /* The threads between them: the whole point of the product, at 8% opacity. */
  .thread {
    will-change: opacity;
    animation: ${threadPulse} 9s ease-in-out infinite;
  }
  .t2 { animation-delay: -2.4s; }
  .t3 { animation-delay: -4.8s; }
  .t4 { animation-delay: -7.2s; }

  .mote {
    transform-box: fill-box;
    will-change: transform, opacity;
    animation: ${moteRise} 15s linear infinite;
  }
  .m2 { animation-delay: -4s; animation-duration: 18s; }
  .m3 { animation-delay: -8s; animation-duration: 13s; }
  .m4 { animation-delay: -11s; animation-duration: 20s; }
  .m5 { animation-delay: -2s; animation-duration: 16s; }

  ${stillness(css`
    .aurora,
    .star,
    .thread,
    .mote {
      animation: none;
      will-change: auto;
    }
    .mote {
      opacity: 0.4;
    }
  `)}
`;
