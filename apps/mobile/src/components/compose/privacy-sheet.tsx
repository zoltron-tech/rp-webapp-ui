import { Ionicons } from "@expo/vector-icons";
import type { Friend, PrivacyLevel } from "@nw/types";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import {
  PRIVACY_ICON,
  PRIVACY_LABEL,
  PRIVACY_OPTIONS,
} from "@/components/feed/privacy";
import { BottomSheet } from "@/components/sheet";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { IconButton } from "@/components/icon-button";

/**
 * Who can see the post — web's `PromptPrivacySelect` and the "Share with"
 * friend picker it opens for *Custom*, as one sheet in two steps.
 *
 * Web's select is a Radix dropdown and the friend list a centred dialog on
 * top of it. On a phone both are the same sheet: pick a level, and picking
 * *Custom* slides the list of friends into the same tray with a Done button
 * in the header — the tray header pattern, rather than a footer that costs a
 * row of faces on a 667pt screen.
 *
 * Choosing Custom with nobody ticked falls back to *Only me*, which is what
 * web does when the dialog is cleared (`SELECTION_CLEARED` → `ONLY_ME`): a
 * post shared with a list of nobody is a post shared with nobody.
 */
export const PrivacySheet = ({
  friends,
  onChange,
  onClose,
  selected,
  value,
  visible,
}: {
  /** The novelist's friends, for the Custom list. */
  friends: Friend[];
  onChange: (privacy: PrivacyLevel, sharedWith: Friend[]) => void;
  onClose: () => void;
  /** Currently shared-with friends, when `value` is Custom. */
  selected: Friend[];
  value: PrivacyLevel;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [choosing, setChoosing] = useState(false);
  const [picked, setPicked] = useState<Friend[]>(selected);

  const finishCustom = () => {
    setChoosing(false);
    if (picked.length === 0) onChange("ONLY_ME", []);
    else onChange("CUSTOM", picked);
    onClose();
  };

  const toggle = (friend: Friend) =>
    setPicked((current) =>
      current.some((entry) => entry.id === friend.id)
        ? current.filter((entry) => entry.id !== friend.id)
        : [...current, friend],
    );

  return (
    <BottomSheet
      fill={choosing}
      headerAction={
        choosing ? (
          <IconButton
            accessibilityLabel="Done"
            hitSlop={space.sm}
            icon="checkmark"
            onPress={finishCustom}
            tone="primary"
          />
        ) : undefined
      }
      maxHeightRatio={choosing ? 0.75 : 0.6}
      onClose={() => {
        setChoosing(false);
        onClose();
      }}
      subtitle={choosing ? `${picked.length} chosen` : "Who can see this post"}
      title={choosing ? "Share with" : "Privacy"}
      visible={visible}
    >
      {choosing ? (
        <ScrollView contentContainerStyle={styles.body}>
          {friends.length === 0 ? (
            <Text style={[styles.hint, { color: theme.textGray }]}>
              You have no friends to share with yet.
            </Text>
          ) : null}
          {friends.map((friend) => {
            const on = picked.some((entry) => entry.id === friend.id);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                key={friend.id}
                onPress={() => toggle(friend)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: on
                      ? theme.accent.tint
                      : pressed
                        ? theme.glass.fillPressed
                        : theme.material.fillTranslucent,
                    borderColor: on
                      ? theme.accent.solid
                      : theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Avatar
                  name={friend.firstName}
                  size={36}
                  image={friend.avatar}
                  uri={friend.avatar?.src ?? friend.image}
                />
                <View style={styles.rowText}>
                  <Text
                    numberOfLines={1}
                    style={[styles.name, { color: theme.text }]}
                  >
                    {`${friend.firstName} ${friend.lastName ?? ""}`.trim()}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.hint, { color: theme.textGray }]}
                  >
                    @{friend.username}
                  </Text>
                </View>
                <Ionicons
                  color={on ? theme.accent.text : theme.material.edgeTranslucent}
                  name={on ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.body}>
          {PRIVACY_OPTIONS.map((option) => {
            const on = option.value === value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                key={option.value}
                onPress={() => {
                  if (option.value === "CUSTOM") {
                    setPicked(selected);
                    setChoosing(true);
                    return;
                  }
                  onChange(option.value, []);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: on
                      ? theme.accent.tint
                      : pressed
                        ? theme.glass.fillPressed
                        : theme.material.fillTranslucent,
                    borderColor: on
                      ? theme.accent.solid
                      : theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Ionicons
                  color={on ? theme.accent.text : theme.textGray}
                  name={PRIVACY_ICON[option.value]}
                  size={20}
                />
                <View style={styles.rowText}>
                  <Text
                    style={[
                      styles.name,
                      { color: on ? theme.accent.text : theme.text },
                    ]}
                  >
                    {PRIVACY_LABEL[option.value]}
                  </Text>
                  <Text style={[styles.hint, { color: theme.textGray }]}>
                    {option.hint}
                  </Text>
                </View>
                {on ? (
                  <Ionicons
                    color={theme.accent.text}
                    name="checkmark"
                    size={18}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  hint: { fontSize: fontSize.caption },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.ms,
    minHeight: 52,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  rowText: { flex: 1, gap: 1 },
});
