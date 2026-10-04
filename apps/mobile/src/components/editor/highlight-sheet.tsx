import { Ionicons } from "@expo/vector-icons";
import { HIGHLIGHT_COLORS } from "@nw/richtext";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomSheet } from "@/components/sheet";
import { radius, space, useAppTheme } from "@/theme";

/**
 * Web's `HighlightSwatchGrid`: fifteen swatches and a "remove" cell, four by
 * four.
 *
 * The same fifteen values from `@nw/richtext`, so a highlight chosen here is
 * the one web's toolbar will light up as active — it compares the stored
 * colour against its own table, and a swatch that was nearly the same would be
 * a highlight web could not see.
 */
export const HighlightSheet = ({
  active,
  onClose,
  onSelect,
  visible,
}: {
  /** The current highlight, or null. Marks the swatch. */
  active: string | null;
  onClose: () => void;
  /** `null` removes the highlight. */
  onSelect: (value: string | null) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();

  return (
    <BottomSheet
      maxHeightRatio={0.5}
      onClose={onClose}
      subtitle="Behind the selected words"
      title="Highlight"
      visible={visible}
    >
      <View style={styles.grid}>
        {HIGHLIGHT_COLORS.map((colour) => {
          const selected = active?.toLowerCase() === colour.value.toLowerCase();
          return (
            <Pressable
              accessibilityLabel={colour.name}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={colour.value}
              onPress={() => onSelect(colour.value)}
              style={({ pressed }) => [
                styles.swatch,
                {
                  backgroundColor: colour.value,
                  borderColor: selected ? theme.text : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              {selected ? (
                <Ionicons color="#ffffff" name="checkmark" size={18} />
              ) : null}
            </Pressable>
          );
        })}
        <Pressable
          accessibilityLabel="Remove highlight"
          accessibilityRole="button"
          onPress={() => onSelect(null)}
          style={({ pressed }) => [
            styles.swatch,
            {
              backgroundColor: pressed
                ? theme.glass.fillPressed
                : theme.material.fillTranslucent,
              borderColor: theme.material.edgeTranslucent,
              borderStyle: "dashed",
            },
          ]}
        >
          <Ionicons color={theme.textGray} name="close" size={18} />
        </Pressable>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.ms,
    justifyContent: "center",
    padding: space.md,
    paddingBottom: space.xl,
  },
  // Four across at 375pt with the gaps above: (375 - 32 - 30) / 4 ≈ 78, so
  // 64 leaves the grid centred with air rather than edge to edge.
  swatch: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 2,
    height: 56,
    justifyContent: "center",
    width: 64,
  },
});
