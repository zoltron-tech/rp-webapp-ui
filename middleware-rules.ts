/**
 * The HTTP-layer rules, as plain logic with no runtime attached.
 *
 * They exist in one place because they have to run in three: Vercel Edge
 * Middleware in production, the Vite dev server, and `vite preview`. Under
 * Next these ran in the dev server for free — Next executed `src/middleware.ts`
 * locally. Vercel Edge Middleware does not work that way: it only runs when
 * deployed. Nothing failed loudly when that changed. See
 * REACT_MIGRATION_STEPS.md C2 and finding 30.
 *
 * **This used to also resolve `/{username}` short links**, which meant a
 * backend lookup, a 2s timeout and a reserved-word list on the hot path of
 * every root request. `/@username` made all three unnecessary: the `@` tells a
 * profile from a path without asking anyone, so the redirect is now a route in
 * the client router and nothing here needs to know what a username is. See
 * `src/utils/constants/profile-handle.ts`.
 */

/**
 * Tracking parameters injected by external platforms that should be stripped
 * from URLs before the app loads. These params carry no meaning inside the app
 * and can cause cache pollution, analytics noise, and ugly shared links.
 *
 * fbclid  — Facebook / Messenger click identifier
 * gclid   — Google Ads click identifier
 * msclkid — Microsoft Ads click identifier
 * ttclid  — TikTok click identifier
 * twclid  — Twitter/X click identifier
 * igshid  — Instagram share identifier
 */
const TRACKING_PARAMS = [
  "fbclid",
  "gclid",
  "msclkid",
  "ttclid",
  "twclid",
  "igshid",
];

/** What should happen to a request: send it somewhere, or leave it alone. */
export type MiddlewareDecision =
  | { kind: "continue" }
  | { kind: "redirect"; location: string; status: 308 };

/**
 * Paths that belong to the serving infrastructure rather than the app.
 *
 * In production this is the middleware `matcher`'s job. In development Vite
 * serves its own client, source modules and dependency pre-bundles from paths
 * that no matcher covers, so the dev server checks these instead.
 */
export const INFRA_PATH_RE =
  /^\/(?:@vite\/|@id\/|@fs\/|@react-refresh|assets\/|api\/|src\/|node_modules\/)/;

/** Decides what to do with a request URL. */
export const decide = (url: URL): MiddlewareDecision => {
  if (TRACKING_PARAMS.some((key) => url.searchParams.has(key))) {
    const clean = new URL(url);
    for (const key of TRACKING_PARAMS) clean.searchParams.delete(key);
    // 308 preserves the HTTP method (important for POST/form flows)
    return { kind: "redirect", location: clean.toString(), status: 308 };
  }

  return { kind: "continue" };
};
