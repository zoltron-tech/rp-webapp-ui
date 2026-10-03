import { useId } from "react";
import { registerEndOfListMotion } from "./end-of-list.motion";
import {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  SvgText,
} from "./primitives";
import type { ScenePalette } from "./scene-palette";

/**
 * "You've made it to the end" — the book, closed and dozing off.
 *
 * Shown in place of a "load more" once every page has been fetched, so the
 * reader knows there is nothing further rather than that the list is broken.
 * The book is deliberately the *same* object as the empty-feed art, caught at a
 * different moment: an open book waiting to be written in means nothing to
 * read; that book closed and asleep means nothing *left* to read.
 *
 * ## Why it lives in a package
 *
 * It was `apps/web/src/components/end-of-list`, drawn against the DOM, and the
 * phone's lists just stopped — no marker at all, so a list that had run out
 * looked identical to one still loading. Two clients disagreeing about whether
 * a list has an end is the kind of drift a shared drawing prevents, and this is
 * the second scene (after the badge crests) to need exactly that treatment.
 *
 * What each client still owns is the frame: a `<span>` with a label on the web,
 * an `<Svg>` box with a `<Text>` on native. Only the drawing is here.
 *
 * ## The palette is injected
 *
 * Web draws this in `var(--bg-3)`, `var(--accent-9)` and so on, which resolve
 * against whatever theme and accent are in force. There are no CSS variables on
 * a phone, so the colours arrive as a prop instead: web passes the `var(…)`
 * strings it always used and keeps its theming untouched, native passes
 * resolved values from `@nw/theme`.
 *
 * ## Motion
 *
 * Every moving part sits on a `<G>` with a class name, and each of those groups
 * exists *only* to move — the static placement is on the child. That is
 * forced on the web (an SVG element's `transform` attribute and its CSS
 * `transform` are the same property, so an animation on a placed element throws
 * the placement away) and it is what lets native give each group an explicit
 * view-box origin instead of measuring one. See `end-of-list.motion.native`.
 */

/*
 * Teaches the native motion table about this scene's class names. A no-op on
 * the web, where the browser matches them from the stylesheet — and a call
 * rather than an import for its side effect, so nothing can tree-shake it away.
 */
registerEndOfListMotion();

/** The drawing's own grid. Both clients scale from it. */
export const END_OF_LIST_VIEW_BOX = "0 0 120 96";

/** Web's copy, so neither client invents its own wording. */
export const END_OF_LIST_LABEL = "You've made it to the end";

/**
 * The colours the scene is drawn in — the same nine roles every paper scene in
 * this package takes. See `scene-palette.ts`.
 */
export type EndOfListPalette = ScenePalette;

/** Four-point star, the same one every sparkle field in this product uses. */
const STAR =
  "M0 -5 C0.6 -1.6 1.6 -0.6 5 0 C1.6 0.6 0.6 1.6 0 5 C-0.6 1.6 -1.6 0.6 -5 0 C-1.6 -0.6 -0.6 -1.6 0 -5 Z";

/**
 * One star: a group that moves, wrapping a group that is placed.
 *
 * The two are separate for the reason the file comment gives — and the moving
 * group is centred on the star's own position, so "rotate about the centre"
 * needs no measurement on either platform.
 */
const Star = ({
  delay,
  fill,
  scale,
  x,
  y,
}: {
  delay: string;
  fill: string;
  scale: number;
  x: number;
  y: number;
}) => (
  <G transform={`translate(${x} ${y}) scale(${scale})`}>
    <G className={`star ${delay}`}>
      <Path d={STAR} fill={fill} />
    </G>
  </G>
);

/** One dot sparkle, wrapped the same way and for the same reason. */
const Sparkle = ({
  cx,
  cy,
  delay,
  fill,
  r,
}: {
  cx: number;
  cy: number;
  delay: string;
  fill: string;
  r: number;
}) => (
  <G transform={`translate(${cx} ${cy})`}>
    <G className={`sparkle ${delay}`}>
      <Circle cx={0} cy={0} fill={fill} r={r} />
    </G>
  </G>
);

