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
 * A herald's fanfare: five invitations out of the bell, five novelists in.
 *
 * The badge is for bringing five new novelists to Novelist World — the one
 * that grows the place — so it is drawn as the grandest crest on the shelf. A
 * long brass trumpet runs corner to corner over a turning sunburst, an azure
 * banner with a fringed swallowtail and an embroidered star-and-quill hangs
 * from it, and a tasselled cord swings below. On each fanfare the trumpet
 * kicks, sound rings and confetti burst off the bell, and five sealed
 * invitations fly out in a fan — each one turning into a star where it lands:
 * an invitation accepted, a novelist arrived. A still crest shows the five
 * stars. Brass, azure, gold.
 */

/**
 * The trumpet, drawn along +x from the mouthpiece at the origin, then laid on
 * the diagonal. The banner and tassel hang from it in the crest's own
 * coordinates, so they fall straight down rather than tilting with the brass.
 */
const TRUMPET = { angle: -24, x: 9, y: 80 };
const MOUTHPIECE = "M-1 -3.4 C2 -3.4 3 -1.6 5 -1.6 V1.6 C3 1.6 2 3.4 -1 3.4 Z";
const TUBE = { h: 4.4, w: 60, x: 4, y: -2.2 };
const BELL = "M58 -2.6 C70 -3 78 -8 84 -14 V14 C78 8 70 3 58 2.6 Z";
const BELL_SHINE = "M62 -2.4 C71 -3.4 77 -7.4 81.6 -11.6";
const BELL_RIM = { cx: 84, cy: 0, rx: 2.6, ry: 14 };
/** Engraved collars on the tube. */
const BANDS = [18, 44];

/** Where the trumpet's line passes, for hanging things off it. */
const onTrumpet = (x: number) => {
  const rad = (TRUMPET.angle * Math.PI) / 180;
  return {
    x: TRUMPET.x + Math.cos(rad) * x,
    y: TRUMPET.y + Math.sin(rad) * x,
  };
};
const HANG_L = onTrumpet(24);
const HANG_R = onTrumpet(50);
const DROP = 27;
const NOTCH = 9;
const FOOT_L = { x: HANG_L.x, y: HANG_L.y + DROP };
const FOOT_R = { x: HANG_R.x, y: HANG_R.y + DROP };
const NOTCH_PT = {
  x: (HANG_L.x + HANG_R.x) / 2,
  y: (HANG_L.y + HANG_R.y) / 2 + DROP - NOTCH,
};

/** The banner: top along the trumpet, sides straight down, swallowtail foot. */
const BANNER = `M${HANG_L.x} ${HANG_L.y} L${HANG_R.x} ${HANG_R.y} L${FOOT_R.x} ${FOOT_R.y} L${NOTCH_PT.x} ${NOTCH_PT.y} L${FOOT_L.x} ${FOOT_L.y} Z`;
/** The embroidery: star and quill, a little above the middle. */
const EMBLEM = {
  x: (HANG_L.x + HANG_R.x) / 2,
  y: (HANG_L.y + HANG_R.y) / 2 + 12,
};
/** Folds in the cloth, as vertical bands. */
const FOLDS = [36.5, 48.5];

/** Fringe threads along both edges of the swallowtail. */
const fringe = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): string => {
  const steps = 8;
  let d = "";
  for (let i = 1; i < steps; i++) {
    const x = a.x + ((b.x - a.x) * i) / steps;
    const y = a.y + ((b.y - a.y) * i) / steps;
    d += `M${x.toFixed(2)} ${y.toFixed(2)} v2.6 `;
  }
  return d;
};
const FRINGE = fringe(FOOT_L, NOTCH_PT) + fringe(NOTCH_PT, FOOT_R);

/** The tasselled cord, from near the mouthpiece. */
const TASSEL_TOP = onTrumpet(10);
const CORD = `M${TASSEL_TOP.x} ${TASSEL_TOP.y} C${TASSEL_TOP.x - 2.4} ${TASSEL_TOP.y + 6} ${TASSEL_TOP.x + 1.6} ${TASSEL_TOP.y + 10} ${TASSEL_TOP.x} ${TASSEL_TOP.y + 14}`;
const KNOT = { x: TASSEL_TOP.x, y: TASSEL_TOP.y + 15.4 };
const STRANDS = [-2.4, -0.8, 0.8, 2.4]
  .map(
    (dx) => `M${KNOT.x + dx * 0.5} ${KNOT.y + 1} L${KNOT.x + dx} ${KNOT.y + 8}`,
  )
  .join(" ");

