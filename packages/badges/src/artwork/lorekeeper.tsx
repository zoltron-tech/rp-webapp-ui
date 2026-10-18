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
} from "@nw/animations";
import type { FC } from "react";
import {
  type BadgeArtworkProps,
  DETAIL_THRESHOLD,
  GREY,
  useBadgeIds,
} from "../frame";

/**
 * A chained grimoire that keeps a world's lore.
 *
 * The badge is for writing a hundred codex entries — a story's whole body of
 * lore — so the art is the book that holds it: an old leather tome bound with
 * a chain and a padlock, a key in a ring of runes on its cover. Every so
 * often the lock springs, the chain slides away, the emblem flares and the
 * lore gets out: runes and loose pages rise off the top of the book. Then the
 * chain comes back and locks it again. A still crest shows it bound. Olive
 * leather, gold tooling, steel chain, a green-gold glow.
 */

/** The book, face on with its depth showing to the right and below. */
const BACK = { h: 79, w: 64, x: 33, y: 27 };
const PAGES = { h: 78, w: 63, x: 31, y: 24 };
const COVER = { h: 78, w: 62, x: 28, y: 21 };
const SPINE = { w: 7, x: 28 };
/** Raised bands across the spine. */
const RIDGES = [32, 46, 76, 90];
/** The gold border, inset from the cover's face. */
const BORDER = { h: 66, w: 48, x: 38, y: 27 };
/** Gold caps on the cover's outer corners. */
const CORNERS = [
  "M82 21 H90 V29 L87 29 L87 24 L82 24 Z",
  "M82 99 H90 V91 L87 91 L87 96 L82 96 Z",
];

/** The emblem: a key in a ring of runes. */
const EMBLEM = { cx: 62, cy: 42, r: 10 };
const RUNE_TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
const KEY =
  "M62 35.4 A2.6 2.6 0 1 1 61.99 35.4 Z M61.2 37.8 H62.8 V48 H61.2 Z M62.8 44.6 H65 V46 H62.8 Z M62.8 46.8 H64.2 V48 H62.8 Z";
const PLATE = { h: 6, w: 20, x: 52, y: 83 };

/** The chain round its middle, in two halves that part at the lock. */
const CHAIN_Y = 66;
const LINKS_L = [22, 27, 32, 37, 42, 47, 52];
const LINKS_R = [72, 77, 82, 87, 92, 97];

/** The padlock on the chain, and its shackle. */
const LOCK = { h: 11, w: 14, x: 55, y: 64 };
const SHACKLE = "M58.2 64 V60.2 A3.8 3.8 0 0 1 65.8 60.2 V64";
const KEYHOLE =
  "M62 67.6 a1.4 1.4 0 1 1 0.01 0 Z M61.3 69.4 H62.7 L63.1 72.4 H60.9 Z";

/** Runes that rise out of the book when it opens, across its top edge. */
const GLYPHS = [
  { d: "M0 -3 V3 M0 -1.4 L2 0 M0 0.8 L-2 2.2", x: 40 },
  { d: "M-1.6 -3 V3 M-1.6 -3 L1.6 0 L-1.6 3", x: 48 },
  { d: "M-2 -2 L2 2 M2 -2 L-2 2", x: 56 },
  { d: "M-1.8 3 L0 -3 L1.8 3 M-1 0.6 H1", x: 64 },
  { d: "M0 -3 V3 M-2 -1.4 L2 1.4", x: 72 },
  { d: "M-2 3 V-3 L2 0 L-2 1", x: 80 },
];
const GLYPH_Y = 17;

/** Two loose pages that slip out of the top. */
const PAGE_FLY = [
  { cls: "nwb-leaf-r", x: 70 },
  { cls: "nwb-leaf-l", x: 48 },
];

