import {
  useNotificationCounts,
  useSession,
  useUnreadConversations,
} from "@nw/features";
import { useEffect } from "react";
import { AppState } from "react-native";
import {
  openLaunchPush,
  registerForPush,
  setAppBadge,
  watchPushTaps,
  watchPushToken,
} from "@/lib/push";

/**
 * Keeps the phone registered and the app icon's number right, for as long as
 * someone is signed in. Mounted once, in the tab layout.
 *
 * Registration is silent here: it only happens when permission was already
 * given. The prompt itself is asked for from a moment that earns it — the
 * first message sent — which is where `registerForPush(true)` is called.
 */
export const usePushNotifications = () => {
  const { status } = useSession();
  const signedIn = status === "signed-in";
  const { unreadCount } = useUnreadConversations();
  const { data: counts } = useNotificationCounts({ enabled: signedIn });

  // Register on sign-in and again whenever the app comes back to the front:
  // the platform may have rotated the token, or permission may have been
  // granted in the phone's settings since.
  useEffect(() => {
    if (!signedIn) return;
    void registerForPush(false);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void registerForPush(false);
    });
    const stopWatching = watchPushToken();
    return () => {
      subscription.remove();
      stopWatching();
    };
  }, [signedIn]);

  // Taps: the one that launched the app, then any while it runs.
  useEffect(() => {
    if (!signedIn) return;
    void openLaunchPush();
    return watchPushTaps();
  }, [signedIn]);

  // The icon's number: unread conversations plus unseen notifications, as on
  // the web app's icon.
  useEffect(() => {
    if (!signedIn) return;
    setAppBadge(unreadCount + (counts?.unseen ?? 0));
  }, [signedIn, unreadCount, counts?.unseen]);
};
