import { Redirect } from "expo-router";
import type { ComponentType } from "react";

/**
 * Glass lab. Dev builds only: `novelistworld://glass-lab`.
 *
 * The route file is this shell; the lab itself is `screens/glass-lab.tsx`,
 * reached through a `require` behind `__DEV__`. A production bundle folds the
 * constant, drops the branch and with it the only reference to that module, so
 * four hundred lines of test surfaces are not shipped to readers who can never
 * open them. A static import here would ship them regardless.
 */
const Lab: ComponentType | null = __DEV__
  ? (require("@/screens/glass-lab") as typeof import("@/screens/glass-lab"))
      .GlassLab
  : null;

export default function GlassLabRoute() {
  if (!Lab) return <Redirect href="/" />;
  return <Lab />;
}
