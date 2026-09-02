import { readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Public configuration: the new `VITE_`-prefixed name mapped to the legacy
 * name(s) it replaces. `define` below reads `VITE_<name>` first and falls back
 * to the legacy value, so the existing .env keeps working until the deployment
 * environment is renamed.
 *
 * Nothing here may be a secret. The Discord token, its channel ids, and the
 * Klipy key are deliberately absent — they stay server-side.
 */
const PUBLIC_ENV: Record<string, readonly string[]> = {
  CHAT_E2E_ENABLED: ["NEXT_PUBLIC_CHAT_E2E_ENABLED"],
  CHAT_E2E_SECRET: ["NEXT_PUBLIC_CHAT_E2E_SECRET"],
  DISABLE_AUTOSCROLL: ["DISABLE_AUTOSCROLL"],
  DISCORD_INVITE_URL: ["NEXT_PUBLIC_DISCORD_INVITE_URL"],
  LOG_LEVEL: ["NEXT_PUBLIC_LOG_LEVEL", "LOG_LEVEL"],
  RP_CHAT_URL: ["RP_CHAT_URL"],
  RP_LOGIN_URL: ["RP_LOGIN_URL"],
  RP_SERVICE_URL: ["RP_SERVICE_URL"],
  SOCKET_URL: ["NEXT_PUBLIC_SOCKET_URL"],
  SUPPORT_EMAIL: ["NEXT_PUBLIC_SUPPORT_EMAIL", "SUPPORT_EMAIL"],
  USE_LOCAL_DOMAIN: ["USE_LOCAL_DOMAIN"],
  VAPID_PUBLIC_KEY: ["VAPID_PUBLIC_KEY"],
};

/** Virtual module id standing in for nsfwjs's bundled model shards. */
const EMPTY_MODEL_ID = "virtual:nsfwjs-bundled-model";

export default defineConfig(({ mode }) => {
  // Read .env without the VITE_ filter so the build can reach the handful of
  // legacy unprefixed names still in play. Anything exposed to the client
  // below is deliberate and enumerated — nothing is spread in wholesale.
  // envDir is derived from this file rather than `process.cwd()`: the shared
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
      "process.env.RP_BUCKET_NAME": JSON.stringify(env.RP_BUCKET_NAME ?? ""),

      // Transitional: read VITE_X, falling back to the old unprefixed name so
      // the existing .env keeps working locally while the deployment
      // environment is renamed. Remove at D7, when every name is VITE_-prefixed
      // everywhere. See src/lib/env.vite.ts.
      ...Object.fromEntries(
        Object.entries(PUBLIC_ENV).map(([name, legacy]) => {
          const value =
            env[`VITE_${name}`] || legacy.map((k) => env[k]).find(Boolean) || "";
          return [`import.meta.env.VITE_${name}`, JSON.stringify(value)];
        }),
      ),
    },

    plugins: [
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
      /**
       * Transitional: keep next-pwa's generated workers out of the Vite build.
       *
       * next-pwa writes `sw.js`, `workbox-*.js` and `worker-*.js` into
       * `public/`, and Vite copies `public/` verbatim — so a `next build`
       * followed by a `vite build` ships Next's dead service worker files
       * alongside the real one. `dist/sw.js` is not at risk (vite-plugin-pwa
       * writes it after the copy), but the others would be deployed as stale
       * artefacts, and a stray Workbox bundle is exactly the wrong thing to
       * find when debugging the D2 precache transition.
       *
       * They are gitignored and stop being generated at D7; this goes with them.
       */
      {
        apply: "build" as const,
        closeBundle() {
          const dead = readdirSync("dist").filter((f) =>
            /^(workbox-[^/]+\.js|worker-[^/]+\.js)(\.map)?$/.test(f),
          );
          for (const f of dead) rmSync(`dist/${f}`, { force: true });
          if (dead.length) {
            console.log(`  removed ${dead.length} stale next-pwa file(s)`);
          }
        },
        enforce: "post" as const,
        name: "drop-next-pwa-artifacts",
      },

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
        // Build-specific seams. Each `@/…` module on the left has a Next
        // implementation at its own path and a Vite one here, so both builds
        // stay fully working while they coexist — see the `.tsx`/`.ts` pair in
        // each case for why the two cannot be one file.
        // B13: the 20 "use server" action files and their 147 importers are
        // untouched — only which client module they resolve to changes. The
        // `"use server"` pragma itself is inert under Rollup.
        "@/app/actions": resolve("./src/app/actions.vite.ts"),
        "@/components/link": resolve("./src/components/link.vite.tsx"),
        "@/lib/dynamic": resolve("./src/lib/dynamic.vite.tsx"),
        "@/lib/env": resolve("./src/lib/env.vite.ts"),
        "@/lib/navigation": resolve("./src/lib/navigation.vite.ts"),
        "@/lib/server-api": resolve("./src/lib/api.ts"),

        "@": resolve("./src"),
        "@nw/api": resolve("./packages/api/src"),
        "@nw/types": resolve("./packages/types/src"),
        "@nw/utils": resolve("./packages/utils/src"),
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
                target:
                  env.LOCAL_PORTFOLIO_SERVICE_URL || "http://127.0.0.1:50200",
              },
              "/rp/user": {
                changeOrigin: true,
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
