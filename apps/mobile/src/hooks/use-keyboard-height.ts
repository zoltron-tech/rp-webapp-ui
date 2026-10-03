import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import {
  Dimensions,
  Keyboard,
  type KeyboardEvent,
  Platform,
} from "react-native";

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
 * The keyboard *events* are unaffected by any of that: `endCoordinates.height`
 * is reported correctly on both platforms regardless of window resizing,
 * because it describes the keyboard rather than the window. Reading it directly
 * is fewer moving parts than `react-native-keyboard-controller`, needs no
 * native module, and behaves identically in the Expo dev client.
 *
 * iOS gets the `Will` events so the layout moves with the keyboard animation
 * instead of snapping after it; Android only emits `Did`.
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
 * Seeded from `Keyboard.metrics()` so a screen mounted while the keyboard is
 * already up starts at the right height rather than at zero.
 */
let current = 0;
/**
 * The last non-zero height seen, kept after the keyboard closes.
 *
 * Android only says where the keyboard *was* once it has finished arriving
 * (`keyboardDidShow`, no `Will` event), so anything that wants to move with
 * it has to guess first and correct later. The guess is the last height; on
 * one device with one keyboard it is right every time after the first.
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

const attach = () => {
  if (attached) return;
  attached = true;
  current = Keyboard.isVisible() ? (Keyboard.metrics()?.height ?? 0) : 0;
  remember(current);
  // A keyboard seen this session wins over one remembered from the last.
  void AsyncStorage.getItem(STORAGE_KEY)
    .then((stored) => {
      const height = Number(stored);
      if (last === 0 && height > 0) last = height;
    })
    .catch(() => {});
  const showEvent =
    Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
  const hideEvent =
    Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
  Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
    current = event.endCoordinates.height;
    remember(current);
    emit();
  });
  Keyboard.addListener(hideEvent, () => {
    current = 0;
    emit();
  });
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
