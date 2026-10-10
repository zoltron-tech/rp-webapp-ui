import { Redirect } from "expo-router";
import type { ComponentType } from "react";

/**
 * Local store lab. Dev builds only: `novelistworld://local-store-lab`.
 *
 * Same shape as `glass-lab.tsx`: the route is a shell, the screen is behind a
 * `require` under `__DEV__` so a production bundle drops it.
 */
const Lab: ComponentType | null = __DEV__
  ? (
      require("@/screens/local-store-lab") as typeof import("@/screens/local-store-lab")
    ).LocalStoreLab
  : null;

export default function LocalStoreLabRoute() {
  if (!Lab) return <Redirect href="/" />;
  return <Lab />;
}
