import { next } from "@vercel/edge";
import { decide } from "./middleware-rules";

/**
 * Vercel Edge Middleware — ported from `src/middleware.ts`.
 *
 * Both behaviours must stay at the HTTP layer because both are redirects issued
 * before any JS runs. The rules themselves live in `middleware-rules.ts`: this
 * file is only the edge runtime's way in, and the Vite dev server has its own
 * (see the `middleware-rules-dev` plugin in vite.config.ts). Vercel Edge
 * Middleware runs **only when deployed** — nothing here executes locally, which
 * is why the dev server needs its own entry point rather than reusing this one.
 *
 * ⚠ **Confirm this file is actually applied before relying on it.** It was Next
 * middleware; Vercel supports a root `middleware.ts` for non-Next projects too,
 * but that has to be verified on a preview deployment rather than assumed. If
 * it is not applied, move the call to `decide()` into the Hono function and
 * rewrite the matching paths to it from vercel.json — the ordering rule below
 * survives the move unchanged.
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

export const config = {
  // Everything except build output, the function itself, and the static files
  // that would otherwise cost a backend lookup each (see reserved-paths.ts).
  matcher: [
    "/((?!assets/|api/|favicon.ico|icons/|images/|models/|animations/|promo/|sw\.js|workbox-.*\.js|swe-worker-.*\.js|worker-.*\.js).*)",
  ],
};

export default async function middleware(request: Request) {
  const decision = await decide(
    new URL(request.url),
    process.env.RP_SERVICE_URL,
  );

  return decision.kind === "redirect"
    ? Response.redirect(decision.location, decision.status)
    : next();
}
