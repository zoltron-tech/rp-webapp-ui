import {
  Circle,
  ClipPath,
  Defs,
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
 * An hourglass standing in front of a turning timeline dial.
 *
 * The badge is for a timeline of twenty events across three eras, so the dial
 * carries twenty ticks and three gems, one per era, and turns slowly behind the
 * glass. The sand runs out and the glass flips — the flipped glass is the same
 * picture as the full one, which is what lets the loop restart without a jump.
 * Enchanted rather than antique: the sand glows, a rune circle turns inside
 * the dial against it, and sparks rise off the glass.
 *
 * The only crest with a ring *behind* the emblem rather than around it: the
 * hourglass is taller than the dial and breaks the circle top and bottom.
 * Emerald dial, verdigris frame, lime-green glowing sand.
 */

/** The glass, symmetric about its centre so a half turn lands on itself. */
const GLASS =
  "M46 29 H74 C74 44 63 52 61.5 60 C63 68 74 76 74 91 H46 C46 76 57 68 58.5 60 C57 52 46 44 46 29 Z";
const TOP_BULB = "M46 29 H74 C74 44 63 52 61.5 60 H58.5 C57 52 46 44 46 29 Z";
const BOTTOM_BULB =
  "M58.5 60 H61.5 C63 68 74 76 74 91 H46 C46 76 57 68 58.5 60 Z";

/**
 * Sand, drawn half run: the top bed's surface at 44, the bottom pile's crest
 * at 74. The keyframes move both from full-top to full-bottom about here, and a
 * still crest shows the glass mid-run.
 *
 * Both shapes run well past their bulb on the far side (the top bed down
 * through the neck, the pile far below the base), so neither ever slides far
 * enough to show its back edge. The pile used to stop at 96: raised 16 to
 * fill the bulb, its foot lifted off the base and left a gap, the flipped glass
 * showed that gap at the top, and the loop's first frame snapped it full.
 */
const TOP_SAND = { h: 50, w: 32, x: 44, y: 44 };
const BOTTOM_PILE = "M44 130 V78 Q60 70 76 78 V130 Z";

/** The falling stream, from the neck to the pile. */
const STREAM = "M60 60 V90";

/** The frame: two plates and the posts between them. */
const PLATES = [22, 92];
const POSTS = [39, 77];

/** The dial behind the glass. */
const DIAL = { cx: 60, cy: 60, r: 41 };

/** How much larger than its drawn size the hourglass stands. */
const GLASS_SCALE = 1.17;
const TICKS = 20;
/**
 * One gem per era. Not evenly spaced: these are the three spots on the dial
 * clear of the posts and plates, so a still crest shows all three.
 */
const ERAS = [
  { angle: 90, colour: "#F0E36A" },
  { angle: 230, colour: "#5FF0D0" },
  { angle: 310, colour: "#C38BFF" },
];

/** The rune circle inside the dial: a dotted ring and eight glyphs on it. */
const SIGIL_R = 33;
const RUNES = [
  "M0 -3 V3 M0 -1.6 L2 -0.2 M0 0.6 L-2 2",
  "M-1.6 -3 V3 M-1.6 -3 L1.6 0 L-1.6 3",
  "M0 -3 V3 M-2 -1.4 L2 1.4",
  "M-1.8 3 L0 -3 L1.8 3 M-1 0.4 H1",
];

/** Sparks rising off the glass. */
const MOTES = [
  { r: 1.3, x: 50, y: 72 },
  { r: 1, x: 71, y: 48 },
  { r: 1.1, x: 66, y: 80 },
  { r: 0.9, x: 53, y: 42 },
];

/** Four-point stars in the corners, outside the dial. */
const STARS = [
  { s: 4.2, x: 21, y: 27 },
  { s: 3.2, x: 99, y: 31 },
  { s: 3.8, x: 100, y: 93 },
  { s: 2.8, x: 19, y: 92 },
];

const starPath = (x: number, y: number, s: number): string =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;

const onDial = (angle: number, r: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: DIAL.cx + Math.sin(rad) * r,
    y: DIAL.cy - Math.cos(rad) * r,
  };
};

