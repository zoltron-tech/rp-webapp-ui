import { type ReactNode, useId } from "react";
import { registerMuseSceneMotion } from "./muse-scenes.motion";
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
} from "./primitives";
import type { ScenePalette } from "./scene-palette";

/**
 * The five empty states of a character's profile, drawn once.
 *
 * A muse's page has seven sections and five of them can be empty: a scroll
 * nobody has written on (story), a blank character card (info), a speech
 * bubble with an unfinished ellipsis (open starters), two cards whose thread
 * was never joined (connections), and a stack of undeveloped photo frames
 * (gallery). They lived in `apps/web/src/components/book-art` against the DOM,
 * and the phone's muse profile would have had to redraw all five by hand — or
 * show a line of grey text where the web shows a drawing. Same reason the
 * dozing book moved here: two clients that disagree about what "nothing here
 * yet" looks like are two products.
 *
 * Each client keeps its frame — web's sized `styled.svg` with its keyframes,
 * native's `<Svg>` box with the motion gate — and only the drawing is here.
 *
 * ## Same conventions as `end-of-list.tsx`
 *
 * - **The palette is injected**: `ScenePalette`, the nine roles both clients
 *   already resolve for the dozing book.
 * - **Every moving part sits on a group that exists only to move**, inside a
 *   group that only places it — the tilt included, see `Tilt`. On the web an element's `transform` attribute
 *   and its animated CSS `transform` are the same property, so a placed
 *   element cannot also be animated; on native the split is what lets the
 *   motion table give each group a `0, 0` origin instead of measuring one.
 * - **Class names are namespaced** `nwm-…`, because the native motion table is
 *   one flat map shared by every scene and the dozing book already owns
 *   `glow`, `shadow`, `scene` and `ribbon` with *its* origins. Web's `Art`
 *   wrapper matches both spellings.
 *
 * ## What each scene shares
 *
 * The same haze, the same paper gradient, the same four-point star and dot
 * sparkles, the same slow float and 3D tilt — these are one paper object caught
 * at five moments, and the helpers below are what keep the five drawings in
 * one visual language rather than five styles.
 */

/*
 * Teaches the native motion table about these class names. A no-op on the
 * web, where the browser matches them from the stylesheet — and a call rather
 * than an import for its side effect, so nothing can tree-shake it away.
 */
registerMuseSceneMotion();

/** The grids the scenes are drawn on. Both clients scale from them. */
export const BLANK_SCROLL_VIEW_BOX = "0 0 160 160";
export const BLANK_CARD_VIEW_BOX = "0 0 160 137";
export const OPEN_STARTER_VIEW_BOX = "0 0 160 137";
export const MUSE_BOND_VIEW_BOX = "0 0 180 137";
export const EMPTY_GALLERY_VIEW_BOX = "0 0 180 137";

/** Four-point star, the same one every sparkle field in this product uses. */
const STAR =
  "M0 -5 C0.6 -1.6 1.6 -0.6 5 0 C1.6 0.6 0.6 1.6 0 5 C-0.6 1.6 -1.6 0.6 -5 0 C-1.6 -0.6 -0.6 -1.6 0 -5 Z";

interface SceneProps {
  palette: ScenePalette;
}

/** Ids for the two gradients an instance defines, unique per mount. */
const useGradientIds = () => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return { glowId: `nwm-glow-${uid}`, paperId: `nwm-paper-${uid}` };
};

/** Haze behind the art, so it never reads as a grey rectangle. */
const SceneDefs = ({
  glowId,
  palette,
  paperId,
}: SceneProps & { glowId: string; paperId: string }) => (
  <Defs>
    <RadialGradient cx="50%" cy="50%" id={glowId} r="50%">
      <Stop offset="0%" stopColor={palette.accent} stopOpacity="0.32" />
      <Stop offset="55%" stopColor={palette.accentSoft} stopOpacity="0.16" />
      <Stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
    </RadialGradient>
    {/* Paper falls off slightly toward its bottom edge. */}
    <LinearGradient id={paperId} x1="0" x2="0" y1="0" y2="1">
      <Stop offset="0%" stopColor={palette.paperTop} />
      <Stop offset="100%" stopColor={palette.paperBottom} />
    </LinearGradient>
  </Defs>
);

