import { useSyncExternalStore } from "react";

/**
 * Whether anything on screen is currently being scrolled.
 *
 * ## Why this exists
 *
 * `@nw/animations`' native motion kit drives every shared drawing with
 * `Animated` and `useNativeDriver: false` — it has to, because
 * `react-native-svg` props are not native-drivable. Its own docs state the
 * consequence as a rule: *nothing in a scrolling list animates*, and motion is
 * gated at the call site.
 *
 * `EndOfList` is in a scrolling list — six of them — and it was mounted with
 * `<MotionProvider enabled>`, unconditionally. Under the New Architecture a
 * non-native-driven `Animated` value cannot reach the view through
 * `setNativeProps`, so each of the scene's fourteen animated groups re-renders
 * through React on every frame, for as long as the footer is mounted. On a
 * five-card list the footer is mounted from the first page onwards, so that is
 * a permanent fourteen-component-per-frame load on the same JS thread
 * `FlashList` renders cells on — which is what makes a cell arrive blank and
 * fill in a beat later.
 *
 * So: one signal, set by the scroll handler every list already spreads, read
 * by anything that would rather hold still while the reader is moving.
 *
 * ## Module state rather than a context
 *
 * The writer is `useTabBarScroll`, called once per screen; the readers are leaf
 * drawings several levels down in a list. A context between them would re-render
 * the whole subtree — the list included — on the exact transition it exists to
 * make cheaper. `useSyncExternalStore` re-renders only the components that
 * actually asked.
 */

/**
 * How long after the last scroll event the screen counts as still.
 *
 * Scroll events arrive on a 16ms throttle, so this is ten frames of silence —
 * long enough that the gaps inside a slow drag do not read as a stop, short
 * enough that motion returns while the reader is still looking at the list.
 */
const SETTLE_MS = 160;

let scrolling = false;
let settle: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

/** Called from a list's `onScroll`. Cheap on the common path: a timer reset. */
export const markScrolling = (): void => {
  if (settle) clearTimeout(settle);

  if (!scrolling) {
    scrolling = true;
    emit();
  }

  settle = setTimeout(() => {
    settle = null;
    scrolling = false;
    emit();
  }, SETTLE_MS);
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): boolean => scrolling;

/** `true` while nothing has scrolled for `SETTLE_MS`. */
export const useScrollIdle = (): boolean =>
  !useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
