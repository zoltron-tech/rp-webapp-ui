"use client";

import {
  BLANK_CARD_VIEW_BOX,
  BLANK_SCROLL_VIEW_BOX,
  BlankCardScene,
  BlankScrollScene,
  EMPTY_GALLERY_VIEW_BOX,
  EmptyGalleryScene,
  END_OF_LIST_VIEW_BOX,
  EndOfListArt,
  MUSE_BOND_VIEW_BOX,
  MuseBondScene,
  OPEN_STARTER_VIEW_BOX,
  OpenStarterScene,
  type ScenePalette,
} from "@nw/animations";
import { useId } from "react";
import * as S from "./styles";

/* Views of the same paper object, sharing one visual language: an open book
 * waiting to be written in, that book closed and dozing once there's nothing
 * left to read, a scroll nobody has written on, a blank character card, and an
 * empty starter bubble. All motion and every rule they draw with lives in
 * ./styles.
 *
 * Every scene takes an optional `accent`: a muse carries its own colour, so
 * art on a muse's profile follows the muse rather than the viewer's theme. */

/**
 * The theme, as the shared drawings ask for it.
 *
 * The same `var(--…)` references the scenes' markup carried before it moved
 * into `@nw/animations`, so every accent and theme rule that applied to them
 * still does — including the muse override `Art` sets on the wrapper.
 */
const SCENE_PALETTE: ScenePalette = {
  accent: "var(--accent)",
  accentBright: "var(--accent-10)",
  accentSoft: "var(--accent-8)",
  accentSolid: "var(--accent-9)",
  accentText: "var(--accent-11)",
  edge: "var(--bg-4)",
  line: "var(--bg-5)",
  paperBottom: "var(--bg-2)",
  paperTop: "var(--bg-3)",
};

/** Four-point star used by every sparkle field. */
const STAR =
  "M0 -5 C0.6 -1.6 1.6 -0.6 5 0 C1.6 0.6 0.6 1.6 0 5 C-0.6 1.6 -1.6 0.6 -5 0 C-1.6 -0.6 -0.6 -1.6 0 -5 Z";

/** A muse's own accent colour, when it has one. Undefined means "use the
 *  logged-in user's theme accent". */
export type ArtProps = {
  className?: string;
  accent?: string | null;
};

