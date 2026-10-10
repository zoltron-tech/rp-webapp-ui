import type { ReactNode } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { Logo } from "@/components/logo";
import { Text } from "@/components/text";
import { fontSize, useAppTheme } from "@/theme";

/**
 * A stack header's title, at the leading edge on both platforms.
 *
 * Android takes `headerTitleAlign: "left"` and that is that. iOS has no such
 * option: the navigation bar centres its title, always. What it does honour
 * is a title *view* too wide to centre — it fits that into the space between
 * the bar's two sides instead, which puts its leading edge where a
 * left-aligned title would start. So on iOS the title is given a frame that
 * wide and drawn at the start of it.
 *
 * The frame's width is the window less what the bar keeps for itself: the
 * leading margin (or the back button, on a pushed screen) and the trailing
 * button. A few points out either way only moves the title by as much.
 */

/** The bar's own leading margin, where there is no back button. */
const LEADING_ROOT = 16;
/** The back chevron and its margins. */
const LEADING_BACK = 52;
/** The menu button on the trailing side, and its margin. */
const TRAILING = 64;

const Frame = ({ children, root }: { children: ReactNode; root: boolean }) => {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "ios") return <>{children}</>;

  return (
    <View
      style={[
        styles.frame,
        { width: width - (root ? LEADING_ROOT : LEADING_BACK) - TRAILING },
      ]}
    >
      {children}
    </View>
  );
};

/**
 * The title of a pushed screen: the navigator's own title, moved to the
 * start. `glassHeaderOptions` installs it on every stack.
 */
export const HeaderTitle = ({ children }: { children: string }) => {
  const theme = useAppTheme();

  return (
    <Frame root={false}>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={[styles.title, { color: theme.text }]}
      >
        {children}
      </Text>
    </Frame>
  );
};

/**
 * The title of a tab's own page: the brand tile, then the page's name set as
 * the lockup sets "NOVELIST". Home passes no title and gets the whole
 * wordmark, so the six tabs read as one family — the tile stays put and the
 * word beside it changes.
 */
export const TabHeaderTitle = ({ title }: { title?: string }) => (
  <Frame root>
    <Logo label={title} size={28} variant="header" />
  </Frame>
);

const styles = StyleSheet.create({
  frame: { alignItems: "flex-start", justifyContent: "center" },
  title: { fontSize: fontSize.title, fontWeight: "700" },
});
