import { pluralize } from "@nw/utils";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import type { ReactionGroup } from "@/components/chat/reactions";
import { BottomSheet } from "@/components/sheet";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Who reacted, and with what.
 *
 * A count on a chip says how many; in a group thread the useful question is
 * *which* of them, and there is nowhere on a phone to hover for the answer. A
 * tap on a chip opens this.
 *
 * It is also where a reaction is taken back: the group holding yours says so
 * and removes it on a tap, which is why the chip itself only opens the list.
 *
 * Grouped by emoji rather than listed as one flat roll of names, because the
 * chips are grouped that way and the sheet should be the chip expanded rather
 * than a different view of the same data.
 */
export const ReactorsSheet = ({
  groups,
  onClose,
  onRemove,
}: {
  /** Null closes the sheet. */
  groups: ReactionGroup[] | null;
  onClose: () => void;
  /** Takes your reaction back. Omitted, your group is a label and no more. */
  onRemove?: (group: ReactionGroup) => void;
}) => {
  const theme = useAppTheme();
  const total = groups?.reduce((sum, group) => sum + group.count, 0) ?? 0;

  return (
    <BottomSheet
      maxHeightRatio={0.55}
      onClose={onClose}
      subtitle={total ? `${total} ${pluralize("reaction", total)}` : undefined}
      title="Reactions"
      visible={groups !== null}
    >
      <ScrollView contentContainerStyle={styles.body}>
        {groups?.map((group) => (
          <Pressable
            accessibilityHint={
              group.mine && onRemove ? "Removes your reaction" : undefined
            }
            accessibilityRole={group.mine && onRemove ? "button" : undefined}
            // Only your own group does anything; the rest are a list.
            disabled={!group.mine || !onRemove}
            key={group.key}
            onPress={() => onRemove?.(group)}
            style={({ pressed }) => [
              styles.group,
              {
                backgroundColor: theme.material.fillTranslucent,
                borderColor: group.mine
                  ? theme.accent.solid
                  : theme.material.edgeTranslucent,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.glyphColumn}>
              <Text style={styles.glyph}>{group.glyph}</Text>
              <Text style={[styles.glyphLabel, { color: theme.textGray }]}>
                {group.label}
              </Text>
            </View>
            <View style={styles.names}>
              {group.names.map((name, index) => (
                <Text
                  // Two people can share a display name, so the index is part
                  // of the key — a duplicate name would otherwise drop a row.
                  key={`${name}-${index}`}
                  numberOfLines={1}
                  style={[styles.name, { color: theme.text }]}
                >
                  {name}
                </Text>
              ))}
            </View>
            {group.mine ? (
              <Text style={[styles.you, { color: theme.accent.text }]}>
                {onRemove ? "Tap to remove" : "You"}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.sm, paddingBottom: space.md, paddingHorizontal: space.md },
  glyph: { fontSize: fontSize.h2 },
  // The name under the emoji, because the two clients draw these differently
  // and "Haha" is the part both of them agree on.
  glyphColumn: { alignItems: "center", minWidth: 44 },
  glyphLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  group: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  names: { flex: 1, gap: space.xxs },
  you: { fontSize: fontSize.caption, fontWeight: "700" },
});
