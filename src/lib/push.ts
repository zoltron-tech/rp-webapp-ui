// lib/push.ts

import { authedApi } from "@/lib/api";
import { env } from "@/lib/env";

const VAPID_PUBLIC_KEY = env.VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!base64String || typeof base64String !== "string") {
    throw new Error("[Push] VAPID public key is missing or invalid.");
  }
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Goes through the shared API client rather than a bare `fetch`.
 *
 * It used to read the JWT and set the auth header by hand. That is no longer
 * possible — the session is an `httpOnly` cookie — and a plain `fetch` would
 * send no credentials at all. The client sends them, and renews an expired
 * access token underneath this call rather than silently dropping the
 * subscription.
 */
async function sendSubscriptionToBackend(
  subscription: PushSubscription,
): Promise<void> {
  const sub = subscription.toJSON();
  const response = await authedApi.raw("/rp/portfolio/push/subscribe", {
    body: {
      endpoint: sub.endpoint,
      keys: {
        auth: sub.keys?.auth,
        p256dh: sub.keys?.p256dh,
      },
    },
    label: "pushSubscribe",
    method: "POST",
  });

  if (!response.ok) {
    console.warn("[Push] Subscription was not accepted", response.status);
  }
}

// ── No registerServiceWorker() — the library handles it ──

export async function initialisePushNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[Push] Not supported in this browser");
    return;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error(
      "[Push] VAPID public key is missing. Set VAPID_PUBLIC_KEY in your environment.",
    );
    return;
  }

  console.log("[Push] Initialising...");

  try {
    // The library already registered the SW — just wait for it to be ready
    const registration = await navigator.serviceWorker.ready;

    console.log("[Push] Service Worker ready, checking subscription...");

    // Re-use if already subscribed (e.g. user logs out and back in)
    let subscription = await registration.pushManager.getSubscription();

    console.log("[Push] Current subscription:", subscription);

    if (!subscription) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("[Push] Permission denied by user");
        return;
      }

      // The Push API expects an ArrayBuffer, not a typed array with a non-standard buffer
      subscription = await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          .buffer as ArrayBuffer,
        userVisibleOnly: true,
      });
    }

    console.log("[Push] New subscription obtained:", subscription);
    await sendSubscriptionToBackend(subscription);
    console.log("[Push] Subscription active");
  } catch (err) {
    console.error("[Push] Initialisation failed:", err);
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      // Called during logout, while the session cookies are still present —
      // `usePostLogout` runs this before `logoutAction` for exactly that reason.
      await authedApi.raw("/rp/portfolio/push/unsubscribe", {
        label: "pushUnsubscribe",
        method: "DELETE",
      });
    }
  } catch (err) {
    console.error("[Push] Unsubscribe failed:", err);
  }
}

export function clearNotificationsForConversation(
  conversationId: string,
): void {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      conversationId,
      type: "CLEAR_NOTIFICATIONS",
    });
  });
}
