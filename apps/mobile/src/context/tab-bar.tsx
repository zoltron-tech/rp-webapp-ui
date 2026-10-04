import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Animated,
  Easing,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { markScrolling } from "@/context/scroll-activity";
import { getA11ySettings } from "@/lib/a11y-settings";
import { space } from "@/theme";

/**
 * The bottom bar's two sizes, and the space a screen has to leave for it.
 *
 * ## Why the bar needs a context at all
 *
 * The bar floats *over* the screens now rather than sitting under them. React
 * Navigation lays the tab bar out as a sibling of the scene container, so a bar
 * that occupies layout space is a bar the content stops short of — which is
 * what it did, and why the screens ended in a hard edge with the bar below it.
 * Taking the bar out of the flow (`position: "absolute"`) fixes the look and
 * breaks the arithmetic: nothing then tells a list how far its last row is from
 * the bottom of the *visible* area.
 *
 * Both halves of that live here. `useTabBarInset` is the number a scrollable
 * pads by, and `useTabBarScroll` is the handler that decides which size the bar
 * should be. They are two hooks rather than one because a screen can need the
 * padding without being scrollable.
 *
 * ## The two sizes
 *
 * Scrolling down shrinks the bar; scrolling back up, tapping a tab, or reaching
 * the top restores it. This is Instagram's behaviour, and the reason for it is
 * that a bar is worth its height while you are choosing where to go and worth
 * very little while you are reading. Shrinking rather than hiding keeps the
 * destination reachable — a hidden bar has to be summoned before it can be
 * used, which costs a gesture that the small bar does not.
 *
 * ## One clock, and no layout at all
 *
 * The collapse used to animate the bar's `height` and its side inset, which are
 * layout and therefore JS-driven, while the lozenge and the icons moved on the
 * native driver. Two clocks for one movement: the native half glided through
 * the 200ms on the UI thread, while the JS half advanced only when the JS
 * thread had a frame to spare — which, during the scroll that *caused* the
 * collapse, it did not. On film the lozenge is left floating inside a bar still
 * at its old height, and the two snap together at the end. That is the jitter.
 *
 * Nothing here animates layout any more. The bar's box is a constant — one
 * height, one width, laid out once — and every difference between the two sizes
 * is a transform on the native driver, all of them interpolated from this one
 * value:
 *
 *  - the **surface** (the capsule carrying the fill, the border and the shadow)
 *    scales in Y and drops, so the bar is shorter and closer to the edge;
 *  - the **icon row** and the **lozenge** drop by the same amount, so they stay
 *    centred inside it;
 *  - the icons scale, as they already did, and so does the lozenge.
 *
 * Being one value they cannot come apart: there is no frame in which the bar is
 * one size and its contents another. Being native, none of it is on the JS
 * thread that the scrolling list is already using.
 *
 * What that costs is the capsule's end caps, which are ellipses rather than
 * half-circles while it is short — a radius scaled with everything else, seven
 * points of it across a 360-point bar. Nobody has ever noticed that; everybody
 * noticed the jitter.
 */

/** The bar's own height, expanded and compact. Not counting what is under it. */
export const BAR_HEIGHT = 62;
export const BAR_HEIGHT_COMPACT = 44;

/**
 * The indicator behind the active tab's *icon*, at both sizes.
 *
 * It holds the icon and nothing else. It used to hold the label too, in a
 * lozenge 56 points wide, and a word is not a fixed width: "Threads" set in
 * the interface face ran past both ends of it. With the label under the
 * indicator, on the bar itself, there is no edge for a word to cross — which
 * is how Material's navigation bar and the system tab bars both draw it.
 *
 * One height at both sizes, so the collapse narrows it and nothing more.
 */
export const PILL_HEIGHT = 30;
export const PILL_HEIGHT_COMPACT = 30;
export const PILL_WIDTH = 50;
export const PILL_WIDTH_COMPACT = 44;

