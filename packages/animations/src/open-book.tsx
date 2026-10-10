import { useId } from "react";
import {
  Glow,
  type SceneProps,
  SceneDefs,
  Shadow,
  Sparkle,
  Star,
  Tilt,
  useGradientIds,
} from "./muse-scenes";
import {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  SvgText,
} from "./primitives";

/**
 * An open book with a quill poised over the first ruled line — for a feed that
 * has nothing in it yet, where something is still expected to be written.
 *
 * Web draws this on a novelist's profile when their activity, posts or prompts
 * tab is empty (`OpenBookArt` in `apps/web/src/components/book-art`), and the
 * phone showed a line of grey text in the same three places. This is that
 * drawing against the shared primitives, so the phone shows the same book.
 *
 * It follows the muse scenes' conventions — see `muse-scenes.tsx` — and borrows
 * their haze, shadow, sparkles and tilt, because it is the same paper object:
 * the palette is injected, every moving part sits on a group that only moves
 * inside a group that only places it, and the class names are `nwm-…`.
 *
 * ## The two parts that are this scene's own
 *
 * - **The quill** swings about where a hand would grip the shaft. Web says that
 *   as `transform-origin: 50% 45%` of the quill's own box; here the group is
 *   placed at that point instead, which is the same point on both clients.
 * - **The ink drop** gathers at the nib, falls, and fades before it lands.
 *
 * The waiting "?" pulses on `nwm-bond`, which is the same question-mark pulse
 * the unjoined bond uses.
 */

/** The grid the scene is drawn on. Both clients scale from it. */
export const OPEN_BOOK_VIEW_BOX = "0 0 200 160";

/** Where the quill is held: 50% across and 45% down its own bounding box. */
const GRIP_X = 145.5;
const GRIP_Y = 41;

