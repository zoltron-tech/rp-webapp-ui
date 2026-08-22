"use client";

import { GIF_ITEMS } from "./prompt-data";

/**
 * Answers the one route the scene cannot let out.
 *
 * `GifPicker` fetches `/api/klipy-gifs`, and that route proxies Klipy: live
 * results would differ between runs, and the images it hands back live on hosts
 * the capture blocks, so the grid would come up empty or full of broken tiles.
 * Everything else the scene touches is already offline, so this patches exactly
 * that path and passes the rest of `fetch` straight through.
 *
 * Installed by the prompt scene rather than at module scope, so importing this
 * file has no effect on its own.
 */
export const installGifStub = () => {
  const original = window.fetch;
  if ((original as { __promoStub?: boolean }).__promoStub) return () => {};

  const stub: typeof window.fetch = (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (!url.includes("/api/klipy-gifs")) return original(input, init);

    return Promise.resolve(
      new Response(JSON.stringify({ items: GIF_ITEMS, next: null }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );
  };

  (stub as { __promoStub?: boolean }).__promoStub = true;
  window.fetch = stub;

  return () => {
    window.fetch = original;
  };
};
