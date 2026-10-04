import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassSurface } from "@/components/glass-surface";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { fontSize, radius, space, useAppTheme } from "@/theme";
import { IconButton } from "@/components/icon-button";

/**
 * The bottom sheet every mobile picker in this app slides up.
 *
 * `AGENTS.md` requires selection dialogs to be trays on a phone rather than
 * centred modals, and requires them to fit the 375 × 667 baseline. Both are
 * enforced here rather than per-caller: the sheet caps its own height at a
 * fraction of the screen and scrolls inside, so a picker cannot accidentally
 * become a full-screen list on the smallest supported device.
 *
 * ## Why PanResponder rather than a gesture library
 *
 * A sheet you cannot drag away reads as a dialog. `react-native-gesture-handler`
 * and `reanimated` are the usual answer and both are native modules — adding
 * either means every developer and every device rebuilds the dev client before
 * the app runs again. `PanResponder` and `Animated` are in React Native itself,
 * cost nothing to adopt, and are entirely adequate for a vertical drag with a
 * velocity threshold. The one real difference is that the drag is driven from
 * JS, so it can stutter under heavy render load — which is why the sheet's
 * content is kept out of the animated transform's way and the close animation
 * uses the native driver.
 *
 * ## The keyboard
 *
 * A sheet with a search field in it is covered by the keyboard that field
 * raises, which is the one failure that makes a searchable tray useless: you
 * type, and the results you are typing to find are behind the keys. So the
 * sheet rides on top of the keyboard and gives up height to it, rather than
 * staying put and being covered. `useKeyboardOffset` is used for the same
 * reason the composer uses it — `edgeToEdgeEnabled` means the window is never
 * resized, so nothing measures the keyboard on its own.
 *
 * ## Dismissal
 *
 * Four ways out, because people reach for different ones: the grip, the
 * backdrop, the header's close button and Android's back gesture. Only the
 * drag is interesting — it follows the finger, ignores upward movement (there
 * is nothing above to reveal), and closes on either distance or flick velocity
 * so a fast short swipe works as well as a slow long one.
 */

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * A larger radius than a card's: the corner is what separates the sheet from
 * the screen edge it slid off, and at 16 it reads as a panel stuck to the
 * bottom rather than as something raised over the page.
 */
const SHEET_RADIUS = 22;

/** Past this, or fast enough, the sheet closes instead of springing back. */
const CLOSE_DISTANCE = 110;
const CLOSE_VELOCITY = 0.75;

/** Below this the movement is a tap or a list scroll, not a drag. */
const DRAG_SLOP = 6;

export interface SheetProps {
  children: ReactNode;
  /**
   * Take the whole allowance rather than hugging the content.
   *
   * For any sheet with a search field in it. Hugging is right for a short menu
   * — a five-row action sheet occupying most of the screen is absurd — and
   * wrong for anything searchable: the sheet grows and shrinks as results come
   * and go, so the field you are typing into walks up and down the screen under
   * your thumb, and a query with two matches leaves a sheet two rows tall.
   * Filling fixes the geometry, and the list scrolls inside it.
   */
  fill?: boolean;
  /** Rendered on the right of the header, in place of the close button. */
  headerAction?: ReactNode;
  onClose: () => void;
  /**
   * How much of the screen the sheet may occupy, 0–1.
   *
   * The default keeps a strip of what is behind it visible, which is what tells
   * you the sheet is temporary rather than a screen you navigated to. Pickers
   * that are mostly grid pass something taller.
   */
  maxHeightRatio?: number;
  /** A line under the title. Kept short — it costs a row on a 667pt screen. */
  subtitle?: string;
  title?: string;
  visible: boolean;
}

