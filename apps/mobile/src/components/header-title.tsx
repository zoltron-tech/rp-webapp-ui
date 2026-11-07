import type { ReactNode } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  BELL_BUTTON_WIDTH,
  SEARCH_BUTTON_WIDTH,
} from "@/components/header-actions";
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
 *
 * Beside a back button the frame starts right at the edge of the button's
 * glass bubble, so the title is inset from there by `BACK_GAP` — without it
 * the first letter touched the bubble.
 */

/** The bar's own leading margin, where there is no back button. */
const LEADING_ROOT = 16;
/** The back chevron and its margins. */
const LEADING_BACK = 52;
/** Room between the back button's bubble and the title beside it. */
const BACK_GAP = 12;
/**
 * The trailing side: the bell (46), the menu button (58), and the margin.
 * See `HeaderActions`.
 */
const TRAILING = 110;

const Frame = ({
  children,
  extraTrailing = 0,
  root,
}: {
  children: ReactNode;
  /**
   * More (or, negative, fewer) points on the trailing side than the bell
   * and the burger take.
   */
  extraTrailing?: number;
  root: boolean;
}) => {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "ios") return <>{children}</>;

  return (
    <View
      style={[
        styles.frame,
        {
          paddingLeft: root ? 0 : BACK_GAP,
          width:
            width -
            (root ? LEADING_ROOT : LEADING_BACK) -
            TRAILING -
            extraTrailing,
        },
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
 *
 * `back` for a tab page that carries a back button (Notifications, which
 * has no column in the bar), so the frame leaves room for the chevron;
 * `search` for Home, whose header has the magnifier as well; `bell={false}`
 * for Notifications, whose header leaves the bell out. The frame has to
 * match the buttons: narrower than the space between them and iOS centres
 * it again.
 */
export const TabHeaderTitle = ({
  back = false,
  bell = true,
  search = false,
  title,
}: {
  back?: boolean;
  bell?: boolean;
  search?: boolean;
  title?: string;
}) => (
  <Frame
    extraTrailing={
      (search ? SEARCH_BUTTON_WIDTH : 0) - (bell ? 0 : BELL_BUTTON_WIDTH)
    }
    root={!back}
  >
    <Logo label={title} size={24} variant="header" />
  </Frame>
);

const styles = StyleSheet.create({
  frame: { alignItems: "flex-start", justifyContent: "center" },
  title: { fontSize: fontSize.title, fontWeight: "700" },
});
