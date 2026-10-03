import { useCallback, useSyncExternalStore } from "react";
import { StyleSheet, View } from "react-native";
import { ConversationScreen } from "@/screens/conversation";

/**
 * The conversation page, drawn by the Inbox *layout* rather than by its route.
 *
 * ## Why the route is empty
 *
 * The conversation used to render inside its own native-stack screen. That
 * screen was a `transparentModal` so the list stayed visible under the slide,
 * and the slide itself was ours. Two things could not be fixed from inside it:
 *
 *  - On the way in, nothing could be drawn until react-native-screens had
 *    attached the native screen — half a second on first open, during which
 *    the list had already moved aside for a page that was not there.
 *  - On the way out, the stack keeps drawing a removed screen for a few frames
 *    from whatever it last had of it, and what it had was the page at the
 *    position a drag let go — a quarter-second ghost after every swipe back.
 *    Emptying the tree, hiding the root, fading it natively: none reached
 *    what was drawn.
 *
 * So the route's screen is now an empty, touch-transparent placeholder that
 * only carries navigation state, and the page lives here, a sibling of the
 * `<Stack>`. It appears the moment the route mounts, slides on its own, and
 * when it leaves it pops the route *first* — the stack removes an empty
 * screen, which has nothing to ghost — and finishes its slide afterwards,
 * unmounting itself through React like any other view.
 *
 * ## Focus
 *
 * A screen pushed over the conversation (its details, or a profile in another
 * tab) is a real stack screen above the empty route, and the overlay would
 * paint over it. The route reports its focus, and the overlay is hidden — not
 * unmounted, the draft and the scroll position stay — while it is not focused.
 */

interface Entry {
  id: string;
  /** Changes per mount of the route, so a re-open is a fresh page. */
  key: number;
  /** The route's tab-bar hold, released as the page starts to leave. */
  releaseTabBar: () => void;
}

interface OverlayState {
  current: Entry | null;
  focused: boolean;
  /** The page is sliding off; the route may already be gone. */
  leaving: boolean;
  /** The current page's `leave()`, for the route's hardware back. */
  leave: (() => void) | null;
}

let state: OverlayState = {
  current: null,
  focused: false,
  leave: null,
  leaving: false,
};
let keyCounter = 0;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const read = () => state;
const set = (next: Partial<OverlayState>) => {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
};

/** The route mounted: show its page. */
const show = (id: string, releaseTabBar: () => void) => {
  keyCounter += 1;
  set({
    current: { id, key: keyCounter, releaseTabBar },
    focused: true,
    leave: null,
    leaving: false,
  });
};

/** The route unmounted. A page mid-leave stays until its slide is done. */
const hide = (id: string) => {
  if (state.current?.id !== id) return;
  if (state.leaving) return;
  set({ current: null, focused: false, leave: null });
};

const setFocused = (id: string, focused: boolean) => {
  if (state.current?.id !== id) return;
  if (state.focused === focused) return;
  set({ focused });
};

const registerLeave = (id: string, leave: () => void) => {
  if (state.current?.id !== id) return;
  set({ leave });
};

/** The page started to slide off; the route pops now. */
const beginLeave = (id: string) => {
  if (state.current?.id !== id) return;
  set({ leaving: true });
};

/** The slide is over; the page goes. */
const finishLeave = (id: string) => {
  if (state.current?.id !== id) return;
  set({ current: null, focused: false, leave: null, leaving: false });
};

export const conversationOverlay = {
  beginLeave,
  finishLeave,
  hide,
  /** For the route's hardware back: the page's own leave, if it has one. */
  leave: (id: string) => {
    if (state.current?.id !== id) return false;
    if (!state.leave) return false;
    state.leave();
    return true;
  },
  registerLeave,
  setFocused,
  show,
};

/**
 * Where the page is drawn: over the stack, inside the Inbox tab, under the
 * tab bar. Rendered by the Inbox layout right after its `<Stack>`.
 */
export const ConversationOverlayHost = () => {
  const snapshot = useSyncExternalStore(subscribe, read, read);
  const { current, focused, leaving } = snapshot;

  const onBeginLeave = useCallback(() => {
    if (current) beginLeave(current.id);
  }, [current]);
  const onFinishLeave = useCallback(() => {
    if (current) finishLeave(current.id);
  }, [current]);
  const onRegisterLeave = useCallback(
    (leave: () => void) => {
      if (current) registerLeave(current.id, leave);
    },
    [current],
  );

  if (!current) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, !focused && !leaving && styles.hidden]}
    >
      <ConversationScreen
        conversationId={current.id}
        key={current.key}
        onBeginLeave={onBeginLeave}
        onFinishLeave={onFinishLeave}
        onRegisterLeave={onRegisterLeave}
        releaseTabBar={current.releaseTabBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: { display: "none" },
  host: { ...StyleSheet.absoluteFillObject },
});
