import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/** Slow, sleepy bob for the whole mascot. */
const bob = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-3px) rotate(-1.5deg); }
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

export const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-block: 20px 8px;
  animation: ${fadeUp} 0.35s ease both;
`;

export const Mascot = styled.svg`
  width: 56px;
  height: 52px;
  overflow: visible;

  .body {
    transform-box: fill-box;
    transform-origin: center bottom;
    animation: ${bob} 3.6s ease-in-out infinite;
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
    animation: ${blink} 4.2s ease-in-out infinite;
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
    .body, .eye, .mark, .z { animation: none; }
    .z { opacity: 0.6; }
  }
`;

export const Label = styled.span`
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-align: center;
`;
