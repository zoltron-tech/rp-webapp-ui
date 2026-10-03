import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, type ReactNode, useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fontSize, space } from "@/theme";

/**
 * A list row you can swipe sideways to reveal an action.
 *
 * The interaction every phone user already knows from their mail and their
 * messages, and the reason the inbox no longer needs a menu button on every
 * row. Built on `PanResponder` and `Animated` from React Native itself — see
 * `components/sheet.tsx` for why this app does not reach for
 * `react-native-gesture-handler`.
 *
 * ## Not fighting the list
 *
 * A row inside a `FlatList` and the list itself both want the same finger. The
 * responder only claims a gesture that is clearly horizontal — past a slop
 * threshold *and* more sideways than vertical — so a diagonal flick scrolls the
 * list rather than half-opening a row. Once claimed the list is locked out for
 * the rest of that gesture, which is the behaviour you want: a swipe that turns
 * into a scroll halfway through would leave the row stranded.
 *
 * ## Snap rather than latch
 *
 * The action fires on release past the threshold and the row springs back on
 * its own, instead of parking open and waiting for a second tap. One gesture,
 * one outcome, nothing left in a state the next scroll has to clean up. The
 * action pane is revealed live under the row so the swipe says what it will do
 * before it commits — the icon fades in with distance, which is what makes an
 * accidental 20pt nudge obviously harmless.
 */

/** How far the row must travel before the action fires on release. */
const ACTION_THRESHOLD = 92;

/** How far the row may travel at all — past this it resists. */
const MAX_TRAVEL = 132;

/** Movement below this is a tap; above it, and horizontal, it is a swipe. */
const SLOP = 12;

export interface SwipeAction {
  /** Fires once, on release past the threshold. */
  onTrigger: () => void;
  background: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  tint: string;
}

/**
 * Beyond `MAX_TRAVEL` the row keeps moving, but at a fraction of the finger's
 * speed. iOS does this everywhere and it is why a rubber band reads as a limit
 * rather than as a bug: the row is plainly still responding, it simply will not
 * go further.
 */
const resist = (distance: number): number => {
  const magnitude = Math.abs(distance);
  if (magnitude <= MAX_TRAVEL) return distance;
  const overshoot = magnitude - MAX_TRAVEL;
  const eased = MAX_TRAVEL + overshoot * 0.25;
  return distance < 0 ? -eased : eased;
};

export const SwipeableRow = ({
  children,
  leftAction,
  rightAction,
}: {
  children: ReactNode;
  /** Revealed by swiping right (the row moves right). */
  leftAction?: SwipeAction;
  /** Revealed by swiping left (the row moves left). */
  rightAction?: SwipeAction;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  // Read inside the responder callbacks, which are created once and therefore
  // cannot close over state.
  const offset = useRef(0);

  const settle = () => {
    Animated.spring(translateX, {
      bounciness: 4,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) => {
        if (Math.abs(gesture.dx) < SLOP) return false;
        if (Math.abs(gesture.dx) <= Math.abs(gesture.dy)) return false;
        // Refuse a direction with nothing behind it, so the row does not slide
        // aside to reveal blank space.
        return gesture.dx > 0 ? Boolean(leftAction) : Boolean(rightAction);
      },
      onPanResponderMove: (_event, gesture) => {
        const allowed =
          gesture.dx > 0 ? Boolean(leftAction) : Boolean(rightAction);
        const distance = allowed ? resist(gesture.dx) : 0;
        offset.current = distance;
        translateX.setValue(distance);
      },
      onPanResponderRelease: () => {
        const distance = offset.current;
        offset.current = 0;
        settle();
        if (distance > ACTION_THRESHOLD) leftAction?.onTrigger();
        else if (distance < -ACTION_THRESHOLD) rightAction?.onTrigger();
      },
      onPanResponderTerminate: () => {
        offset.current = 0;
        settle();
      },
      // The row's own `Pressable` must still work, so a touch that has not
      // moved is never claimed here.
      onStartShouldSetPanResponder: () => false,
    }),
  ).current;

  return (
    <View style={styles.container}>
      {leftAction ? (
        <ActionPane
          action={leftAction}
          align="flex-start"
          translateX={translateX}
        />
      ) : null}
      {rightAction ? (
        <ActionPane
          action={rightAction}
          align="flex-end"
          translateX={translateX}
        />
      ) : null}

      <Animated.View
        {...pan.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
};

/**
 * What sits under the row.
 *
 * Its opacity tracks the swipe so the action announces itself gradually, and it
 * is tappable in its own right — a row already pulled aside by a slow swipe can
 * be finished with a tap instead of more dragging.
 */
const ActionPane = ({
  action,
  align,
  translateX,
}: {
  action: SwipeAction;
  align: "flex-start" | "flex-end";
  translateX: Animated.Value;
}) => {
  const direction = align === "flex-start" ? 1 : -1;

  const opacity = translateX.interpolate({
    extrapolate: "clamp",
    inputRange:
      direction === 1 ? [0, ACTION_THRESHOLD] : [-ACTION_THRESHOLD, 0],
    outputRange: direction === 1 ? [0, 1] : [1, 0],
  });

  const scale = translateX.interpolate({
    extrapolate: "clamp",
    inputRange:
      direction === 1 ? [0, ACTION_THRESHOLD] : [-ACTION_THRESHOLD, 0],
    outputRange: direction === 1 ? [0.7, 1] : [1, 0.7],
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.pane,
        { alignItems: align, backgroundColor: action.background },
      ]}
    >
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Pressable
          accessibilityLabel={action.label}
          accessibilityRole="button"
          onPress={action.onTrigger}
          style={styles.paneButton}
        >
          <Ionicons color={action.tint} name={action.icon} size={20} />
          <Text style={[styles.paneLabel, { color: action.tint }]}>
            {action.label}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  pane: {
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  paneButton: {
    alignItems: "center",
    gap: 2,
    justifyContent: "center",
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  paneLabel: { fontSize: fontSize.caption, fontWeight: "700" },
});
