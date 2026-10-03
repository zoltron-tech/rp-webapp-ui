import { useSyncExternalStore } from "react";
import { AccessibilityInfo, Platform } from "react-native";

/**
 * The system display settings glass has to answer to.
 *
 * - **Reduce Transparency** (iOS): glass goes opaque. Android has no such
 *   setting, and draws no blur anyway.
 * - **Increase Contrast**: iOS "Increase Contrast" (`darkerSystemColors`) or
 *   Android "High contrast text". Glass goes opaque with a strong edge.
 * - **Reduce Motion**: morphing and springs become instant or short fades.
 *
 * ## Why a module store
 *
 * These arrive from native callbacks. A `useState` set from a native callback
 * can sit unflushed until some unrelated update renders it (see
 * `use-keyboard-height.ts` for the bug that taught this), and every glass
 * surface on screen reads these — a dozen subscribers disagreeing for a frame
 * is a tab bar opaque while its header is still translucent. One listener per
 * setting for the whole app, one snapshot, `useSyncExternalStore` to read it.
 *
 * The listeners are started on first subscription and never removed: there is
 * one set of them for the life of the process.
 */
export interface A11ySettings {
  increaseContrast: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
}

const OFF: A11ySettings = {
  increaseContrast: false,
  reduceMotion: false,
  reduceTransparency: false,
};

let system: A11ySettings = OFF;
/** Dev-only forcing, for the glass lab. `null` in normal use. */
let override: Partial<A11ySettings> | null = null;
let snapshot: A11ySettings = OFF;
let started = false;
const listeners = new Set<() => void>();

const publish = () => {
  const next = { ...system, ...override };
  if (
    next.increaseContrast === snapshot.increaseContrast &&
    next.reduceMotion === snapshot.reduceMotion &&
    next.reduceTransparency === snapshot.reduceTransparency
  ) {
    return;
  }
  snapshot = next;
  for (const listener of listeners) listener();
};

const setSystem = (patch: Partial<A11ySettings>) => {
  system = { ...system, ...patch };
  publish();
};

const start = () => {
  if (started) return;
  started = true;

  const ios = Platform.OS === "ios";

  AccessibilityInfo.addEventListener("reduceMotionChanged", (reduceMotion) =>
    setSystem({ reduceMotion }),
  );
  if (ios) {
    AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      (reduceTransparency) => setSystem({ reduceTransparency }),
    );
  }
  AccessibilityInfo.addEventListener(
    ios ? "darkerSystemColorsChanged" : "highTextContrastChanged",
    (increaseContrast) => setSystem({ increaseContrast }),
  );

  void Promise.all([
    AccessibilityInfo.isReduceMotionEnabled(),
    ios
      ? AccessibilityInfo.isReduceTransparencyEnabled()
      : Promise.resolve(false),
    ios
      ? AccessibilityInfo.isDarkerSystemColorsEnabled()
      : AccessibilityInfo.isHighTextContrastEnabled(),
  ])
    .then(([reduceMotion, reduceTransparency, increaseContrast]) =>
      setSystem({ increaseContrast, reduceMotion, reduceTransparency }),
    )
    .catch(() => {
      // A setting that cannot be read is treated as off: glass as designed.
    });
};

const subscribe = (listener: () => void) => {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => snapshot;

/** The settings in force, re-rendering when the person changes one. */
export const useA11ySettings = (): A11ySettings =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

/** The settings in force, outside React (animation setup, one-off checks). */
export const getA11ySettings = (): A11ySettings => {
  start();
  return snapshot;
};

/**
 * Force settings on or off regardless of the system, for checking a screen in
 * each state without leaving the app. Dev only; `null` hands back to the
 * system.
 */
export const setA11yOverride = (next: Partial<A11ySettings> | null) => {
  if (!__DEV__) return;
  override = next;
  publish();
};
