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
 * An old sea chart, torn at one corner, with a brass compass laid on it.
 *
 * The badge asks for a codex deep enough to need a map and a map with places
 * pinned on it, so the art is the map, and the pins drop onto it one at a time
 * along a route. Aged rather than fresh: a ragged edge with the top-right
 * corner torn away, a scorched vignette, fold creases and a tea ring — a world
 * that has been worked on for a long time, which is what the badge is for. The
 * compass breaking out of the bottom-right corner gives the shelf its only
 * silhouette wider than it is tall. Faded blue sea on sepia parchment.
 */

/**
 * The sheet, ragged all round. The run of short jags across the top right is
 * the torn corner, and it cuts through the inked border on purpose.
 */
const SHEET =
  "M15 29 L24 27.5 L30 29 L38 27 L46 28.5 L54 26.8 L62 28.2 L70 27 L78 28.6 L86 27.4 L90 29 L93 27.8 L95 31 L98 32 L101 35.5 L104 37 L103.5 44 L105 52 L103.8 60 L105.2 68 L104 76 L105 84 L104 92 L96 93.4 L88 92.2 L80 93.6 L72 92.4 L64 93.8 L56 92.5 L48 93.6 L40 92.2 L32 93.5 L24 92.4 L16 93 L15.5 85 L14.2 77 L15.6 69 L14.4 61 L15.8 53 L14.5 45 L15.6 37 Z";

/** The inked border, and the sea inside it. */
const BORDER = { h: 56, w: 80, x: 20, y: 32 };

/** Where the sheet was folded in four, one crease each way. */
const CREASES = ["M60 27 V94", "M14 61 H105"];

/** A ring left by a cup set down on the chart. */
const STAIN = { cx: 34, cy: 39, r: 5.5 };

/** The landmasses, painted over the sea. */
const MAINLAND =
  "M24 50 C32 42 44 40 52 46 C58 50 62 46 68 50 C74 55 70 64 62 66 C56 68 54 76 46 78 C38 80 30 74 26 70 C22 64 22 56 24 50 Z";
const ISLAND =
  "M74 46 C77 41 86 40 90 44 C93 48 89 53 83 53 C78 54 72 51 74 46 Z";

/** Two peaks on the mainland, each with its snowcap. */
const PEAKS = [
  { cap: "M33 51 L35 48 L37 51 L35 50.2 Z", d: "M30 56 L35 48 L40 56 Z" },
  { cap: "M40.4 50 L43 46 L45.6 50 L43 49 Z", d: "M37 56 L43 46 L49 56 Z" },
];

/** The route the pins mark, dashed so the dashes can march along it. */
const ROUTE = "M30 66 C38 72 50 68 56 60 C62 52 70 46 82 47";

/** Where each pin's point lands on the route, in the order they drop. */
const PINS = [
  { x: 30, y: 66 },
  { x: 56, y: 60 },
  { x: 82, y: 47 },
];

/** Two swells on open water. */
const TIDES = ["M60 76 q2 -2 4 0 t4 0", "M84 61 q2 -2 4 0 t4 0"];

/** The compass, centred over the chart's bottom-right corner. */
const COMPASS = { cx: 88, cy: 84, face: 10, rim: 13 };

/** A teardrop pin whose point sits on (x, y). */
const pinPath = (x: number, y: number): string =>
  `M${x} ${y} C${x - 1} ${y - 3} ${x - 4} ${y - 5} ${x - 4} ${y - 8} A4 4 0 1 1 ${x + 4} ${y - 8} C${x + 4} ${y - 5} ${x + 1} ${y - 3} ${x} ${y} Z`;

