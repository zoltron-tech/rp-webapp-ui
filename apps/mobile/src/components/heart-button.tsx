import { Ionicons } from "@expo/vector-icons";
import { pluralize } from "@nw/utils";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * The heart, as web draws it.
 *
 * Shared rather than owned by one feature: a thread post has one and so does
 * every card in an activity feed, and they are the same control reacting to the
 * same endpoint. It sat under `components/thread/` while there was only one
 * caller.
 *
 * Three things were wrong with the first version and all three came from
 * treating it as a chip rather than as a control: it was tinted in the app's
 * accent, so a liked post was jade or crimson depending on a theme preference
 * that has nothing to do with liking; it sat in a bordered pill, which reads as
 * a filter or a tag rather than as something you press; and it did nothing when
 * pressed, so the only feedback was a number changing by one.
 *
 * ## Red is not the accent
 *
 * Web fills the heart with `--tomato-9`, and it is the same value in both
 * themes. That is deliberate: a heart is red everywhere, and painting it in the
 * account's chosen accent makes "liked" and "this app is green" the same
 * signal. `TOMATO` below is that step, copied as a literal because it is the
 * one colour in this app that is not part of the theme — `@nw/theme` publishes
 * accents and neutrals, and tomato is neither.
 *
 * ## The two animations
 *
 * Web keys them off `liked` changing rather than off the press, which is what
 * makes them survive an optimistic update being rolled back — a like the server
 * refuses animates *back*.
 *
 *  - **blink**, on liking: scale 1 → 1.2 → 0.9 → 1. A swell and a settle, which
 *    is the shape of a thing being pressed *into* place.
 *  - **wiggle**, on unliking: rotate 0 → −10° → 10° → −10° → 0. A shake, which
 *    is the shape of a thing being taken back.
 *
 * Both are 500ms `ease-in-out` and both are transforms, so they run on the
 * native driver — the press feedback composes with them on the same node,
 * because a transform array is applied in order and every value in it here is
 * native-driven.
 *
 * ## The count is a sentence
 *
 * Web writes "3 novelists like this" rather than "3", and the sentence is worth
 * keeping: a bare number beside a heart is ambiguous about whether it counts
 * likes or something else, and the plural agreement is already solved by the
 * shared `pluralize`. It is hidden at zero, which is the one departure — web
 * prints "0 novelists like this", and on a phone that is a line of grey saying
 * nothing on the majority of posts.
 */

/** Radix `--tomato-9`. Identical in both themes, which is why it is a constant. */
const TOMATO = "#e54d2e";

/** Web's `blink` and `wiggle`, both `0.5s ease-in-out`. */
const DURATION = 500;

/** Web's `:active { transform: scale(0.92) }`. */
const PRESS_SCALE = 0.92;

type Mode = "idle" | "liked" | "unliked";

