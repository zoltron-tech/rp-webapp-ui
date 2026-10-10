import { Ionicons } from "@expo/vector-icons";
import { useNovelistFriends, useSession } from "@nw/features";
import type { Conversation, Friend } from "@nw/types";
import { pluralize } from "@nw/utils";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  type TextInput as NativeTextInput,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import { IconButton } from "@/components/icon-button";
import { SkeletonRows } from "@/components/list-skeletons";
import { SearchField } from "@/components/search-field";
import { BottomSheet } from "@/components/sheet";
import { FriendPickRowSkeleton } from "@/components/sheet-skeletons";
import { Text, TextInput } from "@/components/text";
import { useCreateGroup } from "@/hooks/use-inbox-actions";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

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
  /*
   * What stopped the create, said under the field it is about.
   *
   * The first version only disabled the tick while the name was empty, and a
   * disabled button explains nothing: people picked their friends, tapped
   * the dimmed tick, and could not tell what the form still wanted. The tick
   * is live now; a press on an incomplete form names the missing part and
   * puts the cursor in the field when it is the name.
   */
  const [problem, setProblem] = useState<"name" | "friends" | null>(null);
  const nameField = useRef<NativeTextInput>(null);

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
    setProblem((current) => (current === "friends" ? null : current));
  }, []);

  const changeName = useCallback((next: string) => {
    setName(next);
    setProblem((current) => (current === "name" ? null : current));
  }, []);

  const reset = useCallback(() => {
    setName("");
    setSearch("");
    setSelected([]);
    setProblem(null);
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submit = async () => {
    const trimmed = name.trim();
    if (atLimit || createGroup.isPending) return;
    if (!trimmed) {
      setProblem("name");
      nameField.current?.focus();
      return;
    }
    if (selected.length === 0) {
      setProblem("friends");
      return;
    }

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

  // Only the two things a press cannot fix dim the tick: the tier limit, and
  // a create already in flight. An empty name or no friends gets a message.
  const canCreate = !atLimit && !createGroup.isPending;

  return (
    <BottomSheet
      fill
      // The headline action lives in the header, not a footer button: a footer
      // costs a row of the list on a 667pt screen, and `AGENTS.md` calls for
      // the compact header instead.
      headerAction={
        // Cancel beside confirm, as the other form trays have it: the header
        // action replaces the sheet's own close button, and a form whose only
        // button is "create" has no obvious way out.
        <View style={styles.actions}>
          <IconButton
            accessibilityLabel="Cancel"
            disabled={createGroup.isPending}
            hitSlop={space.xs}
            icon="close"
            onPress={close}
            tone="glass"
          />
          <IconButton
            accessibilityLabel="Create group"
            busy={createGroup.isPending}
            disabled={!canCreate}
            hitSlop={space.xs}
            icon="checkmark"
            onPress={() => void submit()}
            tone="primary"
          />
        </View>
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
          accessibilityLabel="Group name, required"
          maxLength={60}
          onChangeText={changeName}
          placeholder="Group name"
          placeholderTextColor={theme.textGray}
          ref={nameField}
          // A Done key that puts the keyboard down; iOS offers no other.
          returnKeyType="done"
          style={[
            styles.field,
            {
              backgroundColor: theme.glass.field,
              borderColor:
                problem === "name"
                  ? theme.error
                  : name.trim()
                    ? theme.accent.solid
                    : theme.material.edgeTranslucent,
              color: theme.text,
            },
          ]}
          value={name}
        />

        {problem ? (
          <View accessibilityLiveRegion="polite" style={styles.problem}>
            <Ionicons color={theme.error} name="alert-circle" size={14} />
            <Text style={[styles.problemLabel, { color: theme.error }]}>
              {problem === "name"
                ? "Give the group a name before creating it."
                : "Choose at least one friend to start the group with."}
            </Text>
          </View>
        ) : null}

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
  actions: { alignItems: "center", flexDirection: "row", gap: space.sm },
  body: { flex: 1, gap: space.sm, paddingHorizontal: space.md },
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
  field: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    fontSize: fontSize.body,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
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
  problem: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    marginTop: -space.xs,
    paddingHorizontal: space.xs,
  },
  problemLabel: { flex: 1, fontSize: fontSize.caption, fontWeight: "600" },
  status: { padding: space.md },
  warning: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  warningLabel: { flex: 1, fontSize: fontSize.caption, fontWeight: "600" },
});
