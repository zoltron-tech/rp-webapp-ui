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
 * A campfire at night, with the conversation rising off it.
 *
 * The badge is for starting a thread that five or more novelists join, so the
 * art is the fire you lit and the talk around it: five speech bubbles, one
 * per voice, rise out of the flames one after another and drift up into the
 * night, with embers going up between them. Framed as an arched window onto
 * the scene — the only arch on the shelf — with a crescent moon, stars and two
 * pines against the sky. Night blue, firelight, gold.
 */

/** The window: straight sides, a round top, a flat foot. */
const ARCH = "M18 102 V54 A42 42 0 0 1 102 54 V102 Z";
const KEYSTONE = "M56 9 H64 L62.5 15 H57.5 Z";

/** The ground: a low rise across the foot of the window. */
const GROUND = "M16 104 V86 C34 80 50 79 60 79 C70 79 86 80 104 86 V104 Z";

/** Two pines on the horizon. */
const PINES = [
  "M29 86 L35 70 L32.5 70 L37 60 L34.5 60 L38 50 L41.5 60 L39 60 L43.5 70 L41 70 L47 86 Z",
  "M76 85 L81 72 L79 72 L83 63 L81 63 L84 55 L87 63 L85 63 L89 72 L87 72 L92 85 Z",
];

/** The moon: a crescent cut from a disc. */
const MOON = "M36 26 A9 9 0 1 0 45.5 39 A7.5 7.5 0 1 1 36 26 Z";

/** Stars in the sky. */
const STARS = [
  { s: 2.4, x: 58, y: 22 },
  { s: 1.8, x: 76, y: 30 },
  { s: 2.2, x: 90, y: 46 },
  { s: 1.6, x: 26, y: 50 },
];

/** The fire. */
const FIRE = { x: 60, y: 86 };
/** Stones round it, as [dx, dy, rx]. */
const STONES = [
  [-15, 1, 3.6],
  [-9, 4, 3.4],
  [-2, 5, 3.6],
  [6, 4.6, 3.4],
  [12.5, 2, 3.4],
  [16, -1.4, 2.8],
];
/** Two logs crossed under it. */
const LOGS = [-18, 18];

/** Flames, outermost first, each a teardrop up from the fire's base. */
const flame = (w: number, h: number, lean: number): string =>
  `M${FIRE.x - w} ${FIRE.y} C${FIRE.x - w * 1.1} ${FIRE.y - h * 0.45} ${FIRE.x - w * 0.3 + lean} ${FIRE.y - h * 0.6} ${FIRE.x + lean} ${FIRE.y - h} C${FIRE.x + w * 0.4 + lean} ${FIRE.y - h * 0.62} ${FIRE.x + w * 1.1} ${FIRE.y - h * 0.4} ${FIRE.x + w} ${FIRE.y} Z`;
const FLAMES = [
  { d: flame(12, 32, 2), key: "outer" },
  { d: flame(8.6, 25, -1.5), key: "mid" },
  { d: flame(5, 16, 1), key: "core" },
];

/** Embers rising off the flames. */
const EMBERS = [
  [56, 64],
  [63, 60],
  [59, 58],
  [66, 66],
];

/**
 * The five voices: where each bubble floats, in the order they speak. They
 * rise into these from the fire's height.
 */
const REPLIES = [
  { c: 0, x: 34, y: 58 },
  { c: 1, x: 47, y: 44 },
  { c: 2, x: 63, y: 36 },
  { c: 3, x: 78, y: 45 },
  { c: 4, x: 88, y: 60 },
];
const bubble = (x: number, y: number): string =>
  `M${x - 5} ${y - 3.6} H${x + 5} A1.8 1.8 0 0 1 ${x + 6.8} ${y - 1.8} V${y + 1.4} A1.8 1.8 0 0 1 ${x + 5} ${y + 3.2} H${x - 1} L${x - 3.4} ${y + 5.6} L${x - 3} ${y + 3.2} H${x - 5} A1.8 1.8 0 0 1 ${x - 6.8} ${y + 1.4} V${y - 1.8} A1.8 1.8 0 0 1 ${x - 5} ${y - 3.6} Z`;

const starPath = (x: number, y: number, s: number): string =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;

