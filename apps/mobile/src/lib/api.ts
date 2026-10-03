import { createApiClient, createRefreshCoordinator } from "@nw/api";
import { env } from "@/lib/env";
import {
  clearSession,
  readAccessToken,
  readRefreshToken,
  saveSession,
} from "@/lib/session-store";

/**
 * The native API client.
 *
 * Same `@nw/api` as the web app, same 22 endpoint modules, same refresh
 * coordinator — three lines of configuration are the whole difference:
 *
 * - `getToken` reads SecureStore instead of returning nothing.
 * - `withCredentials` is off; there are no cookies to send.
 * - the refresh presents the stored refresh token in a header, because there is
 *   no cookie for the server to read it from.
 *
 * See MONOREPO_MIGRATION_PLAN §4.1 for why this shape, and for the backend
 * change it depends on.
 */

/** The header user-service reads the refresh token from for a native client. */
export const REFRESH_HEADER = "X-NW-REFRESH-TOKEN";

/** Marks the request as native, which is what makes the API answer with tokens. */
export const NATIVE_CLIENT_HEADER = { "X-NW-Client": "native" };

/**
 * Set once a refresh comes back 401, cleared when a session is established.
 * Without it a signed-out user pays for a refresh attempt behind every 401 on a
 * public screen, and enough of those trip the endpoint's rate limit.
 */
let refreshKnownDead = false;

export const markSessionEstablished = () => {
  refreshKnownDead = false;
};

/**
 * What else has to go when the server refuses the refresh token.
 *
 * Clearing the keychain alone left the cached home feed and friends' profiles
 * in memory and on disk, where the next account to sign in on the device got
 * them back. The root layout owns the query client, so it registers the
 * cleanup here rather than this module importing React state.
 */
let onSessionLost: (() => Promise<void> | void) | null = null;

export const setSessionLostHandler = (handler: () => Promise<void> | void) => {
  onSessionLost = handler;
};

/**
 * One rotation at a time, however many requests are waiting.
 *
 * Refresh tokens are single-use: rotating one spends it. Two concurrent
 * rotations would present an already-spent token, user-service reads that as
 * reuse, and the answer to reuse is revoking the whole session family — so
 * racing refreshes log the user out rather than keeping them signed in. This is
 * the same guard the web client uses, from the same shared module.
 */
const refresh = createRefreshCoordinator(async () => {
  if (refreshKnownDead) return false;

  const token = readRefreshToken();
  if (!token) {
    refreshKnownDead = true;
    return false;
  }

  try {
    const response = await fetch(
      `${env.RP_SERVICE_URL}/rp/user/account/refresh`,
      {
        headers: {
          "Content-Type": "application/json",
          [REFRESH_HEADER]: token,
          ...NATIVE_CLIENT_HEADER,
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      refreshKnownDead = true;
      await clearSession();
      await Promise.resolve(onSessionLost?.()).catch(() => {});
      return false;
    }

    const body = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    // A rotation that returns no new pair is a backend that has not learned the
    // native mode yet. Treating it as success would leave the client replaying
    // requests with the same expired token forever.
    if (!body.accessToken || !body.refreshToken) {
      refreshKnownDead = true;
      return false;
    }

    await saveSession({
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    });
    return true;
  } catch {
    return false;
  }
});

export const refreshSessionNow = (): Promise<boolean> => refresh();

const shared = {
  authHeaderName: "X-NW-AUTH-TOKEN",
  baseUrl: env.RP_SERVICE_URL,
  /**
   * On *every* request, not only the refresh.
   *
   * This is what asks user-service for the token pair in the response body;
   * without it `/account/login` answers a native client exactly as it answers a
   * browser — cookies only, no tokens — and login fails with "native token mode
   * is not enabled on the API yet" even though it is.
   *
   * That failure hid itself: React Native's HTTP stack keeps cookies in an
   * OkHttp jar the app never sees, so the cookie session worked anyway and the
   * next launch looked signed in while the keychain was empty. Every request
   * was then riding a cookie the refresh coordinator cannot rotate, because it
   * presents the refresh token in a header it had never been given.
   */
  defaultHeaders: NATIVE_CLIENT_HEADER,
  getToken: () => readAccessToken(),
  log: (label: string, status: number) => {
    if (__DEV__) console.log(`api:${label}`, status);
  },
  // No cookie jar in play. Everything travels in headers.
  withCredentials: false,
};

/** Attaches the session when there is one; happy without, for public screens. */
export const api = createApiClient({ ...shared, refreshSession: refresh });

/** A session is mandatory — the call short-circuits to 401 without one. */
export const authedApi = createApiClient({
  ...shared,
  refreshSession: refresh,
  requireAuth: true,
});
