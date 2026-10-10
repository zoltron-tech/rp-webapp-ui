import { Ionicons } from "@expo/vector-icons";
import type { MuseNavItem } from "@nw/types";
import { hasUsableCrop } from "@nw/utils";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { Image } from "@/components/image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { CroppedImage } from "@/components/cropped-image";
import { asHex, withAlpha } from "@/lib/color";
import { border, space } from "@/theme";

/**
 * Previous and next character — web's mobile `MuseNavTab` pair.
 *
 * Slim tabs docked to the screen edges at the card's mid-height: the
 * neighbour's portrait behind a dark veil, a chevron pointing the way, and
 * their first name running down the tab. Web's numbers throughout: 36 × 118,
 * a 22pt chevron disc, the name at 0.58rem uppercase with wide tracking. The
 * desktop "peek" cards that slide out on hover have no touch equivalent and
 * are not attempted; a tab is a tap.
 *
 * ## The name runs vertically
 *
 * Web writes it with `writing-mode: vertical-rl`, which React Native does not
 * have. The text is laid out horizontally in a box the length of the tab's
 * usable height and rotated a quarter turn; the box it sits in is the
 * *rotated* size, so the tab's column lays out as if the name were a narrow
 * vertical strip, which after rotation it is.
 *
 * ## The portrait is the card's
 *
 * The same fallback chain as the main card — the card background with its
 * stored crop when the muse uses its extra images, otherwise the main image —
 * so the strip of face showing through the veil is the one the card would show.
 */

export const NAV_TAB_WIDTH = 36;
export const NAV_TAB_HEIGHT = 118;

/** Web's `MuseNavTabName`: `max-height: 64px`, which after rotation is a width. */
const NAME_LENGTH = 64;
const NAME_THICKNESS = 12;

export const MuseNavTabs = ({
  busy,
  next,
  onSelect,
  prev,
}: {
  busy: boolean;
  next: MuseNavItem | null;
  onSelect: (target: MuseNavItem) => void;
  prev: MuseNavItem | null;
}) => (
  <>
    {prev ? (
      <NavTab
        disabled={busy}
        item={prev}
        onPress={() => onSelect(prev)}
        side="left"
      />
    ) : null}
    {next ? (
      <NavTab
        disabled={busy}
        item={next}
        onPress={() => onSelect(next)}
        side="right"
      />
    ) : null}
  </>
);

/** Web's `navCardVisual`: the card image and its crop, or the main image. */
const portraitOf = (item: MuseNavItem) => {
  const extra = item.useExtraImages && item.cardBackground?.src;
  const src = extra ? item.cardBackground?.src : item.image;
  const crop =
    extra && hasUsableCrop(item.cardBackground?.crop)
      ? item.cardBackground?.crop
      : null;
  return {
    crop,
    uri: wsrvImage(src ?? null, IMAGE_SIZES.CARD_BG_MINI),
  };
};

const NavTab = ({
  disabled,
  item,
  onPress,
  side,
}: {
  disabled: boolean;
  item: MuseNavItem;
  onPress: () => void;
  side: "left" | "right";
}) => {
  const accent = item.useAccent ? asHex(item.accent) : undefined;
  const portrait = portraitOf(item);
  const left = side === "left";

  return (
    <Pressable
      accessibilityLabel={`${left ? "Previous" : "Next"} character: ${item.firstName}`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={{ bottom: space.sm, top: space.sm }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        left ? styles.tabLeft : styles.tabRight,
        {
          opacity: disabled ? 0.7 : 1,
          shadowColor: accent ?? "#000000",
          transform: [{ scale: pressed && !disabled ? 0.94 : 1 }],
        },
      ]}
    >
      {portrait.uri ? (
        portrait.crop ? (
          <CroppedImage
            crop={portrait.crop}
            style={styles.fill}
            uri={portrait.uri}
          />
        ) : (
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            contentPosition="top center"
            recyclingKey={portrait.uri}
            source={{ uri: portrait.uri }}
            style={styles.fill}
            transition={0}
          />
        )
      ) : null}

      {/* Web's `MuseNavTabVeil`: darker toward the screen edge. */}
      <LinearGradient
        colors={
          left
            ? ["rgba(6,6,10,0.35)", "rgba(6,6,10,0.75)"]
            : ["rgba(6,6,10,0.75)", "rgba(6,6,10,0.35)"]
        }
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.chevron,
            {
              backgroundColor: accent
                ? withAlpha(accent, 0.7)
                : "rgba(0,0,0,0.55)",
            },
          ]}
        >
          <Ionicons
            color="#ffffff"
            name={left ? "chevron-back" : "chevron-forward"}
            size={14}
          />
        </View>

        {/* The strip the rotated name occupies, and the name inside it. */}
        <View style={styles.nameSlot}>
          <View
            style={[
              styles.nameBox,
              { transform: [{ rotate: left ? "-90deg" : "90deg" }] },
            ]}
          >
            <Text numberOfLines={1} style={styles.name}>
              {item.firstName}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chevron: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 11,
    borderWidth: border.edge,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  content: {
    alignItems: "center",
    flex: 1,
    gap: space.sm,
    justifyContent: "center",
    paddingVertical: space.sm,
  },
  fill: { height: "100%", width: "100%" },
  name: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 9.5,
    fontWeight: "600",
    letterSpacing: 1.2,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 5,
    textTransform: "uppercase",
  },
  nameBox: {
    alignItems: "center",
    height: NAME_THICKNESS,
    justifyContent: "center",
    left: (NAME_THICKNESS - NAME_LENGTH) / 2,
    position: "absolute",
    top: (NAME_LENGTH - NAME_THICKNESS) / 2,
    width: NAME_LENGTH,
  },
  nameSlot: { height: NAME_LENGTH, width: NAME_THICKNESS },
  tab: {
    backgroundColor: "rgba(10, 10, 14, 0.7)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: border.edge,
    elevation: 8,
    height: NAV_TAB_HEIGHT,
    marginTop: -NAV_TAB_HEIGHT / 2,
    overflow: "hidden",
    position: "absolute",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    top: "50%",
    width: NAV_TAB_WIDTH,
    zIndex: 5,
  },
  tabLeft: {
    borderBottomRightRadius: 12,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
    left: 0,
  },
  tabRight: {
    borderBottomLeftRadius: 12,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    right: 0,
  },
});
