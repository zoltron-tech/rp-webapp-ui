import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_FONT, EDITOR_FONTS } from "@nw/fonts";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { BottomSheet } from "@/components/sheet";
import { nativeFace } from "@/lib/editor-fonts";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's font menu, as a tray: every family in `@nw/fonts`, each drawn in its
 * own face so the name is the sample. The default is a row like any other —
 * picking it clears the family, which is what web's "Arial" amounts to.
 */
export const FontSheet = ({
  active,
  onClose,
  onSelect,
  visible,
}: {
  /** The current family, or undefined for the default. */
  active: string | undefined;
  onClose: () => void;
  /** `undefined` is the default face. */
  onSelect: (family: string | undefined) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const current = active ?? DEFAULT_FONT;

  return (
    <BottomSheet
      maxHeightRatio={0.7}
      onClose={onClose}
      subtitle="For the selected words, or what you type next"
      title="Font"
      visible={visible}
    >
      <ScrollView contentContainerStyle={styles.list}>
        {EDITOR_FONTS.map((font) => {
          const selected = font.family === current;
          const face = nativeFace(font.family, false, false);
          return (
            <Pressable
              accessibilityLabel={font.family}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={font.family}
              onPress={() =>
                onSelect(font.family === DEFAULT_FONT ? undefined : font.family)
              }
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: selected
                    ? theme.accent.tint
                    : pressed
                      ? theme.glass.fillPressed
                      : theme.material.fillTranslucent,
                  borderColor: selected
                    ? theme.accent.solid
                    : theme.material.edgeTranslucent,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.sample,
                  face ? { fontFamily: face.fontFamily } : null,
                  { color: selected ? theme.accent.textStrong : theme.text },
                ]}
              >
                {font.family}
              </Text>
              <View style={styles.spacer} />
              {selected ? (
                <Ionicons
                  color={theme.accent.textStrong}
                  name="checkmark"
                  size={18}
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  list: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: space.md,
  },
  sample: { flexShrink: 1, fontSize: fontSize.body + 2 },
  spacer: { flex: 1 },
});
