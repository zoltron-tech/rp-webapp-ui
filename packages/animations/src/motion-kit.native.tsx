import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
} from "react";
import { Animated, Easing } from "react-native";
import type {
  MotionClock,
  MotionProps,
  MotionRhythm,
  MotionTable,
} from "./motion-types";

/**
 * Scene motion on a phone.
 *
 * ## The problem this solves
 *
 * Every drawing in this package, and every badge crest in `@nw/badges`, marks
 * its moving parts with a class name. On the web those names are matched by
 * keyframes and the browser animates them. `react-native-svg` has no stylesheet
 * and drops `className` on the floor, so the same artwork on a phone is
 * completely still — the drawing shared, the life in it not.
 *
 * This is the missing half: a table from class names to animated SVG props, a
 * clock to drive them, and a wrapper the primitives put round any element
 * carrying a name some scene has registered.
 *
 * ## One table, many scenes
 *
 * `registerMotion` merges a scene's rhythms into one module-level table. That
 * is what lets the primitives be shared: an element does not have to know which
 * package drew it, only what it is called. Class names are namespaced by scene
 * — the crests use `nwb-…`, the book art uses its own words — so one table has
 * no collisions, and a name nobody registered falls through to a plain static
 * element.
 *
 * ## One clock per rhythm, not one per element
 *
 * A profile can show a dozen crests and each crest has three to six moving
 * parts, so a timer per part is sixty timers for one screen. Instead every
 * animation sharing a period and a delay shares a single looping
 * `Animated.Value`, reference-counted: the first element to want a 3.4-second
 * clock starts it, the last one to unmount stops it.
 *
 * The clocks run `useNativeDriver: false`, which is not a choice —
 * `react-native-svg` props are not native-driven. It is why motion is gated at
 * the call site: nothing in a scrolling list animates.
 *
 * ## Easing lives in the interpolation, not the clock
 *
 * Every clock is linear. A CSS `ease-in-out` ping-pong (`a → b → a`) is not a
 * linear clock with an eased curve on top — easing the clock would run *fast*
 * through the peak, which is the opposite of what the CSS does. So the clock
 * stays linear and `pingPong` spreads the stops on a cosine, which is exactly
 * the shape `ease-in-out` draws between two values.
 *
 * ## What cannot be ported, and why
 *
 * Anything animating about a `transform-box: fill-box` origin — "the bottom
 * centre of *this element's own* bounding box". The browser measures that box;
 * `react-native-svg` will not tell us what it is without a layout round trip per
 * element per frame, and rotating about a guessed point draws visibly wrong,
 * which is worse than drawing it still. Scenes work around it by wrapping the
 * moving part in a group and giving the table an explicit **view-box** origin,
 * which both platforms then agree on.
 *
 * `stroke-dashoffset` draws are out for a different reason: they are a stroke
 * property rather than a transform, and nothing in `MotionProps` carries them.
 */

export type {
  MotionClock,
  MotionProps,
  MotionRhythm,
  MotionTable,
  MotionValue,
} from "./motion-types";

// ─── The table ───────────────────────────────────────────────────────────────

const TABLE: MotionTable = {};

/**
 * A scene declaring how its class names move.
 *
 * Called at module scope by whichever file owns the scene's table, so importing
 * the drawing is what teaches the primitives to animate it.
 */
export const registerMotion = (table: MotionTable): void => {
  Object.assign(TABLE, table);
};

// ─── Clocks ──────────────────────────────────────────────────────────────────

interface Clock {
  animation: Animated.CompositeAnimation | null;
  subscribers: number;
  value: Animated.Value;
}

const clocks = new Map<string, Clock>();

const clockKey = (period: number, delay: number) => `${period}:${delay}`;

/**
 * The value for a rhythm, created on demand.
 *
 * Pure enough to call during render: it may insert into the map, but it starts
 * nothing. Starting and stopping is the effect's job, so a double-invoked render
 * cannot leave a timer running.
 */
const valueFor = (period: number, delay: number): Animated.Value => {
  const key = clockKey(period, delay);
  const existing = clocks.get(key);
  if (existing) return existing.value;

  const clock: Clock = {
    animation: null,
    subscribers: 0,
    value: new Animated.Value(0),
  };
  clocks.set(key, clock);
  return clock.value;
};

const useClock = (
  period: number | null,
  delay: number,
): Animated.Value | null => {
  const value = period === null ? null : valueFor(period, delay);

  useEffect(() => {
    if (period === null) return;
    const clock = clocks.get(clockKey(period, delay));
    if (!clock) return;

    clock.subscribers += 1;

    if (clock.subscribers === 1) {
      clock.value.setValue(0);
      /*
       * The delay runs once rather than on every lap. The web writes these as a
       * negative `animation-delay`, which starts the animation already part way
       * through; a one-off delay before an otherwise identical loop puts the
       * same distance between two siblings, which is the whole point of them.
       */
      clock.animation = Animated.sequence([
        Animated.delay(delay * 1000),
        Animated.loop(
          Animated.timing(clock.value, {
            duration: period * 1000,
            easing: Easing.linear,
            toValue: 1,
            useNativeDriver: false,
          }),
        ),
      ]);
      clock.animation.start();
    }

    return () => {
      clock.subscribers -= 1;
      if (clock.subscribers > 0) return;
      clock.animation?.stop();
      clock.animation = null;
    };
  }, [delay, period]);

  return value;
};

// ─── Curves ──────────────────────────────────────────────────────────────────

/**
 * `a → b → a` on a cosine, which is the curve CSS `ease-in-out` draws between
 * two values. Nine stops is enough that the turn at each end reads as smooth.
 */
const PING_STOPS = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const PING_WEIGHTS = PING_STOPS.map((t) => (1 - Math.cos(2 * Math.PI * t)) / 2);

export const pingPong = (clock: MotionClock, from: number, to: number) =>
  clock.interpolate({
    inputRange: PING_STOPS,
    outputRange: PING_WEIGHTS.map((weight) => from + (to - from) * weight),
  });

/** A straight run from `from` to `to` across one lap. */
export const sweep = (clock: MotionClock, from: number, to: number) =>
  clock.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

/** Arbitrary stops, for the shapes that are neither. */
export const stops = (clock: MotionClock, input: number[], output: number[]) =>
  clock.interpolate({ inputRange: input, outputRange: output });

// ─── The context the primitives read ─────────────────────────────────────────

/** Whether the scene being drawn wants motion at all. Off by default. */
const MotionContext = createContext(false);

export const MotionProvider = ({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}): ReactNode =>
  createElement(MotionContext.Provider, { value: enabled }, children);

/**
 * The animated props for one element, or `null` to draw it as it is.
 *
 * Always runs the same hooks, whatever the class name, because it is called
 * from inside every SVG primitive these packages draw with.
 */
export const useMotion = (className?: string): MotionProps | null => {
  const enabled = useContext(MotionContext);
  const rhythm: MotionRhythm | undefined = className
    ? TABLE[className]
    : undefined;
  const clock = useClock(
    enabled && rhythm ? rhythm.period : null,
    rhythm?.delay ?? 0,
  );

  if (!rhythm) return null;
  // Gated off: hold the rest pose if the rhythm has one, else draw as drawn.
  if (!enabled || !clock) return rhythm.rest ?? null;
  return rhythm.build(clock);
};
