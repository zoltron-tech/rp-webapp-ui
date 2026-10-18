import { useSyncExternalStore } from "react";

/**
 * Notices when a newer build of the app has been deployed under an open tab.
 *
 * The service worker is registered with `autoUpdate` and calls `skipWaiting()`,
 * so a new deploy takes over quietly: the worker swaps in the background while
 * the tab keeps running the JavaScript it loaded. That is fine until the tab
 * reaches for a route it has not loaded yet — its chunk is named after the old
 * build, which no longer exists — and the page fails to load.
 *
 * Three signals mean "this tab is out of date", and any of them raises the
 * flag the refresh prompt reads:
 *
 * - **The worker changed hands.** `controllerchange` on a page that already had
 *   a controller is a new worker taking over — a new deploy. (The very first
 *   install also fires it, with no previous controller, and is ignored.)
 * - **A chunk failed to load.** Vite dispatches `vite:preloadError` when a
 *   dynamic import's files cannot be fetched — the old-build-chunk case above.
 * - Neither happens on its own while a tab sits open: the browser only checks
 *   for a new worker on navigation. So the registration is asked to check
 *   every half hour, and whenever the tab comes back into view.
 *
 * A module store rather than React state, so it is started once from
 * `main.tsx` regardless of which layout is mounted.
 */

const CHECK_EVERY_MS = 30 * 60 * 1000;
/** Coming back to the tab checks too, but not more than this often. */
const MIN_CHECK_GAP_MS = 5 * 60 * 1000;

/** Bumped by every signal; the prompt remembers which one it was dismissed at. */
let updateSignal = 0;
const listeners = new Set<() => void>();

const raise = () => {
  updateSignal += 1;
  for (const listener of listeners) listener();
};

let started = false;

export const startUpdateWatch = () => {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener("vite:preloadError", raise);

  // The worker runs in development too (for push), where every rebuild would
  // look like a deploy.
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController) raise();
    hadController = true;
  });

  let lastCheck = 0;
  const check = () => {
    lastCheck = Date.now();
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.update())
      // Offline, or the worker script briefly unreachable: try next time.
      .catch(() => {});
  };

  window.setInterval(check, CHECK_EVERY_MS);
  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "visible" &&
      Date.now() - lastCheck >= MIN_CHECK_GAP_MS
    ) {
      check();
    }
  });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** How many times an out-of-date signal has fired in this tab. */
export const useUpdateSignal = () =>
  useSyncExternalStore(
    subscribe,
    () => updateSignal,
    () => 0,
  );
