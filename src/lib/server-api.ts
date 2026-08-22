import { createApiClient } from "@nw/api";
import getConfig from "next/config";
import { getAuthCookie, getJWTIfExists } from "@/app/actions";
import { AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

// `serverRuntimeConfig` is empty in the browser, which would silently produce a
// client pointed at "undefined/rp/…". Fail loudly instead — this module is for
// server actions only. (`server-only` would say the same thing, but it is not a
// declared dependency here.)
if (!RP_SERVICE_URL) {
  throw new Error(
    "server-api was loaded outside a server context: RP_SERVICE_URL is unset.",
  );
}

/**
 * Two clients, because the app has always had two auth postures and they are
 * not interchangeable:
 *
 *   `api`       — attaches the token when there is one, and is happy without.
 *                 Signed-out visitors get public data.
 *   `authedApi` — a session is mandatory. Without a token the call stops before
 *                 the network and comes back as a 401, which the action reports
 *                 to its caller like any other failure.
 *
 * Neither redirects. The old `authenticateAndGetJWT` bounced the user to the
 * login page from inside the data layer, which meant an action could never
 * simply say "not signed in" — and a native client has nowhere to bounce to.
 * Deciding what an unauthenticated result means is the screen's job.
 *
 * Both share every endpoint function in @nw/api; only the posture differs.
 */
// `getToken` is wrapped rather than passed directly: app/actions imports this
// module and this module imports app/actions, so naming the const at module
// scope would read it while it is still in its temporal dead zone. Calling it
// through a closure defers the lookup to request time, when both modules are
// fully initialised.
const shared = {
  authHeaderName: AUTH_HEADER_NAME,
  baseUrl: RP_SERVICE_URL,
  getToken: () => getJWTIfExists(),
  log: (label: string, status: number) => Logger.debug(label, status),
};

export const api = createApiClient(shared);

export const authedApi = createApiClient({ ...shared, requireAuth: true });

/**
 * Reads the cookie without validating it.
 *
 * `getJWTIfExists` clears a stale cookie, and clearing a cookie is a write —
 * which throws outside a Server Action's own context. The guide endpoints are
 * called from read paths, where that throw would take the page down over a
 * guide nobody asked for. The service validates the token anyway; a bad one
 * comes back 401, which those callers already read as "unknown".
 */
export const cookieApi = createApiClient({
  ...shared,
  getToken: () => getAuthCookie(),
  requireAuth: true,
});
