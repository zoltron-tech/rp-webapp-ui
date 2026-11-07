import { Ionicons } from "@expo/vector-icons";
import { useNovelistFriends, useSession } from "@nw/features";
import type { Friend } from "@nw/types";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { View } from "react-native";
import { Avatar } from "@/components/avatar";
import { SkeletonRows } from "@/components/list-skeletons";
import { SearchField } from "@/components/search-field";
import { FriendPickRowSkeleton } from "@/components/sheet-skeletons";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Choosing friends, for a tray: what New group and Add members share.
 *
 * ## Chips, not a dropdown
 *
 * Web picks people through a dropdown that holds its selection out of sight.
 * On a phone that is two surfaces stacked on one screen, and the second one
 * hides the first. Here the friends are the list, tapping toggles, and the
 * chosen faces ride along the top in a row you can scroll, so "who have I
 * picked" is answered without leaving the list you are choosing from.
 */
export const FriendPicker = ({
  emptyText,
  exclude,
  onToggle,
  selected,
  visible,
}: {
  /** What an empty list says when no search is on. */
  emptyText: string;
  /** Ids not to offer: people already in the group. */
  exclude?: ReadonlySet<string>;
  onToggle: (friend: Friend) => void;
  selected: Friend[];
  /** The tray is open. Friends load, and the search clears, by this. */
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const { novelist } = useSession();
  const [search, setSearch] = useState("");

  const { fetchNextPage, friends, hasNextPage, isFetchingNextPage, isPending } =
    useNovelistFriends(visible ? novelist?.username : undefined);

  useEffect(() => {
    if (!visible) setSearch("");
  }, [visible]);

  const visibleFriends = useMemo(() => {
    const query = search.trim().toLowerCase();
    return friends.filter(
      (friend) =>
        !exclude?.has(friend.id) &&
        (!query ||
          `${friend.firstName} ${friend.lastName} ${friend.username}`
            .toLowerCase()
            .includes(query)),
    );
  }, [exclude, friends, search]);

  return (
    <>
      {/* The chosen faces, where they can be removed without hunting for
          them again in a list that may have scrolled a long way. */}
      {selected.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.chips}
          data={selected}
          horizontal
          // Without this the row eats the sheet. A horizontal `FlatList` is a
          // `ScrollView`, whose container grows by default, and this one sits
          // in a `flex: 1` column — so it claimed all the space the friends
          // list was meant to have and drew 28pt chips centred in it.
          style={styles.chipsBox}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={`Remove ${item.firstName}`}
              accessibilityRole="button"
              onPress={() => onToggle(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: theme.accent.tint,
                  borderColor: theme.accent.surfaceHover,
                },
              ]}
            >
              <Avatar name={item.firstName} size={20} uri={item.image} />
              <Text
                numberOfLines={1}
                style={[styles.chipLabel, { color: theme.accent.text }]}
              >
                {item.firstName}
              </Text>
              <Ionicons color={theme.accent.text} name="close" size={12} />
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
        />
      ) : null}

      <SearchField
        onChangeText={setSearch}
        placeholder="Search friends"
        value={search}
      />

      <FlatList
        contentContainerStyle={styles.list}
        data={visibleFriends}
        // Scrolling the friends puts the keyboard away, so the list can be
        // read at full height without first finding a way to close it.
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isPending ? (
            <SkeletonRows
              count={6}
              render={(index) => <FriendPickRowSkeleton index={index} />}
            />
          ) : (
            <Text style={[styles.empty, { color: theme.textGray }]}>
              {search ? "No friend by that name." : emptyText}
            </Text>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={theme.primary}
              size="small"
              style={styles.status}
            />
          ) : null
        }
        onEndReached={() => {
          // Paging while a search is on would fetch pages the filter then
          // hides, which reads as a spinner that never resolves.
          if (search) return;
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => {
          const active = selected.some((entry) => entry.id === item.id);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              onPress={() => onToggle(item)}
              style={({ pressed }) => [
                styles.friend,
                {
                  backgroundColor: active
                    ? theme.accent.tint
                    : pressed
                      ? theme.glass.fillPressed
                      : theme.material.fillTranslucent,
                  borderColor: active
                    ? theme.accent.solid
                    : theme.material.edgeTranslucent,
                },
              ]}
            >
              <Avatar
                name={item.firstName}
                size={40}
                uri={item.image}
                username={item.username}
              />
              <View style={styles.friendText}>
                <Text
                  numberOfLines={1}
                  style={[styles.friendName, { color: theme.text }]}
                >
                  {`${item.firstName} ${item.lastName}`.trim() || item.username}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.friendHandle, { color: theme.textGray }]}
                >
                  @{item.username}
                </Text>
              </View>
              <Ionicons
                color={
                  active ? theme.accent.text : theme.material.edgeTranslucent
                }
                name={active ? "checkmark-circle" : "ellipse-outline"}
                size={22}
              />
            </Pressable>
          );
        }}
        style={styles.listBox}
      />
    </>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    paddingLeft: 3,
    paddingRight: space.sm,
    paddingVertical: 3,
  },
  chipLabel: { fontSize: fontSize.caption, fontWeight: "700", maxWidth: 90 },
  chips: { alignItems: "center", gap: space.xs },
  chipsBox: { flexGrow: 0 },
  empty: {
    fontSize: fontSize.caption,
    padding: space.lg,
    textAlign: "center",
  },
  friend: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  friendHandle: { fontSize: fontSize.caption },
  friendName: { fontSize: fontSize.body, fontWeight: "600" },
  friendText: { flex: 1, gap: 1, minWidth: 0 },
  list: { gap: space.xs, paddingBottom: space.md },
  listBox: { flex: 1 },
  status: { padding: space.md },
});
