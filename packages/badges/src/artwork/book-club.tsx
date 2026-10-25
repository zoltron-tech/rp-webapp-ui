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
 * Four friends on one sofa, all reading the same book.
 *
 * The badge is for reading a book three of your friends have read too, so
 * the art is the club itself: a tufted Chesterfield with four readers on it —
 * you and three friends — each holding up an open copy of the same crimson
 * book, only their hair and eyes showing over the top. Four matching covers in
 * a row is the whole idea, a speech bubble over them says they are talking it
 * over, and a camelback sofa is a shape nothing else on the shelf has. The
 * big bubble steps aside while they talk it over among themselves — a small
 * bubble over each reader in turn — and one of them peeks over her book.
 * Cobalt velvet, crimson and gold books.
 */

/** The sofa: back, rolled arms, seat and base. */
/** A camelback: straight sides rising to a curved crest in the middle. */
const BACK = "M25 80 V58 C25 48 40 42 60 40 C80 42 95 48 95 58 V80 Z";
const ARMS = [
  { h: 32, w: 13, x: 16 },
  { h: 32, w: 13, x: 91 },
];
const ARM_Y = 64;
const SEAT = { h: 9, w: 66, x: 27, y: 80 };
const BASE = { h: 6, w: 88, x: 16, y: 89 };
const LEGS = [22, 95];

/** Tufting buttons across the back. */
const TUFTS = [
  [46, 50],
  [60, 48],
  [74, 50],
  [32, 60],
  [46, 60],
  [60, 60],
  [74, 60],
  [88, 60],
  [39, 70],
  [53, 70],
  [67, 70],
  [81, 70],
];

/** The four readers: where they sit, and their hair. */
const READERS = [
  { hair: 0, style: "bun", x: 37.5 },
  { hair: 1, style: "short", x: 52.5 },
  { hair: 2, style: "long", x: 67.5 },
  { hair: 3, style: "curls", x: 82.5 },
];
const HEAD_Y = 58;
const HEAD_R = 5.6;
/** The open book each holds up: two covers meeting at the spine. */
const BOOK = { h: 14, half: 6.4, y: 61.5 };

const HAIR = ["#2A1E1A", "#C8622E", "#E6C066", "#6A4228"];

/**
 * What each reader says, drawn inside their bubble at their x: a couple of
 * lines, a question, a heart, an exclamation. Stroked unless it has a fill.
 */
const SAYINGS: { d: (x: number) => string; fill?: string }[] = [
  { d: (x) => `M${x - 5.6} 37.8 H${x + 5.6} M${x - 5.6} 40.8 H${x + 2.4}` },
  {
    d: (x) =>
      `M${x - 1.8} 37.6 C${x - 1.8} 35.9 ${x + 1.8} 35.9 ${x + 1.8} 37.6 C${x + 1.8} 39 ${x} 39 ${x} 40.4 M${x} 42.2 V42.3`,
  },
  {
    d: (x) =>
      `M${x} 42.4 C${x - 3.6} 40.4 ${x - 4.2} 38.2 ${x - 3} 37 C${x - 2} 36 ${x - 0.6} 36.4 ${x} 37.6 C${x + 0.6} 36.4 ${x + 2} 36 ${x + 3} 37 C${x + 4.2} 38.2 ${x + 3.6} 40.4 ${x} 42.4 Z`,
    fill: "#D8384E",
  },
  { d: (x) => `M${x} 36.4 V40 M${x} 42.2 V42.3` },
];

