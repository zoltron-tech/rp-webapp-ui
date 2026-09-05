"use client";

import type { FC } from "react";
import * as S from "./backdrop-1.styles";

/* Backdrop 1 — "Aurora field".
 *
 * An accent aurora over a faint ruled-paper field, with a constellation of
 * writers and the threads between them. See ./index.ts for how to switch which
 * backdrop the hero renders. Purely decorative, so hidden from assistive tech. */

/** Writers scattered across the field, and the threads that connect some. */
const STARS = [
  { r: 1.6, x: 120, y: 150 },
  { r: 1.2, x: 268, y: 96 },
  { r: 1.8, x: 402, y: 214 },
  { r: 1.1, x: 560, y: 120 },
  { r: 1.5, x: 690, y: 268 },
  { r: 1.3, x: 848, y: 146 },
  { r: 1.7, x: 980, y: 300 },
  { r: 1.2, x: 1112, y: 178 },
  { r: 1.4, x: 1256, y: 96 },
  { r: 1.6, x: 1340, y: 260 },
  { r: 1.1, x: 196, y: 330 },
  { r: 1.3, x: 470, y: 420 },
  { r: 1.5, x: 760, y: 470 },
  { r: 1.2, x: 1040, y: 430 },
  { r: 1.4, x: 1290, y: 500 },
  { r: 1.1, x: 60, y: 470 },
  { r: 1.3, x: 610, y: 62 },
  { r: 1.2, x: 900, y: 60 },
];

/** Only a few, and faint: the backdrop should never compete with the copy. */
const THREADS = [
  { from: 0, to: 10 },
  { from: 1, to: 3 },
  { from: 4, to: 6 },
  { from: 7, to: 8 },
  { from: 11, to: 12 },
  { from: 13, to: 14 },
];

const MOTES = [
  { delay: "m1", x: 210, y: 520 },
  { delay: "m2", x: 520, y: 560 },
  { delay: "m3", x: 880, y: 540 },
  { delay: "m4", x: 1180, y: 570 },
  { delay: "m5", x: 1390, y: 520 },
];

export const AuroraFieldBackdrop: FC = () => (
  <S.Backdrop
    viewBox="0 0 1440 640"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      {/* Aurora washes, tinted by the reader's accent. */}
      <radialGradient id="hero-aurora-a" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.72" />
        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="hero-aurora-b" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--accent-8)" stopOpacity="0.52" />
        <stop offset="100%" stopColor="var(--accent-8)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="hero-aurora-c" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--accent-11)" stopOpacity="0.3" />
        <stop offset="100%" stopColor="var(--accent-11)" stopOpacity="0" />
      </radialGradient>

      {/* Ruled paper, fading out before it reaches the copy. */}
      <pattern
        id="hero-rules"
        width="100"
        height="34"
        patternUnits="userSpaceOnUse"
      >
        <line
          x1="0"
          y1="33.5"
          x2="100"
          y2="33.5"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.05"
        />
      </pattern>
      <linearGradient id="hero-rules-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity="0" />
        <stop offset="55%" stopColor="#fff" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <mask id="hero-rules-mask">
        <rect width="1440" height="640" fill="url(#hero-rules-fade)" />
      </mask>
    </defs>

    <rect width="1440" height="640" fill="#0a0b0f" />

    <ellipse
      className="aurora a1"
      cx="300"
      cy="120"
      rx="520"
      ry="330"
      fill="url(#hero-aurora-a)"
    />
    <ellipse
      className="aurora a2"
      cx="1180"
      cy="220"
      rx="560"
      ry="360"
      fill="url(#hero-aurora-b)"
    />
    <ellipse
      className="aurora a3"
      cx="720"
      cy="520"
      rx="640"
      ry="280"
      fill="url(#hero-aurora-c)"
    />

    <rect
      className="rules"
      width="1440"
      height="640"
      fill="url(#hero-rules)"
      mask="url(#hero-rules-mask)"
    />

    <g className="threads" stroke="var(--accent-11)" strokeWidth="1">
      {THREADS.map((thread, i) => {
        const a = STARS[thread.from];
        const b = STARS[thread.to];
        return (
          <line
            key={i}
            className={`thread t${(i % 4) + 1}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
          />
        );
      })}
    </g>

    <g fill="var(--accent-11)">
      {STARS.map((star, i) => (
        <circle
          key={i}
          className={`star s${(i % 10) + 1}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
        />
      ))}
    </g>

    <g fill="var(--accent-10)">
      {MOTES.map((mote) => (
        <circle
          key={mote.delay}
          className={`mote ${mote.delay}`}
          cx={mote.x}
          cy={mote.y}
          r="2"
        />
      ))}
    </g>
  </S.Backdrop>
);
