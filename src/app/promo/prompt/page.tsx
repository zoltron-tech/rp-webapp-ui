"use client";

import { dynamic } from "@/lib/dynamic";

/**
 * The prompt-composer reveal.
 *
 * Browser-only for the same reason the storyboard scene is: the components it
 * mounts build portals against `document` while they render, which the app
 * itself never hits on the server because its data is still null there.
 *
 * Stepped by `window.__promo.seek(ms)`; append `?play=1` to watch it run.
 */
const PromoPromptScene = dynamic(
  () =>
    import("../_demo/prompt-scene").then((module) => module.PromoPromptScene),
  { ssr: false },
);

export default function PromoPromptPage() {
  return <PromoPromptScene />;
}
