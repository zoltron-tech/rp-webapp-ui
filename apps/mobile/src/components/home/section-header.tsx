import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { fontSize, space, type, useAppTheme } from "@/theme";

/**
 * Web's `SubText`: the small uppercase eyebrow over each block of the home
 * page, with room on the right for one link — "See all", where a rail is a
 * window onto a longer list somewhere else.
 */
export const SectionHeader = ({
  action,
  title,
}: {
  action?: { label: string; onPress: () => void };
  title: string;
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.textGray }]}>{title}</Text>
      {/* Web's `SubText::after`: a rule that runs out the rest of the row. */}
      <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />
      {action ? (
        <Pressable
          accessibilityRole="link"
          hitSlop={space.xs}
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.action,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.actionLabel, { color: theme.accent.text }]}>
            {action.label}
          </Text>
          <Ionicons
            color={theme.accent.text}
            name="chevron-forward"
            size={12}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  action: { alignItems: "center", flexDirection: "row", gap: space.xxs },
  actionLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
  },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  title: type.eyebrow,
});
