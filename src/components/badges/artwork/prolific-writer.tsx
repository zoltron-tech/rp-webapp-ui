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
 * An open book with a quill working across it, throwing sparks as it goes.
 *
 * Storyboard Author is also a book — but pressed into wax, closed, crimson, and
 * *finished*. This one is the opposite state of the same object: open, lit and
 * mid-sentence, in ink blue. The two never collide, because that badge is a
 * round seal and this one is a wide flat spread with a feather across it.
 */

/** The spread: both leaves meet at the spine, which sits low and centre. */
const PAGE_LEFT =
  "M60 64 C49 55.5 31 53 17 55.5 L17 88 C31 85.5 49 88 60 95.5 Z";
const PAGE_RIGHT =
  "M60 64 C71 55.5 89 53 103 55.5 L103 88 C89 85.5 71 88 60 95.5 Z";

/** The board under each leaf, showing as a lip along the outside edge. */
const COVER_LEFT = "M60 67 C49 58.5 30 56 15 59 L15 92 C30 89 49 91.5 60 99 Z";
const COVER_RIGHT =
  "M60 67 C71 58.5 90 56 105 59 L105 92 C90 89 71 91.5 60 99 Z";

/** Lines already written. The left leaf is full; the right is being filled. */
const LEFT_LINES = [
  { from: 25, to: 52, y: 68 },
  { from: 23, to: 52, y: 75 },
  { from: 24, to: 50, y: 82 },
];
const RIGHT_LINES = [
  { from: 66, to: 94, y: 68 },
  { from: 66, to: 91, y: 75 },
];

/** The line under the nib right now, which the quill draws as it crosses. */
const ACTIVE_LINE = { from: 64, y: 82 };
const ACTIVE_RUN = 20;

/**
 * How big the feather is drawn.
 *
 * Sized so the tip of the plume is still inside the view box at the far end of
 * the write: the frame lets its SVG overflow, so a quill that fits at rest and
 * not mid-stroke would reach over the neighbouring card instead of being
 * clipped. Nib plus run plus reach must stay under 120.
 */
const QUILL_SCALE = 0.82;

/**
 * The quill, drawn with its nib at the origin so the whole feather can be
 * placed — and moved — by the nib alone. Shaft up and to the right, with the
 * plume hanging off its upper half.
 */
const QUILL_SHAFT = "M0 0 L27 -54";
const QUILL_PLUME =
  "M29 -58 C41 -45 37 -25 23 -11 C17 -5 10 -3.5 6.5 -7 C7 -24 13.5 -44 29 -58 Z";
const QUILL_BARBS = [
  "M13 -20 L21 -16",
  "M16 -29 L25 -26",
  "M20 -38 L29 -36",
  "M24 -47 L31 -46",
];

/** Sparks coming off the nib, in the space above the right-hand leaf. */
const MOTES = [
  { cx: 84, cy: 44, r: 2 },
  { cx: 95, cy: 33, r: 1.5 },
  { cx: 74, cy: 34, r: 1.7 },
  { cx: 90, cy: 52, r: 1.3 },
];

/** A four-point star, about the origin at radius [r]. */
const star = (r: number) =>
  `M0 ${-r} Q${r * 0.24} ${-r * 0.24} ${r} 0 Q${r * 0.24} ${r * 0.24} 0 ${r} Q${-r * 0.24} ${r * 0.24} ${-r} 0 Q${-r * 0.24} ${-r * 0.24} 0 ${-r} Z`;

/** The two bigger sparkles, which are stars rather than dots. */
const STARS = [
  { r: 4.6, x: 30, y: 34 },
  { r: 3.2, x: 46, y: 22 },
];

