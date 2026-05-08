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

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const hasTracking = [...searchParams.keys()].some((key) =>
    TRACKING_PARAMS.has(key),
  );

  if (!hasTracking) return NextResponse.next();

  const clean = request.nextUrl.clone();
  for (const key of TRACKING_PARAMS) {
    clean.searchParams.delete(key);
  }

  // 308 preserves the HTTP method (important for POST/form flows)
  return NextResponse.redirect(clean, { status: 308 });
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|sw\\.js|workbox-.*\\.js|swe-worker-.*\\.js|worker-.*\\.js).*)",
  ],
};
