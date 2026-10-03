"use client";

import { dynamic } from "@/lib/dynamic";

/**
 * The storyboard reveal.
 *
 * Open it in a browser and it sits at the first frame — it is stepped by
 * `window.__promo.seek(ms)`, which `promo-gif/render.mjs` calls once per
 * captured frame. Append `?play=1` to watch it run at real time instead.
 *
 * Browser-only, and not merely as an optimisation: the scene hands the chapter
 * cards their data up front, and `StoryCardEvent` builds its preview portal
 * against `document.body` while it renders. In the app that never runs on the
 * server because the storyboard is still null there and no card exists yet.
 */
const PromoScene = dynamic(
  () => import("../_demo/scene").then((module) => module.PromoScene),
  { ssr: false },
);

export default function PromoStoryboardPage() {
  return <PromoScene />;
}
