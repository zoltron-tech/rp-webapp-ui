import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
  SvgImage,
} from "@nw/animations";
import type { FC } from "react";
import {
  type BadgeArtworkProps,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "../frame";

/**
 * A Novelist World passport, opened, stamped, and closed again.
 *
 * The badge is for writing stories in five different fandoms, so the art is
 * the passport of a writer who travels between them: jade leather with the NW
 * monogram stamped in gold foil on the cover, under an arc of five stars, one
 * per fandom. A boarding ticket sticks out of it, a ribbon marker hangs from
 * it, and a paper plane has just flown in on a dashed route. It swings open to
 * its ID page and four stamps already in it, the rubber stamp thumps down and
 * prints the fifth, and the passport closes again. Shown closed when still —
 * the cover is the badge. Legendary, so it carries the most going on of any
 * crest on the shelf, and gold sparkles round it.
 *
 * ## How the opening is drawn
 *
 * Closed, only the right half of the booklet exists: the right page under the
 * front cover. Opening, the cover narrows to nothing against the spine and the
 * left page — the ID page, inside the cover — widens out from the spine the
 * other way, which in a flat drawing is what a cover swinging over looks like.
 * The whole booklet slides from centring the closed passport to centring the
 * open one as it goes.
 *
 * The closed pose is not drawn with transform attributes — the left page
 * collapsed, the booklet shifted — because on a phone an animated wrapper
 * multiplies into an element's own transform rather than replacing it. Web
 * sets that pose in the frame's stylesheet; the phone, with a rest pose.
 */

/** The booklet, raised a little and tilted about the spine's middle. */
const TILT = "translate(0 -6) rotate(-14 60 76)";
const SPINE_X = 60;

/** Covers, pages and the closed cover's face. */
const COVER_L = { h: 50, w: 46, x: 15, y: 51 };
const COVER_R = { h: 50, w: 46, x: 59, y: 51 };
const PAGE_L = { h: 45, w: 41, x: 18.5, y: 53.5 };
const PAGE_R = { h: 45, w: 41, x: 60.5, y: 53.5 };

/** The ID page: a portrait and the lines beside it. */
const PORTRAIT = { h: 14, w: 11, x: 23, y: 59 };
const ID_LINES = [
  { w: 16, y: 61 },
  { w: 13, y: 65 },
  { w: 15, y: 69 },
];
/** The machine-readable strip at the foot of the ID page. */
const MRZ_Y = [90, 93.5];

/**
 * The five stamps, one per fandom: fantasy, magic, romance, mystery and
 * science fiction. The rocket is the one printed on each lap.
 */
const STAMPS = {
  castle: { cx: 76, cy: 66, ink: "#D8433A", r: 8.4 },
  heart: { cx: 49.5, cy: 81, ink: "#D6457A", rotate: 8, s: 12 },
  lens: { cx: 94, cy: 64, ink: "#C98A1E", r: 6.4 },
  moon: { cx: 30, cy: 81.5, ink: "#8A5CD0", rx: 8.6, ry: 6 },
  rocket: { cx: 88, cy: 85, h: 12, ink: "#2E9C9A", rotate: 9, w: 19 },
};

/** The cover's foil: the monogram, and two rules under it. */
const MONOGRAM = { size: 21, x: 71.5, y: 61 };

/** Five foil stars arched over the monogram, one per fandom. */
const STARS = [
  { x: 72, y: 58.6 },
  { x: 77, y: 57.2 },
  { x: 82, y: 56.8 },
  { x: 87, y: 57.2 },
  { x: 92, y: 58.6 },
];
const STAR =
  "M0 -1.9 L0.56 -0.6 L1.8 -0.6 L0.8 0.24 L1.16 1.56 L0 0.8 L-1.16 1.56 L-0.8 0.24 L-1.8 -0.6 L-0.56 -0.6 Z";

/** The boarding ticket tucked in the passport, its top sticking out. */
const TICKET = { h: 20, rotate: 6, w: 26, x: 71, y: 40 };

/** Gold sparkles round the crest, outside the booklet. */
const SPARKLES = [
  { s: 1, x: 104, y: 96 },
  { s: 0.8, x: 16, y: 104 },
  { s: 0.9, x: 106, y: 52 },
];
const SPARKLE =
  "M0 -3.4 Q0.5 -0.5 3.4 0 Q0.5 0.5 0 3.4 Q-0.5 0.5 -3.4 0 Q-0.5 -0.5 0 -3.4 Z";

/** The paper plane, just landed at the end of its dashed route. */
const PLANE = { x: 24, y: 44 };

/** The rubber stamp above the right page: knob, neck, block and rubber. */
const RUBBER = { x: 84, y: 40 };

export const GlobetrotterBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
  logoHref,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const leather = muted ? [GREY.soft, GREY.deep] : ["#2A7E68", "#0B3B2C"];
  const leatherEdge = muted ? GREY.deep : "#062419";
  const page = muted ? [GREY.pale, GREY.light] : ["#FFF8E8", "#EFE2C4"];
  const pattern = muted ? GREY.light : "#C9B892";
  const ink = muted ? GREY.soft : "#5A4A3A";
  const wood = muted ? [GREY.light, GREY.soft] : ["#C98A4E", "#7A4A22"];
  const gold = muted ? [GREY.pale, GREY.light] : ["#FBE3A0", "#C9962E"];
  const inks = {
    castle: muted ? GREY.soft : STAMPS.castle.ink,
    heart: muted ? GREY.soft : STAMPS.heart.ink,
    lens: muted ? GREY.soft : STAMPS.lens.ink,
    moon: muted ? GREY.soft : STAMPS.moon.ink,
    rocket: muted ? GREY.soft : STAMPS.rocket.ink,
  };
  const keyline = muted ? GREY.deep : "#1F2A33";

  const securityPrint = (clip: string) =>
    detailed && (
      <G clipPath={`url(#${id(clip)})`}>
        {[58, 66, 74, 82, 90].map((y) => (
          <Path
            key={y}
            d={`M14 ${y} q5 -2.4 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0`}
            fill="none"
            stroke={pattern}
            strokeOpacity="0.45"
            strokeWidth="0.5"
          />
        ))}
      </G>
    );

  return (
    <>
      <Defs>
        <ClipPath id={id("page-l")}>
          <Rect x={PAGE_L.x} y={PAGE_L.y} width={PAGE_L.w} height={PAGE_L.h} />
        </ClipPath>
        <ClipPath id={id("page-r")}>
          <Rect x={PAGE_R.x} y={PAGE_R.y} width={PAGE_R.w} height={PAGE_R.h} />
        </ClipPath>
        {/* The monogram as a stencil, so its white glyph prints in gold. */}
        {logoHref ? (
          <Mask id={id("monogram")}>
            <SvgImage
              href={logoHref}
              x={MONOGRAM.x}
              y={MONOGRAM.y}
              width={MONOGRAM.size}
              height={MONOGRAM.size}
              preserveAspectRatio="xMidYMid meet"
            />
          </Mask>
        ) : null}
        <LinearGradient id={id("leather")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={leather[0]} />
          <Stop offset="100%" stopColor={leather[1]} />
        </LinearGradient>
        <LinearGradient id={id("gold")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gold[0]} />
          <Stop offset="100%" stopColor={gold[1]} />
        </LinearGradient>
        <LinearGradient id={id("page")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={page[0]} />
          <Stop offset="100%" stopColor={page[1]} />
        </LinearGradient>
        {/* The fold: pages darken into the spine. */}
        <LinearGradient id={id("fold-l")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#000" stopOpacity="0" />
          <Stop
            offset="100%"
            stopColor="#000"
            stopOpacity={muted ? 0.15 : 0.22}
          />
        </LinearGradient>
        <LinearGradient id={id("fold-r")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop
            offset="0%"
            stopColor="#000"
            stopOpacity={muted ? 0.15 : 0.22}
          />
          <Stop offset="100%" stopColor="#000" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id={id("wood")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={wood[1]} />
          <Stop offset="45%" stopColor={wood[0]} />
          <Stop offset="100%" stopColor={wood[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#29A383"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#29A383"}
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
        {/* Slides between centring the closed booklet and the open one. */}
        <G className="nwb-booklet">
          {/* Jolts as the stamp lands. */}
          <G className="nwb-passport">
            {/* The boarding ticket, tucked between the pages. */}
            <G
              transform={`rotate(${TICKET.rotate} ${TICKET.x + TICKET.w / 2} ${TICKET.y + TICKET.h / 2})`}
            >
              <Rect
                x={TICKET.x}
                y={TICKET.y}
                width={TICKET.w}
                height={TICKET.h}
                rx="1.6"
                fill={muted ? GREY.pale : "#FFF4DC"}
                stroke={keyline}
                strokeWidth="0.8"
              />
              <Rect
                x={TICKET.x + 0.4}
                y={TICKET.y + 0.4}
                width={TICKET.w - 0.8}
                height="3.6"
                rx="1.2"
                fill={muted ? GREY.soft : "#E8674A"}
              />
              {/* A little plane, and the barcode beside it. */}
              <Path
                d={`M${TICKET.x + 3} ${TICKET.y + 8} L${TICKET.x + 9} ${TICKET.y + 6.4} L${TICKET.x + 5.4} ${TICKET.y + 10.4} L${TICKET.x + 5} ${TICKET.y + 8.4} Z`}
                fill={muted ? GREY.soft : "#E8674A"}
              />
              {detailed &&
                [0, 1.4, 2.2, 3.6, 4.4, 5.2, 6.8, 7.6, 9].map((dx) => (
                  <Rect
                    key={dx}
                    x={TICKET.x + 12 + dx}
                    y={TICKET.y + 5.6}
                    width={dx % 2 ? 0.5 : 0.9}
                    height="4.4"
                    fill={keyline}
                  />
                ))}
            </G>
            {/* The ribbon marker, hanging out of the foot of the pages. */}
            <G className="nwb-ribbon">
              <Path
                d="M64.4 96 H68.6 V111 L66.5 108.4 L64.4 111 Z"
                fill={muted ? GREY.soft : "#C8312E"}
                stroke={muted ? GREY.deep : "#5E1A10"}
                strokeWidth="0.6"
                strokeLinejoin="round"
              />
            </G>

            {/* ── The right half: back cover, page, stamps. ── */}
            <Rect
              x={COVER_R.x}
              y={COVER_R.y}
              width={COVER_R.w}
              height={COVER_R.h}
              rx="4"
              fill={`url(#${id("leather")})`}
              stroke={leatherEdge}
              strokeWidth="1"
            />
            <Rect
              x={PAGE_R.x}
              y={PAGE_R.y}
              width={PAGE_R.w}
              height={PAGE_R.h}
              rx="1.5"
              fill={`url(#${id("page")})`}
            />
            {securityPrint("page-r")}
            <Rect
              x={SPINE_X}
              y={PAGE_R.y}
              width="6"
              height={PAGE_R.h}
              fill={`url(#${id("fold-r")})`}
            />

            <G opacity="0.88">
              <Circle
                cx={STAMPS.castle.cx}
                cy={STAMPS.castle.cy}
                r={STAMPS.castle.r}
                fill="none"
                stroke={inks.castle}
                strokeWidth="1.3"
              />
              {detailed && (
                <Circle
                  cx={STAMPS.castle.cx}
                  cy={STAMPS.castle.cy}
                  r={STAMPS.castle.r - 2}
                  fill="none"
                  stroke={inks.castle}
                  strokeWidth="0.6"
                  strokeDasharray="1.2 0.8"
                />
              )}
              <Path
                d={`M${STAMPS.castle.cx - 4} ${STAMPS.castle.cy + 3.2} V${STAMPS.castle.cy - 1.4} H${STAMPS.castle.cx - 2.6} V${STAMPS.castle.cy - 3} H${STAMPS.castle.cx - 1.4} V${STAMPS.castle.cy - 1.4} H${STAMPS.castle.cx + 1.4} V${STAMPS.castle.cy - 3} H${STAMPS.castle.cx + 2.6} V${STAMPS.castle.cy - 1.4} H${STAMPS.castle.cx + 4} V${STAMPS.castle.cy + 3.2} Z`}
                fill={inks.castle}
              />

              <Path
                d={`M${STAMPS.lens.cx} ${STAMPS.lens.cy - STAMPS.lens.r} L${STAMPS.lens.cx + STAMPS.lens.r * 0.87} ${STAMPS.lens.cy - STAMPS.lens.r / 2} V${STAMPS.lens.cy + STAMPS.lens.r / 2} L${STAMPS.lens.cx} ${STAMPS.lens.cy + STAMPS.lens.r} L${STAMPS.lens.cx - STAMPS.lens.r * 0.87} ${STAMPS.lens.cy + STAMPS.lens.r / 2} V${STAMPS.lens.cy - STAMPS.lens.r / 2} Z`}
                fill="none"
                stroke={inks.lens}
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <Circle
                cx={STAMPS.lens.cx - 0.8}
                cy={STAMPS.lens.cy - 0.8}
                r="2.2"
                fill="none"
                stroke={inks.lens}
                strokeWidth="1"
              />
              <Path
                d={`M${STAMPS.lens.cx + 0.8} ${STAMPS.lens.cy + 0.8} L${STAMPS.lens.cx + 3} ${STAMPS.lens.cy + 3}`}
                stroke={inks.lens}
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              {/* The stamp printed on each lap. */}
              <G className="nwb-new-stamp">
                <G
                  transform={`rotate(${STAMPS.rocket.rotate} ${STAMPS.rocket.cx} ${STAMPS.rocket.cy})`}
                >
                  <Rect
                    x={STAMPS.rocket.cx - STAMPS.rocket.w / 2}
                    y={STAMPS.rocket.cy - STAMPS.rocket.h / 2}
                    width={STAMPS.rocket.w}
                    height={STAMPS.rocket.h}
                    rx="1.2"
                    fill="none"
                    stroke={inks.rocket}
                    strokeWidth="1.3"
                  />
                  <G
                    transform={`translate(${STAMPS.rocket.cx} ${STAMPS.rocket.cy}) rotate(35)`}
                  >
                    <Path
                      d="M0 -5.4 C2.6 -3 2.7 0.6 1.9 3 H-1.9 C-2.7 0.6 -2.6 -3 0 -5.4 Z"
                      fill={inks.rocket}
                    />
                    <Path
                      d="M-1.9 1 L-3.6 3.8 L-1.6 3 Z M1.9 1 L3.6 3.8 L1.6 3 Z"
                      fill={inks.rocket}
                    />
                    <Circle cx="0" cy="-1.6" r="0.95" fill={page[0]} />
                    {detailed && (
                      <Path
                        d="M-1 3.4 L0 5.8 L1 3.4"
                        fill="none"
                        stroke={inks.rocket}
                        strokeWidth="0.8"
                        strokeLinejoin="round"
                      />
                    )}
                  </G>
                </G>
              </G>
            </G>

            {/* Ink thrown off the stamp as it lands. */}
            {detailed && (
              <G className="nwb-splash">
                {[
                  [-12, -6, 0.9],
                  [12, -7, 0.7],
                  [14, 4, 0.8],
                  [-11, 6, 0.7],
                  [2, -9, 0.6],
                ].map(([dx, dy, r]) => (
                  <Circle
                    key={`${dx}-${dy}`}
                    cx={STAMPS.rocket.cx + dx}
                    cy={STAMPS.rocket.cy + dy}
                    r={r}
                    fill={inks.rocket}
                  />
                ))}
              </G>
            )}

            {/* ── The left half: inside cover and the ID page, which widens
                out from the spine as the passport opens. ── */}
            <G className="nwb-left-page">
              <Rect
                x={COVER_L.x}
                y={COVER_L.y}
                width={COVER_L.w}
                height={COVER_L.h}
                rx="4"
                fill={`url(#${id("leather")})`}
                stroke={leatherEdge}
                strokeWidth="1"
              />
              <Rect
                x={PAGE_L.x}
                y={PAGE_L.y}
                width={PAGE_L.w}
                height={PAGE_L.h}
                rx="1.5"
                fill={`url(#${id("page")})`}
              />
              {securityPrint("page-l")}
              <Rect
                x={SPINE_X - 6}
                y={PAGE_L.y}
                width="6"
                height={PAGE_L.h}
                fill={`url(#${id("fold-l")})`}
              />
              <Rect
                x={PORTRAIT.x}
                y={PORTRAIT.y}
                width={PORTRAIT.w}
                height={PORTRAIT.h}
                rx="1"
                fill={muted ? GREY.light : "#DCE6F2"}
                stroke={ink}
                strokeOpacity="0.5"
                strokeWidth="0.6"
              />
              <Circle
                cx={PORTRAIT.x + PORTRAIT.w / 2}
                cy={PORTRAIT.y + 5}
                r="2.6"
                fill={muted ? GREY.soft : "#5A6E8C"}
              />
              <Path
                d={`M${PORTRAIT.x + 1.5} ${PORTRAIT.y + PORTRAIT.h} C${PORTRAIT.x + 2} ${PORTRAIT.y + 9} ${PORTRAIT.x + 9} ${PORTRAIT.y + 9} ${PORTRAIT.x + 9.5} ${PORTRAIT.y + PORTRAIT.h} Z`}
                fill={muted ? GREY.soft : "#5A6E8C"}
              />
              {detailed &&
                ID_LINES.map((l) => (
                  <Path
                    key={l.y}
                    d={`M37 ${l.y} H${37 + l.w}`}
                    stroke={ink}
                    strokeOpacity="0.55"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                ))}
              {detailed &&
                MRZ_Y.map((y) => (
                  <Path
                    key={y}
                    d={`M22 ${y} H55`}
                    stroke={ink}
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="1.4 0.9"
                  />
                ))}
              <G opacity="0.88">
                <Ellipse
                  cx={STAMPS.moon.cx}
                  cy={STAMPS.moon.cy}
                  rx={STAMPS.moon.rx}
                  ry={STAMPS.moon.ry}
                  fill="none"
                  stroke={inks.moon}
                  strokeWidth="1.3"
                  transform={`rotate(-12 ${STAMPS.moon.cx} ${STAMPS.moon.cy})`}
                />
                <Path
                  d={`M${STAMPS.moon.cx - 0.8} ${STAMPS.moon.cy - 3.2} A3.4 3.4 0 1 0 ${STAMPS.moon.cx + 2.2} ${STAMPS.moon.cy + 2} A2.7 2.7 0 1 1 ${STAMPS.moon.cx - 0.8} ${STAMPS.moon.cy - 3.2} Z`}
                  fill={inks.moon}
                />
                <G
                  transform={`rotate(${STAMPS.heart.rotate} ${STAMPS.heart.cx} ${STAMPS.heart.cy})`}
                >
                  <Rect
                    x={STAMPS.heart.cx - STAMPS.heart.s / 2}
                    y={STAMPS.heart.cy - STAMPS.heart.s / 2}
                    width={STAMPS.heart.s}
                    height={STAMPS.heart.s}
                    rx="2"
                    fill="none"
                    stroke={inks.heart}
                    strokeWidth="1.2"
                  />
                  <Path
                    d={`M${STAMPS.heart.cx} ${STAMPS.heart.cy + 3} C${STAMPS.heart.cx - 3.6} ${STAMPS.heart.cy + 0.6} ${STAMPS.heart.cx - 3.8} ${STAMPS.heart.cy - 2} ${STAMPS.heart.cx - 2.4} ${STAMPS.heart.cy - 2.8} C${STAMPS.heart.cx - 1.4} ${STAMPS.heart.cy - 3.4} ${STAMPS.heart.cx - 0.4} ${STAMPS.heart.cy - 2.8} ${STAMPS.heart.cx} ${STAMPS.heart.cy - 1.8} C${STAMPS.heart.cx + 0.4} ${STAMPS.heart.cy - 2.8} ${STAMPS.heart.cx + 1.4} ${STAMPS.heart.cy - 3.4} ${STAMPS.heart.cx + 2.4} ${STAMPS.heart.cy - 2.8} C${STAMPS.heart.cx + 3.8} ${STAMPS.heart.cy - 2} ${STAMPS.heart.cx + 3.6} ${STAMPS.heart.cy + 0.6} ${STAMPS.heart.cx} ${STAMPS.heart.cy + 3} Z`}
                    fill={inks.heart}
                  />
                </G>
              </G>
            </G>

            {/* ── The front cover, over the right page when closed, which
                narrows to the spine as the passport opens. ── */}
            <G className="nwb-cover">
              <Rect
                x={COVER_R.x}
                y={COVER_R.y}
                width={COVER_R.w}
                height={COVER_R.h}
                rx="4"
                fill={`url(#${id("leather")})`}
                stroke={leatherEdge}
                strokeWidth="1"
              />
              {detailed && (
                <Rect
                  x={COVER_R.x + 3}
                  y={COVER_R.y + 3}
                  width={COVER_R.w - 6}
                  height={COVER_R.h - 6}
                  rx="2.5"
                  fill="none"
                  stroke={`url(#${id("gold")})`}
                  strokeOpacity="0.8"
                  strokeWidth="0.7"
                  strokeDasharray="1.6 1.2"
                />
              )}
              {STARS.map((s, i) => (
                <G key={s.x} transform={`translate(${s.x} ${s.y})`}>
                  {/* Each twinkles in turn, left to right. */}
                  <G className={`nwb-star-${i + 1}`}>
                    <Path d={STAR} fill={`url(#${id("gold")})`} />
                  </G>
                </G>
              ))}
              {logoHref ? (
                <Rect
                  x={MONOGRAM.x}
                  y={MONOGRAM.y}
                  width={MONOGRAM.size}
                  height={MONOGRAM.size}
                  fill={`url(#${id("gold")})`}
                  mask={`url(#${id("monogram")})`}
                />
              ) : (
                <Circle
                  cx={MONOGRAM.x + MONOGRAM.size / 2}
                  cy={MONOGRAM.y + MONOGRAM.size / 2}
                  r="8"
                  fill="none"
                  stroke={`url(#${id("gold")})`}
                  strokeWidth="1.4"
                />
              )}
              <Rect
                x="70"
                y="87"
                width="22"
                height="1.6"
                rx="0.8"
                fill={`url(#${id("gold")})`}
              />
              {detailed && (
                <Rect
                  x="74"
                  y="91"
                  width="14"
                  height="1.2"
                  rx="0.6"
                  fill={`url(#${id("gold")})`}
                  fillOpacity="0.8"
                />
              )}
            </G>
          </G>
        </G>
      </G>

      {/* The paper plane's dashed route in from the lower left; fades while
          the plane is away. */}
      <G className="nwb-route">
        <Path
          d={`M12 90 C8 76 20 70 14 62 C10 56 14 50 ${PLANE.x - 5} ${PLANE.y + 4}`}
          fill="none"
          stroke={muted ? GREY.light : "#E9F5EF"}
          strokeOpacity="0.75"
          strokeWidth="1"
          strokeDasharray="2 2"
          strokeLinecap="round"
        />
      </G>
      {/* The paper plane: flies off as the passport opens, glides back in as
          it closes. */}
      <G transform={`translate(${PLANE.x} ${PLANE.y})`}>
        <G className="nwb-plane">
          <G transform="rotate(-28)">
            <Path
              d="M7 0 L-6 -5 L-3 0 L-6 5 Z"
              fill={muted ? GREY.pale : "#FFFFFF"}
              stroke={keyline}
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <Path
              d="M7 0 L-3 0 L-4.4 2.6 Z"
              fill={muted ? GREY.light : "#CFE3EC"}
              stroke={keyline}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          </G>
        </G>
      </G>

      {/* Gold sparkles, twinkling in turn. */}
      {detailed &&
        SPARKLES.map((s, i) => (
          <G key={s.x} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
            <G className={`nwb-sparkle-${i + 1}`}>
              <Path d={SPARKLE} fill={`url(#${id("gold")})`} />
            </G>
          </G>
        ))}

      {/* The rubber stamp, hovering. Upright, not tilted with the booklet:
          it is held, not printed. */}
      <G className="nwb-rubber">
        <Ellipse
          cx={RUBBER.x}
          cy={RUBBER.y - 20}
          rx="5.4"
          ry="5"
          fill={`url(#${id("wood")})`}
          stroke={muted ? GREY.deep : "#3A2210"}
          strokeWidth="0.8"
        />
        <Path
          d={`M${RUBBER.x - 2.4} ${RUBBER.y - 16} H${RUBBER.x + 2.4} L${RUBBER.x + 3.4} ${RUBBER.y - 6} H${RUBBER.x - 3.4} Z`}
          fill={`url(#${id("wood")})`}
          stroke={muted ? GREY.deep : "#3A2210"}
          strokeWidth="0.8"
        />
        <Rect
          x={RUBBER.x - 9}
          y={RUBBER.y - 6.5}
          width="18"
          height="5"
          rx="1.2"
          fill={muted ? GREY.mid : "#2A2030"}
        />
        {detailed && (
          <Rect
            x={RUBBER.x - 9}
            y={RUBBER.y - 6.5}
            width="18"
            height="1.6"
            rx="0.8"
            fill={gold[0]}
            fillOpacity="0.7"
          />
        )}
        <Rect
          x={RUBBER.x - 8}
          y={RUBBER.y - 1.5}
          width="16"
          height="2.4"
          rx="0.6"
          fill={muted ? GREY.soft : "#D8433A"}
        />
      </G>
    </>
  );
};
