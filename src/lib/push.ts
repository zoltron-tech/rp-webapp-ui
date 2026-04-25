// lib/push.ts

import { authenticateAndGetJWT } from "@/app/actions";
import { AUTH_HEADER_NAME } from "@/utils/constants";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!base64String || typeof base64String !== "string") {
    throw new Error("[Push] VAPID public key is missing or invalid.");
  }
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

const RP_SERVICE_URL = process.env.RP_SERVICE_URL;

async function sendSubscriptionToBackend(
  subscription: PushSubscription,
): Promise<void> {
  const jwt = await authenticateAndGetJWT();
  if (!jwt) {
    console.warn("[Push] No JWT available, skipping subscription send");
    return;
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    [AUTH_HEADER_NAME]: jwt,
  });

  const sub = subscription.toJSON();
  await fetch(`${RP_SERVICE_URL}/rp/portfolio/push/subscribe`, {
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: {
        auth: sub.keys?.auth,
        p256dh: sub.keys?.p256dh,
      },
    }),
    headers,
    method: "POST",
  });
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
      const jwt = await authenticateAndGetJWT();
      if (!jwt) {
        console.warn("[Push] No JWT available, skipping unsubscribe request");
        return;
      }
      const headers = new Headers({
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      });
      await fetch(`${RP_SERVICE_URL}/rp/portfolio/push/unsubscribe`, {
        headers,
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
