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
 * A silver hand mirror whose reflection will not hold still.
 *
 * The badge is for one muse played across three verses, so the mirror shows
 * one character three ways: a long-haired human, a wolf, a horned fae. Each
 * form holds, then a shimmer crosses the glass and the next one is looking
 * back. The glass itself is opal, its colours turning slowly behind the
 * reflection. Tilted, so the handle reaches into the corner and the crest
 * keeps a square footprint. Polished silver, opal glass, an amethyst set in
 * the handle.
 */

/** The mirror, drawn upright and then tilted as a whole. */
const TILT = "rotate(-18 60 62) translate(60 62) scale(0.9) translate(-60 -62)";
const GLASS = { cx: 60, cy: 47, rx: 24, ry: 30 };
const RIM = { rx: 29, ry: 35 };
const NECK = "M53 80 C55 84 55 87 54 90 H66 C65 87 65 84 67 80 Z";
const HANDLE = "M54.5 90 C55 98 56 106 56.5 112 H63.5 C64 106 65 98 65.5 90 Z";
const KNOB = { cx: 60, cy: 114, r: 5 };
const GEM = { cx: 60, cy: 99, rx: 2.6, ry: 3.6 };

/** Pearls round the rim, as angles. */
const PEARLS = Array.from({ length: 18 }, (_, i) => (360 / 18) * i);

/**
 * The three forms, in the glass's coordinates. All three stand on the same
 * shoulder line, so the change reads as one figure turning into another.
 * Solid fills: at partial opacity the overlapping parts showed as seams. A
 * lighter shade picks out what makes each one legible — her face, his muzzle.
 */
const HUMAN_HAIR =
  "M46.5 46 C46 33 52 27.5 60 27.5 C68 27.5 74 33 73.5 46 L76 63 C71.5 65.5 67 64.5 64.5 61.5 H55.5 C53 64.5 48.5 65.5 44 63 Z";
const HUMAN_NECK = "M56 56 H64 V67 H56 Z";
const HUMAN_SHOULDERS = "M39 77 C41 69.5 49 65 60 65 C71 65 79 69.5 81 77 Z";
/** Her face, a shade lighter, framed by the hair. */
const HUMAN_FACE = { cx: 60, cy: 44, rx: 7.6, ry: 9.8 };

const WOLF_HEAD =
  "M45.5 25 L52.5 39.5 C55.5 38.4 64.5 38.4 67.5 39.5 L74.5 25 L76.5 41.5 L83 49 L75 52.5 L69 65 C67 69.5 63 72 60 72 C57 72 53 69.5 51 65 L45 52.5 L37 49 L43.5 41.5 Z";
/** The muzzle, a shade lighter, and the nose at its tip. */
const WOLF_MUZZLE =
  "M55 55.5 C55.5 52.5 64.5 52.5 65 55.5 L62.4 66.5 C61.6 68.6 58.4 68.6 57.6 66.5 Z";
const WOLF_NOSE = "M57.6 64.6 H62.4 L60 67.6 Z";
const WOLF_RUFF =
  "M40 66 C47 70.5 54 73.5 60 73.5 C66 73.5 73 70.5 80 66 L86 77 H34 Z";
const FAE_HEAD =
  "M60 36 C52 36 47 42 47 50 C47 58 53 64 60 64 C67 64 73 58 73 50 C73 42 68 36 60 36 Z";
const FAE_HORNS = [
  "M50 41 C43 37 39 28 43 21 C44.5 28 49 33 55 37 Z",
  "M70 41 C77 37 81 28 77 21 C75.5 28 71 33 65 37 Z",
];
const FAE_COLLAR =
  "M42 77 C43 70 48 65.5 54 65 L56 61 L60 65 L64 61 L66 65 C72 65.5 77 70 78 77 Z";

/** Eyes, per form, that catch the light. */
/** Slanted, as wolves' are. */
const WOLF_EYES = [
  "M51.5 49.5 L56.5 51 L52.5 52 Z",
  "M68.5 49.5 L63.5 51 L67.5 52 Z",
];
const FAE_EYES = [
  [55, 50],
  [65, 50],
];

/** Two stars beside the mirror. */
const STARS = [
  { s: 3.6, x: 96, y: 28 },
  { s: 2.8, x: 22, y: 88 },
];

const starPath = (x: number, y: number, s: number): string =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;

