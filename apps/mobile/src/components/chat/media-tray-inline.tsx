import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClipGrid, GifGrid, StickerGrid } from "@/components/chat/media-picker";
import {
  MediaTrayHeader,
  type TrayTab,
} from "@/components/chat/media-tray-header";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { radius, space, useAppTheme } from "@/theme";

/**
 * The media drawer as a row in a column: GIFs, stickers and clips.
 *
 * This is the tray the prompt composer uses. It lives *in* the composer's
 * layout — it grows, and the editor above it shrinks — which is right for a
 * full-screen editor that has nothing under it to keep in view. The
 * conversation uses `media-tray.tsx` instead, which floats over the thread and
 * moves the composer with a transform; see there for why the two differ.
 *
 * ## It opens tall
 *
 * The first version opened at the keyboard's height, on the theory that
 * matching the keyboard is what makes it feel like a swap. It is — and it is
 * also useless: the tray carries a search field and a tab row, so at a
 * keyboard's height there was barely one row of results under them. So it
 * opens tall, and the keyboard-height state is what you get by dragging it
 * down. Dragging down from there closes it.
 *
 * ## Typing in it
 *
 * The search field raises the keyboard, which would otherwise cover the tray
 * that field belongs to. So the tray rides above the keyboard and gives up
 * height to it.
 */

export type { TrayTab };

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Used until a keyboard has actually been seen — roughly a phone keyboard. */
const FALLBACK_HEIGHT = 300;

/** How much of the screen the tall state takes. */
const EXPANDED_RATIO = 0.72;

/** Drag past this, in either direction, to switch between the two heights. */
const SNAP_DISTANCE = 48;

/** Room kept for the navigation bar and the composer when the keyboard is up. */
const RESERVED_CHROME = 128;

export const MediaTrayInline = ({
  keyboardHeight,
  onClose,
  onRequestKeyboard,
  onSelect,
  tab,
  onTabChange,
}: {
  /** The last measured keyboard height, or 0 if none has been seen. */
  keyboardHeight: number;
  onClose: () => void;
  onRequestKeyboard: () => void;
  onSelect: (url: string) => void;
  onTabChange: (tab: TrayTab) => void;
  /** Null closes the tray. */
  tab: TrayTab | null;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);

  const collapsed = Math.max(keyboardHeight || FALLBACK_HEIGHT, 240);
  const expanded = SCREEN_HEIGHT * EXPANDED_RATIO;

  const [rendered, setRendered] = useState<TrayTab | null>(tab);
  // Starts tall, and stays wherever it was last dragged for the rest of the
  // session's tray.
  const [isExpanded, setIsExpanded] = useState(true);
  const height = useRef(new Animated.Value(0)).current;
  const state = useRef({ collapsed, expanded, isExpanded: false });
  state.current = { collapsed, expanded, isExpanded };

  const previous = useRef<TrayTab | null>(tab);
  useEffect(() => {
    const wasOpen = previous.current !== null;
    previous.current = tab;

    if (tab) {
      setRendered(tab);
      if (wasOpen) return;
      Animated.timing(height, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
        toValue: state.current.isExpanded ? expanded : collapsed,
        useNativeDriver: false,
      }).start();
      return;
    }

    if (!wasOpen) return;
    Animated.timing(height, {
      duration: 160,
      easing: Easing.in(Easing.cubic),
      toValue: 0,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setRendered(null);
    });
  }, [collapsed, expanded, height, tab]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dy) > 4,
      onPanResponderMove: (_event, gesture) => {
        const base = state.current.isExpanded
          ? state.current.expanded
          : state.current.collapsed;
        height.setValue(
          Math.max(160, Math.min(state.current.expanded, base - gesture.dy)),
        );
      },
      onPanResponderRelease: (_event, gesture) => {
        const wasExpanded = state.current.isExpanded;
        if (!wasExpanded && gesture.dy > SNAP_DISTANCE) {
          onClose();
          return;
        }
        const next = wasExpanded
          ? gesture.dy < SNAP_DISTANCE
          : gesture.dy < -SNAP_DISTANCE;
        setIsExpanded(next);
        Animated.spring(height, {
          bounciness: 2,
          toValue: next ? state.current.expanded : state.current.collapsed,
          useNativeDriver: false,
        }).start();
      },
      onStartShouldSetPanResponder: () => false,
    }),
  ).current;

  if (!rendered) return null;

  return (
    <Animated.View
      style={[
        styles.tray,
        {
          backgroundColor: theme.glass.opaque,
          borderTopColor: theme.glass.edge,
          height,
          marginBottom: keyboardOffset,
          maxHeight: Math.max(
            200,
            SCREEN_HEIGHT - keyboardOffset - RESERVED_CHROME,
          ),
          paddingBottom: keyboardOffset > 0 ? 0 : insets.bottom,
        },
      ]}
    >
      <MediaTrayHeader
        keyboardIcon="check"
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
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, overflow: "hidden", paddingTop: space.sm },
  tray: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 10,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
