import { Ionicons } from "@expo/vector-icons";
import type { MuseNavItem } from "@nw/types";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { asHex, withAlpha } from "@/lib/color";
import { museName } from "@/lib/muse-appearance";
import { space } from "@/theme";

/**
 * Web's `VerseHeaderBar`: flip between the alternative verses of a character.
 *
 * Verse numbers are circles in a horizontally scrolling row rather than
 * wrapping pills, so a character with many verses stays one compact line
 * instead of eating the height the card needs. A lone "1" when there are no
 * alternates, exactly as web shows it.
 *
 * Web also pins a "+" beside the track for the owner — outside the scroll, so
 * it is always one tap away. Creating a verse is a whole character form, so
 * the owner is sent to it on the web; `onCreate` is that link.
 */
export const VerseBar = ({
  accent,
  busy,
  currentId,
  onCreate,
  onSelect,
  verses,
}: {
  accent?: string;
  /** A switch is in flight; the circles stop accepting taps. */
  busy: boolean;
  currentId: string | null;
  /** Given for the owner; shows the "+". */
  onCreate?: () => void;
  onSelect: (verse: MuseNavItem) => void;
  verses: MuseNavItem[];
}) => {
  const tint = accent ?? "#ffffff";

  return (
    <View accessibilityLabel="Character verses" style={styles.bar}>
      <View style={styles.labelWrap}>
        <View style={[styles.labelRule, { backgroundColor: tint }]} />
        <Ionicons color={tint} name="layers-outline" size={11} />
        <Text style={styles.label}>Verses</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.track}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {verses.length === 0 ? (
          <VerseCircle accent={accent} active disabled number={1} />
        ) : (
          verses.map((verse, index) => {
            const active = verse.id === currentId;
            return (
              <View key={verse.id} style={styles.step}>
                {index > 0 ? (
                  <View
                    style={[
                      styles.link,
                      {
                        backgroundColor: accent
                          ? withAlpha(accent, 0.45)
                          : "rgba(255,255,255,0.22)",
                      },
                    ]}
                  />
                ) : null}
                <VerseCircle
                  accent={verse.useAccent ? asHex(verse.accent) : undefined}
                  active={active}
                  disabled={active || busy}
                  label={`Verse ${verse.verseNumber ?? 1}: ${museName(verse)}`}
                  number={verse.verseNumber ?? 1}
                  onPress={() => onSelect(verse)}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      {onCreate ? (
        <Pressable
          accessibilityLabel="Create a new verse of this character"
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={onCreate}
          style={({ pressed }) => [
            styles.create,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons color="rgba(255,255,255,0.8)" name="add" size={14} />
        </Pressable>
      ) : null}
    </View>
  );
};

/** Web's `VerseCircle`: 28pt, 31pt when it is the one you are on. */
const VerseCircle = ({
  accent,
  active,
  disabled,
  label,
  number,
  onPress,
}: {
  accent?: string;
  active: boolean;
  disabled: boolean;
  label?: string;
  number: number;
  onPress?: () => void;
}) => {
  const size = active ? 31 : 28;
  return (
    <Pressable
      accessibilityLabel={label ?? `Verse ${number}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      hitSlop={space.xs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.circle,
        {
          backgroundColor: active
            ? accent
              ? withAlpha(accent, 0.75)
              : "rgba(255,255,255,0.35)"
            : "rgba(10, 10, 14, 0.55)",
          borderColor: active
            ? "rgba(255,255,255,0.9)"
            : "rgba(255,255,255,0.2)",
          borderRadius: size / 2,
          borderWidth: active ? 2 : 1.5,
          height: size,
          opacity: pressed ? 0.7 : 1,
          width: size,
        },
        active && accent
          ? {
              shadowColor: accent,
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 0.55,
              shadowRadius: 3,
            }
          : null,
      ]}
    >
      <Text style={[styles.number, { fontSize: active ? 12.5 : 11 }]}>
        {number}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm + 2,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    width: "100%",
  },
  circle: { alignItems: "center", justifyContent: "center" },
  create: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 14,
    borderStyle: "dashed",
    borderWidth: 1.5,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
    textTransform: "uppercase",
  },
  labelRule: { borderRadius: 1, height: 12, width: 2 },
  labelWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 5,
  },
  link: { height: 1.5, width: 8 },
  number: { color: "#ffffff", fontWeight: "800" },
  step: { alignItems: "center", flexDirection: "row" },
  track: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 3,
  },
});
