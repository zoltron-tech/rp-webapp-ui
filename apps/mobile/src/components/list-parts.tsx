import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The pieces every list screen was drawing for itself: what it says when it
 * is empty, the button that asks for the next page, and the gap between rows.
 *
 * Each of these existed as an identical stylesheet block and an identical run
 * of JSX in Home, Explore, Interactions and the friends list. They are here
 * once so the four cannot drift, and so a change to how an empty list reads is
 * a change to one file.
 */

/**
 * An empty list: a glyph, what is missing, and what to do about it.
 *
 * Web's empty state (`outgoing-threads/styles.ts`): a 14/700 title over a 12px
 * body at a comfortable measure. The body is capped rather than left to run
 * the width of the screen, where two short lines read better than one long one.
 */
export const EmptyState = ({
  body,
  icon,
  title,
}: {
  body: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.empty}>
      <Ionicons color={theme.textGray} name={icon} size={40} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: theme.textGray }]}>{body}</Text>
    </View>
  );
};

/**
 * "Load more", for the lists that page on a tap rather than on scroll.
 *
 * A secondary pill, as web's is, centred under the list. It keeps its label
 * while it works — "Loading..." beside the spinner — so the button does not
 * change width under the finger that pressed it.
 */
export const LoadMore = ({
  busy,
  onPress,
}: {
  busy: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.loadMore,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={theme.accent.text} size="small" />
      ) : null}
      <Text style={[styles.loadMoreLabel, { color: theme.accent.text }]}>
        {busy ? "Loading..." : "Load more"}
      </Text>
    </Pressable>
  );
};

/** The gap between two feed cards. Module-level, so a list can take it by reference. */
export const FeedSeparator = () => <View style={styles.feedGap} />;

/** The gap between two list rows. */
export const RowSeparator = () => <View style={styles.rowGap} />;

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
  },
  emptyBody: {
    fontSize: fontSize.caption,
    lineHeight: 19,
    maxWidth: 290,
    textAlign: "center",
  },
  emptyTitle: { fontSize: fontSize.body, fontWeight: "700" },
  feedGap: { height: space.ms },
  loadMore: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    marginTop: space.sm,
    minHeight: 40,
    paddingHorizontal: space.ml,
  },
  loadMoreLabel: { fontSize: fontSize.label, fontWeight: "600" },
  rowGap: { height: space.sm },
});
