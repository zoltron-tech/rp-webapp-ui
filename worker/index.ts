/// <reference lib="webworker" />

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

swSelf.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const avatar: string | null = data.data.senderAvatar;

  const notificationOptions: SwNotificationOptions = {
    body: data.body,
    icon: avatar ?? '/icons/android-chrome-192x192.png',
    image: avatar ?? undefined,
    badge: '/icons/android-chrome-192x192.png',
    tag: `conversation-${data.data.conversationId}`,
    renotify: true,
    vibrate: [200, 100, 200],
    data: data.data,
  };

  event.waitUntil(
    swSelf.registration
      .showNotification(data.title, notificationOptions)
      .then(() => swSelf.registration.getNotifications())
      .then((notifications: Notification[]) => setBadge(notifications.length))
  );
});

// Notification click — update badge, then focus existing tab or open new one
swSelf.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url: string = event.notification.data?.url;

  event.waitUntil(
    swSelf.registration
      .getNotifications()
      .then((notifications: Notification[]) => setBadge(notifications.length))
      .then(() =>
        swSelf.clients
          .matchAll({ type: 'window', includeUncontrolled: true })
          .then((clientList: readonly WindowClient[]) => {
            for (const client of clientList) {
              if (client.url.includes(url) && 'focus' in client) {
                return client.focus();
              }
            }
            if (swSelf.clients.openWindow) return swSelf.clients.openWindow(url);
          })
      )
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



