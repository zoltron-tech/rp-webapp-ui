import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { createElement } from "react";
import { Platform } from "react-native";
import { HeaderTitle } from "@/components/header-title";
import { type AppTheme, font } from "@/theme";

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

/**
 * The title in the interface face. A native header is not `components/text`,
 * so it is given the bold file by name; `fontWeight` on top would bold it twice.
 */
const TITLE_STYLE = { fontFamily: font.bold } as const;

/**
 * The chevron alone, on every stack.
 *
 * iOS writes the previous screen's title beside the back chevron, and where
 * that screen has none it writes the route's name — a screen opened from the
 * menu said "(tabs)". Android never drew a label, so this is also what makes
 * the two platforms' headers the same.
 */
const BACK_BUTTON = { headerBackButtonDisplayMode: "minimal" } as const;

/**
 * The title at the leading edge, on every stack.
 *
 * `headerTitleAlign` is Android's; iOS ignores it, so the title is also drawn
 * by `HeaderTitle`, which is what moves it there — see that component. A
 * screen that sets its own `headerTitle` replaces this one.
 */
const TITLE = {
  headerTitle: ({ children }: { children: string }) =>
    createElement(HeaderTitle, null, children),
  headerTitleAlign: "left",
} as const;

type GlassHeaderOptions = Pick<
  NativeStackNavigationOptions,
  | "headerBackButtonDisplayMode"
  | "headerBlurEffect"
  | "headerShadowVisible"
  | "headerStyle"
  | "headerTintColor"
  | "headerTitle"
  | "headerTitleAlign"
  | "headerTitleStyle"
  | "headerTransparent"
>;

export const glassHeaderOptions = (theme: AppTheme): GlassHeaderOptions => {
  if (IOS_GLASS_HEADERS && Platform.OS === "ios") {
    return {
      ...BACK_BUTTON,
      ...TITLE,
      headerBlurEffect:
        theme.name === "light"
          ? "systemChromeMaterialLight"
          : "systemChromeMaterialDark",
      headerShadowVisible: false,
      headerStyle: { backgroundColor: "transparent" },
      headerTintColor: theme.text,
      headerTitleStyle: TITLE_STYLE,
      headerTransparent: true,
    };
  }

  return {
    ...BACK_BUTTON,
    ...TITLE,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.glass.opaque },
    headerTintColor: theme.text,
    headerTitleStyle: TITLE_STYLE,
  };
};