/** The haze, centred where the scene puts it, breathing about its own centre. */
const Glow = ({
  cx,
  cy,
  fill,
  rx,
  ry,
}: {
  cx: number;
  cy: number;
  fill: string;
  rx: number;
  ry: number;
}) => (
  <G transform={`translate(${cx} ${cy})`}>
    <G className="nwm-glow">
      <Ellipse cx={0} cy={0} fill={fill} rx={rx} ry={ry} />
    </G>
  </G>
);

/** A desk shadow, tightening as the object above it lifts. */
const Shadow = ({
  cx,
  cy,
  fill,
  rx,
  ry,
}: {
  cx: number;
  cy: number;
  fill: string;
  rx: number;
  ry: number;
}) => (
  <G transform={`translate(${cx} ${cy})`}>
    <G className="nwm-shadow">
      <Ellipse cx={0} cy={0} fill={fill} rx={rx} ry={ry} />
    </G>
  </G>
);

/** One star: a group that moves, wrapping a group that is placed. */
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
    <G className={`nwm-star ${delay}`}>
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
    <G className={`nwm-sparkle ${delay}`}>
      <Circle cx={0} cy={0} fill={fill} r={r} />
    </G>
  </G>
);

/**
 * The 3D lean the paper rests at, and the slow float inside it.
 *
 * Web animates `.nwm-tilt` with a perspective transform about
 * `transform-origin: 50% 60%` of its own box, and `.nwm-scene` with a float.
 * Native cannot measure a box, so the tilt group is *placed* at the scene's
 * centre — its own origin is then `0, 0` wherever the placing group put it,
 * and the motion table can turn it there. The inner translate puts the
 * artwork back where it was drawn, so nothing else in the scene moves.
 */
const Tilt = ({
  children,
  cx,
  cy,
}: {
  children: ReactNode;
  cx: number;
  cy: number;
}) => (
  <G transform={`translate(${cx} ${cy})`}>
    <G className="nwm-tilt">
      <G transform={`translate(${-cx} ${-cy})`}>
        <G className="nwm-scene">{children}</G>
      </G>
    </G>
  </G>
);

/**
 * A blank scroll, still rolled at both ends and sealed — for a muse whose
 * backstory hasn't been written yet.
 */
export const BlankScrollScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={80} cy={80} fill={`url(#${glowId})`} rx={70} ry={64} />
      <Shadow cx={80} cy={144} fill={palette.edge} rx={44} ry={5} />

      <Tilt cx={80} cy={82}>
        {/* Parchment */}
        <Path
          d="M36 40 L124 40 L124 120 L36 120 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeWidth="1.5"
        />
        {/* Shading down the left edge, where the sheet curves away */}
        <Path
          d="M36 40 L48 40 L48 120 L36 120 Z"
          fill={palette.edge}
          opacity="0.45"
        />
        {/* Ruled lines — on the web they write themselves in on mount */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.2"
        >
          <Path d="M54 58 L112 58" pathLength="1" />
          <Path d="M54 70 L112 70" pathLength="1" />
          <Path d="M54 82 L96 82" pathLength="1" />
          <Path d="M54 94 L112 94" pathLength="1" />
        </G>
        {/* Wax seal, still unbroken */}
        <Circle
          cx="106"
          cy="108"
          fill={palette.accentSolid}
          opacity="0.7"
          r="6.5"
        />
        <Circle
          cx="106"
          cy="108"
          fill="none"
          opacity="0.55"
          r="3.4"
          stroke={palette.accentText}
          strokeWidth="0.9"
        />
        {/* Top roll — the sheet is still curled around its rod */}
        <Rect
          fill={palette.edge}
          height="14"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.4"
          width="104"
          x="28"
          y="30"
        />
        <Ellipse
          cx="28"
          cy="37"
          fill={palette.paperTop}
          rx="4.5"
          ry="7"
          stroke={palette.line}
          strokeWidth="1.2"
        />
        <Ellipse
          cx="132"
          cy="37"
          fill={palette.paperTop}
          rx="4.5"
          ry="7"
          stroke={palette.line}
          strokeWidth="1.2"
        />
        {/* Bottom roll */}
        <Rect
          fill={palette.edge}
          height="14"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.4"
          width="104"
          x="28"
          y="116"
        />
        <Ellipse
          cx="28"
          cy="123"
          fill={palette.paperTop}
          rx="4.5"
          ry="7"
          stroke={palette.line}
          strokeWidth="1.2"
        />
        <Ellipse
          cx="132"
          cy="123"
          fill={palette.paperTop}
          rx="4.5"
          ry="7"
          stroke={palette.line}
          strokeWidth="1.2"
        />
      </Tilt>

      {/* Sparkle field */}
      <Star delay="s1" fill={palette.accent} scale={0.85} x={24} y={46} />
      <Star delay="s3" fill={palette.accentSoft} scale={0.7} x={136} y={54} />
      <Star delay="s6" fill={palette.accentBright} scale={0.6} x={30} y={112} />
      <Star delay="s9" fill={palette.accentText} scale={0.5} x={130} y={100} />
      <Sparkle cx={14} cy={72} delay="s2" fill={palette.accentSoft} r={1.4} />
      <Sparkle
        cx={146}
        cy={80}
        delay="s4"
        fill={palette.accentBright}
        r={1.2}
      />
      <Sparkle cx={46} cy={12} delay="s5" fill={palette.accentText} r={1.3} />
      <Sparkle cx={118} cy={14} delay="s8" fill={palette.accent} r={1.1} />
      <Sparkle cx={20} cy={126} delay="s11" fill={palette.accentSoft} r={1.2} />
    </>
  );
};

