import {
  Circle,
  ClipPath,
  Defs,
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
 * A shelf of leather-bound volumes, the last one just being shelved.
 *
 * The badge is for one story running to ten chapters: a row of finished
 * volumes and one more coming down onto the shelf, tipping over to lean on its
 * neighbour — the moment the badge is earned. Six books rather than ten, fat
 * and tall, so the crest sits square like the rest of the shelf instead of
 * stretching into a strip. A gilt sheen runs along the spines and a ribbon
 * marker hangs over the shelf edge. The only crest with a skyline: a row of
 * uneven tops rather than one outline. Chestnut and oxblood leather, gold
 * tooling.
 */

/** Where the books stand. */
const BASE_Y = 88;

/** The shelf plank, a little wider than the row. */
const PLANK = { h: 6, w: 74, x: 26, y: BASE_Y };

/**
 * The five standing volumes, left to right, touching. The fifth is the short
 * one: its top corner is what the last leans on.
 */
const BOOKS = [
  { h: 58, tone: 0, w: 11, x: 32 },
  { h: 50, tone: 1, w: 10, x: 43 },
  { h: 64, tone: 2, w: 12, x: 53 },
  { h: 54, tone: 3, w: 10, x: 65 },
  { h: 42, tone: 5, w: 9, x: 75 },
];

/**
 * The last: stands clear of the fifth at its foot and leans six degrees, so
 * its edge meets the fifth's top corner.
 */
const LAST = { h: 54, tone: 4, w: 10, x: 88.5 };
const LEAN = -6;

/** The book the ribbon marker hangs from. */
const RIBBON_BOOK = BOOKS[1];

/** Leather, as [face, shadow] pairs; earned and locked. */
const LEATHER = [
  ["#8A5A34", "#5C3A1F"],
  ["#7E2A2A", "#531818"],
  ["#2F5A3E", "#1C3826"],
  ["#2B3F66", "#192742"],
  ["#B5832E", "#7E5818"],
  ["#5A3460", "#3A1F3F"],
];
const LEATHER_MUTED = [
  [GREY.soft, GREY.deep],
  [GREY.mid, GREY.deep],
  [GREY.edge, GREY.mid],
  [GREY.mid, GREY.deep],
  [GREY.ink, GREY.soft],
  [GREY.soft, GREY.mid],
];

interface Book {
  h: number;
  tone: number;
  w: number;
  x: number;
}

export const ChroniclerBadge: FC<BadgeArtworkProps> = ({
  size,
  muted = false,
}) => {
  const id = useBadgeIds();
  const detailed = size >= DETAIL_THRESHOLD;

  const leather = muted ? LEATHER_MUTED : LEATHER;
  const gold = muted ? GREY.pale : "#E8C46A";
  const label = muted ? GREY.light : "#F2E2B4";
  const wood = muted ? [GREY.light, GREY.soft] : ["#B07A45", "#6E4422"];
  const ribbon = muted ? [GREY.light, GREY.ink] : ["#D8433A", "#8E1F1A"];

  const spine = (b: Book, key: string) => {
    const top = BASE_Y - b.h;
    const [face, shadow] = leather[b.tone];
    return (
      <G key={key}>
        <Rect
          x={b.x}
          y={top}
          width={b.w}
          height={b.h}
          rx="1"
          fill={face}
          stroke={shadow}
          strokeWidth="0.8"
        />
        {detailed && (
          <>
            {/* Lit down the middle and shadowed at both edges: a rounded
                spine without a gradient per book. */}
            <Rect
              x={b.x}
              y={top}
              width={b.w}
              height={b.h}
              rx="1"
              fill={`url(#${id("round")})`}
            />
            <Rect
              x={b.x + 0.8}
              y={top + 5}
              width={b.w - 1.6}
              height="1.3"
              fill={gold}
            />
            <Rect
              x={b.x + 0.8}
              y={BASE_Y - 7}
              width={b.w - 1.6}
              height="1.3"
              fill={gold}
            />
            {b.h >= 46 && (
              <Rect
                x={b.x + 1.8}
                y={top + 12}
                width={b.w - 3.6}
                height={Math.min(18, b.h - 30)}
                rx="0.6"
                fill={label}
                fillOpacity={muted ? 0.5 : 0.85}
              />
            )}
          </>
        )}
      </G>
    );
  };

  return (
    <>
      <Defs>
        <LinearGradient id={id("round")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <Stop offset="40%" stopColor="#FFF" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#000" stopOpacity="0.4" />
        </LinearGradient>
        <LinearGradient id={id("wood")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={wood[0]} />
          <Stop offset="100%" stopColor={wood[1]} />
        </LinearGradient>
        <LinearGradient id={id("ribbon")} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={ribbon[0]} />
          <Stop offset="100%" stopColor={ribbon[1]} />
        </LinearGradient>
        <LinearGradient id={id("gilt")} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFF4CF" stopOpacity="0" />
          <Stop offset="50%" stopColor="#FFF4CF" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#FFF4CF" stopOpacity="0" />
        </LinearGradient>
        {/* The sheen runs over the standing books only. */}
        <ClipPath id={id("row")}>
          {BOOKS.map((b) => (
            <Rect key={b.x} x={b.x} y={BASE_Y - b.h} width={b.w} height={b.h} />
          ))}
        </ClipPath>
        <RadialGradient id={id("aura")} cx="50%" cy="50%" r="50%">
          <Stop
            offset="55%"
            stopColor={muted ? GREY.edge : "#9A6236"}
            stopOpacity="0.45"
          />
          <Stop
            offset="100%"
            stopColor={muted ? GREY.edge : "#9A6236"}
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

      {BOOKS.map((b) => spine(b, `b${b.x}`))}

      {detailed && (
        <G clipPath={`url(#${id("row")})`}>
          {/* Rests off to the left of the row, so a still crest shows no
              stray streak; the shared sweep carries it across the spines. */}
          <G className="nwb-sheen">
            <Path
              d="M-46 24 L-34 24 L-46 92 L-58 92 Z"
              fill={`url(#${id("gilt")})`}
            />
          </G>
        </G>
      )}

      {/* The last volume. The outer group holds the resting lean as an
          attribute, so a still crest (locked, reduced motion, list sizes)
          leans too; the inner one is the only thing that animates — it slides
          in upright and tips over about the book's own foot. */}
      <G transform={`rotate(${LEAN} ${LAST.x} ${BASE_Y})`}>
        <G className="nwb-arrival">{spine(LAST, "last")}</G>
      </G>

      {/* The shelf, over the books' feet. */}
      <Rect
        x={PLANK.x}
        y={PLANK.y}
        width={PLANK.w}
        height={PLANK.h}
        rx="1.5"
        fill={`url(#${id("wood")})`}
      />
      {detailed && (
        <Rect
          x={PLANK.x}
          y={PLANK.y}
          width={PLANK.w}
          height="1.2"
          fill="#FFF"
          fillOpacity={muted ? 0.12 : 0.25}
        />
      )}

      {/* The ribbon marker, hanging over the plank from its book. Swings from
          its top, inside a wrapper of its own. */}
      {detailed && (
        <G className="nwb-marker">
          <Path
            d={`M${RIBBON_BOOK.x + 2} ${BASE_Y - 2} L${RIBBON_BOOK.x + 5} ${BASE_Y - 2} L${RIBBON_BOOK.x + 5} ${BASE_Y + 16} L${RIBBON_BOOK.x + 3.5} ${BASE_Y + 13.5} L${RIBBON_BOOK.x + 2} ${BASE_Y + 16} Z`}
            fill={`url(#${id("ribbon")})`}
          />
        </G>
      )}
    </>
  );
};
