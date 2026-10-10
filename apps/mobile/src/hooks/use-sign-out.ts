import { logoutEverywhere } from "@nw/api/endpoints/account";
import { useApi, useChatCrypto, useLogout } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { REFRESH_HEADER } from "@/lib/api";
import { forgetSession } from "@/lib/auth";
import { wipeAllStores } from "@/lib/local-store";
import { unregisterFromPush } from "@/lib/push";
import { purgePersistedQueries } from "@/lib/query-persister";
import { readRefreshToken } from "@/lib/session-store";

/**
 * The refresh token, as the header user-service ends a native session by.
 *
 * `/account/logout` is anonymous and a phone sends no cookies, so this header
 * is the only thing that tells the server which session to revoke. Without it
 * the call answered 200 and revoked nothing — the refresh token stayed live
 * and the device stayed on the Devices list after signing out.
 */
const refreshHeaders = (): Record<string, string> => {
  const token = readRefreshToken();
  return token ? { [REFRESH_HEADER]: token } : {};
};

/**
 * Signing out, from the menu or from the devices screen.
 *
 * Two steps that must both happen and in this order: end the session
 * server-side, then drop the tokens from the keychain. The other way round
 * leaves a live session on the server with nothing able to end it
 * (SECURITY_AUTH_PLAN C3) — and reading the refresh token for the header is
 * only possible while it is still there.
 *
 * `useLogout` empties the in-memory cache. The disk copy is separate, and
 * without the purge the next launch restores this person's profiles and
 * friends onto a device that is signed out or signed in as somebody else. The
 * chat keys derived for their conversations go at the same time.
 */
export const useSignOut = () => {
  const api = useApi();
  const crypto = useChatCrypto();
  const logout = useLogout({ headers: refreshHeaders });
  const queryClient = useQueryClient();
  const router = useRouter();

  const leave = useCallback(async () => {
    // While the token still authenticates: the server removes this phone, so
    // it is not pushed to after the sign-out.
    await unregisterFromPush();
    crypto.reset();
    await forgetSession();
    await purgePersistedQueries();
    // Every local database, not only this account's: a phone that has seen
    // two accounts must not keep the first one's conversations for the third.
    await wipeAllStores();
    router.replace("/welcome");
  }, [crypto, router]);

  const signOut = useCallback(async () => {
    await logout.mutateAsync();
    await leave();
  }, [leave, logout]);

  /**
   * Ends every session on the account, this one included. The server has
   * already revoked this device's tokens by the time it answers, so there is
   * no separate logout call — only the local half.
   */
  const signOutEverywhere = useCallback(async (): Promise<boolean> => {
    const result = await logoutEverywhere(api).catch(() => null);
    if (result?.message !== API_MESSAGE.Success) return false;
    queryClient.clear();
    await leave();
    return true;
  }, [api, leave, queryClient]);

  return { pending: logout.isPending, signOut, signOutEverywhere };
};
