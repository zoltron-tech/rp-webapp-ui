/**
 * Client-visible configuration — the Vite implementation.
 *
 * `vite.config.ts` aliases `@/lib/env` to this file. See `env.ts` for why both
 * exist and for what deliberately is not here.
 *
 * Every name is `VITE_`-prefixed, which is what makes it public: Vite refuses
 * to expose anything else to the browser, so a secret cannot be leaked by
 * forgetting which side of the seam it is on. **Do not add a `VITE_` prefix to
 * a secret** — the Discord token, the Klipy key — to "make it work"; those
 * belong in the Phase C function, which reads `process.env` server-side.
 *
 * During the transition `vite.config.ts` falls back to the old unprefixed name
 * when the `VITE_` one is unset, so the existing `.env` keeps working locally.
 * That fallback is removed at D7.
 */
export const env = {
  CHAT_E2E_ENABLED: import.meta.env.VITE_CHAT_E2E_ENABLED,
  CHAT_E2E_SECRET: import.meta.env.VITE_CHAT_E2E_SECRET,
  /** Vite's own flag; equivalent to the NODE_ENV check the Next build does. */
  DEV: import.meta.env.DEV,
  DISABLE_AUTOSCROLL: import.meta.env.VITE_DISABLE_AUTOSCROLL,
  DISCORD_INVITE_URL: import.meta.env.VITE_DISCORD_INVITE_URL,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
  RP_CHAT_URL: import.meta.env.VITE_RP_CHAT_URL,
  RP_LOGIN_URL: import.meta.env.VITE_RP_LOGIN_URL,
  RP_SERVICE_URL: import.meta.env.VITE_RP_SERVICE_URL,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL,
  SUPPORT_EMAIL_PUBLIC: import.meta.env.VITE_SUPPORT_EMAIL,
  USE_LOCAL_DOMAIN: import.meta.env.VITE_USE_LOCAL_DOMAIN,
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY,
} as const;
