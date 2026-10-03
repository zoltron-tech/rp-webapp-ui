import {
  Circle,
  Defs,
  G,
  LinearGradient,
  Mask,
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
 * A painter's palette with a brush working one of the blobs.
 *
 * The badge is for ten Muses made into whole people, so this is the only
 * artwork on the shelf that is deliberately many-coloured: every other badge
 * commits to one hue, and a palette that did the same would not be a palette.
 * Muse Keeper counts characters; this one is about the work that went into
 * them, which is why it is the tools rather than the cast.
 */

/** The board, with the thumb hole cut through it. */
const BOARD =
  "M26 60 C26 39 44 25 66 25 C89 25 103 39 103 57 C103 72 90 79 78 81 C69 82.5 64 87 60 93 C55 100 44 101 36 96 C28 91 26 76 26 60 Z";
const THUMB = { cx: 45, cy: 74, r: 7.5 };

/**
 * The paint, laid out round the top of the board where the brush can reach it.
 *
 * Ten Muses, five blobs — a palette with one dab per character would read as a
 * dotted line, and the badge is about the mixing rather than the tally.
 */
const BLOBS = [
  { colour: "#E8484F", cx: 42, cy: 45, r: 6.4 },
  { colour: "#F2A13C", cx: 57, cy: 37, r: 5.8 },
  { colour: "#3FBF7F", cx: 73, cy: 37, r: 5.4 },
  { colour: "#3E8FE0", cx: 87, cy: 46, r: 5.8 },
  { colour: "#B061E0", cx: 88, cy: 62, r: 5 },
];

/** Which blob the brush is loaded from. */
const DIP = BLOBS[1];

/**
 * The brush, tip at the origin and handle running up and to the right.
 *
 * The handle stops short of where a real one would: the frame lets its SVG
 * overflow, so a brush drawn to full length runs off the top of the badge and
 * over whatever is above it instead of being cut off.
 */
const BRUSH_HANDLE = "M4.5 -13 L16.5 -31";
const BRUSH_FERRULE = "M1.8 -6.4 L11.4 -12 L14.6 -6.4 L5 -0.8 Z";
const BRUSH_TIP = "M0 0 L7.4 -4.3 L4.6 -9 Z";

export const CreativeBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const board = muted ? [GREY.soft, GREY.deep] : ["#D89A56", "#8A5220"];
  const edge = muted ? GREY.ink : "#6A3B12";
  const handle = muted ? GREY.mid : "#4A2E14";
  const ferrule = muted ? GREY.pale : "#D7DCE6";
  const bristle = muted ? GREY.light : "#F2A13C";

  return (
    <>
      <Defs>
        <Mask id={id("hole")}>
          <Rect x="0" y="0" width="120" height="120" fill="#FFFFFF" />
          <Circle cx={THUMB.cx} cy={THUMB.cy} r={THUMB.r} fill="#000000" />
        </Mask>
        <LinearGradient id={id("board")} x1="14%" y1="0%" x2="86%" y2="100%">
          <Stop offset="0%" stopColor={board[0]} />
          <Stop offset="100%" stopColor={board[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#E0873C"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#E0873C"}
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="62"
        cy="58"
        r="52"
        fill={`url(#${id("aura")})`}
      />

      <G mask={`url(#${id("hole")})`}>
        <Path
          d={BOARD}
          fill={`url(#${id("board")})`}
          stroke={edge}
          strokeOpacity={muted ? 0.4 : 0.6}
          strokeWidth="1.6"
        />
      </G>

      {/* The paint. Each blob swells on its own clock, so the palette looks wet
          rather than printed. */}
      {BLOBS.map((blob, index) => (
        <G key={blob.colour} className={`nwb-blob-${index + 1}`}>
          <Circle
            cx={blob.cx}
            cy={blob.cy}
            r={blob.r}
            fill={muted ? GREY.light : blob.colour}
            fillOpacity={muted ? 0.55 : 1}
          />
        </G>
      ))}

      {/* The brush, dipping into the orange and lifting away with it. */}
      {detailed && (
        <G className="nwb-brush">
          <G transform={`translate(${DIP.cx} ${DIP.cy})`}>
            <Path
              d={BRUSH_HANDLE}
              stroke={handle}
              strokeOpacity={muted ? 0.6 : 1}
              strokeWidth="4.6"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={BRUSH_FERRULE}
              fill={ferrule}
              fillOpacity={muted ? 0.6 : 1}
            />
            <Path
              d={BRUSH_TIP}
              fill={muted ? GREY.light : bristle}
              fillOpacity={muted ? 0.6 : 1}
            />
          </G>
        </G>
      )}
    </>
  );
};
