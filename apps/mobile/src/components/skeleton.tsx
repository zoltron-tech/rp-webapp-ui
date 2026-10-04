import { type ReactNode, useEffect, useMemo } from "react";
import {
  Animated,
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { border, radius, space, useAppTheme } from "@/theme";

/**
 * Ghosts of what is on its way.
 *
 * A skeleton is drawn in the geometry of the thing it stands in for — the same
 * face, the same card frame, the same gaps — so content lands where its ghost
 * was instead of arriving beneath a spinner somewhere else and shoving the page
 * about. `conversation-skeleton.tsx` was the first of these; this is the shared
 * version of its breathing.
 *
 * ## One clock for every ghost
 *
 * A screen of ghost cards is a dozen or more blocks. Giving each its own
 * `Animated.loop` would be a dozen native animations doing the same thing out
 * of step. Instead there is one value for the whole app, started when the
 * first skeleton mounts and stopped when the last one goes, and every
 * `SkeletonPulse` reads it — native-driven, so none of it touches the JS
 * thread while real content is being rendered beside it. Blocks inside a pulse
 * are plain views; only the pulse's opacity moves.
 */

const PULSE_MS = 700;

const clock = new Animated.Value(0);
let users = 0;
let loop: Animated.CompositeAnimation | null = null;

const acquire = () => {
  users += 1;
  if (users > 1) return;
  loop = Animated.loop(
    Animated.sequence([
      Animated.timing(clock, {
        duration: PULSE_MS,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(clock, {
        duration: PULSE_MS,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]),
  );
  loop.start();
};

const release = () => {
  users = Math.max(0, users - 1);
  if (users > 0) return;
  loop?.stop();
  loop = null;
};

const opacity = clock.interpolate({
  inputRange: [0, 1],
  outputRange: [0.45, 0.9],
});

/** Breathes whatever ghosts it holds, on the app's one skeleton clock. */
export const SkeletonPulse = ({
  children,
  label = "Loading",
  style,
}: {
  children: ReactNode;
  /** Read out instead of the ghosts, which are meaningless to a screen reader. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}) => {
  useEffect(() => {
    acquire();
    return release;
  }, []);

  return (
    <Animated.View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      pointerEvents="none"
      style={[style, { opacity }]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * One ghost block — a line of text, a face, a picture.
 *
 * `on` is what it is drawn over: a card's surface needs a step darker than the
 * card to be seen, the page's background needs the card surface itself.
 */
export const Bone = ({
  circle,
  height,
  on = "card",
  radius: r,
  style,
  width = "100%",
}: {
  /** A face: `height` wide and fully round. */
  circle?: boolean;
  height: number;
  on?: "card" | "page";
  radius?: number;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
}) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor:
            on === "card" ? theme.material.fillPressed : theme.material.fill,
          borderRadius: circle ? height / 2 : (r ?? radius.sm),
          height,
          width: circle ? height : width,
        },
        style,
      ]}
    />
  );
};

/** The frame every feed card shares — `prompt-card.tsx` and `activity/box.tsx`. */
const CardFrame = ({ children }: { children: ReactNode }) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        theme.material.card,
      ]}
    >
      {children}
    </View>
  );
};

/** Face, name and the meta line under it — the head of every feed card. */
const CardHeader = ({ metaWidth }: { metaWidth: DimensionValue }) => (
  <View style={styles.header}>
    <Bone circle height={44} />
    <View style={styles.identity}>
      <Bone height={14} width="45%" />
      <Bone height={10} width={metaWidth} />
    </View>
  </View>
);

/**
 * A prompt card: head, a few lines of body, the action row and the reply field.
 *
 * Without `reply` it is a post in a thread, which has no field of its own.
 */
export const PromptCardSkeleton = ({ reply = true }: { reply?: boolean }) => {
  const lines = useMemo<DimensionValue[]>(() => ["100%", "94%", "68%"], []);
  return (
    <SkeletonPulse label="Loading a post">
      <CardFrame>
        <CardHeader metaWidth="32%" />
        <View style={styles.lines}>
          {lines.map((width, index) => (
            <Bone height={12} key={index} width={width} />
          ))}
        </View>
        <View style={styles.actions}>
          <Bone circle height={22} />
          <Bone height={12} width={96} />
          <Bone circle height={22} />
          <View style={styles.spacer} />
          <Bone circle height={22} />
        </View>
        {reply ? (
          <View style={styles.reply}>
            <Bone circle height={28} />
            <Bone height={34} radius={radius.full} style={styles.fill} />
          </View>
        ) : null}
      </CardFrame>
    </SkeletonPulse>
  );
};

/** An activity card: head with its kind badge, the picture it is about, a heart. */
export const ActivityCardSkeleton = () => (
  <SkeletonPulse label="Loading an update">
    <CardFrame>
      <View style={styles.header}>
        <View style={[styles.header, styles.fill]}>
          <Bone circle height={40} />
          <View style={styles.identity}>
            <Bone height={14} width="40%" />
            <Bone height={10} width="60%" />
          </View>
        </View>
        <Bone height={22} radius={radius.full} width={72} />
      </View>
      <Bone height={160} radius={radius.md} />
      <View style={styles.actions}>
        <Bone circle height={22} />
      </View>
    </CardFrame>
  </SkeletonPulse>
);

/** A feed card of either kind, for lists that deal the two together. */
export const FeedCardSkeleton = ({
  variant,
}: {
  variant: "prompt" | "activity";
}) =>
  variant === "activity" ? <ActivityCardSkeleton /> : <PromptCardSkeleton />;

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", gap: space.m },
  // `prompt-card.tsx`'s `card`, verbatim.
  card: {
    borderRadius: radius.card,
    borderWidth: border.edge,
    gap: space.ms,
    paddingBottom: space.m,
    paddingHorizontal: space.md - 2,
    paddingTop: 18,
  },
  fill: { flex: 1 },
  header: { alignItems: "center", flexDirection: "row", gap: space.ms },
  identity: { flex: 1, gap: space.s, minWidth: 0 },
  lines: { gap: space.sm },
  reply: { alignItems: "center", flexDirection: "row", gap: space.sm },
  spacer: { flex: 1 },
});
