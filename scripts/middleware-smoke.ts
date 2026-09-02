/**
 * Smoke test for the edge middleware — run with `pnpm smoke:mw`.
 *
 * The `/{username}` short link is the one behaviour in the whole migration
 * with no visible failure mode. If it stops matching, the app shell renders,
 * the client router matches nothing, `not-found` redirects to Novelists, and
 * the feature is simply gone — no error, no log, nothing to notice.
 *
 * The reserved-path checks matter for a second reason. `USERNAME_PATH_RE`
 * allows dots, so `favicon-32x32.png` is a valid username shape; if the
 * reserved set does not cover a file served from the root of `public/`, every
 * request for it costs a backend lookup and up to a 2s timeout. These assert
 * that no lookup is even attempted.
 *
 * Stubs `fetch`, so no network and no credentials.
 *
 * See REACT_MIGRATION_STEPS.md C2.
 */

import * as mod from "../middleware";

type Middleware = (request: Request) => Promise<Response | undefined>;

// tsx's interop can double-wrap the default export depending on entry format.
const middleware = ((mod as { default?: unknown }).default as {
  default?: Middleware;
})?.default ?? ((mod as { default?: Middleware }).default as Middleware);

const realFetch = globalThis.fetch;

let lookups: string[] = [];
let backend: "found" | "missing" | "timeout" = "found";

globalThis.fetch = (async (input: unknown) => {
  const url = String(input);
  lookups.push(url);
  if (backend === "timeout") throw new Error("simulated timeout");
  if (backend === "missing") return new Response("null", { status: 404 });
  return new Response(JSON.stringify({ username: "someone" }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}) as typeof fetch;

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = String(actual) === String(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}` +
      (ok ? `  (${actual})` : `\n      got:      ${actual}\n      expected: ${expected}`),
  );
};

const call = async (path: string) => {
  lookups = [];
  const res = await middleware(new Request(`https://novelist.world${path}`));
  return {
    location: res?.headers.get("location") ?? null,
    lookups: lookups.length,
    status: res?.status ?? 0,
  };
};

const run = async () => {
  process.env.RP_SERVICE_URL = "https://api.novelist.world";

  // ── Tracking parameters ──────────────────────────────────────────────────
  let r = await call("/rp/explore?fbclid=abc123");
  check("fbclid → 308", r.status, 308);
  check("fbclid stripped", r.location, "https://novelist.world/rp/explore");

  r = await call("/rp/explore?gclid=a&igshid=b&keep=yes");
  check("multiple trackers stripped, others kept", r.location,
    "https://novelist.world/rp/explore?keep=yes");

  r = await call("/rp/explore?keep=yes");
  check("no tracker → no redirect", r.status, 200);

  // ── Username short link ──────────────────────────────────────────────────
  backend = "found";
  r = await call("/someuser");
  check("known username → 302", r.status, 302);
  check("… to the profile", r.location, "https://novelist.world/rp/profile/someuser");
  check("… after exactly one lookup", r.lookups, 1);

  backend = "missing";
  r = await call("/nobodyhere");
  check("unknown username falls through", r.status, 200);

  backend = "timeout";
  r = await call("/whoever");
  check("backend timeout falls through", r.status, 200);
  backend = "found";

  // ── Reserved paths: must not even be looked up ───────────────────────────
  for (const path of [
    "/favicon.ico",
    "/favicon-32x32.png",
    "/apple-touch-icon.png",
    "/android-chrome-192x192.png",
    "/safari-pinned-tab.svg",
    "/browserconfig.xml",
    "/og_image.png",
    "/manifest.json",
    "/manifest.webmanifest",
    "/robots.txt",
    "/sitemap.xml",
    "/rp",
    "/api",
    "/assets",
    "/icons",
    "/images",
    "/models",
  ]) {
    const res = await call(path);
    check(`reserved ${path} → no lookup`, res.lookups, 0);
  }

  // ── Shapes that are not usernames ────────────────────────────────────────
  r = await call("/ab");
  check("2 chars is too short → no lookup", r.lookups, 0);

  r = await call("/rp/profile/someone");
  check("multi-segment path → no lookup", r.lookups, 0);

  r = await call("/has spaces");
  check("invalid characters → no lookup", r.lookups, 0);

  globalThis.fetch = realFetch;

  if (failures > 0) {
    throw new Error(`${failures} middleware check(s) failed`);
  }
  console.log("\nALL PASS");
};

run();
