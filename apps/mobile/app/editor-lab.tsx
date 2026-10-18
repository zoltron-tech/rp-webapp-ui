import { Redirect } from "expo-router";
import type { ComponentType } from "react";

/**
 * Editor lab. Dev builds only: `novelistworld://editor-lab`.
 *
 * Same shell as `glass-lab.tsx`: the screen is reached through a `require`
 * behind `__DEV__`, so a production bundle drops it.
 */
const Lab: ComponentType | null = __DEV__
  ? (require("@/screens/editor-lab") as typeof import("@/screens/editor-lab"))
      .EditorLab
  : null;

export default function EditorLabRoute() {
  if (!Lab) return <Redirect href="/" />;
  return <Lab />;
}
