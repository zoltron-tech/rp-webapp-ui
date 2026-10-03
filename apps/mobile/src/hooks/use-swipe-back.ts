import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  useWindowDimensions,
} from "react-native";

/** `Easing`'s functions; the type is not re-exported from the package root. */
type EasingFunction = (t: number) => number;

/**
 * Swipe right to leave — web's `conversation-panel` swipe-back, for a phone.
 *
 * Web slides the whole panel with the finger and lets go past 80px; the same
 * here, with a spring back short of that and a slide off the edge past it.
 *
 * ## What shows underneath
 *
 * The first version slid the page over the stack's empty container: a blank
 * wall until the pop, then the list cut in. Every chat app that has this
 * gesture — iOS's own interactive pop, which WhatsApp and Instagram ride, and
 * Telegram's hand-built Android copy — keeps the *previous screen* rendered
 * under the one being dragged, dims it, and lets the drag uncover it.
 *
 * So the page is drawn by its layout, over a stack whose route screen is an
 * empty placeholder (see `context/conversation-overlay`), and this hook owns
 * every move of the page:
 *
 *  - **enter**: from the right edge on first layout;
 *  - **drag**: with the finger;
 *  - **leave**: `onLeave` as it starts (the route pops there), off the right
 *    edge, then `onBack` — for the release, the header's back button and
 *    Android's hardware back alike.
 *
 * `scrimStyle` dims whatever is under the page, fading as it slides. The
 * same value can be handed in (`value`) so the screen beneath may read it —
 * the list's parallax, see `context/inbox-reveal`.
 *
 * ## Living beside the bubbles' own swipe
 *
 * A message bubble already swipes: theirs to the right, yours to the left, to
 * reply. Two responders wanting the same rightward drag are resolved by where
 * the finger lands and who asks first:
 *
 *  - **From the left edge** (`EDGE`), this claims *before* any child
 *    (`…Capture`) — the back gesture every phone reader already has in their
 *    thumb, and the one place a bubble's swipe gives way.
 *  - **Anywhere else**, this asks only after the children have declined: a
 *    drag that starts on one of *their* bubbles is a reply and never reaches
 *    here; one that starts on yours, on a day label or on the wallpaper
 *    between bubbles is a swipe back.
 *
 * A vertical or diagonal drag is neither — the list keeps its scroll — and
 * nothing is claimed on touch-down, so a tap, a double-tap and a long-press
 * are untouched.
 */

/** Web's activation distance (8px), widened to what a thumb can hold still. */
const SLOP = 12;
/** How far from the left a drag counts as the edge gesture. */
const EDGE = 28;
/** Web's release distance. */
const RELEASE = 80;
/** A quick flick past a third of that also counts — it is unmistakable. */
const FLICK_VELOCITY = 0.6;
const FLICK_DISTANCE = 30;
/** About the stack's own push, which this replaces. */
const ENTER_MS = 280;
/** Web's `transform 0.22s ease` out. */
const LEAVE_MS = 220;
/** About how long the spring back from a short drag takes to look settled. */
const SETTLE_MS = 200;
/** How dark the screen beneath is with the page fully over it. */
const SCRIM = 0.32;

/** Rightward, and more sideways than up or down by a clear margin. */
const rightward = (dx: number, dy: number) =>
  dx > SLOP && dx > Math.abs(dy) * 1.25;

