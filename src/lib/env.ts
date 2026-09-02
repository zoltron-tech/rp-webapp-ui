/**
 * Client-visible configuration — the Next implementation.
 *
 * Every browser-side read of `process.env` goes through this module. Under Next
 * these are literal `process.env.X` member expressions so webpack still inlines
 * them at build time from `next.config.js`'s `env:` block. Under Vite,
 * `vite.config.ts` aliases `@/lib/env` to `env.vite.ts`, which reads
 * `import.meta.env.VITE_*` instead.
 *
 * The seam is what lets both builds stay green while they coexist: the two
 * bundlers have incompatible ways of getting a value into the browser, and
 * neither understands the other's.
 *
 * Server-only values — the Discord bot token, guild and channel ids, and the
 * Klipy key — are deliberately absent. They are read directly from
 * `process.env` in the route handlers and move to the BFF in Phase C, where
 * they stay server-side. Nothing here may be a secret: everything in this file
 * ships to the browser.
 *
 * See REACT_MIGRATION_STEPS.md B10.
 */
export const env = {
  /** Feature flag: encrypt outgoing chat messages. Empty/unset → plaintext. */
  CHAT_E2E_ENABLED: process.env.NEXT_PUBLIC_CHAT_E2E_ENABLED,
  /** Legacy secret, decrypt-only, for interim "e2e:v1:" messages. */
  CHAT_E2E_SECRET: process.env.NEXT_PUBLIC_CHAT_E2E_SECRET,
  /** True in development and test. Gates `__DEV__`, and so gates all logging. */
  DEV:
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test",
  DISABLE_AUTOSCROLL: process.env.DISABLE_AUTOSCROLL,
  DISCORD_INVITE_URL: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL,
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL,
  RP_CHAT_URL: process.env.RP_CHAT_URL,
  RP_LOGIN_URL: process.env.RP_LOGIN_URL,
  RP_SERVICE_URL: process.env.RP_SERVICE_URL,
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  SUPPORT_EMAIL_PUBLIC: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  /**
   * Server-only today, public after B13: once the browser writes the auth
   * cookie it has to know whether to set `domain` and `secure`. Reads as
   * undefined under Next, which is correct — nothing client-side uses it yet.
   */
  USE_LOCAL_DOMAIN: process.env.USE_LOCAL_DOMAIN,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
} as const;
