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
 * A spool paying out thread that never runs out.
 *
 * The badge is for staying on one *thread* until it is done, so the artwork is
 * the pun taken literally — and it earns its place: the wound barrel is the
 * fifty turns already taken, and the line still running off it is the reason
 * the badge is not called Persistent. Teal, and the only silhouette here with
 * something trailing out of the frame.
 */

/** The spool: two flanges with the wound barrel between them. */
const FLANGE = { h: 11, rx: 4, w: 54, x: 24, y: 30 };
const FLANGE_BOTTOM_Y = 79;
const BARREL = { h: 38, w: 36, x: 33, y: 41 };

/** The winding on the barrel, as lines that scroll behind a clip. */
const WINDINGS = [-6, 0, 6, 12, 18, 24, 30, 36, 42];

/**
 * The thread coming off it: out to the right, then down and away off the
 * bottom of the badge.
 *
 * One long path with a dash pattern marching along it. The dashes are nearly
 * as long as the gaps are short, so the line reads as a continuous strand with
 * movement in it — at an even dash it reads as a dotted rule instead, and at no
 * dash at all there is nothing for the offset to move.
 */
const THREAD = "M69 62 C88 64 97 76 92 88 C87 100 74 104 64 114";

export const DedicatedBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const flange = muted ? [GREY.soft, GREY.deep] : ["#2F8E96", "#0E4048"];
  const wound = muted ? [GREY.pale, GREY.light] : ["#FFF1CE", "#E0BC7C"];
  const strand = muted ? GREY.light : "#FFE7B0";
  const shade = muted ? GREY.ink : "#B98A44";

  return (
    <>
      <Defs>
        <ClipPath id={id("barrel")}>
          <Rect
            x={BARREL.x}
            y={BARREL.y}
            width={BARREL.w}
            height={BARREL.h}
            rx="2"
          />
        </ClipPath>
        <LinearGradient id={id("flange")} x1="10%" y1="0%" x2="90%" y2="100%">
          <Stop offset="0%" stopColor={flange[0]} />
          <Stop offset="100%" stopColor={flange[1]} />
        </LinearGradient>
        <LinearGradient id={id("wound")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={wound[1]} />
          <Stop offset="42%" stopColor={wound[0]} />
          <Stop offset="100%" stopColor={wound[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#2F8E96"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#2F8E96"}
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="56"
        cy="58"
        r="52"
        fill={`url(#${id("aura")})`}
      />

      {/* The thread first, so it runs out from behind the spool. */}
      <Path
        className="nwb-thread"
        d={THREAD}
        fill="none"
        stroke={strand}
        strokeOpacity={muted ? 0.5 : 0.95}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="17 4"
      />

      {/* The barrel, wound. The winding scrolls behind the barrel's own clip,
          which is what makes the spool read as turning without a face-on view
          of it — a spool seen end-on would just be another disc. */}
      <Rect
        x={BARREL.x}
        y={BARREL.y}
        width={BARREL.w}
        height={BARREL.h}
        rx="2"
        fill={`url(#${id("wound")})`}
      />

      {detailed && (
        <G clipPath={`url(#${id("barrel")})`}>
          <G className="nwb-winding">
            {WINDINGS.map((offset) => (
              <Path
                key={offset}
                d={`M${BARREL.x} ${BARREL.y + offset} H${BARREL.x + BARREL.w}`}
                stroke={shade}
                strokeOpacity={muted ? 0.3 : 0.5}
                strokeWidth="1.6"
              />
            ))}
          </G>
        </G>
      )}

      {/* Flanges last: the barrel is wound between them, not over them. */}
      <Rect
        x={FLANGE.x}
        y={FLANGE.y}
        width={FLANGE.w}
        height={FLANGE.h}
        rx={FLANGE.rx}
        fill={`url(#${id("flange")})`}
      />
      <Rect
        x={FLANGE.x}
        y={FLANGE_BOTTOM_Y}
        width={FLANGE.w}
        height={FLANGE.h}
        rx={FLANGE.rx}
        fill={`url(#${id("flange")})`}
      />
    </>
  );
};
