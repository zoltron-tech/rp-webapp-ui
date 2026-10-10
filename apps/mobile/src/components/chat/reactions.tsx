import { reactionGlyph, reactionLabel } from "@nw/chat";
import type { Message, Reaction } from "@nw/types";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The reactions on a message.
 *
 * ## Grouped, counted, and yours is marked
 *
 * Six people sending the same heart is one chip reading "❤️ 6", not six hearts
 * eating the width of the bubble. The chip carrying *your* reaction is drawn in
 * the accent with a filled border, because the question a reaction row has to
 * answer at a glance is "did I already say something here" — and the server
 * keeps one reaction per person per message, so the answer is always a single
 * chip.
 *
 * ## They float on the bubble's edge
 *
 * Not stacked inside it. Reactions are an annotation, not part of the message,
 * and every messaging app worth copying hangs them off the bottom corner where
 * they overlap the bubble slightly. Inside the bubble they widen it, which is
 * how a two-word message ends up as wide as a paragraph.
 *
 * The corner follows the sender: yours hang off the left of your own bubbles
 * and the right of theirs, so a chip never sits under the avatar or off the
 * edge of the screen.
 *
 * ## Arriving
 *
 * A reaction that lands while you are looking pops in — scale from nothing,
 * settling with a small overshoot. It is the only motion in the thread that is
 * not a message, which is exactly why it is worth having: something happened,
 * and it was not a new message. Chips already on screen when the thread loads
 * do not animate; only ones that appear afterwards.
 */

export interface ReactionGroup {
  /** The stored value — a key like `laugh`, which is what gets sent back. */
  key: string;
  /** What to draw for it. */
  glyph: string;
  /** The human name, for accessibility and the reactors sheet. */
  label: string;
  count: number;
  /** True when one of the reactors is the person using the app. */
  mine: boolean;
  /** Display names, for the "who reacted" sheet. */
  names: string[];
}

/**
 * Reactions grouped by emoji, most-reacted first.
 *
 * Exported because the bubble needs the same grouping to decide whether to
 * render anything at all, and computing it twice with two subtly different
 * definitions of "mine" is exactly the sort of thing that goes unnoticed.
 */
export const groupReactions = (
  reactions: Reaction[] | undefined,
  myUsername: string | undefined,
): ReactionGroup[] => {
  if (!reactions?.length) return [];

  const groups = new Map<string, ReactionGroup>();
  for (const reaction of reactions) {
    // Keyed on the stored value rather than the drawn one, so `haha` and
    // `laugh` — the same reaction under two names — do not become two chips.
    const existing = groups.get(reaction.reaction) ?? {
      count: 0,
      glyph: reactionGlyph(reaction.reaction),
      key: reaction.reaction,
      label: reactionLabel(reaction.reaction),
      mine: false,
      names: [],
    };
    existing.count += 1;
    // By username, not by sender id: a reaction sent as a muse carries the
    // muse's id, and an id comparison would file your own in-character
    // reactions as somebody else's.
    if (myUsername && reaction.sender?.username === myUsername) {
      existing.mine = true;
    }
    existing.names.push(
      reaction.sender?.name || reaction.sender?.username || "Someone",
    );
    groups.set(reaction.reaction, existing);
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
};

const Chip = ({
  group,
  onPress,
}: {
  group: ReactionGroup;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;

  // Keyed on the count so a second person joining an existing reaction pops it
  // too — otherwise "❤️ 1" becoming "❤️ 2" is a silent character change.
  const previousCount = useRef(group.count);
  useEffect(() => {
    if (previousCount.current === group.count) return;
    previousCount.current = group.count;
    scale.setValue(0.4);
    Animated.spring(scale, {
      bounciness: 12,
      speed: 18,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [group.count, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityHint="Opens who reacted"
        accessibilityLabel={`${group.label}, ${group.count}`}
        accessibilityRole="button"
        accessibilityState={{ selected: group.mine }}
        // A long press does the same, so holding a chip is not a dead gesture.
        onLongPress={onPress}
        onPress={onPress}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: group.mine
              ? theme.accent.tint
              : theme.material.fillPressed,
            borderColor: group.mine
              ? theme.accent.solid
              : theme.material.edge,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={styles.glyph}>{group.glyph}</Text>
        {group.count > 1 ? (
          <Text
            style={[
              styles.count,
              { color: group.mine ? theme.accent.text : theme.textGray },
            ]}
          >
            {group.count}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

export const ReactionRow = ({
  groups,
  message,
  mine,
  onShowReactors,
}: {
  groups: ReactionGroup[];
  message: Message;
  /** Whose message this is — decides which corner the chips hang off. */
  mine: boolean;
  onShowReactors: (groups: ReactionGroup[], message: Message) => void;
}) => {
  if (groups.length === 0) return null;

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      {groups.map((group) => (
        <Chip
          group={group}
          key={group.key}
          // Tapping a chip opens who reacted. Taking your own reaction back
          // happens in that sheet, on your row — a chip that removed on tap
          // left no way to read the list of a reaction you had joined.
          onPress={() => onShowReactors(groups, message)}
        />
      ))}
    </View>
  );
};

/** The `marginTop` a bubble needs so the floating chips do not overlap text. */
export const REACTION_OVERHANG = 10;

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: space.s,
    paddingVertical: space.xxs,
  },
  count: { fontSize: fontSize.meta, fontWeight: "700" },
  glyph: { fontSize: fontSize.body },
  row: {
    bottom: -REACTION_OVERHANG,
    flexDirection: "row",
    gap: 3,
    position: "absolute",
  },
  // Hung off the inner corner of each bubble: away from the screen edge on
  // yours, away from the avatar on theirs.
  rowMine: { left: space.sm },
  rowTheirs: { right: space.sm },
});

/** A memo-friendly emptiness check, so a bubble can skip the row entirely. */
export const useReactionGroups = (
  reactions: Reaction[] | undefined,
  myUsername: string | undefined,
): ReactionGroup[] =>
  useMemo(() => groupReactions(reactions, myUsername), [myUsername, reactions]);
