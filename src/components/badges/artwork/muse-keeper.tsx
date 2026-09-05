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
 * A fanned deck of character cards, with the top one being dealt away.
 *
 * The badge is for keeping a *cast*, so the artwork is a stack rather than a
 * portrait: one muse is a face, fifty is a deck. Rose and ivory, and the only
 * silhouette on the shelf made of straight edges — everything else is a disc,
 * a ring, a bubble or a plate.
 */

/** The card the whole thing is built from, upright and centred. */
const CARD = { h: 64, rx: 5.5, w: 46, x: 37, y: 30 };

/** Where a card's shoulders and head sit inside it. */
const PORTRAIT = { cy: 52, r: 8.4 };
const SHOULDERS =
  "M45.5 78 C45.5 68.6 51.9 63.4 60 63.4 C68.1 63.4 74.5 68.6 74.5 78 Z";

/** The two lines of name under the portrait. */
const NAME_LINES = [
  { w: 24, y: 84 },
  { w: 16, y: 89.5 },
];

/** Rose caught around the deck. */
const SPARKS = [
  { cx: 26, cy: 34, r: 1.8 },
  { cx: 96, cy: 40, r: 1.4 },
  { cx: 30, cy: 96, r: 1.5 },
];

export const MuseKeeperBadge: FC<BadgeArtworkProps> = ({
  size,
  animated,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const face = muted ? [GREY.pale, GREY.light] : ["#FFF1F6", "#FFD3E4"];
  const back = muted ? [GREY.soft, GREY.deep] : ["#C6337E", "#6E0F3C"];
  const edge = muted ? GREY.edge : "#FF7FB4";
  const ink = muted ? GREY.ink : "#8C1B4E";
  const inkSoft = muted ? GREY.light : "#D986AC";
  const spark = muted ? GREY.pale : "#FFB4D4";

  /** One card body, so the three in the fan cannot drift out of step. */
  const card = (fill: string, stroke: string) => (
    <rect
      x={CARD.x}
      y={CARD.y}
      width={CARD.w}
      height={CARD.h}
      rx={CARD.rx}
      fill={fill}
      stroke={stroke}
      strokeOpacity={muted ? 0.5 : 0.9}
      strokeWidth="1.6"
    />
  );

  return (
    <BadgeSvg size={size} animated={animated}>
      <defs>
        <linearGradient id={id("face")} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor={face[0]} />
          <stop offset="100%" stopColor={face[1]} />
        </linearGradient>

        <linearGradient id={id("back")} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor={back[0]} />
          <stop offset="100%" stopColor={back[1]} />
        </linearGradient>

        <radialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#E04590"}
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#E04590"}
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="52"
        fill={`url(#${id("aura")})`}
      />

      {/* The two cards behind, fanning wider and closing again. Their angle
          lives in the keyframes rather than in a transform attribute here: on
          an SVG element the two are the same property, and the animation wins. */}
      <g className="nwb-card-l">{card(`url(#${id("back")})`, edge)}</g>
      <g className="nwb-card-r">{card(`url(#${id("back")})`, edge)}</g>

      {/* The card being looked at, which is dealt away to reveal the next. */}
      <g className="nwb-card-top">
        {card(`url(#${id("face")})`, edge)}

        {detailed && (
          <>
            <circle
              cx="60"
              cy={PORTRAIT.cy}
              r={PORTRAIT.r}
              fill={ink}
              fillOpacity={muted ? 0.5 : 0.9}
            />
            <path d={SHOULDERS} fill={ink} fillOpacity={muted ? 0.5 : 0.9} />

            <g
              stroke={inkSoft}
              strokeOpacity={muted ? 0.5 : 0.9}
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              {NAME_LINES.map((line) => (
                <path
                  key={line.y}
                  d={`M${60 - line.w / 2} ${line.y} H${60 + line.w / 2}`}
                />
              ))}
            </g>
          </>
        )}
      </g>

      {detailed &&
        SPARKS.map((s, index) => (
          <circle
            key={`${s.cx}-${s.cy}`}
            className={`nwb-spark-${index + 1}`}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill={spark}
          />
        ))}
    </BadgeSvg>
  );
};
