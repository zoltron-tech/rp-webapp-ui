import type { NWImage } from "@nw/types";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { useA11ySettings } from "@/lib/a11y-settings";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `PromptComposeTrigger`: your face beside a field that is not a field.
 *
 * It looks like an input and opens the composer when tapped, because a real
 * field at the top of a feed would raise the keyboard over the feed before
 * the composer had a chance to take over the screen. The placeholder rotates
 * through the same prompts web cycles, on the same clock — the one bit of
 * motion on the feed, and it is there to say "this is for you" rather than
 * to decorate.
 *
 * `compact` is the same control under a post — web's comment trigger inside
 * `PromptThreads` — without a card of its own round it: the post is the card.
 */

export const DEFAULT_PLACEHOLDERS = [
  "💬 What's on your mind? IC or OOC!",
  "🎭 Got a starter? Drop it here!",
  "✍️ Say something — in character or not!",
  "📝 Share a thought or start a scene!",
  "🎬 What's your character up to?",
  "💡 Got something to say? IC or OOC!",
  "👋 Jump in! IC, OOC, anything goes!",
  "🌟 Start a story or just chat!",
];

export const COMMENT_PLACEHOLDERS = [
  "💬 Add a comment...",
  "✍️ Reply to this prompt...",
  "🎭 Jump into the scene...",
  "📝 Leave a comment...",
  "👋 Share your thoughts...",
  "💡 React to this prompt...",
  "🌟 Write a reply...",
  "🎬 Respond in character or OOC...",
];

export const COMMENT_OOC_PLACEHOLDERS = [
  "💬 Add an OOC comment...",
  "✍️ Share your OOC thoughts...",
  "💬 Chat about this post...",
  "💡 Leave a note OOC...",
  "👋 Weigh in out of character...",
  "📝 Reply out of character...",
  "🌟 Say something OOC...",
  "🤔 Any OOC thoughts?",
];

/** Web's cadence: a new line every 3.5s, faded over 300ms. */
const ROTATE_MS = 3500;
const FADE_MS = 300;

export const ComposeTrigger = ({
  avatarImage,
  avatarUri,
  compact = false,
  label = "Write a post",
  name,
  onPress,
  placeholders = DEFAULT_PLACEHOLDERS,
}: {
  /** The stored picture with its crop, when the caller has one. */
  avatarImage?: NWImage | null;
  avatarUri?: string | null;
  /** Inside a card: no frame of its own, a smaller face, a shorter field. */
  compact?: boolean;
  /** The accessibility label; the field itself shows only the placeholder. */
  label?: string;
  name?: string | null;
  onPress: () => void;
  placeholders?: string[];
}) => {
  const theme = useAppTheme();
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * placeholders.length),
  );
  const opacity = useRef(new Animated.Value(1)).current;
  const { reduceMotion } = useA11ySettings();

  useEffect(() => {
    // Reduce Motion: one placeholder, no repeating fade.
    if (reduceMotion) return;
    const timer = setInterval(() => {
      Animated.timing(opacity, {
        duration: FADE_MS,
        toValue: 0,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setIndex((current) => (current + 1) % placeholders.length);
        Animated.timing(opacity, {
          duration: FADE_MS,
          toValue: 1,
          useNativeDriver: true,
        }).start();
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [opacity, placeholders.length, reduceMotion]);

  return (
    <Pressable
      accessibilityHint="Opens the composer"
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        compact ? styles.rootCompact : styles.root,
        compact
          ? { opacity: pressed ? 0.7 : 1 }
          : {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
      ]}
    >
      <Avatar
        image={avatarImage}
        name={name}
        size={compact ? 30 : 36}
        uri={avatarUri}
      />
      <View
        style={[
          styles.field,
          compact && styles.fieldCompact,
          {
            backgroundColor: theme.glass.field,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Animated.Text
          numberOfLines={1}
          style={[styles.placeholder, { color: theme.textGray, opacity }]}
        >
          {placeholders[index]}
        </Animated.Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  field: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: space.md,
  },
  fieldCompact: { minHeight: 34, paddingHorizontal: space.sm + 4 },
  placeholder: { fontSize: fontSize.label },
  root: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 2,
    padding: space.sm + 2,
  },
  rootCompact: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
  },
});