export const BottomSheet = ({
  children,
  fill = false,
  headerAction,
  onClose,
  maxHeightRatio = 0.72,
  subtitle,
  title,
  visible,
}: SheetProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);

  // What is left for the sheet once the keyboard has taken its share. The 24
  // keeps a sliver of backdrop visible above it, so it still reads as a sheet
  // over something rather than a screen.
  const available = SCREEN_HEIGHT - keyboardOffset - 24;
  const target = Math.min(SCREEN_HEIGHT * maxHeightRatio, available);

  // One value drives both the slide and the backdrop's opacity: 0 is open, and
  // positive numbers are how far down the sheet has been pushed.
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  /** Whether the sheet has finished sliding off, so a close need not slide. */
  const offscreen = useRef(true);

  const animateTo = useCallback(
    (value: number, then?: () => void) => {
      offscreen.current = false;
      Animated.timing(translateY, {
        duration: value === 0 ? 240 : 180,
        easing:
          value === 0 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        toValue: value,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        offscreen.current = value === SCREEN_HEIGHT;
        then?.();
      });
    },
    [translateY],
  );

  /*
   * Closing from outside slides too.
   *
   * A caller that closes the sheet by choosing something in it — the sender
   * picker, an action — used to unmount it on the spot: the tap was followed
   * by a beat of nothing while the screen re-rendered, then the sheet was
   * simply gone. Now it stays mounted while it slides away. A sheet that
   * already slid (its own close button, the backdrop, a drag) unmounts at once,
   * so an invisible modal is never left over the screen swallowing taps.
   */
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) {
      setMounted(true);
      animateTo(0);
      return;
    }
    if (offscreen.current) {
      setMounted(false);
      return;
    }
    animateTo(SCREEN_HEIGHT, () => setMounted(false));
  }, [animateTo, visible]);

  const dismiss = useCallback(() => {
    animateTo(SCREEN_HEIGHT, onClose);
  }, [animateTo, onClose]);

  // Android's hardware/gesture back closes the sheet rather than the screen
  // under it. `Modal`'s own `onRequestClose` covers this, but it fires without
  // the exit animation, so the sheet vanishes rather than sliding away.
  useEffect(() => {
    if (!visible || Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        dismiss();
        return true;
      },
    );
    return () => subscription.remove();
  }, [dismiss, visible]);

  /*
   * The grip area owns the drag, not the whole sheet.
   *
   * A responder on the sheet body would compete with every list inside it for
   * the same vertical gesture, and `PanResponder` has no equivalent of gesture
   * handler's `simultaneousHandlers` to arbitrate that. Confining the drag to
   * the header strip is the honest version: the grip is a visible, well-known
   * handle, and the content below it scrolls normally.
   */
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        gesture.dy > DRAG_SLOP && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_event, gesture) => {
        translateY.setValue(Math.max(0, gesture.dy));
      },
      onPanResponderRelease: (_event, gesture) => {
        const shouldClose =
          gesture.dy > CLOSE_DISTANCE || gesture.vy > CLOSE_VELOCITY;
        if (shouldClose) {
          animateTo(SCREEN_HEIGHT, onClose);
          return;
        }
        Animated.spring(translateY, {
          bounciness: 2,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;

  const backdropOpacity = translateY.interpolate({
    extrapolate: "clamp",
    inputRange: [0, SCREEN_HEIGHT * 0.5],
    outputRange: [1, 0],
  });

  return (
    <Modal
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
      transparent
      visible={visible || mounted}
    >
      <View style={styles.root}>
        {/*
          One scrim, web's `DIALOG_SCRIM`. This used to be two: the animated
          view and the pressable inside it both painted 55% black, stacking to
          about 80% — dark enough that the glass above had nothing to show.
        */}
        <Animated.View
          style={[
            styles.backdropFill,
            { backgroundColor: theme.glass.scrim, opacity: backdropOpacity },
          ]}
        >
          <Pressable
            accessibilityLabel="Close"
            onPress={dismiss}
            style={styles.backdropFill}
          />
        </Animated.View>

        {/*
          The frame moves and casts the iOS shadow. The glass inside it clips to
          the corners — a clipped view casts no iOS shadow — and carries
          Android's elevation, which needs the background the glass paints.
        */}
        <Animated.View
          style={[
            styles.frame,
            {
              // The keyboard's own frame covers the home indicator, so the
              // inset is only owed when there is no keyboard.
              marginBottom: keyboardOffset,
              transform: [{ translateY }],
            },
            fill ? { height: target } : { maxHeight: target },
          ]}
        >
          <GlassSurface
            bordered="top"
            radius={SHEET_RADIUS}
            style={[
              styles.sheet,
              { paddingBottom: keyboardOffset > 0 ? 0 : insets.bottom },
              fill ? styles.sheetFill : styles.sheetHug,
            ]}
            variant="sheet"
          >
          <View {...pan.panHandlers} style={styles.grabArea}>
            <View style={[styles.grip, { backgroundColor: theme.glass.grip }]} />

            {title ? (
              <View
                style={[styles.header, { borderBottomColor: theme.glass.edge }]}
              >
                <View style={styles.headerText}>
                  <Text
                    numberOfLines={1}
                    style={[styles.title, { color: theme.text }]}
                  >
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text
                      numberOfLines={1}
                      style={[styles.subtitle, { color: theme.textGray }]}
                    >
                      {subtitle}
                    </Text>
                  ) : null}
                </View>

                {/* The tray header pattern this app follows: a title and a
                    circular action, never a full-width footer button — a footer
                    costs a row of content on a 667pt screen. */}
                {headerAction ?? (
                  <IconButton
                    accessibilityLabel="Close"
                    hitSlop={space.sm}
                    icon="close"
                    onPress={dismiss}
                    tone="glass"
                  />
                )}
              </View>
            ) : null}
          </View>

          {/*
            `flex: 1` only when filling. React Native reads `flex: 1` as a zero
            basis, so in a content-height sheet it would collapse the body to
            nothing — which is why the two cases are different styles rather
            than one.
          */}
          <View style={fill ? styles.bodyFill : styles.body}>{children}</View>
          </GlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropFill: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  body: { flexShrink: 1, paddingTop: space.sm },
  bodyFill: { flex: 1, paddingTop: space.sm },
  // The whole strip is the drag surface, and the padding is the reason it is
  // catchable: a 4pt grip is a 4pt target, and people grab at the space around
  // it rather than at the line itself.
  grabArea: { paddingBottom: space.xs, paddingTop: space.sm },
  grip: {
    alignSelf: "center",
    borderRadius: radius.full,
    height: 5,
    width: 44,
  },
  header: {
    alignItems: "center",
    // A hairline under the title, so a scrolling list passes *under* a header
    // that stays put rather than appearing to start halfway down the sheet.
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
  headerText: { flex: 1, gap: 1 },
  frame: {
    // iOS: the shadow, cast upward. Android's is `elevation` on the glass.
    ...Platform.select({
      android: {},
      default: {
        shadowColor: "#000000",
        shadowOffset: { height: -3, width: 0 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
      },
    }),
  },
  root: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    // Only the top corners round: the sheet runs off the bottom of the screen.
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...Platform.select({ android: { elevation: 16 }, default: {} }),
  },
  // The glass follows the frame's height: all of it when filling, and when
  // hugging, as much as the content wants up to the frame's cap.
  sheetFill: { flex: 1 },
  sheetHug: { flexShrink: 1 },
  subtitle: { fontSize: fontSize.caption },
  title: { fontSize: fontSize.lead, fontWeight: "700" },
});
