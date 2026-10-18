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
 * A jewelled quill in a presentation case with a glass lid.
 *
 * The badge is for a year on Novelist World and a post in each of the last six
 * months — long service — so the quill is the kind given for it: pearl and
 * gold, a ruby at the collar, kept on velvet in a black-lacquer case. The lid
 * swings up on its back hinge, the quill rises out to be looked at, and then
 * goes back and the lid closes over it.
 *
 * Everything is placed in its *open* pose — lid up, quill raised — because
 * that is the picture a still crest should show (locked, reduced motion, list
 * sizes). The animation runs each moving part back to its closed pose and out
 * again, relative to that.
 */

/**
 * The case, seen from the front and a little above: the velvet floor through
 * the opening, the lacquered front, gold feet.
 */
const HINGE_Y = 58;
const OPENING = "M27 58 H93 L100 71 H20 Z";
const FRONT = { h: 25, w: 80, x: 20, y: 71 };
const FEET = [24, 90];
/** Filigree in each front corner. */
const CORNERS = [
  "M22 74 C27 74 28 77 28 80 M22 74 C22 79 25 80 28 80",
  "M98 74 C93 74 92 77 92 80 M98 74 C98 79 95 80 92 80",
  "M22 93 C27 93 28 90 28 87 M22 93 C22 88 25 87 28 87",
  "M98 93 C93 93 92 90 92 87 M98 93 C98 88 95 87 92 87",
];
const PLATE =
  "M55 77 H65 V87 C65 90 62.5 91.5 60 91.5 C57.5 91.5 55 90 55 87 Z";
const KEYHOLE =
  "M60 80.5 a1.6 1.6 0 1 1 0.01 0 Z M59.2 82.6 H60.8 L61.3 86.4 H58.7 Z";

/**
 * The glass lid, drawn closed — hanging down from the hinge over the opening.
 * The outer group flips it up past the hinge to stand open; the animation
 * swings it from there back down through edge-on.
 */
const LID = OPENING;
const LID_OPEN = `translate(0 ${HINGE_Y}) scale(1 -1.25) translate(0 ${-HINGE_Y})`;
const LID_GLINTS = ["M36 60 L31 69", "M44 60 L40 67"];

/**
 * The quill, drawn upright about its middle. Raised, it stands above the case
 * at a slight tilt; at rest it lies on the velvet almost flat.
 */
const QUILL_RAISED = "translate(60 35) rotate(22) scale(0.72)";
const VANE =
  "M0 -46 C10 -38 13.5 -20 11.5 -2 C10.5 10 6.5 20 2 26 L0 28 L-2 24 C-8 14 -12 0 -11 -14 C-10 -30 -6 -40 0 -46 Z";
const BARBS = [-34, -26, -18, -10, -2, 6, 14];
const COLLAR = { h: 3, w: 6, x: -3, y: 27 };
const RUBY = { cx: 0, cy: 31.5, rx: 2.4, ry: 2.8 };
const NIB = "M-1.8 34 L1.8 34 L1.2 42 L0 46 L-1.2 42 Z";

/** Stars round the raised quill. */
const STARS = [
  { s: 3.8, x: 26, y: 24 },
  { s: 3, x: 94, y: 30 },
  { s: 2.6, x: 88, y: 50 },
];

