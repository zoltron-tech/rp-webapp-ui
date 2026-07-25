import styled, { css, keyframes } from "styled-components";

/** Slow, sleepy bob for the whole mascot. */
const bob = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-3px) rotate(-1.5deg); }
`;

/** Sad little head-shake / slump. */
const mope = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(2px) rotate(2deg); }
`;

/** Occasional blink — squash the eyes then hold open most of the cycle. */
const blink = keyframes`
  0%, 92%, 100% { transform: scaleY(1); }
  96%           { transform: scaleY(0.2); }
`;

/** Zzz drift up + fade, staggered per letter. */
const drift = keyframes`
  0%   { opacity: 0; transform: translate(0, 2px) scale(0.7); }
  25%  { opacity: 1; }
  100% { opacity: 0; transform: translate(4px, -8px) scale(1.1); }
`;

/** Bookmark gently sways like it's breathing. */
const sway = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(1.5px); }
`;

/** Tear swells, rolls down, then fades. */
const tear = keyframes`
  0%, 30%  { opacity: 0; transform: translateY(0) scale(0.6); }
  45%      { opacity: 1; transform: translateY(0) scale(1); }
  85%      { opacity: 1; transform: translateY(9px) scale(1); }
  100%     { opacity: 0; transform: translateY(12px) scale(0.8); }
`;

export const Mascot = styled.svg<{ $size: number; $sad?: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => Math.round($size * 0.94)}px;
  overflow: visible;

  .body {
    transform-box: fill-box;
    transform-origin: center bottom;
    animation: ${({ $sad }) => ($sad ? mope : bob)}
      ${({ $sad }) => ($sad ? "2.8s" : "3.6s")} ease-in-out infinite;
  }

  .cover {
    fill: color-mix(in srgb, var(--accent, #e8955a) 22%, var(--surface, #fff));
    stroke: var(--accent, #e8955a);
    stroke-width: 2.5;
  }

  .page {
    fill: none;
    stroke: color-mix(in srgb, var(--accent, #e8955a) 55%, transparent);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .eye {
    fill: none;
    stroke: var(--accent, #e8955a);
    stroke-width: 2.2;
    stroke-linecap: round;
    transform-box: fill-box;
    transform-origin: center;
    ${({ $sad }) =>
      !$sad &&
      css`
        animation: ${blink} 4.2s ease-in-out infinite;
      `}
  }

  .cheek {
    fill: color-mix(in srgb, var(--accent, #e8955a) 35%, transparent);
  }

  .mouth {
    fill: none;
    stroke: var(--accent, #e8955a);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .mark {
    fill: color-mix(in srgb, var(--accent, #e8955a) 70%, #000 15%);
    transform-box: fill-box;
    transform-origin: top center;
    animation: ${sway} 3.6s ease-in-out infinite;
  }

  .tear {
    fill: color-mix(in srgb, var(--accent, #e8955a) 45%, #6ba7d6);
    transform-box: fill-box;
    transform-origin: center top;
    animation: ${tear} 3.2s ease-in-out infinite;
  }

  .z {
    fill: var(--accent, #e8955a);
    font-family: var(--font);
    font-weight: var(--font-weight-bold, 700);
    font-size: 9px;
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }
  .z1 { animation: ${drift} 3s ease-in-out infinite; }
  .z2 { font-size: 8px; animation: ${drift} 3s ease-in-out 0.6s infinite; }
  .z3 { font-size: 7px; animation: ${drift} 3s ease-in-out 1.2s infinite; }

  @media (prefers-reduced-motion: reduce) {
    .body, .eye, .mark, .z, .tear { animation: none; }
    .z, .tear { opacity: 0.6; }
  }
`;
