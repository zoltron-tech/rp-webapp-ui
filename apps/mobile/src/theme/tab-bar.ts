import type { ViewStyle } from "react-native";
import type { Surfaces, Theme } from "./index";

/**
 * The bottom tab bar's appearance, in one place.
 *
 * The tab layout declares it. Should anything ever put it back through
 * React Navigation's `setOptions`, use this rather than `undefined`: that call
 * is a *replacement*, not a patch, so `undefined` does not fall back to the
 * layout's `screenOptions` — it clears the option and the bar reverts to the
 * library's default, which is white. That was once the white tab bar on the
 * conversations list. (`useHideTabBar` no longer touches the option at all;
 * it holds the bar through the chrome context.)
 */
export const tabBarStyle = (
  theme: Theme & { surfaces: Surfaces },
): ViewStyle => ({
  backgroundColor: theme.navbar,
  borderTopColor: theme.surfaces.border,
});
