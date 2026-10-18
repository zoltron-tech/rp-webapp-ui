import {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
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
 * Cupid's arrow through two hearts.
 *
 * The badge is for weaving characters together — fifteen relationships across
 * three tones — and the plainest picture of two characters bound to each other
 * is one arrow through both hearts. The second heart is plum rather than red:
 * not every bond on a story's mesh is a romance. The arrow flies in, sticks
 * and quivers, both hearts thump on the hit, and sparks burst off it. The
 * shallow diagonal of the arrow is a silhouette nothing else on the shelf has.
 * Ruby and plum, a gold arrow with red fletching.
 */

/** A heart about its own centre, about 40 wide and 36 tall. */
const HEART =
  "M0 16 C-14 6 -20 -2 -20 -9 C-20 -16 -14.5 -20 -9.5 -20 C-5 -20 -1.6 -17 0 -13.5 C1.6 -17 5 -20 9.5 -20 C14.5 -20 20 -16 20 -9 C20 -2 14 6 0 16 Z";
/** A glint on the left lobe. */
const GLINT = "M-14 -11 C-14 -15 -11 -17 -8 -16.5";

/**
 * The two hearts: plum behind on the lower left, ruby in front on the upper
 * right. Their centres sit on the arrow's line, so it passes through both.
 */
const BACK = { rotate: -14, scale: 1, x: 44, y: 68 };
const FRONT = { rotate: 12, scale: 1.08, x: 74, y: 52 };

/**
 * The arrow, drawn along +x from its nock at the origin and laid on the
 * diagonal through both hearts' centres. It is drawn *behind* the hearts, so
 * only the fletching and the head show — which is what reads as through.
 */
const ARROW = { angle: -28, x: 11, y: 82 };
const SHAFT = "M8 0 H99";
const HEAD = "M108 0 L97 -5.4 L99.4 0 L97 5.4 Z";
const FLETCHING = [
  "M1 -0.8 L-2.6 -6.8 L9.6 -6.8 L14 -0.8 Z",
  "M1 0.8 L-2.6 6.8 L9.6 6.8 L14 0.8 Z",
];

/** Sparks thrown off the hit, round the front heart, as [angle, distance]. */
const BURST = [
  [-60, 25],
  [-10, 27],
  [40, 25],
  [100, 24],
  [160, 26],
  [210, 25],
];

/** Two small stars that just twinkle. */
const STARS = [
  { s: 3.4, x: 22, y: 30 },
  { s: 2.8, x: 100, y: 92 },
];

const starPath = (x: number, y: number, s: number): string =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;

export const MatchmakerBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const ruby = muted ? [GREY.light, GREY.soft] : ["#FF6A88", "#B5173F"];
  const plum = muted ? [GREY.soft, GREY.deep] : ["#A65CDA", "#4E1F7A"];
  const gold = muted ? [GREY.pale, GREY.ink] : ["#FFE9A6", "#B98326"];
  const feather = muted ? GREY.pale : "#E8454F";
  const spark = muted ? GREY.pale : "#FFE3EA";

  const heart = (h: typeof BACK, fill: string, edge: string, cls: string) => (
    // Placement on the outer group, the thump on the inner one.
    <G
      transform={`translate(${h.x} ${h.y}) rotate(${h.rotate}) scale(${h.scale})`}
    >
      <G className={cls}>
        <Path d={HEART} fill={fill} stroke={edge} strokeWidth="1.2" />
        {detailed && (
          <Path
            d={GLINT}
            fill="none"
            stroke="#FFF"
            strokeOpacity={muted ? 0.3 : 0.7}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </G>
    </G>
  );

  return (
    <>
      <Defs>
        <LinearGradient id={id("ruby")} x1="0%" y1="0%" x2="60%" y2="100%">
          <Stop offset="0%" stopColor={ruby[0]} />
          <Stop offset="100%" stopColor={ruby[1]} />
        </LinearGradient>
        <LinearGradient id={id("plum")} x1="0%" y1="0%" x2="60%" y2="100%">
          <Stop offset="0%" stopColor={plum[0]} />
          <Stop offset="100%" stopColor={plum[1]} />
        </LinearGradient>
        <LinearGradient id={id("gold")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={gold[0]} />
          <Stop offset="100%" stopColor={gold[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#F0607E"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#F0607E"}
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

      {/* The arrow, behind both hearts. The outer group lays it on the
          diagonal; the inner one flies it in along its own length. */}
      <G transform={`translate(${ARROW.x} ${ARROW.y}) rotate(${ARROW.angle})`}>
        <G className="nwb-arrow">
          {/* Solid, not the gold gradient: a bounding-box gradient on a
              perfectly straight line has zero height to spread over, and the
              stroke renders as nothing. */}
          <Path
            d={SHAFT}
            stroke={muted ? GREY.light : "#E2B04E"}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {detailed && (
            <Path
              d={SHAFT}
              stroke="#FFF6D6"
              strokeOpacity={muted ? 0.3 : 0.7}
              strokeWidth="0.8"
              transform="translate(0 -0.6)"
            />
          )}
          {FLETCHING.map((d) => (
            <Path
              key={d}
              d={d}
              fill={feather}
              stroke={muted ? GREY.deep : "#8E1322"}
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          ))}
          {detailed && (
            <Path
              d="M3 0 H13"
              stroke={muted ? GREY.deep : "#8E1322"}
              strokeWidth="0.8"
            />
          )}
          <Path
            d={HEAD}
            fill={`url(#${id("gold")})`}
            stroke={muted ? GREY.deep : "#7A5418"}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </G>
      </G>

      {heart(
        BACK,
        `url(#${id("plum")})`,
        muted ? GREY.deep : "#2E0F4A",
        "nwb-heart-back",
      )}
      {heart(
        FRONT,
        `url(#${id("ruby")})`,
        muted ? GREY.deep : "#7A0E2A",
        "nwb-heart-front",
      )}

      {/* Sparks off the hit. Hidden when still — a burst frozen mid-air is a
          ring of litter. The hiding is the frame's job (web stylesheet, native
          rest pose), not an opacity here: on a phone the animated wrapper
          would multiply into a 0 it can never lift. */}
      {detailed && (
        <G className="nwb-burst">
          {BURST.map(([deg, r]) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <Path
                key={deg}
                d={starPath(
                  FRONT.x + Math.cos(rad) * r,
                  FRONT.y + Math.sin(rad) * r,
                  deg % 20 === 0 ? 3.6 : 2.8,
                )}
                fill={spark}
              />
            );
          })}
        </G>
      )}

      {detailed &&
        STARS.map((st, i) => (
          <Path
            key={st.x}
            className={`nwb-star-${i + 1}`}
            d={starPath(st.x, st.y, st.s)}
            fill={spark}
          />
        ))}
    </>
  );
};