/**
 * A blank character card — portrait frame and empty attribute rows — for a
 * muse whose details haven't been filled in yet.
 */
export const BlankCardScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={80} cy={68} fill={`url(#${glowId})`} rx={70} ry={56} />
      <Shadow cx={80} cy={126} fill={palette.edge} rx={42} ry={5} />

      <Tilt cx={80} cy={68}>
        {/* Card edge — the thickness the tilt lets you see */}
        <Path
          d="M34 106 L126 106 L126 112 Q126 118 120 118 L40 118 Q34 118 34 112 Z"
          fill={palette.edge}
          stroke={palette.line}
          strokeWidth="1.2"
        />
        {/* Card */}
        <Rect
          fill={`url(#${paperId})`}
          height="92"
          rx="8"
          stroke={palette.line}
          strokeWidth="1.5"
          width="96"
          x="32"
          y="18"
        />
        {/* Portrait frame, still empty */}
        <Rect
          fill={palette.edge}
          height="34"
          rx="6"
          stroke={palette.line}
          strokeWidth="1.2"
          width="34"
          x="42"
          y="30"
        />
        {/* Head and shoulders placeholder */}
        <Circle
          cx="59"
          cy="42"
          fill={palette.accentSoft}
          opacity="0.5"
          r="5.5"
        />
        <Path
          d="M49 60 Q49 49 59 49 Q69 49 69 60 Z"
          fill={palette.accentSoft}
          opacity="0.35"
        />
        {/* Name and subtitle beside the portrait */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M84 38 L118 38" pathLength="1" />
          <Path d="M84 47 L106 47" pathLength="1" />
          <Path d="M42 78 L60 78" pathLength="1" />
          <Path d="M68 78 L118 78" pathLength="1" />
          <Path d="M42 90 L60 90" pathLength="1" />
          <Path d="M68 90 L104 90" pathLength="1" />
        </G>
        {/* Corner tab, the one bit of colour on an otherwise blank card.
              Placed at its pivot — the top centre, where it meets the card —
              so the moving group swings the free end. */}
        <G transform="translate(109 18)">
          <G className="nwm-ribbon">
            <Path
              d="M-5 0 h10 v17 l-5 -3.6 l-5 3.6 z"
              fill={palette.accentSolid}
              opacity="0.85"
            />
          </G>
        </G>
      </Tilt>

      {/* Sparkle field */}
      <Star delay="s1" fill={palette.accent} scale={0.85} x={20} y={38} />
      <Star delay="s3" fill={palette.accentSoft} scale={0.7} x={142} y={48} />
      <Star delay="s6" fill={palette.accentBright} scale={0.55} x={26} y={98} />
      <Star delay="s9" fill={palette.accentText} scale={0.5} x={140} y={96} />
      <Sparkle cx={10} cy={66} delay="s2" fill={palette.accentSoft} r={1.4} />
      <Sparkle
        cx={152}
        cy={72}
        delay="s4"
        fill={palette.accentBright}
        r={1.2}
      />
      <Sparkle cx={44} cy={8} delay="s5" fill={palette.accentText} r={1.3} />
      <Sparkle cx={122} cy={8} delay="s8" fill={palette.accent} r={1.1} />
      <Sparkle cx={16} cy={112} delay="s11" fill={palette.accentSoft} r={1.2} />
    </>
  );
};

