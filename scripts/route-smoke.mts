/**
 * Renders every route of the built app in a real browser — `pnpm smoke:routes`.
 *
 * This is a slice of the manual pass the migration plan calls for (D5), not a
 * replacement for it: it cannot see that a page *looks* right, only that it
 * mounts without throwing. What it does catch is the class of failure this
 * migration is most likely to produce — a seam that resolves to the wrong
 * module, a provider that is no longer above a hook, a lazy import that does
 * not resolve — none of which `tsc` or either build can see.
 *
 * **Every backend call is blocked.** The app is pointed at the real API, and a
 * verification script has no business issuing writes to it. Blocking is also
 * the more interesting test: the pages have to survive an API that answers
 * nothing, which is the state a user on a flaky connection is in. Data-dependent
 * UI will be empty or in an error state, and that is expected.
 *
 * Not part of `pnpm verify`: it needs a build, a browser and about a minute.
 *
 * See REACT_MIGRATION_STEPS.md D5.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { findChrome } from "../../promo-gif/lib/browser.mjs";

/**
 * Point the pass at an already-running server instead of spawning one:
 *
 *   SMOKE_ORIGIN=http://localhost:3000 pnpm smoke:routes
 *
 * Useful for two things — comparing the Vite build against `next start` to work
 * out whether a warning is new or pre-existing, and running this against a
 * preview deployment.
 */
const EXTERNAL_ORIGIN = process.env.SMOKE_ORIGIN;

const PORT = 4173;
// `localhost`, not 127.0.0.1: vite preview binds the hostname, and on a
// dual-stack machine that resolves to ::1 first — probing the IPv4 literal
// finds nothing and the wait times out.
const ORIGIN = EXTERNAL_ORIGIN ?? `http://localhost:${PORT}`;

/** Stand-ins for dynamic segments. Nothing resolves; that is fine. */
const PARAM = "smoke-test-id";

/** Hosts the page must not reach. Anything not local is blocked outright. */
const isBlocked = (url: string) => !url.startsWith(ORIGIN);

type Result = {
  route: string;
  status: number | null;
  errors: string[];
  mounted: boolean;
  /** null when the route has no interactive elements to test. */
  clickable: boolean | null;
  finalPath: string;
};

const readRoutes = (): string[] => {
  const src = readFileSync("src/routes.tsx", "utf8");
  const routes: string[] = ["/"];

  for (const block of src.split("children: [").slice(1)) {
    const [childrenPart, rest = ""] = block.split("],");
    const kids = [...childrenPart.matchAll(/\{ path: "([^"]*)", lazy:/g)].map(
      (m) => m[1],
    );
    // The `/rp` and `/:handle` branches are nested under a pathless layout
    // route, so their own `path` is relative ("rp", ":handle") — put the
    // leading slash back before building a URL out of it.
    const prefix = rest.match(/path: "([^"]+)"/)?.[1] ?? "";
    const base = prefix && !prefix.startsWith("/") ? `/${prefix}` : prefix;
    for (const kid of kids) routes.push(`${base}/${kid}`);
  }

  // Profiles are reached by handle, so `:handle` gets the `@` a real URL has.
  // Without it the pass would exercise the legacy bare-name redirect instead
  // of the route it is meant to be checking.
  //
  // Three of these are not in the table's `{ path, lazy }` shape and would
  // otherwise go unrendered: the profile index (an `index: true` route), the
  // legacy `/rp/profile/{name}` path, and the legacy bare `/{name}` short
  // link. The last two are redirects, and a redirect that stops redirecting is
  // exactly the kind of silent breakage this pass exists to catch.
  routes.push("/:handle", "/rp/profile/:slug", `/${PARAM}`);

  return [...new Set(routes)].map((r) =>
    r
      .replace(/:handle/g, `@${PARAM}`)
      .replace(/:[^/]+/g, PARAM),
  );
};

const waitForServer = async (deadlineMs = 60_000) => {
  const deadline = Date.now() + deadlineMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(ORIGIN);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("vite preview did not come up");
};

let blockedRejections = 0;

