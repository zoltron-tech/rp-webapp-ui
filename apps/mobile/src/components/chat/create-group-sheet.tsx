import { Ionicons } from "@expo/vector-icons";
import { useNovelistFriends, useSession } from "@nw/features";
import type { Conversation, Friend } from "@nw/types";
import { pluralize } from "@nw/utils";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import { SkeletonRows } from "@/components/list-skeletons";
import { BottomSheet } from "@/components/sheet";
import { FriendPickRowSkeleton } from "@/components/sheet-skeletons";
import { useCreateGroup } from "@/hooks/use-inbox-actions";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Creating a group.
 *
 * The same three inputs as web's dialog — a name, the people, and the limit
 * your tier allows — as a tray, per `AGENTS.md`. What differs is only what the
 * form factor forces.
 *
 * ## Chips, not a dropdown
 *
 * Web picks participants through a dropdown that holds its selection out of
 * sight. On a phone that is two surfaces stacked on one screen, and the second
 * one hides the first. Here the friends are the list, tapping toggles, and the
 * chosen faces ride along the top in a row you can scroll — so "who is in this
 * group" is answered without leaving the list you are choosing from.
 *
 * ## The limit is shown before it is hit
 *
 * Web checks the count on the button press and refuses with a toast. The number
 * is worth more than the refusal: a person one group from their limit should
 * see that while deciding, not after. The count sits under the title and turns
 * red as it runs out, and the create is blocked with the same message web uses.
 */

export const CreateGroupSheet = ({
  groupCount,
  onClose,
  onCreated,
  visible,
}: {
  /** How many groups the novelist is already in. Null while it is unknown. */
  groupCount: number | null;
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const { novelist } = useSession();
  const createGroup = useCreateGroup();

  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Friend[]>([]);

  const { fetchNextPage, friends, hasNextPage, isFetchingNextPage, isPending } =
    useNovelistFriends(visible ? novelist?.username : undefined);

  const groupLimit = novelist?.tier?.groupLimit ?? 0;
  const atLimit = groupCount !== null && groupCount >= groupLimit;

  const visibleFriends = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return friends;
    return friends.filter((friend) =>
      `${friend.firstName} ${friend.lastName} ${friend.username}`
        .toLowerCase()
        .includes(query),
    );
  }, [friends, search]);

  const toggle = useCallback((friend: Friend) => {
    setSelected((previous) =>
      previous.some((entry) => entry.id === friend.id)
        ? previous.filter((entry) => entry.id !== friend.id)
        : [...previous, friend],
    );
  }, []);

  const reset = useCallback(() => {
    setName("");
    setSearch("");
    setSelected([]);
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || selected.length === 0 || atLimit) return;

    try {
      const conversation = await createGroup.mutateAsync({
        name: trimmed,
        participantIds: selected.map((friend) => friend.id),
      });
      reset();
      onClose();
      onCreated(conversation);
    } catch {
      Alert.alert("Not created", "The group could not be created. Try again.");
    }
  };

  const canCreate =
    Boolean(name.trim()) &&
    selected.length > 0 &&
    !atLimit &&
    !createGroup.isPending;

  return (
    <BottomSheet
      fill
      // The headline action lives in the header, not a footer button: a footer
      // costs a row of the list on a 667pt screen, and `AGENTS.md` calls for
      // the compact header instead.
      headerAction={
        <Pressable
          accessibilityLabel="Create group"
          accessibilityRole="button"
          disabled={!canCreate}
          hitSlop={space.sm}
          onPress={() => void submit()}
          style={({ pressed }) => [
            styles.confirm,
            {
              backgroundColor: canCreate
                ? theme.accent.solid
                : theme.accent.surfaceActive,
              opacity: pressed && canCreate ? 0.8 : 1,
            },
          ]}
        >
          {createGroup.isPending ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons color="#ffffff" name="checkmark" size={18} />
          )}
        </Pressable>
      }
      maxHeightRatio={0.88}
      onClose={close}
      subtitle={
        groupCount === null
          ? undefined
          : `${groupCount} of ${groupLimit} ${pluralize("group", groupLimit)} used`
      }
      title="New group"
      visible={visible}
    >
      <View style={styles.body}>
        {atLimit ? (
          <View
            style={[
              styles.warning,
              {
                backgroundColor: theme.material.fillTranslucent,
                borderColor: theme.error,
              },
            ]}
          >
            <Ionicons color={theme.error} name="alert-circle" size={14} />
            <Text style={[styles.warningLabel, { color: theme.error }]}>
              You have reached your limit of {groupLimit}. Upgrade your tier to
              create more.
            </Text>
          </View>
        ) : null}

        <TextInput
          maxLength={60}
          onChangeText={setName}
          placeholder="Group name"
          placeholderTextColor={theme.textGray}
          style={[
            styles.field,
            {
              backgroundColor: theme.glass.field,
              borderColor: name.trim()
                ? theme.accent.solid
                : theme.material.edgeTranslucent,
              color: theme.text,
            },
          ]}
          value={name}
        />

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
                onPress={() => toggle(item)}
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

        <View
          style={[
            styles.search,
            {
              backgroundColor: theme.glass.field,
              borderColor: theme.material.edgeTranslucent,
            },
          ]}
        >
          <Ionicons color={theme.textGray} name="search" size={16} />
          <TextInput
            autoCorrect={false}
            onChangeText={setSearch}
            placeholder="Search friends"
            placeholderTextColor={theme.textGray}
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
          />
        </View>

        <FlatList
          contentContainerStyle={styles.list}
          data={visibleFriends}
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
                {search
                  ? "No friend by that name."
                  : "Add a friend and you can start a group with them."}
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
                onPress={() => toggle(item)}
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
                    {`${item.firstName} ${item.lastName}`.trim() ||
                      item.username}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.friendHandle, { color: theme.textGray }]}
                  >
                    @{item.username}
                  </Text>
                </View>
                <Ionicons
                  color={active ? theme.accent.text : theme.material.edgeTranslucent}
                  name={active ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                />
              </Pressable>
            );
          }}
          style={styles.listBox}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, gap: space.sm, paddingHorizontal: space.md },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.xs,
    paddingLeft: 3,
    paddingRight: space.sm,
    paddingVertical: 3,
  },
  chipLabel: { fontSize: fontSize.caption, fontWeight: "700", maxWidth: 90 },
  chips: { alignItems: "center", gap: space.xs },
  chipsBox: { flexGrow: 0 },
  confirm: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  empty: {
    fontSize: fontSize.caption,
    padding: space.lg,
    textAlign: "center",
  },
  field: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: fontSize.body,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  friend: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  friendHandle: { fontSize: fontSize.caption },
  friendName: { fontSize: fontSize.body, fontWeight: "600" },
  friendText: { flex: 1, gap: 1, minWidth: 0 },
  list: { gap: space.xs, paddingBottom: space.md },
  listBox: { flex: 1 },
  search: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontSize: fontSize.body, paddingVertical: space.sm },
  status: { padding: space.md },
  warning: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  warningLabel: { flex: 1, fontSize: fontSize.caption, fontWeight: "600" },
});
