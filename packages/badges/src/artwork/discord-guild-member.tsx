import {
  Circle,
  ClipPath,
  Defs,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  Filter,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  SvgImage,
} from "@nw/animations";
import type { FC } from "react";
import {
  type BadgeArtworkProps,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "../frame";

/**
 * A riveted guild sigil holding two marks wired together: Discord's on one
 * tile, Novelist World's on the other, with a pulse running down the link
 * between them.
 *
 * The badge is for a *connection* — an account linked and a server joined — so
 * the artwork is the two things being connected rather than one logo with some
 * decoration around it. The hexagon is deliberate: it is the shape a gaming
 * guild's crest takes.
 */

/** Pointy-top hexagon, radius 52 about (60, 60). */
const HEX = "M60 8 L105 34 L105 86 L60 112 L15 86 L15 34 Z";

/** The same hexagon at 84%, as the inner bevel line. */
const HEX_INNER =
  "M60 16 L97.8 37.8 L97.8 82.2 L60 104 L22.2 82.2 L22.2 37.8 Z";

/** Discord's wordless mark, on its own 24×24 grid. */
const DISCORD_MARK =
  "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.198.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z";

/**
 * Rivets, one per hexagon vertex, pulled 6 units in along the line to the
 * centre so they sit on the plate rather than on its edge.
 */
const RIVETS = [
  { cx: 60, cy: 14 },
  { cx: 99.8, cy: 37 },
  { cx: 99.8, cy: 83 },
  { cx: 60, cy: 106 },
  { cx: 20.2, cy: 83 },
  { cx: 20.2, cy: 37 },
];

/** A four-point star, drawn about the origin at radius [r]. */
const star = (r: number) =>
  `M0 ${-r} Q${r * 0.22} ${-r * 0.22} ${r} 0 Q${r * 0.22} ${r * 0.22} 0 ${r} Q${-r * 0.22} ${r * 0.22} ${-r} 0 Q${-r * 0.22} ${-r * 0.22} 0 ${-r} Z`;

/**
 * Scattered in the corners the tiles leave empty, so the plate reads as a sky
 * rather than as a pattern — and so nothing sits behind the two marks.
 */
const STARS = [
  { r: 3, x: 34, y: 28 },
  { r: 2, x: 88, y: 30 },
  { r: 2.4, x: 31, y: 92 },
  { r: 1.7, x: 89, y: 91 },
];

/** The ward's dashes, broken unevenly so the rotation reads. */
const WARD_DASHES = "46 30 22 30";

/** The two tiles, and the run of link between them. */
const TILE = { gap: 14, size: 30, y: 45 };
const LEFT_X = 60 - TILE.gap / 2 - TILE.size;
const RIGHT_X = 60 + TILE.gap / 2;
const LINK_Y = TILE.y + TILE.size / 2;

export const DiscordGuildMemberBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
  logoHref,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const plate = muted
    ? [GREY.soft, GREY.mid, GREY.deep]
    : ["#7A87FF", "#5865F2", "#242A78"];
  const ring = muted
    ? [GREY.edge, GREY.light, GREY.soft]
    : ["#9BA6FF", "#D3B6FF", "#5865F2"];
  const aura = muted ? GREY.edge : "#5865F2";
  const metal = muted ? GREY.light : "#C7CEFF";
  const gold = muted ? GREY.light : "#F5D77A";
  const goldBright = muted ? GREY.pale : "#FFF0BC";

  return (
    <>
      <Defs>
        <ClipPath id={id("clip")}>
          <Path d={HEX} />
        </ClipPath>
        <LinearGradient id={id("plate")} x1="18%" y1="0%" x2="82%" y2="100%">
          <Stop offset="0%" stopColor={plate[0]} />
          <Stop offset="46%" stopColor={plate[1]} />
          <Stop offset="100%" stopColor={plate[2]} />
        </LinearGradient>
        <LinearGradient id={id("ring")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={ring[0]} />
          <Stop offset="50%" stopColor={ring[1]} />
          <Stop offset="100%" stopColor={ring[2]} />
        </LinearGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop offset="55%" stopColor={aura} stopOpacity="0.45" />
          <Stop offset="100%" stopColor={aura} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={id("sheen")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.38" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id={id("tileA")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={muted ? GREY.soft : "#4C57D8"} />
          <Stop offset="100%" stopColor={muted ? GREY.mid : "#28308F"} />
        </LinearGradient>
        <LinearGradient id={id("tileB")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={muted ? GREY.soft : "#242A52"} />
          <Stop offset="100%" stopColor={muted ? GREY.mid : "#101430"} />
        </LinearGradient>
        <Filter id={id("glow")} x="-60%" y="-60%" width="220%" height="220%">
          <FeGaussianBlur stdDeviation="1.6" result="blur" />
          <FeMerge>
            <FeMergeNode in="blur" />
            <FeMergeNode in="SourceGraphic" />
          </FeMerge>
        </Filter>
      </Defs>

      <Circle
        className="nwb-aura"
        cx="60"
        cy="60"
        r="54"
        fill={`url(#${id("aura")})`}
      />

      {detailed && (
        <G className="nwb-ward">
          <Circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke={`url(#${id("ring")})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={WARD_DASHES}
            opacity={muted ? 0.45 : 0.9}
          />
        </G>
      )}

      <Path
        d={HEX}
        fill={`url(#${id("plate")})`}
        stroke={`url(#${id("ring")})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Path
        d={HEX_INNER}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={muted ? 0.08 : 0.2}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Starfield, in the corners the tiles leave alone. */}
      {detailed && (
        <G clipPath={`url(#${id("clip")})`} opacity={muted ? 0.3 : 0.75}>
          {STARS.map((s, index) => (
            <Path
              key={`${s.x}-${s.y}`}
              className={`nwb-star-${index + 1}`}
              d={star(s.r)}
              transform={`translate(${s.x} ${s.y})`}
              fill={metal}
            />
          ))}
        </G>
      )}

      {/* Light sweep, kept inside the plate. The tilt is on an inner group
          because an SVG element's `transform` attribute and its animated CSS
          transform are one property — animating the rect directly would throw
          the rotation away and sweep a vertical bar across. */}
      <G clipPath={`url(#${id("clip")})`}>
        <G className="nwb-sheen">
          <Rect
            x="-40"
            y="-10"
            width="34"
            height="140"
            fill={`url(#${id("sheen")})`}
            transform="rotate(16 60 60)"
          />
        </G>
      </G>

      {/* Below the detail threshold the two tiles collapse into unreadable
          smudges, so the small copy keeps Discord's mark alone and centred —
          which is still the right silhouette for the badge. */}
      {!detailed && (
        <G className="nwb-emblem">
          <G transform="translate(43 29) scale(1.42)">
            <Path
              d={DISCORD_MARK}
              fill="#FFFFFF"
              fillOpacity={muted ? 0.55 : 1}
            />
          </G>
        </G>
      )}

      {detailed && (
        <G className="nwb-emblem">
          {/* The link, drawn under the tiles so the pulse runs out of one and
              into the other rather than over their edges. */}
          <Path
            d={`M${LEFT_X + TILE.size} ${LINK_Y} H${RIGHT_X}`}
            stroke={gold}
            strokeOpacity={muted ? 0.4 : 0.7}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2.5 3"
          />
          <Circle
            className="nwb-link"
            cx={LEFT_X + TILE.size}
            cy={LINK_Y}
            r="2.4"
            fill={goldBright}
            filter={muted ? undefined : `url(#${id("glow")})`}
          />

          {/* Discord. */}
          <G className="nwb-tile-a">
            <Rect
              x={LEFT_X}
              y={TILE.y}
              width={TILE.size}
              height={TILE.size}
              rx="7"
              fill={`url(#${id("tileA")})`}
              stroke={metal}
              strokeOpacity={muted ? 0.35 : 0.55}
              strokeWidth="1.2"
            />
            <G
              transform={`translate(${LEFT_X + 5} ${TILE.y + 5}) scale(0.833)`}
            >
              <Path
                d={DISCORD_MARK}
                fill="#FFFFFF"
                fillOpacity={muted ? 0.55 : 1}
              />
            </G>
          </G>

          {/* Novelist World. The mark is the app's own logo asset rather than a
              redrawing of it — the NW monogram has a quill woven through it,
              and a traced copy would drift from the real one. */}
          <G className="nwb-tile-b">
            <Rect
              x={RIGHT_X}
              y={TILE.y}
              width={TILE.size}
              height={TILE.size}
              rx="7"
              fill={`url(#${id("tileB")})`}
              stroke={gold}
              strokeOpacity={muted ? 0.35 : 0.7}
              strokeWidth="1.2"
            />
            {logoHref ? (
              <SvgImage
                href={logoHref}
                x={RIGHT_X + 4.5}
                y={TILE.y + 4.5}
                width={TILE.size - 9}
                height={TILE.size - 9}
                opacity={muted ? 0.5 : 1}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : null}
          </G>
        </G>
      )}

      {/* Rivets. Drawn last so they sit proud of everything else. */}
      {detailed && (
        <G>
          {RIVETS.map((rivet) => (
            <Circle
              key={`${rivet.cx}-${rivet.cy}`}
              cx={rivet.cx}
              cy={rivet.cy}
              r="2"
              fill={metal}
              fillOpacity={muted ? 0.5 : 0.9}
            />
          ))}
        </G>
      )}
    </>
  );
};