/**
 * An empty speech bubble with an unfinished ellipsis — for a muse with no open
 * starters, where a conversation could begin but nobody has written one.
 */
export const OpenStarterScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={80} cy={64} fill={`url(#${glowId})`} rx={70} ry={56} />
      <Shadow cx={80} cy={126} fill={palette.edge} rx={40} ry={5} />

      <Tilt cx={80} cy={66}>
        {/* Bubble, with the tail reaching down toward whoever would reply */}
        <Path
          d="M42 22 L118 22 Q130 22 130 34 L130 84 Q130 96 118 96 L74 96 L58 114 L58 96 L42 96 Q30 96 30 84 L30 34 Q30 22 42 22 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeWidth="1.5"
        />
        {/* Shading down the left edge, where the bubble curves away */}
        <Path
          d="M42 23 Q31 23 31 34 L31 84 Q31 95 42 95 L50 95 L50 23 Z"
          fill={palette.edge}
          opacity="0.4"
        />
        {/* Two ruled lines — the start of something, then nothing */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M60 40 L114 40" pathLength="1" />
          <Path d="M60 52 L96 52" pathLength="1" />
        </G>
        {/* Ellipsis — a starter nobody has typed. Each dot is placed by its
              own group so the bounce is about the dot's centre on both clients. */}
        <G className="nwm-typing" fill={palette.accentSolid}>
          {[66, 80, 94].map((cx, index) => (
            <G key={cx} transform={`translate(${cx} 72)`}>
              <G className={`nwm-dot d${index + 1}`}>
                <Circle cx={0} cy={0} r={4} />
              </G>
            </G>
          ))}
        </G>
      </Tilt>

      {/* Sparkle field */}
      <Star delay="s1" fill={palette.accent} scale={0.85} x={18} y={36} />
      <Star delay="s4" fill={palette.accentSoft} scale={0.7} x={144} y={44} />
      <Star
        delay="s7"
        fill={palette.accentBright}
        scale={0.55}
        x={24}
        y={100}
      />
      <Star delay="s10" fill={palette.accentText} scale={0.5} x={138} y={98} />
      <Sparkle cx={8} cy={66} delay="s2" fill={palette.accentSoft} r={1.4} />
      <Sparkle
        cx={152}
        cy={74}
        delay="s5"
        fill={palette.accentBright}
        r={1.2}
      />
      <Sparkle cx={40} cy={8} delay="s3" fill={palette.accentText} r={1.3} />
      <Sparkle cx={126} cy={10} delay="s9" fill={palette.accent} r={1.1} />
      <Sparkle
        cx={112}
        cy={118}
        delay="s11"
        fill={palette.accentSoft}
        r={1.2}
      />
    </>
  );
};

/**
 * Two character cards with the thread between them left open — for a muse that
 * hasn't been bonded to any others yet.
 */
export const MuseBondScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={70} fill={`url(#${glowId})`} rx={80} ry={56} />
      {/* One shadow under each card */}
      <Shadow cx={48} cy={118} fill={palette.edge} rx={26} ry={4} />
      <Shadow cx={132} cy={118} fill={palette.edge} rx={26} ry={4} />

      <Tilt cx={90} cy={72}>
        {/* Left card */}
        <Rect
          fill={`url(#${paperId})`}
          height="70"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.5"
          width="52"
          x="22"
          y="38"
        />
        <Circle cx="48" cy="60" fill={palette.accentSoft} opacity="0.5" r="9" />
        <Path
          d="M35 78 Q35 66 48 66 Q61 66 61 78 Z"
          fill={palette.accentSoft}
          opacity="0.32"
        />
        {/* Right card */}
        <Rect
          fill={`url(#${paperId})`}
          height="70"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.5"
          width="52"
          x="106"
          y="38"
        />
        <Circle
          cx="132"
          cy="60"
          fill={palette.accentSoft}
          opacity="0.5"
          r="9"
        />
        <Path
          d="M119 78 Q119 66 132 66 Q145 66 145 78 Z"
          fill={palette.accentSoft}
          opacity="0.32"
        />
        {/* Name lines on each card */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.3"
        >
          <Path d="M32 90 L64 90" pathLength="1" />
          <Path d="M116 90 L148 90" pathLength="1" />
          <Path d="M38 98 L58 98" pathLength="1" />
          <Path d="M122 98 L142 98" pathLength="1" />
        </G>
        {/* The thread between them, drawn but never joined */}
        <Path
          d="M74 62 Q90 40 106 62"
          fill="none"
          opacity="0.6"
          stroke={palette.accentSolid}
          strokeDasharray="3 4"
          strokeLinecap="round"
          strokeWidth="1.6"
        />
        {/* An open link where the bond would close */}
        <G className="nwm-bond">
          <Circle
            cx="90"
            cy="48"
            fill="none"
            r="5"
            stroke={palette.accentSolid}
            strokeDasharray="5 4"
            strokeWidth="1.8"
          />
        </G>
      </Tilt>

      {/* Sparkle field */}
      <Star delay="s1" fill={palette.accent} scale={0.8} x={12} y={40} />
      <Star delay="s4" fill={palette.accentSoft} scale={0.7} x={168} y={48} />
      <Star
        delay="s7"
        fill={palette.accentBright}
        scale={0.55}
        x={20}
        y={104}
      />
      <Star delay="s10" fill={palette.accentText} scale={0.5} x={162} y={100} />
      <Sparkle cx={6} cy={72} delay="s2" fill={palette.accentSoft} r={1.4} />
      <Sparkle
        cx={174}
        cy={76}
        delay="s5"
        fill={palette.accentBright}
        r={1.2}
      />
      <Sparkle cx={60} cy={14} delay="s3" fill={palette.accentText} r={1.3} />
      <Sparkle cx={126} cy={16} delay="s9" fill={palette.accent} r={1.1} />
      <Sparkle cx={90} cy={124} delay="s11" fill={palette.accentSoft} r={1.2} />
    </>
  );
};

