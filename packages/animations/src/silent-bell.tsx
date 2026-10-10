import {
  Glow,
  type SceneProps,
  SceneDefs,
  Shadow,
  Sparkle,
  Star,
  useGradientIds,
} from "./muse-scenes";
import { Circle, G, Path } from "./primitives";

/**
 * A bell at rest with the ring it isn't making dashed out either side — for an
 * empty notifications list. The dashes carry the meaning: the bell works, it
 * just has nothing to announce.
 *
 * Web's `NoNotificationsArt` (`apps/web/src/components/book-art`), against the
 * shared primitives so the phone's Alerts tab shows the same bell. Conventions
 * are the muse scenes' — see `muse-scenes.tsx` and `open-book.tsx`.
 *
 * Nothing here needs a rhythm of its own: the bell hangs from its crown and
 * sways on `nwm-ribbon`, leans on `nwm-tilt`, and the unmade ring pulses on
 * `nwm-bond`.
 */

/** The grid the scene is drawn on. Both clients scale from it. */
export const SILENT_BELL_VIEW_BOX = "0 0 180 137";

/** Where the bell hangs from: the top centre of its own box. */
const HANG_X = 90;
const HANG_Y = 27.5;

/** The lean's origin: 50% across and 60% down the bell's box. */
const LEAN_X = 90;
const LEAN_Y = 80;

export const SilentBellScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={70} fill={`url(#${glowId})`} rx={76} ry={56} />
      <Shadow cx={90} cy={126} fill={palette.edge} rx={38} ry={5} />

      {/* The ring it is not making */}
      <G
        className="nwm-bond"
        fill="none"
        stroke={palette.accentSolid}
        strokeDasharray="4 6"
        strokeLinecap="round"
        strokeWidth="2"
      >
        <Path d="M44 50 A30 30 0 0 0 44 92" />
        <Path d="M136 50 A30 30 0 0 1 136 92" />
      </G>

      <G transform={`translate(${LEAN_X} ${LEAN_Y})`}>
        <G className="nwm-tilt">
          <G transform={`translate(${HANG_X - LEAN_X} ${HANG_Y - LEAN_Y})`}>
            <G className="nwm-ribbon">
              <G transform={`translate(${-HANG_X} ${-HANG_Y})`}>
                {/* Crown */}
                <Circle
                  cx="90"
                  cy="33"
                  fill={palette.accentSolid}
                  opacity="0.85"
                  r="5.5"
                />
                {/* Bell */}
                <Path
                  d="M62 96 L62 66 C62 50 74 37 90 37 C106 37 118 50 118 66 L118 96 Z"
                  fill={`url(#${paperId})`}
                  stroke={palette.line}
                  strokeWidth="1.6"
                />
                {/* Shading down the left flank, where the bell curves away */}
                <Path
                  d="M62 96 L62 66 C62 55 67 46 74 41 L74 96 Z"
                  fill={palette.edge}
                  opacity="0.4"
                />
                {/* Rim */}
                <Path
                  d="M54 93 L126 93 Q130 93 130 97.5 Q130 102 126 102 L54 102 Q50 102 50 97.5 Q50 93 54 93 Z"
                  fill={palette.edge}
                  stroke={palette.line}
                  strokeWidth="1.4"
                />
                {/* Clapper, hanging still */}
                <Circle
                  cx="90"
                  cy="109"
                  fill={palette.accentSolid}
                  opacity="0.8"
                  r="5.5"
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
      <Star delay="s10" fill={palette.accentText} scale={0.45} x={156} y={104} />
      <Sparkle cx={8} cy={70} delay="s2" fill={palette.accentSoft} r={1.4} />
      <Sparkle cx={172} cy={72} delay="s5" fill={palette.accentBright} r={1.2} />
      <Sparkle cx={90} cy={8} delay="s3" fill={palette.accentText} r={1.3} />
    </>
  );
};
