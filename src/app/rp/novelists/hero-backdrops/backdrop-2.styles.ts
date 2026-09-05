import styled, { css, keyframes } from "styled-components";

/* ─────────────────────────────────────────────────────────────────────────────
   Backdrop 2 — "Woven threads".

   Where backdrop 1 is a still night field, this one is in motion: long story
   threads drift across the hero and cross each other, and the crossings glow.
   Same brief (drawn, not fetched; follows the reader's accent), different
   picture, so the two can be swapped without touching anything else.

   ── Performance ──────────────────────────────────────────────────────────────
   This runs full-bleed behind the hero on every visit, so it is built to stay
   on the compositor. Two things it deliberately does *not* do:

   • **No `stroke-dashoffset` animation.** Animating the dash offset along a
     bezier is not compositable: the browser re-flattens the curve and repaints
     it every frame. Six long curves doing that measured 53% of wall time under
     a 6x CPU throttle, against 33% for backdrop 1, with style recalc nearly
     doubled. The threads now drift with `transform` instead, which the
     compositor handles on its own thread, and the dash pattern rides along.

   • **No SVG `<mask>` over the animated content.** A mask forces an offscreen
     buffer that is re-composited every frame across the whole 1440x640 field.
     The edge fade is two static gradient rects painted on top instead, which
     costs one paint rather than one per frame.

   Blooms animate opacity only; scaling a large radial gradient re-rasterises
   it. Every animated element is transform- or opacity-only and hinted with
   `will-change`.
   ──────────────────────────────────────────────────────────────────────────── */

const stillness = (rules: ReturnType<typeof css>) => css`
  @media (prefers-reduced-motion: reduce) {
    ${rules}
  }
`;

/**
 * The drift. Alternates rather than looping one way, so the weave never has to
 * jump back to its start — a seamless one-way loop would mean duplicating every
 * path to scroll it, and this reads as the same slow current for none of that.
 */
const weave = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-46px, -18px, 0); }
`;

const bloom = keyframes`
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 0.8; }
`;

const knotPulse = keyframes`
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 1; }
`;

export const Backdrop = styled.svg`
  position: absolute;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;

  .bloom {
    will-change: opacity;
    animation: ${bloom} 16s ease-in-out infinite;
  }
  .bloom.b2 { animation-duration: 21s; animation-delay: -7s; }

  /* One lane per thread, each drifting at its own pace and direction so the
     weave never moves as a single sheet. */
  .lane {
    will-change: transform;
    animation: ${weave} 19s ease-in-out infinite alternate;
  }
  .l2 { animation-duration: 26s; animation-direction: alternate-reverse; }
  .l3 { animation-duration: 15s; }
  .l4 { animation-duration: 31s; animation-direction: alternate-reverse; }
  .l5 { animation-duration: 22s; }
  .l6 { animation-duration: 35s; animation-direction: alternate-reverse; }

  /* Where two threads cross: a collaboration, lit up. Opacity only. */
  .knot {
    will-change: opacity;
    animation: ${knotPulse} 6.5s ease-in-out infinite;
  }
  .k2 { animation-delay: -1.3s; }
  .k3 { animation-delay: -2.6s; }
  .k4 { animation-delay: -3.9s; }
  .k5 { animation-delay: -5.2s; }

  ${stillness(css`
    .bloom,
    .lane,
    .knot {
      animation: none;
      will-change: auto;
    }
    .knot {
      opacity: 0.7;
    }
  `)}
`;
