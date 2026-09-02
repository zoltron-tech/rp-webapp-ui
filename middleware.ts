import { next } from "@vercel/edge";
import {
  RESERVED_TOP_LEVEL_SEGMENTS,
  USERNAME_PATH_RE,
} from "./src/utils/constants/reserved-paths";

/**
 * Vercel Edge Middleware — ported from `src/middleware.ts`.
 *
 * Both behaviours must stay at the HTTP layer because both are redirects issued
 * before any JS runs.
 *
 * ⚠ **Confirm this file is actually applied before relying on it.** It was Next
 * middleware; Vercel supports a root `middleware.ts` for non-Next projects too,
 * but that has to be verified on a preview deployment rather than assumed. If
 * it is not applied, move both rules into the Hono function and rewrite the
 * matching paths to it from vercel.json — the ordering rule below survives the
 * move unchanged.
 *
 * **Order is load-bearing and fails silently.** The username rule matches any
 * unclaimed single-segment path, so it must be evaluated *before* the SPA
 * fallback that serves index.html for everything. Get it backwards and every
 * `/{username}` serves the app shell; the client router then matches nothing,
 * `not-found` redirects to Novelists, and the entire short-link feature is gone
 * with no error logged anywhere — in production, where the client has no
 * logging at all.
 *
 * See REACT_MIGRATION_STEPS.md C2.
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

export const config = {
  // Everything except build output, the function itself, and the static files
  // that would otherwise cost a backend lookup each (see reserved-paths.ts).
  matcher: [
    "/((?!assets/|api/|favicon.ico|icons/|images/|models/|animations/|promo/|sw\\.js|workbox-.*\\.js|swe-worker-.*\\.js|worker-.*\\.js).*)",
  ],
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);

  // ── 1. Strip tracking query params ────────────────────────────────────────
  const hasTracking = TRACKING_PARAMS.some((key) =>
    url.searchParams.has(key),
  );

  if (hasTracking) {
    const clean = new URL(url);
    for (const key of TRACKING_PARAMS) clean.searchParams.delete(key);
    // 308 preserves the HTTP method (important for POST/form flows)
    return Response.redirect(clean.toString(), 308);
  }

  // ── 2. Short-URL redirect: /{username} → /rp/profile/{username} ───────────
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length === 1) {
    const candidate = segments[0];

    if (
      !RESERVED_TOP_LEVEL_SEGMENTS.has(candidate) &&
      USERNAME_PATH_RE.test(candidate)
    ) {
      const serviceUrl = process.env.RP_SERVICE_URL;

      if (serviceUrl) {
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
            return Response.redirect(destination.toString(), 302);
          }
        } catch {
          // Timeout or network error — fall through and serve the app normally.
        }
      }
    }
  }

  return next();
}
