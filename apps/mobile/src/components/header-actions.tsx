import { Ionicons } from "@expo/vector-icons";
import { useNotificationCounts } from "@nw/features";
import { useRouter, useSegments } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { MenuButton } from "@/components/menu-button";
import { Text } from "@/components/text";
import { radius, space, useAppTheme } from "@/theme";

/**
 * The header's trailing side on every tab's stack: the bell, then the burger.
 *
 * Notifications left the bottom bar for here (the bar keeps the five places
 * you read and write in; the bell is something that happens to you). The
 * route is still the `(notifications)` tab — hidden from the bar — so its
 * stack, push routing and `markSeen` on focus are unchanged.
 *
 * One custom view for both buttons, so iOS 26 wraps the pair in a single
 * glass capsule rather than two.
 */
const HIT_SLOP = {
  bottom: space.md,
  left: space.sm,
  right: space.s,
  top: space.md,
};

export const NotificationsButton = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const segments = useSegments() as string[];
  const here = segments.includes("(notifications)");
  // What has arrived since the list was last opened, counted by the server.
  const { data } = useNotificationCounts();
  const unseen = data?.unseen ?? 0;

  return (
    <Pressable
      accessibilityLabel={
        unseen > 0 ? `Notifications, ${unseen} new` : "Notifications"
      }
      accessibilityRole="button"
      accessibilityState={{ selected: here }}
      hitSlop={HIT_SLOP}
      onPress={() => router.navigate("/(tabs)/(notifications)")}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        paddingLeft: space.md,
        paddingRight: space.s,
      })}
    >
      <View>
        <Ionicons
          color={theme.text}
          name={here ? "notifications" : "notifications-outline"}
          size={24}
        />
        {unseen > 0 ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.unreadBadge,
                borderColor: theme.glass.opaque,
              },
            ]}
          >
            <Text numberOfLines={1} style={styles.badgeLabel}>
              {unseen > 9 ? "9+" : unseen}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

/**
 * The magnifier, Home's only. It used to be a search pill at the top of the
 * feed; now it opens `screens/global-search`, whose own bar grows the field
 * out from where this icon sits (the screen fades in, so it reads as one
 * motion).
 */
export const SearchButton = () => {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel="Search novelists and characters"
      accessibilityRole="search"
      hitSlop={HIT_SLOP}
      onPress={() => router.push("/search")}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        paddingLeft: space.md,
        paddingRight: space.s,
      })}
    >
      <Ionicons color={theme.text} name="search" size={23} />
    </Pressable>
  );
};

/** Width the magnifier adds to the trailing side (see `header-title`). */
export const SEARCH_BUTTON_WIDTH = 45;
/** Width of the bell: its 24pt glyph and its padding (see `header-title`). */
export const BELL_BUTTON_WIDTH = 46;

/**
 * `bell={false}` on the Notifications list itself, where the bell would only
 * open the page already on screen.
 */
export const HeaderActions = ({
  bell = true,
  search = false,
}: {
  bell?: boolean;
  search?: boolean;
}) => (
  <View style={styles.row}>
    {search ? <SearchButton /> : null}
    {bell ? <NotificationsButton /> : null}
    <MenuButton />
  </View>
);

const styles = StyleSheet.create({
  // The tab bar's badge, so the count reads the same as it did down there.
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1.5,
    justifyContent: "center",
    minWidth: 16,
    paddingHorizontal: 3,
    position: "absolute",
    right: -8,
    top: -4,
  },
  badgeLabel: { color: "#ffffff", fontSize: 9, fontWeight: "700" },
  row: { alignItems: "center", flexDirection: "row" },
});
