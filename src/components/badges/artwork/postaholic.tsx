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
 * A postbox being fed faster than it can swallow, with two letters still
 * sticking out of the slot from the last time.
 *
 * The badge is for fifty posts, so the joke is the volume rather than the act:
 * Social Bird is one speech bubble because that badge is about answering
 * somebody, and this one is a queue of post going in and never stopping.
 * Orange, and the only upright silhouette on the shelf.
 */

/** The box: a domed pillar on a plinth, with the slot cut into the dome. */
const BODY = "M38 58 A22 22 0 0 1 82 58 L82 98 H38 Z";
const PLINTH = { h: 10, rx: 3, w: 60, x: 30, y: 97 };
const BAND = { h: 6, w: 44, x: 38, y: 63 };
const SLOT = { h: 6, rx: 3, w: 26, x: 47, y: 49 };

/** An envelope, drawn about its own centre so it can be dropped anywhere. */
const ENVELOPE = "M-9 -6 H9 V6 H-9 Z";
const ENVELOPE_FLAP = "M-9 -6 L0 1.4 L9 -6";

/**
 * The two already wedged in the slot.
 *
 * The badge has to read as *overflowing* even in a still frame — a postbox
 * with nothing coming out of it is just a postbox.
 */
const JAMMED = [
  { rotate: -16, x: 50, y: 47 },
  { rotate: 13, x: 71, y: 43 },
];

/**
 * The three on their way in, spread across the mouth of the slot.
 *
 * Each drops on the same clock a beat apart, so there is always one in the air
 * and the queue never empties.
 */
const FALLING = [
  { rotate: -8, x: 52 },
  { rotate: 6, x: 62 },
  { rotate: -4, x: 70 },
];

export const PostaholicBadge: FC<BadgeArtworkProps> = ({
  size,
  animated,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const box = muted ? [GREY.soft, GREY.deep] : ["#FB9B4E", "#B4470C"];
  const band = muted ? GREY.light : "#FFD9A8";
  const slot = muted ? GREY.deep : "#37190A";
  const plinth = muted ? GREY.mid : "#7A3407";
  const paper = muted ? GREY.pale : "#FFF7EA";
  const fold = muted ? GREY.light : "#D9A06A";

  /** One envelope, so the jammed pair and the falling three cannot diverge. */
  const envelope = (
    <>
      <path
        d={ENVELOPE}
        fill={paper}
        fillOpacity={muted ? 0.6 : 1}
        stroke={fold}
        strokeOpacity={muted ? 0.4 : 0.7}
        strokeWidth="1"
      />
      <path
        d={ENVELOPE_FLAP}
        fill="none"
        stroke={fold}
        strokeOpacity={muted ? 0.4 : 0.8}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </>
  );

  return (
    <BadgeSvg size={size} animated={animated}>
      <defs>
        <linearGradient id={id("box")} x1="16%" y1="0%" x2="84%" y2="100%">
          <stop offset="0%" stopColor={box[0]} />
          <stop offset="100%" stopColor={box[1]} />
        </linearGradient>

        <radialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#F2833A"}
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#F2833A"}
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <circle
        className="nwb-aura"
        cx="60"
        cy="62"
        r="52"
        fill={`url(#${id("aura")})`}
      />

      {/* Letters still falling in, behind the box so they drop *into* it. */}
      {detailed &&
        FALLING.map((letter, index) => (
          <g key={letter.x} className={`nwb-letter-${index + 1}`}>
            <g transform={`translate(${letter.x} 46) rotate(${letter.rotate})`}>
              {envelope}
            </g>
          </g>
        ))}

      {/* The box, taking the weight of each one as it lands. */}
      <g className="nwb-box">
        <path
          d={BODY}
          fill={`url(#${id("box")})`}
          stroke={plinth}
          strokeOpacity={muted ? 0.4 : 0.6}
          strokeWidth="1.4"
        />

        {detailed && (
          <rect
            x={BAND.x}
            y={BAND.y}
            width={BAND.w}
            height={BAND.h}
            fill={band}
            fillOpacity={muted ? 0.4 : 0.85}
          />
        )}

        <rect
          x={SLOT.x}
          y={SLOT.y}
          width={SLOT.w}
          height={SLOT.h}
          rx={SLOT.rx}
          fill={slot}
        />

        <rect
          x={PLINTH.x}
          y={PLINTH.y}
          width={PLINTH.w}
          height={PLINTH.h}
          rx={PLINTH.rx}
          fill={plinth}
        />
      </g>

      {/* The two that did not make it all the way in. Drawn over the box, and
          outside the group that nudges, so they stay wedged while it moves. */}
      {JAMMED.map((letter) => (
        <g
          key={letter.x}
          transform={`translate(${letter.x} ${letter.y}) rotate(${letter.rotate})`}
        >
          {envelope}
        </g>
      ))}
    </BadgeSvg>
  );
};
