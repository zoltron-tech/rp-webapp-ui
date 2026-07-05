"use client";

import { useId } from "react";

type BadgeIconProps = {
  /** Rendered width/height in px. Defaults to 14 to match chip text. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * iOS-style, softly shaded SVG badges used across Novelist and Muse profile chips.
 *
 * Each icon builds its shading from unique gradient ids (via `useId`) so any number
 * of instances can live on the same page without clashing defs. The look leans on the
 * usual iOS recipe: a saturated base gradient, a warm/gold rim, a crisp top gloss and
 * a subtle inner shadow for depth.
 */

/** Star medallion — used for the Level chip. */
export function LevelBadgeIcon({ size = 14, className, style }: BadgeIconProps) {
  const id = useId();
  const ring = `${id}-ring`;
  const face = `${id}-face`;
  const star = `${id}-star`;
  const gloss = `${id}-gloss`;
  const shadow = `${id}-shadow`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Gold rim */}
        <linearGradient id={ring} x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FDE9A8" />
          <stop offset="0.5" stopColor="#F5B93E" />
          <stop offset="1" stopColor="#C67A15" />
        </linearGradient>
        {/* Blue medal face */}
        <linearGradient id={face} x1="6" y1="4" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7CB6FF" />
          <stop offset="0.5" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4FD8" />
        </linearGradient>
        {/* Star sheen */}
        <linearGradient id={star} x1="12" y1="5" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFDF2" />
          <stop offset="0.55" stopColor="#FFE79A" />
          <stop offset="1" stopColor="#F6B23A" />
        </linearGradient>
        {/* Top gloss */}
        <linearGradient id={gloss} x1="12" y1="4.5" x2="12" y2="12.5" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* Inner shadow at the base */}
        <radialGradient id={shadow} cx="12" cy="13" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0.6" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#0B2A66" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      <circle cx="12" cy="12" r="11" fill={`url(#${ring})`} />
      <circle cx="12" cy="12" r="8.9" fill={`url(#${face})`} />
      <circle cx="12" cy="12" r="8.9" fill={`url(#${shadow})`} />

      {/* Star */}
      <path
        d="M12 5.8 L13.59 9.82 L17.9 10.08 L14.57 12.83 L15.65 17.02 L12 14.7 L8.35 17.02 L9.43 12.83 L6.1 10.08 L10.41 9.82 Z"
        fill={`url(#${star})`}
        stroke="#B9781A"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />

      {/* Sheen over the top of the medal */}
      <ellipse cx="12" cy="8.4" rx="6.6" ry="3.4" fill={`url(#${gloss})`} opacity="0.55" />
    </svg>
  );
}

/** Lightning squircle — used for the Score chip. */
export function ScoreBadgeIcon({ size = 14, className, style }: BadgeIconProps) {
  const id = useId();
  const body = `${id}-body`;
  const bolt = `${id}-bolt`;
  const gloss = `${id}-gloss`;
  const inner = `${id}-inner`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Amber squircle */}
        <linearGradient id={body} x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFD772" />
          <stop offset="0.5" stopColor="#F79E1B" />
          <stop offset="1" stopColor="#D9760A" />
        </linearGradient>
        {/* Bolt fill */}
        <linearGradient id={bolt} x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFF0C4" />
        </linearGradient>
        {/* Top gloss */}
        <linearGradient id={gloss} x1="12" y1="2.5" x2="12" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* Inner shadow at the bottom */}
        <radialGradient id={inner} cx="12" cy="20" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#8A3D00" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <rect x="2" y="2" width="20" height="20" rx="6.4" fill={`url(#${body})`} />
      <rect x="2" y="2" width="20" height="20" rx="6.4" fill={`url(#${inner})`} />
      <rect
        x="2.6"
        y="2.6"
        width="18.8"
        height="18.8"
        rx="5.9"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />

      {/* Lightning bolt */}
      <path
        d="M13.5 3.8 L7 13.4 L11.1 13.4 L10.2 20.2 L17.4 10.2 L13.1 10.2 Z"
        fill={`url(#${bolt})`}
        stroke="#D9760A"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />

      {/* Gloss on the top half of the squircle */}
      <path
        d="M6 3.2 H18 A4 4 0 0 1 21 6.5 C21 9.5 17 11 12 11 C7 11 3 9.5 3 6.5 A4 4 0 0 1 6 3.2 Z"
        fill={`url(#${gloss})`}
      />
    </svg>
  );
}

