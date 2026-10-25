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
 * A collector's box set: five matching volumes in a gilded slipcase.
 *
 * The badge is for finishing five books by the same author, so the art is the
 * complete set — five spines in one binding, numbered one to five, sitting in
 * a slipcase with the author's seal on its side and two ribbon markers hanging
 * from it. Drawn three-quarter on, so the case shows its top and side and
 * reads as an object; where Chronicler is a shelf of different books, this is
 * one set, all the same. The volumes drop into their slots one by one, a
 * glint runs across the case and the seal shines when the fifth is home, and
 * the set lifts out to be filled again. Ivory and gold case, plum volumes.
 */

/** The slipcase in three-quarter view: front frame, top and side panels. */
const FRONT = { h: 64, w: 68, x: 26, y: 34 };
const DEPTH = { x: 8, y: -6 };
const TOP = `M${FRONT.x} ${FRONT.y} L${FRONT.x + DEPTH.x} ${FRONT.y + DEPTH.y} H${FRONT.x + FRONT.w + DEPTH.x} L${FRONT.x + FRONT.w} ${FRONT.y} Z`;
const SIDE = `M${FRONT.x + FRONT.w} ${FRONT.y} L${FRONT.x + FRONT.w + DEPTH.x} ${FRONT.y + DEPTH.y} V${FRONT.y + FRONT.h + DEPTH.y} L${FRONT.x + FRONT.w} ${FRONT.y + FRONT.h} Z`;

/** Five equal spines inside the front opening. */
const SPINE = { h: 57, w: 12, y: 38 };
const SPINE_X = [30, 42, 54, 66, 78];

/** Two ribbon markers hanging below the set. */
const RIBBONS = [
  { tone: 0, x: 47 },
  { tone: 1, x: 71 },
];