const Star = ({
  x,
  y,
  scale,
  fill,
  delay,
}: {
  x: number;
  y: number;
  scale: number;
  fill: string;
  delay: string;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path className={`star ${delay}`} d={STAR} fill={fill} />
  </g>
);

/** Haze behind the art, so it never reads as a grey rectangle. */
const GlowGradient = ({ id }: { id: string }) => (
  <radialGradient id={id} cx="50%" cy="50%" r="50%">
    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
    <stop offset="55%" stopColor="var(--accent-8)" stopOpacity="0.16" />
    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
  </radialGradient>
);

/** Paper falls off slightly toward its bottom edge. */
const PaperGradient = ({ id }: { id: string }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="var(--bg-3)" />
    <stop offset="100%" stopColor="var(--bg-2)" />
  </linearGradient>
);

/**
 * Open book with a quill poised over the first ruled line — for a feed that
 * has nothing in it yet, where something is still expected to be written.
 */
export const OpenBookArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const featherId = `${gid}-feather`;
  const pageId = `${gid}-page`;
  const inkId = `${gid}-ink`;

  return (
    <S.OpenBookSvg
      className={className}
      $accent={accent}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={pageId} />
        {/* Feather deepens at the base and brightens toward the tip */}
        <linearGradient id={featherId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent-8)" stopOpacity="0.7" />
          <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--accent-11)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={inkId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-11)" />
          <stop offset="100%" stopColor="var(--accent-8)" />
        </linearGradient>
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="100"
        cy="88"
        rx="86"
        ry="66"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="100"
        cy="148"
        rx="52"
        ry="6"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* Page stack — the thickness the tilt lets you see */}
          <path
            d="M35 122 Q35 130 40 130 L95 130 L95 136 L40 136 Q33 136 33 128 Z"
            fill="var(--bg-4)"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
          />
          <path
            d="M165 122 Q165 130 160 130 L105 130 L105 136 L160 136 Q167 136 167 128 Z"
            fill="var(--bg-4)"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
          />
          {/* Left page */}
          <path
            d="M35 50 Q35 45 40 45 L95 45 L95 130 L40 130 Q35 130 35 125 Z"
            fill={`url(#${pageId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          {/* Right page */}
          <path
            d="M165 50 Q165 45 160 45 L105 45 L105 130 L160 130 Q165 130 165 125 Z"
            fill={`url(#${pageId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          {/* Gutter shading — the page curve either side of the spine */}
          <path
            d="M88 46 L95 45 L95 130 L88 129 Z"
            fill="var(--bg-4)"
            opacity="0.6"
          />
          <path
            d="M105 45 L112 46 L112 129 L105 130 Z"
            fill="var(--bg-4)"
            opacity="0.35"
          />
          {/* Spine */}
          <line
            x1="100"
            y1="44"
            x2="100"
            y2="131"
            stroke="var(--bg-6)"
            strokeWidth="2"
          />
          {/* Ruled lines — they write themselves in on mount */}
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          >
            <line x1="48" y1="62" x2="88" y2="62" pathLength="1" />
            <line x1="112" y1="62" x2="152" y2="62" pathLength="1" />
            <line x1="48" y1="73" x2="88" y2="73" pathLength="1" />
            <line x1="112" y1="73" x2="152" y2="73" pathLength="1" />
            <line x1="48" y1="84" x2="76" y2="84" pathLength="1" />
            <line x1="112" y1="84" x2="140" y2="84" pathLength="1" />
            <line x1="48" y1="95" x2="88" y2="95" pathLength="1" />
            <line x1="112" y1="95" x2="152" y2="95" pathLength="1" />
          </g>
          <line
            x1="48"
            y1="106"
            x2="68"
            y2="106"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Ribbon marker slipped between the pages */}
          <path
            className="ribbon"
            d="M110 45 h10 v21 l-5 -4.2 l-5 4.2 z"
            fill="var(--accent-9)"
            opacity="0.85"
          />
          {/* Quill — a bowed shaft with the vane widest around its middle,
              tapering to the tip and to a bare calamus that ends in the nib */}
          <g className="quill">
            {/* Far vane — the side of the feather turned away from us */}
            <path
              d="M160 8 C166 18 167 30 164 41 C161 50 152 56 145 58 C152 44 158 24 160 8 Z"
              fill={`url(#${featherId})`}
              opacity="0.45"
            />
            {/* Near vane — serrated outer edge, the way barbs split apart */}
            <path
              d="M160 8 L156 14 L158 15 L151 23 L153 24 L147 30 L149 32 L144 40 L146 42 L142 51 L145 58 C150 45 158 24 160 8 Z"
              fill={`url(#${featherId})`}
            />
            {/* Barbs — short strokes raked back toward the tip */}
            <g
              className="barbs"
              stroke="var(--accent-11)"
              strokeLinecap="round"
            >
              <path d="M161 17 L157 15" />
              <path d="M161 25 L155 22" />
              <path d="M160 33 L152 29" />
              <path d="M155 44 L148 39" />
              <path d="M150 52 L145 48" />
              <path d="M161 25 L165 28" />
              <path d="M158 36 L163 39" />
              <path d="M152 48 L156 50" />
            </g>
            {/* Rachis — through the vane, then on as the bare calamus */}
            <path
              d="M160 8 C168 30 150 58 126 76"
              stroke="var(--accent-11)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            {/* Nib — wedge and slit */}
            <path d="M132 65 L137 70 L124 81 Z" fill="var(--accent-9)" />
            <path
              d="M131 70 L124 81"
              stroke="var(--accent-11)"
              strokeWidth="0.7"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>
          {/* Ink drop */}
          <circle
            className="ink"
            cx="123"
            cy="85"
            r="1.6"
            fill={`url(#${inkId})`}
          />
          {/* "?" on right page */}
          <text
            className="question"
            x="126"
            y="118"
            fontSize="22"
            fill="var(--bg-6)"
            fontFamily="Georgia, serif"
          >
            ?
          </text>
        </g>
      </g>
      {/* Sparkle field — stars flare and turn, dots just breathe */}
      <Star x={24} y={34} scale={0.95} fill="var(--accent)" delay="s1" />
      <Star x={45} y={17} scale={0.62} fill="var(--accent-11)" delay="s4" />
      <Star x={176} y={30} scale={0.85} fill="var(--accent-8)" delay="s2" />
      <Star x={157} y={13} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={17} y={68} scale={0.6} fill="var(--accent-11)" delay="s9" />
      <Star x={185} y={63} scale={0.72} fill="var(--accent)" delay="s5" />
      <Star x={100} y={22} scale={0.5} fill="var(--accent-8)" delay="s11" />
      <circle
        className="sparkle s3"
        cx="33"
        cy="52"
        r="1.6"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s6"
        cx="11"
        cy="47"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s8"
        cx="60"
        cy="9"
        r="1.4"
        fill="var(--accent)"
      />
      <circle
        className="sparkle s10"
        cx="191"
        cy="44"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s12"
        cx="170"
        cy="78"
        r="1.5"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s2"
        cx="22"
        cy="92"
        r="1.3"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s6"
        cx="180"
        cy="100"
        r="1.2"
        fill="var(--accent)"
      />
    </S.OpenBookSvg>
  );
};

/**
 * The same book, closed and dozing off — for the end of a list, where there is
 * nothing further to read rather than nothing to read at all.
 *
 * The drawing itself moved to `@nw/animations` so the phone shows the same book
 * at the foot of the same lists. What is left here is this app's frame: the
 * sized `<svg>` carrying every keyframe in `./styles`, and the muse-accent
 * override the shared markup keeps reading through `var(--accent-*)`.
 */
