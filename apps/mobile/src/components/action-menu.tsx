import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { BottomSheet } from "@/components/sheet";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A menu, as a sheet.
 *
 * Web opens these as a dropdown under a `⋯` button (`AppDropdownMenuResponsive`
 * — which is itself a bottom sheet once the viewport is narrow). A phone gets
 * the sheet directly: a dropdown pinned to a 32pt button in the corner of a
 * banner is a column of 44pt rows squeezed against the screen edge, and the
 * same list at the bottom of the screen is under the thumb that opened it.
 *
 * Destructive items are red and grouped after a rule, exactly as web orders
 * them — the separator is what stops "Block" sitting one row under "Share".
 */

export interface ActionItem {
  /** Set for a rule between groups; nothing else on the item is read. */
  separator?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress?: () => void;
  /** `danger` is red, `positive` is the accent. */
  variant?: "default" | "danger" | "positive";
  /** Shows a spinner in place of the icon and blocks the press. */
  busy?: boolean;
}

export const ActionMenu = ({
  items,
  onClose,
  subtitle,
  title,
  visible,
}: {
  items: ActionItem[];
  onClose: () => void;
  subtitle?: string;
  title: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();

  return (
    <BottomSheet
      maxHeightRatio={0.7}
      onClose={onClose}
      subtitle={subtitle}
      title={title}
      visible={visible}
    >
      <View style={styles.body}>
        {items.map((item, index) => {
          if (item.separator) {
            return (
              <View
                // Separators have nothing to key on but where they are.
                key={`separator-${index}`}
                style={[
                  styles.separator,
                  { backgroundColor: theme.glass.edge },
                ]}
              />
            );
          }

          const colour =
            item.variant === "danger"
              ? theme.error
              : item.variant === "positive"
                ? // The theme's green, not the accent: a novelist on the crimson
                  // or dracula palette had "Add friend" drawn in their accent,
                  // which is red — the same colour as "Block" one row below it.
                  theme.success
                : theme.text;

          return (
            <Pressable
              accessibilityRole="button"
              disabled={item.busy}
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : "transparent",
                  opacity: item.busy ? 0.6 : 1,
                },
              ]}
            >
              {item.busy ? (
                <ActivityIndicator color={colour} size="small" />
              ) : (
                <Ionicons
                  color={colour}
                  name={item.icon ?? "ellipse-outline"}
                  size={22}
                />
              )}
              <Text style={[styles.label, { color: colour }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { paddingBottom: space.lg, paddingHorizontal: space.sm },
  // Web's sheet rows: 16/500, 44 high.
  label: { flexShrink: 1, fontSize: fontSize.lead, fontWeight: "500" },
  row: {
    alignItems: "center",
    borderRadius: radius.md + 2,
    flexDirection: "row",
    gap: space.md,
    minHeight: 44,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: space.sm,
    marginVertical: space.xs,
  },
});
