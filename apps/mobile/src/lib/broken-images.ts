import { useSyncExternalStore } from "react";

/**
 * Image URLs that failed to load, for the life of the process.
 *
 * A muse's card background can point at a file that is gone while its main
 * image and wallpaper still load. Without a record of that, every card that
 * reads the dead URL draws an empty frame — the home rail's tile was black and
 * the character page's card a dim grey panel. Screens that have a second
 * source ask here first and fall through to it; one failure is enough for every
 * surface to skip the URL, and nothing retries it on each render.
 */
const broken = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

export const markImageBroken = (uri: string | null | undefined) => {
  if (!uri || broken.has(uri)) return;
  broken.add(uri);
  version += 1;
  for (const listener of listeners) listener();
};

/** The first source that is set and has not failed, or null. */
export const firstWorkingImage = (
  sources: (string | null | undefined)[],
): string | null => sources.find((uri) => !!uri && !broken.has(uri)) ?? null;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const read = () => version;

/** Re-renders the caller when any URL is marked broken. */
export const useBrokenImages = () =>
  useSyncExternalStore(subscribe, read, read);
