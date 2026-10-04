import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { withAlpha } from "@/lib/color";
import { resolveAsterism } from "@/lib/story";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * A scene break: the author's glyph between two rules.
 *
 * Web draws six rule styles in CSS; these are the same six in views — a fading
 * gradient, a solid, dashed or dotted line, a double line, and a row of beads.
 * "none" draws nothing, as it does on web.
 */
export const Asterism = ({
  tight,
  value,
}: {
  tight?: boolean;
  value: string | null | undefined;
}) => {
  const theme = useAppTheme();
  const { glyph, line } = resolveAsterism(value);
  if (!glyph) return null;

  const color = withAlpha(theme.accent.solid, 0.55);

  const rule = (side: "left" | "right") => {
    if (line === "gradient") {
      return (
        <LinearGradient
          colors={
            side === "left" ? ["transparent", color] : [color, "transparent"]
          }
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={styles.gradient}
        />
      );
    }
    if (line === "double") {
      return (
        <View style={styles.double}>
          <View style={[styles.hair, { backgroundColor: color }]} />
          <View style={[styles.hair, { backgroundColor: color }]} />
        </View>
      );
    }
    if (line === "beaded") {
      return (
        <View style={styles.beads}>
          {Array.from({ length: 5 }, (_, index) => (
            <View
              key={index}
              style={[styles.bead, { backgroundColor: color }]}
            />
          ))}
        </View>
      );
    }
    return (
      <View
        style={[
          styles.line,
          {
            borderColor: color,
            borderStyle: line === "solid" ? "solid" : line,
          },
        ]}
      />
    );
  };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.row, tight && styles.tight]}
    >
      {rule("left")}
      <Text style={[styles.glyph, { color: theme.accent.text }]}>{glyph}</Text>
      {rule("right")}
    </View>
  );
};

const styles = StyleSheet.create({
  bead: { borderRadius: 2, height: 4, width: 4 },
  beads: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  double: { flex: 1, gap: space.xxs },
  glyph: { fontSize: fontSize.title - 2 },
  gradient: { flex: 1, height: 1 },
  hair: { height: StyleSheet.hairlineWidth * 2 },
  line: { borderTopWidth: 1, flex: 1, height: 0 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.ms,
    marginVertical: space.lg,
    paddingHorizontal: space.lg,
  },
  tight: { marginVertical: space.md },
});
