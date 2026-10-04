import { Ionicons } from "@expo/vector-icons";
import { HIGHLIGHT_COLORS } from "@nw/richtext";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  type HighlightSwatch,
  highlightStyle,
  THEME_HIGHLIGHT_COLORS,
} from "@/components/editor/highlight";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * Web's highlight dropdown: the fifteen colours and a "remove" cell, then one
 * swatch per profile palette under "Themes".
 *
 * Each cell is the highlight itself — the tinted ground and the brightened
 * letters that will be written — rather than a block of the swatch colour, so
 * what is chosen is what appears in the post.
 */
export const HighlightSheet = ({
  active,
  onClose,
  onSelect,
  visible,
}: {
  /** The swatch (hex) of the current highlight, or null. */
  active: string | null;
  onClose: () => void;
  /** `null` removes the highlight. */
  onSelect: (value: string | null) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();

  const cell = (colour: HighlightSwatch) => {
    const selected = active?.toLowerCase() === colour.value.toLowerCase();
    const look = highlightStyle(colour.value);
    return (
      <Pressable
        accessibilityLabel={`${colour.name} highlight`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        key={colour.value}
        onPress={() => onSelect(colour.value)}
        style={({ pressed }) => [
          styles.swatch,
          {
            backgroundColor: look.background,
            borderColor: selected ? colour.value : "transparent",
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <Text style={[styles.sample, { color: look.color }]}>Aa</Text>
        <View style={[styles.ink, { backgroundColor: colour.value }]} />
      </Pressable>
    );
  };

  return (
    <BottomSheet
      ignoreKeyboard
      maxHeightRatio={0.7}
      onClose={onClose}
      subtitle="Behind the selected words"
      title="Highlight"
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.group}>
          <Text style={[styles.heading, { color: theme.textGray }]}>
            Colours
          </Text>
          <View style={styles.grid}>
            {HIGHLIGHT_COLORS.map(cell)}
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
        </View>
        <View style={styles.group}>
          <Text style={[styles.heading, { color: theme.textGray }]}>
            Themes
          </Text>
          <View style={styles.grid}>{THEME_HIGHLIGHT_COLORS.map(cell)}</View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.md, padding: space.md, paddingBottom: space.xl },
  // Six across at 375pt: 6 × 50 + 5 × 8 = 340 of the 343 inside the gutters.
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  group: { gap: space.sm },
  heading: type.eyebrow,
  // The swatch's own colour, under the sample: the tint alone is too quiet to
  // tell amber from yellow.
  ink: { borderRadius: radius.full, height: 3, width: 18 },
  sample: { fontSize: fontSize.body, fontWeight: "700" },
  swatch: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 2,
    gap: space.xs,
    height: 48,
    justifyContent: "center",
    width: 50,
  },
});
