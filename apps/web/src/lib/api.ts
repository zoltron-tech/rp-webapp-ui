import { createApiClient, createRefreshCoordinator } from "@nw/api";
import { refreshSession } from "@nw/api/endpoints/account";
import { env } from "@/lib/env";
import { AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

/**
 * The browser API client.
 *
 * **The token is no longer here.** It used to be read out of `document.cookie`
 * and attached as a header by this file, which is precisely why the cookie could
 * not be `httpOnly` and why any XSS on novelist.world walked away with a bearer
 * token good for a day (SECURITY_AUTH_PLAN C5). Both auth cookies are now
 * `httpOnly`; the browser attaches them itself because every request goes out
 * with `credentials: "include"`, and user-service copies the access cookie into
 * the header its controllers read.
 *
 * `getToken` stays in the config, always returning nothing, for two reasons: the
 * shared client is also the native client, where the token really does live in
 * SecureStore and really must be attached by hand; and a handful of endpoints
 * (verification and password-reset links) carry a token that did not come from
 * the session and pass it explicitly per request.
 *
 * See REACT_MIGRATION_STEPS.md B13 and SECURITY_AUTH_PLAN Phase 2.
 */

if (!env.RP_SERVICE_URL) {
  // Same posture as before: fail loudly rather than build a client that quietly
  // requests "undefined/rp/…".
  throw new Error(
    "api: VITE_RP_SERVICE_URL is unset — the API client has no base URL.",
  );
}

/**
 * Set once a refresh has come back 401, and cleared when a session is
 * established again.
 *
 * Without it a signed-out visitor pays for a `POST /account/refresh` behind
 * every request that 401s — on a public page, every authenticated-only call the
 * screen happens to make. There is nothing to renew and the answer will not
 * change until the user signs in, so asking again is pure noise, and enough of
 * it trips the rate limit sitting in front of that endpoint.
 */
let refreshKnownDead = false;

/**
 * Tells the client a session now exists, so refreshing is worth attempting
 * again. Called by the flows that establish one — login, signup, and a
 * successful `/account/auth`.
 */
export const markSessionEstablished = () => {
  refreshKnownDead = false;
};

/**
 * One rotation at a time, however many requests are waiting on it.
 *
 * This matters more than it looks. Refresh tokens are single-use: rotating one
 * spends it. If two requests each started their own rotation, the second would
 * present a token the first had already spent, user-service would read that as
 * token *reuse*, and the correct response to reuse is to revoke the entire
 * session family. Parallel refreshes would therefore log the user out rather
 * than keep them signed in.
 */
const refresh = createRefreshCoordinator(async () => {
  if (refreshKnownDead) return false;

  const ok = await refreshSession(anonymousApi);
  if (!ok) {
    Logger.debug("Session refresh failed; the session is over");
    refreshKnownDead = true;
  }
  return ok;
});

/**
 * Renew the session now, rather than waiting for something to fail on it.
 *
 * Shares the coordinator above, which is the whole reason it lives here: a
 * proactive refresh that started its own rotation alongside a reactive one
 * would present an already-spent token, and the server answers a spent token by
 * revoking the entire session family. Same promise, one rotation.
 */
export const refreshSessionNow = (): Promise<boolean> => refresh();

const shared = {
  authHeaderName: AUTH_HEADER_NAME,
  baseUrl: env.RP_SERVICE_URL,
  // Nothing to return on web: the session is a cookie the browser holds and
  // this code cannot see. Native overrides this with its SecureStore read.
  getToken: () => undefined,
  log: (label: string, status: number) => Logger.debug(label, status),
  withCredentials: true,
};

/**
 * The client used for the refresh call itself.
 *
 * It must not have `refreshSession` set: a 401 from `/account/refresh` would
 * otherwise trigger a refresh, which would 401, forever.
 */
const anonymousApi = createApiClient(shared);

/**
 * Attaches the session when there is one and is happy without: signed-out
 * visitors get public data.
 */
export const api = createApiClient({ ...shared, refreshSession: refresh });

/**
 * A session is mandatory.
 *
 * With cookie sessions the client can no longer tell in advance whether one
 * exists — that is the server's answer, not something readable here — so this
 * differs from `api` only in intent. The call goes out, and a 401 comes back
 * like any other failure. Neither client redirects: deciding what "not signed
 * in" means is the screen's job.
 */
export const authedApi = createApiClient({
  ...shared,
  refreshSession: refresh,
  requireAuth: true,
});

/** Kept so the export surface matches `server-api.ts` and no importer has to know which build it is in. */
export const cookieApi = authedApi;

/**
 * Was: clear a cookie whose token had already expired.
 *
 * Now a no-op, and kept only so the two call sites do not have to change shape.
 * An expired access token is no longer something to clean up — it is the normal
 * state of any tab left open for fifteen minutes, and the next request renews it
 * transparently. The cookie is also `httpOnly`, so this code could not clear it
 * even if it wanted to.
 */
export const dropStaleAuthCookie = () => {};
