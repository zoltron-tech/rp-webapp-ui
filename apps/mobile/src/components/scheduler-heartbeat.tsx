import { type ReactNode, useEffect, useSyncExternalStore } from "react";
import { AppState, Keyboard, StyleSheet, View } from "react-native";

/**
 * A metronome for React, because the runtime's is unreliable here.
 *
 * ## The bug this works around
 *
 * On this build (React Native 0.81, bridgeless, Android) React's default-lane
 * work — a `setState` from a `setTimeout`, a keyboard event, an `Animated`
 * completion callback, a promise, a focus-effect cleanup — is handed to the
 * native `RuntimeScheduler` and, intermittently, is simply not run: the task
 * sits in the queue until it *expires* (five seconds for normal priority) or
 * until the next touch. Measured with a probe: a timer fired, called
 * `setState`, and the component rendered 1.5–5 seconds later or on the next
 * tap. Sync-lane work is unaffected — touches and `useSyncExternalStore`
 * commits paint at once — which is why react-query and react-navigation
 * looked fine and everything hand-rolled looked broken: the composer behind
 * the keyboard, the tab bar that never came back, a GIF search that never
 * searched, a debounce that never settled.
 *
 * The scheduler stall reproduces on a fresh screen a few seconds after
 * launch and nothing in this app touches the scheduler; it is being reported
 * upstream. Until then:
 *
 * ## What this does
 *
 * A sync-lane render, empirically, flushes *all* of React's pending work,
 * not only its own lane. So one invisible component subscribes to a store
 * that ticks on a short interval; each tick is a `useSyncExternalStore`
 * change, which React commits synchronously, and whatever default-lane work
 * had been left waiting goes out with it. Timers themselves are delivered
 * promptly (that was measured too), so the tick always arrives.
 *
 * ## What it costs, and the gears
 *
 * A sync commit is not free, and it is not the null render it looks like:
 * what it flushes is whatever is pending, and the React profiler put a
 * commit on the Home tab at 100–300 ms of render on the Pixel 7 emulator
 * image. At forty milliseconds the ticks alone held the JS thread at 130% of
 * a core with the app sitting still — touches went unanswered, and every
 * other cost on the page (a GIF avatar, a crest's motion) was measured on
 * top of that floor. A phone is faster than the emulator, but the proportion
 * is the same: most of what the app did at rest was this.
 *
 * So the metronome has gears, chosen by what last happened:
 *
 * - **Interaction** — a touch, the keyboard, the app coming to the
 *   foreground — keeps the fast gear (`FAST_MS`) for `INTERACTION_FOR_MS`:
 *   that is when hand-rolled state changes happen, and when a stalled one
 *   is seen.
 * - **Data** — a query landing, which is how a fetch or a socket message
 *   reaches the screen — buys a short fast window (`DATA_FOR_MS`): enough
 *   ticks to flush the renders it caused, not a hundred.
 * - Otherwise the **idle** gear (`IDLE_MS`), a safety tick for work that
 *   arrived with no signal at all. Any signal brings the next tick forward,
 *   so the first touch after a quiet spell is painted as promptly as one in
 *   the middle of it.
 *
 * Remove all of this the day the probe in the commit message renders on its
 * own.
 */

/** Short enough that a stalled update is never visibly late. */
const FAST_MS = 40;
/** The idle gear: a ceiling on how long un-signalled work waits. */
const IDLE_MS = 1000;
/** How long an interaction keeps the fast gear. */
const INTERACTION_FOR_MS = 4000;
/** How long a query landing keeps it: a handful of ticks. */
const DATA_FOR_MS = 300;

export type ActivityKind = "interaction" | "data";

let beat = 0;
let lastInteraction = Date.now();
let lastData = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let fast = false;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const read = () => beat;

const wantsFast = () => {
  const now = Date.now();
  return (
    now - lastInteraction < INTERACTION_FOR_MS || now - lastData < DATA_FOR_MS
  );
};

const tick = () => {
  timer = null;
  beat += 1;
  for (const listener of listeners) listener();
  schedule();
};

const schedule = () => {
  if (!running) return;
  if (timer) clearTimeout(timer);
  fast = wantsFast();
  timer = setTimeout(tick, fast ? FAST_MS : IDLE_MS);
};

const start = () => {
  if (running) return;
  running = true;
  lastInteraction = Date.now();
  schedule();
};

const stop = () => {
  running = false;
  if (timer) clearTimeout(timer);
  timer = null;
};

/**
 * Something happened that may leave React with work to flush. Called from
 * every touch under `ActivityCapture`, the keyboard, the app state, and the
 * query cache; cheap enough to call from anywhere else that wants a prompt
 * paint. From the idle gear it brings the next tick forward to `FAST_MS`.
 */
export const noteActivity = (kind: ActivityKind = "interaction") => {
  if (kind === "interaction") lastInteraction = Date.now();
  else lastData = Date.now();
  if (running && !fast) schedule();
};

const touched = () => noteActivity("interaction");

export const SchedulerHeartbeat = () => {
  useSyncExternalStore(subscribe, read, read);

  useEffect(() => {
    if (AppState.currentState === "active") start();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") start();
      else stop();
    });
    const shown = Keyboard.addListener("keyboardDidShow", touched);
    const hidden = Keyboard.addListener("keyboardDidHide", touched);

    return () => {
      stop();
      appState.remove();
      shown.remove();
      hidden.remove();
    };
  }, []);

  return null;
};

/**
 * The touch half of the activity signal: a view over the whole app that
 * notes every touch that starts or moves under it, and takes none of them.
 */
export const ActivityCapture = ({ children }: { children: ReactNode }) => (
  <View onTouchMove={touched} onTouchStart={touched} style={styles.fill}>
    {children}
  </View>
);

const styles = StyleSheet.create({ fill: { flex: 1 } });
