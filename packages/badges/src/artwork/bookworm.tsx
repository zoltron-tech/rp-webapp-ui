import {
  Circle,
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
 * A bookworm in spectacles, eating its way through a stack of books.
 *
 * The badge is for twenty-five books marked Read on the bookshelf, so the art
 * is the reader the word was coined for: a cheerful worm in round glasses
 * tunnelling out of the third book of a stack, its tail still poking out of
 * the bottom one on the other side, paper crumbs round the hole it chewed. The
 * stack lies flat, so it reads differently from Chronicler's upright shelf.
 * The worm sways from its hole, blinks behind its glasses and glances about,
 * nibbles crumbs out of the hole, and wiggles its tail. Four hardbacks, gold
 * tooling, a spring-green worm.
 */

/** The stack, top to bottom: each book's spine face and its leather. */
const BOOKS = [
  { h: 9, tone: 0, w: 62, x: 30, y: 52 },
  { h: 10, tone: 1, w: 72, x: 21, y: 61 },
  { h: 11, tone: 2, w: 68, x: 27, y: 71 },
  { h: 12, tone: 3, w: 76, x: 22, y: 82 },
];

/** Leather, as [face, shadow]: mustard, forest, oxblood, navy. */
const LEATHER = [
  ["#D9A23A", "#9C6E1E"],
  ["#2F7A52", "#174A30"],
  ["#9A2E40", "#5E1422"],
  ["#2B4A7E", "#162A4E"],
];

/** Where the worm comes out of the third book, and where its tail is. */
const HOLE = { cx: 70, cy: 66, rx: 4.6, ry: 3.2 };
const TAIL_HOLE = { cx: 33, cy: 88, rx: 3.2, ry: 2.4 };

/** The worm's body, arching up out of the hole to its head. */
const BODY = "M70 66 C72 53 67 44 56 41";
const HEAD = { cx: 52, cy: 38, r: 8 };
/** The tail: a short curl out of the bottom book. */
const TAIL = "M33 88 C29 87 26 84 27 81";

/** Paper crumbs round the hole. */
const CRUMBS = [
  "M75.5 61 l2 -1 l0.4 1.8 Z",
  "M76 68.5 l2.2 0.6 l-1 1.6 Z",
  "M64 61.5 l-1.8 -1.2 l1.6 -0.8 Z",
  "M79 64.5 l1.6 -0.4 l-0.2 1.4 Z",
];

export const BookwormBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const leather = muted
    ? [
        [GREY.light, GREY.soft],
        [GREY.soft, GREY.deep],
        [GREY.mid, GREY.deep],
        [GREY.soft, GREY.deep],
      ]
    : LEATHER;
  const gold = muted ? GREY.pale : "#F2CF6A";
  const label = muted ? GREY.pale : "#F6EBCF";
  const worm = muted ? [GREY.pale, GREY.light] : ["#B8EC72", "#5DAA34"];
  const wormEdge = muted ? GREY.soft : "#2F6A1A";
  const keyline = muted ? GREY.deep : "#1E1E28";
  const cheek = muted ? GREY.light : "#FF9AA8";
  const paper = muted ? GREY.pale : "#FFF6E0";

  return (
    <>
      <Defs>
        <LinearGradient id={id("worm")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={worm[0]} />
          <Stop offset="100%" stopColor={worm[1]} />
        </LinearGradient>
        {/* Across each spine: lit along the top edge, shaded underneath. */}
        <LinearGradient id={id("spine")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFF" stopOpacity={muted ? 0.1 : 0.22} />
          <Stop offset="40%" stopColor="#FFF" stopOpacity="0" />
          <Stop
            offset="100%"
            stopColor="#000"
            stopOpacity={muted ? 0.15 : 0.3}
          />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#8BC34A"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#8BC34A"}
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

      {/* The stack, bottom book drawn first so each sits on the one below. */}
      {[...BOOKS].reverse().map((b) => {
        const [face, shadow] = leather[b.tone];
        return (
          <G key={b.y}>
            <Rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="2"
              fill={face}
              stroke={shadow}
              strokeWidth="0.9"
            />
            <Rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="2"
              fill={`url(#${id("spine")})`}
            />
            {detailed && (
              <>
                <Rect
                  x={b.x + 5}
                  y={b.y + 1}
                  width="1.3"
                  height={b.h - 2}
                  fill={gold}
                />
                <Rect
                  x={b.x + b.w - 6.3}
                  y={b.y + 1}
                  width="1.3"
                  height={b.h - 2}
                  fill={gold}
                />
                <Rect
                  x={b.x + b.w / 2 - 9}
                  y={b.y + b.h / 2 - 1.7}
                  width="18"
                  height="3.4"
                  rx="0.8"
                  fill={label}
                  fillOpacity={muted ? 0.5 : 0.85}
                />
              </>
            )}
          </G>
        );
      })}

      {/* The holes the worm chewed: out of the third book, and the bottom. */}
      {[HOLE, TAIL_HOLE].map((h) => (
        <G key={h.cx}>
          <Ellipse
            cx={h.cx}
            cy={h.cy}
            rx={h.rx + 0.8}
            ry={h.ry + 0.7}
            fill={paper}
          />
          <Ellipse cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry} fill="#160C08" />
        </G>
      ))}
      {/* Crumbs, puffing out of the hole as the worm nibbles. */}
      {detailed && (
        <G className="nwb-crumbs">
          {CRUMBS.map((d) => (
            <Path key={d} d={d} fill={paper} />
          ))}
        </G>
      )}

      {/* The tail, curling out of the bottom book and wiggling. */}
      <G className="nwb-tail-wiggle">
        <Path
          d={TAIL}
          fill="none"
          stroke={wormEdge}
          strokeWidth="6.4"
          strokeLinecap="round"
        />
        <Path
          d={TAIL}
          fill="none"
          stroke={`url(#${id("worm")})`}
          strokeWidth="4.8"
          strokeLinecap="round"
        />
      </G>

      {/* The worm, swaying from its hole: body, rings and head together. */}
      <G className="nwb-worm">
        <Path
          d={BODY}
          fill="none"
          stroke={wormEdge}
          strokeWidth="11.6"
          strokeLinecap="round"
        />
        <Path
          d={BODY}
          fill="none"
          stroke={`url(#${id("worm")})`}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {detailed &&
          [
            "M64.6 60 Q69.6 61.4 74 59.4",
            "M65.4 53 Q70.4 53.6 74.4 51",
            "M63.4 46.4 Q67.4 46 70.2 42.6",
          ].map((d) => (
            <Path
              key={d}
              d={d}
              fill="none"
              stroke={wormEdge}
              strokeOpacity="0.5"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          ))}

        <Circle
          cx={HEAD.cx}
          cy={HEAD.cy}
          r={HEAD.r}
          fill={`url(#${id("worm")})`}
          stroke={wormEdge}
          strokeWidth="0.8"
        />
        {/* Lenses, then the pupils behind them, which glance about. */}
        {[-3.4, 3.4].map((dx) => (
          <Circle
            key={`lens-${dx}`}
            cx={HEAD.cx + dx}
            cy={HEAD.cy - 1}
            r="2.9"
            fill="#FFF"
          />
        ))}
        <G className="nwb-pupils">
          {[-3.4, 3.4].map((dx) => (
            <Circle
              key={`pupil-${dx}`}
              cx={HEAD.cx + dx + 0.5}
              cy={HEAD.cy - 0.6}
              r="1.2"
              fill={keyline}
            />
          ))}
        </G>
        {/* Eyelids: folded away at rest, dropping over the lenses to blink. */}
        {detailed && (
          <G className="nwb-eyelid">
            {[-3.4, 3.4].map((dx) => (
              <Path
                key={`lid-${dx}`}
                d={`M${HEAD.cx + dx - 2.9} ${HEAD.cy - 1} A2.9 2.9 0 0 1 ${HEAD.cx + dx + 2.9} ${HEAD.cy - 1} A2.9 2.9 0 0 1 ${HEAD.cx + dx - 2.9} ${HEAD.cy - 1} Z`}
                fill={worm[1]}
              />
            ))}
          </G>
        )}
        {/* The spectacles' rims and bridge, over everything. */}
        {[-3.4, 3.4].map((dx) => (
          <Circle
            key={`rim-${dx}`}
            cx={HEAD.cx + dx}
            cy={HEAD.cy - 1}
            r="2.9"
            fill="none"
            stroke={keyline}
            strokeWidth="1"
          />
        ))}
        <Path
          d={`M${HEAD.cx - 0.5} ${HEAD.cy - 1.4} Q${HEAD.cx} ${HEAD.cy - 2.2} ${HEAD.cx + 0.5} ${HEAD.cy - 1.4}`}
          fill="none"
          stroke={keyline}
          strokeWidth="0.9"
        />
        {detailed && (
          <>
            <Path
              d={`M${HEAD.cx - 2.4} ${HEAD.cy + 3.4} Q${HEAD.cx} ${HEAD.cy + 5.4} ${HEAD.cx + 2.4} ${HEAD.cy + 3.4}`}
              fill="none"
              stroke={keyline}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            {[-5.4, 5.4].map((dx) => (
              <Ellipse
                key={dx}
                cx={HEAD.cx + dx}
                cy={HEAD.cy + 3}
                rx="1.5"
                ry="1"
                fill={cheek}
                fillOpacity="0.8"
              />
            ))}
          </>
        )}
      </G>
    </>
  );
};
