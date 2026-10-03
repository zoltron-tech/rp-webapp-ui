import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import type { Connect, PluginOption } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { decide, INFRA_PATH_RE } from "./middleware-rules";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/** Virtual module id standing in for nsfwjs's bundled model shards. */
const EMPTY_MODEL_ID = "virtual:nsfwjs-bundled-model";

/**
 * Runs the HTTP-layer rules in `middleware-rules.ts` against the dev and
 * preview servers.
 *
 * Vercel Edge Middleware only runs when deployed. Next ran `src/middleware.ts`
 * in its dev server, so `/{username}` short links worked locally without
 * anyone having to arrange it; after the migration they silently stopped —
 * the shell rendered, the router matched nothing, and `not-found` sent you to
 * Novelists. This is the local half of that behaviour, sharing one copy of the
 * rules with the edge entry point so the two cannot drift.
 *
 * Registered from the hook body rather than a returned function, so it runs
 * **before** Vite's internal middlewares. The SPA fallback serves index.html
 * for every unmatched path; anything registered after it never sees a single
 * `/{username}` request.
 */
const middlewareRules = (): PluginOption => {
  const handle: Connect.NextHandleFunction = (req, res, next) => {
    const accept = req.headers.accept ?? "";
    const isDocument =
      req.headers["sec-fetch-dest"] === "document" ||
      accept.includes("text/html") ||
      // Tools that state no preference (curl and friends) are treated as
      // navigations, so a short link can be checked from a terminal.
      accept.includes("*/*") ||
      accept === "";

    // Vite serves its client, source modules and dependency pre-bundles from
    // paths no production matcher covers. In production this is the
    // middleware `matcher`'s job; here it is this test.
    if (!isDocument || INFRA_PATH_RE.test(req.url ?? "/")) return next();

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    const decision = decide(url);
    if (decision.kind !== "redirect") return next();
    res.statusCode = decision.status;
    res.setHeader("Location", decision.location);
    res.end();
  };

  return {
    configurePreviewServer: (server) => {
      server.middlewares.use(handle);
    },
    configureServer: (server) => {
      server.middlewares.use(handle);
    },
    name: "middleware-rules-dev",
  };
};

