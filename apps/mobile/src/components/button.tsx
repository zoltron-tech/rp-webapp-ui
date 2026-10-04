import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, memo } from "react";
import {
  ActivityIndicator,
  type Insets,
  Pressable,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Text } from "@/components/text";
import { type AppTheme, border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The app's button: web's `PILL_PRIMARY` / `PILL_SECONDARY`, and the tonal
 * accept / decline pair the cards and rows use.
 *
 * Five components drew this before — the settings pill, the auth screens'
 * submit, and a button each in the notification row, the novelist row and the
 * suggestion card — and each had its own answer for pressed, busy and
 * disabled. They are the same button at different sizes, so they are this.
 *
 * ## Variants
 *
 * - `primary` — the accent fill. Disabled is a neutral fill with secondary
 *   ink, never a dimmed accent (see `AppAccent.fillDisabled`).
 * - `secondary` — a wash and an edge, for the action beside a primary.
 * - `quiet` — the same, a step back: grey ink, for "Decline" and "Cancel".
 * - `positive` / `danger` — a tonal pair, a deep fill and a pale label of the
 *   same hue (`Tones`), for accept and remove.
 * - `dangerOutline` — a secondary with the error colour for its ink and edge.
 *
 * ## Pressed, busy, disabled
 *
 * Pressed darkens the fill; it does not fade the button. Busy swaps the icon
 * for a spinner and keeps the label, so the button holds its width under the
 * finger that pressed it. A busy button cannot be pressed again.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "quiet"
  | "positive"
  | "danger"
  | "dangerOutline";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface Paint {
  edge: string;
  fill: string;
  ink: string;
  pressed: string;
}

const paintFor = (
  theme: AppTheme,
  variant: ButtonVariant,
  disabled: boolean,
): Paint => {
  switch (variant) {
    case "primary":
      return disabled
        ? {
            edge: "transparent",
            fill: theme.accent.fillDisabled,
            ink: theme.accent.onFillDisabled,
            pressed: theme.accent.fillDisabled,
          }
        : {
            edge: "transparent",
            fill: theme.accent.fill,
            ink: theme.accent.onFill,
            pressed: theme.accent.fillPressed,
          };
    case "positive":
      return {
        edge: "transparent",
        fill: theme.tones.positive.fill,
        ink: theme.tones.positive.ink,
        pressed: theme.tones.positive.fill,
      };
    case "danger":
      return {
        edge: "transparent",
        fill: theme.tones.danger.fill,
        ink: theme.tones.danger.ink,
        pressed: theme.tones.danger.fill,
      };
    case "quiet":
      return {
        edge: theme.material.edge,
        fill: theme.material.fillPressed,
        ink: theme.textGray,
        pressed: theme.glass.fillPressed,
      };
    case "dangerOutline":
      return {
        edge: theme.error,
        fill: theme.glass.fillHover,
        ink: theme.error,
        pressed: theme.glass.fillPressed,
      };
    default:
      return {
        edge: theme.glass.edge,
        fill: theme.glass.fillHover,
        ink: theme.text,
        pressed: theme.glass.fillPressed,
      };
  }
};

/** The tonal pairs have no darker step of their own, so they dim instead. */
const DIMS_WHEN_PRESSED: Record<ButtonVariant, boolean> = {
  danger: true,
  dangerOutline: false,
  positive: true,
  primary: false,
  quiet: false,
  secondary: false,
};

const ICON_SIZE: Record<ButtonSize, number> = { lg: 16, md: 16, sm: 14, xs: 13 };

const ButtonView = ({
  accessibilityLabel,
  busy = false,
  busyLabel,
  disabled = false,
  hitSlop,
  icon,
  label,
  onPress,
  shape = "pill",
  size = "md",
  stretch = false,
  style,
  variant = "secondary",
}: {
  /** Needed when there is no `label`. */
  accessibilityLabel?: string;
  busy?: boolean;
  /** What the label reads while busy. Defaults to the label itself. */
  busyLabel?: string;
  disabled?: boolean;
  hitSlop?: number | Insets;
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** Absent for an icon-only button. */
  label?: string;
  onPress: () => void;
  /** `rect` is web's card button: squared corners, for a card's base. */
  shape?: "pill" | "rect";
  size?: ButtonSize;
  /** Fill the row it is in, sharing it evenly with its siblings. */
  stretch?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}) => {
  const theme = useAppTheme();
  const off = disabled || busy;
  // Only the primary has a disabled look of its own; busy alone keeps the
  // accent, because the spinner already says why it cannot be pressed.
  const paint = paintFor(theme, variant, disabled);
  const dims = variant !== "primary" && disabled;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: off }}
      disabled={off}
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        SIZES[size],
        shape === "rect" ? styles.rect : styles.pill,
        stretch && styles.stretch,
        {
          backgroundColor: pressed ? paint.pressed : paint.fill,
          borderColor: paint.edge,
        },
        (dims || (pressed && DIMS_WHEN_PRESSED[variant])) && styles.dimmed,
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={paint.ink} size="small" />
      ) : icon ? (
        <Ionicons color={paint.ink} name={icon} size={ICON_SIZE[size]} />
      ) : null}
      {label ? (
        <Text numberOfLines={1} style={[LABELS[size], { color: paint.ink }]}>
          {busy ? (busyLabel ?? label) : label}
        </Text>
      ) : null}
    </Pressable>
  );
};

export const Button = memo(ButtonView);

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderWidth: border.edge,
    flexDirection: "row",
    justifyContent: "center",
  },
  dimmed: { opacity: 0.6 },
  pill: { borderRadius: radius.full },
  rect: { borderRadius: radius.sm },
  stretch: { flex: 1 },
});

/** Heights are web's: 32 for a row action, 40 for a dialog's, 48 for a form's. */
const SIZES = StyleSheet.create({
  lg: { gap: space.sm, minHeight: 48, paddingHorizontal: space.ml },
  md: { gap: space.s, minHeight: 40, paddingHorizontal: space.md },
  sm: { gap: 5, minHeight: 32, paddingHorizontal: space.m },
  xs: { gap: 5, minHeight: 32, paddingHorizontal: space.ms },
});

const LABELS = StyleSheet.create({
  lg: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "600" },
  md: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "600" },
  sm: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "600" },
  xs: { flexShrink: 1, fontSize: fontSize.meta, fontWeight: "700" },
});
