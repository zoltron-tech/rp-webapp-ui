"use client";

import { dynamic } from "@/lib/dynamic";

/**
 * Halda's muse page on a phone, opened on Canon (the Headcanons reel).
 *
 * Under /promo/screen, so the layout leaves the app's real look on: black page,
 * shadows and sheet scrims, as on a phone. Browser-only like the other scenes.
 */
const PromoHeadcanonScene = dynamic(
  () =>
    import("../../_demo/headcanon-scene").then(
      (module) => module.PromoHeadcanonScene,
    ),
  { ssr: false },
);

export default function PromoHeadcanonsPage() {
  return <PromoHeadcanonScene />;
}
