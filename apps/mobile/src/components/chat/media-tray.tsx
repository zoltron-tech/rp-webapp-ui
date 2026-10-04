import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClipGrid, GifGrid, StickerGrid } from "@/components/chat/media-picker";
import {
  MediaTrayHeader,
  type TrayTab,
} from "@/components/chat/media-tray-header";
import { lastKeyboardHeight } from "@/hooks/use-keyboard-height";
import { radius, space, useAppTheme } from "@/theme";

/**
 * The media drawer under the conversation's composer: GIFs, stickers, clips.
 *
 * The same idea as the web app's `MediaTray`, and for the same reason — it sits
 * exactly where the keyboard was, so opening it feels like switching the
 * keyboard rather than covering the conversation.
 *
 * ## Why it floats
 *
 * The first version was a row in the composer's column whose `height` was
 * animated on the JS thread. Every frame of that animation re-laid out the
 * column above it — the message list, the composer — and on a phone that read
 * as the conversation lurching upward in steps. It also meant the keyboard and
 * the tray moved the composer by two different mechanisms, and swapping one
 * for the other jumped.
 *
 * Now the tray is drawn *over* the thread, anchored to the bottom, and the
 * only things that move while it opens are transforms: the tray slides up by
 * its own height (`progress`, 0 → 1) and the composer, which reads the same
 * two values, rises with it. Nothing is laid out until the motion has ended,
 * and then once. See `Composer` for the lift that ties the two together.
 *
 * ## Its two heights
 *
 * It opens tall — a tray at the keyboard's height held one row of results
 * under its search field and tabs — and the keyboard-height state is what a
 * drag down gives you; drag down again from there and it closes. The tall
 * height leaves the header, the composer and a line of the conversation
 * visible at the 375 × 667 baseline.
 *
 * ## Typing in it
 *
 * The search field raises the keyboard. The tray then rides on top of the
 * keyboard (`keyboardTop`) and gives up height so the composer stays on
 * screen; when the keyboard goes, it gets the height back.
 */

export type { TrayTab };

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Used until a keyboard has actually been seen — roughly a phone keyboard. */
const FALLBACK_HEIGHT = 300;

/** How much of the screen the tall state takes. */
const EXPANDED_RATIO = 0.72;

/** Drag past this, in either direction, to switch between the two heights. */
const SNAP_DISTANCE = 48;

/**
 * Room kept for the header and the composer when the keyboard is up too.
 * Without it the tray claims everything the keyboard left and pushes the
 * composer — the thing you opened the tray to add to — off the top.
 */
const RESERVED_CHROME = 128;

/** The smallest a drag may make it before it is closed instead. */
const MIN_HEIGHT = 160;

const OPEN_MS = 240;
const CLOSE_MS = 180;

