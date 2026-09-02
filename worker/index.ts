/// <reference lib="webworker" />

/**
 * The Next custom worker.
 *
 * `@ducanh2912/next-pwa` compiles this and merges it into the Workbox bundle it
 * generates, so this file carries only the app's own handlers — precaching and
 * runtime caching are the library's job.
 *
 * Its Vite counterpart is `worker/sw.ts`, which is a *complete* worker because
 * vite-plugin-pwa's `injectManifest` mode hands the whole thing over. Both call
 * the same `registerPushHandlers`, so the push behaviour cannot drift between
 * the two builds.
 *
 * Deleted at D7 along with next-pwa.
 */

import { registerPushHandlers } from "./handlers";

registerPushHandlers();
