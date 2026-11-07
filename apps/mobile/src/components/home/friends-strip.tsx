import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { Friend } from "@nw/types";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { SectionHeader } from "@/components/home/section-header";
import { Text } from "@/components/text";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Web's friends strip at the head of Home: a row of faces, each the way to that
 * friend's profile. With no friends yet it is the way to find some.
 */

const FACE = 56;
const CELL = 68;

const keyExtractor = (friend: Friend) => friend.id;

const FriendCell = memo(function FriendCell({
  friend,
  onOpen,
}: {
  friend: Friend;
  onOpen: (username: string) => void;
}) {
  const theme = useAppTheme();
  // A name can be blank on the server; the handle never is.
  const label = friend.firstName?.trim() || friend.username;
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="link"
      onPress={() => onOpen(friend.username)}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
    >
      <Avatar
        image={friend.avatar}
        name={label}
        size={FACE}
        uri={friend.avatar?.src ?? friend.image}
        username={friend.username}
      />
      <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
        {label}
      </Text>
    </Pressable>
  );
});

const FriendsStripView = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const { novelist } = useSession();

  const openProfile = useCallback(
    (username: string) =>
      router.push({ params: { username }, pathname: "/novelist/[username]" }),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => (
      <FriendCell friend={item} onOpen={openProfile} />
    ),
    [openProfile],
  );

  if (!novelist) return null;
  const friends = novelist.friends ?? [];

  return (
    <View style={styles.section}>
      <SectionHeader title="Friends" />
      {friends.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.row}
          data={friends}
          horizontal
          initialNumToRender={6}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          windowSize={3}
        />
      ) : (
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/fellows")}
          style={({ pressed }) => [styles.empty, pressed && styles.pressed]}
        >
          <View
            style={[
              styles.find,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons color={theme.accent.text} name="search" size={20} />
          </View>
          <Text style={[styles.emptyText, { color: theme.textGray }]}>
            No friends yet. Find novelists to connect with.
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export const FriendsStrip = memo(FriendsStripView);

const styles = StyleSheet.create({
  cell: { alignItems: "center", gap: space.xs, width: CELL },
  empty: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.md,
  },
  emptyText: { flex: 1, fontSize: fontSize.label },
  find: {
    alignItems: "center",
    borderRadius: FACE / 2,
    borderWidth: 1,
    height: FACE,
    justifyContent: "center",
    width: FACE,
  },
  name: { fontSize: fontSize.caption, textAlign: "center" },
  pressed: { opacity: 0.7 },
  row: { gap: space.xs, paddingHorizontal: space.sm },
  section: { paddingBottom: space.m },
});
