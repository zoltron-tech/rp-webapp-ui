/// <reference lib="webworker" />
self.addEventListener('push', (event) => {
  const swSelf = self as unknown as ServiceWorkerGlobalScope;
  const pushEvent = event as PushEvent;
  if (!pushEvent.data) return;

  const data = pushEvent.data.json();
  const avatar: string | null = data.data.senderAvatar;

  const notificationOptions = {
    body: data.body,
    icon:  avatar ?? '/icons/android-chrome-192x192.png',
    image: avatar ?? undefined,
    badge: '/icons/android-chrome-192x192.png',
    tag: `conversation-${data.data.conversationId}`,
    renotify: true,
    vibrate: [200, 100, 200],
    data: data.data,
  } as NotificationOptions;

  pushEvent.waitUntil(
    swSelf.registration.showNotification(data.title, notificationOptions)
  );
});

// Notification click — focus existing tab or open new one
self.addEventListener('notificationclick', (event) => {
  const swSelf = self as unknown as ServiceWorkerGlobalScope;
  const notificationEvent = event as NotificationEvent;
  notificationEvent.notification.close();
  const url: string = notificationEvent.notification.data?.url;

  notificationEvent.waitUntil(
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
  );
});

// Message from app — clear notifications when user opens a conversation
self.addEventListener('message', (event) => {
  const swSelf = self as unknown as ServiceWorkerGlobalScope;
  // ExtendableMessageEvent is not available in TS by default, so use MessageEvent & check for waitUntil
  const messageEvent = event as MessageEvent & { waitUntil?: (promise: Promise<any>) => void };
  if (messageEvent.data?.type === 'CLEAR_NOTIFICATIONS') {
    const { conversationId } = messageEvent.data;
    swSelf.registration
      .getNotifications({
        tag: conversationId ? `conversation-${conversationId}` : undefined,
      })
      .then((notifications: Notification[]) => notifications.forEach((n) => n.close()));
  }
});