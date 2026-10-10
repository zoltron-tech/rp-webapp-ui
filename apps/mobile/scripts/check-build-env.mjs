#!/usr/bin/env node
/**
 * Stops a cloud build that has no configuration, before it is built.
 *
 * `.env` is gitignored, and EAS uploads only what git tracks, so a cloud build
 * sees none of it: every `EXPO_PUBLIC_*` value is inlined as empty. The app
 * still builds and still launches — with no socket, no chat key and no image
 * bucket — and the only symptom is an app that half works. The first iOS
 * TestFlight build shipped exactly like that.
 *
 * EAS runs this as the `eas-build-post-install` hook (see package.json), with
 * the variables of the build profile's EAS environment in `process.env`. It
 * does not run for a local build, which reads `.env` through Metro.
 *
 * To fix a failure:  eas env:push <environment> --path .env
 */

/** Without these the app runs but something visible is broken. */
const REQUIRED = [
  // Chat: no socket means everyone looks offline and nothing arrives live.
  "EXPO_PUBLIC_SOCKET_URL",
  // Chat: without it every message reads "could not be decrypted".
  "EXPO_PUBLIC_CHAT_E2E_SECRET",
  "EXPO_PUBLIC_CHAT_E2E_ENABLED",
];

const missing = REQUIRED.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  const environment = process.env.EAS_BUILD_PROFILE ?? "<environment>";
  console.error(
    [
      "",
      "This build has no value for:",
      ...missing.map((name) => `  - ${name}`),
      "",
      "`.env` is not uploaded to EAS. Push it to the EAS environment this",
      "profile builds from, then build again:",
      "",
      `  eas env:push ${environment} --path .env`,
      "",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`Build environment OK (${REQUIRED.length} required values present).`);