export const DozingBookArt = ({ className, accent }: ArtProps) => (
  <S.DozingBookSvg
    className={className}
    $accent={accent}
    viewBox={END_OF_LIST_VIEW_BOX}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <EndOfListArt palette={SCENE_PALETTE} />
  </S.DozingBookSvg>
);

/*
 * The five empty states of a muse's profile. The drawings live in
 * `@nw/animations` (`muse-scenes.tsx`) so the phone shows the same ones; each
 * of these is this app's frame round one — the sized `styled.svg` whose
 * keyframes animate the scene's `nwm-…` class names — exactly as `DozingBookArt`
 * frames the end-of-list book.
 */

/** A blank scroll, still rolled and sealed — the muse story placeholder. */
export const BlankScrollArt = ({ className, accent }: ArtProps) => (
  <S.ScrollSvg
    className={className}
    $accent={accent}
    viewBox={BLANK_SCROLL_VIEW_BOX}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <BlankScrollScene palette={SCENE_PALETTE} />
  </S.ScrollSvg>
);

/** A blank character card — the muse info placeholder. */
export const BlankCardArt = ({ className, accent }: ArtProps) => (
  <S.BlankCardSvg
    className={className}
    $accent={accent}
    viewBox={BLANK_CARD_VIEW_BOX}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <BlankCardScene palette={SCENE_PALETTE} />
  </S.BlankCardSvg>
);

/** An empty speech bubble — the muse open-starters placeholder. */
export const OpenStarterArt = ({ className, accent }: ArtProps) => (
  <S.StarterSvg
    className={className}
    $accent={accent}
    viewBox={OPEN_STARTER_VIEW_BOX}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <OpenStarterScene palette={SCENE_PALETTE} />
  </S.StarterSvg>
);

/** Two unlinked character cards — the muse connections placeholder. */
export const MuseBondArt = ({ className, accent }: ArtProps) => (
  <S.BondSvg
    className={className}
    $accent={accent}
    viewBox={MUSE_BOND_VIEW_BOX}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <MuseBondScene palette={SCENE_PALETTE} />
  </S.BondSvg>
);

/** A stack of blank photo frames — the muse gallery placeholder. */
export const EmptyGalleryArt = ({ className, accent }: ArtProps) => (
  <S.GallerySvg
    className={className}
    $accent={accent}
    viewBox={EMPTY_GALLERY_VIEW_BOX}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <EmptyGalleryScene palette={SCENE_PALETTE} />
  </S.GallerySvg>
);

/**
 * Character cards under a magnifier whose lens has come up empty — for a list
 * that has content but nothing matching the filters currently applied. The
 * distinction matters: these cards exist, they're just filtered out.
 */
export const NoMatchesArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.NoMatchSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="88"
        cy="68"
        rx="78"
        ry="56"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="66"
        cy="120"
        rx="40"
        ry="5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* A card behind, so it reads as a list rather than one item */}
          <rect
            x="22"
            y="36"
            width="54"
            height="70"
            rx="7"
            fill="var(--bg-3)"
            stroke="var(--bg-5)"
            strokeWidth="1.3"
            opacity="0.55"
            transform="rotate(-7 49 71)"
          />
          {/* Front card */}
          <rect
            x="36"
            y="30"
            width="58"
            height="74"
            rx="7"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          <circle cx="65" cy="54" r="9" fill="var(--accent-8)" opacity="0.5" />
          <path
            d="M52 72 Q52 60 65 60 Q78 60 78 72 Z"
            fill="var(--accent-8)"
            opacity="0.32"
          />
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.3"
            strokeLinecap="round"
          >
            <path d="M46 84 L84 84" pathLength="1" />
            <path d="M52 94 L78 94" pathLength="1" />
          </g>
          {/* Magnifier, swinging across the cards with nothing in the lens */}
          <g className="lens">
            <circle cx="118" cy="58" r="24" fill="var(--bg-3)" opacity="0.55" />
            {/* The empty result inside the glass */}
            <circle
              cx="118"
              cy="58"
              r="11"
              fill="none"
              stroke="var(--accent-8)"
              strokeWidth="1.6"
              strokeDasharray="4 5"
              opacity="0.7"
            />
            <circle
              cx="118"
              cy="58"
              r="24"
              fill="none"
              stroke="var(--accent-9)"
              strokeWidth="3.4"
              opacity="0.85"
            />
            <path
              d="M135 75 L151 93"
              stroke="var(--accent-9)"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={16} y={34} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={164} y={40} scale={0.7} fill="var(--accent-8)" delay="s4" />
      <Star x={22} y={104} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={160} y={106} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="6"
        cy="70"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="174"
        cy="74"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="58"
        cy="10"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s9"
        cx="132"
        cy="14"
        r="1.1"
        fill="var(--accent)"
      />
      <circle
        className="sparkle s11"
        cx="98"
        cy="124"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.NoMatchSvg>
  );
};

