import { Hono } from "hono";
import { handle } from "hono/vercel";
import { discord } from "./_discord";
import { klipy } from "./_klipy";
import { og } from "./_og";
import { portfolio } from "./_portfolio";

/**
 * The BFF — one Hono app behind a single Vercel Function.
 *
 * Replaces the seven `app/api/*` route handlers and the four `pages/api` ones
 * with a single deployable unit. `vercel.json` routes `/api/*` here, plus the
 * two storyboard patterns that need Open Graph injection.
 *
 * **Same-origin is the whole design.** All 18 client `fetch("/api/…")` call
 * sites use relative URLs, so none of them changed and none needs CORS. That is
 * free on Vercel, where the CDN serves `dist/` and rewrites `/api/*` to this
 * function — it is not the nginx arrangement REACT_MIGRATION_PLAN.md §10
 * assumed.
 *
 * **Node runtime, not Edge.** `@nw/utils` and the image transforms are plain
 * JS and would run on either, but Node is what these handlers ran on before and
 * the difference buys nothing here.
 *
 * See REACT_MIGRATION_STEPS.md C1.
 */

export const config = { runtime: "nodejs" };

const app = new Hono();

// Order matters, though far less than it does for the username rule in
// middleware.ts: these paths are disjoint. `/api/*` is mounted first simply
// because it is the overwhelming majority of the traffic.
app.route("/api/discord", discord);
app.route("/api", klipy);
app.route("/api", portfolio);

// Not under /api: these are real page URLs that happen to need a server-side
// pass for their link preview. See _og.ts.
app.route("/", og);

app.get("/api/health", (c) => c.json({ ok: true }));

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error("Unhandled BFF error:", err);
  return c.json({ error: "Internal error" }, 500);
});

/** Exported for local smoke-testing via `app.request(...)`. */
export { app };

export default handle(app);
