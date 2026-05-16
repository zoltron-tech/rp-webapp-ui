import { type NextRequest, NextResponse } from "next/server";

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
const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "msclkid",
  "ttclid",
  "twclid",
  "igshid",
]);

/**
 * Top-level path segments that belong to the app itself and must never be
 * treated as candidate usernames.
 */
const KNOWN_SEGMENTS = new Set([
  "rp",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "icons",
  "sw.js",
  "workbox",
  "worker",
  "models",
  "animations",
  "assets",
  "public",
]);

/**
 * Same validation rule used in the front-end (see checkUsernameInvalidity).
 * Must be 3–50 chars, only letters / digits / underscore / dot / hyphen.
 */
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,50}$/;

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── 1. Strip tracking query params ────────────────────────────────────────
  const hasTracking = [...searchParams.keys()].some((key) =>
    TRACKING_PARAMS.has(key),
  );

  if (hasTracking) {
    const clean = request.nextUrl.clone();
    for (const key of TRACKING_PARAMS) {
      clean.searchParams.delete(key);
    }
    // 308 preserves the HTTP method (important for POST/form flows)
    return NextResponse.redirect(clean, { status: 308 });
  }

  // ── 2. Short-URL redirect: /{username} → /rp/profile/{username} ───────────
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 1) {
    const candidate = segments[0];

    if (!KNOWN_SEGMENTS.has(candidate) && USERNAME_RE.test(candidate)) {
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
            const destination = request.nextUrl.clone();
            destination.pathname = `/rp/profile/${candidate}`;
            return NextResponse.redirect(destination, { status: 302 });
          }
        } catch {
          // Timeout or network error — fall through and let Next.js render normally.
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|sw\\.js|workbox-.*\\.js|swe-worker-.*\\.js|worker-.*\\.js).*)",
  ],
};