/**
 * The icons, compact, as a fraction of their drawn size.
 *
 * A scale rather than a smaller `size` prop, because `size` is a number handed
 * to a font glyph and cannot be interpolated — changing it would snap the
 * artwork at one end of an otherwise continuous movement. 0.84 of 24pt is
 * about 20pt, which is the step below what the bar draws expanded.
 *
 * Scaling text down is the forgiving direction: the glyph is rasterised at its
 * full size and composited smaller, so nothing is invented. This is the same
 * reason the *bar* is not scaled — there the movement is upward in one place
 * (the border, the shadow) and would be inventing detail.
 */
export const ICON_SCALE_COMPACT = 0.84;

/**
 * How far the icon rises in the expanded bar to make room for its label under
 * it. Compact, the label fades and the icon settles back to the centre.
 */
export const LABEL_LIFT = 9;

/**
 * Air above the bar, and the screen edges it is held off.
 *
 * There is no compact counterpart. There was one, animated as `paddingTop` on
 * the bar's ground, and it never moved anything: the ground is bottom-anchored
 * inside a host of fixed height, so padding above the bar only grows the ground
 * upwards into space nothing draws in. It cost a JS-driven layout prop per
 * frame to do nothing — see `components/tab-bar.tsx`.
 */
export const BAR_GAP_TOP = space.sm;

/**
 * The side inset, the same at both sizes.
 *
 * The compact bar used to pull further in from the edges as well, so the
 * columns underneath it were narrower while it was short — which meant the
 * lozenge's travel, the icons' positions and the bar's own width all had to be
 * corrected against one another, and that correction was a layout pass per
 * frame. A bar that is only *shorter* says the same thing (you are reading, not
 * choosing) without moving anything sideways to say it.
 *
 * It is also why the bar still needs no `onLayout`: the width is arithmetic off
 * the window and this constant (`tabWidth`), so the lozenge is in the right
 * place on its first frame rather than one frame later.
 */
export const BAR_INSET_X = space.md;

/** How far the fade above the bar reaches, so content thins out before it. */
export const SCRIM_RISE = 28;

/** Ground clearance below the bar, expanded and compact. */
const groundBottom = (safeBottom: number) => Math.max(safeBottom, space.sm);
const groundBottomCompact = (safeBottom: number) =>
  Math.max(safeBottom - space.xs, space.xs);

/**
 * Travel in one direction before the size flips.
 *
 * Small enough that a deliberate scroll shrinks the bar at once, large enough
 * that the wobble at the end of a fling does not flip it twice.
 */
const FLIP_AT = 12;

/** Within this of the top the bar is always full size, whatever the direction. */
const ANCHOR_TOP = 24;

interface TabBarChrome {
  /**
   * 0 expanded, 1 compact. Native-driven, and the bar's only clock: every
   * difference between the two sizes is a transform off this one value.
   */
  collapse: Animated.Value;
  /**
   * Take the bar off screen; the returned function gives it back. Counted,
   * so two holds (a conversation, and its details pushed on top) keep it
   * away until both are released. See `useHideTabBar`.
   */
  hide: () => () => void;
  /** Whether any screen currently holds the bar hidden. */
  hidden: boolean;
  /** Layout space a screen must leave at its foot. 0 when the bar is hidden. */
  inset: number;
  visible: boolean;
  setCollapsed: (next: boolean) => void;
  /** Told by the bar itself, which is what turns `hidden` into `visible`. */
  setVisible: (next: boolean) => void;
}

const noop = () => {};

/*
 * The holds live in a module store read through `useSyncExternalStore`, not
 * in `useState`. A hold is released from a closing screen's focus-effect
 * cleanup, which on this runtime runs inside a native callback (the swipe's
 * `Animated` completion, or a hardware back), and a plain state update made
 * there was left unflushed until the next touch — the list came back with no
 * bar under it. `useSyncExternalStore` commits synchronously, in the same
 * tick, which is the same cure `use-keyboard-height` needed for the same
 * reason.
 */
let holds = 0;
const holdListeners = new Set<() => void>();
const subscribeHolds = (listener: () => void) => {
  holdListeners.add(listener);
  return () => {
    holdListeners.delete(listener);
  };
};
const readHolds = () => holds;
const setHoldCount = (next: number) => {
  holds = next;
  for (const listener of holdListeners) listener();
};