export const HeartButton = ({
  compact = false,
  emptyHint,
  liked,
  likes,
  onDark = false,
  onPressCount,
  onToggle,
  size = 22,
}: {
  /**
   * The bare number instead of the sentence.
   *
   * For an action row that has three of these side by side: "3 novelists like
   * this" is worth its width under a post that is on screen alone, and is the
   * whole row on a 375pt feed card. The sentence stays on the accessibility
   * label either way, so nothing is lost to a screen reader.
   */
  compact?: boolean;
  /**
   * What to say at zero, where the sentence would otherwise be hidden — a
   * media viewer's "Be the first to like this". Never a button.
   */
  emptyHint?: string;
  liked: boolean;
  likes: number;
  /**
   * Drawn over a photo or a clip rather than on the theme's surface: the idle
   * heart and the sentence are white, whichever theme is on, because the
   * ground behind them is black in both.
   */
  onDark?: boolean;
  /**
   * Tapping the count. Web opens its `ReactionLikersDialog` from the sentence;
   * when this is given the sentence is a button that says so.
   */
  onPressCount?: () => void;
  onToggle: () => void;
  /** Glyph size. The 30pt box and the hit slop stay the same. */
  size?: number;
}) => {
  const theme = useAppTheme();

  const [mode, setMode] = useState<Mode>("idle");
  const run = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  // Web's `initialRender` guard: a post that arrives already liked must not
  // animate on mount, or every liked post in a thread blinks as it scrolls in.
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setMode(liked ? "liked" : "unliked");
    run.setValue(0);
    Animated.timing(run, {
      duration: DURATION,
      easing: Easing.inOut(Easing.ease),
      toValue: 1,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Back to a plain identity transform, so nothing is left interpolating
      // between two values that are now the same.
      if (finished) setMode("idle");
    });
  }, [liked, run]);

  /*
   * Both transforms are always present and only their output ranges change.
   *
   * A transform array whose *shape* changes between renders is re-created on
   * the native side; keeping scale and rotate in place the whole time means the
   * idle state is two no-op interpolations rather than a different node.
   */
  const scale =
    mode === "liked"
      ? run.interpolate({
          inputRange: [0, 0.5, 0.8, 1],
          outputRange: [1, 1.2, 0.9, 1],
        })
      : run.interpolate({ inputRange: [0, 1], outputRange: [1, 1] });

  const rotate =
    mode === "unliked"
      ? run.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: ["0deg", "-10deg", "10deg", "-10deg", "0deg"],
        })
      : run.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "0deg"] });

  const press = (toValue: number) =>
    Animated.spring(pressScale, {
      speed: 40,
      toValue,
      useNativeDriver: true,
    }).start();

  const sentence =
    likes > 0
      ? `${likes} ${pluralize("novelist", likes)} ${pluralize(
          "like",
          // `pluralize` agrees with a *count*, and the verb agrees the other
          // way round: one novelist likes, several novelists like. Web solves
          // it by handing it 2 when there is one liker, and 1 otherwise.
          likes === 1 ? 2 : 1,
        )} this`
      : null;

  const idle = onDark ? ON_DARK.idle : theme.textGray;
  const muted = onDark ? ON_DARK.text : theme.textGray;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityHint={sentence ?? undefined}
        accessibilityLabel={liked ? "Unlike this" : "Like this"}
        accessibilityRole="button"
        accessibilityState={{ selected: liked }}
        // The glyph is 22pt in a 30pt box; `hitSlop` takes the target past 44
        // without the button reserving a row of its own inside the post.
        hitSlop={space.sm}
        onPress={onToggle}
        onPressIn={() => press(PRESS_SCALE)}
        onPressOut={() => press(1)}
        style={styles.button}
      >
        <Animated.View
          style={{ transform: [{ scale: pressScale }, { scale }, { rotate }] }}
        >
          <Ionicons
            color={liked ? TOMATO : idle}
            name={liked ? "heart" : "heart-outline"}
            size={size}
          />
        </Animated.View>
      </Pressable>

      {sentence ? (
        <Pressable
          accessibilityHint={onPressCount ? "Shows who liked this" : undefined}
          accessibilityLabel={sentence}
          accessibilityRole={onPressCount ? "button" : "text"}
          disabled={!onPressCount}
          hitSlop={space.sm}
          onPress={onPressCount}
          style={({ pressed }) => [
            styles.countButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              compact ? styles.number : styles.count,
              { color: liked && compact ? TOMATO : muted },
            ]}
          >
            {compact ? likes : sentence}
          </Text>
        </Pressable>
      ) : emptyHint && !compact ? (
        <Text
          numberOfLines={1}
          style={[styles.count, styles.hint, { color: muted }]}
        >
          {emptyHint}
        </Text>
      ) : null}
    </View>
  );
};

/** The whites a heart is drawn in over media. */
const ON_DARK = {
  idle: "rgba(255,255,255,0.92)",
  text: "rgba(255,255,255,0.8)",
} as const;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  count: { fontSize: fontSize.caption, fontWeight: "500" },
  // Tall enough to be a target on its own, with the row's height unchanged.
  countButton: { flexShrink: 1, justifyContent: "center", minHeight: 30 },
  hint: { flexShrink: 1, fontStyle: "italic", opacity: 0.75 },
  number: {
    fontSize: fontSize.label,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: space.xs,
  },
});
