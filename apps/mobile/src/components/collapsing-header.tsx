import { type ReactNode, useMemo, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassSurface, getGlassTier } from "@/components/glass-surface";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import { useTabBarChrome } from "@/context/tab-bar";
import { radius, space, useAppTheme } from "@/theme";

/**
 * A tab's top bar that leaves with the bottom bar — Home and Explore only.
 *
 * Scrolling down shrinks the floating tab bar; on these two feeds the header
 * goes up and out of the way at the same moment, and comes back on the same
 * triggers that bring the tab bar back to full size: a scroll up, reaching the
 * top, a touch on the bar (Facebook's and Instagram's feeds). It reads the
 * tab bar's own `collapse` (0…1, native driver), so the two move as one.
 *
 * The native stack header cannot be moved by a JS animation, so these two
 * screens turn it off (`headerShown: false` in their layouts) and this draws
 * the same bar: the logo or page name at the leading edge, the bell and menu
 * (and on Home the magnifier) at the trailing one, on the glass base colour.
 *
 * ## How it moves
 *
 * The bar and the screen's content are one column, and the column slides up
 * by the bar's height — rather than the bar sliding *over* the content. The
 * list keeps its own top, so pull-to-refresh, `useTabTop`'s scroll to top and
 * every scroll offset work exactly as they did with the native header. The
 * column is made taller than the screen by the same height
 * (`marginBottom: -slide`) so nothing is left uncovered at the foot when it
 * has moved up.
 *
 * The bar's surface reaches up behind the status bar, and the slide includes
 * that strip: while the header shows, the clock and battery sit on the bar's
 * colour; once it has gone, the feed runs all the way up under them, as
 * Facebook's and Instagram's do. (A fixed strip there left a grey band.)
 */

/**
 * iOS 26 puts a native header's buttons in a Liquid Glass capsule; every
 * other screen gets it from the system. This bar is drawn here, so it draws
 * the same capsule itself — on Liquid Glass only. Earlier iOS headers have no
 * capsule, and nor do Android's.
 */
const ACTION_CAPSULE = getGlassTier() === "liquid";

/** The native stack header's height, which this stands in for. */
const BAR_HEIGHT = Platform.OS === "ios" ? 44 : 56;

export const CollapsingHeader = ({
  children,
  search = false,
  title,
  under,
}: {
  /** The screen: its list and anything else it draws. */
  children: ReactNode;
  /** Home's magnifier beside the bell. */
  search?: boolean;
  /** The page's name beside the tile; none = the full wordmark (Home). */
  title?: string;
  /** Pinned under the bar and leaving with it — Explore's switcher. */
  under?: ReactNode;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { collapse } = useTabBarChrome();

  /**
   * How far the column moves: the bar, whatever is pinned under it, and the
   * status bar's strip above it.
   */
  const [slide, setSlide] = useState(0);
  const onChromeLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (next !== slide) setSlide(next);
  };

  // A node built once per height, not per render (see `TabBar`'s `anim`).
  const translateY = useMemo(
    () =>
      collapse.interpolate({
        extrapolate: "clamp",
        inputRange: [0, 1],
        outputRange: [0, -slide],
      }),
    [collapse, slide],
  );

  return (
    <View style={styles.fill}>
      <Animated.View
        style={[
          styles.column,
          { marginBottom: -slide, transform: [{ translateY }] },
        ]}
      >
        <View
          onLayout={onChromeLayout}
          style={[
            styles.chrome,
            {
              backgroundColor: theme.glass.opaque,
              borderBottomColor: theme.glass.edge,
              paddingTop: insets.top,
            },
          ]}
        >
          <View style={[styles.bar]}>
            <View style={styles.title}>
              <Logo label={title} size={24} variant="header" />
            </View>
            {ACTION_CAPSULE ? (
              <GlassSurface
                bordered={false}
                highlight={false}
                radius={radius.full}
                style={styles.capsule}
              >
                <HeaderActions search={search} />
              </GlassSurface>
            ) : (
              <HeaderActions search={search} />
            )}
          </View>
          {under}
        </View>
        <View style={styles.fill}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    flexDirection: "row",
    height: BAR_HEIGHT,
    // The native header's insets at both ends: the burger keeps 16pt off the
    // screen edge, as on every other page (measured against Muses on Android;
    // iOS uses the same margin). It sat 4pt from the edge before.
    paddingLeft: space.md,
    paddingRight: space.md,
  },
  /** The system capsule's footprint: the buttons' height plus a little air. */
  /**
   * The system capsule's footprint: iOS's 44pt bar-button height. The gap
   * after the burger is the menu button's own padding, as inside the
   * system one.
   */
  capsule: { height: 44, justifyContent: "center" },
  chrome: { borderBottomWidth: StyleSheet.hairlineWidth },
  column: { flex: 1 },
  fill: { flex: 1, overflow: "hidden" },
  title: { flex: 1, minWidth: 0 },
});
