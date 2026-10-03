import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { radius, space, useAppTheme } from "@/theme";

/**
 * Ghost bubbles while a conversation's first page loads.
 *
 * A spinner in the middle of an empty wallpaper says "wait"; a column of
 * bubble-shaped tiles in the places bubbles will appear says "this is a
 * conversation and it is arriving". The second is what every messaging app
 * shows, and it matters most on the *first* open of a thread, which is the
 * only time the page is not already in the cache — after that the messages
 * are on screen before this could mount.
 *
 * Six rows, theirs and ours alternating in a plausible rhythm, breathing
 * together on the native driver. Drawn in the list's own geometry — the same
 * horizontal padding and the same 80% cap — so the real bubbles land where
 * the ghosts were rather than beside them.
 */

/** Width as a share of the row, and side. A shape a chat tends to have. */
const ROWS: { mine: boolean; width: number; lines: 1 | 2 }[] = [
  { lines: 1, mine: false, width: 0.42 },
  { lines: 2, mine: false, width: 0.66 },
  { lines: 1, mine: true, width: 0.36 },
  { lines: 2, mine: true, width: 0.58 },
  { lines: 1, mine: false, width: 0.5 },
  { lines: 1, mine: true, width: 0.3 },
];

const LINE = 14;
const PAD = space.sm + 2;
const AVATAR = 28;

export const MessageSkeleton = () => {
  const theme = useAppTheme();
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          duration: 700,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          duration: 700,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const opacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.9],
  });

  return (
    <Animated.View
      accessibilityLabel="Loading messages"
      pointerEvents="none"
      style={[styles.column, { opacity }]}
    >
      {ROWS.map((row, index) => (
        <View
          // Placeholders have no identity; the index is all there is.
          key={`ghost-${index}`}
          style={[styles.row, row.mine ? styles.rowMine : styles.rowTheirs]}
        >
          {row.mine ? null : (
            <View
              style={[styles.avatar, { backgroundColor: theme.material.fillPressed }]}
            />
          )}
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: row.mine
                  ? theme.accent.surface
                  : theme.material.fillPressed,
                height: PAD * 2 + LINE * row.lines + (row.lines - 1) * 4,
                width: `${Math.round(row.width * 100)}%`,
              },
            ]}
          />
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  avatar: { borderRadius: AVATAR / 2, height: AVATAR, width: AVATAR },
  bubble: { borderRadius: radius.lg, maxWidth: "80%" },
  column: { gap: space.sm, paddingVertical: space.md },
  row: { alignItems: "flex-end", flexDirection: "row", gap: space.xs + 2 },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
});
