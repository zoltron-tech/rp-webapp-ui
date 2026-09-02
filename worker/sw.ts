/// <reference lib="webworker" />

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { registerPushHandlers } from "./handlers";

/**
 * The complete service worker for the Vite build — the `injectManifest` source
 * for vite-plugin-pwa.
 *
 * Unlike `worker/index.ts` (which next-pwa merged into a generated worker), this
 * file *is* the worker: precaching, runtime caching and lifecycle are all here.
 * The push handling is imported so it stays identical across both builds.
 *
 * See REACT_MIGRATION_STEPS.md D1/D2.
 */

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

/**
 * ⚠ The precache transition — the riskiest lifecycle decision in the migration.
 *
 * Every already-installed user is running a worker whose precache lists Next's
 * `_next/static/*` URLs. Those paths are deployment-scoped on Vercel and stop
 * resolving the moment the Vite build is promoted.
 *
 * `skipWaiting` + `clientsClaim` make the new worker take over immediately
 * rather than waiting for every tab of the app to close — which, for an
 * installed PWA that is rarely fully closed, could be days. Without this an
 * installed user sits on a worker serving URLs that 404: a white screen they
 * cannot clear themselves, because clearing it means uninstalling the app.
 *
 * `cleanupOutdatedCaches` then discards the old Workbox precache outright
 * rather than leaving it to expire.
 *
 * Test this by upgrading **from a Next-era install**, never from a fresh one —
 * a fresh install has no old precache and cannot reproduce the failure. See D4.
 */
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// The build-time manifest of hashed assets, injected by vite-plugin-pwa.
precacheAndRoute(self.__WB_MANIFEST);

/**
 * SPA navigation fallback: serve the app shell for any navigation, so a deep
 * link works offline and on a cold start.
 *
 * The denylist keeps this off the two route families the server must handle:
 * `/api/*` is the BFF, and the two storyboard patterns are server-rendered for
 * their Open Graph tags (C8). Precaching those would serve a cached shell with
 * the *wrong* story's card, or none at all.
 */
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    denylist: [
      /^\/api\//,
      /^\/rp\/story\/[^/]+$/,
      /^\/rp\/story\/event\/[^/]+$/,
    ],
  }),
);

/**
 * Proxied images from wsrv.nl — CacheFirst, ported unchanged from
 * `next.config.js`'s `runtimeCaching`.
 *
 * The URL already encodes dimensions and quality, so the same URL always yields
 * the same image and there is nothing to revalidate. Status 0 covers opaque
 * (no-cors) responses from background-image fetches, which would otherwise not
 * be cached at all.
 */
registerRoute(
  ({ url }) => url.origin === "https://wsrv.nl",
  new CacheFirst({
    cacheName: "wsrv-image-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        maxEntries: 500,
      }),
    ],
  }),
);

registerPushHandlers();
