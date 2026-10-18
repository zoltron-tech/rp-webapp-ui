import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import type { SpellStripState } from "@/lib/spell/use-spell-target";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The suggestion strip — web's correction menu, as a phone draws it.
 *
 * A row between the field and the keyboard, where the platform's own
 * autocomplete lives and where a thumb already is (the mention list's
 * reasoning; see `editor/mention-list.tsx`). For a misspelled word: the word,
 * its corrections as chips, then Add and Ignore. For a selected correct word:
 * its synonyms. One tap replaces the word; the field keeps the keyboard.
 *
 * Fixed height, so it never shifts the field when its contents change —
 * the lesson from web's first popover.
 */
export const SpellStrip = ({
  loading,
  onAdd,
  onIgnore,
  onPick,
  suggestions,
  target,
}: SpellStripState & {
  onPick: (word: string) => void;
  onAdd: () => void;
  onIgnore: () => void;
}) => {
  const theme = useAppTheme();
  if (!target) return null;
  const spelling = target.mode === "spelling";

  return (
    <View
      accessibilityRole="toolbar"
      style={[
        styles.root,
        { backgroundColor: theme.glass.opaque, borderColor: theme.glass.edge },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.row}
        horizontal
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            spelling
              ? {
                  backgroundColor: `${theme.error}26`,
                  color: theme.textGray,
                  textDecorationColor: theme.error,
                  textDecorationLine: "underline",
                }
              : { color: theme.textGray },
          ]}
        >
          {spelling ? target.word : "Synonyms"}
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.textGray} size="small" />
        ) : suggestions.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textGray }]}>
            {spelling ? "No suggestions" : "No synonyms"}
          </Text>
        ) : (
          suggestions.map((word) => (
            <Pressable
              accessibilityRole="button"
              key={word}
              onPress={() => onPick(word)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: pressed
                    ? theme.accent.tint
                    : theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: theme.text }]}>
                {word}
              </Text>
            </Pressable>
          ))
        )}

        {spelling ? (
          <>
            <View
              style={[styles.rule, { backgroundColor: theme.glass.edge }]}
            />
            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              onPress={onAdd}
              style={styles.action}
            >
              <Text style={[styles.actionText, { color: theme.accent.text }]}>
                Add to dictionary
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              onPress={onIgnore}
              style={styles.action}
            >
              <Text style={[styles.actionText, { color: theme.textGray }]}>
                Ignore
              </Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const STRIP_HEIGHT = 44;

const styles = StyleSheet.create({
  action: { justifyContent: "center", paddingHorizontal: space.xs },
  actionText: { fontSize: fontSize.label, fontWeight: "600" },
  chip: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: space.sm,
    paddingVertical: 5,
  },
  chipText: { fontSize: fontSize.label, fontWeight: "500" },
  empty: { alignSelf: "center", fontSize: fontSize.label },
  label: {
    alignSelf: "center",
    fontSize: fontSize.caption,
    marginRight: space.xs,
    maxWidth: 120,
  },
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: STRIP_HEIGHT,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.sm,
  },
  rule: { height: 18, marginHorizontal: space.xs, width: 1 },
});