/**
 * A storyboard sheet whose panels are all still empty — for a novelist who
 * hasn't started any stories. The three panels and the beats between them are
 * what separates this from the other blank-paper scenes: it reads as a
 * sequence waiting to be filled, not a single page.
 */
export const BlankStoryboardArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.StoryboardSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="70"
        rx="82"
        ry="56"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="90"
        cy="124"
        rx="56"
        ry="5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* Sheet edge — the thickness the tilt lets you see */}
          <path
            d="M20 104 L160 104 L160 110 Q160 116 154 116 L26 116 Q20 116 20 110 Z"
            fill="var(--bg-4)"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
          />
          {/* Sheet */}
          <rect
            x="18"
            y="28"
            width="144"
            height="80"
            rx="8"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          {/* Three empty panels — the scenes nobody has drawn */}
          <g fill="var(--bg-4)" stroke="var(--bg-5)" strokeWidth="1.1">
            <rect x="28" y="42" width="38" height="42" rx="4" />
            <rect x="71" y="42" width="38" height="42" rx="4" />
            <rect x="114" y="42" width="38" height="42" rx="4" />
          </g>
          {/* Beats between the panels */}
          <g
            stroke="var(--accent-9)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.7"
          >
            <path d="M67 59 L69.5 63 L67 67" />
            <path d="M110 59 L112.5 63 L110 67" />
          </g>
          {/* Caption line under each panel */}
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.3"
            strokeLinecap="round"
          >
            <path d="M31 94 L59 94" pathLength="1" />
            <path d="M74 94 L102 94" pathLength="1" />
            <path d="M117 94 L145 94" pathLength="1" />
          </g>
          {/* Tab clipped to the top of the sheet */}
          <path
            className="ribbon"
            d="M130 28 h10 v12 l-5 -3 l-5 3 z"
            fill="var(--accent-9)"
            opacity="0.85"
          />
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={12} y={36} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={168} y={44} scale={0.7} fill="var(--accent-8)" delay="s4" />
      <Star x={16} y={102} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={166} y={100} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="5"
        cy="70"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="175"
        cy="74"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="52"
        cy="12"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s9"
        cx="128"
        cy="14"
        r="1.1"
        fill="var(--accent)"
      />
      <circle
        className="sparkle s11"
        cx="90"
        cy="128"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.StoryboardSvg>
  );
};

/** Quarter note, used by the music scene's drifting notes. */
const Note = ({
  x,
  y,
  scale,
  delay,
}: {
  x: number;
  y: number;
  scale: number;
  delay: string;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g className={`note ${delay}`} fill="var(--accent-9)">
      <ellipse cx="0" cy="0" rx="3.6" ry="2.7" transform="rotate(-20)" />
      <rect x="2.4" y="-12" width="1.5" height="12" rx="0.7" />
    </g>
  </g>
);

/**
 * Chapter pages with the bookmark slot still empty — for a reader who hasn't
 * saved their spot anywhere yet. The dashed marker is the point: the pages are
 * there, nothing has been clipped to them.
 */
export const NoBookmarksArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.BookmarkSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="68"
        rx="76"
        ry="56"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="92"
        cy="122"
        rx="44"
        ry="5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* Chapters stacked behind */}
          <rect
            x="38"
            y="30"
            width="86"
            height="80"
            rx="6"
            fill="var(--bg-3)"
            stroke="var(--bg-5)"
            strokeWidth="1.3"
            opacity="0.5"
            transform="rotate(-6 81 70)"
          />
          <rect
            x="46"
            y="26"
            width="86"
            height="80"
            rx="6"
            fill="var(--bg-3)"
            stroke="var(--bg-5)"
            strokeWidth="1.3"
            opacity="0.75"
            transform="rotate(-2 89 66)"
          />
          {/* The chapter on top */}
          <rect
            x="50"
            y="22"
            width="88"
            height="84"
            rx="6"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          {/* Chapter heading, then the body text */}
          <path
            d="M60 40 L96 40"
            stroke="var(--accent-8)"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.55"
          />
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.3"
            strokeLinecap="round"
          >
            <path d="M60 54 L128 54" pathLength="1" />
            <path d="M60 64 L128 64" pathLength="1" />
            <path d="M60 74 L112 74" pathLength="1" />
            <path d="M60 84 L128 84" pathLength="1" />
            <path d="M60 94 L100 94" pathLength="1" />
          </g>
          {/* The marker nobody has clipped on */}
          <path
            className="ghost"
            d="M112 22 h12 v26 l-6 -5 l-6 5 z"
            fill="none"
            stroke="var(--accent-9)"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            strokeLinejoin="round"
          />
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={16} y={36} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={166} y={44} scale={0.7} fill="var(--accent-8)" delay="s4" />
      <Star x={22} y={104} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={162} y={102} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="6"
        cy="70"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="174"
        cy="76"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="64"
        cy="10"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s9"
        cx="144"
        cy="14"
        r="1.1"
        fill="var(--accent)"
      />
      <circle
        className="sparkle s11"
        cx="96"
        cy="126"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.BookmarkSvg>
  );
};

