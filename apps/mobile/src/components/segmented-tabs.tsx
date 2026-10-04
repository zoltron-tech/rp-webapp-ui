import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useA11ySettings } from "@/lib/a11y-settings";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `SegmentedTabs`: one track, and a lifted thumb that glides to the tab
 * you pick.
 *
 * A single control with one selection, rather than two pills side by side
 * that each look pressable on their own — which is what makes "you are here"
 * readable at a glance and leaves the accent for the glyph.
 *
 * ## The glide
 *
 * Web's, as written: `0.32s cubic-bezier(0.32, 0.72, 0, 1)` on one thumb
 * element measured off the selected tab, so it slides rather than blinking
 * from button to button. Here the thumb is a single view moved by a native
 * `translateX`, which matters more than it would on web: picking a tab swaps
 * a whole feed underneath, and that render holds the JS thread for the very
 * frames the glide runs in. A native-driven transform does not wait for it.
 *
 * For the same reason the glide is started from the press, before `onChange`
 * is called, rather than from an effect after the new feed has rendered. The
 * effect is still there for a `value` changed by anything other than a tap.
 * The labels lead by the same frame, so the whole control answers the finger
 * at once and the feed follows.
 *
 * Until the tabs have been measured the selected one paints its own fill, as
 * web's does, so the first frame is never a track with no selection. Reduce
 * Motion places the thumb without the travel.
 */
export interface SegmentedTab<TValue extends string> {
  icon?: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: TValue;
}

const GLIDE_MS = 320;
const GLIDE = Easing.bezier(0.32, 0.72, 0, 1);

export const SegmentedTabs = <TValue extends string>({
  onChange,
  options,
  value,
}: {
  /** Called only for a tab other than the selected one. */
  onChange: (value: TValue) => void;
  options: readonly SegmentedTab<TValue>[];
  value: TValue;
}) => {
  const theme = useAppTheme();
  const { reduceMotion } = useA11ySettings();

  /** Where each tab sits in the track, by index. Not state: only read. */
  const offsets = useRef<number[]>([]);
  const x = useRef(new Animated.Value(0)).current;
  /** The thumb's width, which is also "the tabs have been measured". */
  const [thumbWidth, setThumbWidth] = useState<number | null>(null);

  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  /** The index the thumb is at or travelling to, so a glide is not restarted. */
  const target = useRef(index);
  /**
   * The tab drawn as selected. It leads `value` by a frame on a tap: the
   * labels change colour with the press, and the caller's (heavy) change
   * follows, rather than the labels waiting for a whole feed to render.
   */
  const [shown, setShown] = useState(index);

  const glideTo = (next: number, animate: boolean) => {
    const to = offsets.current[next];
    if (to === undefined) return;
    target.current = next;
    if (!animate || reduceMotion) {
      x.setValue(to);
      return;
    }
    Animated.timing(x, {
      duration: GLIDE_MS,
      easing: GLIDE,
      toValue: to,
      useNativeDriver: true,
    }).start();
  };

  // A selection that changed without a tap on this control.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only `index` moves the thumb
  useEffect(() => {
    if (target.current !== index) glideTo(index, true);
    setShown(index);
  }, [index]);

  const onTabLayout = (position: number) => (event: LayoutChangeEvent) => {
    const { width, x: left } = event.nativeEvent.layout;
    offsets.current[position] = left;
    if (position !== index) return;
    // Placed, not animated: the first measure, a rotation, a font arriving.
    x.setValue(left);
    target.current = index;
    setThumbWidth((current) => (current === width ? current : width));
  };

  const measured = thumbWidth !== null;

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        {
          backgroundColor: theme.material.card.backgroundColor,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {measured ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              backgroundColor: theme.material.fillPressed,
              borderColor: theme.material.card.borderTopColor,
              transform: [{ translateX: x }],
              width: thumbWidth,
            },
          ]}
        />
      ) : null}

      {options.map((option, position) => {
        const active = position === shown;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={option.value}
            onLayout={onTabLayout(position)}
            onPress={() => {
              if (active) return;
              // The glide and the labels first, and a frame for them to be
              // drawn: `onChange` is about to hold the JS thread.
              glideTo(position, true);
              setShown(position);
              requestAnimationFrame(() => onChange(option.value));
            }}
            style={({ pressed }) => [
              styles.tab,
              active && !measured
                ? {
                    backgroundColor: theme.material.fillPressed,
                    borderColor: theme.material.card.borderTopColor,
                  }
                : pressed && !active
                  ? { backgroundColor: theme.glass.fillHover }
                  : null,
            ]}
          >
            {option.icon ? (
              <Ionicons
                color={active ? theme.accent.text : theme.textGray}
                name={option.icon}
                size={18}
              />
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: active ? theme.text : theme.textGray },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

/** The track's padding, which is also the thumb's inset from its edges. */
const INSET = space.xs;

const styles = StyleSheet.create({
  label: { fontSize: fontSize.body, fontWeight: "600" },
  tab: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flex: 1,
    flexDirection: "row",
    gap: space.s,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: space.sm,
  },
  thumb: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    bottom: INSET,
    // `left: 0` and a transform, as web's: the tab's own `x` already counts
    // the track's padding.
    left: 0,
    position: "absolute",
    top: INSET,
    // Web's lift: `0 4px 12px -6px rgb(0 0 0 / 0.6)`.
    ...Platform.select({
      android: { elevation: 3 },
      default: {
        shadowColor: "#000000",
        shadowOffset: { height: 3, width: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
      },
    }),
  },
  track: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    padding: INSET,
  },
});
