import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import type { MuseEdit } from "@/hooks/use-muse-edit";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's nickname pills, editable: tap one to rename it, the × to remove it,
 * and the field at the foot to add another. Five at most, as on web.
 *
 * One tray for all three operations rather than a pill that turns into an
 * input in place — a 72pt-wide inline field between other pills is a target
 * nobody can hit with a thumb.
 */
export const MAX_NICKNAMES = 5;

export const NicknameSheet = ({
  edit,
  nicknames,
  onClose,
  visible,
}: {
  edit: MuseEdit;
  nicknames: string[];
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [draft, setDraft] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft("");
      setRenaming(null);
      setError(null);
    }
  }, [visible]);

  const canAdd = nicknames.length < MAX_NICKNAMES;

  const submit = async () => {
    const value = draft.trim();
    if (!value || busy) return;
    if (renaming === null && !canAdd) return;
    if (nicknames.includes(value) && renaming !== value) {
      setError("That nickname is already on the list.");
      return;
    }
    setBusy(renaming ?? "__add__");
    setError(null);
    const ok = renaming
      ? await edit.editNickname(renaming, value)
      : await edit.addNickname(value);
    setBusy(null);
    if (!ok) {
      setError("Could not save that nickname. Try again.");
      return;
    }
    setDraft("");
    setRenaming(null);
  };

  const remove = async (nickname: string) => {
    if (busy) return;
    setBusy(nickname);
    setError(null);
    const ok = await edit.removeNickname(nickname);
    setBusy(null);
    if (!ok) setError("Could not remove that nickname. Try again.");
  };

  return (
    <FormSheet
      error={error}
      onClose={onClose}
      subtitle={`${nicknames.length} / ${MAX_NICKNAMES}`}
      title="Nicknames"
      visible={visible}
    >
      {nicknames.length > 0 ? (
        <View style={styles.pills}>
          {nicknames.map((nickname) => {
            const active = renaming === nickname;
            return (
              <View
                key={nickname}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active
                      ? theme.accent.surface
                      : theme.material.fillTranslucent,
                    borderColor: active
                      ? theme.accent.solid
                      : theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Pressable
                  accessibilityHint="Rename"
                  accessibilityRole="button"
                  disabled={busy !== null}
                  onPress={() => {
                    setRenaming(nickname);
                    setDraft(nickname);
                  }}
                  style={styles.pillLabelWrap}
                >
                  <Text style={[styles.pillLabel, { color: theme.text }]}>
                    {nickname}
                  </Text>
                </Pressable>
                {busy === nickname ? (
                  <ActivityIndicator color={theme.textGray} size="small" />
                ) : (
                  <Pressable
                    accessibilityLabel={`Remove ${nickname}`}
                    accessibilityRole="button"
                    disabled={busy !== null}
                    hitSlop={space.xs}
                    onPress={() => void remove(nickname)}
                  >
                    <Ionicons color={theme.textGray} name="close" size={15} />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.empty, { color: theme.textGray }]}>
          No nicknames yet.
        </Text>
      )}

      <View style={styles.row}>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          editable={busy === null && (canAdd || renaming !== null)}
          maxLength={30}
          onChangeText={setDraft}
          onSubmitEditing={() => void submit()}
          placeholder={
            renaming
              ? `Rename “${renaming}”`
              : canAdd
                ? "Add a nickname"
                : "Five is the most a character can carry"
          }
          placeholderTextColor={theme.textGray}
          returnKeyType="done"
          style={[
            styles.input,
            { backgroundColor: theme.glass.field, color: theme.text },
          ]}
          value={draft}
        />
        {renaming ? (
          <Pressable
            accessibilityLabel="Cancel rename"
            accessibilityRole="button"
            hitSlop={space.xs}
            onPress={() => {
              setRenaming(null);
              setDraft("");
            }}
            style={[styles.action, { backgroundColor: theme.material.fillTranslucent }]}
          >
            <Ionicons color={theme.text} name="close" size={18} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel={renaming ? "Save nickname" : "Add nickname"}
          accessibilityRole="button"
          disabled={!draft.trim() || busy !== null || (!canAdd && !renaming)}
          onPress={() => void submit()}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: pressed
                ? theme.accent.solidHover
                : theme.accent.solid,
              opacity: !draft.trim() || (!canAdd && !renaming) ? 0.5 : 1,
            },
          ]}
        >
          {busy === "__add__" || (renaming && busy === renaming) ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons
              color="#ffffff"
              name={renaming ? "checkmark" : "add"}
              size={18}
            />
          )}
        </Pressable>
      </View>
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  empty: { fontSize: fontSize.label, fontStyle: "italic" },
  input: {
    borderRadius: radius.md,
    flex: 1,
    fontSize: fontSize.body,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  pill: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    paddingLeft: space.sm + 4,
    paddingRight: space.sm,
    paddingVertical: 6,
  },
  pillLabel: { fontSize: fontSize.label, fontStyle: "italic" },
  pillLabelWrap: { flexShrink: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  row: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
