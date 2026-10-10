import Constants from "expo-constants";

/**
 * Client configuration, the Expo way.
 *
 * The web app reads `import.meta.env.VITE_*`, which Vite refuses to expose
 * unless prefixed — that prefix is what stops a secret shipping by accident.
 * Expo's equivalent is `EXPO_PUBLIC_*`, inlined by Metro at build time with the
 * same guarantee, and `Constants.expoConfig.extra` for anything set per build
 * profile in `app.json` / `eas.json`.
 *
 * Read through this module rather than touching `process.env` directly, for the
 * same reason `apps/web/src/lib/env.ts` exists: one place lists what the client
 * is allowed to know.
 *
 * ## Why every name is spelled out twice
 *
 * "Inlined by Metro" is literal: `babel-preset-expo` walks the AST for member
 * expressions on `process.env` and substitutes the value, and it only fires when
 * the key is a *string literal* (`inline-env-vars.js` checks `isStringLiteral`).
 * Build the name — `process.env[`EXPO_PUBLIC_${name}`]` — and there is nothing
 * for it to match: the read is left standing, and a release bundle has no
 * `process.env` behind it to answer. Every value silently becomes "".
 *
 * It survives testing because the dev bundle *does* have a populated
 * `process.env` at runtime, so the dynamic read works there and only there. The
 * symptom in release is a chat where every message reads "could not be
 * decrypted" and everyone shows offline — the secret and the socket URL came
 * back empty. `EXPO_PUBLIC_RP_SERVICE_URL` hid it further by having a fallback
 * identical to its `.env` value.
 *
 * So: the literal on the left of each line below is what Babel replaces. Adding
 * a variable means adding it here, spelled out in full, not just in `.env`.
 */

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

const inlined: Record<string, string | undefined> = {
  CHAT_E2E_ENABLED: process.env.EXPO_PUBLIC_CHAT_E2E_ENABLED,
  CHAT_E2E_SECRET: process.env.EXPO_PUBLIC_CHAT_E2E_SECRET,
  DISCORD_INVITE_URL: process.env.EXPO_PUBLIC_DISCORD_INVITE_URL,
  OAUTH_REDIRECT_SCHEME: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME,
  RP_BUCKET_NAME: process.env.EXPO_PUBLIC_RP_BUCKET_NAME,
  RP_CHAT_URL: process.env.EXPO_PUBLIC_RP_CHAT_URL,
  RP_SERVICE_URL: process.env.EXPO_PUBLIC_RP_SERVICE_URL,
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL,
  SUPPORT_EMAIL: process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
  WEB_URL: process.env.EXPO_PUBLIC_WEB_URL,
};

const read = (name: keyof typeof inlined, fallback?: string): string =>
  inlined[name] ?? extra[name] ?? fallback ?? "";

export const env = {
  CHAT_E2E_ENABLED: read("CHAT_E2E_ENABLED"),
  CHAT_E2E_SECRET: read("CHAT_E2E_SECRET"),
  DISCORD_INVITE_URL: read("DISCORD_INVITE_URL"),
  /** OAuth lands back on the app through this scheme; must match app.json. */
  OAUTH_REDIRECT_SCHEME: read("OAUTH_REDIRECT_SCHEME", "novelistworld"),
  /**
   * The S3 bucket uploads live in; links to it open without a confirmation.
   * Falls back to production's, like the two URLs below: it is public (it is
   * in every image URL), and a build without it downloads full-size originals
   * into list rows without saying so.
   */
  RP_BUCKET_NAME: read("RP_BUCKET_NAME", "rp-webapp-ui"),
  RP_CHAT_URL: read("RP_CHAT_URL"),
  RP_SERVICE_URL: read("RP_SERVICE_URL", "https://api.novelist.world"),
  /**
   * chat-server. Falls back to production's so a build made without `.env`
   * (every cloud build, unless the EAS environment is set) still has chat.
   */
  SOCKET_URL: read(
    "SOCKET_URL",
    "https://nw-chat-server-e055568bd7de.herokuapp.com",
  ),
  SUPPORT_EMAIL: read("SUPPORT_EMAIL"),
  /**
   * Where the web app lives, for links a phone hands to other people.
   *
   * A shared prompt opens in a browser, not in this app — there is no deep
   * link into it yet — so the URL on the share sheet has to be the web one.
   */
  WEB_URL: read("WEB_URL", "https://novelist.world"),
} as const;
