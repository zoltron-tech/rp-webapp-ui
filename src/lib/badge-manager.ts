// lib/badge-manager.ts

export function setBadgeCount(count: number): void {
  if (!("setAppBadge" in navigator)) return;

  if (count > 0) {
    navigator.setAppBadge(count).catch(console.warn);
  } else {
    navigator.clearAppBadge().catch(console.warn);
  }
  // Also sync the service worker so it stays accurate while the app is open
  // (the SW updates the badge independently on push events when app is closed).
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.active?.postMessage({ count, type: "SET_BADGE" });
      })
      .catch(() => {
        /* non-critical */
      });
  }
}