/**
 * A sheet of music with an empty staff and the notes drifting off it — for a
 * profile with no songs uploaded.
 */
export const NoMusicArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.MusicSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="74"
        rx="80"
        ry="54"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="90"
        cy="126"
        rx="52"
        ry="5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* Sheet edge */}
          <path
            d="M26 108 L154 108 L154 114 Q154 120 148 120 L32 120 Q26 120 26 114 Z"
            fill="var(--bg-4)"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
          />
          {/* Sheet */}
          <rect
            x="24"
            y="38"
            width="132"
            height="74"
            rx="7"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          {/* An empty staff */}
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          >
            <path d="M36 56 L144 56" pathLength="1" />
            <path d="M36 64 L144 64" pathLength="1" />
            <path d="M36 72 L144 72" pathLength="1" />
            <path d="M36 80 L144 80" pathLength="1" />
            <path d="M36 88 L144 88" pathLength="1" />
          </g>
          {/* Barlines — heavier at the ends, one measure division between,
              which is what separates a staff from plain ruling */}
          <g stroke="var(--bg-6)" strokeLinecap="round">
            <path d="M36 56 L36 88" strokeWidth="2.4" />
            <path d="M144 56 L144 88" strokeWidth="2.4" />
            <path d="M90 56 L90 88" strokeWidth="1.3" opacity="0.75" />
          </g>
          {/* Tab clipped to the sheet */}
          <path
            className="ribbon"
            d="M128 38 h10 v13 l-5 -3.2 l-5 3.2 z"
            fill="var(--accent-9)"
            opacity="0.85"
          />
        </g>
      </g>
      {/* Notes drifting up off the empty staff */}
      <Note x={112} y={34} scale={1} delay="note1" />
      <Note x={130} y={24} scale={0.85} delay="note2" />
      <Note x={146} y={16} scale={0.7} delay="note3" />
      {/* Sparkle field */}
      <Star x={14} y={40} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={168} y={54} scale={0.65} fill="var(--accent-8)" delay="s4" />
      <Star x={18} y={104} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={166} y={100} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="6"
        cy="74"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="176"
        cy="78"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="52"
        cy="16"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s11"
        cx="86"
        cy="128"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.MusicSvg>
  );
};

/**
 * A message sent and a reply slot still dashed and empty — for the outgoing
 * threads page when no interaction is running. Distinct from the single empty
 * bubble used for open starters: this is a two-sided exchange, and it is the
 * second half that is missing.
 */
export const NoInteractionsArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.ThreadsSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="70"
        rx="80"
        ry="58"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="92"
        cy="132"
        rx="48"
        ry="4.5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* The message that went out */}
          <path
            d="M28 20 L96 20 Q108 20 108 32 L108 58 Q108 70 96 70 L54 70 L40 84 L40 70 L28 70 Q16 70 16 58 L16 32 Q16 20 28 20 Z"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          {/* Shading down the left edge, where the bubble curves away */}
          <path
            d="M28 21 Q17 21 17 32 L17 58 Q17 69 28 69 L36 69 L36 21 Z"
            fill="var(--bg-4)"
            opacity="0.4"
          />
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M46 36 L94 36" pathLength="1" />
            <path d="M46 48 L78 48" pathLength="1" />
          </g>
          {/* The reply that never came */}
          <path
            className="ghost"
            d="M84 72 L152 72 Q164 72 164 84 L164 102 Q164 114 152 114 L144 114 L152 128 L124 114 L84 114 Q72 114 72 102 L72 84 Q72 72 84 72 Z"
            fill="none"
            stroke="var(--accent-9)"
            strokeWidth="1.8"
            strokeDasharray="5 5"
            strokeLinejoin="round"
          />
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={14} y={92} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={168} y={40} scale={0.7} fill="var(--accent-8)" delay="s4" />
      <Star x={126} y={12} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={30} y={116} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="6"
        cy="60"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="174"
        cy="72"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="60"
        cy="8"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s11"
        cx="58"
        cy="128"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.ThreadsSvg>
  );
};

/**
 * A frozen speech bubble that cracks open and refreezes, for the ice breaker
 * rail when nobody has posted one. Much smaller than the other scenes — it
 * sits inline in a horizontal strip beside 12px text, so there is no room for
 * a tilted 3D scene, a shadow, or a full sparkle field.
 */
