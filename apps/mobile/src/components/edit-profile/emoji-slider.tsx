import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  type ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CUSTOM_EMOJI_SET } from "@/components/note-emoji";
import { withAlpha } from "@/lib/color";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The note emoji, in a row that says it scrolls.
 *
 * A horizontal list whose last visible item happens to end flush with the
 * edge reads as the whole set — seven emoji, done — and the other twenty-seven
 * are never found. So the row says it five ways, each cheap on its own:
 *
 *  - **A peek.** The gap is sized from the row's width so the last visible
 *    emoji is always cut roughly in half, whatever the phone.
 *  - **Edge fades with arrows**, on whichever side has more to show.
 *  - **A track** under the row, its thumb as wide as the share on screen.
 *  - **A hint** by the label — the count and "Swipe for more", with an arrow
 *    that drifts until the row is first touched.
 *  - **A nudge** the first time the sheet opens in a session: the row slides a
 *    little and settles back, the way iOS teaches a swipeable cell.
 *
 * With an emoji already chosen, the row opens scrolled to it instead.
 */

const ITEM = 46;
const MIN_GAP = 8;
/** How much of the last visible emoji shows at the edge. */
const PEEK = 0.55;
const TRACK = 72;
const FADE = 40;

/** Once per app session; the lesson does not need repeating every open. */
let nudged = false;

export const EmojiSlider = ({
  onChange,
  value,
  visible,
}: {
  onChange: (key: string | null) => void;
  value: string | null;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const scroll = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const offset = useRef(0);

  const [width, setWidth] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [touched, setTouched] = useState(false);

  // Whole items plus gaps, then a part of one more, fill the row exactly.
  const perView =
    width > 0
      ? Math.max(1, Math.floor((width - PEEK * ITEM) / (ITEM + MIN_GAP)))
      : 6;
  const gap = width > 0 ? (width - (perView + PEEK) * ITEM) / perView : MIN_GAP;
  const step = ITEM + gap;
  const contentWidth =
    CUSTOM_EMOJI_SET.length * ITEM + (CUSTOM_EMOJI_SET.length - 1) * gap;
  const maxOffset = Math.max(0, contentWidth - width);
  const thumb =
    contentWidth > 0 ? Math.max(14, (TRACK * width) / contentWidth) : TRACK;

  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(event.nativeEvent.layout.width);

  const updateEdges = useCallback(
    (x: number) => {
      offset.current = x;
      const start = x <= 4;
      const end = x >= maxOffset - 4;
      setAtStart((current) => (current === start ? current : start));
      setAtEnd((current) => (current === end ? current : end));
    },
    [maxOffset],
  );

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
        updateEdges(event.nativeEvent.contentOffset.x),
      useNativeDriver: true,
    },
  );

  const scrollBy = (pages: number) => {
    const next = Math.min(
      maxOffset,
      Math.max(0, offset.current + pages * step * perView * 0.8),
    );
    scroll.current?.scrollTo({ animated: true, x: next });
    setTouched(true);
  };

  // On open: show the chosen emoji, or teach the swipe once. Only on opening
  // and first measure — re-running on every pick would yank the row around.
  useEffect(() => {
    if (!visible || width === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const index = value
      ? CUSTOM_EMOJI_SET.findIndex((item) => item.key === value)
      : -1;

    if (index > 0) {
      const x = Math.min(
        maxOffset,
        Math.max(0, index * step - width / 2 + ITEM / 2),
      );
      timers.push(
        setTimeout(() => scroll.current?.scrollTo({ animated: true, x }), 250),
      );
    } else if (!nudged) {
      nudged = true;
      timers.push(
        setTimeout(
          () => scroll.current?.scrollTo({ animated: true, x: step * 1.6 }),
          650,
        ),
        setTimeout(
          () => scroll.current?.scrollTo({ animated: true, x: 0 }),
          1150,
        ),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [visible, width > 0]);

  // The hint's arrow drifts right until the row is touched.
  useEffect(() => {
    if (touched) {
      drift.stopAnimation();
      drift.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          toValue: 5,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, touched]);

  const fadeFrom = theme.background;
  const fadeTo = withAlpha(theme.background, 0);
  const selectedLabel = CUSTOM_EMOJI_SET.find(
    (item) => item.key === value,
  )?.label;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.label, { color: theme.textGray }]}>Emoji</Text>
          <View
            style={[styles.count, { backgroundColor: theme.material.fill }]}
          >
            <Text style={[styles.countLabel, { color: theme.textGray }]}>
              {selectedLabel ?? CUSTOM_EMOJI_SET.length}
            </Text>
          </View>
        </View>
        {value ? (
          <Pressable hitSlop={space.sm} onPress={() => onChange(null)}>
            <Text style={[styles.remove, { color: theme.textLink }]}>
              Remove
            </Text>
          </Pressable>
        ) : (
          <View style={styles.hint}>
            <Text style={[styles.hintLabel, { color: theme.accent.text }]}>
              Swipe for more
            </Text>
            <Animated.View style={{ transform: [{ translateX: drift }] }}>
              <Ionicons
                color={theme.accent.text}
                name="arrow-forward"
                size={14}
              />
            </Animated.View>
          </View>
        )}
      </View>

      <View onLayout={onLayout} style={styles.rowWrap}>
        <Animated.ScrollView
          contentContainerStyle={{ gap }}
          decelerationRate="fast"
          horizontal
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          onScrollBeginDrag={() => setTouched(true)}
          ref={scroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          snapToInterval={step}
        >
          {CUSTOM_EMOJI_SET.map((item) => {
            const selected = value === item.key;
            return (
              <Pressable
                accessibilityLabel={
                  selected ? `${item.label}, tap to remove` : item.label
                }
                accessibilityState={{ selected }}
                key={item.key}
                onPress={() => {
                  setTouched(true);
                  onChange(selected ? null : item.key);
                }}
                style={({ pressed }) => [
                  styles.item,
                  {
                    backgroundColor: selected
                      ? theme.accent.tint
                      : pressed
                        ? theme.material.fillPressed
                        : theme.material.fill,
                    borderColor: selected
                      ? theme.accent.solid
                      : theme.material.edge,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  },
                ]}
              >
                <item.Icon size={28} />
              </Pressable>
            );
          })}
        </Animated.ScrollView>

        {!atStart ? (
          <View pointerEvents="box-none" style={[styles.edge, styles.left]}>
            <LinearGradient
              colors={[fadeFrom, fadeTo]}
              end={{ x: 1, y: 0 }}
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Arrow direction="back" onPress={() => scrollBy(-1)} />
          </View>
        ) : null}
        {!atEnd ? (
          <View pointerEvents="box-none" style={[styles.edge, styles.right]}>
            <LinearGradient
              colors={[fadeTo, fadeFrom]}
              end={{ x: 1, y: 0 }}
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Arrow direction="forward" onPress={() => scrollBy(1)} />
          </View>
        ) : null}
      </View>

      <View
        style={[styles.track, { backgroundColor: theme.material.fillPressed }]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: theme.accent.solid,
              transform: [
                {
                  translateX: scrollX.interpolate({
                    extrapolate: "clamp",
                    inputRange: [0, Math.max(1, maxOffset)],
                    outputRange: [0, TRACK - thumb],
                  }),
                },
              ],
              width: thumb,
            },
          ]}
        />
      </View>
    </View>
  );
};

