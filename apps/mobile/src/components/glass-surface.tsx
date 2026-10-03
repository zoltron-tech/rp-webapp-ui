import type { GlassVariant } from "@nw/theme";
import { type BlurTint, BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { createContext, memo, useContext } from "react";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { useA11ySettings } from "@/lib/a11y-settings";
import { useAppTheme } from "@/theme";

/**
 * The one glass primitive. Nothing else in the app imports `expo-blur` or
 * `expo-glass-effect`.
 *
 * Glass is for the functional layer only — tab bar, headers, sheets, menus,
 * composer bars. Cards, rows and bubbles are content and use
 * `theme.material` (see `GLASS_REDESIGN_PLAN.md` §5).
 *
 * ## Tiers
 *
 *  - **liquid** — iOS 26 and later, built with the iOS 26 SDK: the system's own
 *    Liquid Glass through `GlassView`. No fill and no hairline of ours on top;
 *    the material has no colour of its own and draws its own edge, and a tint
 *    layer would flatten exactly what makes it glass.
 *  - **blur** — earlier iOS: a system material (`UIVisualEffectView`) with a
 *    thin fill of the accent's neutral on top, plus a hairline and a highlight.
 *  - **fill** — Android, and anywhere glass is nested in glass: no blur, a
 *    near-opaque fill, the hairline and the highlight. Android blur is costly,
 *    uneven across versions and not the platform's language.
 *  - **opaque** — Reduce Transparency or Increase Contrast: a solid fill, and
 *    under Increase Contrast a strong edge.
 *
 * ## Shape
 *
 * The surface clips (`overflow: "hidden"`) because a blur view ignores
 * `borderRadius` on its own. Clipping also removes an iOS shadow, so a caller
 * that wants one wraps the surface in a view that carries it.
 */

/** Off = every surface draws the opaque tier. A one-line rollback. */
export const GLASS_ENABLED = true;

export type GlassTier = "liquid" | "blur" | "fill" | "opaque";

let platformTier: GlassTier | null = null;

/** What this device can draw, before accessibility settings are considered. */
export const getGlassTier = (): GlassTier => {
  if (platformTier) return platformTier;
  if (!GLASS_ENABLED) {
    platformTier = "opaque";
  } else if (Platform.OS !== "ios") {
    platformTier = "fill";
  } else {
    let liquid = false;
    try {
      liquid = isLiquidGlassAvailable();
    } catch {
      // An older dev client without the module: fall back rather than crash.
    }
    platformTier = liquid ? "liquid" : "blur";
  }
  return platformTier;
};

/**
 * System materials per variant. `intensity` 100 is the material as Apple
 * draws it; anything lower fades the material towards clear rather than
 * making it thinner, so thickness is chosen here instead.
 */
const BLUR_TINT: Record<GlassVariant, { dark: BlurTint; light: BlurTint }> = {
  bar: { dark: "systemChromeMaterialDark", light: "systemChromeMaterialLight" },
  clear: {
    dark: "systemUltraThinMaterialDark",
    light: "systemUltraThinMaterialLight",
  },
  panel: {
    dark: "systemThickMaterialDark",
    light: "systemThickMaterialLight",
  },
  sheet: { dark: "systemMaterialDark", light: "systemMaterialLight" },
};

/** True below a glass surface. A nested surface drops its blur. */
const InsideGlass = createContext(false);

let warnedNested = false;

/**
 * The top highlight stops short of the corners. Capped, because a capsule's
 * radius is `radius.full` (999) and 60% of that would inset the line past both
 * ends of the bar and draw nothing.
 */
const HIGHLIGHT_RADIUS_CAP = 32;

export interface GlassSurfaceProps extends ViewProps {
  /** Default `bar`. `clear` only over photos, video and other rich media. */
  variant?: GlassVariant;
  /** Corner radius of the surface. */
  radius?: number;
  /**
   * The hairline. Default all round; `"bottom"` for a bar pinned to the top of
   * the screen, `"top"` for one pinned to the bottom.
   */
  bordered?: boolean | "bottom" | "top";
  /**
   * Light catching the top edge. Default on for `bar`, `panel` and `sheet`,
   * off for `clear` and for a surface whose only edge is its bottom.
   */
  highlight?: boolean;
  /** Pick a tier instead of the device's. For the glass lab. */
  forceTier?: GlassTier;
}

export const GlassSurface = memo(function GlassSurface({
  bordered = true,
  children,
  forceTier,
  highlight,
  radius = 0,
  style,
  variant = "bar",
  ...rest
}: GlassSurfaceProps) {
  const theme = useAppTheme();
  const nested = useContext(InsideGlass);
  const { increaseContrast, reduceTransparency } = useA11ySettings();
  const dark = theme.name !== "light";

  if (__DEV__ && nested && !warnedNested) {
    warnedNested = true;
    console.warn(
      "GlassSurface inside GlassSurface: the inner one draws without blur. " +
        "Glass on glass muddies the hierarchy; use theme.material inside.",
    );
  }

  let tier: GlassTier = forceTier ?? getGlassTier();
  if (reduceTransparency || increaseContrast) tier = "opaque";
  else if (nested && tier !== "opaque") tier = "fill";

  const fill =
    tier === "opaque"
      ? theme.glass.opaque
      : tier === "blur"
        ? theme.glass.fill.material[variant]
        : tier === "fill"
          ? theme.glass.fill.unblurred[variant]
          : undefined;

  const showLines = tier !== "liquid";
  const showHighlight =
    showLines &&
    tier !== "opaque" &&
    (highlight ?? (variant !== "clear" && bordered !== "bottom"));

  const edgeColor = increaseContrast
    ? theme.glass.contrastEdge
    : theme.glass.edge;
  const edge =
    !showLines || bordered === false
      ? null
      : bordered === "top"
        ? { borderTopColor: edgeColor, borderTopWidth: StyleSheet.hairlineWidth }
        : bordered === "bottom"
          ? {
              borderBottomColor: edgeColor,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }
          : { borderColor: edgeColor, borderWidth: StyleSheet.hairlineWidth };

  // Over a blur the fill is its own layer, above the blur view. Anywhere else
  // it is the container's background — one view fewer, and on Android the only
  // way `elevation` casts a shadow is from a view that has a background.
  const fillLayered = tier === "blur";
  const inset = Math.min(radius, HIGHLIGHT_RADIUS_CAP) * 0.6;

  return (
    <View
      {...rest}
      style={[
        styles.shape,
        { borderRadius: radius },
        fill && !fillLayered ? { backgroundColor: fill } : null,
        edge,
        style,
      ]}
    >
      {tier === "liquid" ? (
        <GlassView
          colorScheme={dark ? "dark" : "light"}
          glassEffectStyle={variant === "clear" ? "clear" : "regular"}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      ) : null}
      {tier === "blur" ? (
        <BlurView
          intensity={100}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          tint={BLUR_TINT[variant][dark ? "dark" : "light"]}
        />
      ) : null}
      {fill && fillLayered ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: fill }]}
        />
      ) : null}
      {showHighlight ? (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              backgroundColor:
                variant === "sheet" ? theme.glass.sheen : theme.glass.highlight,
              left: inset,
              right: inset,
            },
          ]}
        />
      ) : null}
      <InsideGlass.Provider value>{children}</InsideGlass.Provider>
    </View>
  );
});

const styles = StyleSheet.create({
  highlight: {
    height: StyleSheet.hairlineWidth * 2,
    position: "absolute",
    top: 0,
  },
  shape: { overflow: "hidden" },
});
