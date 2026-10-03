import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { Dimensions, Platform } from "react-native";
import {
  KeyboardController,
  KeyboardEvents,
} from "react-native-keyboard-controller";
import { initialWindowMetrics } from "react-native-safe-area-context";

/**
 * How much of the screen the software keyboard is covering, in dp.
 *
 * This exists because `KeyboardAvoidingView` does not work in this app, and it
 * is worth being precise about why rather than reaching for a library.
 *
 * On Android, `KeyboardAvoidingView` relies on the window being resized by
 * `adjustResize` — the view measures the shrunken window and pads the
 * difference. `app.json` sets `edgeToEdgeEnabled: true`, and an edge-to-edge
 * window is by definition not resized when the keyboard appears: the app keeps
 * the full screen and the keyboard is drawn over it as an inset. So the view
 * measures no change and pads nothing, which is exactly the reported bug — the
 * composer stays put and the keyboard covers it.
 *
 * `behavior="padding"` on iOS did work, which is why the bug was Android-only
 * and easy to miss.
 *
 * ## Where the height comes from
 *
 * `react-native-keyboard-controller`, not React Native's own `Keyboard`
 * events. The first version read `keyboardDidShow`, and on Android that event
 * cannot be trusted for the first keyboard of a session. React Native raises
 * it once, from the first layout pass after the keyboard is requested, and
 * reads the inset there and then — before a keyboard that is starting cold
 * has been measured. Logged on a release build (Gboard, Android 13): the
 * first `keyboardDidShow` after launch carried a height of **0** and nothing
 * followed it, so the chat composer stayed underneath a keyboard the app
 * believed was not there. Every later keyboard reported correctly, which is
 * what made it look intermittent.
 *
 * The library listens to the window's inset *animation* instead and reports
 * again when it ends. On that same first keyboard it too starts from the
 * unmeasured inset, and then corrects itself — `keyboardDidShow` with the
 * real height, about 300 ms later. It also gives Android a
 * `keyboardWillShow`, which React Native does not have.
 *
 * ## What the number means
 *
 * Unchanged from the first version, because a dozen bars are laid out by it:
 * on Android the keyboard *less the navigation bar*, on iOS the whole
 * keyboard. The library reports the whole inset on both, so the navigation
 * bar is taken off here (see `setKeyboardNavigationInset`).
 */
/**
 * One listener for the app, read through `useSyncExternalStore`.
 *
 * The first version subscribed in every component that asked — a dozen
 * listeners on a chat screen — and each one held the height in its own
 * `useState`. That worked until swipe-to-reply: the composer focused its field
 * from an effect, the keyboard rose, every listener fired, and the composer's
 * own `setState` was queued but not rendered until the next unrelated update
 * (a keystroke) flushed it. The composer sat behind the keyboard until you
 * typed. The store side-steps whatever lane that update landed in: a
 * `useSyncExternalStore` change is committed synchronously, and one value is
 * shared by everything that reads it, so no two bars can disagree about where
 * the keyboard is.
 *
 * Seeded from the library's own state so a screen mounted while the keyboard
 * is already up starts at the right height rather than at zero.
 */
let current = 0;
/** What the library last reported: the whole inset, navigation bar included. */
let reported = 0;
/**
 * The navigation bar's height, which Android's number has to lose.
 *
 * Seeded from the launch metrics so the first keyboard is right, and kept
 * live by `setKeyboardNavigationInset` — switching between gesture and
 * button navigation changes it without restarting the app.
 */
let navigationInset = initialWindowMetrics?.insets.bottom ?? 0;
/**
 * The last non-zero height seen, kept after the keyboard closes.
 *
 * For anything that has to be sized like the keyboard while there is none —
 * the media tray that takes its place — and for the bars that still rise on
 * focus, a moment ahead of `keyboardWillShow`.
 */
let last = 0;
const listeners = new Set<() => void>();
let attached = false;

/**
 * `last`, kept across launches.
 *
 * In memory alone it starts at zero every time the app starts (and on every
 * reload in development), so the first keyboard of a session had nothing to
 * predict from and every composer lifted a beat late on its first focus. One
 * number per device, written only when it changes.
 */
const STORAGE_KEY = "nw-keyboard-height";

const remember = (height: number) => {
  if (height <= 0 || height === last) return;
  last = height;
  void AsyncStorage.setItem(STORAGE_KEY, String(height)).catch(() => {});
};

const emit = () => {
  for (const listener of listeners) listener();
};

const report = (height: number) => {
  reported = height;
  const next =
    Platform.OS === "android" ? Math.max(0, height - navigationInset) : height;
  if (next === current) return;
  current = next;
  remember(current);
  emit();
};

/** Told the navigation bar's height by the root layout, whenever it changes. */
export const setKeyboardNavigationInset = (inset: number) => {
  if (inset === navigationInset) return;
  navigationInset = inset;
  report(reported);
};

const attach = () => {
  if (attached) return;
  attached = true;
  report(
    KeyboardController.isVisible() ? KeyboardController.state().height : 0,
  );
  // A keyboard seen this session wins over one remembered from the last.
  void AsyncStorage.getItem(STORAGE_KEY)
    .then((stored) => {
      const height = Number(stored);
      if (last === 0 && height > 0) last = height;
    })
    .catch(() => {});
  // `Will` moves everything with the keyboard; `Did` is the correction for a
  // keyboard that settled somewhere else — the first of a session always does
  // (see above) — and costs nothing when it did not.
  KeyboardEvents.addListener("keyboardWillShow", (e) => report(e.height));
  KeyboardEvents.addListener("keyboardDidShow", (e) => report(e.height));
  KeyboardEvents.addListener("keyboardWillHide", () => report(0));
  KeyboardEvents.addListener("keyboardDidHide", () => report(0));
};

const subscribe = (listener: () => void) => {
  attach();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const read = () => current;

export const useKeyboardHeight = (): number =>
  useSyncExternalStore(subscribe, read, read);

/**
 * The last height the keyboard had — this session's, or the one remembered
 * from the last. On a device that has never shown one, a typical phone
 * keyboard's share of the screen: a guess that is a few points off is
 * corrected when the real height lands, and is still better than rising a
 * beat late.
 */
export const lastKeyboardHeight = (): number => {
  attach();
  return last > 0 ? last : Math.round(Dimensions.get("window").height * 0.4);
};

/**
 * How far a bottom-anchored bar must be lifted to sit on top of the keyboard.
 *
 * Zero when the keyboard is down — the caller adds its own resting inset then.
 *
 * The two platforms report different things, and getting it wrong is either a
 * gap under the composer or a composer behind the keyboard.
 *
 * **Android (API 30+)** sends `imeInsets.bottom - systemBarInsets.bottom` (see
 * `ReactRootView.checkForKeyboardEvents`), so the navigation bar has already
 * been subtracted. The keyboard's real top edge is that number *plus* the bar,
 * so the inset has to be added back — without it the composer sits a navigation
 * bar's height too low, behind the buttons.
 *
 * **iOS** sends the full keyboard frame, home-indicator area included, so it is
 * already the distance from the bottom of the screen and needs nothing added.
 */
export const useKeyboardOffset = (bottomInset: number): number => {
  const keyboard = useKeyboardHeight();
  if (keyboard <= 0) return 0;
  return Platform.OS === "ios" ? keyboard : keyboard + bottomInset;
};
