import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

/**
 * "A new version is ready" — web's `AppUpdatePrompt`, on `expo-updates`.
 *
 * Checked on launch and on coming back to the app, no more than hourly. The new
 * JavaScript is downloaded first, so Refresh is instant and nothing is offered
 * that cannot be delivered. Later leaves the update in place: it applies on the
 * next launch anyway.
 *
 * Off in development, where Metro is the source of the code. Required on demand,
 * so a build made before `expo-updates` was added still opens. Every failure is
 * silent: an update that did not arrive is not the reader's problem.
 */

const CHECK_EVERY_MS = 60 * 60 * 1000;

const check = async () => {
  const Updates: typeof import("expo-updates") = require("expo-updates");
  if (!Updates.isEnabled) return;
  const { isAvailable } = await Updates.checkForUpdateAsync();
  if (!isAvailable) return;
  const { isNew } = await Updates.fetchUpdateAsync();
  if (!isNew) return;
  Alert.alert(
    "A new version is ready",
    "Novelist World has been updated. Refresh to get the latest version.",
    [
      { style: "cancel", text: "Later" },
      { onPress: () => void Updates.reloadAsync(), text: "Refresh" },
    ],
  );
};

export const AppUpdatePrompt = () => {
  const lastCheck = useRef(0);

  useEffect(() => {
    if (__DEV__) return;
    const run = () => {
      if (Date.now() - lastCheck.current < CHECK_EVERY_MS) return;
      lastCheck.current = Date.now();
      void check().catch(() => undefined);
    };
    run();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") run();
    });
    return () => subscription.remove();
  }, []);

  return null;
};