const Arrow = ({
  direction,
  onPress,
}: {
  direction: "back" | "forward";
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={
        direction === "back" ? "Show previous emoji" : "Show more emoji"
      }
      accessibilityRole="button"
      hitSlop={space.xs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.arrow,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons
        color={theme.text}
        name={direction === "back" ? "chevron-back" : "chevron-forward"}
        size={16}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  arrow: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3,
    height: 30,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    width: 30,
  },
  count: {
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  countLabel: { fontSize: 11, fontWeight: "700" },
  edge: {
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: FADE,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: { alignItems: "center", flexDirection: "row", gap: 6 },
  hint: { alignItems: "center", flexDirection: "row", gap: 4 },
  hintLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  item: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: 1,
    height: ITEM,
    justifyContent: "center",
    width: ITEM,
  },
  label: { fontSize: fontSize.label },
  left: { alignItems: "flex-start", left: 0 },
  remove: { fontSize: fontSize.label, fontWeight: "600" },
  right: { alignItems: "flex-end", right: 0 },
  root: { gap: space.sm },
  rowWrap: { height: ITEM + 4, justifyContent: "center" },
  thumb: { borderRadius: radius.full, height: "100%" },
  track: {
    alignSelf: "center",
    borderRadius: radius.full,
    height: 3,
    overflow: "hidden",
    width: TRACK,
  },
});
