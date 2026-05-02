import { useCallback } from "react";
import { logoutAction } from "@/app/actions";
import { useGlobalStoreSet } from "@/context/store/stores";
import { unsubscribeFromPush } from "@/lib/push";

/**
 * Returns an async handler to be called when the user logs out.
 *
 * Order of operations:
 * 1. Clear global state immediately so the UI reflects logged-out status.
 * 2. Unsubscribe from push while the JWT cookie is still present.
 * 3. Call logoutAction last — it removes the cookie and redirects.
 */
export const usePostLogout = () => {
  const setGlobalState = useGlobalStoreSet();

  const handlePostLogout = useCallback(async () => {
    setGlobalState({
      authState: "LOGGED_OUT",
      novelist: null,
      unreadConversationIds: null,
      unreadReplyCount: null,
      user: null,
    });

    await unsubscribeFromPush();
    await logoutAction();
  }, [setGlobalState]);

  return { handlePostLogout };
};
