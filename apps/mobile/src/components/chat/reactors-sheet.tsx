import { pluralize } from "@nw/utils";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { ReactionGroup } from "@/components/chat/reactions";
import { BottomSheet } from "@/components/sheet";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Who reacted, and with what.
 *
 * A count on a chip says how many; in a group thread the useful question is
 * *which* of them, and there is nowhere on a phone to hover for the answer. A
 * long press on a chip opens this.
 *
 * Grouped by emoji rather than listed as one flat roll of names, because the
 * chips are grouped that way and the sheet should be the chip expanded rather
 * than a different view of the same data.
 */
export const ReactorsSheet = ({
  groups,
  onClose,
}: {
  /** Null closes the sheet. */
  groups: ReactionGroup[] | null;
  onClose: () => void;
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
          <View
            key={group.key}
            style={[
              styles.group,
              {
                backgroundColor: theme.material.fillTranslucent,
                borderColor: group.mine
                  ? theme.accent.solid
                  : theme.material.edgeTranslucent,
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
                You
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.sm, paddingBottom: space.md, paddingHorizontal: space.md },
  glyph: { fontSize: 22 },
  // The name under the emoji, because the two clients draw these differently
  // and "Haha" is the part both of them agree on.
  glyphColumn: { alignItems: "center", minWidth: 44 },
  glyphLabel: { fontSize: 9, fontWeight: "700" },
  group: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  names: { flex: 1, gap: 2 },
  you: { fontSize: fontSize.caption, fontWeight: "700" },
});
