import { type ReactNode, useId } from "react";
import {
  Glow,
  SceneDefs,
  type SceneProps,
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
  Rect,
  Stop,
} from "./primitives";
import type { ScenePalette } from "./scene-palette";

/**
 * The rest of web's empty states, drawn once.
 *
 * `apps/web/src/components/book-art` has a drawing for every list that can
 * come up empty and every page that can turn out to be gone. The muse scenes,
 * the open book and the silent bell moved here as the phone needed them; these
 * are the ones that were still web-only, so the phone showed a grey sentence
 * (or a stock icon) where web shows a scene:
 *
 *  - `NoMatchesScene` — cards under a magnifier that has come up empty
 *  - `BlankStoryboardScene` — a storyboard sheet with every panel still blank
 *  - `NoInteractionsScene` — a message sent and a reply slot still dashed
 *  - `NoFriendsScene` — an avatar row with the last place open
 *  - `NoConversationsScene` — two bubbles, one of them still being typed
 *  - `FrozenSilenceScene` — a frozen speech bubble, rail-sized
 *  - `VanishedMuseScene` — a character card whose figure is leaving as dust
 *  - `TornThreadScene` — a thread page torn in two
 *  - `EmptyShelfScene` — a shelf plank, two spines leaning on a closed book
 *
 * Conventions are the muse scenes' — see `muse-scenes.tsx`: the palette is
 * injected, every moving part sits on a group that only moves inside a group
 * that only places it, and class names are `nwm-…`. Anything web pulses as
 * `.ghost` rides `nwm-bond`, which is the same question-mark pulse.
 *
 * The motion that is these scenes' own — the lens, the ice, the scrap and its
 * flakes, the vanishing figure and its motes, the settling spine — is
 * registered beside the rest in `muse-scenes.motion.native.tsx`.
 */

export const NO_MATCHES_VIEW_BOX = "0 0 180 137";
export const BLANK_STORYBOARD_VIEW_BOX = "0 0 180 137";
export const NO_INTERACTIONS_VIEW_BOX = "0 0 180 137";
export const NO_FRIENDS_VIEW_BOX = "0 0 180 137";
export const NO_CONVERSATIONS_VIEW_BOX = "0 0 180 137";
export const FROZEN_SILENCE_VIEW_BOX = "0 0 64 56";
export const VANISHED_MUSE_VIEW_BOX = "0 0 180 137";
export const TORN_THREAD_VIEW_BOX = "0 0 180 137";
export const EMPTY_SHELF_VIEW_BOX = "0 0 180 137";

/** The four accent roles a sparkle can take, by the letter the tables use. */
type Tint = "a" | "b" | "s" | "t";

const tint = (palette: ScenePalette, key: Tint): string =>
  key === "a"
    ? palette.accent
    : key === "b"
      ? palette.accentBright
      : key === "s"
        ? palette.accentSoft
        : palette.accentText;

type StarSpec = readonly [
  x: number,
  y: number,
  scale: number,
  tint: Tint,
  delay: string,
];
type DotSpec = readonly [
  cx: number,
  cy: number,
  r: number,
  tint: Tint,
  delay: string,
];

/** A scene's sparkle field: stars flare and turn, dots just breathe. */
const Sparkles = ({
  dots,
  palette,
  stars,
}: SceneProps & { dots: readonly DotSpec[]; stars: readonly StarSpec[] }) => (
  <>
    {stars.map(([x, y, scale, key, delay]) => (
      <Star
        delay={delay}
        fill={tint(palette, key)}
        key={`star-${x}-${y}`}
        scale={scale}
        x={x}
        y={y}
      />
    ))}
    {dots.map(([cx, cy, r, key, delay]) => (
      <Sparkle
        cx={cx}
        cy={cy}
        delay={delay}
        fill={tint(palette, key)}
        key={`dot-${cx}-${cy}`}
        r={r}
      />
    ))}
  </>
);

/** A moving part, placed at the point it turns about. */
const Pivot = ({
  children,
  className,
  x,
  y,
}: {
  children: ReactNode;
  className: string;
  x: number;
  y: number;
}) => (
  <G transform={`translate(${x} ${y})`}>
    <G className={className}>
      <G transform={`translate(${-x} ${-y})`}>{children}</G>
    </G>
  </G>
);

/**
 * Character cards under a magnifier whose lens has come up empty — for a list
 * that has content but nothing matching what was asked for.
 */