const MediaTrayView = ({
  height,
  keyboardTop,
  onClose,
  onHeightChange,
  onRequestKeyboard,
  onSelect,
  onTabChange,
  progress,
  tab,
}: {
  /**
   * The tray's height in points, owned by the composer so both can read it.
   * Written here — on open, on drag, on release — never animated: it is a
   * layout value for the tray and a term in the composer's transform.
   */
  height: Animated.Value;
  /**
   * How far the keyboard's top edge is from the bottom of the screen, or 0.
   * The tray sits on the keyboard while its search field is being typed in.
   */
  keyboardTop: number;
  onClose: () => void;
  /** The settled height (0 when closed), for anything laid out around it. */
  onHeightChange: (height: number) => void;
  onRequestKeyboard: () => void;
  onSelect: (url: string) => void;
  onTabChange: (tab: TrayTab) => void;
  /** 0 closed … 1 open, native-driven; the composer reads it too. */
  progress: Animated.Value;
  /** Null closes the tray. */
  tab: TrayTab | null;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // The keyboard's *lift* (see `Composer`): Android reports the keyboard less
  // the navigation bar, iOS the whole thing. The collapsed tray matches the
  // lift so the composer sits exactly where the keyboard left it.
  const known = lastKeyboardHeight();
  const keyboardLift =
    Platform.OS === "ios" ? Math.max(0, known - insets.bottom) : known;
  const collapsed = Math.max(keyboardLift || FALLBACK_HEIGHT, 240);
  const expanded = SCREEN_HEIGHT * EXPANDED_RATIO;
  // Whatever the keyboard leaves, less the chrome that must stay visible.
  const cap =
    keyboardTop > 0
      ? Math.max(200, SCREEN_HEIGHT - keyboardTop - RESERVED_CHROME)
      : expanded;

  const [rendered, setRendered] = useState<TrayTab | null>(tab);
  // Starts tall, and stays wherever it was last dragged for the rest of the
  // session's tray — reopening at the height you chose is less surprising than
  // resetting it every time.
  const [isExpanded, setIsExpanded] = useState(true);
  /** The height the tray is laid out at; `height` is the same number. */
  const [box, setBox] = useState(0);

  const target = Math.min(isExpanded ? expanded : collapsed, cap);

  // The responder is built once, so the current sizes have to reach it
  // through a ref rather than through the closure.
  const state = useRef({ cap, collapsed, expanded, isExpanded, target });
  state.current = { cap, collapsed, expanded, isExpanded, target };

  const settle = useCallback(
    (next: number) => {
      setBox(next);
      height.setValue(next);
      onHeightChange(next);
    },
    [height, onHeightChange],
  );

  /*
   * Opening and closing animate `progress`; switching tabs does not.
   *
   * The previous tab is tracked rather than derived from the open state,
   * because an effect that reacted to `isExpanded` would re-run — and
   * re-animate — every time a drag finished, fighting the spring that just
   * settled.
   */
  const previous = useRef<TrayTab | null>(tab);
  useEffect(() => {
    const wasOpen = previous.current !== null;
    previous.current = tab;

    if (tab) {
      setRendered(tab);
      if (wasOpen) return;
      settle(state.current.target);
      Animated.timing(progress, {
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!wasOpen) return;
    onHeightChange(0);
    Animated.timing(progress, {
      duration: CLOSE_MS,
      easing: Easing.in(Easing.cubic),
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Unmounted only after the slide, so the grid does not vanish and leave
      // an empty box sliding down behind it.
      if (finished) setRendered(null);
    });
  }, [onHeightChange, progress, settle, tab]);

  // The keyboard arriving under an open tray, or leaving: fit the new room.
  // Keyed on the room, not on the height — a drag changes the height every
  // frame and must not be snapped back.
  useEffect(() => {
    if (!tab) return;
    settle(state.current.target);
  }, [cap, settle, tab]);

  /*
   * The header strip is the drag handle, not the grid.
   *
   * The grid scrolls vertically and there is no way to arbitrate between the
   * two gestures without `react-native-gesture-handler` — see
   * `components/sheet.tsx`. Confining the drag to the header means the grid
   * always scrolls and the tray always resizes, with no ambiguity in either.
   *
   * A drag changes the tray's layout height directly — it is interactive and
   * has to follow the finger — and writes the same number into `height`, so
   * the composer above rides along through its transform.
   */
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dy) > 4,
      onPanResponderMove: (_event, gesture) => {
        const base = state.current.isExpanded
          ? state.current.expanded
          : state.current.collapsed;
        const next = Math.max(
          MIN_HEIGHT,
          Math.min(state.current.cap, base - gesture.dy),
        );
        setBox(next);
        height.setValue(next);
      },
      onPanResponderRelease: (_event, gesture) => {
        const wasExpanded = state.current.isExpanded;
        // Down from the short state closes it, rather than shrinking to a stub
        // — a half-height tray is not a state worth having.
        if (!wasExpanded && gesture.dy > SNAP_DISTANCE) {
          onClose();
          return;
        }
        const next = wasExpanded
          ? gesture.dy < SNAP_DISTANCE
          : gesture.dy < -SNAP_DISTANCE;
        setIsExpanded(next);
        const to = Math.min(
          next ? state.current.expanded : state.current.collapsed,
          state.current.cap,
        );
        settle(to);
      },
      onStartShouldSetPanResponder: () => false,
    }),
  ).current;

  /*
   * Where the tray sits, all as transforms.
   *
   * Closed it is its own height below the screen edge; open it rests on the
   * keyboard's top edge, or on the navigation-bar inset when there is no
   * keyboard — the inset itself is painted by a separate strip below, so the
   * tray's height is the whole of what it adds to the composer's lift.
   *
   * The rest is scaled by `progress` too. Subtracted whole, a closed tray
   * stopped a navigation bar short of the edge, and its tabs sat in a strip
   * under the composer until the tray unmounted.
   */
  const rest = keyboardTop > 0 ? keyboardTop : insets.bottom;
  const translateY = useMemo(
    () =>
      Animated.subtract(
        Animated.multiply(Animated.subtract(1, progress), height),
        Animated.multiply(progress, rest),
      ),
    [height, progress, rest],
  );

  if (!rendered) return null;

  return (
    <>
      {keyboardTop === 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.inset,
            {
              backgroundColor: theme.glass.opaque,
              height: insets.bottom,
              opacity: progress,
            },
          ]}
        />
      ) : null}

      <Animated.View
        style={[
          styles.tray,
          {
            backgroundColor: theme.glass.opaque,
            borderTopColor: theme.glass.edge,
            height: box,
            transform: [{ translateY }],
          },
        ]}
      >
        <MediaTrayHeader
          onRequestKeyboard={onRequestKeyboard}
          onTabChange={onTabChange}
          panHandlers={pan.panHandlers}
          rendered={rendered}
        />

        <View style={styles.body}>
          {rendered === "gif" ? <GifGrid onSelect={onSelect} /> : null}
          {rendered === "sticker" ? <StickerGrid onSelect={onSelect} /> : null}
          {rendered === "clip" ? <ClipGrid onSelect={onSelect} /> : null}
        </View>
      </Animated.View>
    </>
  );
};

/**
 * Memoised: the composer re-renders on every character of the draft, and
 * nothing here depends on the draft.
 */
export const MediaTray = memo(MediaTrayView);

const styles = StyleSheet.create({
  body: { flex: 1, overflow: "hidden", paddingTop: space.sm },
  /** The navigation-bar strip under the tray, in the tray's colour. */
  inset: { bottom: 0, left: 0, position: "absolute", right: 0 },
  tray: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    // Enough lift to separate it from the conversation behind, and no more:
    // the tray sits *under* the composer, so a heavy shadow reads as a seam
    // across the middle of the screen.
    elevation: 10,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    shadowColor: "#000000",
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
