import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "@nw/animations";
import type { FC } from "react";
import {
  type BadgeArtworkProps,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "../frame";

/**
 * A retro typewriter with a page coming out of it.
 *
 * The badge is for fifty posts written inside a story's chapters — the writing
 * itself, page after page — so the art is the machine that turns pages out: a
 * pastel portable with cream keys, a typed sheet rising from the roller, the
 * fan of typebars under it, ribbon spools and a chrome return lever. The only
 * typewriter on the shelf, and the one crest that is about writing rather than
 * the book it ends up in. The carriage steps along a keystroke at a time as
 * the line types itself, the bell rings, the carriage is thrown back, and the
 * next line begins. Pastel pink, cream, chrome, a red ribbon.
 */

/** The sheet in the machine, and the lines already typed on it. */
const PAPER = { h: 34, w: 40, x: 40, y: 20 };
const TYPED = [
  { w: 30, y: 25 },
  { w: 26, y: 29.5 },
  { w: 29, y: 34 },
  { w: 22, y: 38.5 },
  { w: 27, y: 43 },
];

/** The platen roller, its knobs and the return lever. */
const PLATEN = { h: 8, w: 64, x: 28, y: 46 };
const KNOBS = [24, 96];
const LEVER = "M27 48 C22 44 18 40 16 35";

/** The body: a sloping deck over a deep front. */
const DECK = "M30 54 H90 L99 79 H21 Z";
const FRONT = { h: 13, w: 86, x: 17, y: 79 };
/** The window onto the typebars, under the paper. */
const BASKET = "M47 54 A13 7.5 0 0 0 73 54 Z";

/** Keys in three staggered rows, then the space bar. */
const KEY_ROWS = [
  { count: 8, gap: 7.8, y: 65.5 },
  { count: 9, gap: 7.8, y: 71 },
  { count: 8, gap: 7.8, y: 76.4 },
];
const SPACE = { h: 3.6, w: 34, x: 43, y: 84 };

/** Which keys take part in the typing: key index to its rhythm's class. */
const TYPING_KEYS: Record<number, string> = {
  3: "nwb-key-1",
  6: "nwb-key-3",
  12: "nwb-key-2",
  19: "nwb-key-4",
};

/** The ribbon spools either side of the basket. */
const SPOOLS = [36, 84];

export const PageTurnerBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const body = muted ? [GREY.pale, GREY.soft] : ["#F9C6D8", "#D8799E"];
  const bodyEdge = muted ? GREY.deep : "#7A2E4C";
  const paper = muted ? GREY.pale : "#FFFBF0";
  const ink = muted ? GREY.light : "#5A4A5E";
  const chrome = muted ? [GREY.pale, GREY.ink] : ["#F4F6FA", "#8A90A2"];
  const dark = muted ? GREY.deep : "#2A2030";
  const keyFace = muted ? GREY.pale : "#FFF4E2";
  const ribbon = muted ? GREY.soft : "#D8433A";

  const keys = KEY_ROWS.flatMap((row) => {
    const width = (row.count - 1) * row.gap;
    return Array.from({ length: row.count }, (_, i) => ({
      x: 60 - width / 2 + i * row.gap,
      y: row.y,
    }));
  });

  return (
    <>
      <Defs>
        <ClipPath id={id("paper")}>
          <Rect x={PAPER.x} y={PAPER.y} width={PAPER.w} height={PAPER.h} />
        </ClipPath>
        <LinearGradient id={id("body")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={body[0]} />
          <Stop offset="100%" stopColor={body[1]} />
        </LinearGradient>
        <LinearGradient id={id("chrome")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={chrome[0]} />
          <Stop offset="100%" stopColor={chrome[1]} />
        </LinearGradient>
        {/* Across the roller: lit along its top, dark below. */}
        <LinearGradient id={id("platen")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={muted ? GREY.soft : "#5A5064"} />
          <Stop offset="45%" stopColor={dark} />
          <Stop offset="100%" stopColor="#000" />
        </LinearGradient>
        <LinearGradient
          id={id("sheet")}
          x1="0"
          y1={PAPER.y}
          x2="0"
          y2={PAPER.y + PAPER.h}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0%" stopColor={paper} />
          <Stop offset="100%" stopColor={muted ? GREY.light : "#EFE6D2"} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#F4A3C1"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#F4A3C1"}
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="54"
        fill={`url(#${id("aura")})`}
      />

      {/* The carriage — sheet, roller, knobs and lever — stepping left a
          keystroke at a time, then thrown back by the lever. */}
      <G className="nwb-carriage">
        {/* The sheet first, so the roller holds its foot. */}
        <Rect
          x={PAPER.x}
          y={PAPER.y}
          width={PAPER.w}
          height={PAPER.h}
          rx="1"
          fill={`url(#${id("sheet")})`}
          stroke={muted ? GREY.soft : "#B9A98A"}
          strokeWidth="0.7"
        />
        {detailed && (
          <G clipPath={`url(#${id("paper")})`}>
            {TYPED.map((line) => (
              <Path
                key={line.y}
                d={`M${PAPER.x + 5} ${line.y} H${PAPER.x + 5 + line.w}`}
                stroke={ink}
                strokeOpacity="0.55"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeDasharray="3 1.2 5 1.2 2 1.2"
              />
            ))}
            {/* The line being typed: a strip of paper over it that steps
                aside one keystroke at a time. It rests off the sheet to the
                right, so a still crest shows the line typed. */}
            <G className="nwb-typing">
              <Rect
                x={PAPER.x + PAPER.w + 1}
                y={TYPED[TYPED.length - 1].y - 1.8}
                width="33"
                height="3.6"
                fill={`url(#${id("sheet")})`}
              />
            </G>
          </G>
        )}

        {/* The roller, its knobs, and the return lever off the left end. */}
        <Path
          d={LEVER}
          fill="none"
          stroke={`url(#${id("chrome")})`}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <Circle cx="16" cy="35" r="2" fill={`url(#${id("chrome")})`} />
        <Rect
          x={PLATEN.x}
          y={PLATEN.y}
          width={PLATEN.w}
          height={PLATEN.h}
          rx="4"
          fill={`url(#${id("platen")})`}
        />
        {KNOBS.map((x) => (
          <G key={x}>
            <Circle
              cx={x}
              cy={PLATEN.y + PLATEN.h / 2}
              r="4.6"
              fill={`url(#${id("chrome")})`}
              stroke={dark}
              strokeWidth="0.8"
            />
            {detailed && (
              <Circle
                cx={x}
                cy={PLATEN.y + PLATEN.h / 2}
                r="1.8"
                fill={dark}
                fillOpacity="0.5"
              />
            )}
          </G>
        ))}
      </G>

      {/* The bell at the end of the line. Exists only while it rings. */}
      {detailed && (
        <G className="nwb-ding">
          <Path
            d="M101 40 L104 37 M103 44 L107 43 M98 38 L98.6 34"
            stroke={muted ? GREY.pale : "#FFE27A"}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </G>
      )}

      {/* The body. */}
      <Path
        d={DECK}
        fill={`url(#${id("body")})`}
        stroke={bodyEdge}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <Rect
        x={FRONT.x}
        y={FRONT.y}
        width={FRONT.w}
        height={FRONT.h}
        rx="3.4"
        fill={`url(#${id("body")})`}
        stroke={bodyEdge}
        strokeWidth="1"
      />
      {detailed && (
        <Path
          d={`M${FRONT.x + 4} ${FRONT.y + 1.6} H${FRONT.x + FRONT.w - 4}`}
          stroke="#FFF"
          strokeOpacity={muted ? 0.2 : 0.45}
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      )}

      {/* The window onto the typebars, fanned under the paper. */}
      <Path d={BASKET} fill={dark} />
      {detailed &&
        [-60, -40, -20, 0, 20, 40, 60].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <Path
              key={deg}
              d={`M60 55 L${60 + Math.sin(rad) * 10.5} ${55 + Math.cos(rad) * 6}`}
              stroke={`url(#${id("chrome")})`}
              strokeWidth="0.8"
            />
          );
        })}

      {/* Ribbon spools. */}
      {SPOOLS.map((x) => (
        <G key={x}>
          <Circle
            cx={x}
            cy="58.5"
            r="4"
            fill={`url(#${id("chrome")})`}
            stroke={dark}
            strokeWidth="0.7"
          />
          <Circle cx={x} cy="58.5" r="2.4" fill={ribbon} />
        </G>
      ))}

      {/* Keys, then the space bar. */}
      {keys.map((k, i) => (
        <G key={`${k.x}-${k.y}`} className={TYPING_KEYS[i]}>
          <Circle cx={k.x} cy={k.y} r="2.45" fill={dark} />
          <Circle cx={k.x} cy={k.y - 0.4} r="1.9" fill={keyFace} />
        </G>
      ))}
      <Rect
        className="nwb-key-5"
        x={SPACE.x}
        y={SPACE.y}
        width={SPACE.w}
        height={SPACE.h}
        rx="1.8"
        fill={keyFace}
        stroke={dark}
        strokeWidth="0.9"
      />

      {/* Feet. */}
      {[24, 96].map((x) => (
        <Ellipse key={x} cx={x} cy="92.6" rx="4" ry="1.6" fill={dark} />
      ))}
    </>
  );
};
