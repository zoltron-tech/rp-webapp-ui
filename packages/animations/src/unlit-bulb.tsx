import {
  Glow,
  SceneDefs,
  type SceneProps,
  Shadow,
  Sparkle,
  Star,
  useGradientIds,
} from "./muse-scenes";
import { Circle, G, Path, Rect } from "./primitives";

/**
 * A light bulb on its cord, not lit yet, with the light it isn't giving
 * dashed out around it — for a character with no headcanons. Canon's icon is
 * a bulb; the dashes say the idea is there, nobody has switched it on.
 *
 * Conventions are the muse scenes' (`muse-scenes.tsx`), and like the silent
 * bell it needs no rhythm of its own: the bulb hangs from its cord and sways
 * on `nwm-ribbon`, leans on `nwm-tilt`, and the unlit rays pulse on
 * `nwm-bond`.
 */

/** The grid the scene is drawn on. Both clients scale from it. */
export const UNLIT_BULB_VIEW_BOX = "0 0 180 137";

/** Where the bulb hangs from: the top centre of its own box (the cord's end). */
const HANG_X = 90;
const HANG_Y = 2;

/** The lean's origin: 50% across and 60% down the hanging box (y 2–86). */
const LEAN_X = 90;
const LEAN_Y = 51;

export const UnlitBulbScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={70} fill={`url(#${glowId})`} rx={76} ry={56} />
      <Shadow cx={90} cy={124} fill={palette.edge} rx={30} ry={4.5} />

      {/* The light it is not giving */}
      <G
        className="nwm-bond"
        fill="none"
        stroke={palette.accentSolid}
        strokeDasharray="3 5"
        strokeLinecap="round"
        strokeWidth="2"
      >
        <Path d="M38 62 L52 62" />
        <Path d="M128 62 L142 62" />
        <Path d="M50 32 L60 41" />
        <Path d="M130 32 L120 41" />
        <Path d="M50 94 L60 85" />
        <Path d="M130 94 L120 85" />
      </G>

      <G transform={`translate(${LEAN_X} ${LEAN_Y})`}>
        <G className="nwm-tilt">
          <G transform={`translate(${HANG_X - LEAN_X} ${HANG_Y - LEAN_Y})`}>
            <G className="nwm-ribbon">
              <G transform={`translate(${-HANG_X} ${-HANG_Y})`}>
                {/* Cord */}
                <Path
                  d="M90 2 L90 22"
                  stroke={palette.line}
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
                {/* Socket, with its two ridges */}
                <Rect
                  fill={palette.edge}
                  height="15"
                  rx="3"
                  stroke={palette.line}
                  strokeWidth="1.4"
                  width="20"
                  x="80"
                  y="21"
                />
                <Path
                  d="M80.5 26 L99.5 26 M80.5 31 L99.5 31"
                  stroke={palette.line}
                  strokeWidth="1.1"
                />
                {/* Glass */}
                <Path
                  d="M82 36 C82 42 66 46 66 62 C66 76 77 86 90 86 C103 86 114 76 114 62 C114 46 98 42 98 36 Z"
                  fill={`url(#${paperId})`}
                  stroke={palette.line}
                  strokeWidth="1.6"
                />
                {/* Shading down the left side, where the glass curves away */}
                <Path
                  d="M82 36 C82 42 66 46 66 62 C66 72 71 80 78 84 C73 76 72 68 74 58 C76 48 82 43 82 36 Z"
                  fill={palette.edge}
                  opacity="0.4"
                />
                {/* A highlight on the glass */}
                <Path
                  d="M102 50 C106 54 108 59 108 64"
                  fill="none"
                  stroke={palette.paperTop}
                  strokeLinecap="round"
                  strokeWidth="2.2"
                />
                {/* The filament, cold */}
                <Path
                  d="M84 38 L84 54 Q87 62 90 54 Q93 62 96 54 L96 38"
                  fill="none"
                  opacity="0.75"
                  stroke={palette.accentSolid}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
                <Circle
                  cx="90"
                  cy="72"
                  fill={palette.accentSolid}
                  opacity="0.35"
                  r="2.4"
                />
              </G>
            </G>
          </G>
        </G>
      </G>

      {/* Sparkle field */}
      <Star delay="s1" fill={palette.accent} scale={0.75} x={20} y={34} />
      <Star delay="s4" fill={palette.accentSoft} scale={0.65} x={160} y={38} />
      <Star delay="s7" fill={palette.accentBright} scale={0.5} x={26} y={106} />
      <Star
        delay="s10"
        fill={palette.accentText}
        scale={0.45}
        x={156}
        y={104}
      />
      <Sparkle cx={8} cy={70} delay="s2" fill={palette.accentSoft} r={1.4} />
      <Sparkle
        cx={172}
        cy={72}
        delay="s5"
        fill={palette.accentBright}
        r={1.2}
      />
      <Sparkle cx={60} cy={10} delay="s3" fill={palette.accentText} r={1.3} />
    </>
  );
};
