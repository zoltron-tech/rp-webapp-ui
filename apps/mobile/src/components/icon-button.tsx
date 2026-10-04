import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  type Insets,
  Pressable,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { border, radius, useAppTheme } from "@/theme";

/**
 * A round button that is only an icon: web's `ICON_BUTTON`.
 *
 * Every sheet header, composer and toolbar had drawn its own — the same
 * circle, with its own idea of what pressed and disabled look like. The tones
 * here are the ones that were actually in use:
 *
 * - `primary` — the accent fill: a sheet's confirm, a composer's send. Disabled
 *   it takes the neutral disabled fill rather than a dimmed accent, and `busy`
 *   swaps the icon for a spinner without changing the button's size.
 * - `glass` — a control on a glass sheet or bar (a sheet's close).
 * - `material` — a control on a card or a translucent panel.
 * - `surface` — a control on the page itself: the opaque material fill.
 * - `quiet` — the same, a step back: grey ink, for a decline beside an accept.
 * - `positive` / `danger` — the tonal pairs (`Tones`), for accept and remove.
 *
 * Pressed is a wash of the fill, not a drop in opacity: the button gets
 * darker under the finger instead of fading into what is behind it.
 *
 * `size` is the circle. The touch target is the caller's `hitSlop`, as it was,
 * because how much room there is around the button is the layout's knowledge.
 */
export type IconButtonTone =
  | "primary"
  | "glass"
  | "material"
  | "surface"
  | "quiet"
  | "positive"
  | "danger";

export const IconButton = ({
  accessibilityLabel,
  busy = false,
  color,
  disabled = false,
  hitSlop,
  icon,
  iconSize = 18,
  onPress,
  size = 32,
  style,
  tone = "material",
}: {
  accessibilityLabel: string;
  busy?: boolean;
  /** The glyph's colour, where it is not the tone's own (an accent action). */
  color?: string;
  disabled?: boolean;
  hitSlop?: number | Insets;
  icon: ComponentProps<typeof Ionicons>["name"];
  iconSize?: number;
  onPress: () => void;
  size?: number;
  /** Position only — margins. The circle's own look is the tone's. */
  style?: StyleProp<ViewStyle>;
  tone?: IconButtonTone;
}) => {
  const theme = useAppTheme();
  const primary = tone === "primary";
  const tonal = tone === "positive" || tone === "danger";

  const ink = color
    ? color
    : primary
    ? disabled
      ? theme.accent.onFillDisabled
      : theme.accent.onFill
    : tonal
      ? theme.tones[tone].ink
      : tone === "quiet"
        ? theme.textGray
        : theme.text;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: disabled || busy }}
      // Busy blocks a second press without taking the disabled look.
      disabled={disabled || busy}
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [
        styles.circle,
        { height: size, width: size },
        primary
          ? {
              backgroundColor: disabled
                ? theme.accent.fillDisabled
                : pressed
                  ? theme.accent.fillPressed
                  : theme.accent.fill,
            }
          : tonal
            ? {
                backgroundColor: theme.tones[tone].fill,
                opacity: pressed ? 0.75 : 1,
              }
            : tone === "quiet"
              ? [
                  styles.edged,
                  {
                    backgroundColor: pressed
                      ? theme.glass.fillPressed
                      : theme.material.fillPressed,
                    borderColor: theme.material.edge,
                  },
                ]
              : tone === "surface"
                ? [
                    styles.edged,
                    {
                      backgroundColor: pressed
                        ? theme.material.fillPressed
                        : theme.material.fill,
                      borderColor: theme.material.edge,
                    },
                  ]
                : tone === "glass"
            ? [
                styles.edged,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.glass.fillHover,
                  borderColor: theme.glass.edge,
                },
              ]
            : [
                styles.edged,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.material.fillTranslucent,
                  borderColor: theme.material.edgeTranslucent,
                },
              ],
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={ink} size="small" />
      ) : (
        <Ionicons color={ink} name={icon} size={iconSize} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
  },
  edged: { borderWidth: border.edge },
});
