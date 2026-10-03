import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useAppTheme } from "@/theme";

/**
 * The chat wallpaper — the same one the web conversation panel draws.
 *
 * Web builds it out of four stacked `background-image` layers: two enormous
 * accent-tinted radial gradients in opposite corners, over a 40×40 SVG tile of
 * a diamond outline with a dot at its centre
 * (`conversations/[conversationId]/styles.ts`, `ACTIVE_CHAT_PATTERN =
 * "diamonds"`). None of that survives translation — React Native has no
 * `background-image`, no tiling, and no `color-mix` — so it is rebuilt here as
 * one SVG with a `<Pattern>` and two `<RadialGradient>`s, which is the same
 * picture by different means.
 *
 * The numbers are web's, not approximations: 40dp tile, 0.75 stroke, r=1.2
 * centre dot, `rgba(128,128,128,0.10)` and `0.12`, and glows at 18% and 20%
 * accent covering a 65%×55% ellipse anchored to opposite corners. Reading them
 * off the stylesheet is the only way the two clients look like one product.
 *
 * Absolutely positioned behind the message list, and `pointerEvents="none"` so
 * it never intercepts a scroll or a long-press on a bubble.
 */

/** Web: `width='40' height='40'` on the diamond tile. */
const TILE = 40;

/** Web: `rgba(128,128,128,0.10)` stroke, `0.12` dot — neutral in both themes. */
const LINE = "rgba(128,128,128,0.10)";
const DOT = "rgba(128,128,128,0.12)";

export const ChatBackground = () => {
  const theme = useAppTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }]}
      />

      <Svg height="100%" width="100%">
        <Defs>
          <Pattern
            height={TILE}
            id="diamonds"
            patternUnits="userSpaceOnUse"
            width={TILE}
          >
            <Path
              d={`M${TILE / 2} 0 L${TILE} ${TILE / 2} L${TILE / 2} ${TILE} L0 ${TILE / 2} Z`}
              fill="none"
              stroke={LINE}
              strokeWidth={0.75}
            />
            <Circle cx={TILE / 2} cy={TILE / 2} fill={DOT} r={1.2} />
          </Pattern>

          {/*
            Web's `radial-gradient(ellipse 65% 55% at <corner>, ... 0%, transparent 100%)`.
            `gradientUnits="objectBoundingBox"` puts the centre and the radii in
            fractions of the box, which is what a CSS percentage means here.
          */}
          <RadialGradient
            cx="1"
            cy="1"
            gradientUnits="objectBoundingBox"
            id="glowBottomRight"
            rx="0.65"
            ry="0.55"
          >
            <Stop
              offset="0"
              stopColor={theme.accent.solid}
              stopOpacity={0.18}
            />
            <Stop offset="1" stopColor={theme.accent.solid} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            cx="0"
            cy="0"
            gradientUnits="objectBoundingBox"
            id="glowTopLeft"
            rx="0.65"
            ry="0.55"
          >
            <Stop offset="0" stopColor={theme.accent.solid} stopOpacity={0.2} />
            <Stop offset="1" stopColor={theme.accent.solid} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Painted in web's stacking order: glows first, tile on top. */}
        <Rect fill="url(#glowBottomRight)" height="100%" width="100%" />
        <Rect fill="url(#glowTopLeft)" height="100%" width="100%" />
        <Rect fill="url(#diamonds)" height="100%" width="100%" />
      </Svg>
    </View>
  );
};
