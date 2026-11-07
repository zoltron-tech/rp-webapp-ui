import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { Conversation, Friend } from "@nw/types";
import { pluralize } from "@nw/utils";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  type TextInput as NativeTextInput,
  StyleSheet,
  View,
} from "react-native";
import { FriendPicker } from "@/components/chat/friend-picker";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text, TextInput } from "@/components/text";
import { useCreateGroup } from "@/hooks/use-inbox-actions";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Creating a group.
 *
 * The same three inputs as web's dialog — a name, the people, and the group
 * limit — as a tray, per `AGENTS.md`. What differs is only what the
 * form factor forces.
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

  const groupLimit = novelist?.tier?.groupLimit ?? 0;
  const atLimit = groupCount !== null && groupCount >= groupLimit;

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
              You have reached your limit of {groupLimit} groups.
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

        <FriendPicker
          emptyText="Add a friend and you can start a group with them."
          onToggle={toggle}
          selected={selected}
          visible={visible}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", gap: space.sm },
  body: { flex: 1, gap: space.sm, paddingHorizontal: space.md },
  field: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    fontSize: fontSize.body,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  problem: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    marginTop: -space.xs,
    paddingHorizontal: space.xs,
  },
  problemLabel: { flex: 1, fontSize: fontSize.caption, fontWeight: "600" },
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