const TabBarChromeContext = createContext<TabBarChrome>({
  collapse: new Animated.Value(0),
  hidden: false,
  hide: () => noop,
  inset: 0,
  setCollapsed: noop,
  setVisible: noop,
  visible: false,
});

/**
 * Wraps the tab navigator, so both the bar and every screen under it read one
 * value. It has to sit above `<Tabs>`: the bar is rendered as a sibling of the
 * scenes, not inside them, so nothing lower in the tree is an ancestor of both.
 */
export const TabBarChromeProvider = ({ children }: { children: ReactNode }) => {
  const insets = useSafeAreaInsets();
  const collapse = useRef(new Animated.Value(0)).current;

  // A ref rather than state: this is read and written on every scroll event and
  // nothing renders from it. Re-rendering the whole tab tree per frame to store
  // a boolean the animation already holds would be the expensive way to do it.
  const collapsed = useRef(false);

  const [visible, setVisible] = useState(true);

  // How many focused screens want the bar gone. A count rather than a flag:
  // a screen's release must not undo another screen's hold.
  const held = useSyncExternalStore(subscribeHolds, readHolds, readHolds);
  const hide = useCallback(() => {
    let released = false;
    setHoldCount(holds + 1);
    return () => {
      if (released) return;
      released = true;
      setHoldCount(Math.max(0, holds - 1));
    };
  }, []);

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (collapsed.current === next) return;
      collapsed.current = next;

      // Reduce Motion: the bar changes size without the tween.
      if (getA11ySettings().reduceMotion) {
        collapse.setValue(next ? 1 : 0);
        return;
      }

      Animated.timing(collapse, {
        duration: 200,
        // Fast at the start, settling at the end — the bar arrives rather than
        // stopping. `inOut` on this distance reads as sluggish.
        easing: Easing.out(Easing.cubic),
        toValue: next ? 1 : 0,
        useNativeDriver: true,
      }).start();
    },
    [collapse],
  );

  /*
   * The *expanded* height, always — never the current one.
   *
   * Padding a list by a number that is itself animating would move the content
   * under the reader's thumb every time the bar changed size, and a list at the
   * very bottom would jump. Reserving the larger of the two costs a few points
   * of extra air in compact mode and nothing else.
   */
  const inset = useMemo(
    () => BAR_GAP_TOP + BAR_HEIGHT + groundBottom(insets.bottom),
    [insets.bottom],
  );

  const value = useMemo(
    () => ({
      collapse,
      hidden: held > 0,
      hide,
      inset: visible ? inset : 0,
      setCollapsed,
      setVisible,
      visible,
    }),
    [collapse, held, hide, inset, setCollapsed, visible],
  );

  return (
    <TabBarChromeContext.Provider value={value}>
      {children}
    </TabBarChromeContext.Provider>
  );
};

export const useTabBarChrome = (): TabBarChrome =>
  useContext(TabBarChromeContext);

/**
 * The bottom padding a scrollable needs so its last row can be scrolled clear
 * of the bar.
 *
 * Zero on a screen that hides the bar — a conversation pads for its composer
 * instead, and adding the bar's height there would leave a gap the size of a
 * bar under the last message.
 */
export const useTabBarInset = (): number => useTabBarChrome().inset;

/**
 * A scrollable's content style with the bar's clearance added to the bottom
 * padding it already had.
 *
 * Added rather than replaced, so a list keeps whatever air it was designed with
 * between its last row and the end of its content, and the bar's height is on
 * top of that. Replacing it would leave the final row sitting against the bar's
 * top edge on every screen at once.
 *
 * `base` comes from `StyleSheet.create`, so its identity is stable and the memo
 * holds across renders.
 */
export const useTabBarContentStyle = (base: ViewStyle): ViewStyle => {
  const inset = useTabBarInset();

  return useMemo(() => {
    // Only a number can be added to. `padding` is the shorthand most of these
    // lists actually use, and a percentage or `auto` is not something to guess
    // an arithmetic answer for.
    const own =
      typeof base.paddingBottom === "number"
        ? base.paddingBottom
        : typeof base.padding === "number"
          ? base.padding
          : 0;

    return { ...base, paddingBottom: own + inset };
  }, [base, inset]);
};

