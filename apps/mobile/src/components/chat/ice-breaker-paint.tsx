import { mixColors } from "@nw/theme";
import { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { radius, space, useAppTheme } from "@/theme";

/**
 * How an ice breaker is painted, in one place.
 *
 * The rail, the sheet that opens one, and the sheet that writes one all draw
 * the same object — a coloured bubble with a line in it — and until this file
 * existed each of them chose its own fill, its own ink and its own border from
 * `iceBreaker.color`. They drifted the moment any one of them changed.
 *
 * ## Why a gradient at all
 *
 * The eight bubble colours are deliberately dark so white text reads on them,
 * and eight dark flats side by side on a phone read as a row of rectangles. A
 * gradient — lighter at the top, darker at the foot — gives each tile a light
 * source, which is what makes it look like an object rather than a swatch. It
 * also matches web, whose default ice-breaker bubble is a
 * `linear-gradient(135deg, var(--accent-4), var(--accent-3))`.
 *
 * The gradient itself is painted by `GradientSurface`, which is generic and
 * lives with the other shared components — the profile's song pill wants the
 * same thing and has nothing to do with chat.
 */

/** How far the top stop is lifted toward white. */
const LIFT = 0.16;

/** How far the bottom stop is dropped toward black. */
const DROP = 0.12;

export interface IceBreakerPaint {
  /** Top gradient stop. */
  from: string;
  /** Bottom gradient stop — also what the trailing dots take, so they match. */
  to: string;
  /** Body text. */
  ink: string;
  /** Author name, timestamps, anything secondary. */
  mutedInk: string;
  /** The quotation watermark, which must sit under the text without hiding it. */
  watermark: string;
  /** The bubble's hairline. */
  border: string;
  /** Whether the author chose a colour, i.e. whether the ink is white. */
  coloured: boolean;
}

/**
 * What an ice breaker with no colour is painted with.
 *
 * Web draws the two differently and on purpose: a colourless bubble on the rail
 * is `--bg-3`, one in a dialog is the accent gradient. The rail sits over the
 * page's own background and a row of accent bubbles there would read as a row
 * of buttons; a dialog is a surface of its own, where the accent is what says
 * "this is the thing you opened".
 */
export type IceBreakerFallback = "card" | "accent";

export const useIceBreakerPaint = (
  color: string | null | undefined,
  fallback: IceBreakerFallback = "card",
): IceBreakerPaint => {
  const theme = useAppTheme();

  return useMemo(() => {
    if (!color) {
      if (fallback === "accent") {
        // Web: `linear-gradient(135deg, var(--accent-4) 0%, var(--accent-3)
        // 100%)` with a `--accent-6` border and ordinary body text over it.
        return {
          border: theme.accent.surface,
          coloured: false,
          from: theme.accent.tintStrong,
          ink: theme.text,
          mutedInk: theme.textGray,
          to: theme.accent.tint,
          watermark: theme.accent.surfaceHover,
        };
      }

      // The card surface, shaded the same direction, so a colourless bubble is
      // the same object in a quieter finish rather than a flat box among lit
      // ones.
      return {
        border: theme.material.edge,
        coloured: false,
        from: theme.material.fillPressed,
        ink: theme.text,
        mutedInk: theme.textGray,
        to: theme.material.fill,
        watermark: theme.material.edge,
      };
    }

    return {
      // The foot of the gradient, so the border reads as the bubble's own edge
      // rather than a ring drawn around it.
      border: mixColors("#000000", DROP, color),
      coloured: true,
      from: mixColors("#ffffff", LIFT, color),
      ink: "#ffffff",
      mutedInk: "rgba(255,255,255,0.86)",
      to: mixColors("#000000", DROP, color),
      watermark: "rgba(255,255,255,0.26)",
    };
  }, [color, fallback, theme]);
};

/**
 * The two shrinking circles that join a bubble to the face it belongs to.
 *
 * Web's ice breaker is a *thought* bubble, not a speech one: no pointed tail,
 * but a pair of trailing circles drifting toward the avatar, shrinking as they
 * go (`IceBreakerBubble::before/::after`, and again on the dialog's bubble).
 * That is the motif the feature is recognised by on the other client, and a
 * pointed tail here would have made the same object read as a different one.
 *
 * `direction` is which way the trail travels: `"down"` when the face is under
 * the bubble, `"up"` when it is above. The dots are laid out in flow rather
 * than absolutely, so nothing has to know how tall the bubble grew.
 */
export const IceBreakerTrail = ({
  border,
  color,
  direction,
  style,
}: {
  border: string;
  color: string;
  direction: "down" | "up";
  style?: StyleProp<ViewStyle>;
}) => {
  const big = (
    <View
      key="big"
      style={[
        styles.dot,
        styles.dotBig,
        { backgroundColor: color, borderColor: border },
      ]}
    />
  );
  const small = (
    <View
      key="small"
      style={[
        styles.dot,
        styles.dotSmall,
        { backgroundColor: color, borderColor: border },
      ]}
    />
  );

  return (
    <View pointerEvents="none" style={[styles.trail, style]}>
      {direction === "down" ? [big, small] : [small, big]}
    </View>
  );
};

const styles = StyleSheet.create({
  dot: { borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth },
  // Offset from the smaller one so the pair drifts rather than stacking.
  dotBig: { height: 9, marginLeft: space.xs, width: 9 },
  dotSmall: { height: 5, width: 5 },
  trail: { alignItems: "flex-start", gap: 3, paddingLeft: space.ms },
});
