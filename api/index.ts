import { Hono } from "hono";
import { handle } from "hono/vercel";
import { og } from "./_og";

/**
 * Open Graph injection for shared storyboard links — and nothing else.
 *
 * This was a small BFF holding eleven route handlers inherited from Next.js.
 * All of them have since moved to the portfolio service, which is where server
 * work belongs: the Discord and Klipy proxies existed only to hold a secret,
 * and the reaction and landing-feed handlers were proxying the portfolio
 * service to itself. See REACT_MIGRATION_PLAN.md.
 *
 * What is left cannot move. It rewrites the HTML document before a crawler
 * sees it, so it has to run wherever the document is served — the CDN edge, not
 * the API. Crawlers do not execute JavaScript, so without it a shared story
 * link unfurls with the generic site card.
 *
 * **Do not add routes here.** New server work goes in the Kotlin backend.
 *
 * See REACT_MIGRATION_STEPS.md C8.
 */

export const config = { runtime: "nodejs" };

const app = new Hono();

// Mounted at the root rather than under /api: these are real page URLs that
// happen to need a server-side pass for their link preview. See _og.ts.
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