export const LorekeeperBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const leather = muted ? [GREY.soft, GREY.deep] : ["#5E6E32", "#232C12"];
  const backCover = muted ? GREY.deep : "#1A2010";
  const paper = muted ? GREY.pale : "#F3E6C4";
  const pageLine = muted ? GREY.light : "#C9B48A";
  const gold = muted ? [GREY.pale, GREY.soft] : ["#FBE3A0", "#A8742A"];
  const goldLine = muted ? GREY.light : "#E8C46A";
  const steel = muted ? [GREY.pale, GREY.ink] : ["#E4E8F0", "#6E7488"];
  const chain = muted ? GREY.light : "#B8BECC";
  const rune = muted ? GREY.pale : "#D8F27A";

  const link = (x: number, i: number) =>
    i % 2 === 0 ? (
      <Ellipse
        key={x}
        cx={x}
        cy={CHAIN_Y}
        rx="3.2"
        ry="1.9"
        fill="none"
        stroke={chain}
        strokeWidth="1.3"
      />
    ) : (
      <Ellipse
        key={x}
        cx={x}
        cy={CHAIN_Y}
        rx="1.1"
        ry="2.3"
        fill={chain}
        stroke={muted ? GREY.deep : "#4A4F5E"}
        strokeWidth="0.5"
      />
    );

  return (
    <>
      <Defs>
        <LinearGradient id={id("leather")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={leather[0]} />
          <Stop offset="100%" stopColor={leather[1]} />
        </LinearGradient>
        <LinearGradient id={id("gold")} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gold[0]} />
          <Stop offset="100%" stopColor={gold[1]} />
        </LinearGradient>
        <LinearGradient id={id("steel")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={steel[0]} />
          <Stop offset="100%" stopColor={steel[1]} />
        </LinearGradient>
        <LinearGradient id={id("spine")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#000" stopOpacity="0.45" />
          <Stop offset="70%" stopColor="#FFF" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#000" stopOpacity="0.3" />
        </LinearGradient>
        <RadialGradient id={id("halo")} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={rune} stopOpacity={muted ? 0.2 : 0.7} />
          <Stop offset="100%" stopColor={rune} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#9AB84A"}
            stopOpacity="0.4"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#9AB84A"}
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

      {/* Lore escaping: runes and loose pages rising off the top of the
          book. Behind the cover, so they come up from inside it. Hidden when
          still. */}
      {detailed &&
        GLYPHS.map((g, i) => (
          <G key={g.x} className={`nwb-glyph-${i + 1}`}>
            <Path
              d={g.d}
              transform={`translate(${g.x} ${GLYPH_Y}) scale(1.2)`}
              fill="none"
              stroke={rune}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        ))}
      {detailed &&
        PAGE_FLY.map((p) => (
          <G key={p.x} className={p.cls}>
            <Rect
              x={p.x - 4}
              y="16"
              width="8"
              height="10"
              rx="0.6"
              fill={paper}
              stroke={pageLine}
              strokeWidth="0.5"
            />
            <Path
              d={`M${p.x - 2.4} 19 H${p.x + 2.4} M${p.x - 2.4} 21 H${p.x + 2.4} M${p.x - 2.4} 23 H${p.x + 1}`}
              stroke={pageLine}
              strokeWidth="0.5"
            />
          </G>
        ))}

      {/* The book: back board, the page block, the front board. */}
      <Rect
        x={BACK.x}
        y={BACK.y}
        width={BACK.w}
        height={BACK.h}
        rx="3"
        fill={backCover}
      />
      <Rect
        x={PAGES.x}
        y={PAGES.y}
        width={PAGES.w}
        height={PAGES.h}
        rx="1.5"
        fill={paper}
      />
      {detailed && (
        <>
          {[91, 92.4, 93.6].map((x) => (
            <Path
              key={x}
              d={`M${x} 26 V100`}
              stroke={pageLine}
              strokeWidth="0.4"
            />
          ))}
          {[100, 101.2].map((y) => (
            <Path
              key={y}
              d={`M33 ${y} H93`}
              stroke={pageLine}
              strokeWidth="0.4"
            />
          ))}
        </>
      )}
      <Rect
        x={COVER.x}
        y={COVER.y}
        width={COVER.w}
        height={COVER.h}
        rx="3"
        fill={`url(#${id("leather")})`}
        stroke={muted ? GREY.deep : "#141A08"}
        strokeWidth="1"
      />
      <Rect
        x={SPINE.x}
        y={COVER.y}
        width={SPINE.w}
        height={COVER.h}
        rx="3"
        fill={`url(#${id("spine")})`}
      />
      {detailed &&
        RIDGES.map((y) => (
          <Rect
            key={y}
            x={SPINE.x + 0.6}
            y={y}
            width={SPINE.w - 1.2}
            height="1.8"
            rx="0.9"
            fill={goldLine}
            fillOpacity="0.8"
          />
        ))}
      {detailed && (
        <Rect
          x={BORDER.x}
          y={BORDER.y}
          width={BORDER.w}
          height={BORDER.h}
          rx="2"
          fill="none"
          stroke={goldLine}
          strokeWidth="0.9"
          strokeDasharray="3 1.4"
        />
      )}
      {CORNERS.map((d) => (
        <Path key={d} d={d} fill={`url(#${id("gold")})`} />
      ))}

      {/* The emblem, its glow breathing and flaring when the book opens. */}
      <G className="nwb-lore-glow">
        <Circle
          cx={EMBLEM.cx}
          cy={EMBLEM.cy}
          r={EMBLEM.r + 6}
          fill={`url(#${id("halo")})`}
        />
      </G>
      <Circle
        cx={EMBLEM.cx}
        cy={EMBLEM.cy}
        r={EMBLEM.r}
        fill="none"
        stroke={`url(#${id("gold")})`}
        strokeWidth="1.5"
      />
      {detailed &&
        RUNE_TICKS.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const a = EMBLEM.r - 3.2;
          const b = EMBLEM.r - 1.6;
          return (
            <Path
              key={deg}
              d={`M${EMBLEM.cx + Math.sin(rad) * a} ${EMBLEM.cy - Math.cos(rad) * a} L${EMBLEM.cx + Math.sin(rad) * b} ${EMBLEM.cy - Math.cos(rad) * b}`}
              stroke={rune}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          );
        })}
      <Path d={KEY} fill={`url(#${id("gold")})`} fillRule="evenodd" />

      <Rect
        x={PLATE.x}
        y={PLATE.y}
        width={PLATE.w}
        height={PLATE.h}
        rx="1"
        fill={`url(#${id("gold")})`}
      />
      {detailed && (
        <Path
          d={`M${PLATE.x + 3} ${PLATE.y + 2.2} H${PLATE.x + PLATE.w - 3} M${PLATE.x + 5} ${PLATE.y + 4} H${PLATE.x + PLATE.w - 5}`}
          stroke={muted ? GREY.deep : "#4A3010"}
          strokeWidth="0.6"
        />
      )}

      {/* The chain, in two halves that slide off either way. */}
      <G className="nwb-chain-l">{LINKS_L.map((x, i) => link(x, i))}</G>
      <G className="nwb-chain-r">{LINKS_R.map((x, i) => link(x, i + 1))}</G>

      {/* The padlock: it drops away, and its shackle springs first. */}
      <G className="nwb-padlock">
        <G className="nwb-shackle">
          <Path
            d={SHACKLE}
            fill="none"
            stroke={`url(#${id("steel")})`}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </G>
        <Rect
          x={LOCK.x}
          y={LOCK.y}
          width={LOCK.w}
          height={LOCK.h}
          rx="2.2"
          fill={`url(#${id("gold")})`}
          stroke={muted ? GREY.deep : "#6B4515"}
          strokeWidth="0.8"
        />
        {detailed && <Path d={KEYHOLE} fill={muted ? GREY.deep : "#2A1A08"} />}
      </G>
    </>
  );
};
