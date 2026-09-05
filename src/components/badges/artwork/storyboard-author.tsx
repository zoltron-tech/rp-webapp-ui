"use client";

import type { FC } from "react";
import {
  type BadgeArtworkProps,
  BadgeSvg,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "./frame";

/**
 * A wax seal on two ribbons: the mark pressed into a finished manuscript.
 *
 * Round and lobed rather than a plate — a storyboard is a document, and a
 * document is sealed, not minted. Nothing here is shared with the guild sigil
 * beyond the box it is drawn in.
 */

/**
 * The wax blob, as a radius that wobbles around the circle.
 *
 * Sampled rather than drawn by hand: a seal's edge is a smooth periodic
 * deformation, and thirteen lobes at ninety-six samples reads as poured wax
 * where a hand-placed scallop reads as a gear.
 */
const sealPath = (radius: number, lobes: number, amplitude: number): string => {
  const samples = 96;
  const points: string[] = [];
  for (let i = 0; i < samples; i += 1) {
    const theta = (i / samples) * Math.PI * 2;
    const r = radius + amplitude * Math.cos(lobes * theta);
    const x = 60 + r * Math.cos(theta);
    const y = SEAL_CY + r * Math.sin(theta);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join(" ")} Z`;
};

/**
 * The seal sits high in the box, because the ribbons need somewhere to hang.
 * Centred, the wax reached y≈110 and the tails were two dark points poking out
 * from under it.
 */
const SEAL_CY = 54;

const SEAL = sealPath(42, 13, 2.4);
const SEAL_INNER = sealPath(34, 13, 1.4);

/** Ribbon tails, hanging from behind the seal with fishtail ends. */
const RIBBON_LEFT = "M50 78 L34 118 L44 111 L52.5 118 L61 84 Z";
const RIBBON_RIGHT = "M70 78 L86 118 L76 111 L67.5 118 L59 84 Z";

/** An open book on a 24×24 grid, pressed into the wax. */
const PAGE_LEFT =
  "M12 6.6 C9.9 4.9 6.9 4.25 3.5 4.45 L3.5 17.9 C6.9 17.7 9.9 18.35 12 20.05 Z";
const PAGE_RIGHT =
  "M12 6.6 C14.1 4.9 17.1 4.25 20.5 4.45 L20.5 17.9 C17.1 17.7 14.1 18.35 12 20.05 Z";
const SPINE = "M12 6.6 L12 20.05";

/**
 * Written lines. The left page is full and the right one trails off — the
 * story is still being written, which is the point of the badge.
 */
const LEFT_LINES = ["M5.6 9 H9.7", "M5.4 11.6 H9.7", "M5.6 14.2 H9.7"];
const RIGHT_LINES = ["M14.3 9 H18.5", "M14.3 11.6 H17.9"];

/** The line being written right now, which the nib runs along. */
const ACTIVE_LINE = "M14.3 14.2 H16.6";

/** Gold flecks caught in the wax. Inside the seal, so they replace an orbit. */
const FLECKS = [
  { cx: 42, cy: 40, r: 1.4 },
  { cx: 80, cy: 46, r: 1.1 },
  { cx: 47, cy: 74, r: 1.2 },
];

export const StoryboardAuthorBadge: FC<BadgeArtworkProps> = ({
  size,
  animated,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const wax = muted
    ? [GREY.soft, GREY.mid, GREY.deep]
    : ["#E0605C", "#B32E38", "#5E121F"];
  const ribbon = muted ? [GREY.mid, GREY.deep] : ["#8E1F2C", "#530F1A"];
  const gold = muted ? GREY.light : "#F0C463";
  const goldBright = muted ? GREY.pale : "#FFE7A8";
  const page = muted ? GREY.pale : "#FFF3DC";
  const ink = muted ? GREY.ink : "#7A2230";

  return (
    <BadgeSvg size={size} animated={animated}>
      <defs>
        <radialGradient id={id("wax")} cx="36%" cy="30%" r="76%">
          <stop offset="0%" stopColor={wax[0]} />
          <stop offset="52%" stopColor={wax[1]} />
          <stop offset="100%" stopColor={wax[2]} />
        </radialGradient>

        <linearGradient id={id("ribbon")} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={ribbon[0]} />
          <stop offset="100%" stopColor={ribbon[1]} />
        </linearGradient>

        <radialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#C33A44"}
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#C33A44"}
            stopOpacity="0"
          />
        </radialGradient>

        <clipPath id={id("clip")}>
          <path d={SEAL} />
        </clipPath>

        {/* Inside the emblem's ×1.5 group, so the blur is in local units. */}
        <filter id={id("glow")} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        className="nwb-aura"
        cx="60"
        cy={SEAL_CY}
        r="48"
        fill={`url(#${id("aura")})`}
      />

      {/* Ribbons first, so the seal sits on top of where they meet. Each sways
          from its own top edge rather than from the middle of the badge. */}
      {detailed && (
        <>
          <path
            className="nwb-ribbon-l"
            d={RIBBON_LEFT}
            fill={`url(#${id("ribbon")})`}
          />
          <path
            className="nwb-ribbon-r"
            d={RIBBON_RIGHT}
            fill={`url(#${id("ribbon")})`}
          />
        </>
      )}

      {/* The wax. It breathes, so the seal reads as something pressed into a
          living document rather than as a sticker. */}
      <g className="nwb-seal">
        <path
          d={SEAL}
          fill={`url(#${id("wax")})`}
          stroke={gold}
          strokeOpacity={muted ? 0.4 : 0.55}
          strokeWidth="1.4"
        />
        <path
          d={SEAL_INNER}
          fill="none"
          stroke={gold}
          strokeOpacity={muted ? 0.25 : 0.5}
          strokeWidth="1.1"
        />
      </g>

      {/* The crescent of light a pressed seal keeps along its upper edge. */}
      <g clipPath={`url(#${id("clip")})`}>
        {/* The rotation lives on an inner group: an SVG element's `transform`
            attribute and its animated CSS transform are one property, so
            animating this ellipse directly would throw its tilt away. */}
        <g className="nwb-gloss">
          <ellipse
            cx="46"
            cy="34"
            rx="27"
            ry="18"
            transform="rotate(-28 46 34)"
            fill="#FFFFFF"
            fillOpacity={muted ? 0.05 : 0.14}
          />
        </g>
      </g>

      {/* The book, pressed into the wax: 24-grid scaled to 36px about the
          seal's own centre rather than the box's.

          The right page and everything written on it are one group, because
          that group turns: it collapses to the spine and opens again onto a
          fresh page, which is the badge's main piece of motion. The nib rides
          inside it so it turns with the paper instead of hanging in the air —
          which is also why its travel and radius are in the emblem's local
          units rather than the plate's. */}
      <g className="nwb-emblem">
        <g transform="translate(42 34) scale(1.5)">
          <path d={PAGE_LEFT} fill={page} fillOpacity={muted ? 0.5 : 0.95} />
          <g
            stroke={ink}
            strokeOpacity={muted ? 0.45 : 0.6}
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
          >
            {LEFT_LINES.map((line) => (
              <path key={line} d={line} />
            ))}
          </g>

          <g className="nwb-page">
            <path d={PAGE_RIGHT} fill={page} fillOpacity={muted ? 0.5 : 0.95} />
            <g
              stroke={ink}
              strokeOpacity={muted ? 0.45 : 0.6}
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
            >
              {[...RIGHT_LINES, ACTIVE_LINE].map((line) => (
                <path key={line} d={line} />
              ))}
            </g>
            {detailed && (
              <g className="nwb-write" filter={`url(#${id("glow")})`}>
                <circle cx="16.6" cy="14.2" r="1.15" fill={goldBright} />
              </g>
            )}
          </g>

          <path
            d={SPINE}
            stroke={ink}
            strokeOpacity={muted ? 0.4 : 0.5}
            strokeWidth="0.8"
            fill="none"
          />
        </g>
      </g>

      {/* Gold caught in the wax, in place of anything orbiting outside it. */}
      {detailed && (
        <g clipPath={`url(#${id("clip")})`}>
          {FLECKS.map((fleck, index) => (
            <circle
              key={`${fleck.cx}-${fleck.cy}`}
              className={`nwb-spark-${index + 1}`}
              cx={fleck.cx}
              cy={fleck.cy}
              r={fleck.r}
              fill={goldBright}
            />
          ))}
        </g>
      )}
    </BadgeSvg>
  );
};