/** A five-point star about (x, y). */
const fivePoint = (x: number, y: number, r: number): string => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rad = ((i * 36 - 90) * Math.PI) / 180;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${(x + Math.cos(rad) * rr).toFixed(2)} ${(y + Math.sin(rad) * rr).toFixed(2)}`;
  });
  return `M${pts.join(" L")} Z`;
};

/** The sunburst behind it all: sixteen rays from the crest's centre. */
const RAYS = Array.from({ length: 16 }, (_, i) => {
  const a = ((i * 360) / 16) * (Math.PI / 180);
  const w = (3.4 * Math.PI) / 180;
  const r = 56;
  return `M60 60 L${(60 + Math.cos(a - w) * r).toFixed(2)} ${(60 + Math.sin(a - w) * r).toFixed(2)} L${(60 + Math.cos(a + w) * r).toFixed(2)} ${(60 + Math.sin(a + w) * r).toFixed(2)} Z`;
});

/**
 * The five invited, fanned out of the bell: each sits `REACH` past the bell's
 * mouth on its own bearing off the trumpet's axis.
 */
const FAN = [-50, -25, 0, 25, 50];
const REACH = 17;
const LANDING = { x: BELL_RIM.cx + REACH, y: BELL_RIM.cy };

/** Confetti off the bell: bearing and colour index. */
const CONFETTI = [
  [-72, 0],
  [-46, 1],
  [-20, 2],
  [6, 3],
  [32, 0],
  [58, 1],
  [-60, 2],
  [44, 3],
];

/** Rings of sound, as arcs about the bell's mouth. */
const RINGS = [8, 14, 20];
const arc = (r: number) => {
  const a = (50 * Math.PI) / 180;
  return `M${BELL_RIM.cx + Math.cos(a) * r} ${-Math.sin(a) * r} A${r} ${r} 0 0 1 ${BELL_RIM.cx + Math.cos(a) * r} ${Math.sin(a) * r}`;
};

export const AmbassadorBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const brass = muted ? [GREY.pale, GREY.soft] : ["#FFE6A0", "#B07E2C"];
  const edge = muted ? GREY.deep : "#6B4515";
  const banner = muted ? [GREY.soft, GREY.deep] : ["#3D8BEA", "#1B4C9E"];
  const trim = muted ? GREY.pale : "#F2CF6A";
  const star = muted ? GREY.pale : "#FFE27A";
  const ring = muted ? GREY.light : "#FFF1C4";
  const paper = muted ? GREY.pale : "#FFF8EA";
  const seal = muted ? GREY.soft : "#D8433A";
  const confetti = muted
    ? [GREY.pale, GREY.light, GREY.pale, GREY.light]
    : ["#3D8BEA", "#FFE27A", "#FF86B6", "#6EE7B7"];

  return (
    <>
      <Defs>
        <ClipPath id={id("tube")}>
          <Rect x={TUBE.x} y={TUBE.y} width={TUBE.w} height={TUBE.h} rx="2" />
        </ClipPath>
        <ClipPath id={id("cloth")}>
          <Path d={BANNER} />
        </ClipPath>
        <LinearGradient id={id("brass")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={brass[0]} />
          <Stop offset="100%" stopColor={brass[1]} />
        </LinearGradient>
        <LinearGradient id={id("banner")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={banner[0]} />
          <Stop offset="100%" stopColor={banner[1]} />
        </LinearGradient>
        <RadialGradient id={id("bell")} cx="70%" cy="50%" r="70%">
          <Stop offset="0%" stopColor={brass[1]} />
          <Stop offset="100%" stopColor={edge} />
        </RadialGradient>
        {/* In the crest's own units, so the rays fade out towards their tips
            whichever way they have turned. */}
        <RadialGradient
          id={id("rays")}
          cx="60"
          cy="60"
          r="56"
          gradientUnits="userSpaceOnUse"
        >
          <Stop
            offset="15%"
            stopColor={trim}
            stopOpacity={muted ? 0.1 : 0.32}
          />
          <Stop offset="100%" stopColor={trim} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={id("glint")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFF" stopOpacity="0" />
          <Stop offset="50%" stopColor="#FFF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#2E7BE0"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#2E7BE0"}
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

      {/* The sunburst, turning slowly behind everything. */}
      {detailed && (
        <G className="nwb-rays">
          {RAYS.map((d) => (
            <Path key={d} d={d} fill={`url(#${id("rays")})`} />
          ))}
        </G>
      )}

      {/* The tasselled cord, swinging from where it is tied. */}
      {detailed && (
        <G className="nwb-tassel">
          <Path
            d={CORD}
            fill="none"
            stroke={trim}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <Path
            d={STRANDS}
            stroke={trim}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <Circle
            cx={KNOT.x}
            cy={KNOT.y}
            r="2"
            fill={`url(#${id("brass")})`}
            stroke={edge}
            strokeWidth="0.6"
          />
        </G>
      )}

      {/* The banner, hanging straight down, rippling from the top. */}
      <G className="nwb-banner">
        <Path
          d={BANNER}
          fill={`url(#${id("banner")})`}
          stroke={muted ? GREY.deep : "#123A7A"}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {detailed && (
          <>
            <G clipPath={`url(#${id("cloth")})`}>
              {FOLDS.map((x) => (
                <G key={x}>
                  <Rect
                    x={x}
                    y="50"
                    width="2.6"
                    height="52"
                    fill="#000"
                    fillOpacity={muted ? 0.1 : 0.18}
                  />
                  <Rect
                    x={x + 2.6}
                    y="50"
                    width="1.4"
                    height="52"
                    fill="#FFF"
                    fillOpacity={muted ? 0.06 : 0.14}
                  />
                </G>
              ))}
            </G>
            {/* Embroidered border, inset. */}
            <Path
              d={BANNER}
              fill="none"
              stroke={trim}
              strokeWidth="0.9"
              strokeDasharray="2.2 1.2"
              strokeLinejoin="round"
              transform={`translate(${EMBLEM.x} ${EMBLEM.y - 6}) scale(0.82) translate(${-EMBLEM.x} ${-(EMBLEM.y - 6)})`}
            />
            <Path
              d={FRINGE}
              stroke={trim}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            {/* A quill behind the star. */}
            <Path
              d={`M${EMBLEM.x - 7} ${EMBLEM.y + 7} L${EMBLEM.x + 7.5} ${EMBLEM.y - 8}`}
              stroke={paper}
              strokeWidth="1"
              strokeLinecap="round"
            />
            <Path
              d={`M${EMBLEM.x + 7.5} ${EMBLEM.y - 8} C${EMBLEM.x + 3} ${EMBLEM.y - 7} ${EMBLEM.x} ${EMBLEM.y - 3} ${EMBLEM.x - 1.5} ${EMBLEM.y + 0.5} C${EMBLEM.x + 2.5} ${EMBLEM.y - 1} ${EMBLEM.x + 6} ${EMBLEM.y - 4} ${EMBLEM.x + 7.5} ${EMBLEM.y - 8} Z`}
              fill={paper}
              fillOpacity="0.9"
            />
          </>
        )}
        <Path d={fivePoint(EMBLEM.x, EMBLEM.y, 6.2)} fill={star} />
      </G>

      {/* The trumpet, laid on the diagonal; the inner group kicks on each
          blast, about the mouthpiece. */}
      <G
        transform={`translate(${TRUMPET.x} ${TRUMPET.y}) rotate(${TRUMPET.angle})`}
      >
        <G className="nwb-trumpet">
          <Rect
            x={TUBE.x}
            y={TUBE.y}
            width={TUBE.w}
            height={TUBE.h}
            rx="2"
            fill={`url(#${id("brass")})`}
            stroke={edge}
            strokeWidth="0.8"
          />
          {detailed && (
            <G clipPath={`url(#${id("tube")})`}>
              <Path
                d={`M${TUBE.x + 2} -1 H${TUBE.x + TUBE.w - 2}`}
                stroke="#FFF"
                strokeOpacity={muted ? 0.25 : 0.6}
                strokeWidth="0.8"
              />
              {/* A glint running down the tube after each blast; rests off
                  its left end. */}
              <G className="nwb-tube-glint">
                <Path
                  d="M-16 -4 L-9 -4 L-12 4 L-19 4 Z"
                  fill={`url(#${id("glint")})`}
                />
              </G>
            </G>
          )}
          <Path
            d={BELL}
            fill={`url(#${id("brass")})`}
            stroke={edge}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {detailed && (
            <Path
              d={BELL_SHINE}
              fill="none"
              stroke="#FFF"
              strokeOpacity={muted ? 0.3 : 0.7}
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          )}
          <Ellipse
            cx={BELL_RIM.cx}
            cy={BELL_RIM.cy}
            rx={BELL_RIM.rx}
            ry={BELL_RIM.ry}
            fill={`url(#${id("bell")})`}
            stroke={edge}
            strokeWidth="0.9"
          />
          {/* Beads round the bell's rim. */}
          {detailed &&
            [-11, -6.5, -2, 2.5, 7, 11.5].map((y) => (
              <Circle
                key={y}
                cx={BELL_RIM.cx + 2.2}
                cy={y}
                r="0.8"
                fill={trim}
              />
            ))}
          {BANDS.map((x) => (
            <G key={x}>
              <Rect
                x={x}
                y="-3.2"
                width="3"
                height="6.4"
                rx="1"
                fill={`url(#${id("brass")})`}
                stroke={edge}
                strokeWidth="0.7"
              />
              {detailed && (
                <Path
                  d={`M${x + 1.5} -2.6 V2.6`}
                  stroke={edge}
                  strokeOpacity="0.6"
                  strokeWidth="0.5"
                />
              )}
            </G>
          ))}
          <Path
            d={MOUTHPIECE}
            fill={`url(#${id("brass")})`}
            stroke={edge}
            strokeWidth="0.8"
          />

          {/* Rings of sound off the bell. Hidden when still: a frozen ring
              is just a bracket. */}
          {detailed &&
            RINGS.map((r, i) => (
              <Path
                key={r}
                className={`nwb-blast-${i + 1}`}
                d={arc(r)}
                fill="none"
                stroke={ring}
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            ))}

          {/* Confetti off the bell, each piece on its own bearing. Hidden
              when still. */}
          {detailed &&
            CONFETTI.map(([deg, c], i) => (
              <G
                key={deg}
                transform={`rotate(${deg} ${BELL_RIM.cx} ${BELL_RIM.cy})`}
              >
                <G className={`nwb-confetti-${(i % 4) + 1}`}>
                  <Rect
                    x={BELL_RIM.cx + 4}
                    y="-0.7"
                    width={i % 2 ? 2.6 : 1.8}
                    height="1.4"
                    rx="0.4"
                    fill={confetti[c]}
                  />
                </G>
              </G>
            ))}

          {/* The five: each flies out of the bell on its own bearing as a
              sealed invitation, and turns into a star where it lands. Still,
              only the stars show. */}
          {detailed &&
            FAN.map((deg, i) => {
              const upright = `rotate(${-deg - TRUMPET.angle} ${LANDING.x} ${LANDING.y})`;
              return (
                <G
                  key={deg}
                  transform={`rotate(${deg} ${BELL_RIM.cx} ${BELL_RIM.cy})`}
                >
                  <G className={`nwb-herald-${i + 1}`}>
                    <G className={`nwb-invite-${i + 1}`}>
                      <G transform={upright}>
                        <Rect
                          x={LANDING.x - 3.8}
                          y={LANDING.y - 2.6}
                          width="7.6"
                          height="5.2"
                          rx="0.6"
                          fill={paper}
                          stroke={edge}
                          strokeWidth="0.5"
                        />
                        <Path
                          d={`M${LANDING.x - 3.6} ${LANDING.y - 2.3} L${LANDING.x} ${LANDING.y + 0.6} L${LANDING.x + 3.6} ${LANDING.y - 2.3}`}
                          fill="none"
                          stroke={edge}
                          strokeWidth="0.5"
                        />
                        <Circle
                          cx={LANDING.x}
                          cy={LANDING.y + 0.6}
                          r="1"
                          fill={seal}
                        />
                      </G>
                    </G>
                    <G className={`nwb-joined-${i + 1}`}>
                      <Path
                        d={fivePoint(LANDING.x, LANDING.y, i === 2 ? 3.8 : 3.2)}
                        fill={star}
                        transform={upright}
                      />
                    </G>
                  </G>
                </G>
              );
            })}
        </G>
      </G>

      {/* Rings where the banner hangs from the brass. */}
      {detailed &&
        [HANG_L, HANG_R, TASSEL_TOP].map((p) => (
          <Circle
            key={p.x}
            cx={p.x}
            cy={p.y}
            r="1.8"
            fill="none"
            stroke={trim}
            strokeWidth="1.1"
          />
        ))}
    </>
  );
};
