import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { asHex } from "@/lib/color";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `HexColorPicker` plus its hex field, for a muse's profile colour and
 * the advanced colour overrides.
 *
 * The same three controls `react-colorful` draws: a saturation–brightness
 * plane washed in the current hue, a hue strip under it, and the hex. Both
 * gradients are `expo-linear-gradient` layers and both drags are
 * `PanResponder`s (no native rebuild), each following the finger from where the
 * touch began and refusing to hand it to a sheet behind. A row of presets sits
 * under the field, since a thumb picking an exact colour off a plane is fiddly.
 *
 * Controlled by `value` (a six-digit hex); every change is reported.
 */

const PLANE_HEIGHT = 180;
const HUE_HEIGHT = 22;
const THUMB = 24;

const PRESETS = [
  "#e5484d",
  "#f76b15",
  "#ffc53d",
  "#46a758",
  "#12a594",
  "#00a2c7",
  "#3e63dd",
  "#8e4ec6",
  "#d6409f",
  "#ffffff",
  "#8b8d98",
  "#1c2024",
];

const HUE_STOPS = [
  "#ff0000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
  "#ff0000",
] as const;

interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export const hsvToHex = ({ h, s, v }: Hsv): string => {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  return `#${[f(5), f(3), f(1)]
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

export const hexToHsv = (hex: string): Hsv => {
  const clean = asHex(hex)?.slice(1) ?? "ff0000";
  const r = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const g = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const b = Number.parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
};

/** A drag that reports positions within its own box, from the first touch. */
const useDrag = (onPoint: (x: number, y: number) => void) => {
  const handler = useRef(onPoint);
  handler.current = onPoint;
  const origin = useRef({ x: 0, y: 0 });

  return useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        origin.current = {
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
        };
        handler.current(origin.current.x, origin.current.y);
      },
      onPanResponderMove: (_event, gesture) =>
        handler.current(
          origin.current.x + gesture.dx,
          origin.current.y + gesture.dy,
        ),
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;
};

export const ColorPicker = ({
  onChange,
  value,
}: {
  onChange: (hex: string) => void;
  value: string;
}) => {
  const theme = useAppTheme();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [draft, setDraft] = useState(asHex(value) ?? "#ff0000");
  const [size, setSize] = useState({ height: PLANE_HEIGHT, width: 0 });
  const lastEmitted = useRef(asHex(value));

  // A value from outside (a preset, a reset) re-seeds; our own echo does not,
  // or the hue would snap whenever saturation reaches zero.
  useEffect(() => {
    const hex = asHex(value);
    if (!hex || hex === lastEmitted.current) return;
    lastEmitted.current = hex;
    setHsv(hexToHsv(hex));
    setDraft(hex);
  }, [value]);

  const emit = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    lastEmitted.current = hex;
    setDraft(hex);
    onChange(hex);
  };

  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const plane = useDrag((x, y) => {
    const { height, width } = sizeRef.current;
    if (!width) return;
    emit({
      ...hsvRef.current,
      s: clamp01(x / width),
      v: clamp01(1 - y / height),
    });
  });

  const hue = useDrag((x) => {
    const { width } = sizeRef.current;
    if (!width) return;
    emit({ ...hsvRef.current, h: clamp01(x / width) * 359.9 });
  });

  const commitDraft = (text: string) => {
    const withHash = text.startsWith("#") ? text : `#${text}`;
    setDraft(withHash);
    const hex = asHex(withHash);
    if (hex && /^#[0-9a-f]{6}$/i.test(withHash)) {
      lastEmitted.current = hex;
      setHsv(hexToHsv(hex));
      onChange(hex);
    }
  };

  const pure = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const current = hsvToHex(hsv);

  return (
    <View style={styles.root}>
      <View
        onLayout={(event: LayoutChangeEvent) =>
          setSize({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
          })
        }
        style={[styles.plane, { backgroundColor: pure }]}
        {...plane.panHandlers}
      >
        <LinearGradient
          colors={["#ffffff", "rgba(255,255,255,0)"]}
          end={{ x: 1, y: 0.5 }}
          pointerEvents="none"
          start={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "#000000"]}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              backgroundColor: current,
              left: hsv.s * size.width - THUMB / 2,
              top: (1 - hsv.v) * size.height - THUMB / 2,
            },
          ]}
        />
      </View>

      <View style={styles.hue} {...hue.panHandlers}>
        <LinearGradient
          colors={HUE_STOPS}
          end={{ x: 1, y: 0.5 }}
          pointerEvents="none"
          start={{ x: 0, y: 0.5 }}
          style={[StyleSheet.absoluteFill, styles.hueTrack]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            styles.hueThumb,
            {
              backgroundColor: pure,
              left: (hsv.h / 360) * size.width - THUMB / 2,
            },
          ]}
        />
      </View>

      <View style={styles.hexRow}>
        <View style={[styles.preview, { backgroundColor: current }]} />
        <Text style={[styles.hexLabel, { color: theme.textGray }]}>Hex</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={7}
          onChangeText={commitDraft}
          placeholder="#ff0000"
          placeholderTextColor={theme.textGray}
          style={[
            styles.hexInput,
            {
              backgroundColor: theme.glass.field,
              borderColor: theme.material.edge,
              color: theme.text,
            },
          ]}
          value={draft}
        />
      </View>

      <View style={styles.presets}>
        {PRESETS.map((preset) => {
          const selected = preset === current;
          return (
            <Pressable
              accessibilityLabel={`Color ${preset}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              hitSlop={4}
              key={preset}
              onPress={() => {
                lastEmitted.current = preset;
                setHsv(hexToHsv(preset));
                setDraft(preset);
                onChange(preset);
              }}
              style={styles.presetCell}
            >
              <View
                style={[
                  styles.presetRing,
                  { borderColor: selected ? theme.text : "transparent" },
                ]}
              >
                <View
                  style={[
                    styles.preset,
                    {
                      backgroundColor: preset,
                      borderColor: theme.material.edge,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hexInput: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    fontSize: fontSize.body,
    fontVariant: ["tabular-nums"],
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.sm,
  },
  hexLabel: { fontSize: fontSize.label, fontWeight: "600" },
  hexRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  hue: { height: THUMB + 4, justifyContent: "center" },
  hueThumb: { top: 2 },
  hueTrack: {
    borderRadius: HUE_HEIGHT / 2,
    bottom: (THUMB + 4 - HUE_HEIGHT) / 2,
    top: (THUMB + 4 - HUE_HEIGHT) / 2,
  },
  plane: {
    borderRadius: radius.md,
    height: PLANE_HEIGHT,
    overflow: "hidden",
  },
  preset: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 26,
    width: 26,
  },
  /** Six to a row, so twelve presets make two even rows at any width. */
  presetCell: { alignItems: "center", width: `${100 / 6}%` },
  presetRing: { borderRadius: radius.full, borderWidth: 2, padding: 2 },
  presets: { flexDirection: "row", flexWrap: "wrap", rowGap: space.sm },
  preview: {
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: radius.full,
    borderWidth: 2,
    height: 30,
    width: 30,
  },
  root: { gap: space.md },
  thumb: {
    borderColor: "#ffffff",
    borderRadius: THUMB / 2,
    borderWidth: 3,
    elevation: 3,
    height: THUMB,
    position: "absolute",
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 3,
    width: THUMB,
  },
});
