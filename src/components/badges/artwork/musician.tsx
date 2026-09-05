"use client";

import type { FC } from "react";
import {
  type BadgeArtworkProps,
  BadgeSvg,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "./frame";

/**
 * A cassette, reels turning, with the level meter jumping above it.
 *
 * The shelf already has a record on it, so this is deliberately the *other*
 * kind of music object: a rounded shell rather than a disc, amber and violet
 * rather than black and green, and a silhouette that stays a cassette at
 * thumbnail size. Now Playing is something a novelist listens to; this is
 * something they made, which is why this is the tape being written to.
 */

/** The shell, and the window cut into it. */
const SHELL = { h: 62, rx: 11, w: 96, x: 12, y: 30 };
const WINDOW = { h: 26, rx: 5, w: 70, x: 25, y: 58 };

/**
 * The two reels: centre, and how much tape is wound on each.
 *
 * Different radii on purpose — this is a side halfway through, not a blank —
 * and the spokes are sized from the pack so both reels read as the same
 * mechanism holding different amounts.
 *
 * styles.ts repeats these centres, because a hub turns about its own spindle.
 */
const REEL_L = { pack: 8.5, x: 45, y: 71 };
const REEL_R = { pack: 6.5, x: 75, y: 71 };
const HUB_R = 3.2;

/** Three spokes, not six: at badge size six radiating bars read as a sunburst. */
const SPOKES = [0, 120, 240];

/**
 * The level meter, above the shell.
 *
 * Four bars, each a different resting height so a stopped meter still reads as
 * a signal rather than as a fence, and each animated on its own delay.
 */
const BARS = [
  { h: 12, x: 43 },
  { h: 20, x: 51 },
  { h: 16, x: 59 },
  { h: 23, x: 67 },
];
/** The feet sit inside the shell's top edge, so a bar grows out from behind it. */
const BAR_BASE = 34;
const BAR_W = 5;

/** The four screws that hold a shell together. */
const SCREWS = [
  { x: 20, y: 38 },
  { x: 100, y: 38 },
  { x: 20, y: 84 },
  { x: 100, y: 84 },
];

export const MusicianBadge: FC<BadgeArtworkProps> = ({
  size,
  animated,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const shell = muted ? [GREY.soft, GREY.mid] : ["#6B36A6", "#31164F"];
  const shellEdge = muted ? GREY.edge : "#1D0C31";
  const label = muted ? GREY.pale : "#FDF3E0";
  const labelLine = muted ? GREY.ink : "#B08447";
  const amber = muted ? GREY.light : "#F5B54A";
  const amberDeep = muted ? GREY.ink : "#B9762A";
  const amberBright = muted ? GREY.pale : "#FFE0A0";
  const windowGlass = muted ? GREY.deep : "#160A24";
  // Light enough to be a spool of tape against the window rather than a
  // slightly different shade of the same dark.
  const tape = muted ? GREY.soft : "#6A4526";
  const tapeEdge = muted ? GREY.ink : "#8E6034";

  return (
    <BadgeSvg size={size} animated={animated}>
      <defs>
        <linearGradient id={id("shell")} x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor={shell[0]} />
          <stop offset="100%" stopColor={shell[1]} />
        </linearGradient>

        <radialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#F5B54A"}
            stopOpacity="0.32"
          />
          <stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#F5B54A"}
            stopOpacity="0"
          />
        </radialGradient>

        {/* The sheen is clipped to the shell: a light sweep running past the
            edges reads as a scratch on the screen rather than on the plastic. */}
        <clipPath id={id("clip")}>
          <rect
            x={SHELL.x}
            y={SHELL.y}
            width={SHELL.w}
            height={SHELL.h}
            rx={SHELL.rx}
          />
        </clipPath>

        <linearGradient id={id("sheen")} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop
            offset="50%"
            stopColor="#FFFFFF"
            stopOpacity={muted ? 0.06 : 0.2}
          />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="54"
        fill={`url(#${id("aura")})`}
      />

      {/* The meter, reading the tape below it. Drawn before the shell so a bar
          that overshoots tucks behind the casing instead of floating over it. */}
      {detailed &&
        BARS.map((bar, index) => (
          <rect
            key={bar.x}
            className={`nwb-bar-${index + 1}`}
            x={bar.x}
            y={BAR_BASE - bar.h}
            width={BAR_W}
            height={bar.h}
            rx={BAR_W / 2}
            fill={amber}
            fillOpacity={muted ? 0.45 : 0.9}
          />
        ))}

      <rect
        x={SHELL.x}
        y={SHELL.y}
        width={SHELL.w}
        height={SHELL.h}
        rx={SHELL.rx}
        fill={`url(#${id("shell")})`}
        stroke={shellEdge}
        strokeOpacity={muted ? 0.5 : 0.9}
        strokeWidth="2"
      />

      {/* The paper label, and the two lines somebody wrote on it. */}
      {detailed && (
        <>
          <rect
            x="21"
            y="36"
            width="78"
            height="17"
            rx="3.5"
            fill={label}
            fillOpacity={muted ? 0.5 : 1}
          />
          <g
            stroke={labelLine}
            strokeOpacity={muted ? 0.5 : 0.75}
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <line x1="26" y1="42" x2="76" y2="42" />
            <line x1="26" y1="47.5" x2="60" y2="47.5" />
          </g>
        </>
      )}

      <rect
        x={WINDOW.x}
        y={WINDOW.y}
        width={WINDOW.w}
        height={WINDOW.h}
        rx={WINDOW.rx}
        fill={windowGlass}
        fillOpacity={muted ? 0.7 : 1}
      />

      {/* The tape running between the two spools, drawn before them so it
          disappears under the packs at both ends. */}
      {detailed && (
        <line
          x1={REEL_L.x}
          y1={REEL_L.y - REEL_L.pack + 0.8}
          x2={REEL_R.x}
          y2={REEL_R.y - REEL_R.pack + 0.8}
          stroke={tapeEdge}
          strokeOpacity={muted ? 0.6 : 1}
          strokeWidth="2.2"
        />
      )}

      {/* Both reels. The pack sits still — it is a circle, and nothing about it
          could show movement — while the hub and its spokes turn inside it.

          No transform attribute on either turning group: the placement lives on
          the children, because the CSS rotation would throw it away (see the
          header in styles.ts). */}
      {[REEL_L, REEL_R].map((reel, index) => (
        <g key={reel.x}>
          {detailed && (
            <circle
              cx={reel.x}
              cy={reel.y}
              r={reel.pack}
              fill={tape}
              fillOpacity={muted ? 0.6 : 1}
              stroke={tapeEdge}
              strokeOpacity={muted ? 0.4 : 0.8}
              strokeWidth="1"
            />
          )}

          <g className={index === 0 ? "nwb-reel-l" : "nwb-reel-r"}>
            {detailed &&
              SPOKES.map((deg) => (
                <rect
                  key={deg}
                  x={reel.x - 0.85}
                  y={reel.y - reel.pack + 1.2}
                  width="1.7"
                  height={reel.pack - HUB_R}
                  rx="0.85"
                  fill={amberBright}
                  fillOpacity={muted ? 0.45 : 0.9}
                  transform={`rotate(${deg} ${reel.x} ${reel.y})`}
                />
              ))}
            <circle
              cx={reel.x}
              cy={reel.y}
              r={HUB_R}
              fill={amber}
              stroke={amberDeep}
              strokeOpacity={muted ? 0.5 : 0.9}
              strokeWidth="1.2"
            />
          </g>
        </g>
      ))}

      {detailed && (
        <g fill={amberDeep} fillOpacity={muted ? 0.4 : 0.7}>
          {SCREWS.map((screw) => (
            <circle
              key={`${screw.x}-${screw.y}`}
              cx={screw.x}
              cy={screw.y}
              r="1.7"
            />
          ))}
        </g>
      )}

      <g clipPath={`url(#${id("clip")})`}>
        <rect
          className="nwb-sheen"
          x="-4"
          y={SHELL.y}
          width="22"
          height={SHELL.h}
          fill={`url(#${id("sheen")})`}
        />
      </g>
    </BadgeSvg>
  );
};
