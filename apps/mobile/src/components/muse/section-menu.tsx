import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withAlpha } from "@/lib/color";
import type { MuseLook } from "@/lib/muse-appearance";
import { border, radius, space, useAppTheme } from "@/theme";

/**
 * The sections of a character's profile, and where the reader is.
 *
 * Web's `SideMenu` — a column beside the card on a desktop, a row under it on
 * a phone — with `MenuHighlight`, the pill that glides between sections rather
 * than each button flipping its own background. On this client it stands in
 * for the bottom tab bar, which the muse screen hides: a character's page is a
 * place you go *into*, and the bar it replaces was six unrelated destinations
 * under a portrait.
 *
 * ## Five tabs, three of them groups
 *
 * Eight sections across a 375pt bar was too crowded, so the bar carries web's
 * phone grouping (option 3 of the menu study): Card, About (Info · Story ·
 * Canon), Social (Posts · Peers), Gallery and More. A group's sections are
 * switched inside the card, under the name (`section-switcher.tsx`); the bar
 * itself keeps its old look — the same sizes, pill and uppercase labels —
 * and a group reopens on the section last read in it. The sizes are web's
 * own steps at <=380, <=420 and <=600px (`tierFor`).
 *
 * ## The highlight is measured once, not per button
 *
 * The row divides its width evenly, so the pill's position is
 * `index × (slot + gap)` and only the row has to be measured. That keeps the
 * travel a single native-driven `translateX` — the pill is mid-flight exactly
 * when the section behind it is mounting, which is when the JS thread is
 * busiest.
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
  | "HEADCANONS"
  | "POSTS"
  | "PEERS"
  | "GALLERY"
  | "MORE";

export type MuseGroupKey = "CARD" | "ABOUT" | "SOCIAL" | "GALLERY" | "MORE";

type Icon = keyof typeof Ionicons.glyphMap;

export type MenuGroup = {
  icon: Icon;
  key: MuseGroupKey;
  label: string;
  sections: MuseSection[];
};

/** Web's `MENU_GROUPS`, in web's order. */
export const MENU_GROUPS: MenuGroup[] = [
  { icon: "image-outline", key: "CARD", label: "Card", sections: ["CARD"] },
  {
    icon: "id-card-outline",
    key: "ABOUT",
    label: "About",
    sections: ["INFO", "STORY", "HEADCANONS"],
  },
  {
    icon: "chatbubbles-outline",
    key: "SOCIAL",
    label: "Social",
    sections: ["POSTS", "PEERS"],
  },
  {
    icon: "images-outline",
    key: "GALLERY",
    label: "Gallery",
    sections: ["GALLERY"],
  },
  { icon: "ellipsis-vertical", key: "MORE", label: "More", sections: ["MORE"] },
];

/** Each section's name and icon, as the in-card switcher shows them. */
export const SECTION_LABEL: Record<MuseSection, string> = {
  CARD: "Card",
  GALLERY: "Gallery",
  HEADCANONS: "Canon",
  INFO: "Info",
  MORE: "More",
  PEERS: "Peers",
  POSTS: "Posts",
  STORY: "Story",
};

export const SECTION_ICON: Record<MuseSection, Icon> = {
  CARD: "image-outline",
  GALLERY: "images-outline",
  HEADCANONS: "bulb-outline",
  INFO: "information-circle-outline",
  MORE: "ellipsis-vertical",
  PEERS: "people-outline",
  POSTS: "chatbubbles-outline",
  STORY: "book-outline",
};

export const groupOf = (section: MuseSection): MenuGroup =>
  MENU_GROUPS.find((g) => g.sections.includes(section)) ?? MENU_GROUPS[0];

/** Web's `SideMenu`, `MenuButton`, `MenuButtonIcon` and `MenuText` steps. */
const tierFor = (width: number) =>
  width <= 380
    ? {
        box: 16,
        gap: 2,
        icon: 18,
        inner: 2,
        label: 6.4,
        pad: 6,
        padX: 6,
        padTop: 6,
        padBottom: 4,
        tracking: 0.08,
      }
    : width <= 420
      ? {
          box: 19,
          gap: 3,
          icon: 20,
          inner: 3,
          label: 7.36,
          pad: 7,
          padX: 8,
          padTop: 7,
          padBottom: 5,
          tracking: 0.09,
        }
      : {
          box: 24,
          gap: 4,
          icon: 20,
          inner: 4,
          label: 8,
          pad: 8,
          padX: 10,
          padTop: 8,
          padBottom: 6,
          tracking: 0.1,
        };

export const SectionMenu = ({
  look,
  onChange,
  section,
}: {
  look: MuseLook;
  /** A group was chosen; the screen opens its last-read section. */
  onChange: (group: MuseGroupKey) => void;
  section: MuseSection;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const tier = tierFor(useWindowDimensions().width);
  const [slot, setSlot] = useState(0);

  const current = groupOf(section).key;
  const index = Math.max(
    0,
    MENU_GROUPS.findIndex((item) => item.key === current),
  );
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
    const width =
      event.nativeEvent.layout.width -
      tier.pad * 2 -
      tier.gap * (MENU_GROUPS.length - 1);
    const next = width / MENU_GROUPS.length;
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
          { gap: tier.gap, padding: tier.pad },
          chrome
            ? {
                backgroundColor: look.menuBackground ?? "rgba(10, 10, 14, 0.7)",
                borderColor: "rgba(255,255,255,0.16)",
                borderWidth: border.edge,
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
                bottom: tier.pad,
                left: tier.pad,
                shadowColor: accent,
                top: tier.pad,
                transform: [
                  {
                    translateX: Animated.multiply(position, slot + tier.gap),
                  },
                ],
                width: slot,
              },
            ]}
          >
            {/* Web's `::before` — the accent bar along the bar's foot. */}
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor: withAlpha(accent, 0.9),
                  bottom: -tier.pad,
                },
              ]}
            />
          </Animated.View>
        ) : null}

        {MENU_GROUPS.map((item) => {
          const selected = item.key === current;
          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => onChange(item.key)}
              style={[
                styles.item,
                {
                  gap: tier.inner,
                  paddingBottom: tier.padBottom,
                  paddingHorizontal: tier.padX,
                  paddingTop: tier.padTop,
                },
              ]}
            >
              <View
                style={[
                  styles.icon,
                  {
                    height: tier.box,
                    transform: [{ scale: selected ? 1.12 : 1 }],
                  },
                ]}
              >
                <Ionicons
                  color={selected ? activeText : restText}
                  name={item.icon}
                  size={tier.icon}
                />
              </View>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: selected ? activeText : restText,
                    fontSize: tier.label,
                    letterSpacing: tier.label * tier.tracking,
                  },
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
    position: "relative",
  },
  highlight: {
    borderRadius: 10,
    position: "absolute",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  host: {
    paddingHorizontal: space.sm,
    paddingTop: space.m,
  },
  icon: { alignItems: "center", justifyContent: "center" },
  indicator: {
    alignSelf: "center",
    borderRadius: radius.full,
    height: 3,
    position: "absolute",
    width: "55%",
  },
  item: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  label: { fontWeight: "700", textTransform: "uppercase" },
});