const starPath = (x: number, y: number, s: number): string =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`;

export const VeteranQuillBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const lacquer = muted ? [GREY.mid, GREY.deep] : ["#3A3044", "#120E16"];
  const gold = muted ? [GREY.pale, GREY.soft] : ["#FBE3A0", "#B07E2C"];
  const goldLine = muted ? GREY.light : "#E8C46A";
  const velvet = muted ? [GREY.soft, GREY.deep] : ["#B0284A", "#4E0C20"];
  const glass = muted ? GREY.pale : "#DDF4FF";
  const vane = muted
    ? [GREY.pale, GREY.pale, GREY.light]
    : ["#FFFDF6", "#F4ECFF", "#9EE6E0"];
  const ruby = muted ? [GREY.light, GREY.deep] : ["#FF7A92", "#9E0E2E"];
  const glow = muted ? GREY.light : "#FFE6A0";

  return (
    <>
      <Defs>
        <ClipPath id={id("vane-clip")}>
          <Path d={VANE} />
        </ClipPath>
        <LinearGradient id={id("lacquer")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={lacquer[0]} />
          <Stop offset="100%" stopColor={lacquer[1]} />
        </LinearGradient>
        <LinearGradient id={id("gold")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gold[0]} />
          <Stop offset="100%" stopColor={gold[1]} />
        </LinearGradient>
        <LinearGradient id={id("velvet")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={velvet[1]} />
          <Stop offset="100%" stopColor={velvet[0]} />
        </LinearGradient>
        <LinearGradient id={id("glass")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={glass} stopOpacity="0.45" />
          <Stop offset="100%" stopColor={glass} stopOpacity="0.12" />
        </LinearGradient>
        {/* Pearl down the vane, turning iridescent at the tip. */}
        <LinearGradient id={id("vane")} x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor={vane[0]} />
          <Stop offset="60%" stopColor={vane[1]} />
          <Stop offset="100%" stopColor={vane[2]} />
        </LinearGradient>
        <RadialGradient id={id("ruby")} cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={ruby[0]} />
          <Stop offset="100%" stopColor={ruby[1]} />
        </RadialGradient>
        <RadialGradient id={id("glow")} cx="50%" cy="60%" r="50%">
          <Stop offset="0%" stopColor={glow} stopOpacity={muted ? 0.2 : 0.75} />
          <Stop offset="100%" stopColor={glow} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={id("sheen")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFF" stopOpacity="0" />
          <Stop offset="50%" stopColor="#FFF" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#F2C14E"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#F2C14E"}
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

      {/* Light rising out of the open case; it dims as the lid closes. */}
      <G className="nwb-case-glow">
        <Ellipse cx="60" cy="48" rx="34" ry="30" fill={`url(#${id("glow")})`} />
      </G>

      {/* The velvet floor, seen through the opening. */}
      <Path d={OPENING} fill={`url(#${id("velvet")})`} />
      {detailed && (
        <Path
          d="M34 66 C46 62 74 62 86 66"
          fill="none"
          stroke="#000"
          strokeOpacity={muted ? 0.15 : 0.3}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}

      {/* The lid: flipped open by the outer group, swung shut and back by
          the inner one about its hinge. */}
      <G transform={LID_OPEN}>
        <G className="nwb-lid">
          <Path
            d={LID}
            fill={`url(#${id("glass")})`}
            stroke={`url(#${id("gold")})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {detailed &&
            LID_GLINTS.map((d) => (
              <Path
                key={d}
                d={d}
                stroke="#FFF"
                strokeOpacity={muted ? 0.3 : 0.7}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            ))}
        </G>
      </G>

      {/* The quill: raised by the outer group; the inner one lays it back
          on the velvet and lifts it out again. */}
      <G transform={QUILL_RAISED}>
        <G className="nwb-quill-rise">
          <Path d={NIB} fill={`url(#${id("gold")})`} />
          <Path
            d={VANE}
            fill={`url(#${id("vane")})`}
            stroke={goldLine}
            strokeWidth="1.3"
          />
          {detailed && (
            <G clipPath={`url(#${id("vane-clip")})`}>
              {BARBS.map((y) => (
                <G key={y}>
                  <Path
                    d={`M0 ${y} L12 ${y - 7}`}
                    stroke={goldLine}
                    strokeOpacity="0.45"
                    strokeWidth="0.6"
                  />
                  <Path
                    d={`M0 ${y} L-12 ${y - 7}`}
                    stroke={goldLine}
                    strokeOpacity="0.45"
                    strokeWidth="0.6"
                  />
                </G>
              ))}
              {/* Rests off the vane; the shared sweep carries it across. */}
              <G className="nwb-sheen">
                <Path
                  d="M-28 -50 L-20 -50 L-32 30 L-40 30 Z"
                  fill={`url(#${id("sheen")})`}
                />
              </G>
            </G>
          )}
          <Path
            d="M0 -44 V28"
            stroke={goldLine}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <Rect
            x={COLLAR.x}
            y={COLLAR.y}
            width={COLLAR.w}
            height={COLLAR.h}
            rx="1"
            fill={`url(#${id("gold")})`}
          />
          <Ellipse
            cx={RUBY.cx}
            cy={RUBY.cy}
            rx={RUBY.rx}
            ry={RUBY.ry}
            fill={`url(#${id("ruby")})`}
            stroke={muted ? GREY.deep : "#7A5418"}
            strokeWidth="0.7"
          />
        </G>
      </G>

      {/* The case front, over the quill's foot when it lies inside. */}
      <Rect
        x={FRONT.x}
        y={FRONT.y}
        width={FRONT.w}
        height={FRONT.h}
        rx="2"
        fill={`url(#${id("lacquer")})`}
        stroke={`url(#${id("gold")})`}
        strokeWidth="1.4"
      />
      <Path
        d={`M${FRONT.x} ${FRONT.y} H${FRONT.x + FRONT.w}`}
        stroke={goldLine}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {detailed &&
        CORNERS.map((d) => (
          <Path
            key={d}
            d={d}
            fill="none"
            stroke={goldLine}
            strokeWidth="1"
            strokeLinecap="round"
          />
        ))}
      <Path d={PLATE} fill={`url(#${id("gold")})`} />
      {detailed && <Path d={KEYHOLE} fill={muted ? GREY.deep : "#2A1A08"} />}
      {FEET.map((x) => (
        <Rect
          key={x}
          x={x}
          y={FRONT.y + FRONT.h - 1}
          width="6"
          height="4"
          rx="1.5"
          fill={`url(#${id("gold")})`}
        />
      ))}

      {detailed &&
        STARS.map((st, i) => (
          <Path
            key={st.x}
            className={`nwb-star-${i + 1}`}
            d={starPath(st.x, st.y, st.s)}
            fill={muted ? GREY.pale : "#FFF4D0"}
          />
        ))}
    </>
  );
};