export const FrozenSilenceArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const iceId = `${gid}-ice`;

  return (
    <S.FrozenBubbleSvg
      className={className}
      $accent={accent}
      viewBox="0 0 64 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Ice reads as the accent chilled toward white at the top */}
        <linearGradient id={iceId} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--accent-11)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent-8)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g className="ice">
        {/* Frozen bubble. Deliberately few shapes and heavy strokes: at rail
            size this is under 50px across, so fine detail turns to mush. */}
        <path
          d="M13 5 L51 5 Q60 5 60 14 L60 31 Q60 40 51 40 L28 40 L17 52 L17 40 L13 40 Q4 40 4 31 L4 14 Q4 5 13 5 Z"
          fill={`url(#${iceId})`}
          stroke="var(--accent-10)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* The crack that travels across it, then lets it refreeze */}
        <g
          className="crack"
          stroke="var(--accent-11)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 9 L31 20 L25 25 L32 36" pathLength="1" />
          <path d="M31 20 L43 15" pathLength="1" />
        </g>
      </g>
      {/* Frost glints coming off it */}
      <Star x={58} y={47} scale={0.42} fill="var(--accent-10)" delay="s5" />
      <circle
        className="sparkle s3"
        cx="60"
        cy="3"
        r="1.6"
        fill="var(--accent-11)"
      />
    </S.FrozenBubbleSvg>
  );
};

/**
 * An avatar row with the last place still open — for a novelist with no
 * friends yet. The dashed ring is the vacancy; the filled ones are what a
 * friend would look like once there is one.
 */
export const NoFriendsArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.FriendsSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="68"
        rx="78"
        ry="56"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="90"
        cy="124"
        rx="48"
        ry="5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* Card edge — the thickness the tilt lets you see */}
          <path
            d="M30 104 L150 104 L150 110 Q150 116 144 116 L36 116 Q30 116 30 110 Z"
            fill="var(--bg-4)"
            stroke="var(--bg-5)"
            strokeWidth="1.2"
          />
          {/* Card */}
          <rect
            x="28"
            y="24"
            width="124"
            height="82"
            rx="8"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          {/* Two friends, overlapping the way an avatar stack does. Each ring
              is stroked in the card colour so the one behind reads as behind. */}
          <g stroke="var(--bg-2)" strokeWidth="2.5">
            <circle cx="66" cy="54" r="15" fill="var(--bg-4)" />
          </g>
          <circle cx="66" cy="49" r="5" fill="var(--accent-8)" opacity="0.5" />
          <path
            d="M57 64 Q57 55 66 55 Q75 55 75 64 Z"
            fill="var(--accent-8)"
            opacity="0.32"
          />
          <g stroke="var(--bg-2)" strokeWidth="2.5">
            <circle cx="90" cy="54" r="15" fill="var(--bg-4)" />
          </g>
          <circle cx="90" cy="49" r="5" fill="var(--accent-8)" opacity="0.5" />
          <path
            d="M81 64 Q81 55 90 55 Q99 55 99 64 Z"
            fill="var(--accent-8)"
            opacity="0.32"
          />
          {/* The place nobody has taken */}
          <circle cx="114" cy="54" r="15" fill="var(--bg-2)" />
          <circle
            className="ghost"
            cx="114"
            cy="54"
            r="15"
            fill="none"
            stroke="var(--accent-9)"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <g
            className="ghost"
            stroke="var(--accent-9)"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M114 47 L114 61" />
            <path d="M107 54 L121 54" />
          </g>
          {/* Names under the row */}
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M52 84 L128 84" pathLength="1" />
            <path d="M66 94 L114 94" pathLength="1" />
          </g>
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={14} y={36} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={166} y={44} scale={0.7} fill="var(--accent-8)" delay="s4" />
      <Star x={20} y={102} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={162} y={100} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="6"
        cy="70"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="174"
        cy="74"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="62"
        cy="10"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s11"
        cx="120"
        cy="126"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.FriendsSvg>
  );
};

/**
 * Two bubbles mid-exchange, one of them still being typed — for a
 * conversations list with nothing in it. Unlike the outgoing threads scene,
 * nothing here is dashed out: a conversation is possible, it just hasn't
 * started, so both halves are drawn.
 */
export const NoConversationsArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.ConversationsSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="68"
        rx="80"
        ry="58"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="86"
        cy="130"
        rx="50"
        ry="5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* Their message, sitting behind */}
          <path
            d="M72 14 L152 14 Q164 14 164 26 L164 50 Q164 62 152 62 L142 62 L150 76 L122 62 L72 62 Q60 62 60 50 L60 26 Q60 14 72 14 Z"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
          />
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M74 30 L150 30" pathLength="1" />
            <path d="M74 44 L128 44" pathLength="1" />
          </g>
          {/* Your reply, still being typed */}
          <path
            d="M28 62 L104 62 Q116 62 116 74 L116 100 Q116 112 104 112 L54 112 L40 128 L40 112 L28 112 Q16 112 16 100 L16 74 Q16 62 28 62 Z"
            fill="var(--accent-9)"
            fillOpacity="0.14"
            stroke="var(--accent-9)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <g className="typing" fill="var(--accent-9)">
            <circle cx="48" cy="87" r="4.5" />
            <circle cx="66" cy="87" r="4.5" />
            <circle cx="84" cy="87" r="4.5" />
          </g>
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={14} y={40} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={170} y={80} scale={0.7} fill="var(--accent-8)" delay="s4" />
      <Star x={144} y={104} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={38} y={20} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="6"
        cy="76"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="174"
        cy="42"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="96"
        cy="6"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s11"
        cx="126"
        cy="128"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.ConversationsSvg>
  );
};