export default defineConfig(({ mode }) => {
  // Loaded without the VITE_ filter because RP_BUCKET_NAME is read below and
  // is not client config. Everything the browser sees comes from
  // `import.meta.env.VITE_*`, which Vite handles on its own — nothing is
  // spread into `define` wholesale.
  //
  // envDir comes from this file rather than `process.cwd()`: the shared
  // packages narrow the ambient `process` type to `{ env }` only, and the app's
  // tsconfig includes them.
  const env = loadEnv(mode, resolve("."), "");

  return {
    define: {
      // `@nw/utils/image` reads process.env.RP_BUCKET_NAME to decide whether a
      // URL belongs to our S3 bucket and should go through the wsrv.nl proxy.
      // webpack inlines that read at build time; Vite does not shim `process`
      // at all, so without this the first image render throws
      // `ReferenceError: process is not defined`.
      //
      // The bucket name is not a secret — it already appears in every image URL
      // the app renders. See REACT_MIGRATION_STEPS.md A1 and finding 2.
      // Defining any `process.env.*` key stops Vite substituting the whole
      // `process.env` object, which is how React's
      // `process.env.NODE_ENV !== "production"` guards normally get folded
      // away. Without this line the production build ships **development
      // React**: dev-only warnings, no tree-shaking of the dev branch, and a
      // much larger bundle. Found by the route render pass (D5), which saw
      // warnings that a production React build cannot emit.
      "process.env.NODE_ENV": JSON.stringify(
        mode === "production" ? "production" : "development",
      ),
      "process.env.RP_BUCKET_NAME": JSON.stringify(env.RP_BUCKET_NAME ?? ""),
      // The native app's name for the same value: Metro inlines nothing but
      // `EXPO_PUBLIC_*`, so `@nw/utils/image` reads both and takes whichever it
      // was given. Defined here as well because the read still *exists* in the
      // browser bundle — leaving it undefined is the `process is not defined`
      // crash the block above is about. Empty, so it folds to a constant and
      // `RP_BUCKET_NAME` remains the one web actually uses.
      "process.env.EXPO_PUBLIC_RP_BUCKET_NAME": JSON.stringify(""),
    },

    plugins: [
      // Before everything else: this decides whether a request is a redirect
      // rather than a page, and the answer has to come first.
      middlewareRules(),

      /**
       * nsfwjs ships ~25MB of pre-built model shards under `dist/models`,
       * reached through a non-standard 2-arg `require(name, version)` JSONP
       * wrapper. They are not needed: `lib/nsfw-model.ts` loads the model from
       * `/models/mobilenet_v2/model.json`, a static asset in `public/`.
       *
       * webpack dropped them via `IgnorePlugin`. Rollup has no such thing and
       * happily follows the wrapper — a first build without this produced an
       * 178MB `dist/` with 18 shard chunks in it. This is the same rule,
       * expressed as a resolver: anything resolving into nsfwjs's model
       * directory becomes an empty module.
       *
       * See REACT_MIGRATION_STEPS.md B11.
       */
      {
        enforce: "pre" as const,
        load(id: string) {
          return id === EMPTY_MODEL_ID ? "export default {};" : null;
        },
        name: "ignore-nsfwjs-bundled-models",
        resolveId(source: string, importer: string | undefined) {
          if (!importer || !/nsfwjs/.test(importer)) return null;
          const resolved = path.resolve(path.dirname(importer), source);
          return /[\\/]nsfwjs[\\/]dist[\\/]models[\\/]/.test(resolved)
            ? EMPTY_MODEL_ID
            : null;
        },
      },

      react({
        // Keeps the same styled-components transform Next applies through
        // `compiler.styledComponents`: readable displayNames in dev and stable
        // class hashes. `ssr` is off — there is no server rendering to support.
        plugins: [
          [
            "@swc/plugin-styled-components",
            { displayName: true, fileName: false, ssr: false },
          ],
        ],
      }),

      /**
       * PWA. `@ducanh2912/next-pwa` wrapped Workbox; this wraps the same
       * Workbox, so the caching behaviour ports rather than being redesigned.
       *
       * `injectManifest` rather than `generateSW` because the app has a real
       * custom worker (push notifications, badge sync) — see worker/sw.ts,
       * which is the whole worker and receives the precache manifest.
       */
      VitePWA({
        devOptions: {
          // The service worker stays on in development, as it was under
          // next-pwa, because push notifications cannot be tested without it.
          enabled: true,
          type: "module",
        },
        filename: "sw.ts",
        injectManifest: {
          // The nsfwjs model is 2.7MB of static asset in public/. Precaching it
          // would push every install to download it up front; it is loaded on
          // demand by lib/nsfw-model.ts instead.
          globIgnores: ["**/models/**"],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
        // The app already ships a hand-written public/manifest.json and links
        // it from index.html; generating a second one would put two manifests
        // on the page.
        manifest: false,
        registerType: "autoUpdate",
        srcDir: "worker",
        strategies: "injectManifest",
      }),
    ],

    resolve: {
      alias: {
        "@": resolve("./src"),
        "@nw/api": resolve("../../packages/api/src"),
        "@nw/badges": resolve("../../packages/badges/src"),
        "@nw/chat": resolve("../../packages/chat/src"),
        "@nw/features": resolve("../../packages/features/src"),
        "@nw/richtext": resolve("../../packages/richtext/src"),
        "@nw/store": resolve("../../packages/store/src"),
        "@nw/theme": resolve("../../packages/theme/src"),
        "@nw/types": resolve("../../packages/types/src"),
        "@nw/utils": resolve("../../packages/utils/src"),
      },
    },

    server: {
      // Next dev serves on 3000 and three things outside this app are wired to
      // that number: the backend's APP_BASE_URL and OAUTH_REDIRECT_BASE, and
      // RP_LOGIN_URL here. Vite's default is 5173; leaving it there breaks
      // every local OAuth round trip in a way that looks like a backend fault.
      port: 3000,
      strictPort: true,

      // Local-dev backend proxy, replacing next.config.js `rewrites()`. Same
      // flag, same two context paths, same defaults — but dev-only by
      // construction rather than by a runtime check.
      proxy:
        env.LOCAL_BACKEND_PROXY === "true"
          ? {
              "/rp/portfolio": {
                changeOrigin: true,
                cookieDomainRewrite: "",
                target:
                  env.LOCAL_PORTFOLIO_SERVICE_URL || "http://127.0.0.1:50200",
              },
              "/rp/user": {
                changeOrigin: true,
                cookieDomainRewrite: "",
                target: env.LOCAL_USER_SERVICE_URL || "http://127.0.0.1:50100",
              },
            }
          : undefined,
    },

    build: {
      outDir: "dist",
      // Matches Next's default (`productionBrowserSourceMaps: false`). With
      // maps on, this build emits ~69MB of them against ~6MB of JS.
      sourcemap: false,
    },
  };
});