/** Metal tier a rank maps to: 1 → gold, 2 → silver, 3 → bronze, otherwise iron. */
type TrophyTier = "gold" | "silver" | "bronze" | "iron";

type TrophyPalette = {
  /** Cup body gradient stops: [light, mid, dark]. */
  cup: [string, string, string];
  /** Stem/base gradient stops: [light, dark]. */
  metal: [string, string];
  /** Outline colour. */
  edge: string;
  /** Handle / laurel colour. */
  handle: string;
  /** Star pip colour. */
  star: string;
  /** Optional inset gem (gold & silver only): [light, mid, dark, edge]. */
  gem?: [string, string, string, string];
};

const TROPHY_PALETTES: Record<TrophyTier, TrophyPalette> = {
  gold: {
    cup: ["#FFEFB0", "#F6C243", "#C67A15"],
    metal: ["#F2C24A", "#B76D11"],
    edge: "#B9781A",
    handle: "#D89828",
    star: "#FFF6D8",
    gem: ["#FFB0BE", "#E0344F", "#8E0F26", "#6C0B1E"], // ruby
  },
  silver: {
    cup: ["#FBFDFF", "#CFD8E3", "#8A97A8"],
    metal: ["#D3DCE6", "#8A97A8"],
    edge: "#7C899B",
    handle: "#AEB9C6",
    star: "#FFFFFF",
    gem: ["#BBDCFF", "#2C7BE0", "#123F86", "#0C2E63"], // sapphire
  },
  bronze: {
    cup: ["#F6D2A9", "#D08A4E", "#8A4E22"],
    metal: ["#D3925A", "#8A4E22"],
    edge: "#7E4520",
    handle: "#B87A45",
    star: "#FFE9D2",
  },
  iron: {
    cup: ["#C8CDD3", "#949BA3", "#5B626B"],
    metal: ["#9AA1A9", "#5B626B"],
    edge: "#4C525A",
    handle: "#7E858E",
    star: "#E9ECEF",
  },
};

export function tierForRank(rank: number): TrophyTier {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "iron";
}

/** Concave four-point sparkle centred at (cx, cy) with arm length `a`. */
function sparklePath(cx: number, cy: number, a: number): string {
  return `M${cx} ${cy - a} Q${cx} ${cy} ${cx + a} ${cy} Q${cx} ${cy} ${cx} ${cy + a} Q${cx} ${cy} ${cx - a} ${cy} Q${cx} ${cy} ${cx} ${cy - a} Z`;
}

/**
 * Trophy — used for the Rank chip. Each standing gets a distinct silhouette and
 * ornament, not just a recolour:
 *   #1 gold   — tall ornate cup, ruby gem, sparkles
 *   #2 silver — elegant cup with a sapphire gem
 *   #3 bronze — stout chalice framed by a laurel wreath
 *   #4+ iron  — rugged riveted bucket with a hex bolt, matte finish
 */