/**
 * Two novelists and a badge inviting a third, for the home page friends strip
 * when it is empty. Rail-sized like the ice breaker scene: no card, no tilt,
 * no shadow, heavy strokes — it sits inline beside 36px avatars and 12px text,
 * where finer detail turns to mush.
 */
export const NoFriendsRailArt = ({ className, accent }: ArtProps) => (
  <S.FriendsRailSvg
    className={className}
    $accent={accent}
    viewBox="0 0 68 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g className="ice">
      {/* Someone already here */}
      <circle
        cx="18"
        cy="24"
        r="13"
        fill="var(--bg-4)"
        stroke="var(--accent-10)"
        strokeWidth="2"
      />
      <circle cx="18" cy="19.5" r="4.4" fill="var(--accent-8)" opacity="0.75" />
      {/* Shoulders close along the avatar's own arc, so the silhouette sits
          inside the circle instead of ending on a flat cut. */}
      <path
        d="M8.6 33 Q8.6 24 18 24 Q27.4 24 27.4 33 A13 13 0 0 1 8.6 33 Z"
        fill="var(--accent-8)"
        opacity="0.6"
      />
      {/* And someone beside them, overlapping the way an avatar stack does */}
      <circle cx="40" cy="24" r="13" fill="var(--bg-2)" />
      <circle
        cx="40"
        cy="24"
        r="13"
        fill="var(--bg-4)"
        stroke="var(--accent-10)"
        strokeWidth="2"
      />
      <circle cx="40" cy="19.5" r="4.4" fill="var(--accent-8)" opacity="0.75" />
      <path
        d="M30.6 33 Q30.6 24 40 24 Q49.4 24 49.4 33 A13 13 0 0 1 30.6 33 Z"
        fill="var(--accent-8)"
        opacity="0.6"
      />
      {/* Room for one more */}
      <circle cx="56" cy="33" r="10" fill="var(--bg-2)" />
      <g className="bond">
        <circle
          cx="56"
          cy="33"
          r="9"
          fill="var(--bg-2)"
          stroke="var(--accent-9)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <g stroke="var(--accent-9)" strokeWidth="2.2" strokeLinecap="round">
          <path d="M56 28.5 L56 37.5" />
          <path d="M51.5 33 L60.5 33" />
        </g>
      </g>
    </g>
    {/* A glint off the pair */}
    <circle
      className="sparkle s3"
      cx="30"
      cy="5"
      r="1.8"
      fill="var(--accent-11)"
    />
  </S.FriendsRailSvg>
);

/**
 * A bell at rest with the ring it isn't making dashed out either side — for an
 * empty notifications list. The dashes carry the meaning: the bell works, it
 * just has nothing to announce.
 */
export const NoNotificationsArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;

  return (
    <S.NotificationsSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="70"
        rx="76"
        ry="56"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="90"
        cy="126"
        rx="38"
        ry="5"
        fill="var(--bg-4)"
      />
      {/* The ring it is not making */}
      <g
        className="ghost"
        stroke="var(--accent-9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 6"
        fill="none"
      >
        <path d="M44 50 A30 30 0 0 0 44 92" />
        <path d="M136 50 A30 30 0 0 1 136 92" />
      </g>
      <g className="tilt">
        <g className="ribbon">
          {/* Crown */}
          <circle
            cx="90"
            cy="33"
            r="5.5"
            fill="var(--accent-9)"
            opacity="0.85"
          />
          {/* Bell */}
          <path
            d="M62 96 L62 66 C62 50 74 37 90 37 C106 37 118 50 118 66 L118 96 Z"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.6"
          />
          {/* Shading down the left flank, where the bell curves away */}
          <path
            d="M62 96 L62 66 C62 55 67 46 74 41 L74 96 Z"
            fill="var(--bg-4)"
            opacity="0.4"
          />
          {/* Rim */}
          <path
            d="M54 93 L126 93 Q130 93 130 97.5 Q130 102 126 102 L54 102 Q50 102 50 97.5 Q50 93 54 93 Z"
            fill="var(--bg-4)"
            stroke="var(--bg-5)"
            strokeWidth="1.4"
          />
          {/* Clapper, hanging still */}
          <circle
            cx="90"
            cy="109"
            r="5.5"
            fill="var(--accent-9)"
            opacity="0.8"
          />
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={20} y={34} scale={0.75} fill="var(--accent)" delay="s1" />
      <Star x={160} y={38} scale={0.65} fill="var(--accent-8)" delay="s4" />
      <Star x={26} y={106} scale={0.5} fill="var(--accent-10)" delay="s7" />
      <Star x={156} y={104} scale={0.45} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="8"
        cy="70"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="172"
        cy="72"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="90"
        cy="8"
        r="1.3"
        fill="var(--accent-11)"
      />
    </S.NotificationsSvg>
  );
};

