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
 * A record on a deck: grooves turning under a tonearm, with the streaming mark
 * printed on the label.
 *
 * Black where the rest of the shelf is coloured, and the only badge that spins
 * — a linked account is a thing that keeps playing, and the artwork should be
 * doing something even when nothing else on the profile is.
 */

/** The record, and the label pressed into the middle of it. */
const DISC_R = 50;
const LABEL_R = 17;

/** Grooves. Uneven spacing, because evenly spaced rings read as a target. */
const GROOVES = [45.5, 42, 38.5, 34.5, 30, 25.5, 21];

/**
 * An arc on the record's own centre, as a path.
 *
 * Angles are degrees clockwise from three o'clock, which is what SVG's own
 * trigonometry uses — no conversion, and the numbers in the call match where
 * the arc lands on screen.
 */
const arc = (r: number, from: number, to: number): string => {
  const at = (deg: number) => {
    const t = (deg * Math.PI) / 180;
    return [60 + r * Math.cos(t), 60 + r * Math.sin(t)];
  };
  const [x0, y0] = at(from);
  const [x1, y1] = at(to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/**
 * The three bars of the streaming mark, concentric about the spindle hole.
 *
 * Drawn around the hole rather than above it: on a real label the art is
 * printed round the centre, and a mark shunted off-centre to make room reads
 * as a sticker applied badly.
 */
const MARK = [
  { r: 10, width: 2.6 },
  { r: 7, width: 2.2 },
  { r: 4.5, width: 1.8 },
];

/** Sound coming off the record, in the quarter the tonearm leaves alone. */
const WAVES = [23, 29, 35];

/** The arm, its pivot, and the counterweight behind it. */
const PIVOT = { x: 108, y: 18 };
const HEAD = { x: 86, y: 42 };

export const SpotifyLinkedBadge: FC<BadgeArtworkProps> = ({
  size,
  animated,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const vinyl = muted ? [GREY.soft, GREY.deep] : ["#26262E", "#08080B"];
  const groove = muted ? GREY.ink : "#3C3C48";
  const green = muted ? GREY.light : "#1DB954";
  const greenDeep = muted ? GREY.ink : "#0B6B32";
  const greenBright = muted ? GREY.pale : "#5BE894";
  const metal = muted ? GREY.light : "#C9CCD6";
  const metalBright = muted ? GREY.pale : "#EFF2F8";
  const hole = muted ? GREY.deep : "#08080B";
  const label = muted ? GREY.mid : "#FFFFFF";

  return (
    <BadgeSvg size={size} animated={animated}>
      <defs>
        <radialGradient id={id("vinyl")} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor={vinyl[0]} />
          <stop offset="100%" stopColor={vinyl[1]} />
        </radialGradient>

        {/* The specular streak that makes the spin visible. Black rings turning
            on black are still a black circle; a highlight going round is the
            only part of a record you can actually see move. */}
        <linearGradient id={id("sheen")} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop
            offset="50%"
            stopColor="#FFFFFF"
            stopOpacity={muted ? 0.05 : 0.16}
          />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#1DB954"}
            stopOpacity="0.38"
          />
          <stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#1DB954"}
            stopOpacity="0"
          />
        </radialGradient>

        <clipPath id={id("clip")}>
          <circle cx="60" cy="60" r={DISC_R} />
        </clipPath>
      </defs>

      <circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="54"
        fill={`url(#${id("aura")})`}
      />

      {/* Everything pressed into the record turns with it: grooves, sheen,
          label and mark. */}
      <g className="nwb-disc">
        <circle cx="60" cy="60" r={DISC_R} fill={`url(#${id("vinyl")})`} />

        {detailed && (
          <g
            fill="none"
            stroke={groove}
            strokeOpacity={muted ? 0.5 : 0.85}
            strokeWidth="0.9"
          >
            {GROOVES.map((r) => (
              <circle key={r} cx="60" cy="60" r={r} />
            ))}
          </g>
        )}

        <g clipPath={`url(#${id("clip")})`}>
          <rect
            x="14"
            y="-6"
            width="26"
            height="132"
            fill={`url(#${id("sheen")})`}
            transform="rotate(-24 60 60)"
          />
        </g>

        <circle
          cx="60"
          cy="60"
          r={LABEL_R}
          fill={green}
          stroke={greenDeep}
          strokeOpacity={muted ? 0.5 : 0.9}
          strokeWidth="1.4"
        />

        {detailed && (
          <g
            fill="none"
            stroke={label}
            strokeLinecap="round"
            strokeOpacity={muted ? 0.55 : 0.95}
          >
            {MARK.map((bar) => (
              <path
                key={bar.r}
                d={arc(bar.r, 200, 340)}
                strokeWidth={bar.width}
              />
            ))}
          </g>
        )}

        <circle cx="60" cy="60" r="2.4" fill={hole} />
      </g>

      {/* Sound off the record. Three arcs on the same centre, each swelling
          outward and fading, staggered so one is always on its way out. */}
      {detailed &&
        WAVES.map((r, index) => (
          <path
            key={r}
            className={`nwb-wave-${index + 1}`}
            d={arc(r, 196, 254)}
            fill="none"
            stroke={greenBright}
            strokeOpacity={muted ? 0.35 : 0.75}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ))}

      {/* The tonearm, tracking slowly in towards the label the way a real one
          does across a side. */}
      {detailed && (
        <g className="nwb-arm">
          <line
            x1={PIVOT.x}
            y1={PIVOT.y}
            x2={HEAD.x}
            y2={HEAD.y}
            stroke={metal}
            strokeOpacity={muted ? 0.6 : 1}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="81"
            y="38.8"
            width="10"
            height="6.5"
            rx="1.6"
            transform={`rotate(-47 ${HEAD.x} ${HEAD.y})`}
            fill={metalBright}
            fillOpacity={muted ? 0.6 : 1}
          />
          <circle
            cx={PIVOT.x}
            cy={PIVOT.y}
            r="5.4"
            fill={metal}
            fillOpacity={muted ? 0.6 : 1}
          />
          <circle cx={PIVOT.x} cy={PIVOT.y} r="2.2" fill={greenDeep} />
          <rect
            x="109"
            y="6"
            width="12"
            height="7"
            rx="3.5"
            transform="rotate(47 115 9.5)"
            fill={metal}
            fillOpacity={muted ? 0.6 : 1}
          />
        </g>
      )}
    </BadgeSvg>
  );
};