/**
 * The scroll props a screen spreads onto its list, which are what decide the
 * bar's size as the screen moves.
 *
 * Separate from the padding hook because the two answer different questions:
 * every screen under the tabs needs the clearance, only a scrolling one has a
 * direction to report.
 */
export const useTabBarScroll = () => {
  const { setCollapsed } = useTabBarChrome();

  const lastY = useRef(0);
  /** Distance travelled since the last direction change, signed. */
  const travel = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const delta = y - lastY.current;
      lastY.current = y;

      if (delta === 0) return;

      /*
       * Every list under the tabs already spreads these props, which makes this
       * the one place that sees all of them move. Anything that would rather
       * hold still while the reader scrolls reads the other end of it — see
       * `context/scroll-activity`.
       */
      markScrolling();

      // The top is a special case rather than a consequence of direction: a
      // list bounced past its own start is scrolling *down* by the time it
      // settles, and the bar must not shrink because of a rubber band.
      if (y <= ANCHOR_TOP) {
        travel.current = 0;
        setCollapsed(false);
        return;
      }

      // A change of direction restarts the count, so a flick back up expands
      // the bar straight away instead of first having to undo the scroll down.
      if (delta > 0 !== travel.current > 0) travel.current = 0;
      travel.current += delta;

      if (travel.current > FLIP_AT) setCollapsed(true);
      else if (travel.current < -FLIP_AT) setCollapsed(false);
    },
    [setCollapsed],
  );

  /*
   * 32ms, not 16. The handler runs on the JS thread and its only job is to
   * decide which of two sizes the bar should be — a decision taken at most
   * twice per gesture, off `FLIP_AT` points of accumulated travel, which a
   * 30Hz sample reaches at exactly the same *distance* a 60Hz one does. The
   * frames it gives back go to the list rendering its cells, which is what the
   * reader is actually looking at.
   */
  return { onScroll, scrollEventThrottle: 32 };
};

/**
 * Everything the collapse changes, as transforms off one 0…1.
 *
 * `drop` is the whole trick. The surface scales about its own centre, which
 * lifts its bottom edge by half of the height it loses; adding that half back
 * puts the edge where it was, and adding the clearance the compact bar gives up
 * (`groundBottomCompact`) carries it the rest of the way down. The icon row and
 * the lozenge translate by the same number, which is what keeps them centred in
 * a capsule shrinking around them.
 */
export const barMetrics = (safeBottom: number) => ({
  /** How far the bar and everything in it move down as it shrinks. */
  drop:
    (BAR_HEIGHT - BAR_HEIGHT_COMPACT) / 2 +
    (groundBottom(safeBottom) - groundBottomCompact(safeBottom)),
  /** Clearance under the bar's box. Constant: the box itself never moves. */
  ground: groundBottom(safeBottom),
  icon: [1, ICON_SCALE_COMPACT],
  pillScaleX: [1, PILL_WIDTH_COMPACT / PILL_WIDTH],
  pillScaleY: [1, PILL_HEIGHT_COMPACT / PILL_HEIGHT],
  surfaceScaleY: [1, BAR_HEIGHT_COMPACT / BAR_HEIGHT],
});

/**
 * The width of one tab column, computed rather than measured.
 *
 * The bar spans the window less its inset on both sides, and the columns divide
 * that evenly. The hairline border is ignored: half a point across a six-way
 * split moves the lozenge by less than a tenth of a point, which is below what
 * the display can show.
 */
export const tabWidth = (windowWidth: number, count: number): number =>
  (windowWidth - 2 * BAR_INSET_X - 2 * BAR_ROW_PAD) / Math.max(count, 1);

/**
 * Room inside the capsule at each end of the row.
 *
 * The capsule's ends are half-circles; without this the first and last
 * indicators sat in the curve, a couple of points from the edge.
 */
export const BAR_ROW_PAD = 8;
