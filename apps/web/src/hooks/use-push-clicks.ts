import { useNotificationReadState } from "@nw/features";
import { useEffect } from "react";
import { usePageRouter } from "@/hooks/use-page-router";

/** Must match `NOTIFICATION_PARAM` in chat-server and the service worker. */
const NOTIFICATION_PARAM = "nw_n";

/** A stored notification's id; anything else is not sent to the server. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * What happens in the app when a push is tapped.
 *
 * Two ways in. When the app is already open, the service worker focuses it and
 * posts a message: the app goes to the page itself — no reload, no second
 * window — and marks the row read. When it is not, the worker opens the page
 * with the notification's id in the query string, and it is marked read as the
 * app loads, then taken back out of the address.
 */
export const usePushClicks = () => {
  const { routeToPage } = usePageRouter();
  const { markRead } = useNotificationReadState();

  // Opened by a tap, with the id in the address.
  useEffect(() => {
    const url = new URL(window.location.href);
    const notificationId = url.searchParams.get(NOTIFICATION_PARAM);
    if (!notificationId) return;

    if (UUID.test(notificationId)) void markRead(notificationId);
    url.searchParams.delete(NOTIFICATION_PARAM);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [markRead]);

  // Already open: the worker says what was tapped.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "NOTIFICATION_CLICK") return;
      const { notificationId, url } = event.data as {
        notificationId?: unknown;
        url?: unknown;
      };

      if (typeof notificationId === "string" && UUID.test(notificationId)) {
        void markRead(notificationId);
      }
      if (typeof url !== "string") return;

      try {
        // Same origin only, and only the path: the worker checks this too, but
        // nothing that arrives in a message is navigated to on trust.
        const target = new URL(url, window.location.origin);
        if (target.origin !== window.location.origin) return;
        void routeToPage(`${target.pathname}${target.search}`);
      } catch {
        // Not a URL; nothing to open.
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [markRead, routeToPage]);
};