export const NoMatchesScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={88} cy={68} fill={`url(#${glowId})`} rx={78} ry={56} />
      <Shadow cx={66} cy={120} fill={palette.edge} rx={40} ry={5} />

      <Tilt cx={87} cy={76}>
        {/* A card behind, so it reads as a list rather than one item */}
        <Rect
          fill={palette.paperTop}
          height="70"
          opacity="0.55"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.3"
          transform="rotate(-7 49 71)"
          width="54"
          x="22"
          y="36"
        />
        {/* Front card */}
        <Rect
          fill={`url(#${paperId})`}
          height="74"
          rx="7"
          stroke={palette.line}
          strokeWidth="1.5"
          width="58"
          x="36"
          y="30"
        />
        <Circle cx="65" cy="54" fill={palette.accentSoft} opacity="0.5" r="9" />
        <Path
          d="M52 72 Q52 60 65 60 Q78 60 78 72 Z"
          fill={palette.accentSoft}
          opacity="0.32"
        />
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.3"
        >
          <Path d="M46 84 L84 84" pathLength="1" />
          <Path d="M52 94 L78 94" pathLength="1" />
        </G>
        {/* Magnifier, swinging across the cards with nothing in the lens.
            Placed at the handle's end, the way a hand would hold it. */}
        <Pivot className="nwm-lens" x={147} y={89}>
          <Circle
            cx="118"
            cy="58"
            fill={palette.paperTop}
            opacity="0.55"
            r="24"
          />
          {/* The empty result inside the glass */}
          <Circle
            cx="118"
            cy="58"
            fill="none"
            opacity="0.7"
            r="11"
            stroke={palette.accentSoft}
            strokeDasharray="4 5"
            strokeWidth="1.6"
          />
          <Circle
            cx="118"
            cy="58"
            fill="none"
            opacity="0.85"
            r="24"
            stroke={palette.accentSolid}
            strokeWidth="3.4"
          />
          <Path
            d="M135 75 L151 93"
            opacity="0.85"
            stroke={palette.accentSolid}
            strokeLinecap="round"
            strokeWidth="5"
          />
        </Pivot>
      </Tilt>

      <Sparkles
        dots={[
          [6, 70, 1.4, "s", "s2"],
          [174, 74, 1.2, "b", "s5"],
          [58, 10, 1.3, "t", "s3"],
          [132, 14, 1.1, "a", "s9"],
          [98, 124, 1.2, "s", "s11"],
        ]}
        palette={palette}
        stars={[
          [16, 34, 0.8, "a", "s1"],
          [164, 40, 0.7, "s", "s4"],
          [22, 104, 0.55, "b", "s7"],
          [160, 106, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

/**
 * A storyboard sheet whose panels are all still empty — for a novelist who
 * hasn't started any stories, and for a story that is no longer there.
 */
export const BlankStoryboardScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={70} fill={`url(#${glowId})`} rx={82} ry={56} />
      <Shadow cx={90} cy={124} fill={palette.edge} rx={56} ry={5} />

      <Tilt cx={90} cy={81}>
        {/* Sheet edge — the thickness the tilt lets you see */}
        <Path
          d="M20 104 L160 104 L160 110 Q160 116 154 116 L26 116 Q20 116 20 110 Z"
          fill={palette.edge}
          stroke={palette.line}
          strokeWidth="1.2"
        />
        {/* Sheet */}
        <Rect
          fill={`url(#${paperId})`}
          height="80"
          rx="8"
          stroke={palette.line}
          strokeWidth="1.5"
          width="144"
          x="18"
          y="28"
        />
        {/* Three empty panels — the scenes nobody has drawn */}
        <G fill={palette.edge} stroke={palette.line} strokeWidth="1.1">
          <Rect height="42" rx="4" width="38" x="28" y="42" />
          <Rect height="42" rx="4" width="38" x="71" y="42" />
          <Rect height="42" rx="4" width="38" x="114" y="42" />
        </G>
        {/* Beats between the panels */}
        <G
          fill="none"
          opacity="0.7"
          stroke={palette.accentSolid}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        >
          <Path d="M67 59 L69.5 63 L67 67" />
          <Path d="M110 59 L112.5 63 L110 67" />
        </G>
        {/* Caption line under each panel */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.3"
        >
          <Path d="M31 94 L59 94" pathLength="1" />
          <Path d="M74 94 L102 94" pathLength="1" />
          <Path d="M117 94 L145 94" pathLength="1" />
        </G>
        {/* Tab clipped to the top of the sheet, placed at its pivot */}
        <G transform="translate(135 28)">
          <G className="nwm-ribbon">
            <Path
              d="M-5 0 h10 v12 l-5 -3 l-5 3 z"
              fill={palette.accentSolid}
              opacity="0.85"
            />
          </G>
        </G>
      </Tilt>

      <Sparkles
        dots={[
          [5, 70, 1.4, "s", "s2"],
          [175, 74, 1.2, "b", "s5"],
          [52, 12, 1.3, "t", "s3"],
          [128, 14, 1.1, "a", "s9"],
          [90, 128, 1.2, "s", "s11"],
        ]}
        palette={palette}
        stars={[
          [12, 36, 0.8, "a", "s1"],
          [168, 44, 0.7, "s", "s4"],
          [16, 102, 0.55, "b", "s7"],
          [166, 100, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

/**
 * A message sent and a reply slot still dashed and empty — for the
 * interactions list when nothing is running.
 */
export const NoInteractionsScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={70} fill={`url(#${glowId})`} rx={80} ry={58} />
      <Shadow cx={92} cy={132} fill={palette.edge} rx={48} ry={4.5} />

      <Tilt cx={90} cy={85}>
        {/* The message that went out */}
        <Path
          d="M28 20 L96 20 Q108 20 108 32 L108 58 Q108 70 96 70 L54 70 L40 84 L40 70 L28 70 Q16 70 16 58 L16 32 Q16 20 28 20 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeWidth="1.5"
        />
        {/* Shading down the left edge, where the bubble curves away */}
        <Path
          d="M28 21 Q17 21 17 32 L17 58 Q17 69 28 69 L36 69 L36 21 Z"
          fill={palette.edge}
          opacity="0.4"
        />
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M46 36 L94 36" pathLength="1" />
          <Path d="M46 48 L78 48" pathLength="1" />
        </G>
        {/* The reply that never came */}
        <G className="nwm-bond">
          <Path
            d="M84 72 L152 72 Q164 72 164 84 L164 102 Q164 114 152 114 L144 114 L152 128 L124 114 L84 114 Q72 114 72 102 L72 84 Q72 72 84 72 Z"
            fill="none"
            stroke={palette.accentSolid}
            strokeDasharray="5 5"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </G>
      </Tilt>

      <Sparkles
        dots={[
          [6, 60, 1.4, "s", "s2"],
          [174, 72, 1.2, "b", "s5"],
          [60, 8, 1.3, "t", "s3"],
          [58, 128, 1.2, "s", "s11"],
        ]}
        palette={palette}
        stars={[
          [14, 92, 0.8, "a", "s1"],
          [168, 40, 0.7, "s", "s4"],
          [126, 12, 0.55, "b", "s7"],
          [30, 116, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

/**
 * An avatar row with the last place still open — for a novelist with no
 * friends yet.
 */
export const NoFriendsScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={68} fill={`url(#${glowId})`} rx={78} ry={56} />
      <Shadow cx={90} cy={124} fill={palette.edge} rx={48} ry={5} />

      <Tilt cx={90} cy={79}>
        {/* Card edge — the thickness the tilt lets you see */}
        <Path
          d="M30 104 L150 104 L150 110 Q150 116 144 116 L36 116 Q30 116 30 110 Z"
          fill={palette.edge}
          stroke={palette.line}
          strokeWidth="1.2"
        />
        {/* Card */}
        <Rect
          fill={`url(#${paperId})`}
          height="82"
          rx="8"
          stroke={palette.line}
          strokeWidth="1.5"
          width="124"
          x="28"
          y="24"
        />
        {/* Two friends, overlapping the way an avatar stack does. Each ring
            is stroked in the card colour so the one behind reads as behind. */}
        <Circle
          cx="66"
          cy="54"
          fill={palette.edge}
          r="15"
          stroke={palette.paperBottom}
          strokeWidth="2.5"
        />
        <Circle cx="66" cy="49" fill={palette.accentSoft} opacity="0.5" r="5" />
        <Path
          d="M57 64 Q57 55 66 55 Q75 55 75 64 Z"
          fill={palette.accentSoft}
          opacity="0.32"
        />
        <Circle
          cx="90"
          cy="54"
          fill={palette.edge}
          r="15"
          stroke={palette.paperBottom}
          strokeWidth="2.5"
        />
        <Circle cx="90" cy="49" fill={palette.accentSoft} opacity="0.5" r="5" />
        <Path
          d="M81 64 Q81 55 90 55 Q99 55 99 64 Z"
          fill={palette.accentSoft}
          opacity="0.32"
        />
        {/* The place nobody has taken */}
        <Circle cx="114" cy="54" fill={palette.paperBottom} r="15" />
        <G
          className="nwm-bond"
          fill="none"
          stroke={palette.accentSolid}
          strokeLinecap="round"
        >
          <Circle
            cx="114"
            cy="54"
            r="15"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
          <Path d="M114 47 L114 61" strokeWidth="2.2" />
          <Path d="M107 54 L121 54" strokeWidth="2.2" />
        </G>
        {/* Names under the row */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M52 84 L128 84" pathLength="1" />
          <Path d="M66 94 L114 94" pathLength="1" />
        </G>
      </Tilt>

      <Sparkles
        dots={[
          [6, 70, 1.4, "s", "s2"],
          [174, 74, 1.2, "b", "s5"],
          [62, 10, 1.3, "t", "s3"],
          [120, 126, 1.2, "s", "s11"],
        ]}
        palette={palette}
        stars={[
          [14, 36, 0.8, "a", "s1"],
          [166, 44, 0.7, "s", "s4"],
          [20, 102, 0.55, "b", "s7"],
          [162, 100, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

/** Where the three typing dots sit in the reply bubble. */
const TYPING_DOTS = [48, 66, 84];

/**
 * Two bubbles mid-exchange, one of them still being typed — for a
 * conversations list with nothing in it.
 */
export const NoConversationsScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={68} fill={`url(#${glowId})`} rx={80} ry={58} />
      <Shadow cx={86} cy={130} fill={palette.edge} rx={50} ry={5} />

      <Tilt cx={90} cy={82}>
        {/* Their message, sitting behind */}
        <Path
          d="M72 14 L152 14 Q164 14 164 26 L164 50 Q164 62 152 62 L142 62 L150 76 L122 62 L72 62 Q60 62 60 50 L60 26 Q60 14 72 14 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeWidth="1.5"
        />
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M74 30 L150 30" pathLength="1" />
          <Path d="M74 44 L128 44" pathLength="1" />
        </G>
        {/* Your reply, still being typed */}
        <Path
          d="M28 62 L104 62 Q116 62 116 74 L116 100 Q116 112 104 112 L54 112 L40 128 L40 112 L28 112 Q16 112 16 100 L16 74 Q16 62 28 62 Z"
          fill={palette.accentSolid}
          fillOpacity="0.14"
          stroke={palette.accentSolid}
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        {TYPING_DOTS.map((cx, index) => (
          <G key={cx} transform={`translate(${cx} 87)`}>
            <G className={`nwm-dot d${index + 1}`}>
              <Circle cx={0} cy={0} fill={palette.accentSolid} r={4.5} />
            </G>
          </G>
        ))}
      </Tilt>

      <Sparkles
        dots={[
          [6, 76, 1.4, "s", "s2"],
          [174, 42, 1.2, "b", "s5"],
          [96, 6, 1.3, "t", "s3"],
          [126, 128, 1.2, "s", "s11"],
        ]}
        palette={palette}
        stars={[
          [14, 40, 0.8, "a", "s1"],
          [170, 80, 0.7, "s", "s4"],
          [144, 104, 0.55, "b", "s7"],
          [38, 20, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

/**
 * A frozen speech bubble with a crack across it — for the ice breaker rail
 * when nobody has posted one. Much smaller than the other scenes: it sits
 * inline beside 12px text, so there is no tilt, no shadow and no sparkle
 * field, and the strokes are heavy because at this size fine detail is mush.
 *
 * Web's crack travels and refreezes on `stroke-dashoffset`, which the native
 * kit cannot carry; here it is simply there.
 */
export const FrozenSilenceScene = ({ palette }: SceneProps) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const iceId = `nwm-ice-${uid}`;

  return (
    <>
      <Defs>
        {/* Ice reads as the accent chilled toward white at the top */}
        <LinearGradient id={iceId} x1="0" x2="0.4" y1="0" y2="1">
          <Stop offset="0%" stopColor={palette.accentText} stopOpacity="0.28" />
          <Stop
            offset="100%"
            stopColor={palette.accentSoft}
            stopOpacity="0.2"
          />
        </LinearGradient>
      </Defs>
      <Pivot className="nwm-ice" x={32} y={28}>
        <Path
          d="M13 5 L51 5 Q60 5 60 14 L60 31 Q60 40 51 40 L28 40 L17 52 L17 40 L13 40 Q4 40 4 31 L4 14 Q4 5 13 5 Z"
          fill={`url(#${iceId})`}
          stroke={palette.accentBright}
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
        <G
          fill="none"
          opacity="0.8"
          stroke={palette.accentText}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        >
          <Path d="M23 9 L31 20 L25 25 L32 36" />
          <Path d="M31 20 L43 15" />
        </G>
      </Pivot>
      {/* Frost glints coming off it */}
      <Star delay="s5" fill={palette.accentBright} scale={0.42} x={58} y={47} />
      <Sparkle cx={60} cy={3} delay="s3" fill={palette.accentText} r={1.6} />
    </>
  );
};

/**
 * A character card with nobody on it any more: the portrait's figure thins
 * out and comes away as dust off the top corner, over a name that has been
 * struck through. For a character that was deleted.
 */
export const VanishedMuseScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const figureId = `nwm-figure-${uid}`;

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Defs>
        {/* Solid at the shoulders and already thin at the crown, which is the
            end the figure is leaving from. */}
        <LinearGradient id={figureId} x1="0" x2="0" y1="1" y2="0">
          <Stop offset="0%" stopColor={palette.accentSoft} stopOpacity="0.9" />
          <Stop offset="60%" stopColor={palette.accent} stopOpacity="0.7" />
          <Stop
            offset="100%"
            stopColor={palette.accentText}
            stopOpacity="0.3"
          />
        </LinearGradient>
      </Defs>
      <Glow cx={90} cy={68} fill={`url(#${glowId})`} rx={80} ry={56} />
      <Shadow cx={90} cy={130} fill={palette.edge} rx={40} ry={4.5} />

      <Tilt cx={92} cy={77}>
        {/* A second card behind, so this reads as one of a deck */}
        <Rect
          fill={palette.edge}
          height="96"
          opacity="0.7"
          rx="9"
          stroke={palette.line}
          strokeWidth="1.2"
          transform="rotate(7 94 68)"
          width="64"
          x="62"
          y="20"
        />
        {/* The card */}
        <Rect
          fill={`url(#${paperId})`}
          height="98"
          rx="9"
          stroke={palette.line}
          strokeWidth="1.5"
          width="64"
          x="58"
          y="18"
        />
        {/* Portrait window */}
        <Rect
          fill={palette.edge}
          height="52"
          opacity="0.55"
          rx="6"
          width="48"
          x="66"
          y="26"
        />
        {/* Where the figure stood — the outline it leaves behind */}
        <G
          fill="none"
          stroke={palette.line}
          strokeDasharray="2.5 3"
          strokeLinecap="round"
          strokeWidth="1.2"
        >
          <Circle cx="90" cy="45" r="9.5" />
          <Path d="M71 78 C71 65 79 59 90 59 C101 59 109 65 109 78" />
        </G>
        {/* The figure itself, thinning. Placed at its feet. */}
        <Pivot className="nwm-vanish" x={90} y={78}>
          <G fill={`url(#${figureId})`}>
            <Circle cx="90" cy="45" r="9.5" />
            <Path d="M71 78 C71 65 79 59 90 59 C101 59 109 65 109 78 Z" />
          </G>
        </Pivot>
        {/* Name and two lines of who they were */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M68 88 L104 88" pathLength="1" />
          <Path d="M68 98 L112 98" pathLength="1" />
          <Path d="M68 106 L94 106" pathLength="1" />
        </G>
        {/* The name, struck through */}
        <Path
          d="M65 90 C76 85 92 92 108 86"
          fill="none"
          opacity="0.85"
          stroke={palette.accentSolid}
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        {/* Dust coming off the crown and out past the card's corner */}
        <G transform="translate(86 38)">
          <G className="nwm-mote m1">
            <Circle cx={0} cy={0} fill={palette.accentBright} r={1.7} />
          </G>
        </G>
        <G transform="translate(95 34)">
          <G className="nwm-mote m2">
            <Circle cx={0} cy={0} fill={palette.accentBright} r={1.3} />
          </G>
        </G>
        <G transform="translate(100 42)">
          <G className="nwm-mote m3">
            <Path d="M0 0 l3 -1.4 l0.8 3 l-3 1 z" fill={palette.accentText} />
          </G>
        </G>
        <G transform="translate(91 30)">
          <G className="nwm-mote m4">
            <Circle cx={0} cy={0} fill={palette.accentBright} r={1.1} />
          </G>
        </G>
        <G transform="translate(104 33)">
          <G className="nwm-mote m5">
            <Path
              d="M0 0 l2.6 -1.2 l0.7 2.6 l-2.6 0.9 z"
              fill={palette.accentSolid}
            />
          </G>
        </G>
      </Tilt>

      <Sparkles
        dots={[
          [10, 68, 1.4, "s", "s2"],
          [172, 64, 1.3, "b", "s5"],
          [40, 18, 1.3, "a", "s8"],
          [140, 14, 1.2, "t", "s11"],
        ]}
        palette={palette}
        stars={[
          [20, 38, 0.8, "a", "s1"],
          [160, 30, 0.7, "s", "s4"],
          [24, 102, 0.55, "b", "s7"],
          [158, 98, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

/** Where each flake starts along the tear, and how solid it is. */
const FLAKES = [
  { d: "M0 0 l5 -2 l1 5 l-5 1 z", opacity: "0.8", x: 58, y: 56 },
  { d: "M0 0 l4 -3 l2 4 l-4 2 z", opacity: "0.7", x: 99, y: 58 },
  { d: "M0 0 l5 -2 l1 4 l-5 2 z", opacity: "0.65", x: 132, y: 55 },
];

/**
 * A thread page torn in two — the top half still pinned in place, the piece
 * carrying the rest of the words drifting off below it, paper flakes coming
 * away at the tear. For a thread, prompt or chapter that was deleted.
 */
export const TornThreadScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={68} fill={`url(#${glowId})`} rx={80} ry={56} />
      <Shadow cx={92} cy={130} fill={palette.edge} rx={46} ry={4.5} />

      <Tilt cx={92} cy={79}>
        {/* The half still pinned up — a thread bubble ripped across */}
        <Path
          d="M44 18 L136 18 Q146 18 146 28 L146 65 L137 58 L131 67 L124 62 L118 70 L111 57 L106 66 L99 63 L93 72 L87 59 L81 67 L75 62 L69 70 L62 57 L57 66 L50 61 L45 69 L39 58 L34 64 L34 28 Q34 18 44 18 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        {/* Shading down the left edge, where the bubble curves away */}
        <Path
          d="M44 19 Q35 19 35 28 L35 66 L44 66 L44 19 Z"
          fill={palette.edge}
          opacity="0.4"
        />
        {/* What was written, cut short by the tear */}
        <G
          className="nwm-lines"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="1.4"
        >
          <Path d="M50 32 L130 32" pathLength="1" />
          <Path d="M50 44 L112 44" pathLength="1" />
          <Path d="M50 55 L84 55" pathLength="1" />
        </G>
        {/* The half that went — drifting down and away, words already gone.
            The outer transform is the gap the tear opened; the pivot is at
            the tear, so the half hangs off it rather than sliding flat. */}
        <G transform="translate(7 14) rotate(-4 90 86)">
          <Pivot className="nwm-scrap" x={56} y={57}>
            <Path
              d="M34 64 L39 58 L45 69 L50 61 L57 66 L62 57 L69 70 L75 62 L81 67 L87 59 L93 72 L99 63 L106 66 L111 57 L118 70 L124 62 L131 67 L137 58 L146 65 L146 96 Q146 106 136 106 L44 106 Q34 106 34 96 Z"
              fill={`url(#${paperId})`}
              opacity="0.75"
              stroke={palette.line}
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            {/* Faded remains of the last lines on the torn-off half */}
            <G
              opacity="0.45"
              stroke={palette.line}
              strokeLinecap="round"
              strokeWidth="1.3"
            >
              <Path d="M50 87 L118 87" />
              <Path d="M50 96 L96 96" />
            </G>
          </Pivot>
        </G>
        {/* Flakes coming away along the tear */}
        {FLAKES.map((flake, index) => (
          <G key={flake.x} transform={`translate(${flake.x} ${flake.y})`}>
            <G className={`nwm-flake f${index + 1}`}>
              <Path
                d={flake.d}
                fill={palette.accentSolid}
                opacity={flake.opacity}
              />
            </G>
          </G>
        ))}
      </Tilt>

      <Sparkles
        dots={[
          [6, 72, 1.4, "s", "s2"],
          [174, 76, 1.2, "b", "s5"],
          [56, 8, 1.3, "t", "s3"],
          [124, 9, 1.1, "a", "s9"],
          [90, 126, 1.2, "s", "s11"],
        ]}
        palette={palette}
        stars={[
          [14, 40, 0.8, "a", "s1"],
          [166, 48, 0.7, "s", "s4"],
          [18, 104, 0.55, "b", "s7"],
          [164, 106, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

export const DARK_LIGHTHOUSE_VIEW_BOX = "0 0 180 137";

/** The dashed beams, as radii about the lamp: searching, not shining. */
const BEAMS = [16, 27, 38];
/** cos 35°, sin 35°: the half-angle the beams open to. */
const BEAM_COS = 0.819;
const BEAM_SIN = 0.574;
const LAMP = { x: 72, y: 36 };

/**
 * A lighthouse with its lamp out, on a rock in a night sea, the beam it
 * should throw drawn as dashed arcs that pulse one after another the way a
 * phone's signal bars search — for a screen that has nothing to show because
 * the phone has no network. Only this scene is about the *phone's* state
 * rather than the reader's content, which is why nothing in it is paper.
 *
 * Motion: the lamp breathes on `nwm-bond` (dim, trying), the arcs pulse on
 * the typing stagger (`nwm-dot d1…d3`), and the pennant on the roof sways on
 * `nwm-ribbon`. The sea line is a `nwm-lines` draw-in, still on native.
 */
export const DarkLighthouseScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={70} fill={`url(#${glowId})`} rx={80} ry={56} />
      <Shadow cx={90} cy={128} fill={palette.edge} rx={48} ry={4.5} />

      <Tilt cx={90} cy={80}>
        {/* A thin moon, the only light there is */}
        <Path
          d="M138 22 A10 10 0 1 0 138 42 A12 12 0 0 1 138 22 Z"
          fill={palette.accentBright}
          opacity="0.5"
        />
        {/* The sea */}
        <Path
          d="M12 108 Q24 102 36 108 T60 108 T84 108 T108 108 T132 108 T156 108 T168 108 L168 124 Q90 130 12 124 Z"
          fill={palette.accentSoft}
          opacity="0.28"
        />
        <G
          className="nwm-lines"
          fill="none"
          opacity="0.5"
          stroke={palette.accentText}
          strokeLinecap="round"
          strokeWidth="1.3"
        >
          <Path
            d="M20 117 Q32 112 44 117 T68 117 T92 117 T116 117 T140 117 T160 117"
            pathLength="1"
          />
        </G>
        {/* The rock */}
        <Path
          d="M48 110 Q52 96 72 97 Q92 96 96 110 Z"
          fill={palette.edge}
          stroke={palette.line}
          strokeWidth="1.2"
        />
        {/* The tower, tapering, with its two bands and a door */}
        <Path
          d="M58 100 L86 100 L80 48 L64 48 Z"
          fill={`url(#${paperId})`}
          stroke={palette.line}
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <G fill={palette.accentSoft} opacity="0.55">
          <Path d="M60.2 86 L83.8 86 L82.6 76 L61.4 76 Z" />
          <Path d="M62.7 64 L81.3 64 L80.6 56 L63.4 56 Z" />
        </G>
        <Rect fill={palette.edge} height="10" rx="3" width="6" x="69" y="90" />
        {/* The gallery and the lamp room */}
        <Rect
          fill={palette.edge}
          height="7"
          rx="2"
          stroke={palette.line}
          strokeWidth="1.2"
          width="26"
          x="59"
          y="42"
        />
        <Rect
          fill={palette.paperTop}
          height="12"
          rx="2"
          stroke={palette.line}
          strokeWidth="1.3"
          width="16"
          x="64"
          y="30"
        />
        <G opacity="0.6" stroke={palette.line} strokeWidth="1">
          <Path d="M69 30 L69 42" />
          <Path d="M75 30 L75 42" />
        </G>
        {/* The lamp, dim and trying */}
        <G className="nwm-bond">
          <Circle
            cx={LAMP.x}
            cy={LAMP.y}
            fill={palette.accentSolid}
            opacity="0.55"
            r="3.6"
          />
        </G>
        {/* The roof, and a pennant on it */}
        <Path
          d="M61 30 L72 21 L83 30 Z"
          fill={palette.accentSolid}
          opacity="0.85"
        />
        <Pivot className="nwm-ribbon" x={72} y={21}>
          <Path d="M72 21 L72 11" stroke={palette.line} strokeWidth="1.2" />
          <Path d="M72 12 L80 15 L72 18 Z" fill={palette.accentSolid} />
        </Pivot>
        {/* The beam it cannot throw: dashed, searching outward one arc at a time */}
        {BEAMS.map((r, index) => {
          const dx = BEAM_COS * r;
          const dy = BEAM_SIN * r;
          return (
            <G className={`nwm-dot d${index + 1}`} key={r}>
              <Path
                d={`M${LAMP.x + dx} ${LAMP.y - dy} A${r} ${r} 0 0 1 ${LAMP.x + dx} ${LAMP.y + dy}`}
                fill="none"
                opacity="0.8"
                stroke={palette.accentSolid}
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </G>
          );
        })}
      </Tilt>

      <Sparkles
        dots={[
          [6, 72, 1.4, "s", "s2"],
          [174, 66, 1.2, "b", "s5"],
          [112, 10, 1.3, "t", "s3"],
          [40, 16, 1.1, "a", "s9"],
        ]}
        palette={palette}
        stars={[
          [16, 38, 0.8, "a", "s1"],
          [164, 88, 0.7, "s", "s4"],
          [30, 96, 0.55, "b", "s7"],
          [120, 96, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};

/**
 * A short shelf plank with two spines leaning against a closed book and the
 * rest of the plank bare — for a novelist's bookshelf with nothing on it yet.
 *
 * One thing moves: the outer spine settles a little further into its lean and
 * eases back (`nwm-settle`), placed at its foot on the plank, which is the
 * point a leaning book rocks about. The plank is the same paper object as the
 * cards and sheets, in the edge tone so the books read against it.
 */
export const EmptyShelfScene = ({ palette }: SceneProps) => {
  const { glowId, paperId } = useGradientIds();

  return (
    <>
      <SceneDefs glowId={glowId} palette={palette} paperId={paperId} />
      <Glow cx={90} cy={70} fill={`url(#${glowId})`} rx={80} ry={56} />
      <Shadow cx={90} cy={130} fill={palette.edge} rx={58} ry={4.5} />

      <Tilt cx={90} cy={80}>
        {/* Brackets holding the plank to the wall */}
        <G
          fill={palette.edge}
          stroke={palette.line}
          strokeLinejoin="round"
          strokeWidth="1.2"
        >
          <Path d="M44 113 L44 125 L56 113 Z" />
          <Path d="M124 113 L136 125 L136 113 Z" />
        </G>
        {/* Plank edge — the thickness the tilt lets you see */}
        <Path
          d="M24 106 L156 106 L156 110 Q156 113 153 113 L27 113 Q24 113 24 110 Z"
          fill={palette.line}
          opacity="0.55"
          stroke={palette.line}
          strokeWidth="1.2"
        />
        {/* Plank */}
        <Rect
          fill={palette.edge}
          height="9"
          rx="1.5"
          stroke={palette.line}
          strokeWidth="1.5"
          width="134"
          x="23"
          y="98"
        />
        {/* Grain along it */}
        <G
          fill="none"
          opacity="0.5"
          stroke={palette.line}
          strokeLinecap="round"
          strokeWidth="0.9"
        >
          <Path d="M32 101.5 Q58 100.4 84 101.8 T136 101.4" />
          <Path d="M46 104.6 Q72 103.6 98 104.8 T148 104.2" />
        </G>
        {/* The closed book, standing on the plank: the page block showing
            down its far edge, then the cover over it */}
        <Path
          d="M138 43 L141.5 45.5 L141.5 98 L138 98 Z"
          fill={palette.paperTop}
          stroke={palette.line}
          strokeWidth="1"
        />
        <Rect
          fill={`url(#${paperId})`}
          height="58"
          rx="2.5"
          stroke={palette.line}
          strokeWidth="1.5"
          width="34"
          x="104"
          y="40"
        />
        {/* Shading down the spine side, where the cover curves round */}
        <Path
          d="M105 41 L112 41 L112 97 L105 97 Z"
          fill={palette.edge}
          opacity="0.45"
        />
        {/* Title and author on the cover */}
        <Rect
          fill={palette.accentSolid}
          height="4"
          opacity="0.8"
          rx="2"
          width="16"
          x="116"
          y="52"
        />
        <Rect
          fill={palette.accentSoft}
          height="2.5"
          opacity="0.6"
          rx="1.25"
          width="11"
          x="118.5"
          y="60"
        />
        {/* The spine leaning on the book, its foot on the plank */}
        <G transform="rotate(9 98 98)">
          <Rect
            fill={palette.paperTop}
            height="58"
            rx="1.5"
            stroke={palette.line}
            strokeWidth="1.4"
            width="12"
            x="86"
            y="40"
          />
          <Rect
            fill={palette.accentSolid}
            height="10"
            opacity="0.8"
            rx="1"
            width="8"
            x="88"
            y="47"
          />
          <Rect
            fill={palette.line}
            height="1.6"
            opacity="0.7"
            rx="0.8"
            width="8"
            x="88"
            y="84"
          />
        </G>
        {/* The outer spine, leaning on that one — the part that settles.
            Placed at its foot, which is the point it rocks about; the rotate
            inside is where it was drawn leaning. */}
        <Pivot className="nwm-settle" x={81} y={98}>
          <G transform="rotate(15 81 98)">
            <Rect
              fill={`url(#${paperId})`}
              height="52"
              rx="1.5"
              stroke={palette.line}
              strokeWidth="1.4"
              width="11"
              x="70"
              y="46"
            />
            <Rect
              fill={palette.accentSoft}
              height="9"
              opacity="0.75"
              rx="1"
              width="7"
              x="72"
              y="53"
            />
            <Rect
              fill={palette.line}
              height="1.6"
              opacity="0.7"
              rx="0.8"
              width="7"
              x="72"
              y="86"
            />
          </G>
        </Pivot>
      </Tilt>

      <Sparkles
        dots={[
          [6, 72, 1.4, "s", "s2"],
          [174, 76, 1.2, "b", "s5"],
          [48, 12, 1.3, "t", "s3"],
          [128, 14, 1.1, "a", "s9"],
          [90, 128, 1.2, "s", "s11"],
        ]}
        palette={palette}
        stars={[
          [14, 40, 0.8, "a", "s1"],
          [166, 48, 0.7, "s", "s4"],
          [20, 90, 0.55, "b", "s7"],
          [160, 92, 0.5, "t", "s10"],
        ]}
      />
    </>
  );
};
