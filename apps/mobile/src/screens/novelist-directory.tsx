import { Ionicons } from "@expo/vector-icons";
import { useNovelistLeaderboard } from "@nw/features";
import type { NovelistLeaderboardEntry } from "@nw/types";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { EndOfList } from "@/components/end-of-list";
import { ListStatus } from "@/components/list-status";
import { useTrackOnline } from "@/context/socket";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The novelist directory — the leaderboard, which is what "who else is here"
 * looks like in this product.
 *
 * It was the Home tab's first screen until the home feed took that place;
 * it is now one push away, from "See all" on the feed's friend suggestions,
 * and still inside the Home stack so a profile opened from it stays there.
 *
 * The list beachhead: pagination, images and an empty state, all through
 * `useNovelistLeaderboard` in `@nw/features`. `onEndReached` is the mobile
 * equivalent of the web page's "Load more" button, and it is the *only*
 * difference between the two screens — the page size, the 80-entry cap and the
 * end-of-list rule are decided once, in the hook.
 *
 * Rows open the novelist's profile. The route takes the username rather than
 * the id because that is the handle the web app routes on
 * (`/rp/profile/[slug]`), so a link is the same link on both clients.
 */
export const NovelistDirectory = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const {
    entries,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useNovelistLeaderboard();

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  // Ask the server about everyone on screen, so the green rings mean something.
  // Presence is not pushed — the server answers only about the usernames it was
  // last asked for, so an unregistered face is reported offline rather than
  // unknown.
  useTrackOnline(
    useMemo(() => entries.map((entry) => entry.novelist.username), [entries]),
  );

  const renderItem = ({ item }: { item: NovelistLeaderboardEntry }) => (
    <Pressable
      onPress={() =>
        router.push({
          params: { username: item.novelist.username },
          pathname: "/novelist/[username]",
        })
      }
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.cardBackgroundColor,
        },
      ]}
    >
      <Text style={[styles.rank, { color: theme.textGray }]}>{item.rank}</Text>
      <Avatar
        name={item.novelist.firstName}
        size={40}
        uri={item.novelist.avatar?.src ?? item.novelist.image}
        username={item.novelist.username}
      />
      <View style={styles.identity}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
          {item.novelist.firstName} {item.novelist.lastName ?? ""}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.handle, { color: theme.textGray }]}
        >
          @{item.novelist.username}
        </Text>
      </View>
      <View style={styles.score}>
        <Text style={[styles.points, { color: theme.accent.text }]}>
          {item.totalPoints}
        </Text>
        <Text style={[styles.level, { color: theme.textGray }]}>
          Lv {item.level}
        </Text>
      </View>
      <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
    </Pressable>
  );

  return (
    <FlatList
      {...tabBarScroll}
      contentContainerStyle={contentStyle}
      data={entries}
      keyExtractor={(item) => item.novelist.id}
      ListEmptyComponent={
        <ListStatus
          empty="No novelists to show yet."
          error={error}
          loading={isPending}
          onRetry={refetch}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ListStatus loading />
        ) : !hasNextPage && entries.length > 0 ? (
          <EndOfList />
        ) : null
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  content: { gap: space.sm, padding: space.md },
  handle: { fontSize: fontSize.caption },
  identity: { flex: 1, gap: space.xxs },
  level: { fontSize: fontSize.caption },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  points: { fontSize: fontSize.body, fontWeight: "700" },
  rank: { fontSize: fontSize.label, fontWeight: "700", minWidth: 24 },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  score: { alignItems: "flex-end" },
});
