import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * "What is their name?" — the whole of creating a character from here.
 *
 * Both ice-breaker sheets show this under the sender picker once the picker's
 * add tile is tapped, which is where web puts it. One field, because that is
 * all the API needs to make a fandomless muse; everything else about them is
 * edited on their own page, and asking for any of it here would turn a
 * shortcut into a form.
 */
export const QuickAddMuseRow = ({
  busy,
  onCancel,
  onChange,
  onConfirm,
  value,
}: {
  busy: boolean;
  onCancel: () => void;
  onChange: (value: string) => void;
  onConfirm: () => void;
  value: string;
}) => {
  const theme = useAppTheme();
  const canConfirm = Boolean(value.trim()) && !busy;

  return (
    <View style={styles.row}>
      <TextInput
        autoFocus
        onChangeText={onChange}
        onSubmitEditing={() => canConfirm && onConfirm()}
        placeholder="Character name"
        placeholderTextColor={theme.textGray}
        returnKeyType="done"
        style={[
          styles.input,
          {
            backgroundColor: theme.glass.field,
            borderColor: theme.material.edgeTranslucent,
            color: theme.text,
          },
        ]}
        value={value}
      />

      <Pressable
        accessibilityLabel="Create character"
        accessibilityRole="button"
        disabled={!canConfirm}
        hitSlop={space.xs}
        onPress={onConfirm}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: canConfirm
              ? theme.accent.solid
              : theme.accent.surfaceActive,
            opacity: pressed && canConfirm ? 0.8 : 1,
          },
        ]}
      >
        {busy ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Ionicons color="#ffffff" name="checkmark" size={16} />
        )}
      </Pressable>

      <Pressable
        accessibilityLabel="Cancel"
        accessibilityRole="button"
        hitSlop={space.xs}
        onPress={onCancel}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.material.fillTranslucent,
            borderColor: theme.material.edgeTranslucent,
            borderWidth: StyleSheet.hairlineWidth,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons color={theme.textGray} name="close" size={16} />
      </Pressable>
    </View>
  );
};

/** The error a failed create shows, in the sheet rather than as an alert. */
export const QuickAddMuseError = ({ message }: { message: string }) => {
  const theme = useAppTheme();

  return <Text style={[styles.error, { color: theme.error }]}>{message}</Text>;
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  error: { fontSize: fontSize.caption },
  input: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    fontSize: fontSize.body,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm - 2,
  },
  row: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