export const CompletionistBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const ivory = muted ? [GREY.pale, GREY.light] : ["#FBF4E2", "#E2D2AA"];
  const caseShade = muted ? [GREY.light, GREY.soft] : ["#E8D8B0", "#B9A276"];
  const caseEdge = muted ? GREY.deep : "#7A6234";
  const gold = muted ? [GREY.pale, GREY.soft] : ["#FBE3A0", "#B98326"];
  const goldLine = muted ? GREY.light : "#E8C46A";
  const plum = muted ? [GREY.soft, GREY.deep] : ["#8A3C86", "#4A1C48"];
  const plumEdge = muted ? GREY.deep : "#2E0E2C";
  const ribbons = muted ? [GREY.soft, GREY.ink] : ["#D8433A", "#E8B53A"];

  return (
    <>
      <Defs>
        <LinearGradient id={id("ivory")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={ivory[0]} />
          <Stop offset="100%" stopColor={ivory[1]} />
        </LinearGradient>
        <LinearGradient id={id("shade")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={caseShade[0]} />
          <Stop offset="100%" stopColor={caseShade[1]} />
        </LinearGradient>
        <LinearGradient id={id("gold")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gold[0]} />
          <Stop offset="100%" stopColor={gold[1]} />
        </LinearGradient>
        {/* Across each spine: rounded, lit down the middle. */}
        <LinearGradient id={id("plum")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={plum[1]} />
          <Stop offset="45%" stopColor={plum[0]} />
          <Stop offset="100%" stopColor={plum[1]} />
        </LinearGradient>
        <ClipPath id={id("front")}>
          <Rect x={FRONT.x} y={FRONT.y} width={FRONT.w} height={FRONT.h} />
        </ClipPath>
        <LinearGradient id={id("glint")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFF6D6" stopOpacity="0" />
          <Stop offset="50%" stopColor="#FFF6D6" stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#FFF6D6" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#8A3C86"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#8A3C86"}
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

      {/* The case's top and side, behind its front frame. */}
      <Path
        d={TOP}
        fill={`url(#${id("ivory")})`}
        stroke={caseEdge}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <Path
        d={SIDE}
        fill={`url(#${id("shade")})`}
        stroke={caseEdge}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {detailed && (
        <>
          {/* Gilt edging along the panels' outer edges. */}
          <Path
            d={`M${FRONT.x + DEPTH.x + 2} ${FRONT.y + DEPTH.y + 1.6} H${FRONT.x + FRONT.w + DEPTH.x - 1.4}`}
            stroke={goldLine}
            strokeWidth="0.8"
          />
          <Path
            d={`M${FRONT.x + FRONT.w + DEPTH.x - 1.4} ${FRONT.y + DEPTH.y + 2} V${FRONT.y + FRONT.h + DEPTH.y - 1.6}`}
            stroke={goldLine}
            strokeWidth="0.8"
          />
        </>
      )}
      {/* The author's seal on the side panel. */}
      <G
        transform={`translate(${FRONT.x + FRONT.w + DEPTH.x / 2} ${FRONT.y + FRONT.h / 2 + DEPTH.y / 2}) skewY(-36.87) scale(0.62 1)`}
      >
        {/* Pulses as the set is completed. */}
        <G className="nwb-seal-shine">
          <Circle
            r="5.6"
            fill={`url(#${id("gold")})`}
            stroke={caseEdge}
            strokeWidth="0.7"
          />
          {detailed && (
            <Path
              d="M0 -3.2 L0.9 -1 L3.2 -1 L1.4 0.5 L2 2.8 L0 1.5 L-2 2.8 L-1.4 0.5 L-3.2 -1 L-0.9 -1 Z"
              fill={plum[1]}
            />
          )}
        </G>
      </G>

      {/* The front frame, the opening, and the five volumes in it. */}
      <Rect
        x={FRONT.x}
        y={FRONT.y}
        width={FRONT.w}
        height={FRONT.h}
        rx="1.5"
        fill={`url(#${id("ivory")})`}
        stroke={caseEdge}
        strokeWidth="0.9"
      />
      <Rect
        x={SPINE_X[0] - 1}
        y={SPINE.y - 1}
        width={SPINE.w * 5 + 2}
        height={SPINE.h + 2}
        fill="#1E0E1C"
      />
      {SPINE_X.map((x, i) => {
        const volume = i + 1;
        return (
          // Each volume drops into its slot in turn.
          <G key={x} className={`nwb-volume-${volume}`}>
            <Rect
              x={x}
              y={SPINE.y}
              width={SPINE.w}
              height={SPINE.h}
              rx="1"
              fill={`url(#${id("plum")})`}
              stroke={plumEdge}
              strokeWidth="0.6"
            />
            <Rect
              x={x + 1}
              y={SPINE.y + 4}
              width={SPINE.w - 2}
              height="1.4"
              fill={`url(#${id("gold")})`}
            />
            <Rect
              x={x + 1}
              y={SPINE.y + SPINE.h - 5.4}
              width={SPINE.w - 2}
              height="1.4"
              fill={`url(#${id("gold")})`}
            />
            {detailed && (
              <>
                {/* The author's mark, the same on every volume. */}
                <Path
                  d={`M${x + SPINE.w / 2} ${SPINE.y + 10} l2.4 3 l-2.4 3 l-2.4 -3 Z`}
                  fill={`url(#${id("gold")})`}
                />
                {/* Its number in the set, as gilt dots. */}
                {Array.from({ length: volume }, (_, d) => (
                  <Circle
                    key={d}
                    cx={x + SPINE.w / 2}
                    cy={SPINE.y + 26 + d * 4.2}
                    r="1"
                    fill={goldLine}
                  />
                ))}
              </>
            )}
          </G>
        );
      })}
      {/* A glint across the front once the set is complete. Rests off the
          case to the left. */}
      {detailed && (
        <G clipPath={`url(#${id("front")})`}>
          <G className="nwb-set-glint">
            <Path
              d="M-30 30 L-20 30 L-26 102 L-36 102 Z"
              fill={`url(#${id("glint")})`}
            />
          </G>
        </G>
      )}

      {/* Gilt rim round the front of the case. */}
      {detailed && (
        <Rect
          x={FRONT.x + 1.2}
          y={FRONT.y + 1.2}
          width={FRONT.w - 2.4}
          height={FRONT.h - 2.4}
          rx="1"
          fill="none"
          stroke={goldLine}
          strokeWidth="0.6"
          strokeOpacity="0.9"
        />
      )}

      {/* Ribbon markers hanging below the set. */}
      {RIBBONS.map((r, i) => (
        <Path
          key={r.x}
          className={i === 0 ? "nwb-ribbon-a" : "nwb-ribbon-b"}
          d={`M${r.x - 1.6} ${FRONT.y + FRONT.h - 3} H${r.x + 1.6} V${FRONT.y + FRONT.h + 8} L${r.x} ${FRONT.y + FRONT.h + 6} L${r.x - 1.6} ${FRONT.y + FRONT.h + 8} Z`}
          fill={ribbons[r.tone]}
          stroke={muted ? GREY.deep : "#5E1A10"}
          strokeWidth="0.5"
        />
      ))}
    </>
  );
};
