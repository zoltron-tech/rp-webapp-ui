"use client";

import dynamic from "next/dynamic";

/**
 * The muse-profile reveal.
 *
 * Browser-only, like the other scenes: the components it mounts build portals
 * against `document` while they render.
 *
 * Stepped by `window.__promo.seek(ms)`; append `?play=1` to watch it run.
 */
const PromoMuseScene = dynamic(
  () => import("../_demo/muse-scene").then((module) => module.PromoMuseScene),
  { ssr: false },
);

export default function PromoMusePage() {
  return <PromoMuseScene />;
}
