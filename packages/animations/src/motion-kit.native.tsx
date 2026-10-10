import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Animated } from "react-native";
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

/*
 * ## One ticker, a capped rate, and a stop at the end of the lap
 *
 * The first version ran each clock as an `Animated.loop(Animated.timing)`.
 * With `useNativeDriver: false` that is a `requestAnimationFrame` per clock
 * on the JS thread, sixty times a second, each tick pushing a new prop set to
 * every SVG element on that rhythm. A profile with two crests measured 136%
 * of a core *at rest* on the Pixel 7 image; the badge shelf 143%.
 *
 * Three changes, from how Discord's animated decorations and most games
 * treat the same problem:
 *
 * - **One timer for every clock**, at `TICK_HZ` rather than the display's
 *   rate. These are breaths and glints over seconds, not a cursor under a
 *   finger; 24 steps a second reads as continuous for them and costs 60%
 *   fewer prop pushes than 60.
 * - **A clock stops at the end of its lap, not mid-breath.** Every rhythm in
 *   the tables is built so that `t = 0` is its rest pose (a `pingPong` starts
 *   at `from`, a `sweep` at `from`), so when nothing wants motion any more
 *   the clock finishes the lap it is on, lands on 0, and stops. That is what
 *   lets the call site *turn motion off* — after a burst, when a screen is
 *   left — without a visible snap.
 * - **Nothing ticks once everything has stopped.** The ticker clears itself
 *   when no clock is running, so a profile whose crests have settled costs
 *   the JS thread nothing per frame.
 *
 * `delay` is a phase offset (the web's negative `animation-delay`): two
 * siblings on the same period are the same distance apart as before, but
 * both move from the first frame rather than one waiting out the delay — a
 * clock that will stop after a few seconds cannot afford to spend three of
 * them standing still.
 */

const TICK_HZ = 24;

interface Clock {
  /** Mounted elements on this rhythm, moving or not. */
  held: number;
  /** Elements that want motion right now. */
  active: number;
  running: boolean;
  /** `Date.now()` when the current run began. */
  startedAt: number;
  /** The lap it was on when the last active element let go. */
  windDownLap: number;
  period: number;
  delay: number;
  value: Animated.Value;
}

const clocks = new Map<string, Clock>();
let ticker: ReturnType<typeof setInterval> | null = null;

/**
 * Clocks are shared by rhythm, and by scope. Two scenes on one screen that
 * want different things — a shelf of crests held still under a tray with
 * one crest moving — must not read one value: an element gated off keeps
 * reading its clock (so that a scene turning off settles rather than snaps),
 * and a clock the tray had started would carry the whole shelf with it.
 */
const clockKey = (period: number, delay: number, scope: string) =>
  `${scope}:${period}:${delay}`;

/** Where a clock is in its lap, 0–1, and which lap it is on. */
const phase = (clock: Clock, now: number) => {
  const elapsed = (now - clock.startedAt) / 1000 + clock.delay;
  const lap = Math.floor(elapsed / clock.period);
  return { lap, t: (elapsed - lap * clock.period) / clock.period };
};

const tick = () => {
  const now = Date.now();
  let running = 0;
  for (const clock of clocks.values()) {
    if (!clock.running) continue;
    const { lap, t } = phase(clock, now);
    // Nobody wants it: finish this lap and rest on 0. The first lap is lap
    // `delay / period` of the phase offset, so compare against where it was
    // when it was told to wind down rather than against zero.
    if (clock.active === 0 && lap > clock.windDownLap) {
      clock.value.setValue(0);
      clock.running = false;
      continue;
    }
    clock.value.setValue(t);
    running += 1;
  }
  if (running === 0 && ticker) {
    clearInterval(ticker);
    ticker = null;
  }
};

const ensureTicker = () => {
  if (!ticker) ticker = setInterval(tick, 1000 / TICK_HZ);
};

const startClock = (clock: Clock) => {
  if (clock.running) return;
  clock.startedAt = Date.now();
  clock.running = true;
  ensureTicker();
};

/**
 * The value for a rhythm, created on demand.
 *
 * Pure enough to call during render: it may insert into the map, but it starts
 * nothing. Starting and stopping is the effect's job, so a double-invoked render
 * cannot leave a timer running.
 */
const valueFor = (
  period: number,
  delay: number,
  scope: string,
): Animated.Value => {
  const key = clockKey(period, delay, scope);
  const existing = clocks.get(key);
  if (existing) return existing.value;

  const clock: Clock = {
    active: 0,
    delay,
    held: 0,
    period,
    running: false,
    startedAt: 0,
    value: new Animated.Value(0),
    windDownLap: 0,
  };
  clocks.set(key, clock);
  return clock.value;
};

/**
 * Holds a rhythm's clock for as long as the element is mounted, and runs it
 * for as long as `active` is on.
 *
 * Held and active are counted separately so that turning motion off does not
 * drop the clock: the element keeps reading the value, the clock finishes its
 * lap on it, and the element is left at the rest pose the lap ends on.
 */
