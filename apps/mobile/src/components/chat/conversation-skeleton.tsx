import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { radius, space, useAppTheme } from "@/theme";

/**
 * Ghost rows while the inbox's first page loads.
 *
 * Drawn in the row's own geometry — the 52pt face, the name and the preview
 * line at their real offsets — so the conversations land where the ghosts
 * were rather than beneath a spinner that was somewhere else. Only ever
 * seen on a cold start, since the inbox is not persisted between launches
 * (its previews are decrypted in memory and stay there).
 */

const ROWS = 7;
const AVATAR = 48;

export const ConversationSkeleton = () => {
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
  const tint = { backgroundColor: theme.material.fill };

  return (
    <Animated.View
      accessibilityLabel="Loading conversations"
      pointerEvents="none"
      style={{ opacity }}
    >
      {Array.from({ length: ROWS }).map((_, index) => (
        <View
          // Placeholders have no identity; the index is all there is.
          key={`ghost-row-${index}`}
          style={[styles.row, { borderBottomColor: theme.material.edge }]}
        >
          <View style={[styles.avatar, tint]} />
          <View style={styles.body}>
            <View style={styles.titleRow}>
              {/* Names vary; the ghosts should too, or they read as a grid. */}
              <View
                style={[
                  styles.name,
                  tint,
                  { width: `${38 + (index % 3) * 14}%` },
                ]}
              />
              <View style={[styles.time, tint]} />
            </View>
            <View
              style={[
                styles.preview,
                tint,
                { width: `${52 + ((index * 7) % 4) * 9}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  avatar: { borderRadius: AVATAR / 2, height: AVATAR, width: AVATAR },
  body: { flex: 1, gap: space.sm, minWidth: 0 },
  name: { borderRadius: radius.sm, height: 14 },
  preview: { borderRadius: radius.sm, height: 12 },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  time: { borderRadius: radius.sm, height: 10, width: 44 },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