export const WorldbuilderBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const parchment = muted ? [GREY.pale, GREY.light] : ["#F3E2B8", "#D9BC86"];
  const scorch = muted ? GREY.deep : "#6E4319";
  const ink = muted ? GREY.soft : "#5A3B1E";
  const sea = muted ? [GREY.light, GREY.soft] : ["#B4D0D2", "#5E8EA3"];
  const land = muted ? [GREY.pale, GREY.light] : ["#EEDDAE", "#CBAE76"];
  const coast = muted ? GREY.ink : "#6B4A2B";
  const peak = muted ? GREY.soft : "#7A5E3E";
  const snow = muted ? GREY.pale : "#FBF3DE";
  const route = muted ? GREY.ink : "#9E3328";
  const pin = muted ? GREY.soft : "#D9483B";
  const brass = muted ? [GREY.pale, GREY.soft] : ["#F6D98A", "#A8742A"];
  const face = muted ? GREY.pale : "#FFF8E6";
  const north = muted ? GREY.soft : "#C7382E";
  const south = muted ? GREY.ink : "#22476B";
  const tide = muted ? GREY.pale : "#EEF4EC";

  return (
    <>
      <Defs>
        <ClipPath id={id("sheet")}>
          <Path d={SHEET} />
        </ClipPath>
        <LinearGradient id={id("sea")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={sea[0]} />
          <Stop offset="100%" stopColor={sea[1]} />
        </LinearGradient>
        <LinearGradient id={id("land")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={land[0]} />
          <Stop offset="100%" stopColor={land[1]} />
        </LinearGradient>
        <LinearGradient id={id("paper")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={parchment[0]} />
          <Stop offset="100%" stopColor={parchment[1]} />
        </LinearGradient>
        {/* The scorched edge: clear in the middle, browning towards the rim. */}
        <RadialGradient id={id("age")} cx="50%" cy="50%" r="62%">
          <Stop offset="58%" stopColor={scorch} stopOpacity="0" />
          <Stop offset="100%" stopColor={scorch} stopOpacity="0.7" />
        </RadialGradient>
        <LinearGradient id={id("brass")} x1="15%" y1="0%" x2="85%" y2="100%">
          <Stop offset="0%" stopColor={brass[0]} />
          <Stop offset="100%" stopColor={brass[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#4F8FB0"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#4F8FB0"}
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

      {/* The sheet, then everything drawn on it clipped to its torn edge. */}
      <Path d={SHEET} fill={`url(#${id("paper")})`} />
      <G clipPath={`url(#${id("sheet")})`}>
        <Rect
          x={BORDER.x}
          y={BORDER.y}
          width={BORDER.w}
          height={BORDER.h}
          fill={`url(#${id("sea")})`}
        />
        <Path
          d={MAINLAND}
          fill={`url(#${id("land")})`}
          stroke={coast}
          strokeWidth="1.1"
        />
        <Path
          d={ISLAND}
          fill={`url(#${id("land")})`}
          stroke={coast}
          strokeWidth="1.1"
        />

        {detailed && (
          <>
            <Rect
              x={BORDER.x}
              y={BORDER.y}
              width={BORDER.w}
              height={BORDER.h}
              fill="none"
              stroke={ink}
              strokeOpacity="0.7"
              strokeWidth="0.9"
            />

            {PEAKS.map((p) => (
              <G key={p.d}>
                <Path d={p.d} fill={peak} />
                <Path d={p.cap} fill={snow} />
              </G>
            ))}

            {TIDES.map((d, i) => (
              <G key={d} className={`nwb-tide-${i + 1}`}>
                <Path
                  d={d}
                  fill="none"
                  stroke={tide}
                  strokeOpacity="0.85"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </G>
            ))}

            <Path
              className="nwb-route"
              d={ROUTE}
              fill="none"
              stroke={route}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="3 3"
            />

            {/* Folds: a shadowed valley with a lit ridge beside it. */}
            {CREASES.map((d) => (
              <G key={d}>
                <Path
                  d={d}
                  stroke={scorch}
                  strokeOpacity="0.28"
                  strokeWidth="1"
                />
                <Path
                  d={d}
                  stroke="#FFF6DC"
                  strokeOpacity={muted ? 0.15 : 0.35}
                  strokeWidth="0.6"
                  transform="translate(0.8 0.8)"
                />
              </G>
            ))}

            <Circle
              cx={STAIN.cx}
              cy={STAIN.cy}
              r={STAIN.r}
              fill="none"
              stroke={scorch}
              strokeOpacity="0.3"
              strokeWidth="1.3"
            />
          </>
        )}

        {/* Age over everything on the sheet, so the sea browns at the edges
            along with the paper. */}
        <Rect
          x="10"
          y="22"
          width="100"
          height="76"
          fill={`url(#${id("age")})`}
        />
      </G>
      <Path
        d={SHEET}
        fill="none"
        stroke={scorch}
        strokeOpacity="0.85"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Pins drop in along the route, one after another. Each sits in a
          wrapper of its own so the drop can animate its transform. */}
      {detailed &&
        PINS.map((p, i) => (
          <G key={p.x} className={`nwb-pin-${i + 1}`}>
            <Path
              d={pinPath(p.x, p.y)}
              fill={pin}
              stroke={muted ? GREY.deep : "#7A1E17"}
              strokeWidth="0.8"
            />
            <Circle cx={p.x} cy={p.y - 8} r="1.6" fill={face} />
          </G>
        ))}

      {/* The compass, last so it lies on the corner of the chart. */}
      <Circle
        cx={COMPASS.cx}
        cy={COMPASS.cy}
        r={COMPASS.rim}
        fill={`url(#${id("brass")})`}
        stroke={muted ? GREY.deep : "#6B4515"}
        strokeWidth="1"
      />
      <Circle cx={COMPASS.cx} cy={COMPASS.cy} r={COMPASS.face} fill={face} />
      {detailed &&
        [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const inner = deg % 90 === 0 ? 7.4 : 8.4;
          return (
            <Path
              key={deg}
              d={`M${COMPASS.cx + Math.sin(rad) * inner} ${COMPASS.cy - Math.cos(rad) * inner} L${COMPASS.cx + Math.sin(rad) * 9.4} ${COMPASS.cy - Math.cos(rad) * 9.4}`}
              stroke={muted ? GREY.ink : "#8C6A3A"}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          );
        })}

      {/* The needle settling: a wrapper that only turns, about the compass's
          own centre. */}
      <G className="nwb-needle">
        <Path
          d={`M${COMPASS.cx} ${COMPASS.cy - 8} L${COMPASS.cx + 2.6} ${COMPASS.cy} L${COMPASS.cx - 2.6} ${COMPASS.cy} Z`}
          fill={north}
        />
        <Path
          d={`M${COMPASS.cx} ${COMPASS.cy + 8} L${COMPASS.cx + 2.6} ${COMPASS.cy} L${COMPASS.cx - 2.6} ${COMPASS.cy} Z`}
          fill={south}
        />
        <Circle cx={COMPASS.cx} cy={COMPASS.cy} r="1.3" fill={brass[1]} />
      </G>
    </>
  );
};