const useClock = (
  period: number | null,
  delay: number,
  active: boolean,
  scope: string,
): Animated.Value | null => {
  const value = period === null ? null : valueFor(period, delay, scope);

  useEffect(() => {
    if (period === null) return;
    const clock = clocks.get(clockKey(period, delay, scope));
    if (!clock) return;
    clock.held += 1;
    return () => {
      clock.held -= 1;
      if (clock.held > 0) return;
      // Nothing is drawing it: stop at once, there is no pose to preserve.
      clock.running = false;
      clock.value.setValue(0);
    };
  }, [delay, period, scope]);

  useEffect(() => {
    if (period === null || !active) return;
    const clock = clocks.get(clockKey(period, delay, scope));
    if (!clock) return;
    clock.active += 1;
    startClock(clock);
    return () => {
      clock.active -= 1;
      if (clock.active > 0) return;
      clock.windDownLap = phase(clock, Date.now()).lap;
    };
  }, [active, delay, period, scope]);

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

/** The ceiling on an animated opacity — see `useMotion`. Invisible as a dimming. */
const MAX_ANIMATED_OPACITY = 0.999;

/** Whether the scene being drawn wants motion at all, and whose clocks it reads. Off by default. */
const MotionContext = createContext<{ enabled: boolean; scope: string }>({
  enabled: false,
  scope: "",
});

export const MotionProvider = ({
  children,
  enabled,
  scope = "",
}: {
  children: ReactNode;
  enabled: boolean;
  /**
   * A scene of its own, with clocks of its own. Give one to a scene drawn
   * over another that must hold still — a tray over a shelf — or the two
   * share clocks and the still one moves with it.
   */
  scope?: string;
}): ReactNode =>
  createElement(
    MotionContext.Provider,
    { value: useMemo(() => ({ enabled, scope }), [enabled, scope]) },
    children,
  );

/** Whether a rhythm's clock is mid-lap right now. Safe to read in render. */
const isClockRunning = (period: number, delay: number, scope: string) =>
  clocks.get(clockKey(period, delay, scope))?.running === true;

/**
 * The animated props for one element, or `null` to draw it as it is.
 *
 * Always runs the same hooks, whatever the class name, because it is called
 * from inside every SVG primitive these packages draw with.
 *
 * ## A still part is a plain element
 *
 * The first version built the animated props whenever the class name had a
 * rhythm, moving or not: a crest held still on the badge shelf was still
 * four or five `Animated` groups, each with its interpolations attached to a
 * clock that never ran — and built again on every render, since nothing
 * remembered them. Twelve still crests was sixty animated groups for nothing
 * to move. Now a part whose scene is off, and whose clock is not mid-lap,
 * draws as the plain element it is; the clock's rest pose is `t = 0`, which
 * is exactly how the artwork is drawn. A scene switching off mid-lap keeps
 * its wrapper, so the clock finishes the lap on it and the part settles
 * rather than snaps.
 */
export const useMotion = (className?: string): MotionProps | null => {
  const { enabled, scope } = useContext(MotionContext);
  const rhythm: MotionRhythm | undefined = className
    ? TABLE[className]
    : undefined;
  // The clock is held for as long as the element draws, and runs while the
  // scene wants motion. Gated off, the element keeps reading it: the clock
  // finishes its lap and rests on 0, which is the pose the rhythm was built
  // to start from, so the element settles instead of snapping.
  const clock = useClock(
    rhythm ? rhythm.period : null,
    rhythm?.delay ?? 0,
    enabled,
    scope,
  );

  /*
   * Built once per rhythm and clock, not once per render. The interpolations
   * are `Animated` nodes that attach to the clock; a fresh set each render
   * meant the old set detaching and the new one attaching, for every moving
   * part, on every re-render of the scene.
   */
  const props = useMemo<MotionProps | null>(() => {
    if (!rhythm || !clock) return null;
    const built = rhythm.build(clock);
    if (built.opacity === undefined) return built;

    /*
     * An animated opacity is never allowed to land on exactly 1.
     *
     * `react-native-svg` on Android draws a group at any other opacity through
     * a layer canvas of its own, and at exactly 1 it borrows the canvas it was
     * handed — then, the next time it fades, rebinds *that* canvas to its
     * layer bitmap. When the borrowed canvas was a faded ancestor's layer, the
     * ancestor's save stack is gone and its restore throws `Underflow in
     * restore - more restores than saves`, which takes the app down. A pulse
     * that peaks at 1 walks straight into it. Held a hair below, the group
     * keeps its own layer for life and there is nothing to rebind.
     */
    return {
      ...built,
      opacity: (
        built.opacity as Animated.AnimatedInterpolation<number>
      ).interpolate({
        inputRange: [0, 1],
        outputRange: [0, MAX_ANIMATED_OPACITY],
      }),
    };
  }, [clock, rhythm]);

  if (!rhythm || !clock) return null;
  if (!enabled) {
    // A rhythm with a rest pose of its own is one whose lap does not start
    // there; gated off, it is drawn at rest as before.
    if (rhythm.rest) return rhythm.rest;
    // Nothing moving and nothing winding down: the plain element, at rest.
    if (!isClockRunning(rhythm.period, rhythm.delay, scope)) return null;
  }

  return props;
};
