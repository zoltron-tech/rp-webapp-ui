import { createApiClient } from "@nw/api";
import { validateJWTSync } from "@nw/utils";
import { readAuthCookie, removeAuthCookieSync } from "@/lib/auth-cookie";
import { env } from "@/lib/env";
import { AUTH_HEADER_NAME } from "@/utils/constants";
import { Logger } from "@/utils/services";

/**
 * The browser API client — the Vite counterpart to `lib/server-api.ts`.
 *
 * `vite.config.ts` aliases `@/lib/server-api` to this module, so the 20 action
 * files and all 147 of their importers keep their existing import paths,
 * exported names and signatures. Under Next they still go through a server
 * action; under Vite the same functions are ordinary async calls straight to
 * the API. That is the whole of the change the plan describes as "a client
 * swap, not a rewrite".
 *
 * The `"use server"` pragma at the top of those action files is inert here —
 * Rollup treats a module-level directive it does not recognise as a no-op
 * string — so none of them needs editing.
 *
 * **One hop disappears.** The token used to be read server-side and attached
 * there; now the browser reads it and attaches it. The cookie is already
 * `httpOnly: false` and `validateJWTSync` already runs client-side, so this
 * changes how many places read the token, not whether it is reachable.
 *
 * When SECURITY_AUTH_PLAN flips the cookie to `httpOnly: true`, `getToken`
 * below is the single seam that changes — to credentialed CORS, per C7. Native
 * keeps SecureStore plus the same header, which is why `createApiClient` takes
 * these as inputs at all.
 *
 * See REACT_MIGRATION_STEPS.md B13.
 */

if (!env.RP_SERVICE_URL) {
  // Same posture as the server client: fail loudly rather than build a client
  // that quietly requests "undefined/rp/…".
  throw new Error(
    "api: VITE_RP_SERVICE_URL is unset — the API client has no base URL.",
  );
}

const shared = {
  authHeaderName: AUTH_HEADER_NAME,
  baseUrl: env.RP_SERVICE_URL,
  getToken: () => readAuthCookie(),
  log: (label: string, status: number) => Logger.debug(label, status),
};

/**
 * Attaches the token when there is one and is happy without: signed-out
 * visitors get public data.
 */
export const api = createApiClient(shared);

/**
 * A session is mandatory. Without a token the call stops before the network and
 * comes back as a 401, which the action reports to its caller like any other
 * failure. Neither client redirects — deciding what "not signed in" means is
 * the screen's job.
 */
export const authedApi = createApiClient({ ...shared, requireAuth: true });

/**
 * Reads the cookie without validating it.
 *
 * On the server this existed because clearing a stale cookie is a write, and
 * writes throw outside a Server Action. In the browser there is no such rule,
 * so the distinction has no teeth — but the two clients are kept separate
 * anyway so the export surface matches `server-api.ts` exactly and no importer
 * has to know which build it is in.
 */
export const cookieApi = createApiClient({ ...shared, requireAuth: true });

/**
 * Clears a cookie whose token is already expired.
 *
 * The server client could not do this from a read path; the browser can, so the
 * stale value stops being re-sent on every subsequent request. Deliberately
 * silent: an invalid token is reported by the 401 the caller already handles.
 */
export const dropStaleAuthCookie = () => {
  const token = readAuthCookie();
  if (token && !validateJWTSync(token)) removeAuthCookieSync();
};