export const CampfireBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const sky = muted ? [GREY.mid, GREY.deep] : ["#24406E", "#0B1428"];
  const ground = muted ? [GREY.soft, GREY.deep] : ["#2A2438", "#120E1A"];
  const pine = muted ? GREY.deep : "#0E1A2A";
  const frame = muted ? [GREY.pale, GREY.soft] : ["#FBE3A0", "#A8742A"];
  const moon = muted ? GREY.pale : "#FFF1C4";
  const stone = muted ? [GREY.light, GREY.soft] : ["#9A93A8", "#4E4860"];
  const wood = muted ? [GREY.soft, GREY.deep] : ["#9A5E32", "#4E2A12"];
  const fire = muted
    ? [GREY.light, GREY.pale, GREY.pale]
    : ["#FF5A2A", "#FF9A2E", "#FFE27A"];
  const ember = muted ? GREY.pale : "#FFC15A";
  const voices = muted
    ? [GREY.pale, GREY.pale, GREY.pale, GREY.pale, GREY.pale]
    : ["#FFFFFF", "#BFF5DC", "#FFD1E3", "#CDE6FF", "#FFF0B0"];
  const ink = muted ? GREY.soft : "#2A2438";

  return (
    <>
      <Defs>
        <ClipPath id={id("window")}>
          <Path d={ARCH} />
        </ClipPath>
        <LinearGradient id={id("sky")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={sky[1]} />
          <Stop offset="100%" stopColor={sky[0]} />
        </LinearGradient>
        <LinearGradient id={id("ground")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={ground[0]} />
          <Stop offset="100%" stopColor={ground[1]} />
        </LinearGradient>
        <LinearGradient id={id("frame")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={frame[0]} />
          <Stop offset="100%" stopColor={frame[1]} />
        </LinearGradient>
        <LinearGradient id={id("stone")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={stone[0]} />
          <Stop offset="100%" stopColor={stone[1]} />
        </LinearGradient>
        <LinearGradient id={id("wood")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={wood[0]} />
          <Stop offset="100%" stopColor={wood[1]} />
        </LinearGradient>
        {/* Firelight on the ground and the trees, brightest at the fire. */}
        <RadialGradient
          id={id("firelight")}
          cx={FIRE.x}
          cy={FIRE.y - 6}
          r="40"
          gradientUnits="userSpaceOnUse"
        >
          <Stop
            offset="0%"
            stopColor="#FFB24A"
            stopOpacity={muted ? 0.15 : 0.6}
          />
          <Stop offset="100%" stopColor="#FFB24A" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#F2552C"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#F2552C"}
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

      {/* Everything in the window, clipped to the arch. */}
      <G clipPath={`url(#${id("window")})`}>
        <Rect x="16" y="8" width="88" height="96" fill={`url(#${id("sky")})`} />
        <Path d={MOON} fill={moon} />
        {detailed &&
          STARS.map((st, i) => (
            <Path
              key={st.x}
              className={`nwb-star-${i + 1}`}
              d={starPath(st.x, st.y, st.s)}
              fill={moon}
            />
          ))}
        {PINES.map((d) => (
          <Path key={d} d={d} fill={pine} />
        ))}
        <Path d={GROUND} fill={`url(#${id("ground")})`} />

        {/* The light the fire throws, flickering with it. */}
        <G className="nwb-firelight">
          <Ellipse
            cx={FIRE.x}
            cy={FIRE.y - 6}
            rx="40"
            ry="34"
            fill={`url(#${id("firelight")})`}
          />
        </G>

        {/* Logs, crossed under the fire. */}
        {LOGS.map((deg) => (
          <G key={deg} transform={`rotate(${deg} ${FIRE.x} ${FIRE.y + 2})`}>
            <Rect
              x={FIRE.x - 13}
              y={FIRE.y - 0.6}
              width="26"
              height="5.2"
              rx="2.6"
              fill={`url(#${id("wood")})`}
              stroke={muted ? GREY.deep : "#2E1608"}
              strokeWidth="0.6"
            />
            {detailed && (
              <Ellipse
                cx={FIRE.x + (deg < 0 ? -12.4 : 12.4)}
                cy={FIRE.y + 2}
                rx="1.5"
                ry="2.4"
                fill={muted ? GREY.light : "#E0A86E"}
                stroke={muted ? GREY.deep : "#2E1608"}
                strokeWidth="0.5"
              />
            )}
          </G>
        ))}

        {/* The flames, each flickering about the fire's base on its own
            clock. */}
        {FLAMES.map((f, i) => (
          <G key={f.key} className={`nwb-blaze-${i + 1}`}>
            <Path d={f.d} fill={fire[i]} />
          </G>
        ))}

        {/* Stones in front of the logs' feet. */}
        {STONES.map(([dx, dy, rx]) => (
          <Ellipse
            key={dx}
            cx={FIRE.x + dx}
            cy={FIRE.y + 4 + dy}
            rx={rx}
            ry={rx * 0.7}
            fill={`url(#${id("stone")})`}
            stroke={muted ? GREY.deep : "#2A2438"}
            strokeWidth="0.5"
          />
        ))}

        {/* Embers going up. Hidden when still. */}
        {detailed &&
          EMBERS.map(([x, y], i) => (
            <Circle
              key={x}
              className={`nwb-ember-${i + 1}`}
              cx={x}
              cy={y}
              r={i % 2 ? 0.9 : 1.2}
              fill={ember}
            />
          ))}

        {/* The five voices, rising out of the fire into their places. Still,
            they float where they are. */}
        {detailed &&
          REPLIES.map((r, i) => (
            <G key={r.x} className={`nwb-reply-${i + 1}`}>
              <Path
                d={bubble(r.x, r.y)}
                fill={voices[r.c]}
                stroke={ink}
                strokeWidth="0.6"
                strokeLinejoin="round"
              />
              {detailed && (
                <Path
                  d={`M${r.x - 3.4} ${r.y - 1} H${r.x + 3.6} M${r.x - 3.4} ${r.y + 1.2} H${r.x + 1.4}`}
                  stroke={ink}
                  strokeOpacity="0.6"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                />
              )}
            </G>
          ))}
      </G>

      {/* The frame, over the scene's edge, with its keystone. */}
      <Path
        d={ARCH}
        fill="none"
        stroke={`url(#${id("frame")})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {detailed && (
        <Path
          d={ARCH}
          fill="none"
          stroke="#FFF"
          strokeOpacity={muted ? 0.15 : 0.35}
          strokeWidth="0.7"
          transform="translate(60 56) scale(0.955) translate(-60 -56)"
        />
      )}
      <Path
        d={KEYSTONE}
        fill={`url(#${id("frame")})`}
        stroke={muted ? GREY.deep : "#6B4515"}
        strokeWidth="0.7"
      />
    </>
  );
};
