import type { Accent } from "@nw/types/theme";
import { useSyncExternalStore } from "react";

/**
 * The theme colour being tried on, before the whole app is repainted in it.
 *
 * Changing the accent rebuilds the root theme, and every mounted screen that
 * reads `useAppTheme` re-renders — the feeds, the inbox, every tab visited this
 * session. That is seconds on a mid-range phone, and nothing on screen changed
 * until it was over, so a tap on a swatch read as a tap that missed.
 *
 * The settings stack paints from this instead (`AccentProvider` in
 * `app/edit-profile/_layout`), which is a re-render of one small subtree and
 * lands on the next frame. The app-wide change follows once that frame is on
 * screen.
 *
 * A module store rather than state: the swatch that sets it and the layout
 * that reads it are in different components, and see
 * `rn-state-updates-from-native-callbacks` for why a store is the reliable way
 * to cross that gap in this app.
 */

let preview: Accent | null = null;
const listeners = new Set<() => void>();

export const setPalettePreview = (next: Accent | null) => {
  if (next === preview) return;
  preview = next;
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const usePalettePreview = () =>
  useSyncExternalStore(
    subscribe,
    () => preview,
    () => preview,
  );
