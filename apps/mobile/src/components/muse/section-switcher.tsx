import { Ionicons } from "@expo/vector-icons";
import { mixColors } from "@nw/theme";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { EFFECTS, MOTION, timeTo } from "@/animation";
import { Text } from "@/components/text";
import { useA11ySettings } from "@/lib/a11y-settings";
import { withAlpha } from "@/lib/color";
import { fontSize, radius, space } from "@/theme";

/**
 * The switcher between sections that share a menu tab — About is Info · Story
 * · Canon, Social is Posts · Peers — drawn inside the card, under the name.
 *
 * Web's `section-switcher.tsx`. The screen decides what it is and hands it
 * down through `SectionSwitcherContext`; each section draws it in its pinned
 * header through `SectionSwitcherSlot`. Null for a tab with one section, so
 * those draw nothing.
 */
export const SectionSwitcherContext = createContext<ReactNode>(null);

export const SectionSwitcherSlot = () => (
  <>{useContext(SectionSwitcherContext)}</>
);

/**
 * Non-null while the current tab shows a switcher. Info then uses the same
 * mini header as Story and Canon, so switching between them never moves or
 * resizes the top of the card.
 */
export const useSectionSwitcher = () => useContext(SectionSwitcherContext);

export type SwitcherOption = {
  icon: keyof typeof Ionicons.glyphMap;
  key: string;
  label: string;
};

/** The track's rim and inner padding; the pill sits inside both. */
const RIM = 1;
const PAD = 2;

/**
 * A soft pill track with a highlight that slides.
 *
 * Every section draws its own panel, so after a switch this is a fresh
 * element: it mounts with the highlight where the previous section was
 * (`from`) and slides to `active` — the side menu's glide, kept across the
 * remount. One native-driven `translateX`, measured once from the track.
 */
export const SectionSwitcher = ({
  accent,
  active,
  from,
  label,
  onSelect,
  options,
}: {
  accent?: string;
  active: string;
  /** The option showing before this one; the pill starts there. */
  from?: string | null;
  label: string;
  onSelect: (key: string) => void;
  options: SwitcherOption[];
}) => {
  const { reduceMotion } = useA11ySettings();
  const indexOf = (key?: string | null) =>
    Math.max(
      0,
      options.findIndex((o) => o.key === key),
    );
  const target = indexOf(active);
  const start =
    from && options.some((o) => o.key === from) ? indexOf(from) : target;
  const position = useRef(new Animated.Value(start)).current;
  const [slot, setSlot] = useState(0);
  const hue = accent ?? "#ffffff";

  useEffect(() => {
    if (!EFFECTS.sectionSwitcherSlide || reduceMotion) {
      position.setValue(target);
      return;
    }
    const animation = timeTo(position, target, MOTION.slide);
    animation.start();
    return () => animation.stop();
  }, [position, reduceMotion, target]);

  const onLayout = (event: LayoutChangeEvent) => {
    const next =
      (event.nativeEvent.layout.width - (RIM + PAD) * 2) / options.length;
    if (next !== slot) setSlot(next);
  };

  /*
   * The pill is a window, not a tint. Over an accent-washed panel a see-through
   * accent pill vanished into the ground, so the track is a dark recess and
   * the pill a bright paper chip carrying its own copy of the labels in dark
   * ink, slid the other way so they stay exactly over the real ones. Inside
   * the window the words are dark, outside they are white — and mid-slide a
   * label is half of each, never white on white.
   */
  const ink = accent ? mixColors(accent, 0.42, "#0a0a0e") : "#16161c";
  const paper = accent ? mixColors(accent, 0.12, "#ffffff") : "#f4f4f6";
  const offset = Animated.multiply(position, slot);

  const row = (tone: "base" | "window") =>
    options.map((option) => {
      const selected = option.key === active;
      const color = tone === "window" ? ink : "rgba(255,255,255,0.78)";
      const content = (
        <>
          <Ionicons color={color} name={option.icon} size={13} />
          <Text numberOfLines={1} style={[styles.label, { color }]}>
            {option.label}
          </Text>
        </>
      );
      return tone === "window" ? (
        <View key={option.key} style={[styles.option, { width: slot }]}>
          {content}
        </View>
      ) : (
        <Pressable
          accessibilityLabel={option.label}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
          key={option.key}
          onPress={() => {
            if (!selected) onSelect(option.key);
          }}
          style={[styles.option, styles.flex]}
        >
          {content}
        </Pressable>
      );
    });

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="tablist"
      onLayout={onLayout}
      style={styles.track}
    >
      {row("base")}
      {slot > 0 ? (
        <Animated.View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={[
            styles.pill,
            {
              backgroundColor: paper,
              shadowColor: hue,
              transform: [{ translateX: offset }],
              width: slot,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.windowRow,
              {
                transform: [{ translateX: Animated.multiply(offset, -1) }],
                width: slot * options.length,
              },
            ]}
          >
            {row("window")}
          </Animated.View>
          {/* The rim on top, so it does not push the labels inside. */}
          <View
            style={[
              styles.rim,
              { borderColor: accent ? withAlpha(accent, 0.85) : "#ffffff" },
            ]}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  label: { flexShrink: 1, fontSize: fontSize.caption, fontWeight: "700" },
  option: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: space.s,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 0,
    paddingHorizontal: space.xs,
  },
  pill: {
    borderRadius: radius.full,
    // Absolute offsets count from inside the rim, so the padding alone.
    bottom: PAD,
    left: PAD,
    overflow: "hidden",
    position: "absolute",
    // The accent glow round the chip (iOS; Android draws no coloured shadow).
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    top: PAD,
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  /**
   * A dark recess rather than a light film: it reads the same on any
   * character colour and gives the bright pill something to stand out of.
   */
  track: {
    backgroundColor: "rgba(0,0,0,0.42)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.full,
    borderWidth: RIM,
    flexDirection: "row",
    marginBottom: 2,
    marginTop: space.sm,
    padding: PAD,
    width: "100%",
  },
  windowRow: {
    bottom: 0,
    flexDirection: "row",
    left: 0,
    position: "absolute",
    top: 0,
  },
});
