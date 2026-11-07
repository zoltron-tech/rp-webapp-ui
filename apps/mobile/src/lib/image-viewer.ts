import { useSyncExternalStore } from "react";

/**
 * Which picture is open full screen, from anywhere.
 *
 * A post's image sits inside rich text, inside a card, inside a recycling list:
 * threading a callback that deep, through every screen that draws one, is more
 * code than the feature. One module store and one viewer at the root
 * (`components/image-viewer-host.tsx`) mean any image can simply ask.
 */
let current: string | null = null;
const listeners = new Set<() => void>();

const set = (url: string | null) => {
  current = url;
  for (const listener of listeners) listener();
};

export const openImage = (url: string) => set(url);

export const closeImage = () => set(null);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useOpenImage = () =>
  useSyncExternalStore(subscribe, () => current);
