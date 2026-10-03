import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import type { AppTheme } from "@/theme";

/**
 * Stack headers in the glass language. Every stack layout spreads this into its
 * `screenOptions`, so a header change is made here once.
 *
 * ## Android (and iOS until verified): an opaque glass bar
 *
 * The header keeps its place in the layout and takes the glass base colour
 * (`theme.glass.opaque`, web's `--bg-2`). No elevation shadow: glass bars are
 * not lifted material, and the edit stacks already had it off.
 *
 * Not `headerBackground`: native-stack makes the header *translucent* whenever
 * that option is set (`useHeaderConfigProps` › `translucent`), which lifts
 * every screen's content up under the header on both platforms. A glass
 * surface drawn there would cost a layout regression on every screen.
 *
 * ## iOS: the system's own translucent header, gated
 *
 * With `IOS_GLASS_HEADERS` on, iOS gets `headerTransparent` and a system
 * chrome blur below iOS 26 (iOS 26 built with its SDK draws Liquid Glass
 * itself). That puts content *under* the header, so it is only safe once every
 * scrollable in a stack pads for it — `contentInsetAdjustmentBehavior=
 * "automatic"` on ScrollView/FlatList/FlashList, or `useHeaderHeight()` — and
 * that has not been checked on an iPhone. Off until it has; see
 * `GLASS_REDESIGN_PLAN.md` §5.3.
 */
export const IOS_GLASS_HEADERS = false;

type GlassHeaderOptions = Pick<
  NativeStackNavigationOptions,
  | "headerBlurEffect"
  | "headerShadowVisible"
  | "headerStyle"
  | "headerTintColor"
  | "headerTransparent"
>;

export const glassHeaderOptions = (theme: AppTheme): GlassHeaderOptions => {
  if (IOS_GLASS_HEADERS && Platform.OS === "ios") {
    return {
      headerBlurEffect:
        theme.name === "light"
          ? "systemChromeMaterialLight"
          : "systemChromeMaterialDark",
      headerShadowVisible: false,
      headerStyle: { backgroundColor: "transparent" },
      headerTintColor: theme.text,
      headerTransparent: true,
    };
  }

  return {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.glass.opaque },
    headerTintColor: theme.text,
  };
};