export const ProlificWriterBadge: FC<BadgeArtworkProps> = ({
  size,
  animated,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const page = muted ? [GREY.pale, GREY.light] : ["#FFFBF0", "#DCE3F5"];
  const cover = muted ? [GREY.soft, GREY.deep] : ["#4A5E92", "#1B2444"];
  const ink = muted ? GREY.ink : "#3A456E";
  const feather = muted ? [GREY.pale, GREY.light] : ["#FFFFFF", "#A9BEF0"];
  const shaft = muted ? GREY.edge : "#5C74B8";
  const glint = muted ? GREY.pale : "#EAF1FF";
  const rim = muted ? GREY.edge : "#8FA2D6";

  return (
    <BadgeSvg size={size} animated={animated}>
      <defs>
        <linearGradient id={id("page")} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={page[0]} />
          <stop offset="100%" stopColor={page[1]} />
        </linearGradient>

        <linearGradient id={id("cover")} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor={cover[0]} />
          <stop offset="100%" stopColor={cover[1]} />
        </linearGradient>

        <linearGradient id={id("plume")} x1="90%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor={feather[0]} />
          <stop offset="100%" stopColor={feather[1]} />
        </linearGradient>

        {/* The light off the page. Wider and softer than the badge's own aura,
            because here the glow is the subject rather than a rim effect. */}
        <radialGradient id={id("lift")} cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            stopColor={muted ? GREY.edge : "#9FB6FF"}
            stopOpacity={muted ? 0.16 : 0.45}
          />
          <stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#9FB6FF"}
            stopOpacity="0"
          />
        </radialGradient>

        <radialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#5C74B8"}
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#5C74B8"}
            stopOpacity="0"
          />
        </radialGradient>

        <filter id={id("glow")} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        className="nwb-aura"
        cx="60"
        cy="66"
        r="52"
        fill={`url(#${id("aura")})`}
      />

      {/* The glow the open book is throwing, sitting over the spine. */}
      <circle cx="62" cy="60" r="46" fill={`url(#${id("lift")})`} />

      {/* Boards first, so each shows as a lip outside its own leaf. */}
      <path d={COVER_LEFT} fill={`url(#${id("cover")})`} />
      <path d={COVER_RIGHT} fill={`url(#${id("cover")})`} />

      <path
        d={PAGE_LEFT}
        fill={`url(#${id("page")})`}
        stroke={rim}
        strokeOpacity={muted ? 0.35 : 0.5}
        strokeWidth="1.1"
      />
      <path
        d={PAGE_RIGHT}
        fill={`url(#${id("page")})`}
        stroke={rim}
        strokeOpacity={muted ? 0.35 : 0.5}
        strokeWidth="1.1"
      />

      {detailed && (
        <>
          <g
            stroke={ink}
            strokeOpacity={muted ? 0.4 : 0.55}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          >
            {[...LEFT_LINES, ...RIGHT_LINES].map((line) => (
              <path
                key={`${line.y}-${line.from}`}
                d={`M${line.from} ${line.y} H${line.to}`}
              />
            ))}
          </g>

          {/* The sentence being written: dashed to its own length, so pulling
              the offset to zero lays it down under the nib rather than fading
              the whole line up at once. */}
          <path
            className="nwb-inkline"
            d={`M${ACTIVE_LINE.from} ${ACTIVE_LINE.y} H${ACTIVE_LINE.from + ACTIVE_RUN}`}
            stroke={ink}
            strokeOpacity={muted ? 0.4 : 0.55}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={ACTIVE_RUN}
          />
        </>
      )}

      {/* The quill. The animated class is on the wrapper and the placement on
          the child: on an SVG element a transform attribute and an animated CSS
          transform are the same property, and the animation would win. */}
      <g className="nwb-quill">
        <g
          transform={`translate(${ACTIVE_LINE.from} ${ACTIVE_LINE.y}) scale(${QUILL_SCALE})`}
        >
          <path
            d={QUILL_PLUME}
            fill={`url(#${id("plume")})`}
            stroke={shaft}
            strokeOpacity={muted ? 0.4 : 0.55}
            strokeWidth="1.1"
          />

          {detailed && (
            <g
              stroke={shaft}
              strokeOpacity={muted ? 0.3 : 0.45}
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
            >
              {QUILL_BARBS.map((barb) => (
                <path key={barb} d={barb} />
              ))}
            </g>
          )}

          <path
            d={QUILL_SHAFT}
            stroke={shaft}
            strokeOpacity={muted ? 0.6 : 1}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />

          {/* The nib, and the light sitting on it. */}
          <path
            d="M0 0 L5.2 -10.4 L7.6 -8.8 Z"
            fill={glint}
            fillOpacity={muted ? 0.6 : 1}
          />
          {detailed && (
            <circle
              className="nwb-nib"
              cx="0.6"
              cy="-1.2"
              r="2.4"
              fill={glint}
              filter={`url(#${id("glow")})`}
            />
          )}
        </g>
      </g>

      {/* Sparks off the nib, rising and going out. */}
      {detailed && (
        <g filter={`url(#${id("glow")})`}>
          {MOTES.map((mote, index) => (
            <g
              key={`${mote.cx}-${mote.cy}`}
              className={`nwb-mote-${index + 1}`}
            >
              <circle cx={mote.cx} cy={mote.cy} r={mote.r} fill={glint} />
            </g>
          ))}

          {STARS.map((s, index) => (
            <g key={`${s.x}-${s.y}`} className={`nwb-spark-${index + 1}`}>
              <path
                d={star(s.r)}
                transform={`translate(${s.x} ${s.y})`}
                fill={glint}
                fillOpacity={muted ? 0.5 : 0.95}
              />
            </g>
          ))}
        </g>
      )}
    </BadgeSvg>
  );
};
