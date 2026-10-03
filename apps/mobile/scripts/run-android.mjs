#!/usr/bin/env node
/**
 * `expo run:android`, told to serve the bundle over the USB cable.
 *
 * ## Why this file exists at all
 *
 * `expo start` takes `--localhost`. `expo run:android` does not — it has no
 * host flag of any kind (`--no-bundler`, `--port`, `--device`, and that is the
 * lot). The only lever it exposes is `REACT_NATIVE_PACKAGER_HOSTNAME`, which is
 * an environment variable, and an environment variable cannot be set inline in
 * an npm script on Windows: `FOO=bar expo run:android` is a syntax error in
 * cmd.exe, which is what pnpm runs scripts through there.
 *
 * So: four lines of Node instead of a `cross-env` dependency.
 *
 * ## Why localhost rather than the LAN address
 *
 * Left alone, the CLI picks the machine's LAN address and tells the dev client
 * to fetch the bundle from it — `url=http://172.16.1.193:8081`. The phone then
 * has to reach that over Wi-Fi, which fails whenever it is on mobile data, on a
 * different network, or behind AP isolation. It fails *silently* from the app's
 * point of view: adb launches it over the cable, so it opens, and then hangs on
 * a splash screen while the bundle request dies with "Network is unreachable".
 *
 * `localhost` plus the `adb reverse` tunnel that `run:android` already sets up
 * routes the bundle down the same cable that installed the APK, so it works on
 * any device that is plugged in, on any network or none.
 *
 * `pnpm android:lan` is the unwrapped command, for when you want the cable out.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// Not overwritten: someone who has set it deliberately means it.
process.env.REACT_NATIVE_PACKAGER_HOSTNAME ??= "localhost";

// Resolved rather than shelled out to, so nothing has to survive Windows
// quoting on a path with a space in it — which this repo's does.
const cli = createRequire(import.meta.url).resolve("expo/bin/cli");

const child = spawn(
  process.execPath,
  [cli, "run:android", ...process.argv.slice(2)],
  { env: process.env, stdio: "inherit" },
);

child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