export const OpenBookScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const featherId = `nwm-feather-${uid}`;
  const inkId = `nwm-ink-${uid}`;

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Defs>
        {/* Feather deepens at the base and brightens toward the tip */}
        <LinearGradient id={featherId} x1="0" x2="1" y1="1" y2="0">
          <Stop offset="0%" stopColor={palette.accentSoft} stopOpacity="0.7" />
          <Stop offset="55%" stopColor={palette.accent} stopOpacity="0.8" />
          <Stop
            offset="100%"
            stopColor={palette.accentText}
            stopOpacity="0.95"
          />
        </LinearGradient>
        <LinearGradient id={inkId} x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0%" stopColor={palette.accentText} />
          <Stop offset="100%" stopColor={palette.accentSoft} />
        </LinearGradient>
      </Defs>

      <Glow cx={100} cy={88} fill={`url(#${glowId})`} rx={86} ry={66} />
      <Shadow cx={100} cy={148} fill={palette.edge} rx={52} ry={6} />

      <Tilt cx={100} cy={85}>
        {/* Page stack — the thickness the tilt lets you see */}
        <Path
          d="M35 122 Q35 130 40 130 L95 130 L95 136 L40 136 Q33 136 33 128 Z"
          fill={palette.edge}
          stroke={palette.line}
          strokeWidth="1.2"
        />
        <Path
          d="M165 122 Q165 130 160 130 L105 130 L105 136 L160 136 Q167 136 167 128 Z"
          fill={palette.edge}
          stroke={palette.line}
          strokeWidth="1.2"
        />
        {/* Left page */}
        <Path
          d="M35 50 Q35 45 40 45 L95 45 L95 130 L40 130 Q35 130 35 125 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeWidth="1.5"
        />
        {/* Right page */}
        <Path
          d="M165 50 Q165 45 160 45 L105 45 L105 130 L160 130 Q165 130 165 125 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeWidth="1.5"
        />
        {/* Gutter shading — the page curve either side of the spine */}
        <Path
          d="M88 46 L95 45 L95 130 L88 129 Z"
          fill={palette.edge}
          opacity="0.6"
        />
        <Path
          d="M105 45 L112 46 L112 129 L105 130 Z"
          fill={palette.edge}
          opacity="0.35"
        />
        {/* Spine */}
        <Path d="M100 44 L100 131" stroke={palette.line} strokeWidth="2" />
        {/* Ruled lines — on the web they write themselves in on mount */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.2"
        >
          <Path d="M48 62 L88 62" pathLength="1" />
          <Path d="M112 62 L152 62" pathLength="1" />
          <Path d="M48 73 L88 73" pathLength="1" />
          <Path d="M112 73 L152 73" pathLength="1" />
          <Path d="M48 84 L76 84" pathLength="1" />
          <Path d="M112 84 L140 84" pathLength="1" />
          <Path d="M48 95 L88 95" pathLength="1" />
          <Path d="M112 95 L152 95" pathLength="1" />
        </G>
        <Path
          d="M48 106 L68 106"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.2"
        />
        {/* Ribbon marker slipped between the pages. Placed at its pivot — the
            top centre, where it leaves the book — so the free end swings. */}
        <G transform="translate(115 45)">
          <G className="nwm-ribbon">
            <Path
              d="M-5 0 h10 v21 l-5 -4.2 l-5 4.2 z"
              fill={palette.accentSolid}
              opacity="0.85"
            />
          </G>
        </G>
        {/* Quill — a bowed shaft with the vane widest around its middle,
            tapering to the tip and to a bare calamus that ends in the nib.
            Placed at the grip, so the nib does the swinging. */}
        <G transform={`translate(${GRIP_X} ${GRIP_Y})`}>
          <G className="nwm-quill">
            <G transform={`translate(${-GRIP_X} ${-GRIP_Y})`}>
              {/* Far vane — the side of the feather turned away from us */}
              <Path
                d="M160 8 C166 18 167 30 164 41 C161 50 152 56 145 58 C152 44 158 24 160 8 Z"
                fill={`url(#${featherId})`}
                opacity="0.45"
              />
              {/* Near vane — serrated outer edge, the way barbs split apart */}
              <Path
                d="M160 8 L156 14 L158 15 L151 23 L153 24 L147 30 L149 32 L144 40 L146 42 L142 51 L145 58 C150 45 158 24 160 8 Z"
                fill={`url(#${featherId})`}
              />
              {/* Barbs — short strokes raked back toward the tip */}
              <G
                opacity="0.45"
                stroke={palette.accentText}
                strokeLinecap="round"
                strokeWidth="0.9"
              >
                <Path d="M161 17 L157 15" />
                <Path d="M161 25 L155 22" />
                <Path d="M160 33 L152 29" />
                <Path d="M155 44 L148 39" />
                <Path d="M150 52 L145 48" />
                <Path d="M161 25 L165 28" />
                <Path d="M158 36 L163 39" />
                <Path d="M152 48 L156 50" />
              </G>
              {/* Rachis — through the vane, then on as the bare calamus */}
              <Path
                d="M160 8 C168 30 150 58 126 76"
                fill="none"
                opacity="0.9"
                stroke={palette.accentText}
                strokeLinecap="round"
                strokeWidth="1.5"
              />
              {/* Nib — wedge and slit */}
              <Path d="M132 65 L137 70 L124 81 Z" fill={palette.accentSolid} />
              <Path
                d="M131 70 L124 81"
                opacity="0.9"
                stroke={palette.accentText}
                strokeLinecap="round"
                strokeWidth="0.7"
              />
            </G>
          </G>
        </G>
        {/* Ink drop */}
        <G transform="translate(123 85)">
          <G className="nwm-ink">
            <Circle cx={0} cy={0} fill={`url(#${inkId})`} r={1.6} />
          </G>
        </G>
        {/* "?" on the right page */}
        <G className="nwm-bond">
          <SvgText
            fill={palette.line}
            fontFamily="serif"
            fontSize="22"
            x="126"
            y="118"
          >
            ?
          </SvgText>
        </G>
      </Tilt>

      {/* Sparkle field — stars flare and turn, dots just breathe */}
      <Star delay="s1" fill={palette.accent} scale={0.95} x={24} y={34} />
      <Star delay="s4" fill={palette.accentText} scale={0.62} x={45} y={17} />
      <Star delay="s2" fill={palette.accentSoft} scale={0.85} x={176} y={30} />
      <Star
        delay="s7"
        fill={palette.accentBright}
        scale={0.55}
        x={157}
        y={13}
      />
      <Star delay="s9" fill={palette.accentText} scale={0.6} x={17} y={68} />
      <Star delay="s5" fill={palette.accent} scale={0.72} x={185} y={63} />
      <Star delay="s11" fill={palette.accentSoft} scale={0.5} x={100} y={22} />
      <Sparkle cx={33} cy={52} delay="s3" fill={palette.accentSoft} r={1.6} />
      <Sparkle cx={11} cy={47} delay="s6" fill={palette.accentBright} r={1.2} />
      <Sparkle cx={60} cy={9} delay="s8" fill={palette.accent} r={1.4} />
      <Sparkle cx={191} cy={44} delay="s10" fill={palette.accentText} r={1.3} />
      <Sparkle cx={170} cy={78} delay="s12" fill={palette.accentSoft} r={1.5} />
      <Sparkle cx={22} cy={92} delay="s2" fill={palette.accentBright} r={1.3} />
      <Sparkle cx={180} cy={100} delay="s6" fill={palette.accent} r={1.2} />
    </>
  );
};
