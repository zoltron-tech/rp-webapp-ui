/**
 * Smoke test for the HTTP-layer rules and the profile handle — `pnpm smoke:mw`.
 *
 * This used to be mostly about the `/{username}` short link, which was the one
 * behaviour in the migration with no visible failure mode: if it stopped
 * matching, the shell rendered, the router matched nothing, `not-found`
 * redirected to Novelists, and the feature was simply gone.
 *
 * `/@username` retired that whole class of failure. There is no lookup left to
 * stub and no reserved-word list left to keep in step with `public/`, so what
 * remains here is the tracking-parameter rule plus the handle helpers that the
 * route guard is built on.
 *
 * Note the limit of this file, unchanged: it calls the rules directly, so it
 * cannot tell you whether they are *wired* to a running server. `pnpm
 * smoke:routes` is what checks that.
 */

import { decide } from "../middleware-rules";
import {
  isProfileHandle,
  toHandle,
  usernameFromHandle,
} from "../src/utils/constants/profile-handle";

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = String(actual) === String(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}` +
      (ok
        ? `  (${actual})`
        : `\n      got:      ${actual}\n      expected: ${expected}`),
  );
};

const call = (path: string) => {
  const decision = decide(new URL(`https://novelist.world${path}`));
  return decision.kind === "redirect"
    ? { location: decision.location, status: decision.status }
    : { location: null, status: 200 };
};

// ── Tracking parameters ─────────────────────────────────────────────────────
let r = call("/rp/explore?fbclid=abc123");
check("fbclid → 308", r.status, 308);
check("fbclid stripped", r.location, "https://novelist.world/rp/explore");

r = call("/rp/explore?gclid=a&igshid=b&keep=yes");
check(
  "multiple trackers stripped, others kept",
  r.location,
  "https://novelist.world/rp/explore?keep=yes",
);

r = call("/rp/explore?keep=yes");
check("no tracker → no redirect", r.status, 200);

r = call("/@tokyo?fbclid=abc");
check("tracker on a profile → stripped", r.location, "https://novelist.world/@tokyo");

// ── Paths the rules must leave alone ────────────────────────────────────────
//
// Every one of these needed an entry in a reserved-word list before the `@`.
// They are here to document that none of them can collide any more, not
// because the rule below them is doing any work.
for (const path of [
  "/@tokyo",
  "/@tokyo/muses",
  "/tokyo",
  "/rp/profile/tokyo",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/og_image.png",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
  "/registerSW.js",
  "/index.html",
  "/promo/muse",
  "/icons",
  "/images",
  "/models",
]) {
  check(`untouched ${path}`, call(path).status, 200);
}

// ── The handle itself ───────────────────────────────────────────────────────
check("toHandle", toHandle("tokyo"), "@tokyo");
check("usernameFromHandle", usernameFromHandle("@tokyo"), "tokyo");
check("usernameFromHandle tolerates a bare name", usernameFromHandle("tokyo"), "tokyo");
check("usernameFromHandle of undefined", usernameFromHandle(undefined), "");
check("round trip", usernameFromHandle(toHandle("a.b-c_d")), "a.b-c_d");

check("@tokyo is a handle", isProfileHandle("@tokyo"), true);
check("tokyo is not", isProfileHandle("tokyo"), false);
check("a bare @ is not", isProfileHandle("@"), false);
check("undefined is not", isProfileHandle(undefined), false);
// `@` is not a legal username character, so no username can produce a segment
// that collides with a path the app owns — the whole point of the prefix.
check("rp is not a handle", isProfileHandle("rp"), false);
check("promo is not a handle", isProfileHandle("promo"), false);
check("favicon.ico is not a handle", isProfileHandle("favicon.ico"), false);

if (failures > 0) throw new Error(`${failures} check(s) failed`);
console.log("\nALL PASS");
