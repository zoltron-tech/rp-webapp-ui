import { DISABLE_ACCOUNT_COPY, type Novelist, type User } from "@nw/types";
import { useCallback } from "react";
import { getUnreadConversationIdsAction } from "@/app/rp/conversations/actions";
import { getNotifications } from "@/app/rp/novelists/actions";
import { getUnreadReplyCount } from "@/app/rp/outgoing-threads/actions";
import { useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import { initialisePushNotifications } from "@/lib/push";

/**
 * Returns an async handler to be called immediately after a successful login.
 *
 * It sets novelist/user in the global store, fetches unread counts, then
 * sets authState — which is deliberately last so the LoginPage's authState
 * watcher cannot trigger navigation before the fetches complete.
 *
 * Returns `true` if the user is onboarded (caller should route to Home),
 * `false` if not (caller should route to Onboarding).
 */
export const usePostLogin = () => {
  const setGlobalState = useGlobalStoreSet();
  const { successToast } = useUIContext();

  const handlePostLogin = useCallback(
    async (novelist: Novelist, user: User): Promise<boolean> => {
      // Clear stale state from any previous user session.
      setGlobalState({ notifications: null, novelist, user });

      // Signing in is what brings a disabled account back; the own-profile
      // load that did it says so once (ACCOUNT_DISABLE_PLAN.md D4).
      if (novelist.reactivated)
        successToast(DISABLE_ACCOUNT_COPY.toastOnReturn);

      if (!novelist.isOnboarded) {
        setGlobalState({ authState: "UNINITIALIZED" });
        return false;
      }

      // Fetch unread counts and notifications before any navigation occurs.
      try {
        const [unreadIds, unreadReplyCount, notifications] = await Promise.all([
          getUnreadConversationIdsAction(),
          getUnreadReplyCount(),
          getNotifications(1, 30),
        ]);
        setGlobalState({
          notifications: Array.isArray(notifications) ? notifications : [],
          unreadConversationIds: Array.isArray(unreadIds) ? unreadIds : [],
          unreadReplyCount:
            typeof unreadReplyCount === "number" ? unreadReplyCount : 0,
        });
      } catch {
        setGlobalState({
          notifications: [],
          unreadConversationIds: [],
          unreadReplyCount: 0,
        });
      }

      // Setting authState last — triggers the LoginPage's useEffect to navigate.
      // Callers on other pages (e.g. OAuth callback) must navigate explicitly.
      setGlobalState({ authState: "LOGGED_IN" });

      // Silent: re-registers a browser that already has permission, and never
      // asks. Asking is `PushPrimer`'s job, from a click — a prompt fired from
      // here is not a user gesture, which Safari refuses outright.
      setTimeout(() => initialisePushNotifications({ prompt: false }), 0);

      return true;
    },
    [setGlobalState, successToast],
  );

  return { handlePostLogin };
};
