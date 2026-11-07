import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { codexIcon, CODEX_ICON_KEYS } from "@/lib/story";
import { CODEX_COLORS } from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The pieces the story's world-building trays are built from — web's
 * `responsive-sheet` field styles: a label over a field, a row of choices, a
 * row of colours, and a way to delete at the foot.
 */

export const FieldLabel = ({ children }: { children: string }) => {
  const theme = useAppTheme();
  return (
    <Text style={[styles.label, { color: theme.textGray }]}>{children}</Text>
  );
};

export const Hint = ({ children }: { children: string }) => {
  const theme = useAppTheme();
  return (
    <Text style={[styles.hint, { color: theme.textGray }]}>{children}</Text>
  );
};

/** One option in a row of them, on or off. */
export const Choice = ({
  active,
  color,
  label,
  onPress,
}: {
  active: boolean;
  /** The colour it takes while on, where that means something. */
  color?: string;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const on = color ?? theme.accent.solid;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: active ? theme.accent.tint : theme.material.fill,
          borderColor: active ? on : theme.material.edge,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.choiceLabel,
          { color: active ? theme.accent.text : theme.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const IconChoices = ({
  onChange,
  value,
}: {
  onChange: (key: string) => void;
  value: string;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      {CODEX_ICON_KEYS.map((key) => {
        const active = key === value;
        return (
          <Pressable
            accessibilityLabel={`Icon ${key}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.icon,
              {
                backgroundColor: active
                  ? theme.accent.tint
                  : theme.material.fill,
                borderColor: active ? theme.accent.solid : theme.material.edge,
              },
            ]}
          >
            <MaterialCommunityIcons
              color={active ? theme.accent.text : theme.text}
              name={
                codexIcon(key) as keyof typeof MaterialCommunityIcons.glyphMap
              }
              size={18}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export const Swatches = ({
  onChange,
  value,
}: {
  onChange: (color: string) => void;
  value: string | null;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.row}>
      {CODEX_COLORS.map((color) => {
        const active = color === value;
        return (
          <Pressable
            accessibilityLabel={`Colour ${color}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            key={color}
            onPress={() => onChange(color)}
            style={[
              styles.swatch,
              {
                backgroundColor: color,
                borderColor: active ? theme.text : "transparent",
              },
            ]}
          >
            {active ? (
              <Ionicons color="#ffffff" name="checkmark" size={16} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

export const DangerRow = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.danger,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons color={theme.error} name="trash-outline" size={18} />
      <Text style={[styles.dangerLabel, { color: theme.error }]}>{label}</Text>
    </Pressable>
  );
};

/** The shared look of a one-line field in these trays. */
export const useFieldStyle = () => {
  const theme = useAppTheme();
  return [
    styles.field,
    {
      backgroundColor: theme.glass.field,
      borderColor: theme.material.edgeTranslucent,
      color: theme.text,
    },
  ];
};

const styles = StyleSheet.create({
  choice: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    maxWidth: "100%",
    paddingHorizontal: space.m,
    paddingVertical: space.xs,
  },
  choiceLabel: { fontSize: fontSize.label, fontWeight: "600" },
  danger: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    padding: space.m,
  },
  dangerLabel: { fontSize: fontSize.body, fontWeight: "600" },
  field: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    fontSize: fontSize.input,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  hint: { fontSize: fontSize.caption, lineHeight: 17 },
  icon: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: border.edge,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  label: { fontSize: fontSize.caption, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  swatch: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
});
