/**
 * Smoke test for the Open Graph function — run with `pnpm smoke:bff`.
 *
 * Not a test suite, and not the start of one: this exists because the OG
 * injection's failure mode is invisible to `tsc` and to the build. A wrong card
 * ships a generic preview to the exact audience shared story links exist for,
 * and nobody notices until someone posts one in Discord.
 *
 * It stubs `fetch`, so it needs no network and no credentials. It checks the
 * things that fail silently: that the meta tags are *rewritten* rather than
 * duplicated, that HTML is escaped, that the chapter card inherits its parent's
 * name and cover, and that a missing story falls back to the site-wide card
 * instead of a broken one.
 *
 * See REACT_MIGRATION_STEPS.md C8.
 */

import { readFileSync } from "node:fs";
import { app } from "../api/index";

const shell = readFileSync("index.html", "utf8");
const realFetch = globalThis.fetch;

const STORY = {
  name: "The Hollow Crown",
  description: "<p>A <b>tale</b> of &amp; ruin &lt;spanning&gt; ages.</p>",
  image: "https://cdn.example/story.png",
};
const EVENT = {
  name: "Chapter 3",
  description: "<p>Deeper still.</p>",
  storyBoardId: "sb-1",
  image: null,
  avatar: null,
};

globalThis.fetch = (async (input: any, init?: any) => {
  const url = String(input);
  if (url.endsWith("/index.html")) {
    return new Response(shell, { headers: { "Content-Type": "text/html" } });
  }
  if (url.includes("/rp/portfolio/story/event/")) {
    return new Response(JSON.stringify(EVENT), { headers: { "Content-Type": "application/json" } });
  }
  if (url.includes("/rp/portfolio/story/")) {
    return new Response(JSON.stringify(STORY), { headers: { "Content-Type": "application/json" } });
  }
  if (url.includes("/rp/portfolio/muse/random")) {
    return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
  }
  return realFetch(input, init);
}) as typeof fetch;

const grab = (html: string, re: RegExp) => html.match(re)?.[1] ?? "(absent)";
let failures = 0;
const check = (label: string, actual: string, expected: string) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}\n      got:      ${actual}${ok ? "" : `\n      expected: ${expected}`}`);
};

const run = async () => {
  // ── story ──
  let res = await app.request("https://novelist.world/rp/story/sb-1");
  console.log("story status:", res.status, "cache:", res.headers.get("cache-control"));
  let html = await res.text();
  check("story <title>", grab(html, /<title>([^<]*)<\/title>/), "The Hollow Crown");
  check("story og:title", grab(html, /<meta\s+property="og:title"\s+content="([^"]*)"/), "The Hollow Crown");
  check("story og:description", grab(html, /<meta\s+property="og:description"\s+content="([^"]*)"/), "A tale of &amp; ruin &lt;spanning&gt; ages.");
  check("story og:image", grab(html, /<meta\s+property="og:image"\s+content="([^"]*)"/), "https://cdn.example/story.png");
  check("story og:type", grab(html, /<meta\s+property="og:type"\s+content="([^"]*)"/), "article");
  check("twitter:image", grab(html, /<meta\s+name="twitter:image"\s+content="([^"]*)"/), "https://cdn.example/story.png");
  console.log("  og:title occurrences:", (html.match(/property="og:title"/g) || []).length);

  // ── chapter: parent name appended, parent cover inherited ──
  res = await app.request("https://novelist.world/rp/story/event/ev-9");
  html = await res.text();
  check("chapter <title>", grab(html, /<title>([^<]*)<\/title>/), "Chapter 3 — The Hollow Crown");
  check("chapter og:image (parent fallback)", grab(html, /<meta\s+property="og:image"\s+content="([^"]*)"/), "https://cdn.example/story.png");

  // ── missing story → untouched shell ──
  const saved = globalThis.fetch;
  globalThis.fetch = (async (input: any) => {
    const url = String(input);
    if (url.endsWith("/index.html")) return new Response(shell, { headers: { "Content-Type": "text/html" } });
    return new Response("null", { status: 404 });
  }) as typeof fetch;
  res = await app.request("https://novelist.world/rp/story/missing");
  html = await res.text();
  check("missing story keeps default title", grab(html, /<title>([^<]*)<\/title>/), "Novelist World — Live Roleplay Chat &amp; Writing Community");
  globalThis.fetch = saved;

  // ── health + 404 ──
  res = await app.request("https://novelist.world/api/health");
  check("health", String(res.status), "200");
  res = await app.request("https://novelist.world/api/nope");
  check("unknown api 404", String(res.status), "404");


  if (failures > 0) {
    // Thrown rather than `process.exit`: the shared packages narrow the
    // ambient `process` type to `{ env }`, and an unhandled rejection is a
    // non-zero exit either way.
    throw new Error(`${failures} smoke check(s) failed`);
  }
  console.log("\nALL PASS");
};

process.env.RP_SERVICE_URL = "https://api.novelist.world";
run();
