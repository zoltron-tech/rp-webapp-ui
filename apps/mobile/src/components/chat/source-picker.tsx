import { Ionicons } from "@expo/vector-icons";
import type { PromptSource } from "@nw/types";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { radius, space, useAppTheme } from "@/theme";

/**
 * "Who is this from?" — a row of faces.
 *
 * Both ice-breaker sheets need it and they need it identically: writing one
 * asks who is speaking, and answering one asks the same question again. Web
 * duplicates the markup across its two dialogs, with scroll arrows either side
 * because a mouse has no other way along a horizontal strip. A thumb does, so
 * the arrows are gone and the strip is simply scrollable.
 *
 * Faces rather than a list of names, and horizontal rather than vertical: a
 * novelist with a dozen muses picks by portrait long before they read a name,
 * and a vertical list of twelve would be the whole sheet.
 *
 * ## You are not one of your muses
 *
 * The sources arrive as one flat list with the novelist first, which drew as a
 * single undifferentiated strip of faces — so posting as yourself and posting
 * as a character you wrote looked like the same kind of choice, and the only
 * thing marking the difference was that your own face happened to be leftmost.
 * A caption over each group and a hairline between them is the least that can
 * be done about it: no extra height beyond the captions, no second control,
 * and the strip still scrolls as one.
 *
 * The captions and the rule appear only when there is something to separate. A
 * novelist with no muses would otherwise get a "You" heading over a single face
 * and a divider with nothing on the far side of it.
 */
export const SourcePicker = ({
  label,
  onAddMuse,
  onSelect,
  selected,
  sources,
}: {
  label: string;
  /**
   * Opens the "write a character" field.
   *
   * Offered only when there are no muses to pick, which is web's rule too: the
   * shortcut exists so an empty picker is not a dead end, not as a second way
   * to reach the muse screen.
   */
  onAddMuse?: () => void;
  onSelect: (source: PromptSource) => void;
  selected: PromptSource | undefined;
  sources: PromptSource[];
}) => {
  const theme = useAppTheme();

  if (sources.length === 0) return null;

  const mine = sources.filter((entry) => entry.sourceType === "NOVELIST");
  const muses = sources.filter((entry) => entry.sourceType !== "NOVELIST");
  const canAddMuse = muses.length === 0 && Boolean(onAddMuse);
  const grouped = mine.length > 0 && (muses.length > 0 || canAddMuse);

  const face = (item: PromptSource) => {
    const active = item.sourceId === selected?.sourceId;

    return (
      <Pressable
        accessibilityLabel={item.name}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        key={item.sourceId}
        onPress={() => onSelect(item)}
        style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}
      >
        <View
          style={[
            styles.ring,
            { borderColor: active ? theme.accent.solid : "transparent" },
          ]}
        >
          <Avatar name={item.name} size={44} uri={item.image} />
          {active ? (
            <View
              style={[
                styles.check,
                {
                  backgroundColor: theme.accent.solid,
                  borderColor: theme.glass.opaque,
                },
              ]}
            >
              <Ionicons color="#ffffff" name="checkmark" size={10} />
            </View>
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: active ? theme.accent.text : theme.textGray,
              fontWeight: active ? "700" : "600",
            },
          ]}
        >
          {item.name.split(" ")[0]}
        </Text>
      </Pressable>
    );
  };

  const group = (caption: string, children: ReactNode) => (
    <View style={styles.group}>
      {grouped ? (
        <Text style={[styles.caption, { color: theme.textGray }]}>
          {caption}
        </Text>
      ) : null}
      <View style={styles.groupRow}>{children}</View>
    </View>
  );

  const addMuseTile = (
    <Pressable
      accessibilityHint="Creates a character you can post as"
      accessibilityLabel="New character"
      accessibilityRole="button"
      onPress={onAddMuse}
      style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View
        style={[
          styles.ring,
          styles.addRing,
          { borderColor: theme.accent.surfaceHover },
        ]}
      >
        <Ionicons color={theme.accent.text} name="add" size={20} />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.name, { color: theme.accent.text, fontWeight: "600" }]}
      >
        New
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: theme.textGray }]}>{label}</Text>

      <ScrollView
        contentContainerStyle={styles.row}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        // A horizontal scroller's container grows: without this it takes every
        // spare point of a `flex: 1` sheet.
        style={styles.list}
      >
        {mine.length > 0 ? group("You", mine.map(face)) : null}

        {grouped ? (
          <View
            style={[styles.divider, { backgroundColor: theme.glass.edge }]}
          />
        ) : null}

        {muses.length > 0
          ? group(
              muses.length > 1 ? `Characters · ${muses.length}` : "Character",
              muses.map(face),
            )
          : null}

        {canAddMuse ? group("Characters", addMuseTile) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  addRing: {
    alignItems: "center",
    borderStyle: "dashed",
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  caption: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    paddingLeft: space.xs,
    textTransform: "uppercase",
  },
  check: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: -2,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 18,
  },
  divider: {
    alignSelf: "stretch",
    marginHorizontal: space.sm,
    // Short of the full height, so it reads as a separator between two groups
    // rather than a border around one of them.
    marginVertical: space.xs,
    width: StyleSheet.hairlineWidth,
  },
  group: { gap: space.xs },
  groupRow: { flexDirection: "row", gap: space.xs },
  item: { alignItems: "center", gap: space.xs, width: 60 },
  label: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  list: { flexGrow: 0 },
  name: { fontSize: 10, maxWidth: 58, textAlign: "center" },
  ring: { borderRadius: radius.full, borderWidth: 2, padding: 2 },
  row: { paddingVertical: 2 },
  section: { gap: space.xs },
});
