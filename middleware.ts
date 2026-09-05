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
 * All that is left here is stripping tracking parameters. The `/{username}`
 * short link used to live here too, and needed a backend lookup and a
 * reserved-word list to tell a username from one of the app's own paths;
 * `/@username` removed the need for both, and the redirect is a route in the
 * client router now.
 *
 * See REACT_MIGRATION_STEPS.md C2.
 */

export const config = {
  // Everything except build output, the function itself, and the static files
  // that would otherwise invoke the function for nothing.
  matcher: [
    "/((?!assets/|api/|favicon.ico|icons/|images/|models/|animations/|promo/|sw\.js|workbox-.*\.js|swe-worker-.*\.js|worker-.*\.js).*)",
  ],
};

export default function middleware(request: Request) {
  const decision = decide(new URL(request.url));

  return decision.kind === "redirect"
    ? Response.redirect(decision.location, decision.status)
    : next();
}