const visit = async (page: Page, route: string): Promise<Result> => {
  const errors: string[] = [];

  /**
   * Blocking every backend call means the app's own fetches reject, and any
   * that are not caught surface here as "Failed to fetch". That is the
   * harness's doing, so it is not counted — but it is worth knowing that these
   * rejections are now *browser-side*: under Next the same calls happened on
   * the server, so an uncaught one never reached a user's console. Worth a look
   * on its own; not a migration failure.
   */
  const isBlockedFetch = (text: string) =>
    /Failed to fetch|NetworkError|net::ERR_/i.test(text);

  const onError = (err: Error) => {
    if (isBlockedFetch(err.message)) {
      blockedRejections++;
      return;
    }
    errors.push(`pageerror: ${err.message}`);
  };
  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // Blocked requests and their fallout are the harness's doing, not the
    // app's. Anything else is a real error.
    if (/Failed to load resource|ERR_INTERNET_DISCONNECTED/i.test(text)) return;
    if (isBlockedFetch(text)) return;
    errors.push(`console: ${text.slice(0, 200)}`);
  };

  page.on("pageerror", onError);
  page.on("console", onConsole);

  let status: number | null = null;
  try {
    const response = await page.goto(`${ORIGIN}${route}`, {
      timeout: 20_000,
      waitUntil: "domcontentloaded",
    });
    status = response?.status() ?? null;
    // Give React a moment to mount and any redirect effect to run.
    await new Promise((r) => setTimeout(r, 900));
  } catch (err) {
    errors.push(`navigation: ${(err as Error).message}`);
  }

  // Build-agnostic on purpose: the Vite app renders into #root, Next renders
  // straight into <body>. Counting elements under whichever exists lets the
  // same pass run against both, which is how a warning gets attributed to the
  // migration rather than assumed to be new.
  const mounted = await page
    .evaluate(() => {
      const root = document.getElementById("root") ?? document.body;
      return root.querySelectorAll("*").length > 3;
    })
    .catch(() => false);
  /**
   * Is anything on this page actually clickable?
   *
   * Mounting is not enough, and this is not hypothetical: the app renders into
   * a `#root` wrapper that Next did not have, and `PageContainer` carries a
   * deliberate `z-index: -1`. Without `isolation: isolate` on `#root` the whole
   * app painted *behind* that wrapper — visually perfect, every button
   * unclickable, no error anywhere. A mount check sails straight past that.
   *
   * So: take the interactive elements, and confirm that hit-testing at their
   * own centre actually reaches them rather than some ancestor or overlay.
   */
  /**
   * /promo/* is exempt. Those are capture fixtures, not product routes: the
   * scenes are stepped by `window.__promo.seek()` and never clicked, and the
   * shell deliberately leaves a full-viewport dialog scrim in place (made
   * transparent for the capture, still covering the page). Asserting
   * clickability there would fail for a reason nobody should act on.
   */
  const clickable = route.startsWith("/promo/")
    ? null
    : await page
        .evaluate(() => {
          const els = Array.from(
        document.querySelectorAll<HTMLElement>("button, a[href]"),
      ).filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.height > 0 &&
          r.top >= 0 &&
          r.top < window.innerHeight &&
          r.left >= 0 &&
          r.left < window.innerWidth
        );
      });
      if (els.length === 0) return null;
      return els.some((el) => {
        const r = el.getBoundingClientRect();
        const top = document.elementFromPoint(
          r.left + r.width / 2,
          r.top + r.height / 2,
        );
        return top !== null && (el === top || el.contains(top));
      });
    })
    .catch(() => null);

  const finalPath = await page
    .evaluate(() => location.pathname)
    .catch(() => route);

  page.off("pageerror", onError);
  page.off("console", onConsole);

  return { clickable, errors, finalPath, mounted, route, status };
};

const run = async () => {
  const routes = readRoutes();
  console.log(`Routes to render: ${routes.length}\n`);

  const server = EXTERNAL_ORIGIN
    ? null
    : spawn(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["vite", "preview", "--port", String(PORT), "--strictPort"],
        { shell: process.platform === "win32", stdio: "ignore" },
      );

  let browser: Browser | undefined;
  try {
    await waitForServer();

    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      executablePath: findChrome(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ height: 667, width: 375 }); // AGENTS.md baseline
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (isBlocked(req.url())) req.abort().catch(() => {});
      else req.continue().catch(() => {});
    });

    const results: Result[] = [];
    for (const route of routes) {
      const result = await visit(page, route);
      results.push(result);
      const bad =
        result.errors.length > 0 || !result.mounted || result.clickable === false;
      process.stdout.write(
        `${bad ? "FAIL" : "ok  "}  ${route.padEnd(52)}` +
          `${result.mounted ? "mounted" : "EMPTY  "}` +
          `${result.clickable === false ? "  UNCLICKABLE" : ""}` +
          `${result.finalPath !== route ? `  → ${result.finalPath}` : ""}\n`,
      );
      for (const e of result.errors) console.log(`        ${e}`);
    }

    const failed = results.filter(
      (r) => r.errors.length > 0 || !r.mounted || r.clickable === false,
    );
    console.log(
      `\n${results.length - failed.length}/${results.length} routes rendered clean.`,
    );
    if (failed.length) {
      console.log(`\nFailures:\n${failed.map((f) => `  ${f.route}`).join("\n")}`);
      throw new Error(`${failed.length} route(s) failed to render`);
    }
  } finally {
    await browser?.close().catch(() => {});
    if (!server) return;
    if (process.platform === "win32" && server.pid) {
      spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      server.kill();
    }
  }
};

run();
