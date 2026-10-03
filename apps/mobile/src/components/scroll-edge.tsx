import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { StyleSheet } from "react-native";
import { withAlpha } from "@/lib/color";
import { useAppTheme } from "@/theme";

/**
 * The band where scrolling content meets a bar.
 *
 * Content should thin out on its way under a bar rather than collide with its
 * edge (`liquid-glass.md` › Scroll edge effect). This is the fade half of
 * that: a gradient from the page colour to clear, laid over the scroll view
 * and passing touches through. The blur half belongs to the bar itself.
 *
 * Placed by the caller, flush with the bar's inner edge: `edge="top"` sits
 * under a header and fades downward, `edge="bottom"` sits above a bottom bar
 * and fades upward.
 */
export const ScrollEdge = memo(function ScrollEdge({
  color,
  edge,
  height = 28,
  offset = 0,
  strength = 0.9,
}: {
  /** Defaults to the page colour. */
  color?: string;
  edge: "top" | "bottom";
  /** Height of the band, in dp. */
  height?: number;
  /** Distance from the screen edge — the bar's height, usually. */
  offset?: number;
  /** Opacity of the page colour at the bar's edge. */
  strength?: number;
}) {
  const theme = useAppTheme();
  const solid = withAlpha(color ?? theme.background, strength);
  const clear = withAlpha(color ?? theme.background, 0);

  return (
    <LinearGradient
      colors={edge === "top" ? [solid, clear] : [clear, solid]}
      pointerEvents="none"
      style={[
        styles.band,
        { height },
        edge === "top" ? { top: offset } : { bottom: offset },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  band: { left: 0, position: "absolute", right: 0 },
});