export const EndOfListArt = ({ palette }: { palette: EndOfListPalette }) => {
  /*
   * Ids for the two gradients this instance defines.
   *
   * A page can show more than one of these at once — an inbox and a rail beside
   * it — and without per-instance ids the second copy paints with the first
   * one's (possibly unmounted) gradient.
   */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const glowId = `nwe-glow-${uid}`;
  const coverId = `nwe-cover-${uid}`;

  return (
    <>
      <Defs>
        <RadialGradient cx="50%" cy="50%" id={glowId} r="50%">
          <Stop offset="0%" stopColor={palette.accent} stopOpacity="0.32" />
          <Stop
            offset="55%"
            stopColor={palette.accentSoft}
            stopOpacity="0.16"
          />
          <Stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
        </RadialGradient>

        <LinearGradient id={coverId} x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0%" stopColor={palette.paperTop} />
          <Stop offset="100%" stopColor={palette.paperBottom} />
        </LinearGradient>
      </Defs>

      {/* Haze, so the art never reads as a grey rectangle. */}
      <G className="glow">
        <Ellipse cx="60" cy="48" fill={`url(#${glowId})`} rx="52" ry="40" />
      </G>

      {/* The desk shadow, tightening as the book lifts. */}
      <G transform="translate(60 86)">
        <G className="shadow">
          <Ellipse cx="0" cy="0" fill={palette.edge} rx="31" ry="4" />
        </G>
      </G>

      <G className="scene">
        {/* Page stack — the fore-edge the book's angle lets you see. */}
        <Path
          d="M84 24 L91 29 L91 70 L84 70 Z"
          fill={palette.edge}
          stroke={palette.line}
          strokeWidth="1.2"
        />
        <G opacity="0.8" stroke={palette.line} strokeWidth="0.8">
          <Path d="M85 34 L90 37" />
          <Path d="M85 47 L90 49" />
          <Path d="M85 60 L90 62" />
        </G>

        <Rect
          fill={`url(#${coverId})`}
          height="50"
          rx="5"
          stroke={palette.line}
          strokeWidth="1.5"
          width="54"
          x="30"
          y="22"
        />

        {/* Spine band. */}
        <Path d="M35 22 h5 v50 h-5 z" fill={palette.edge} opacity="0.7" />

        {/* Title lines, ruled the way the open book's pages are. */}
        <G
          className="lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.2"
        >
          <Path d="M46 30 L64 30" pathLength="1" />
          <Path d="M46 35 L58 35" pathLength="1" />
        </G>

        {/* Ribbon marker slipped under the cover. */}
        {/* Placed at the point it pivots on — the top of the ribbon, where it
            leaves the cover — so the moving group swings the free end. */}
        <G transform="translate(73 22)">
          <G className="ribbon">
            <Path
              d="M-4 0 h8 v18 l-4 -3.4 l-4 3.4 z"
              fill={palette.accentSolid}
              opacity="0.85"
            />
          </G>
        </G>

        {/* Sleepy face. */}
        <G fill="none" stroke={palette.accentText} strokeLinecap="round">
          <G className="eye">
            <Path d="M46 46 q3.5 4 7 0" strokeWidth="2.2" />
          </G>
          <G className="eye eye-r">
            <Path d="M62 46 q3.5 4 7 0" strokeWidth="2.2" />
          </G>
          <Path d="M53 56 q4 3.5 8 0" strokeWidth="2" />
        </G>

        <Circle
          cx="45"
          cy="54"
          fill={palette.accentSolid}
          opacity="0.35"
          r="2.2"
        />
        <Circle
          cx="70"
          cy="54"
          fill={palette.accentSolid}
          opacity="0.35"
          r="2.2"
        />
      </G>

      {/* Zzz drifting up off the cover. */}
      <G transform="translate(88 30)">
        <G className="z z1">
          <SvgText
            fill={palette.accentText}
            fontSize="15"
            fontWeight="bold"
            x="0"
            y="0"
          >
            z
          </SvgText>
        </G>
      </G>
      <G transform="translate(97 20)">
        <G className="z z2">
          <SvgText
            fill={palette.accentText}
            fontSize="13"
            fontWeight="bold"
            x="0"
            y="0"
          >
            z
          </SvgText>
        </G>
      </G>
      <G transform="translate(105 11)">
        <G className="z z3">
          <SvgText
            fill={palette.accentText}
            fontSize="11"
            fontWeight="bold"
            x="0"
            y="0"
          >
            z
          </SvgText>
        </G>
      </G>

      {/* Sparkle field. */}
      <Star delay="s1" fill={palette.accent} scale={0.7} x={16} y={26} />
      <Star delay="s3" fill={palette.accentSoft} scale={0.6} x={108} y={52} />
      <Star delay="s5" fill={palette.accentBright} scale={0.5} x={26} y={66} />
      <Sparkle cx={8} cy={44} delay="s2" fill={palette.accentSoft} r={1.3} />
      <Sparkle cx={30} cy={12} delay="s4" fill={palette.accentText} r={1.2} />
      <Sparkle cx={100} cy={70} delay="s6" fill={palette.accent} r={1.3} />
      <Sparkle cx={14} cy={76} delay="s7" fill={palette.accentBright} r={1.1} />
    </>
  );
};
