import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withAlpha } from "@/lib/color";
import type { MuseLook } from "@/lib/muse-appearance";
import { radius, space, useAppTheme } from "@/theme";

/**
 * The seven sections of a character's profile, and where the reader is.
 *
 * Web's `SideMenu` — a column beside the card on a desktop, a row under it on
 * a phone — with `MenuHighlight`, the pill that glides between sections rather
 * than each button flipping its own background. On this client it stands in
 * for the bottom tab bar, which the muse screen hides: a character's page is a
 * place you go *into*, and the bar it replaces was six unrelated destinations
 * under a portrait. Same seven entries as web, same order, same labels.
 *
 * ## The highlight is measured once, not per button
 *
 * The row divides its width evenly, so the pill's position is `index × slot`
 * and only the row has to be measured. That keeps the travel a single
 * native-driven `translateX` — the pill is mid-flight exactly when the section
 * behind it is mounting, which is when the JS thread is busiest.
 *
 * ## Appearance overrides
 *
 * The muse can recolour this: `sideMenuBgColor`, `sideMenuTextColor`, and
 * `hideSideMenuBackground` strip the chrome entirely. Each falls back to web's
 * literal when unset, so an untouched muse gets web's `rgba(10, 10, 14, 0.7)`
 * glass rather than the viewer's theme.
 */

export type MuseSection =
  | "CARD"
  | "INFO"
  | "STORY"
  | "POSTS"
  | "PEERS"
  | "GALLERY"
  | "MORE";

export const MUSE_SECTIONS: {
  icon: keyof typeof Ionicons.glyphMap;
  key: MuseSection;
  label: string;
}[] = [
  { icon: "image-outline", key: "CARD", label: "Card" },
  { icon: "information-circle-outline", key: "INFO", label: "Info" },
  { icon: "book-outline", key: "STORY", label: "Story" },
  { icon: "chatbubbles-outline", key: "POSTS", label: "Posts" },
  { icon: "people-outline", key: "PEERS", label: "Peers" },
  { icon: "images-outline", key: "GALLERY", label: "Gallery" },
  { icon: "ellipsis-vertical", key: "MORE", label: "More" },
];

/** Web's `SideMenu` padding at ≤600px: the pill sits `PAD` inside the bar. */
const PAD = 6;

export const SectionMenu = ({
  look,
  onChange,
  section,
}: {
  look: MuseLook;
  onChange: (section: MuseSection) => void;
  section: MuseSection;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [slot, setSlot] = useState(0);

  const index = MUSE_SECTIONS.findIndex((item) => item.key === section);
  const position = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.spring(position, {
      bounciness: 4,
      speed: 16,
      toValue: index,
      useNativeDriver: true,
    }).start();
  }, [index, position]);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width - PAD * 2;
    const next = width / MUSE_SECTIONS.length;
    if (next !== slot) setSlot(next);
  };

  const accent = look.accent ?? theme.accent.solid;
  const chrome = !look.hideSideMenuBackground;
  const restText = look.menuText
    ? withAlpha(look.menuText, 0.7)
    : "rgba(255,255,255,0.6)";
  const activeText = look.menuText ?? "#ffffff";

  return (
    <View
      style={[
        styles.host,
        { paddingBottom: Math.max(insets.bottom, space.sm) },
      ]}
    >
      <View
        accessibilityRole="tablist"
        onLayout={onLayout}
        style={[
          styles.bar,
          chrome
            ? {
                backgroundColor: look.menuBackground ?? "rgba(10, 10, 14, 0.7)",
                borderColor: "rgba(255,255,255,0.16)",
                borderWidth: StyleSheet.hairlineWidth,
              }
            : null,
        ]}
      >
        {slot > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.highlight,
              {
                backgroundColor: withAlpha(accent, 0.3),
                left: PAD,
                shadowColor: accent,
                transform: [{ translateX: Animated.multiply(position, slot) }],
                width: slot,
              },
            ]}
          >
            {/* Web's `::before` — the accent bar along the selected item's foot. */}
            <View
              style={[
                styles.indicator,
                { backgroundColor: withAlpha(accent, 0.9) },
              ]}
            />
          </Animated.View>
        ) : null}

        {MUSE_SECTIONS.map((item) => {
          const selected = item.key === section;
          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => onChange(item.key)}
              style={styles.item}
            >
              <Ionicons
                color={selected ? activeText : restText}
                name={item.icon}
                size={18}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: selected ? activeText : restText },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    padding: PAD,
    position: "relative",
  },
  highlight: {
    borderRadius: 12,
    bottom: PAD,
    position: "absolute",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    top: PAD,
  },
  host: {
    paddingHorizontal: space.sm,
    paddingTop: space.sm,
  },
  indicator: {
    alignSelf: "center",
    borderRadius: radius.full,
    bottom: -1,
    height: 3,
    position: "absolute",
    width: "50%",
  },
  item: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    justifyContent: "center",
    paddingBottom: 5,
    paddingTop: 7,
  },
  label: {
    fontSize: 7.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
