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
 * One inkpot with two quills standing in it, dipping in turn.
 *
 * Prolific Writer is a quill too, but that badge is a novelist alone with their
 * own book — the feather is the subject and it is writing. Here the *pot* is
 * the subject and there are two of them sharing it, which is the whole
 * difference between writing and turning up in somebody else's thread. Plum,
 * where that one is ink blue.
 */

/** The pot: a heavy bulb with a collar, so the quills have somewhere to sit. */
const POT =
  "M34 76 C34 63 43 56 60 56 C77 56 86 63 86 76 L86 92 C86 99 80 104 72 104 H48 C40 104 34 99 34 92 Z";
const COLLAR = { h: 9, rx: 4, w: 40, x: 40, y: 50 };

/** The ink itself, seen through the mouth of the collar. */
const INK = { cx: 60, cy: 54, rx: 17, ry: 5.2 };

/**
 * A quill, nib at the origin and feather up the +x side, so a whole pen can be
 * placed — and dipped — by its nib alone.
 */
const QUILL_SHAFT = "M0 0 L18 -40";
const QUILL_PLUME =
  "M19.5 -43 C28 -33 25.5 -19 15.5 -8.5 C11.5 -4 6.5 -3 4 -5.5 C4.5 -18 9 -33 19.5 -43 Z";
const QUILL_BARBS = [
  "M9 -15 L15 -12",
  "M11.5 -23 L18 -21",
  "M14.5 -31 L20 -30",
];

/**
 * The two of them, leaning apart out of the same pot.
 *
 * Mirrored rather than drawn twice: they are the same pen, and two hand-placed
 * feathers drift apart the moment either is adjusted.
 */
const QUILLS = [
  { className: "nwb-quill-l", nib: 54, tilt: -34 },
  { className: "nwb-quill-r", flip: true, nib: 66, tilt: 34 },
];

/**
 * How wide the two lean apart, and how big they are drawn.
 *
 * Splayed hard on purpose: at a narrow angle the two plumes overlap into one
 * blade and the badge reads as a single pen — which is the one thing it must
 * not say.
 */
const QUILL_SCALE = 1.05;

/**
 * How deep in the pot the nibs sit.
 *
 * Low enough that a splayed feather clears the top of the view box at the peak
 * of its dip: the frame lets its SVG overflow, so a plume that runs off the top
 * is drawn over whatever is above the badge rather than being cut off.
 */
const NIB_Y = 66;

/** Where the drop falls from, back into the pot. */
const DROP = { cx: 84, cy: 44 };

export const CoAuthorBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const glass = muted ? [GREY.soft, GREY.deep] : ["#9C63E0", "#3C1A72"];
  const collar = muted ? GREY.mid : "#2A1152";
  const ink = muted ? GREY.ink : "#1B0A38";
  const inkLit = muted ? GREY.light : "#C79BF7";
  const feather = muted ? [GREY.pale, GREY.light] : ["#FFF8EC", "#D6BDF2"];
  const shaft = muted ? GREY.edge : "#8B6BC4";
  const rim = muted ? GREY.edge : "#C79BF7";

  /** One pen, reused for both sides. */
  const quill = (
    <>
      <Path
        d={QUILL_PLUME}
        fill={`url(#${id("plume")})`}
        stroke={shaft}
        strokeOpacity={muted ? 0.4 : 0.55}
        strokeWidth="1"
      />
      {detailed && (
        <G
          stroke={shaft}
          strokeOpacity={muted ? 0.3 : 0.45}
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
        >
          {QUILL_BARBS.map((barb) => (
            <Path key={barb} d={barb} />
          ))}
        </G>
      )}
      <Path
        d={QUILL_SHAFT}
        stroke={shaft}
        strokeOpacity={muted ? 0.6 : 1}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );

  return (
    <>
      <Defs>
        <LinearGradient id={id("glass")} x1="16%" y1="0%" x2="84%" y2="100%">
          <Stop offset="0%" stopColor={glass[0]} />
          <Stop offset="100%" stopColor={glass[1]} />
        </LinearGradient>
        <LinearGradient id={id("plume")} x1="90%" y1="0%" x2="10%" y2="100%">
          <Stop offset="0%" stopColor={feather[0]} />
          <Stop offset="100%" stopColor={feather[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#8B4FD8"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#8B4FD8"}
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="60"
        cy="64"
        r="52"
        fill={`url(#${id("aura")})`}
      />

      {/* The pens, behind the pot so their nibs are in the ink rather than
          drawn over the glass. */}
      {QUILLS.map((pen) => (
        <G key={pen.className} className={pen.className}>
          <G
            transform={`translate(${pen.nib} ${NIB_Y}) rotate(${pen.tilt}) scale(${pen.flip ? -QUILL_SCALE : QUILL_SCALE} ${QUILL_SCALE})`}
          >
            {quill}
          </G>
        </G>
      ))}

      {/* A drop coming off the raised pen, back into the pot. */}
      {detailed && (
        <G className="nwb-drop">
          <Circle cx={DROP.cx} cy={DROP.cy} r="2.6" fill={inkLit} />
        </G>
      )}

      <Path
        d={POT}
        fill={`url(#${id("glass")})`}
        stroke={collar}
        strokeOpacity={muted ? 0.4 : 0.6}
        strokeWidth="1.4"
      />

      {/* The ink filling the bottom of the pot, seen through the glass. */}
      <Path
        d="M35.6 80 C46 84 74 84 84.4 80 L84.4 92 C84.4 98.5 79 102.6 72 102.6 H48 C41 102.6 35.6 98.5 35.6 92 Z"
        fill={ink}
        fillOpacity={muted ? 0.5 : 0.85}
      />

      <Rect
        x={COLLAR.x}
        y={COLLAR.y}
        width={COLLAR.w}
        height={COLLAR.h}
        rx={COLLAR.rx}
        fill={collar}
      />

      {/* The surface, which stirs each time a nib goes in. */}
      <G className="nwb-ink">
        <Ellipse
          cx={INK.cx}
          cy={INK.cy}
          rx={INK.rx}
          ry={INK.ry}
          fill={inkLit}
          fillOpacity={muted ? 0.4 : 0.75}
        />
      </G>

      {detailed && (
        <Path
          d="M42 66 C40 74 40.5 84 44 92"
          fill="none"
          stroke={rim}
          strokeOpacity={muted ? 0.25 : 0.45}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      )}
    </>
  );
};
