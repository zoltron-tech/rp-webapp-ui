import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import { TextInput } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The search pill: web's mobile search bar (`mobile-search-styles.ts`).
 *
 * A magnifier, the field, and a clear button once there is something to clear.
 * It was written out in seven places — the inbox, four sheets and two pickers —
 * as the same row with small disagreements about radius, edge and whether the
 * text could be cleared. Everything a `TextInput` takes passes straight
 * through, so a caller's `autoFocus`, `returnKeyType` or `onSubmitEditing`
 * behaves as it did.
 *
 * The edge is the translucent field edge, which reads on a page and on a glass
 * sheet alike, and turns to the accent while the field has focus.
 */
export const SearchField = ({
  containerStyle,
  onBlur,
  onChangeText,
  onFocus,
  value,
  ...props
}: Omit<TextInputProps, "style" | "value"> & {
  /** Position only — margins around the pill. */
  containerStyle?: StyleProp<ViewStyle>;
  value: string;
}) => {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: theme.glass.field,
          borderColor: focused ? theme.accent.solid : theme.glass.fieldEdge,
        },
        containerStyle,
      ]}
    >
      <Ionicons color={theme.textGray} name="search" size={16} />
      <TextInput
        autoCorrect={false}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onChangeText={onChangeText}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={theme.textGray}
        style={[styles.input, { color: theme.text }]}
        value={value}
        {...props}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={space.sm}
          onPress={() => onChangeText?.("")}
        >
          <Ionicons color={theme.textGray} name="close-circle" size={16} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    // Web's 42, which is also comfortably a touch target.
    minHeight: 42,
    paddingHorizontal: space.md,
  },
  input: { flex: 1, fontSize: fontSize.body, paddingVertical: space.sm },
});