/**
 * A short stack of photo frames with nothing developed on the top one — for a
 * muse gallery with no media in it yet.
 */
export const EmptyGalleryScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={68} fill={`url(#${glowId})`} rx={78} ry={56} />
      <Shadow cx={92} cy={124} fill={palette.edge} rx={46} ry={5} />

      <Tilt cx={90} cy={68}>
        {/* Two frames behind, fanned out so it reads as a stack */}
        <Rect
          fill={palette.paperTop}
          height="76"
          opacity="0.5"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.4"
          transform="rotate(-8 78 72)"
          width="84"
          x="36"
          y="34"
        />
        <Rect
          fill={palette.paperTop}
          height="76"
          opacity="0.75"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.4"
          transform="rotate(-3 94 68)"
          width="84"
          x="52"
          y="30"
        />
        {/* Front frame */}
        <Rect
          fill={`url(#${paperId})`}
          height="80"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.6"
          width="88"
          x="50"
          y="26"
        />
        {/* The window where a photo would go */}
        <Rect
          fill={palette.edge}
          height="52"
          rx="4"
          stroke={palette.line}
          strokeWidth="1.1"
          width="72"
          x="58"
          y="34"
        />
        {/* Hills and a sun — the placeholder nothing has replaced */}
        <Circle
          cx="112"
          cy="48"
          fill={palette.accentSolid}
          opacity="0.7"
          r="5.5"
        />
        <Path
          d="M58 86 L58 76 L76 58 L94 78 L104 68 L130 86 Z"
          fill={palette.accentSoft}
          opacity="0.45"
        />
        <Path
          d="M58 86 L58 80 L76 62 L92 80 L96 86 Z"
          fill={palette.accentSoft}
          opacity="0.3"
        />
        {/* Caption line under the window */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M58 96 L106 96" pathLength="1" />
        </G>
      </Tilt>

      {/* Sparkle field */}
      <Star delay="s1" fill={palette.accent} scale={0.85} x={18} y={34} />
      <Star delay="s4" fill={palette.accentSoft} scale={0.7} x={162} y={46} />
      <Star
        delay="s7"
        fill={palette.accentBright}
        scale={0.55}
        x={24}
        y={104}
      />
      <Star delay="s10" fill={palette.accentText} scale={0.5} x={158} y={102} />
      <Sparkle cx={8} cy={70} delay="s2" fill={palette.accentSoft} r={1.4} />
      <Sparkle
        cx={172}
        cy={76}
        delay="s5"
        fill={palette.accentBright}
        r={1.2}
      />
      <Sparkle cx={66} cy={10} delay="s3" fill={palette.accentText} r={1.3} />
      <Sparkle cx={134} cy={12} delay="s9" fill={palette.accent} r={1.1} />
      <Sparkle cx={40} cy={122} delay="s11" fill={palette.accentSoft} r={1.2} />
    </>
  );
};
