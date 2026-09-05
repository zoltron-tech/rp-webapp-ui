/// <reference types="vite/client" />

/**
 * Ambient types for the app.
 *
 * `vite/client` supplies `import.meta.env`'s built-ins and the module
 * declarations for static asset imports — `import logo from "./logo.png"` is a
 * plain string URL.
 *
 * The interface below narrows `import.meta.env` to the variables this app
 * actually reads, so a typo in a `VITE_` name is a type error rather than
 * `undefined` at runtime. Every one of them is public: Vite only exposes
 * `VITE_`-prefixed names to the browser, which is what keeps a secret from
 * being shipped by accident. Server-side values — the Discord token and channel
 * ids, the Klipy key — are read from `process.env` in `api/` and must never
 * gain the prefix.
 */

interface ImportMetaEnv {
  readonly VITE_CHAT_E2E_ENABLED?: string;
  readonly VITE_CHAT_E2E_SECRET?: string;
  readonly VITE_DISABLE_AUTOSCROLL?: string;
  readonly VITE_DISCORD_CLIENT_ID?: string;
  readonly VITE_DISCORD_INVITE_URL?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_RP_CHAT_URL?: string;
  readonly VITE_RP_LOGIN_URL?: string;
  readonly VITE_RP_SERVICE_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  /**
   * Whether cookies written from the browser are host-only rather than scoped
   * to novelist.world. Only the literal string "true" enables it; anything else,
   * including "false" and unset, means production behaviour.
   *
   * It used to be read with `Boolean(...)`, which made the string "false"
   * truthy — so production wrote host-only cookies that were a *different
   * cookie* from the domain-scoped ones the backend wrote, and logout cleared
   * only one of the two. The auth cookies are now written solely by
   * user-service, so this affects the referral cookie alone.
   */
  readonly VITE_USE_LOCAL_DOMAIN?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