export const TimekeeperBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const dial = muted ? [GREY.mid, GREY.deep] : ["#17614A", "#05241B"];
  const tick = muted ? GREY.light : "#A6F5C8";
  const rune = muted ? GREY.light : "#C9FFB0";
  const walnut = muted ? [GREY.soft, GREY.deep] : ["#3A8068", "#0F3227"];
  const brass = muted ? [GREY.pale, GREY.soft] : ["#F4E9AE", "#9C8A3E"];
  const sand = muted ? [GREY.pale, GREY.light] : ["#EDFFB8", "#5BD98A"];
  const glow = muted ? GREY.light : "#8CFF9E";
  const glass = muted ? GREY.pale : "#DFFFEF";

  return (
    <>
      <Defs>
        <ClipPath id={id("top")}>
          <Path d={TOP_BULB} />
        </ClipPath>
        <ClipPath id={id("bottom")}>
          <Path d={BOTTOM_BULB} />
        </ClipPath>
        <RadialGradient id={id("dial")} cx="50%" cy="45%" r="55%">
          <Stop offset="0%" stopColor={dial[0]} />
          <Stop offset="100%" stopColor={dial[1]} />
        </RadialGradient>
        <LinearGradient id={id("walnut")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={walnut[1]} />
          <Stop offset="45%" stopColor={walnut[0]} />
          <Stop offset="100%" stopColor={walnut[1]} />
        </LinearGradient>
        <LinearGradient id={id("brass")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={brass[0]} />
          <Stop offset="100%" stopColor={brass[1]} />
        </LinearGradient>
        {/* Across the sand, lit in the middle: symmetric, so the half turn
            lands on the same shading. Top-to-bottom shading reads upside down
            after the flip and snaps back on the loop's first frame. */}
        <LinearGradient id={id("sand")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={sand[1]} />
          <Stop offset="50%" stopColor={sand[0]} />
          <Stop offset="100%" stopColor={sand[1]} />
        </LinearGradient>
        <LinearGradient id={id("glass")} x1="0%" y1="0%" x2="100%" y2="0%">
          {/* Symmetric for the same reason as the sand. */}
          <Stop offset="0%" stopColor={glass} stopOpacity="0.3" />
          <Stop offset="50%" stopColor={glass} stopOpacity="0.08" />
          <Stop offset="100%" stopColor={glass} stopOpacity="0.3" />
        </LinearGradient>
        <RadialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="0%"
            stopColor={glow}
            stopOpacity={muted ? 0.15 : 0.55}
          />
          <Stop offset="100%" stopColor={glow} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#5FD66A"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#5FD66A"}
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

      {/* The dial: a disc, its twenty ticks and three era gems, turning as
          one about the crest's centre. */}
      <Circle
        cx={DIAL.cx}
        cy={DIAL.cy}
        r={DIAL.r}
        fill={`url(#${id("dial")})`}
        stroke={muted ? GREY.edge : "#7CE3A6"}
        strokeWidth="1.6"
      />
      <G className="nwb-dial">
        {detailed &&
          Array.from({ length: TICKS }, (_, i) => {
            const angle = (360 / TICKS) * i;
            const major = i % 5 === 0;
            const a = onDial(angle, DIAL.r - (major ? 7 : 5));
            const b = onDial(angle, DIAL.r - 2);
            return (
              <Path
                key={angle}
                d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
                stroke={tick}
                strokeOpacity={major ? 0.95 : 0.6}
                strokeWidth={major ? 1.6 : 1}
                strokeLinecap="round"
              />
            );
          })}
        {ERAS.map((era) => {
          const p = onDial(era.angle, DIAL.r - 1);
          return (
            <G key={era.angle}>
              <Circle
                cx={p.x}
                cy={p.y}
                r="4.6"
                fill={muted ? GREY.light : era.colour}
                stroke={muted ? GREY.deep : "#141B36"}
                strokeWidth="1.2"
              />
              {detailed && (
                <Circle
                  cx={p.x - 1.3}
                  cy={p.y - 1.3}
                  r="1.3"
                  fill="#FFF"
                  fillOpacity={muted ? 0.3 : 0.75}
                />
              )}
            </G>
          );
        })}
      </G>

      {/* The rune circle, turning against the dial. */}
      {detailed && (
        <G className="nwb-sigil">
          <Circle
            cx={DIAL.cx}
            cy={DIAL.cy}
            r={SIGIL_R}
            fill="none"
            stroke={rune}
            strokeOpacity={muted ? 0.3 : 0.45}
            strokeWidth="0.8"
            strokeDasharray="1 2.6"
          />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = 45 * i + 22.5;
            const p = onDial(angle, SIGIL_R);
            return (
              <Path
                key={angle}
                d={RUNES[i % RUNES.length]}
                transform={`translate(${p.x} ${p.y}) rotate(${angle})`}
                fill="none"
                stroke={rune}
                strokeOpacity={muted ? 0.4 : 0.85}
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </G>
      )}

      {/* The light the sand gives off, breathing behind the glass. */}
      <Circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="30"
        fill={`url(#${id("glow")})`}
      />

      {/* The hourglass, drawn on the 120 grid and enlarged about the
          centre so its plates stand proud of the dial top and bottom — the
          break in the circle is the silhouette. Everything inside turns
          together when it flips; the scale stays on this outer group, since
          an animated transform would throw an attribute away. */}
      <G
        transform={`translate(60 60) scale(${GLASS_SCALE}) translate(-60 -60)`}
      >
        <G className="nwb-flip">
          {/* Glass first, sand inside it, then the posts and plates over the
            glass's ends. */}
          <Path
            d={GLASS}
            fill={muted ? GREY.mid : "#0B3A2C"}
            fillOpacity="0.55"
          />

          <G clipPath={`url(#${id("top")})`}>
            <G className="nwb-sand-top">
              <Rect
                x={TOP_SAND.x}
                y={TOP_SAND.y}
                width={TOP_SAND.w}
                height={TOP_SAND.h}
                fill={`url(#${id("sand")})`}
              />
            </G>
          </G>
          <G clipPath={`url(#${id("bottom")})`}>
            <G className="nwb-sand-bottom">
              <Path d={BOTTOM_PILE} fill={`url(#${id("sand")})`} />
            </G>
          </G>
          {detailed && (
            <G className="nwb-stream">
              <Path
                d={STREAM}
                stroke={glow}
                strokeOpacity={muted ? 0.15 : 0.35}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <Path
                className="nwb-grains"
                d={STREAM}
                stroke={sand[0]}
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeDasharray="3 1.5"
              />
            </G>
          )}

          <Path
            d={GLASS}
            fill={`url(#${id("glass")})`}
            stroke={muted ? GREY.pale : "#CFE8F7"}
            strokeOpacity="0.7"
            strokeWidth="1"
          />
          {/* A glint on each bulb, a half turn apart, so the flipped glass is
            lit exactly like the upright one. */}
          {detailed &&
            ["M49.5 32 C50 42 55 49 57 54", "M70.5 88 C70 78 65 71 63 66"].map(
              (d) => (
                <Path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="#FFF"
                  strokeOpacity={muted ? 0.25 : 0.6}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              ),
            )}

          {POSTS.map((x) => (
            <Rect
              key={x}
              x={x}
              y={PLATES[0] + 4}
              width="4"
              height={PLATES[1] - PLATES[0] - 2}
              rx="2"
              fill={`url(#${id("walnut")})`}
            />
          ))}
          {PLATES.map((y) => (
            <G key={y}>
              <Rect
                x="35"
                y={y}
                width="50"
                height="6"
                rx="2.4"
                fill={`url(#${id("walnut")})`}
              />
              <Rect
                x="38"
                y={y === PLATES[0] ? y + 4.6 : y - 0.6}
                width="44"
                height="2"
                rx="1"
                fill={`url(#${id("brass")})`}
              />
            </G>
          ))}
        </G>
      </G>
      {/* Magic in the air: stars twinkling in the corners, sparks rising off
          the glass. Neither turns with the flip. */}
      {detailed &&
        STARS.map((st, i) => (
          <Path
            key={st.x}
            className={`nwb-star-${i + 1}`}
            d={starPath(st.x, st.y, st.s)}
            fill={muted ? GREY.pale : "#E9FFD0"}
          />
        ))}
      {detailed &&
        MOTES.map((m, i) => (
          <Circle
            key={m.x}
            className={`nwb-mote-${i + 1}`}
            cx={m.x}
            cy={m.y}
            r={m.r}
            fill={muted ? GREY.pale : "#D8FFB8"}
          />
        ))}
    </>
  );
};
