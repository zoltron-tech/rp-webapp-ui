import {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
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
 * A laurel ring with a novelist at the centre of it and friends arriving around
 * them, each one wired back to the middle as they land.
 *
 * Nothing here is a plate, a seal or a bubble: the badge is a *circle* of
 * people, so the silhouette is an open wreath rather than a solid shape, and
 * the motion is the circle filling up rather than one thing drifting about.
 * Green and gold for the same reason — it is the only badge on the shelf that
 * counts other people, and it should not read as a cousin of the guild sigil.
 */

/** The arc the branches follow, and how far out the friends stand on it. */
const RING_R = 38;
const FRIEND_R = 28;

/** A single laurel leaf, drawn from the origin along +x. */
const LEAF = "M0 0 C4.2 -4.4 10.6 -4.6 14 0 C10.6 4.6 4.2 4.4 0 0 Z";

/**
 * Where the leaves sit on the right-hand branch.
 *
 * Stopping at ±60° leaves the two gaps a wreath needs: the open crown at the
 * top, and the room at the bottom where the two branches are tied together.
 * Nothing behind them is filled in, so those gaps are what keeps the badge an
 * open ring rather than a green ball with people printed on it.
 */
const LEAF_ANGLES = [-60, -36, -12, 12, 36, 60];

/**
 * The branch itself: up the leaf circle from the knot to the crown.
 *
 * It runs further round at the bottom than the leaves do, so the stems reach
 * the knot instead of stopping in mid-air behind it.
 */
const STEM = `M69.19 96.87 A${RING_R} ${RING_R} 0 0 0 75.45 25.29`;

/** A person, on a 24×24 grid: head, then shoulders. */
const SHOULDERS =
  "M3.6 20.6 C3.6 15.3 7.3 12.6 12 12.6 C16.7 12.6 20.4 15.3 20.4 20.6 Z";

/**
 * The four friends, and the spoke that reaches each of them.
 *
 * On the diagonals rather than the compass points: due north is the wreath's
 * open crown and due south is its knot, and a friend standing on either of
 * those is a friend standing on the furniture. Even spacing still reads as a
 * tally, which four marks at loose angles would not.
 */
const DIAG = Number((FRIEND_R * Math.SQRT1_2).toFixed(2));
const SPOKE_IN = Number((15 * Math.SQRT1_2).toFixed(2));
const SPOKE_OUT = Number((23 * Math.SQRT1_2).toFixed(2));

const FRIENDS = [
  {
    cx: 60 + DIAG,
    cy: 60 - DIAG,
    x1: 60 + SPOKE_IN,
    x2: 60 + SPOKE_OUT,
    y1: 60 - SPOKE_IN,
    y2: 60 - SPOKE_OUT,
  },
  {
    cx: 60 + DIAG,
    cy: 60 + DIAG,
    x1: 60 + SPOKE_IN,
    x2: 60 + SPOKE_OUT,
    y1: 60 + SPOKE_IN,
    y2: 60 + SPOKE_OUT,
  },
  {
    cx: 60 - DIAG,
    cy: 60 + DIAG,
    x1: 60 - SPOKE_IN,
    x2: 60 - SPOKE_OUT,
    y1: 60 + SPOKE_IN,
    y2: 60 + SPOKE_OUT,
  },
  {
    cx: 60 - DIAG,
    cy: 60 - DIAG,
    x1: 60 - SPOKE_IN,
    x2: 60 - SPOKE_OUT,
    y1: 60 - SPOKE_IN,
    y2: 60 - SPOKE_OUT,
  },
];

/** How much of a person a friend mark is; the novelist in the middle is full size. */
const FRIEND_SCALE = 0.55;

/** The knot's tails, hanging from behind it with notched ends. */
const TIE_LEFT = "M58.4 100 L48.2 116.4 L53.8 112.6 L57.6 117.2 Z";
const TIE_RIGHT = "M61.6 100 L71.8 116.4 L66.2 112.6 L62.4 117.2 Z";

/** Gold caught in the ring, on the compass points the friends left empty. */
const MOTES = [
  { cx: 60, cy: 27, r: 1.7 },
  { cx: 30, cy: 60, r: 1.3 },
  { cx: 90, cy: 60, r: 1.5 },
];

export const FriendlyNovelistBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const leafFill = muted ? [GREY.light, GREY.ink] : ["#5FD693", "#1B7A50"];
  const gold = muted ? GREY.light : "#F0C463";
  const goldBright = muted ? GREY.pale : "#FFE7A8";
  const cream = muted ? GREY.pale : "#FFF6E4";
  const core = muted ? GREY.deep : "#0C4632";

  /**
   * One branch, reused mirrored for the other side — a wreath is symmetrical,
   * and two hand-placed halves drift apart the moment either is adjusted.
   */
  const branch = (
    <>
      <Path
        d={STEM}
        fill="none"
        stroke={leafFill[1]}
        strokeOpacity={muted ? 0.5 : 0.9}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {LEAF_ANGLES.map((angle) => (
        <Path
          key={angle}
          d={LEAF}
          transform={`translate(60 60) rotate(${angle}) translate(${RING_R - 2} 0) rotate(-56)`}
          fill={`url(#${id("leaf")})`}
          stroke={leafFill[1]}
          strokeOpacity={muted ? 0.3 : 0.5}
          strokeWidth="0.7"
        />
      ))}
    </>
  );

  return (
    <>
      <Defs>
        <RadialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="0%"
            stopColor={muted ? GREY.mid : "#1B7A50"}
            stopOpacity={muted ? 0.5 : 0.6}
          />
          <Stop
            offset="62%"
            stopColor={muted ? GREY.deep : "#0A3F2C"}
            stopOpacity={muted ? 0.32 : 0.42}
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.deep : "#0A3F2C"}
            stopOpacity="0"
          />
        </RadialGradient>
        <LinearGradient id={id("leaf")} x1="0%" y1="0%" x2="100%" y2="60%">
          <Stop offset="0%" stopColor={leafFill[0]} />
          <Stop offset="100%" stopColor={leafFill[1]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#2ECB84"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#2ECB84"}
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="50"
        fill={`url(#${id("aura")})`}
      />

      <Circle cx="60" cy="60" r="40" fill={`url(#${id("glow")})`} />

      {/* With the leaves gone there is nothing left to hold the shape, so the
          small copy gets the disc the big one deliberately does without. */}
      {!detailed && (
        <Circle
          cx="60"
          cy="60"
          r="38"
          fill={leafFill[1]}
          fillOpacity={muted ? 0.55 : 1}
          stroke={gold}
          strokeOpacity={muted ? 0.5 : 0.9}
          strokeWidth="3"
        />
      )}

      {/* The wreath, in front of its own sky. Each half sways about the knot,
          half a cycle apart, so the ring opens and closes rather than rocking
          from side to side. */}
      <G className="nwb-branch-r">{branch}</G>
      <G className="nwb-branch-l">
        <G transform="translate(120 0) scale(-1 1)">{branch}</G>
      </G>

      <G fill={gold} fillOpacity={muted ? 0.6 : 1}>
        <Path className="nwb-ribbon-l" d={TIE_LEFT} />
        <Path className="nwb-ribbon-r" d={TIE_RIGHT} />
        <Ellipse
          cx="54.6"
          cy="99"
          rx="6"
          ry="4.4"
          transform="rotate(-18 54.6 99)"
        />
        <Ellipse
          cx="65.4"
          cy="99"
          rx="6"
          ry="4.4"
          transform="rotate(18 65.4 99)"
        />
        <Circle cx="60" cy="99" r="3.4" fill={goldBright} />
      </G>

      {/* The spokes, drawn out one at a time just ahead of the friend each one
          reaches. Dashed to their own length, so the motion is a line arriving
          rather than a line fading up. */}
      {detailed &&
        FRIENDS.map((friend, index) => (
          <Line
            key={`spoke-${friend.cx}-${friend.cy}`}
            className={`nwb-spoke-${index + 1}`}
            x1={friend.x1}
            y1={friend.y1}
            x2={friend.x2}
            y2={friend.y2}
            stroke={gold}
            strokeOpacity={muted ? 0.4 : 0.8}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="8"
          />
        ))}

      {/* The friends. Below the detail threshold they are plain marks: at 18px
          a head and a pair of shoulders is four grey pixels. */}
      {FRIENDS.map((friend, index) => (
        <G
          key={`friend-${friend.cx}-${friend.cy}`}
          className={`nwb-friend-${index + 1}`}
        >
          {detailed ? (
            <G
              transform={`translate(${friend.cx - 12 * FRIEND_SCALE} ${friend.cy - 12 * FRIEND_SCALE}) scale(${FRIEND_SCALE})`}
            >
              <Circle
                cx="12"
                cy="8.6"
                r="4.2"
                fill={cream}
                fillOpacity={muted ? 0.55 : 1}
              />
              <Path d={SHOULDERS} fill={cream} fillOpacity={muted ? 0.55 : 1} />
            </G>
          ) : (
            <Circle
              cx={friend.cx}
              cy={friend.cy}
              r="6"
              fill={cream}
              fillOpacity={muted ? 0.55 : 1}
            />
          )}
        </G>
      ))}

      {/* The novelist the ring is around. */}
      <G className="nwb-emblem">
        <Circle
          cx="60"
          cy="60"
          r="14"
          fill={core}
          stroke={gold}
          strokeOpacity={muted ? 0.5 : 0.85}
          strokeWidth="1.4"
        />
        <G transform="translate(48 48)">
          <Circle
            cx="12"
            cy="8.6"
            r="4.2"
            fill={goldBright}
            fillOpacity={muted ? 0.6 : 1}
          />
          <Path d={SHOULDERS} fill={goldBright} fillOpacity={muted ? 0.6 : 1} />
        </G>
      </G>

      {detailed &&
        MOTES.map((mote, index) => (
          <Circle
            key={`${mote.cx}-${mote.cy}`}
            className={`nwb-spark-${index + 1}`}
            cx={mote.cx}
            cy={mote.cy}
            r={mote.r}
            fill={goldBright}
          />
        ))}
    </>
  );
};
