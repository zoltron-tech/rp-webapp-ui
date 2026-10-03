import { useEffect, useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A labelled range slider — web's `<input type="range">` in the muse
 * editor's wallpaper filters.
 *
 * `PanResponder` rather than a slider package, for the reason the crop editor
 * gives: nothing here may need a native rebuild. The thumb follows the finger
 * from where the touch began (`locationX` at grant plus the drag), which stays
 * right when the finger lands on the thumb itself; the track claims the touch
 * at the start and will not give it up, so a sheet or a scroll view behind it
 * does not steal a drag that wanders vertically.
 *
 * `onChange` fires as it moves, for a live preview; `onComplete` once, on
 * release, for the save.
 */

const THUMB = 22;
const TRACK = 4;

export const Slider = ({
  format = (value) => String(value),
  label,
  max,
  min,
  onChange,
  onComplete,
  step = 1,
  value,
}: {
  format?: (value: number) => string;
  label: string;
  max: number;
  min: number;
  onChange?: (value: number) => void;
  onComplete?: (value: number) => void;
  step?: number;
  value: number;
}) => {
  const theme = useAppTheme();
  const [width, setWidth] = useState(0);
  const [current, setCurrent] = useState(value);
  const dragging = useRef(false);
  const start = useRef(0);
  const latest = useRef(value);

  // Follow the value from outside, except mid-drag.
  useEffect(() => {
    if (!dragging.current) {
      setCurrent(value);
      latest.current = value;
    }
  }, [value]);

  const handlers = useRef({ onChange, onComplete });
  handlers.current = { onChange, onComplete };
  const widthRef = useRef(0);
  widthRef.current = width;

  const toValue = (x: number) => {
    const span = widthRef.current - THUMB;
    if (span <= 0) return min;
    const ratio = Math.min(Math.max((x - THUMB / 2) / span, 0), 1);
    const raw = min + ratio * (max - min);
    return Math.min(max, Math.max(min, Math.round(raw / step) * step));
  };

  const move = (x: number) => {
    const next = toValue(x);
    if (next === latest.current) return;
    latest.current = next;
    setCurrent(next);
    handlers.current.onChange?.(next);
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        dragging.current = true;
        start.current = event.nativeEvent.locationX;
        move(start.current);
      },
      onPanResponderMove: (_event, gesture) => move(start.current + gesture.dx),
      onPanResponderRelease: () => {
        dragging.current = false;
        handlers.current.onComplete?.(latest.current);
      },
      onPanResponderTerminate: () => {
        dragging.current = false;
        handlers.current.onComplete?.(latest.current);
      },
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;

  const ratio = max > min ? (current - min) / (max - min) : 0;
  const left = Math.max(0, (width - THUMB) * ratio);

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.textGray }]}>
          {format(current)}
        </Text>
      </View>
      <View
        accessibilityLabel={label}
        accessibilityRole="adjustable"
        accessibilityValue={{ max, min, now: current, text: format(current) }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          const delta =
            event.nativeEvent.actionName === "increment" ? step : -step;
          const next = Math.min(max, Math.max(min, current + delta * 5));
          setCurrent(next);
          latest.current = next;
          handlers.current.onChange?.(next);
          handlers.current.onComplete?.(next);
        }}
        onLayout={(event: LayoutChangeEvent) =>
          setWidth(event.nativeEvent.layout.width)
        }
        style={styles.hit}
        {...pan.panHandlers}
      >
        <View
          pointerEvents="none"
          style={[styles.track, { backgroundColor: theme.material.fillPressed }]}
        >
          <View
            style={[
              styles.fill,
              {
                backgroundColor: theme.accent.solid,
                width: left + THUMB / 2,
              },
            ]}
          />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              backgroundColor: "#ffffff",
              borderColor: theme.accent.solid,
              left,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { borderRadius: TRACK / 2, height: TRACK },
  head: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hit: { height: THUMB + space.sm * 2, justifyContent: "center" },
  label: { fontSize: fontSize.label, fontWeight: "600" },
  root: { gap: 2 },
  thumb: {
    borderRadius: radius.full,
    borderWidth: 3,
    height: THUMB,
    position: "absolute",
    width: THUMB,
  },
  track: {
    borderRadius: TRACK / 2,
    height: TRACK,
    marginHorizontal: THUMB / 2,
    overflow: "hidden",
  },
  value: { fontSize: fontSize.caption, fontVariant: ["tabular-nums"] },
});
