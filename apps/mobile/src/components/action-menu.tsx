import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
                  size={20}
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
  label: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "600" },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.md - 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: space.sm,
    marginVertical: space.xs,
  },
});
