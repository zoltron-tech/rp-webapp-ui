import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import type { TextInput as RNTextInput, TextInputProps } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A labelled input, matching the web login form's field.
 *
 * `hint` is the row that sits under the label on web — where the Radix form
 * shows "username is taken" or "must be at least 3 characters". `counter`
 * renders the `n / max` tag the app uses wherever a length limit is enforced
 * (`{message.length} / {MAX_MESSAGE_LENGTH}` in the ice-breaker dialog, the
 * note dialog, the muse connection form).
 *
 * ## The reveal toggle
 *
 * Passing `secureTextEntry` gets the eye button web has had all along, through
 * Radix's `PasswordToggleField` (`components/common/password-field`). It lives
 * here rather than in a separate `PasswordField` because the whole difference
 * is one button inside the same frame, and a second component would be a second
 * place for the label, hint and counter to drift.
 *
 * The toggle is deliberately **not** focusable as a form step: tapping it moves
 * focus off the input on Android, which closes the keyboard mid-typing. It is a
 * `Pressable` with a hit slop instead, and the input keeps focus.
 */
export const TextField = forwardRef<
  RNTextInput,
  TextInputProps & {
    label: string;
    hint?: string;
    /** Renders the hint in the error colour rather than the muted one. */
    invalid?: boolean;
    /** Show `value.length / max` beside the label. */
    counterMax?: number;
  }
>(
  (
    {
      counterMax,
      hint,
      invalid,
      label,
      onBlur,
      onFocus,
      secureTextEntry,
      style,
      ...props
    },
    ref,
  ) => {
    const theme = useAppTheme();
    const [revealed, setRevealed] = useState(false);
    // Web's `FIELD:focus-visible`: the edge turns to the accent. Appearance
    // only; the caller's own focus handlers still run.
    const [focused, setFocused] = useState(false);

    const isPassword = Boolean(secureTextEntry);
    const length = typeof props.value === "string" ? props.value.length : 0;
    const over = counterMax !== undefined && length > counterMax;

    return (
      <View style={styles.field}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: theme.textGray }]}>{label}</Text>

          {counterMax !== undefined ? (
            <Text
              style={[
                styles.counter,
                { color: over ? theme.error : theme.textGray },
              ]}
            >
              {length} / {counterMax} characters
            </Text>
          ) : null}
        </View>

        {/*
          The frame is the row, not the input. The border has to enclose the
          reveal button as well, or the eye sits outside the field it belongs
          to and the focus ring stops at the text.
        */}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: theme.glass.field,
              borderColor: invalid
                ? theme.error
                : focused
                  ? theme.accent.solid
                  : theme.glass.fieldEdge,
            },
          ]}
        >
          <TextInput
            ref={ref}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            placeholderTextColor={theme.textGray}
            secureTextEntry={isPassword && !revealed}
            style={[styles.input, { color: theme.text }, style]}
            {...props}
          />

          {isPassword ? (
            <Pressable
              accessibilityLabel={revealed ? "Hide password" : "Show password"}
              accessibilityRole="button"
              hitSlop={space.sm}
              onPress={() => setRevealed((previous) => !previous)}
              style={styles.reveal}
            >
              <Ionicons
                color={theme.textGray}
                name={revealed ? "eye-off-outline" : "eye-outline"}
                size={20}
              />
            </Pressable>
          ) : null}
        </View>

        {hint ? (
          <Text
            style={[
              styles.hint,
              { color: invalid ? theme.error : theme.textGray },
            ]}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = "TextField";

const styles = StyleSheet.create({
  counter: { fontSize: fontSize.caption },
  field: { gap: space.xs },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hint: { fontSize: fontSize.caption },
  input: {
    flex: 1,
    fontSize: fontSize.input,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  inputRow: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    /*
     * 48, which is the floor rather than a preference: it is Android's minimum
     * touch target (Material) and one point above Apple's 44. The login screen
     * shrank to fit four of these plus the rest of a registration form on one
     * screen, and this is where the shrinking had to stop.
     */
    minHeight: 48,
  },
  label: { fontSize: fontSize.label, fontWeight: "600" },
  reveal: { paddingHorizontal: space.md },
});