export const ShapeshifterBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const silver = muted ? [GREY.pale, GREY.soft] : ["#F4F6FC", "#8A8FA8"];
  const edge = muted ? GREY.deep : "#44495E";
  const opal = muted
    ? [GREY.light, GREY.pale, GREY.soft, GREY.light]
    : ["#7FE8F0", "#B79BFF", "#FF9ED8", "#FFE4A0"];
  const figure = muted ? GREY.deep : "#2A1856";
  const shade = muted ? GREY.mid : "#4A3388";
  const eye = muted ? GREY.pale : "#FFE27A";
  const gem = muted ? [GREY.light, GREY.deep] : ["#D7A6FF", "#5A1E9A"];
  const pearl = muted ? GREY.pale : "#FFFFFF";

  return (
    <>
      <Defs>
        <ClipPath id={id("glass")}>
          <Ellipse cx={GLASS.cx} cy={GLASS.cy} rx={GLASS.rx} ry={GLASS.ry} />
        </ClipPath>
        <LinearGradient id={id("silver")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={silver[0]} />
          <Stop offset="55%" stopColor={silver[1]} />
          <Stop offset="100%" stopColor={silver[0]} />
        </LinearGradient>
        <LinearGradient id={id("opal")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={opal[0]} />
          <Stop offset="33%" stopColor={opal[1]} />
          <Stop offset="66%" stopColor={opal[2]} />
          <Stop offset="100%" stopColor={opal[3]} />
        </LinearGradient>
        <LinearGradient id={id("shine")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFF" stopOpacity="0" />
          <Stop offset="50%" stopColor="#FFF" stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id={id("gem")} cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={gem[0]} />
          <Stop offset="100%" stopColor={gem[1]} />
        </RadialGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#36CFD9"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#36CFD9"}
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

      <G transform={TILT}>
        {/* Handle first, so the rim sits over its neck. */}
        <Path
          d={HANDLE}
          fill={`url(#${id("silver")})`}
          stroke={edge}
          strokeWidth="1"
        />
        <Circle
          cx={KNOB.cx}
          cy={KNOB.cy}
          r={KNOB.r}
          fill={`url(#${id("silver")})`}
          stroke={edge}
          strokeWidth="1"
        />
        <Ellipse
          cx={GEM.cx}
          cy={GEM.cy}
          rx={GEM.rx}
          ry={GEM.ry}
          fill={`url(#${id("gem")})`}
          stroke={edge}
          strokeWidth="0.7"
        />
        <Path
          d={NECK}
          fill={`url(#${id("silver")})`}
          stroke={edge}
          strokeWidth="1"
        />

        <Ellipse
          cx={GLASS.cx}
          cy={GLASS.cy}
          rx={RIM.rx}
          ry={RIM.ry}
          fill={`url(#${id("silver")})`}
          stroke={edge}
          strokeWidth="1.2"
        />
        {detailed &&
          PEARLS.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <Circle
                key={deg}
                cx={GLASS.cx + Math.sin(rad) * (RIM.rx - 2.5)}
                cy={GLASS.cy - Math.cos(rad) * (RIM.ry - 2.5)}
                r="1.1"
                fill={pearl}
                fillOpacity="0.9"
              />
            );
          })}

        {/* The glass: opal turning slowly, the reflection over it, and a
            shimmer that crosses at every change of form. */}
        <G clipPath={`url(#${id("glass")})`}>
          <G className="nwb-opal">
            <Rect
              x={GLASS.cx - 40}
              y={GLASS.cy - 40}
              width="80"
              height="80"
              fill={`url(#${id("opal")})`}
            />
          </G>

          <G className="nwb-form-1">
            <Path d={HUMAN_HAIR} fill={figure} />
            <Path d={HUMAN_NECK} fill={shade} />
            <Path d={HUMAN_SHOULDERS} fill={figure} />
            <Ellipse
              cx={HUMAN_FACE.cx}
              cy={HUMAN_FACE.cy}
              rx={HUMAN_FACE.rx}
              ry={HUMAN_FACE.ry}
              fill={shade}
            />
          </G>
          <G className="nwb-form-2">
            <Path d={WOLF_RUFF} fill={figure} />
            <Path d={WOLF_HEAD} fill={figure} />
            <Path d={WOLF_MUZZLE} fill={shade} />
            <Path d={WOLF_NOSE} fill={figure} />
            {detailed &&
              WOLF_EYES.map((d) => <Path key={d} d={d} fill={eye} />)}
          </G>
          <G className="nwb-form-3">
            {FAE_HORNS.map((d) => (
              <Path key={d} d={d} fill={figure} />
            ))}
            <Path d={FAE_HEAD} fill={figure} />
            <Path d={FAE_COLLAR} fill={figure} />
            {detailed &&
              FAE_EYES.map(([x, y]) => (
                <Circle key={x} cx={x} cy={y} r="1.2" fill={eye} />
              ))}
          </G>

          {/* Rests off the glass, so a still crest has no stray streak. */}
          {detailed && (
            <G className="nwb-shimmer">
              <Path
                d="M-14 10 L-2 10 L-18 90 L-30 90 Z"
                fill={`url(#${id("shine")})`}
              />
            </G>
          )}
        </G>

        {detailed && (
          <Ellipse
            cx={GLASS.cx}
            cy={GLASS.cy}
            rx={GLASS.rx}
            ry={GLASS.ry}
            fill="none"
            stroke={edge}
            strokeOpacity="0.6"
            strokeWidth="1"
          />
        )}
      </G>

      {detailed &&
        STARS.map((st, i) => (
          <Path
            key={st.x}
            className={`nwb-star-${i + 1}`}
            d={starPath(st.x, st.y, st.s)}
            fill={muted ? GREY.pale : "#E8FBFF"}
          />
        ))}
    </>
  );
};