/**
 * A thread page torn in two — the top half still pinned in place, the piece
 * carrying the rest of the words drifting off below it, paper flakes coming
 * away at the tear. For a thread the novelist deleted: the other blank-paper
 * scenes are waiting to be written, this one had words and lost them.
 */
export const DeletedThreadArt = ({ className, accent }: ArtProps) => {
  const gid = useId();
  const glowId = `${gid}-glow`;
  const paperId = `${gid}-paper`;
  const scrapId = `${gid}-scrap`;

  return (
    <S.TornThreadSvg
      className={className}
      $accent={accent}
      viewBox="0 0 180 137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <GlowGradient id={glowId} />
        <PaperGradient id={paperId} />
        <PaperGradient id={scrapId} />
      </defs>
      {/* Glow */}
      <ellipse
        className="glow"
        cx="90"
        cy="68"
        rx="80"
        ry="56"
        fill={`url(#${glowId})`}
      />
      {/* Shadow */}
      <ellipse
        className="shadow"
        cx="92"
        cy="130"
        rx="46"
        ry="4.5"
        fill="var(--bg-4)"
      />
      <g className="tilt">
        <g className="scene">
          {/* The half still pinned up — a thread bubble ripped across */}
          <path
            d="M44 18 L136 18 Q146 18 146 28 L146 65 L137 58 L131 67 L124 62 L118 70 L111 57 L106 66 L99 63 L93 72 L87 59 L81 67 L75 62 L69 70 L62 57 L57 66 L50 61 L45 69 L39 58 L34 64 L34 28 Q34 18 44 18 Z"
            fill={`url(#${paperId})`}
            stroke="var(--bg-5)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Shading down the left edge, where the bubble curves away */}
          <path
            d="M44 19 Q35 19 35 28 L35 66 L44 66 L44 19 Z"
            fill="var(--bg-4)"
            opacity="0.4"
          />
          {/* What was written, cut short by the tear */}
          <g
            className="lines"
            stroke="var(--bg-5)"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M50 32 L130 32" pathLength="1" />
            <path d="M50 44 L112 44" pathLength="1" />
            <path d="M50 55 L84 55" pathLength="1" />
          </g>
          {/* The half that went — drifting down and away, words already gone.
              The outer transform is the gap the tear opened; the inner group
              carries the motion, which would otherwise overwrite it. */}
          <g transform="translate(7 14) rotate(-4 90 86)">
            <g className="scrap">
              <path
                d="M34 64 L39 58 L45 69 L50 61 L57 66 L62 57 L69 70 L75 62 L81 67 L87 59 L93 72 L99 63 L106 66 L111 57 L118 70 L124 62 L131 67 L137 58 L146 65 L146 96 Q146 106 136 106 L44 106 Q34 106 34 96 Z"
                fill={`url(#${scrapId})`}
                stroke="var(--bg-5)"
                strokeWidth="1.5"
                strokeLinejoin="round"
                opacity="0.75"
              />
              {/* Faded remains of the last lines on the torn-off half */}
              <g
                stroke="var(--bg-5)"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.45"
              >
                <path d="M50 87 L118 87" />
                <path d="M50 96 L96 96" />
              </g>
            </g>
          </g>
          {/* Flakes coming away along the tear */}
          <g className="flakes" fill="var(--accent-9)">
            <path
              className="flake flake1"
              d="M58 56 l5 -2 l1 5 l-5 1 z"
              opacity="0.8"
            />
            <path
              className="flake flake2"
              d="M99 58 l4 -3 l2 4 l-4 2 z"
              opacity="0.7"
            />
            <path
              className="flake flake3"
              d="M132 55 l5 -2 l1 4 l-5 2 z"
              opacity="0.65"
            />
          </g>
        </g>
      </g>
      {/* Sparkle field */}
      <Star x={14} y={40} scale={0.8} fill="var(--accent)" delay="s1" />
      <Star x={166} y={48} scale={0.7} fill="var(--accent-8)" delay="s4" />
      <Star x={18} y={104} scale={0.55} fill="var(--accent-10)" delay="s7" />
      <Star x={164} y={106} scale={0.5} fill="var(--accent-11)" delay="s10" />
      <circle
        className="sparkle s2"
        cx="6"
        cy="72"
        r="1.4"
        fill="var(--accent-8)"
      />
      <circle
        className="sparkle s5"
        cx="174"
        cy="76"
        r="1.2"
        fill="var(--accent-10)"
      />
      <circle
        className="sparkle s3"
        cx="56"
        cy="8"
        r="1.3"
        fill="var(--accent-11)"
      />
      <circle
        className="sparkle s9"
        cx="124"
        cy="9"
        r="1.1"
        fill="var(--accent)"
      />
      <circle
        className="sparkle s11"
        cx="90"
        cy="126"
        r="1.2"
        fill="var(--accent-8)"
      />
    </S.TornThreadSvg>
  );
};
