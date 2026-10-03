import {
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "@nw/animations";
import type { FC } from "react";
import { useBadgeIds } from "./frame";

/**
 * The XP mark: an amber squircle with a white lightning bolt.
 *
 * Here rather than in either app because it is the one piece of gold in the
 * product — it sits on the XP chip on a profile, and a phone drawing its own
 * approximation of that amber is how one client ends up subtly the wrong
 * colour. The four gradients are the shading recipe the rest of the chip icons
 * use: a saturated base, a warm rim, a crisp top gloss, an inner shadow.
 */

export const SCORE_VIEW_BOX = "0 0 24 24";

export const ScoreBadgeArtwork: FC = () => {
  const id = useBadgeIds();
  const body = id("score-body");
  const bolt = id("score-bolt");
  const gloss = id("score-gloss");
  const inner = id("score-inner");

  return (
    <>
      <Defs>
        {/* Amber squircle */}
        <LinearGradient
          id={body}
          x1="4"
          y1="3"
          x2="20"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFD772" />
          <Stop offset="0.5" stopColor="#F79E1B" />
          <Stop offset="1" stopColor="#D9760A" />
        </LinearGradient>
        {/* Bolt fill */}
        <LinearGradient
          id={bolt}
          x1="12"
          y1="4"
          x2="12"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#FFF0C4" />
        </LinearGradient>
        {/* Top gloss */}
        <LinearGradient
          id={gloss}
          x1="12"
          y1="2.5"
          x2="12"
          y2="13"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        {/* Inner shadow at the bottom */}
        <RadialGradient
          id={inner}
          cx="12"
          cy="20"
          r="12"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
          <Stop offset="1" stopColor="#8A3D00" stopOpacity="0.5" />
        </RadialGradient>
      </Defs>

      <Rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="6.4"
        fill={`url(#${body})`}
      />
      <Rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="6.4"
        fill={`url(#${inner})`}
      />
      <Rect
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
      <Path
        d="M13.5 3.8 L7 13.4 L11.1 13.4 L10.2 20.2 L17.4 10.2 L13.1 10.2 Z"
        fill={`url(#${bolt})`}
        stroke="#D9760A"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />

      {/* Gloss on the top half of the squircle */}
      <Path
        d="M6 3.2 H18 A4 4 0 0 1 21 6.5 C21 9.5 17 11 12 11 C7 11 3 9.5 3 6.5 A4 4 0 0 1 6 3.2 Z"
        fill={`url(#${gloss})`}
      />
    </>
  );
};
