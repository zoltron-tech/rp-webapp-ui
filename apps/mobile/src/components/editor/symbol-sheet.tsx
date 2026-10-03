import type { SymbolCategory } from "@nw/richtext";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/sheet";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A grid of glyphs, grouped — web's bullet, numbering and quotation popovers.
 *
 * Three popovers on web, one sheet here: each of them is a list of categories
 * with a grid of symbols under each heading and one of them possibly selected,
 * and the only thing that differs is which table is handed in. A phone gets a
 * bottom sheet rather than a popover for the reason `AGENTS.md` gives, and
 * this one fills its allowance because the bullet table is eighty glyphs deep
 * and scrolls.
 */
export const SymbolSheet = ({
  categories,
  onClose,
  onSelect,
  selected,
  subtitle,
  title,
  visible,
}: {
  categories: SymbolCategory[];
  onClose: () => void;
  onSelect: (value: string) => void;
  selected?: string | null;
  subtitle?: string;
  title: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();

  return (
    <BottomSheet
      fill
      maxHeightRatio={0.7}
      onClose={onClose}
      subtitle={subtitle}
      title={title}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map((category) => (
          <View key={category.name} style={styles.category}>
            <Text style={[styles.heading, { color: theme.textGray }]}>
              {category.name.toUpperCase()}
            </Text>
            <View style={styles.grid}>
              {category.symbols.map((symbol) => {
                const active = selected === symbol.value;
                return (
                  <Pressable
                    accessibilityLabel={symbol.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    key={symbol.value}
                    onPress={() => onSelect(symbol.value)}
                    style={({ pressed }) => [
                      styles.cell,
                      {
                        backgroundColor: active
                          ? theme.accent.surfaceActive
                          : pressed
                            ? theme.glass.fillPressed
                            : theme.material.fillTranslucent,
                        borderColor: active
                          ? theme.accent.solid
                          : theme.material.edgeTranslucent,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.glyph,
                        {
                          color: active ? theme.accent.textStrong : theme.text,
                        },
                      ]}
                    >
                      {symbol.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.md, padding: space.md, paddingBottom: space.xl },
  category: { gap: space.sm },
  // 44pt cells: a glyph is a small target and this is the one grid in the app
  // where every cell is a different, easily-confused shape.
  cell: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: "center",
    minWidth: 44,
    paddingHorizontal: space.xs,
  },
  glyph: { fontSize: fontSize.title },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.xs + 2 },
  heading: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
});