export const useSwipeBack = ({
  enabled = true,
  onBack,
  onLeave,
  onMove,
  value,
}: {
  enabled?: boolean;
  /** The slide off is over: the page can go. */
  onBack: () => void;
  /**
   * Called as the page *starts* to slide off: release the tab bar, pop the
   * route. The page is drawn by its layout, so it outlives the route.
   */
  onLeave?: () => void;
  /**
   * Told wherever the page is sent: the target in points and how long it
   * will take to get there (0 for an instant move), with the easing used.
   * The inbox list's parallax hangs off this — see `context/inbox-reveal`.
   */
  onMove?: (pageX: number, duration: number, easing?: EasingFunction) => void;
  /** A shared position to drive instead of a private one. */
  value?: Animated.Value;
}) => {
  const { width } = useWindowDimensions();
  const own = useRef(new Animated.Value(width)).current;
  const translateX = value ?? own;
  /** Once leaving, nothing else moves the page. */
  const leaving = useRef(false);
  /**
   * Where the finger came down. `gestureState.x0` is only written on grant,
   * so in a should-set handler it still reads 0 — and 0 is inside the edge,
   * which made every rightward drag on the page an edge swipe.
   */
  const startX = useRef(Number.POSITIVE_INFINITY);

  // Read at gesture time, so the responder is built once.
  const latest = useRef({ enabled, onBack, onLeave, onMove, width });
  latest.current = { enabled, onBack, onLeave, onMove, width };

  // Off the right edge until the page has a native view to move; and should
  // this unmount some other way (a replace, a reset), leave the shared value
  // where "no page" lives.
  useEffect(() => {
    translateX.setValue(width);
    latest.current.onMove?.(width, 0);
    return () => {
      translateX.setValue(width);
      latest.current.onMove?.(width, 0);
    };
  }, [translateX, width]);

  /*
   * The slide in starts from the page's first layout, not from an effect.
   *
   * Started from `useEffect` the animation ran — the list's parallax, read
   * from the same value, moved — but the page itself stayed off screen until
   * its next re-render: a native-driven animation begun in the same tick the
   * `Animated.View` mounted never reached the view. By `onLayout` the view
   * exists natively and the transform follows.
   */
  const entered = useRef(false);
  const onLayout = useCallback(() => {
    if (entered.current) return;
    entered.current = true;
    const easing = Easing.out(Easing.cubic);
    Animated.timing(translateX, {
      duration: ENTER_MS,
      easing,
      toValue: 0,
      useNativeDriver: true,
    }).start();
    latest.current.onMove?.(0, ENTER_MS, easing);
  }, [translateX]);

  /*
   * Off the edge. `onLeave` fires first — the caller pops its route there,
   * so the stack removes an empty placeholder while this page, drawn by the
   * layout, finishes the slide — and `onBack` fires when the slide is over,
   * on a timer rather than the animation's completion callback: that
   * callback is a native-to-JS event, and on this runtime those can arrive
   * half a second late (see `scheduler-heartbeat.tsx`). A timer is on time.
   */
  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    latest.current.onLeave?.();
    const easing = Easing.in(Easing.cubic);
    Animated.timing(translateX, {
      duration: LEAVE_MS,
      easing,
      toValue: latest.current.width,
      useNativeDriver: true,
    }).start();
    latest.current.onMove?.(latest.current.width, LEAVE_MS, easing);
    setTimeout(() => {
      translateX.setValue(latest.current.width);
      latest.current.onMove?.(latest.current.width, 0);
      latest.current.onBack();
    }, LEAVE_MS);
  }, [translateX]);

  const responder = useMemo(() => {
    const settle = () => {
      Animated.spring(translateX, {
        bounciness: 4,
        toValue: 0,
        useNativeDriver: true,
      }).start();
      // A spring has no fixed length; the list takes a short ease instead,
      // which at this distance reads the same.
      latest.current.onMove?.(0, SETTLE_MS, Easing.out(Easing.cubic));
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, g) =>
        latest.current.enabled && !leaving.current && rightward(g.dx, g.dy),
      onMoveShouldSetPanResponderCapture: (_event, g) =>
        latest.current.enabled &&
        !leaving.current &&
        startX.current < EDGE &&
        rightward(g.dx, g.dy),
      onPanResponderMove: (_event, g) => {
        if (leaving.current) return;
        const x = Math.min(latest.current.width, Math.max(0, g.dx));
        translateX.setValue(x);
        latest.current.onMove?.(x, 0);
      },
      onPanResponderRelease: (_event, g) => {
        if (leaving.current) return;
        const flick = g.vx > FLICK_VELOCITY && g.dx > FLICK_DISTANCE;
        if (g.dx > RELEASE || flick) {
          leave();
          return;
        }
        settle();
      },
      onPanResponderTerminate: () => {
        if (!leaving.current) settle();
      },
      // Once this owns the drag it keeps it: the list underneath must not
      // take the page back halfway through a swipe.
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => false,
      // Not claiming — only noting where the touch began, before anyone else
      // sees it, so the edge test above has a number to test.
      onStartShouldSetPanResponderCapture: (event) => {
        startX.current = event.nativeEvent.pageX;
        return false;
      },
    });
  }, [leave, translateX]);

  return {
    /** Slide off and go back — the header's back button and the release. */
    leave,
    /** For the page `Animated.View`: starts the slide in once it exists. */
    onLayout,
    panHandlers: responder.panHandlers,
    /** For a full-screen layer *under* the page: dims what the page covers. */
    scrimStyle: {
      opacity: translateX.interpolate({
        extrapolate: "clamp",
        inputRange: [0, width],
        outputRange: [SCRIM, 0],
      }),
    },
    /** For the page that slides: `Animated.View` with this on it. */
    style: { transform: [{ translateX }] },
  };
};
