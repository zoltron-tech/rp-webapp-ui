import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A row that slides left to reveal buttons, and stays open until you choose.
 *
 * `SwipeableRow` is the other kind — one action, fired on release, the row
 * springing back — which is right for "mark as read" and wrong for "edit or
 * delete": two choices, one of them destructive, want to be *shown* and then
 * tapped, never fired by the swipe itself. Same `PanResponder` and `Animated`
 * foundation, for the reasons `components/sheet.tsx` gives.
 *
 * ## Behaviour
 *
 *  - Only a clearly horizontal leftward drag is claimed, so the list still
 *    scrolls under a diagonal flick.
 *  - Release past half the buttons' width, or a quick flick, latches open;
 *    anything less springs shut. Dragging an open row right closes it.
 *  - One row open at a time: opening another closes the last, and the list
 *    closes whichever is open when it starts to scroll (`closeOpenRevealRow`).
 *  - While open, tapping the row closes it rather than opening what it links
 *    to — the tap that was meant to dismiss must not navigate.
 *
 * Swiping is invisible to a screen reader, so the row's owner exposes the
 * same actions as accessibility actions; this component does not.
 */

const BUTTON_WIDTH = 68;
const BUTTON_GAP = space.sm;
const SLOP = 10;

export interface RevealAction {
  busy?: boolean;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  tone?: "neutral" | "danger";
}

/** The close of whichever row is open, so opening another can close it. */
let closeOpen: (() => void) | null = null;

/** Closes the open row, if any — for a list that has started scrolling. */
export const closeOpenRevealRow = () => closeOpen?.();

export const RevealRow = ({
  actions,
  children,
}: {
  actions: RevealAction[];
  children: ReactNode;
}) => {
  const theme = useAppTheme();
  const width = actions.length * (BUTTON_WIDTH + BUTTON_GAP);
  const translateX = useRef(new Animated.Value(0)).current;
  const position = useRef(0);
  const start = useRef(0);
  const [isOpen, setIsOpen] = useState(false);

  const animateTo = (x: number) => {
    position.current = x;
    Animated.spring(translateX, {
      bounciness: 0,
      speed: 18,
      toValue: x,
      useNativeDriver: true,
    }).start();
  };

  // Stable across renders: the module slot compares by identity.
  const close = useRef(() => {
    if (closeOpen === close.current) closeOpen = null;
    setIsOpen(false);
    animateTo(0);
  });

  const open = () => {
    if (closeOpen && closeOpen !== close.current) closeOpen();
    closeOpen = close.current;
    setIsOpen(true);
    animateTo(-width);
  };
  const openRef = useRef(open);
  openRef.current = open;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dx) > SLOP &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5 &&
        (gesture.dx < 0 || position.current < 0),
      onPanResponderGrant: () => {
        translateX.stopAnimation((value) => {
          start.current = value;
        });
      },
      onPanResponderMove: (_event, gesture) => {
        const raw = start.current + gesture.dx;
        // Past fully open it resists; right of closed it does not move.
        const x =
          raw < -width ? -width + (raw + width) * 0.25 : Math.min(0, raw);
        position.current = x;
        translateX.setValue(x);
      },
      onPanResponderRelease: (_event, gesture) => {
        const x = position.current;
        if (gesture.vx < -0.35 || (gesture.vx <= 0.35 && x < -width / 2)) {
          openRef.current();
        } else {
          close.current();
        }
      },
      onPanResponderTerminate: () => {
        if (position.current < -width / 2) openRef.current();
        else close.current();
      },
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => false,
    }),
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents={isOpen ? "auto" : "none"}
        style={[
          styles.actions,
          {
            opacity: translateX.interpolate({
              extrapolate: "clamp",
              inputRange: [-width, -width * 0.3, 0],
              outputRange: [1, 0.6, 0],
            }),
            width,
          },
        ]}
      >
        {actions.map((action) => {
          const danger = action.tone === "danger";
          const fill = danger ? theme.tones.danger.fill : theme.material.fill;
          const ink = danger ? theme.tones.danger.ink : theme.text;
          return (
            <Pressable
              accessibilityLabel={action.label}
              accessibilityRole="button"
              disabled={action.busy}
              key={action.label}
              onPress={() => {
                close.current();
                action.onPress();
              }}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: pressed ? theme.material.fillPressed : fill,
                  borderColor: danger ? theme.error : theme.material.edge,
                },
              ]}
            >
              {action.busy ? (
                <ActivityIndicator color={ink} size="small" />
              ) : (
                <Ionicons color={ink} name={action.icon} size={20} />
              )}
              <Text style={[styles.buttonLabel, { color: ink }]}>
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>

      <Animated.View
        {...pan.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {children}
        {isOpen ? (
          <Pressable
            accessibilityLabel="Close actions"
            onPress={() => close.current()}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    bottom: 0,
    flexDirection: "row",
    gap: BUTTON_GAP,
    justifyContent: "flex-end",
    position: "absolute",
    right: 0,
    top: 0,
  },
  button: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    gap: space.xs,
    justifyContent: "center",
    width: BUTTON_WIDTH,
  },
  buttonLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  container: { position: "relative" },
});
