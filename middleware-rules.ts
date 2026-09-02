import {
  RESERVED_TOP_LEVEL_SEGMENTS,
  USERNAME_PATH_RE,
} from "./src/utils/constants/reserved-paths";

/**
 * The two HTTP-layer rules, as plain logic with no runtime attached.
 *
 * They exist in one place because they have to run in three: Vercel Edge
 * Middleware in production, the Vite dev server, and `vite preview`. Under
 * Next these ran in the dev server for free — Next executed `src/middleware.ts`
 * locally. Vercel Edge Middleware does not work that way: it only runs when
 * deployed. Nothing failed loudly when that changed; `/{username}` simply
 * served the app shell, the client router matched nothing, and `not-found`
 * redirected to Novelists. See REACT_MIGRATION_STEPS.md C2 and finding 29.
 *
 * Keeping the rules here rather than duplicating them into the dev server is
 * the point: two copies would drift, and the drift would be invisible in
 * exactly the same way.
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
  | { kind: "redirect"; location: string; status: 302 | 308 };

const CONTINUE: MiddlewareDecision = { kind: "continue" };

/**
 * Paths that belong to the serving infrastructure rather than the app.
 *
 * In production this is the middleware `matcher`'s job. In development Vite
 * serves its own client, source modules and dependency pre-bundles from paths
 * that no matcher covers, so the dev server checks these instead.
 */
export const INFRA_PATH_RE =
  /^\/(?:@|assets\/|api\/|src\/|node_modules\/|favicon\.ico|icons\/|images\/|models\/|animations\/|promo\/|sw\.js|sw\.ts|dev-sw\.js|workbox-|swe-worker-|worker-)/;

/**
 * Decides what to do with a request URL.
 *
 * `serviceUrl` is passed in rather than read from the environment because the
 * dev server and the edge runtime get it from different places — `loadEnv` in
 * one, `process.env` in the other.
 *
 * A missing `serviceUrl`, an unknown username, a slow backend and a network
 * error all resolve the same way: continue, and serve the app normally. The
 * short link is a convenience, and none of those are reasons to fail a request.
 */
export const decide = async (
  url: URL,
  serviceUrl: string | undefined,
): Promise<MiddlewareDecision> => {
  // ── 1. Strip tracking query params ────────────────────────────────────────
  if (TRACKING_PARAMS.some((key) => url.searchParams.has(key))) {
    const clean = new URL(url);
    for (const key of TRACKING_PARAMS) clean.searchParams.delete(key);
    // 308 preserves the HTTP method (important for POST/form flows)
    return { kind: "redirect", location: clean.toString(), status: 308 };
  }

  // ── 2. Short-URL redirect: /{username} → /rp/profile/{username} ───────────
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return CONTINUE;

  const candidate = segments[0];
  if (
    RESERVED_TOP_LEVEL_SEGMENTS.has(candidate) ||
    !USERNAME_PATH_RE.test(candidate)
  ) {
    return CONTINUE;
  }

  if (!serviceUrl) return CONTINUE;

  try {
    const res = await fetch(
      `${serviceUrl}/rp/portfolio/novelist/get?username=${encodeURIComponent(candidate)}`,
      {
        method: "GET",
        // Abort quickly so a slow/down backend doesn't stall every request.
        signal: AbortSignal.timeout(2000),
      },
    );

    if (res.ok) {
      const destination = new URL(url);
      destination.pathname = `/rp/profile/${candidate}`;
      return { kind: "redirect", location: destination.toString(), status: 302 };
    }
  } catch {
    // Timeout or network error — fall through and serve the app normally.
  }

  return CONTINUE;
};
