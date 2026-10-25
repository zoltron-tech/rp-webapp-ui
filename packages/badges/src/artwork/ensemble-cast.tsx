import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "@nw/animations";
import type { FC } from "react";
import {
  type BadgeArtworkProps,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "../frame";

/**
 * A full company on stage: five players under five spotlights.
 *
 * The badge is for a storyboard with five or more authors, so the art is a
 * theatre with its whole cast out — a gilded proscenium with the comedy and
 * tragedy masks above it, velvet curtains tied back, footlights along the lip
 * of the stage, and five players in five costumes, each in a light of their
 * own. The lights come up one by one, each player bowing into theirs, then
 * dim and the show starts again. A square frame, so it sits on the shelf like
 * the rest; the other framed scene there, Campfire, is an arch. Crimson
 * velvet, gold, a midnight backdrop.
 */

/** The proscenium: a square gilded frame round the stage opening. */
const FRAME = { h: 78, w: 78, x: 21, y: 22 };
const OPENING = { h: 60, w: 64, x: 28, y: 30 };

/** The stage floor in perspective, and its front lip. */
const FLOOR = "M28 80 H92 L95 90 H25 Z";
const LIP = { h: 6, w: 76, x: 22, y: 90 };
const FOOTLIGHTS = [33, 46.5, 60, 73.5, 87];
/** Boards converging towards the back of the stage. */
const BOARDS = [
  "M43 80 L41.5 90",
  "M54 80 L53.6 90",
  "M66 80 L66.4 90",
  "M77 80 L78.5 90",
];

/** The valance across the top of the opening: four scallops. */
const VALANCE =
  "M28 30 H92 V36 Q84 42 76 36 Q68 42 60 36 Q52 42 44 36 Q36 42 28 36 Z";
const VALANCE_FRINGE =
  "M28 36 Q36 42 44 36 Q52 42 60 36 Q68 42 76 36 Q84 42 92 36";

/** Side curtains, gathered at a tieback and flaring to the floor. */
const CURTAIN_L =
  "M28 34 H39 C37.5 45 36 54 37.5 62 C39 68 36.5 77 34 90 H28 Z";
const CURTAIN_R =
  "M92 34 H81 C82.5 45 84 54 82.5 62 C81 68 83.5 77 86 90 H92 Z";
const FOLDS_L = [
  "M31 36 C31 50 30.5 60 31 88",
  "M34.5 36 C34.5 50 33 58 33 64",
];
const FOLDS_R = [
  "M89 36 C89 50 89.5 60 89 88",
  "M85.5 36 C85.5 50 87 58 87 64",
];
const TIEBACKS = [
  { cx: 37.5, cy: 62 },
  { cx: 82.5, cy: 62 },
];

/**
 * The five players, left to right: where they stand on the boards, how tall,
 * and their costume. Heights vary so the line reads as a company, not a row of
 * pegs.
 */
const CAST = [
  { costume: 0, h: 13.5, x: 42 },
  { costume: 1, h: 15.3, x: 51 },
  { costume: 2, h: 17, x: 60 },
  { costume: 3, h: 14.8, x: 69 },
  { costume: 4, h: 14, x: 78 },
];
const CAST_FLOOR = 85;
const BODY_HALF = 4.3;
const HEAD_R = 2.8;

/** A player: a robed body whose hem sits on the floor line. */
const playerBody = (x: number, h: number): string => {
  const top = CAST_FLOOR - h + 5.5;
  const w = BODY_HALF;
  return `M${x - 2.2} ${top} C${x - w * 0.8} ${top + 3} ${x - w * 0.92} ${CAST_FLOOR - 3} ${x - w} ${CAST_FLOOR} H${x + w} C${x + w * 0.92} ${CAST_FLOOR - 3} ${x + w * 0.8} ${top + 3} ${x + 2.2} ${top} Z`;
};

/** A spotlight's cone from the rig down to a player's feet. */
const cone = (x: number): string =>
  `M${x - 1.6} 38 L${x + 1.6} 38 L${x + 7} ${CAST_FLOOR + 1} L${x - 7} ${CAST_FLOOR + 1} Z`;

/** The masks above the arch: comedy on the left, tragedy on the right. */
const MASK = "M-5 -4 C-5 -7 5 -7 5 -4 C5 1 3 5 0 5 C-3 5 -5 1 -5 -4 Z";
const MASKS = [
  {
    face: "M-2.8 -2.2 Q-2 -3 -1.2 -2.2 M1.2 -2.2 Q2 -3 2.8 -2.2 M-2.2 1 Q0 3.2 2.2 1",
    key: "comedy",
    place: "translate(53 20) rotate(-14) scale(0.9)",
  },
  {
    face: "M-2.8 -2.8 Q-2 -2 -1.2 -2.8 M1.2 -2.8 Q2 -2 2.8 -2.8 M-2.2 2.6 Q0 0.6 2.2 2.6",
    key: "tragedy",
    place: "translate(67 20) rotate(14) scale(0.9)",
  },
];

const BACKDROP_STARS = [
  [46, 46],
  [55, 43],
  [66, 47],
  [74, 43],
  [61, 51],
];

export const EnsembleCastBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const gold = muted ? [GREY.pale, GREY.soft] : ["#FBE3A0", "#A8742A"];
  const goldLine = muted ? GREY.light : "#E8C46A";
  const velvet = muted ? [GREY.soft, GREY.deep] : ["#C42A44", "#5E0C1E"];
  const backdrop = muted ? [GREY.mid, GREY.deep] : ["#3A2C66", "#120C24"];
  const wood = muted ? [GREY.light, GREY.soft] : ["#B07A45", "#6A4020"];
  const lip = muted ? GREY.deep : "#3A2210";
  const light = muted ? GREY.pale : "#FFE9A8";
  const skin = muted ? GREY.pale : "#F4D3B0";
  const keyline = muted ? GREY.deep : "#1E1428";
  const costumes = muted
    ? [GREY.light, GREY.soft, GREY.light, GREY.soft, GREY.light]
    : ["#E0A23A", "#2E9C9A", "#D8607E", "#8A5CD0", "#5FAE5A"];

  return (
    <>
      <Defs>
        <ClipPath id={id("opening")}>
          <Rect
            x={OPENING.x}
            y={OPENING.y}
            width={OPENING.w}
            height={OPENING.h}
          />
        </ClipPath>
        <LinearGradient id={id("gold")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gold[0]} />
          <Stop offset="100%" stopColor={gold[1]} />
        </LinearGradient>
        <LinearGradient id={id("velvet")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={velvet[0]} />
          <Stop offset="100%" stopColor={velvet[1]} />
        </LinearGradient>
        <LinearGradient id={id("backdrop")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={backdrop[1]} />
          <Stop offset="100%" stopColor={backdrop[0]} />
        </LinearGradient>
        <LinearGradient id={id("wood")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={wood[0]} />
          <Stop offset="100%" stopColor={wood[1]} />
        </LinearGradient>
        <LinearGradient id={id("beam")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop
            offset="0%"
            stopColor={light}
            stopOpacity={muted ? 0.1 : 0.05}
          />
          <Stop
            offset="100%"
            stopColor={light}
            stopOpacity={muted ? 0.2 : 0.42}
          />
        </LinearGradient>
        <RadialGradient id={id("pool")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="0%"
            stopColor={light}
            stopOpacity={muted ? 0.25 : 0.7}
          />
          <Stop offset="100%" stopColor={light} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#C42A44"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#C42A44"}
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="54"
        fill={`url(#${id("aura")})`}
      />

      {/* The gilded frame, then the stage inside its opening. */}
      <Rect
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.w}
        height={FRAME.h}
        rx="3"
        fill={`url(#${id("gold")})`}
        stroke={muted ? GREY.deep : "#6B4515"}
        strokeWidth="1"
      />

      <G clipPath={`url(#${id("opening")})`}>
        <Rect
          x={OPENING.x}
          y={OPENING.y}
          width={OPENING.w}
          height={OPENING.h}
          fill={`url(#${id("backdrop")})`}
        />
        {detailed &&
          BACKDROP_STARS.map(([x, y]) => (
            <Circle
              key={x}
              cx={x}
              cy={y}
              r="0.7"
              fill={light}
              fillOpacity="0.6"
            />
          ))}

        <Path d={FLOOR} fill={`url(#${id("wood")})`} />
        {detailed &&
          BOARDS.map((d) => (
            <Path
              key={d}
              d={d}
              stroke={lip}
              strokeOpacity="0.35"
              strokeWidth="0.6"
            />
          ))}

        {/* A light for each player — the beam, then the pool at their feet —
            coming up one after another. Drawn lit: a still crest shows the
            whole company in the light. */}
        {CAST.map((p, i) => (
          <G key={`light-${p.x}`} className={`nwb-spot-${i + 1}`}>
            {detailed && <Path d={cone(p.x)} fill={`url(#${id("beam")})`} />}
            <Ellipse
              cx={p.x}
              cy={CAST_FLOOR}
              rx="6.5"
              ry="1.9"
              fill={`url(#${id("pool")})`}
            />
          </G>
        ))}

        {/* The company, each bowing as their light lands. */}
        {CAST.map((p, i) => {
          const head = CAST_FLOOR - p.h + 2.8;
          return (
            <G key={`player-${p.x}`} className={`nwb-player-${i + 1}`}>
              <Path
                d={playerBody(p.x, p.h)}
                fill={costumes[p.costume]}
                stroke={keyline}
                strokeWidth="0.6"
              />
              <Circle
                cx={p.x}
                cy={head}
                r={HEAD_R}
                fill={skin}
                stroke={keyline}
                strokeWidth="0.6"
              />
            </G>
          );
        })}

        {/* Curtains and valance over the stage's edges. The curtains sway
            from the rail, each in a wrapper of its own. */}
        <G className="nwb-curtain-l">
          <Path d={CURTAIN_L} fill={`url(#${id("velvet")})`} />
          {detailed &&
            FOLDS_L.map((d) => (
              <Path
                key={d}
                d={d}
                fill="none"
                stroke="#000"
                strokeOpacity={muted ? 0.15 : 0.28}
                strokeWidth="0.9"
              />
            ))}
        </G>
        <G className="nwb-curtain-r">
          <Path d={CURTAIN_R} fill={`url(#${id("velvet")})`} />
          {detailed &&
            FOLDS_R.map((d) => (
              <Path
                key={d}
                d={d}
                fill="none"
                stroke="#000"
                strokeOpacity={muted ? 0.15 : 0.28}
                strokeWidth="0.9"
              />
            ))}
        </G>
        {TIEBACKS.map((t) => (
          <G key={t.cx}>
            <Ellipse
              cx={t.cx}
              cy={t.cy}
              rx="2.6"
              ry="1.4"
              fill={`url(#${id("gold")})`}
            />
            {detailed && (
              <Path
                d={`M${t.cx} ${t.cy + 1.2} L${t.cx - 1.2} ${t.cy + 5.4} M${t.cx} ${t.cy + 1.2} L${t.cx + 1.2} ${t.cy + 5.4} M${t.cx} ${t.cy + 1.2} V${t.cy + 5.8}`}
                stroke={goldLine}
                strokeWidth="0.7"
                strokeLinecap="round"
              />
            )}
          </G>
        ))}
        <Path d={VALANCE} fill={`url(#${id("velvet")})`} />
        {detailed && (
          <Path
            d={VALANCE_FRINGE}
            fill="none"
            stroke={goldLine}
            strokeWidth="1"
            strokeDasharray="0.8 1"
          />
        )}
      </G>

      {/* The front of the stage: its lip, and the footlights along it. */}
      <Rect
        x={LIP.x}
        y={LIP.y}
        width={LIP.w}
        height={LIP.h}
        rx="1.5"
        fill={lip}
        stroke={`url(#${id("gold")})`}
        strokeWidth="1"
      />
      {FOOTLIGHTS.map((x, i) => (
        <G key={x} className={`nwb-footlight-${(i % 3) + 1}`}>
          {detailed && (
            <Ellipse
              cx={x}
              cy={LIP.y}
              rx="3.6"
              ry="2.2"
              fill={`url(#${id("pool")})`}
            />
          )}
          <Ellipse cx={x} cy={LIP.y + 1.6} rx="1.5" ry="0.9" fill={light} />
        </G>
      ))}

      {/* Comedy and tragedy above the arch, rocking gently. */}
      {MASKS.map((m, i) => (
        <G key={m.key} transform={m.place}>
          <G className={i === 0 ? "nwb-mask-l" : "nwb-mask-r"}>
            <Path
              d={MASK}
              fill={
                i === 0 ? `url(#${id("gold")})` : muted ? GREY.light : "#F2EAD8"
              }
              stroke={muted ? GREY.deep : "#6B4515"}
              strokeWidth="0.7"
            />
            {detailed && (
              <Path
                d={m.face}
                fill="none"
                stroke="#4A2E08"
                strokeWidth="0.7"
                strokeLinecap="round"
              />
            )}
          </G>
        </G>
      ))}
    </>
  );
};
