/// <reference lib="webworker" />

/**
 * Push, notification and badge handling — shared by both service workers.
 *
 * Two workers exist while the builds coexist: `worker/index.ts` is the custom
 * worker `@ducanh2912/next-pwa` merges into its generated Workbox bundle, and
 * `worker/sw.ts` is the complete `injectManifest` source for vite-plugin-pwa.
 * The logic below is identical in both and lives here so it cannot drift.
 *
 * Nothing in this file changed in the migration.
 *
 * See REACT_MIGRATION_STEPS.md D1.
 */

// tsconfig has lib: ["dom"] which types `self` as Window & typeof globalThis.
// Cast to ServiceWorkerGlobalScope to get correct SW event listener overloads.
const swSelf = self as unknown as ServiceWorkerGlobalScope;

type BadgeNavigator = {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

// Extend NotificationOptions with properties that may be absent in older TS DOM libs.
type SwNotificationOptions = NotificationOptions & {
  image?: string;
  renotify?: boolean;
  vibrate?: number | number[];
};

function setBadge(count: number): Promise<void> {
  const nav = navigator as Navigator & BadgeNavigator;
  if (count > 0) {
    return nav.setAppBadge?.(count) ?? Promise.resolve();
  }
  return nav.clearAppBadge?.() ?? Promise.resolve();
}

/**
 * Returns a validated same-origin URL string, or null if the URL is invalid
 * or points to a different origin. Prevents open-redirect attacks where a
 * crafted push payload could instruct the SW to open a phishing URL.
 */
function getSameOriginUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const scope = new URL(swSelf.registration.scope);
    const parsed = new URL(url, scope);
    return parsed.origin === scope.origin ? parsed.href : null;
  } catch {
    return null;
  }
}

const DEFAULT_ICON = '/icons/android-chrome-192x192.png';
const FALLBACK_TAG = 'novelist-world';

type PushDetails = {
  senderAvatar?: string;
  conversationId?: string;
  url?: string;
  /** Pushes sharing a tag replace one another: one notification per thread, per liked post. */
  tag?: string;
  /** The number for the app icon, counted by the server. */
  badge?: number;
  /** The stored row behind the push; absent for a chat message or a request. */
  notificationId?: string;
};

/** Must match `NOTIFICATION_PARAM` in chat-server and `use-push-clicks.ts`. */
const NOTIFICATION_PARAM = 'nw_n';
type PushPayload = { title: string; body: string; data?: PushDetails };

const FALLBACK_PAYLOAD: PushPayload = {
  title: 'Novelist World',
  body: 'You have a new notification',
  data: { url: '/' },
};

/** A conversation's tag is kept as it always was, so opening the conversation still clears it. */
function pushTag(details: PushDetails): string {
  if (details.conversationId) return `conversation-${details.conversationId}`;
  return typeof details.tag === 'string' && details.tag ? details.tag : FALLBACK_TAG;
}

/** The payload, or a generic one when it is missing, not JSON, or not the expected shape. */
function readPushPayload(event: PushEvent): PushPayload {
  try {
    const parsed = event.data?.json() as Partial<PushPayload> | null | undefined;
    if (!parsed || typeof parsed.title !== 'string' || !parsed.title) return FALLBACK_PAYLOAD;
    return {
      title: parsed.title,
      body: typeof parsed.body === 'string' ? parsed.body : '',
      data: parsed.data && typeof parsed.data === 'object' ? parsed.data : {},
    };
  } catch {
    return FALLBACK_PAYLOAD;
  }
}

/** Attaches the push/notification/message listeners to this worker. */
export function registerPushHandlers(): void {
  swSelf.addEventListener('push', (event: PushEvent) => {
    // Every push ends in a visible notification, whatever arrived. Safari
    // revokes a subscription after a few push events that show nothing, so an
    // empty or unreadable payload gets a generic notice rather than a return.
    const payload = readPushPayload(event);
    const details = payload.data ?? {};
    const avatar = typeof details.senderAvatar === 'string' && details.senderAvatar ? details.senderAvatar : null;

    const notificationOptions: SwNotificationOptions = {
      body: payload.body,
      // The avatar is the icon. It used to be passed as `image` as well, which
      // draws it again as a large picture across the notification.
      icon: avatar ?? DEFAULT_ICON,
      badge: DEFAULT_ICON,
      tag: pushTag(details),
      renotify: true,
      vibrate: [200, 100, 200],
      data: details,
    };

    event.waitUntil(
      swSelf.registration
        .showNotification(payload.title, notificationOptions)
        .then(() => {
          // The server's count when it sends one: unread conversations plus
          // unseen notifications. Counting what is on screen, as before, is
          // only the fallback for a payload without it.
          if (typeof details.badge === 'number') return setBadge(details.badge);
          return swSelf.registration
            .getNotifications()
            .then((notifications: Notification[]) => setBadge(notifications.length));
        })
    );
  });

  // Notification click — hand the tap to the app if it is open, else open it.
  //
  // The badge is left alone here: it is the server's count, and the app sets
  // it again the moment it loads or hears about a change.
  swSelf.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();
    const details = (event.notification.data ?? {}) as PushDetails;
    // Validate the URL is same-origin to prevent open-redirect via push payload
    const url: string | null = getSameOriginUrl(details.url);
    if (!url) return;
    const notificationId = typeof details.notificationId === 'string' ? details.notificationId : null;

    event.waitUntil(
      swSelf.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList: readonly WindowClient[]) => {
          // A window already on that page first, then the one in front, then any.
          const client =
            clientList.find((candidate) => candidate.url === url) ??
            clientList.find((candidate) => candidate.focused) ??
            clientList[0];

          if (client && 'focus' in client) {
            // The app navigates itself — no reload, and no second window
            // beside the one that is already open.
            client.postMessage({ type: 'NOTIFICATION_CLICK', url, notificationId });
            return client.focus();
          }

          if (!swSelf.clients.openWindow) return;
          // Nothing is open to tell, so the id rides in the address and the
          // app marks the row read as it loads.
          const target = new URL(url);
          if (notificationId) target.searchParams.set(NOTIFICATION_PARAM, notificationId);
          return swSelf.clients.openWindow(target.href);
        })
    );
  });

  // Messages from the app
  swSelf.addEventListener('message', (event: ExtendableMessageEvent) => {
    // Explicit badge sync from the main thread (called whenever unread counts change)
    if (event.data?.type === 'SET_BADGE') {
      const count: number = event.data.count ?? 0;
      setBadge(count);
      return;
    }

    // Clear notifications when user opens a conversation
    if (event.data?.type === 'CLEAR_NOTIFICATIONS') {
      const { conversationId } = event.data;
      swSelf.registration
        .getNotifications({
          tag: conversationId ? `conversation-${conversationId}` : undefined,
        })
        .then((notifications: Notification[]) => {
          notifications.forEach((n) => n.close());
          return swSelf.registration.getNotifications();
        })
        .then((remaining: Notification[]) => setBadge(remaining.length));
    }
  });
}
