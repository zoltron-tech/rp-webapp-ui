import { StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { IconButton } from "@/components/icon-button";

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

      <IconButton
        accessibilityLabel="Create character"
        busy={busy}
        disabled={!canConfirm}
        hitSlop={space.xs}
        icon="checkmark"
        iconSize={16}
        onPress={onConfirm}
        tone="primary"
      />

      <IconButton
        accessibilityLabel="Cancel"
        color={theme.textGray}
        hitSlop={space.xs}
        icon="close"
        iconSize={16}
        onPress={onCancel}
        tone="material"
      />
    </View>
  );
};

/** The error a failed create shows, in the sheet rather than as an alert. */
export const QuickAddMuseError = ({ message }: { message: string }) => {
  const theme = useAppTheme();

  return <Text style={[styles.error, { color: theme.error }]}>{message}</Text>;
};

const styles = StyleSheet.create({
  error: { fontSize: fontSize.caption },
  input: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    flex: 1,
    fontSize: fontSize.body,
    paddingHorizontal: space.sm,
    paddingVertical: space.s,
  },
  row: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
