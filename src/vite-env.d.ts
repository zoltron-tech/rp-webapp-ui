/**
 * Vite ambient types.
 *
 * Deliberately NOT `/// <reference types="vite/client" />` yet. That reference
 * declares `*.png` (and friends) as a plain string URL, while
 * `next/image-types/global` — pulled in by next-env.d.ts — declares the same
 * modules as `StaticImageData`. Two ambient declarations of one module is a
 * type error, and both builds have to stay green while they coexist.
 *
 * So the half that is needed now — `import.meta.env` — is declared by hand,
 * and the asset-import half is handled by `assetUrl()` in `@/lib/asset`, which
 * accepts either shape.
 *
 * At D7, when Next and next-env.d.ts are deleted, this whole file collapses to
 * the one-line reference and `assetUrl` can go with it.
 *
 * See REACT_MIGRATION_STEPS.md B2/B8.
 */

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly PROD: boolean;
  readonly SSR: boolean;

  readonly VITE_CHAT_E2E_ENABLED?: string;
  readonly VITE_CHAT_E2E_SECRET?: string;
  readonly VITE_DISABLE_AUTOSCROLL?: string;
  readonly VITE_DISCORD_CLIENT_ID?: string;
  readonly VITE_DISCORD_INVITE_URL?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_NOVE_ENV?: string;
  readonly VITE_RP_CHAT_URL?: string;
  readonly VITE_RP_LOGIN_URL?: string;
  readonly VITE_RP_SERVICE_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  /**
   * Server-only under Next, public here: after the browser starts writing the
   * auth cookie it has to know whether to set `domain` and `secure`. Miss this
   * and local dev over http silently cannot hold a session. See B10/B13.
   */
  readonly VITE_USE_LOCAL_DOMAIN?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
