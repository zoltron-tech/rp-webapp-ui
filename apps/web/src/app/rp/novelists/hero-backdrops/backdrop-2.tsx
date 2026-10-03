"use client";

import type { FC } from "react";
import * as S from "./backdrop-2.styles";

/* Backdrop 2 — "Woven threads".
 *
 * Long story threads drifting across the hero and crossing one another, with
 * the crossings lit. See ./backdrop-2.styles for the performance constraints
 * this is built around, and ./index.ts for how to switch which backdrop the
 * hero renders. Purely decorative, so hidden from assistive tech. */

type Thread = {
  /** Dash pattern; a long dash with a long gap reads as a travelling strand. */
  dash: string;
  d: string;
  /** Which drift lane to ride, so no two threads move in step. */
  lane: string;
  opacity: number;
  stroke: string;
  width: number;
};

/* Drawn across a 1440x640 field, but extended well past both edges: each lane
   drifts by up to ~46 units, and the curves have to still cover the frame at
   the end of that travel. They deliberately cross rather than running
   parallel, since the crossings are where the knots go. */
const THREADS: Thread[] = [
  {
    d: "M-220 168C120 92 360 236 620 200S1030 60 1240 140 1660 250 1660 250",
    dash: "260 150",
    lane: "l1",
    opacity: 0.85,
    stroke: "var(--accent-11)",
    width: 2,
  },
  {
    d: "M-220 300C140 386 420 214 660 268S1060 420 1280 340 1660 214 1660 214",
    dash: "200 190",
    lane: "l2",
    opacity: 0.6,
    stroke: "var(--accent-10)",
    width: 1.6,
  },
  {
    d: "M-220 96C160 180 400 60 640 118S1080 268 1300 208 1660 120 1660 120",
    dash: "150 220",
    lane: "l3",
    opacity: 0.4,
    stroke: "var(--accent-8)",
    width: 1.2,
  },
  {
    d: "M-220 452C180 372 440 500 700 446S1100 300 1320 386 1660 460 1660 460",
    dash: "300 170",
    lane: "l4",
    opacity: 0.5,
    stroke: "var(--accent-11)",
    width: 1.4,
  },
  {
    d: "M-220 540C140 596 460 468 720 528S1120 620 1360 540 1660 486 1660 486",
    dash: "180 240",
    lane: "l5",
    opacity: 0.32,
    stroke: "var(--accent-10)",
    width: 1.1,
  },
  {
    d: "M-220 238C200 300 420 388 700 356S1080 176 1310 268 1660 330 1660 330",
    dash: "120 260",
    lane: "l6",
    opacity: 0.26,
    stroke: "var(--accent)",
    width: 1,
  },
];

/** Sat on visible crossings, so a knot always lands where two threads meet. */
const KNOTS = [
  { pace: "k1", r: 4, x: 268, y: 196 },
  { pace: "k2", r: 3.2, x: 640, y: 200 },
  { pace: "k3", r: 4.4, x: 1004, y: 236 },
  { pace: "k4", r: 3, x: 428, y: 372 },
  { pace: "k5", r: 3.6, x: 1298, y: 320 },
  { pace: "k2", r: 2.6, x: 796, y: 470 },
];

export const WovenThreadsBackdrop: FC = () => (
  <S.Backdrop
    viewBox="0 0 1440 640"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="hero2-sky" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor="#0c1512" />
        <stop offset="55%" stopColor="#0a0f12" />
        <stop offset="100%" stopColor="#08090c" />
      </linearGradient>

      <radialGradient id="hero2-bloom-a" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="hero2-bloom-b" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--accent-11)" stopOpacity="0.3" />
        <stop offset="100%" stopColor="var(--accent-11)" stopOpacity="0" />
      </radialGradient>

      {/* Edge fades, painted over the threads rather than masking them: a mask
          would re-composite the whole animated field every frame. */}
      <linearGradient id="hero2-edge-l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0a0f12" stopOpacity="1" />
        <stop offset="100%" stopColor="#0a0f12" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="hero2-edge-r" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0a0f12" stopOpacity="0" />
        <stop offset="100%" stopColor="#0a0f12" stopOpacity="1" />
      </linearGradient>
    </defs>

    <rect width="1440" height="640" fill="url(#hero2-sky)" />

    <ellipse
      className="bloom b1"
      cx="330"
      cy="180"
      rx="560"
      ry="340"
      fill="url(#hero2-bloom-a)"
    />
    <ellipse
      className="bloom b2"
      cx="1150"
      cy="420"
      rx="520"
      ry="320"
      fill="url(#hero2-bloom-b)"
    />

    {THREADS.map((thread) => (
      <g className={`lane ${thread.lane}`} key={thread.d}>
        <path
          d={thread.d}
          fill="none"
          stroke={thread.stroke}
          strokeWidth={thread.width}
          strokeDasharray={thread.dash}
          strokeLinecap="round"
          opacity={thread.opacity}
        />
      </g>
    ))}

    <g fill="var(--accent-11)">
      {KNOTS.map((knot) => (
        <circle
          key={`${knot.x}-${knot.y}`}
          className={`knot ${knot.pace}`}
          cx={knot.x}
          cy={knot.y}
          r={knot.r}
        />
      ))}
    </g>

    <rect width="180" height="640" fill="url(#hero2-edge-l)" />
    <rect x="1260" width="180" height="640" fill="url(#hero2-edge-r)" />
  </S.Backdrop>
);
