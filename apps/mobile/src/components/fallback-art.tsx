import { mixColors } from "@nw/theme";
import { memo, useId, useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { asHex } from "@/lib/color";
import { useAppTheme } from "@/theme";

/**
 * Art for a card that has no picture of its own.
 *
 * A grey box or a lone icon reads as an image that failed to load. This reads
 * as a card that was *designed* empty: the accent washed into the page, a
 * soft light, a scatter of the four-point stars the rest of the product uses,
 * and an emblem for what the card is — a portrait cameo for a character, an
 * open book for a story, a written page for a chapter.
 *
 * The layout is seeded from the card's name, so two empty cards side by side
 * in a rail are not identical, and the same card looks the same every time.
 * The colour is the character's own accent when it has one, else the theme's.
 *
 * It fills its box (`slice`), so give it `absoluteFill` or a sized style. The
 * emblem sits a little above centre, clear of name blocks drawn at the foot.
 */
export type FallbackArtKind = "character" | "story" | "chapter";

/** Width over height of the drawing, per kind — the shape it is usually shown at. */
const ASPECT: Record<FallbackArtKind, number> = {
  chapter: 1,
  character: 132 / 231,
  story: 0.7,
};

/** The product's four-point star. */
const STAR =
  "M0 -5 C0.6 -1.6 1.6 -0.6 5 0 C1.6 0.6 0.6 1.6 0 5 C-0.6 1.6 -1.6 0.6 -5 0 C-1.6 -0.6 -0.6 -1.6 0 -5 Z";

/** FNV-1a: a stable number from a name. */
const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** Mulberry32: a small repeatable sequence from that number. */
const sequence = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

interface EmblemProps {
  accent: string;
  cx: number;
  figure: string;
  ink: string;
}

/** A cameo: an oval frame round a head-and-shoulders silhouette. */
const Cameo = ({ cx, figure, ink }: EmblemProps) => (
  <G>
    <Ellipse
      cx={cx}
      cy={46}
      fill="none"
      rx={19}
      ry={25}
      stroke={ink}
      strokeOpacity={0.35}
      strokeWidth={0.7}
    />
    <Circle
      cx={cx}
      cy={39}
      fill={figure}
      r={7.5}
      stroke={ink}
      strokeOpacity={0.45}
      strokeWidth={0.6}
    />
    <Path
      d={`M ${cx - 14} 68 C ${cx - 14} 56 ${cx - 7} 51 ${cx} 51 C ${cx + 7} 51 ${cx + 14} 56 ${cx + 14} 68 Z`}
      fill={figure}
      stroke={ink}
      strokeOpacity={0.45}
      strokeWidth={0.6}
    />
  </G>
);

/** An open book with a ribbon marker. */
const Book = ({ accent, cx, figure, ink }: EmblemProps) => {
  const page = (side: -1 | 1) =>
    `M ${cx} 40 C ${cx + side * 8} 36 ${cx + side * 18} 36 ${cx + side * 24} 38 L ${cx + side * 24} 62 C ${cx + side * 18} 60 ${cx + side * 8} 60 ${cx} 64 Z`;
  const lines = (side: -1 | 1) =>
    [45, 50, 55].map((y) => (
      <Path
        d={`M ${cx + side * 5} ${y} L ${cx + side * 19} ${y - 1.5}`}
        key={`${side}-${y}`}
        stroke={ink}
        strokeLinecap="round"
        strokeOpacity={0.3}
        strokeWidth={0.8}
      />
    ));
  return (
    <G>
      <Path
        d={`M ${cx + 9} 37 L ${cx + 9} 70 L ${cx + 12} 67 L ${cx + 15} 70 L ${cx + 15} 37 Z`}
        fill={accent}
      />
      <Path d={page(-1)} fill={figure} stroke={ink} strokeOpacity={0.45} strokeWidth={0.6} />
      <Path d={page(1)} fill={figure} stroke={ink} strokeOpacity={0.45} strokeWidth={0.6} />
      <Path d={`M ${cx} 40 L ${cx} 64`} stroke={ink} strokeOpacity={0.5} strokeWidth={0.7} />
      {lines(-1)}
      {lines(1)}
    </G>
  );
};

/** A written page, turned slightly. */
const Leaf = ({ cx, figure, ink }: EmblemProps) => (
  <G transform={`rotate(-6 ${cx} 50)`}>
    <Rect
      fill={figure}
      height={48}
      rx={3}
      stroke={ink}
      strokeOpacity={0.45}
      strokeWidth={0.6}
      width={36}
      x={cx - 18}
      y={26}
    />
    {[36, 42, 48, 54, 60].map((y, i) => (
      <Path
        d={`M ${cx - 12} ${y} L ${cx + (i === 4 ? 2 : 12)} ${y}`}
        key={y}
        stroke={ink}
        strokeLinecap="round"
        strokeOpacity={0.3}
        strokeWidth={0.8}
      />
    ))}
  </G>
);

const EMBLEMS: Record<FallbackArtKind, (props: EmblemProps) => React.JSX.Element> = {
  chapter: Leaf,
  character: Cameo,
  story: Book,
};

export const FallbackArt = memo(function FallbackArt({
  accent,
  kind,
  seed,
  style,
}: {
  /** A character's own accent hex; the theme accent when absent. */
  accent?: string | null;
  kind: FallbackArtKind;
  /** The card's name, so each empty card is drawn a little differently. */
  seed?: string | null;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const light = theme.name === "light";
  const base = asHex(accent) ?? theme.accent.solid;
  const page = theme.background;
  const width = 100 * ASPECT[kind];
  const height = 100;

  const layout = useMemo(() => {
    const next = sequence(hash(`${kind}:${seed ?? ""}`));
    return {
      flip: next() > 0.5,
      glowX: width * (0.25 + next() * 0.5),
      glowY: height * (0.18 + next() * 0.22),
      stars: Array.from({ length: 7 }, () => ({
        opacity: 0.3 + next() * 0.5,
        scale: 0.22 + next() * 0.4,
        x: next() * width,
        y: next() * height * 0.75,
      })),
    };
  }, [kind, seed, width]);

  const deep = mixColors(base, light ? 0.3 : 0.5, page);
  const glow = mixColors(base, 0.7, "#ffffff");
  const ink = light
    ? mixColors(base, 0.7, "#000000")
    : mixColors(base, 0.55, "#ffffff");
  const figure = mixColors(base, light ? 0.4 : 0.6, page);
  const Emblem = EMBLEMS[kind];

  return (
    <View pointerEvents="none" style={style}>
      <Svg
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
      >
        <Defs>
          <LinearGradient
            id={`fa-bg-${uid}`}
            x1={layout.flip ? "1" : "0"}
            x2={layout.flip ? "0" : "1"}
            y1="0"
            y2="1"
          >
            <Stop offset="0" stopColor={deep} />
            <Stop offset="1" stopColor={page} />
          </LinearGradient>
          <RadialGradient
            cx={layout.glowX}
            cy={layout.glowY}
            gradientUnits="userSpaceOnUse"
            id={`fa-glow-${uid}`}
            r={width * 0.7}
          >
            <Stop offset="0" stopColor={glow} stopOpacity={light ? 0.35 : 0.28} />
            <Stop offset="1" stopColor={glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect fill={`url(#fa-bg-${uid})`} height={height} width={width} />
        <Rect fill={`url(#fa-glow-${uid})`} height={height} width={width} />
        {layout.stars.map((star, index) => (
          <Path
            d={STAR}
            fill={glow}
            fillOpacity={star.opacity}
            // Positions come from the seed and never reorder.
            key={index}
            transform={`translate(${star.x} ${star.y}) scale(${star.scale})`}
          />
        ))}
        <Emblem accent={base} cx={width / 2} figure={figure} ink={ink} />
      </Svg>
    </View>
  );
});