export const BookClubBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const velvet = muted ? [GREY.soft, GREY.deep] : ["#4A66C4", "#22337A"];
  const velvetEdge = muted ? GREY.deep : "#141E4C";
  const wood = muted ? GREY.deep : "#3A2210";
  const skin = muted ? GREY.pale : "#F4D3B0";
  const cover = muted ? [GREY.light, GREY.soft] : ["#D8384E", "#8E1428"];
  const gold = muted ? GREY.pale : "#F2CF6A";
  const keyline = muted ? GREY.deep : "#1E1428";
  const hair = muted ? [GREY.mid, GREY.soft, GREY.light, GREY.soft] : HAIR;

  const hairShape = (x: number, style: string): string => {
    const y = HEAD_Y;
    const r = HEAD_R;
    switch (style) {
      case "bun":
        return `M${x - r} ${y + 1} C${x - r} ${y - r - 1} ${x + r} ${y - r - 1} ${x + r} ${y + 1} C${x + 3} ${y - 2} ${x - 3} ${y - 2} ${x - r} ${y + 1} Z M${x - 2.6} ${y - r - 1} a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 Z`;
      case "long":
        return `M${x - r - 0.8} ${y + 5} C${x - r - 1.4} ${y - r - 1} ${x + r + 1.4} ${y - r - 1} ${x + r + 0.8} ${y + 5} L${x + r - 1} ${y + 5} C${x + 3} ${y - 1.5} ${x - 3} ${y - 1.5} ${x - r + 1} ${y + 5} Z`;
      case "curls":
        return `M${x - r - 1} ${y + 1} a2 2 0 0 1 1 -3.6 a2.2 2.2 0 0 1 2.6 -2.8 a2.4 2.4 0 0 1 4 0 a2.2 2.2 0 0 1 2.6 2.8 a2 2 0 0 1 1 3.6 C${x + 3} ${y - 1.6} ${x - 3} ${y - 1.6} ${x - r - 1} ${y + 1} Z`;
      default:
        return `M${x - r} ${y} C${x - r} ${y - r - 1.4} ${x + r} ${y - r - 1.4} ${x + r} ${y} C${x + 2} ${y - 3} ${x - 1} ${y - 2.2} ${x - r} ${y} Z`;
    }
  };

  return (
    <>
      <Defs>
        <LinearGradient id={id("velvet")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={velvet[0]} />
          <Stop offset="100%" stopColor={velvet[1]} />
        </LinearGradient>
        <LinearGradient id={id("cover")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={cover[0]} />
          <Stop offset="100%" stopColor={cover[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#3A55B0"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#3A55B0"}
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

      {/* The club's verdict: a speech bubble with a heart. It steps aside
          while the readers talk among themselves. */}
      <G className="nwb-club-bubble">
        <Path
          d="M48 16 H72 A4 4 0 0 1 76 20 V28 A4 4 0 0 1 72 32 H60 L55 37 L55.6 32 H48 A4 4 0 0 1 44 28 V20 A4 4 0 0 1 48 16 Z"
          fill={muted ? GREY.pale : "#FFF8EC"}
          stroke={keyline}
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <G className="nwb-heartbeat">
          <Path
            d="M60 29 C56 26.4 54.6 24.2 56 22.6 C57.2 21.4 59 21.8 60 23.2 C61 21.8 62.8 21.4 64 22.6 C65.4 24.2 64 26.4 60 29 Z"
            fill={muted ? GREY.soft : "#D8384E"}
          />
        </G>
      </G>

      {/* The sofa's back, with its tufting. */}
      <Path
        d={BACK}
        fill={`url(#${id("velvet")})`}
        stroke={velvetEdge}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {detailed &&
        TUFTS.map(([x, y]) => (
          <G key={`${x}-${y}`}>
            <Circle cx={x} cy={y} r="0.9" fill={velvetEdge} />
            <Path
              d={`M${x - 3} ${y - 2.4} L${x} ${y} L${x + 3} ${y - 2.4} M${x} ${y} V${y + 3}`}
              fill="none"
              stroke={velvetEdge}
              strokeOpacity="0.35"
              strokeWidth="0.6"
            />
          </G>
        ))}

      {/* The readers: heads over the back, each behind the same book. */}
      {READERS.map((r, i) => (
        // The third reader peeks over her book at the others now and then.
        <G key={r.x} className={i === 2 ? "nwb-peek" : undefined}>
          <Circle
            cx={r.x}
            cy={HEAD_Y}
            r={HEAD_R}
            fill={skin}
            stroke={keyline}
            strokeWidth="0.6"
          />
          <Path d={hairShape(r.x, r.style)} fill={hair[r.hair]} />
          {/* Eyes peeking over the top of the book. */}
          {[-2, 2].map((dx) => (
            <Circle
              key={dx}
              cx={r.x + dx}
              cy={HEAD_Y + 1.2}
              r="0.9"
              fill={keyline}
            />
          ))}
        </G>
      ))}

      {/* Seat, arms and base, in front of the readers' laps. */}
      <Rect
        x={SEAT.x}
        y={SEAT.y}
        width={SEAT.w}
        height={SEAT.h}
        rx="3"
        fill={`url(#${id("velvet")})`}
        stroke={velvetEdge}
        strokeWidth="1"
      />
      <Rect
        x={BASE.x}
        y={BASE.y}
        width={BASE.w}
        height={BASE.h}
        rx="2"
        fill={velvet[1]}
        stroke={velvetEdge}
        strokeWidth="1"
      />
      {LEGS.map((x) => (
        <Rect
          key={x}
          x={x}
          y={BASE.y + BASE.h - 0.6}
          width="3"
          height="3.6"
          rx="1"
          fill={wood}
        />
      ))}
      {ARMS.map((a) => (
        <G key={a.x}>
          <Rect
            x={a.x}
            y={ARM_Y}
            width={a.w}
            height={a.h}
            rx="5"
            fill={`url(#${id("velvet")})`}
            stroke={velvetEdge}
            strokeWidth="1"
          />
          {/* The roll at the top of the arm. */}
          <Ellipse
            cx={a.x + a.w / 2}
            cy={ARM_Y + 3}
            rx={a.w / 2}
            ry="3.6"
            fill={velvet[0]}
            stroke={velvetEdge}
            strokeWidth="0.8"
          />
          {detailed && (
            <Circle
              cx={a.x + a.w / 2}
              cy={ARM_Y + 3}
              r="1.4"
              fill="none"
              stroke={velvetEdge}
              strokeOpacity="0.5"
              strokeWidth="0.6"
            />
          )}
        </G>
      ))}

      {/* The four copies of the same book, held up in front of each face. */}
      {READERS.map((r) => (
        <G key={`book-${r.x}`}>
          <Path
            d={`M${r.x} ${BOOK.y + 1} L${r.x - BOOK.half} ${BOOK.y} V${BOOK.y + BOOK.h} L${r.x} ${BOOK.y + BOOK.h + 1} L${r.x + BOOK.half} ${BOOK.y + BOOK.h} V${BOOK.y} Z`}
            fill={`url(#${id("cover")})`}
            stroke={keyline}
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
          <Path
            d={`M${r.x} ${BOOK.y + 1} V${BOOK.y + BOOK.h + 1}`}
            stroke={keyline}
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          {/* The same gold title band on every copy. */}
          <Path
            d={`M${r.x - BOOK.half + 1.2} ${BOOK.y + 4.4} L${r.x - 0.8} ${BOOK.y + 5} M${r.x + 0.8} ${BOOK.y + 5} L${r.x + BOOK.half - 1.2} ${BOOK.y + 4.4}`}
            stroke={gold}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {detailed && (
            <Path
              d={`M${r.x - BOOK.half + 2} ${BOOK.y + 9} L${r.x - 1.4} ${BOOK.y + 9.5} M${r.x + 1.4} ${BOOK.y + 9.5} L${r.x + BOOK.half - 2} ${BOOK.y + 9}`}
              stroke={gold}
              strokeOpacity="0.7"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
          )}
          {/* Hands either side of the covers. */}
          {[-1, 1].map((side) => (
            <Ellipse
              key={side}
              cx={r.x + side * (BOOK.half + 0.6)}
              cy={BOOK.y + 8}
              rx="1.4"
              ry="1.9"
              fill={skin}
              stroke={keyline}
              strokeWidth="0.5"
            />
          ))}
        </G>
      ))}
      {/* The conversation: a small bubble over each reader in turn, its tail
          pointing at whoever is talking. Each exists only while its reader
          speaks. */}
      {detailed &&
        READERS.map((r, i) => (
          <G key={`say-${r.x}`} className={`nwb-say-${i + 1}`}>
            <Path
              d={`M${r.x - 7} 34.5 H${r.x + 7} A2.6 2.6 0 0 1 ${r.x + 9.6} 37.1 V41.4 A2.6 2.6 0 0 1 ${r.x + 7} 44 H${r.x + 1} L${r.x - 1.6} 47.4 L${r.x - 1.4} 44 H${r.x - 7} A2.6 2.6 0 0 1 ${r.x - 9.6} 41.4 V37.1 A2.6 2.6 0 0 1 ${r.x - 7} 34.5 Z`}
              fill={muted ? GREY.pale : "#FFF8EC"}
              stroke={keyline}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            <Path
              d={SAYINGS[i].d(r.x)}
              fill={
                SAYINGS[i].fill ? (muted ? GREY.soft : SAYINGS[i].fill) : "none"
              }
              stroke={SAYINGS[i].fill ? "none" : keyline}
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        ))}
    </>
  );
};
