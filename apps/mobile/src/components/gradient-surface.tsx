import type { ReactNode } from "react";
import { memo, useId } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/**
 * Drawn in SVG rather than with `expo-linear-gradient` because
 * `react-native-svg` is already a dependency and already in the native build.
 * A new native module means every developer and every install rebuilds, which
 * is far too much to pay for a shading.
 */

/**
 * A view whose background is the gradient instead of a colour.
 *
 * The SVG fills the view behind its children, so anything passed in draws on
 * top as it would over a `backgroundColor`. The caller supplies the radius; the
 * clip is forced here, because without `overflow: "hidden"` the gradient is a
 * square behind a rounded box and the corners bleed.
 *
 * Memoised, because an SVG canvas is the most expensive thing on a list row and
 * the row that uses it passes nothing but two colour strings and a constant
 * style — so a parent re-render need not re-render the shading.
 */
export const GradientSurface = memo(function GradientSurface({
  children,
  from,
  style,
  to,
}: {
  children?: ReactNode;
  from: string;
  style?: StyleProp<ViewStyle>;
  to: string;
}) {
  // `useId` is per-instance, which matters: several of these render at once and
  // a shared gradient id would have them all painted in whichever mounted last.
  // The colons React puts in an id are not safe inside `url(#…)`.
  const gradientId = `ib${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <View style={[style, styles.clip]}>
      {/*
        The SVG goes inside a plain absolutely-positioned view rather than being
        one. Percentage dimensions on the SVG itself resolve against the
        parent's *content* box while its position is the padding box's origin,
        so on any padded bubble the fill came up short — a visible strip of
        nothing down the right edge and along the bottom. A wrapper with no
        padding of its own has no such gap to leave.
      */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </LinearGradient>
          </Defs>
          <Rect fill={`url(#${gradientId})`} height="100%" width="100%" />
        </Svg>
      </View>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
});
