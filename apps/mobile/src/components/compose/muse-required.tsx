import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { useQuickAddMuse } from "@/hooks/use-quick-add-muse";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `IcMuseRequiredForm`: the composer, replaced, when an in-character
 * post has nobody to come from.
 *
 * A reply to an in-character prompt has to be in character, and a novelist
 * with no characters cannot write one. Rather than a disabled editor, the
 * space becomes the shortest possible "make one": a name, a button, and the
 * composer takes over the moment the character exists. The avatar and last
 * name web also asks for are left to the character's own page — one field is
 * what turns a dead end back into a reply.
 */
export const MuseRequired = ({
  onCreated,
}: {
  onCreated: (muse: Muse) => void;
}) => {
  const theme = useAppTheme();
  const [name, setName] = useState("");
  const quickAdd = useQuickAddMuse();
  const canCreate = Boolean(name.trim()) && !quickAdd.isPending;

  const create = () => {
    if (!canCreate) return;
    quickAdd.mutate(name, { onSuccess: onCreated });
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.material.fill,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <View style={styles.header}>
          <Ionicons
            color={theme.accent.text}
            name="sparkles-outline"
            size={22}
          />
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>
              Create a character to post in character
            </Text>
            <Text style={[styles.desc, { color: theme.textGray }]}>
              In-character posts and replies come from one of your characters —
              you don't have one yet. Create one now to continue.
            </Text>
          </View>
        </View>

        <TextInput
          autoFocus
          maxLength={40}
          onChangeText={setName}
          onSubmitEditing={create}
          placeholder="Character's first name"
          placeholderTextColor={theme.textGray}
          returnKeyType="done"
          style={[
            styles.input,
            {
              backgroundColor: theme.glass.field,
              borderColor: theme.material.edge,
              color: theme.text,
            },
          ]}
          value={name}
        />

        {quickAdd.error ? (
          <Text style={[styles.error, { color: theme.error }]}>
            {quickAdd.error.message}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canCreate}
          onPress={create}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: canCreate
                ? pressed
                  ? theme.accent.fillPressed
                  : theme.accent.fill
                : theme.accent.fillDisabled,
            },
          ]}
        >
          {quickAdd.isPending ? (
            <ActivityIndicator
              color={theme.accent.onFillDisabled}
              size="small"
            />
          ) : (
            <Text
              style={[
                styles.buttonLabel,
                {
                  color: canCreate
                    ? theme.accent.onFill
                    : theme.accent.onFillDisabled,
                },
              ]}
            >
              Create character & continue
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minHeight: 44,
  },
  buttonLabel: { color: "#ffffff", fontSize: fontSize.body, fontWeight: "700" },
  card: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.md,
    padding: space.md,
  },
  desc: { fontSize: fontSize.caption, lineHeight: 17 },
  error: { fontSize: fontSize.caption },
  header: { flexDirection: "row", gap: space.ms },
  headerText: { flex: 1, gap: space.xxs },
  input: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    fontSize: fontSize.body,
    paddingHorizontal: space.ms,
    paddingVertical: space.sm,
  },
  root: { padding: space.md },
  title: { fontSize: fontSize.body, fontWeight: "700" },
});
