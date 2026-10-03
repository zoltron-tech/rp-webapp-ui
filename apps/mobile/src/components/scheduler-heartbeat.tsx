import { useEffect, useSyncExternalStore } from "react";
import { AppState } from "react-native";

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
 * Cost: a render of a component that returns `null`, twenty-five times a
 * second, while the app is in the foreground. Stopped in the background.
 * Remove this the day the probe in the commit message renders on its own.
 */

/** Short enough that a stalled update is never visibly late. */
const HEARTBEAT_MS = 40;

let beat = 0;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const read = () => beat;

export const SchedulerHeartbeat = () => {
  useSyncExternalStore(subscribe, read, read);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        beat += 1;
        for (const listener of listeners) listener();
      }, HEARTBEAT_MS);
    };
    const stop = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    };

    if (AppState.currentState === "active") start();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") start();
      else stop();
    });

    return () => {
      stop();
      subscription.remove();
    };
  }, []);

  return null;
};
