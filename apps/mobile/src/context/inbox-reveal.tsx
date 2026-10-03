import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import { useAppTheme } from "@/theme";

/** `Easing`'s functions; the type is not re-exported from the package root. */
type EasingFunction = (t: number) => number;

/**
 * The conversation list's part in the conversation's swipe-back.
 *
 * On iPhone, in WhatsApp or Instagram, dragging a chat back does not uncover
 * an empty stage: the list is still there under it, and it *moves* — a third
 * as fast as the finger, from a little to the left — the way one sheet of
 * paper slides off another. Telegram draws the same on Android by hand.
 *
 * Here the two screens share one number: how far the conversation page has
 * slid to the right, in points. The conversation owns and drives it (see
 * `use-swipe-back`); the list only reads it, turning `0 … width` into
 * `-30% … 0` for its own offset. With no conversation open the value rests
 * at `width` — the page is "all the way off" — so the list sits where it
 * belongs.
 */

/** iOS's parallax: the screen beneath moves at 30% of the one on top. */
const PARALLAX = 0.3;

/*
 * Whether the list is at rest (no page over it), as a store the parallax
 * host reads synchronously.
 *
 * At rest the host renders a *plain* `translateX: 0` — a number, committed by
 * React straight into the shadow tree — and only while a page is moving does
 * it hand the transform to the animated node. The reason is what the shadow
 * tree is for: when the conversation route is removed the list's view is
 * re-shown from it, and native-driven values only reach it through a
 * write-back that on this runtime lands late (see `scheduler-heartbeat.tsx`).
 * With an animated node attached at rest, the re-shown list came back at the
 * slide-in's minus thirty percent for anything from a frame to half a second.
 * A plain number cannot be stale.
 */
let atRest = true;
let restTick = 0;
const restListeners = new Set<() => void>();
const subscribeRest = (listener: () => void) => {
  restListeners.add(listener);
  return () => {
    restListeners.delete(listener);
  };
};
const readRest = () => restTick;
const setAtRest = (next: boolean) => {
  atRest = next;
  restTick += 1;
  for (const listener of restListeners) listener();
};
const bumpRest = () => setAtRest(atRest);

/**
 * The slide-in's own write-back can land *after* the rest commit — it is
 * the same late roundtrip — and put the list back at minus thirty percent
 * for a few frames while the tab bar mounts. Committing rest again a few
 * times over the next second keeps the shadow tree at zero whenever that
 * lands. Cheap: a component that renders one view, a handful of times.
 */
const REASSERT_MS = [50, 100, 160, 240, 340, 460, 600, 780, 1000];
let reassertTimers: ReturnType<typeof setTimeout>[] = [];
const restWithReassert = () => {
  for (const timer of reassertTimers) clearTimeout(timer);
  setAtRest(true);
  reassertTimers = REASSERT_MS.map((ms) => setTimeout(bumpRest, ms));
};

interface InboxReveal {
  /**
   * Move the list to where a page at `pageX` puts it — at once, or over
   * `duration` with `easing` to match the page's own motion.
   *
   * The list used to read the page's value through an interpolation node,
   * one native graph for both views. It followed a drag, and it followed the
   * slide *in*, and then it ignored the slide *out* — the page went, the list
   * sat a third of the way left until the pop. Whatever broke the graph
   * between the two, a value of the list's own, written in step with the
   * page's, does not have it.
   */
  follow: (pageX: number, duration?: number, easing?: EasingFunction) => void;
  /** How far the conversation page has slid; `width` when none is open. */
  pageX: Animated.Value;
  /** For the list's root: the parallax offset, native-driven. */
  parallaxStyle: { transform: { translateX: Animated.Value }[] };
}

const InboxRevealContext = createContext<InboxReveal | null>(null);

export const InboxRevealProvider = ({ children }: { children: ReactNode }) => {
  const { width } = useWindowDimensions();
  const pageX = useRef(new Animated.Value(width)).current;
  const listX = useRef(new Animated.Value(0)).current;

  const value = useMemo<InboxReveal>(
    () => ({
      follow: (x, duration = 0, easing) => {
        const to = -PARALLAX * Math.max(0, width - Math.min(width, x));
        if (duration <= 0 && to === 0) {
          // The page is fully off: the plain number takes over — see `atRest`.
          listX.setValue(0);
          restWithReassert();
          return;
        }
        // About to move: the animated node has to be on the view first. The
        // switch is a synchronous re-render, so by the next line it is.
        if (atRest) setAtRest(false);
        if (duration <= 0) {
          listX.setValue(to);
          return;
        }
        Animated.timing(listX, {
          duration,
          easing,
          toValue: to,
          useNativeDriver: true,
        }).start();
      },
      pageX,
      parallaxStyle: { transform: [{ translateX: listX }] },
    }),
    [listX, pageX, width],
  );

  return (
    <InboxRevealContext.Provider value={value}>
      {children}
    </InboxRevealContext.Provider>
  );
};

/** `null` outside the Inbox stack: the screens work without the effect. */
export const useInboxReveal = () => useContext(InboxRevealContext);

/**
 * The list's root, moved by the parallax, and nothing else.
 *
 * A native-driven transform is applied by the animated module, but a React
 * re-render of the same `Animated.View` re-sends its style from the JS-side
 * value, which does not follow the native animation. So a list that
 * re-rendered while the conversation page was sliding (the tab bar's inset
 * changing under it) flashed to wherever the JS value happened to be: thirty
 * percent to the left, for a frame or ten. This host has no state of its own
 * and takes only `children`; the screen's content lives one level down and
 * re-renders as much as it likes. The host re-renders exactly once per rest
 * (`restTick`), when re-sending the transform is the point.
 */
export const InboxParallax = ({ children }: { children: ReactNode }) => {
  const reveal = useInboxReveal();
  const theme = useAppTheme();
  // Re-rendered on purpose, and only, when the list starts or stops moving.
  useSyncExternalStore(subscribeRest, readRest, readRest);
  return (
    <Animated.View
      style={[
        styles.fill,
        { backgroundColor: theme.background },
        atRest ? styles.still : reveal?.parallaxStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  /** At rest: a number in the shadow tree, not an animated node. */
  still: { transform: [{ translateX: 0 }] },
});