export function RankTrophyIcon({
  size = 16,
  rank,
  className,
  style,
}: BadgeIconProps & { rank?: number }) {
  const id = useId();
  const cup = `${id}-cup`;
  const metal = `${id}-metal`;
  const gloss = `${id}-gloss`;
  const gem = `${id}-gem`;

  const tier = typeof rank === "number" ? tierForRank(rank) : "gold";
  const palette = TROPHY_PALETTES[tier];
  const gemEdge = palette.gem?.[3];

  // A laurel half-branch (bronze only); rendered once and mirrored across x=12.
  const laurelBranch = (
    <g>
      <path
        d="M8 13 C4.6 11.5 3.6 7.6 5 4.5"
        fill="none"
        stroke={palette.handle}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path d="M5.2 5 Q3.6 4.4 3 5.6 Q4.4 6.4 5.2 5 Z" fill={palette.handle} />
      <path d="M4.6 7.2 Q3 6.8 2.6 8.1 Q4 8.7 4.6 7.2 Z" fill={palette.handle} />
      <path d="M4.9 9.6 Q3.4 9.5 3.2 10.9 Q4.6 11.1 4.9 9.6 Z" fill={palette.handle} />
      <path d="M6.2 11.6 Q4.8 11.8 4.8 13.1 Q6.2 13 6.2 11.6 Z" fill={palette.handle} />
    </g>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Cup body */}
        <linearGradient id={cup} x1="7" y1="3" x2="17" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={palette.cup[0]} />
          <stop offset="0.45" stopColor={palette.cup[1]} />
          <stop offset="1" stopColor={palette.cup[2]} />
        </linearGradient>
        {/* Stem + base metal */}
        <linearGradient id={metal} x1="12" y1="12" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={palette.metal[0]} />
          <stop offset="1" stopColor={palette.metal[1]} />
        </linearGradient>
        {/* Highlight streak */}
        <linearGradient id={gloss} x1="9" y1="4" x2="11" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* Inset gem */}
        {palette.gem && (
          <radialGradient
            id={gem}
            cx="11.4"
            cy="7.4"
            r="3.6"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor={palette.gem[0]} />
            <stop offset="0.5" stopColor={palette.gem[1]} />
            <stop offset="1" stopColor={palette.gem[2]} />
          </radialGradient>
        )}
      </defs>

      {/* ── Shared base: stem, foot, plate ─────────────────────────── */}
      <path d="M10.6 12 H13.4 V15.7 H10.6 Z" fill={`url(#${metal})`} />
      <path
        d="M8.5 15.6 H15.5 L14.5 18.7 H9.5 Z"
        fill={`url(#${metal})`}
        stroke={palette.edge}
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
      <rect
        x="6.7"
        y="18.5"
        width="10.6"
        height="2.8"
        rx="1.3"
        fill={`url(#${metal})`}
        stroke={palette.edge}
        strokeWidth="0.4"
      />

      {/* ── Gold: ornate cup + ruby gem + sparkles ─────────────────── */}
      {tier === "gold" && (
        <>
          <path d="M6.7 5.2 C2.3 5 1.9 10.6 6.9 11" fill="none" stroke={palette.handle} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M17.3 5.2 C21.7 5 22.1 10.6 17.1 11" fill="none" stroke={palette.handle} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M6.9 6.6 C4.2 6.6 3.9 9.7 6.9 10" fill="none" stroke={palette.cup[0]} strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
          <path d="M17.1 6.6 C19.8 6.6 20.1 9.7 17.1 10" fill="none" stroke={palette.cup[0]} strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
          <rect x="5.3" y="2.5" width="13.4" height="2.2" rx="1.1" fill={`url(#${cup})`} stroke={palette.edge} strokeWidth="0.5" />
          <path d="M6.7 4.6 H17.3 C17.3 9.9 15.1 13.5 12 13.5 C8.9 13.5 6.7 9.9 6.7 4.6 Z" fill={`url(#${cup})`} stroke={palette.edge} strokeWidth="0.5" strokeLinejoin="round" />
          <path d="M8.5 5.4 C8.2 8 8.6 10.8 10 12.6" fill="none" stroke={`url(#${gloss})`} strokeWidth="1.4" strokeLinecap="round" />
          {/* Ruby, brilliant cut */}
          <path d="M12 6 L14.2 7.7 L12 10.6 L9.8 7.7 Z" fill={`url(#${gem})`} stroke={gemEdge} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M9.8 7.7 H14.2" stroke={gemEdge} strokeWidth="0.3" opacity="0.7" />
          <path d="M12 6 L10.7 7.7 M12 6 L13.3 7.7 M10.7 7.7 L12 10.6 M13.3 7.7 L12 10.6" stroke={gemEdge} strokeWidth="0.25" opacity="0.5" />
          <path d="M12 6 L10.7 7.7 L12 7.7 Z" fill="#FFFFFF" opacity="0.6" />
          <path d={sparklePath(4.4, 3.4, 1.2)} fill="#FFF7D6" />
          <path d={sparklePath(19.6, 4.4, 0.95)} fill="#FFF7D6" />
          <path d={sparklePath(18.4, 11.6, 0.8)} fill="#FFF7D6" />
        </>
      )}

      {/* ── Silver: elegant cup + sapphire gem ─────────────────────── */}
      {tier === "silver" && (
        <>
          <path d="M6.7 5.4 C3 5.2 2.6 10.4 6.9 10.9" fill="none" stroke={palette.handle} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.3 5.4 C21 5.2 21.4 10.4 17.1 10.9" fill="none" stroke={palette.handle} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="5.5" y="2.6" width="13" height="2.1" rx="1.05" fill={`url(#${cup})`} stroke={palette.edge} strokeWidth="0.5" />
          <path d="M6.9 4.6 H17.1 C17.1 9.7 15 13.4 12 13.4 C9 13.4 6.9 9.7 6.9 4.6 Z" fill={`url(#${cup})`} stroke={palette.edge} strokeWidth="0.5" strokeLinejoin="round" />
          <path d="M8.6 5.4 C8.3 8 8.7 10.6 10 12.4" fill="none" stroke={`url(#${gloss})`} strokeWidth="1.3" strokeLinecap="round" />
          {/* Sapphire, round cut */}
          <circle cx="12" cy="8.1" r="1.9" fill={`url(#${gem})`} stroke={gemEdge} strokeWidth="0.4" />
          <circle cx="11.4" cy="7.5" r="0.55" fill="#FFFFFF" opacity="0.85" />
        </>
      )}

      {/* ── Bronze: stout chalice framed by a laurel wreath ────────── */}
      {tier === "bronze" && (
        <>
          {laurelBranch}
          <g transform="translate(24 0) scale(-1 1)">{laurelBranch}</g>
          <path d="M6.4 3.5 H17.6 C17.6 9 15.2 12.5 12 12.5 C8.8 12.5 6.4 9 6.4 3.5 Z" fill={`url(#${cup})`} stroke={palette.edge} strokeWidth="0.5" strokeLinejoin="round" />
          <path d="M6.9 4.8 H17.1" stroke={palette.edge} strokeWidth="0.4" opacity="0.4" />
          <path d="M8.4 4.6 C8.2 7 8.6 9.4 9.9 11" fill="none" stroke={`url(#${gloss})`} strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M12 5.6 L12.7 7.06 L14.3 7.26 L13.1 8.35 L13.42 9.94 L12 9.14 L10.58 9.94 L10.9 8.35 L9.7 7.26 L11.3 7.06 Z"
            fill={palette.star}
            opacity="0.9"
          />
        </>
      )}

      {/* ── Iron: rugged riveted bucket + hex bolt, matte ──────────── */}
      {tier === "iron" && (
        <>
          <path d="M6.4 5 H3.5 V9.8 H6.4" fill="none" stroke={palette.handle} strokeWidth="1.6" strokeLinejoin="miter" />
          <path d="M17.6 5 H20.5 V9.8 H17.6" fill="none" stroke={palette.handle} strokeWidth="1.6" strokeLinejoin="miter" />
          <rect x="5.9" y="2.9" width="12.2" height="1.9" rx="0.4" fill={`url(#${cup})`} stroke={palette.edge} strokeWidth="0.5" />
          <path d="M6.6 4.8 H17.4 L15.9 12 Q15.9 13.5 12 13.5 Q8.1 13.5 8.1 12 Z" fill={`url(#${cup})`} stroke={palette.edge} strokeWidth="0.5" strokeLinejoin="round" />
          <circle cx="7.6" cy="3.85" r="0.5" fill={palette.edge} opacity="0.7" />
          <circle cx="12" cy="3.85" r="0.5" fill={palette.edge} opacity="0.7" />
          <circle cx="16.4" cy="3.85" r="0.5" fill={palette.edge} opacity="0.7" />
          {/* Hex bolt */}
          <path d="M12 6.1 L13.75 7.1 L13.75 9.1 L12 10.1 L10.25 9.1 L10.25 7.1 Z" fill={`url(#${metal})`} stroke={palette.edge} strokeWidth="0.5" strokeLinejoin="round" />
          <path d="M10.9 8.1 H13.1" stroke={palette.edge} strokeWidth="0.6" strokeLinecap="round" />
          <path d="M8.6 5 C8.5 7.4 8.8 9.6 9.8 11.4" fill="none" stroke={`url(#${gloss})`} strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
        </>
      )}
    </svg>
  );
}
