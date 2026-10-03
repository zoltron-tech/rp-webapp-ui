import { reactionGlyph, reactionLabel } from "@nw/chat";
import type { Message, Reaction } from "@nw/types";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { radius, space, useAppTheme } from "@/theme";

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
  onLongPress,
  onPress,
}: {
  group: ReactionGroup;
  onLongPress: () => void;
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
        accessibilityHint="Reacts with this, or opens who reacted"
        accessibilityLabel={`${group.label}, ${group.count}`}
        accessibilityRole="button"
        onLongPress={onLongPress}
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
  onReact,
  onShowReactors,
}: {
  groups: ReactionGroup[];
  message: Message;
  /** Whose message this is — decides which corner the chips hang off. */
  mine: boolean;
  onReact?: (message: Message, reaction: string) => void;
  onShowReactors: (groups: ReactionGroup[]) => void;
}) => {
  if (groups.length === 0) return null;

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      {groups.map((group) => (
        <Chip
          group={group}
          key={group.key}
          onLongPress={() => onShowReactors(groups)}
          // Tapping a chip reacts with it. The server keeps one reaction per
          // person, so this replaces yours rather than adding a second — which
          // makes the chips a one-tap way to agree with somebody.
          onPress={() => onReact?.(message, group.key)}
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
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: space.xs + 2,
    paddingVertical: 2,
  },
  count: { fontSize: 10, fontWeight: "800" },
  glyph: { fontSize: 12 },
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
