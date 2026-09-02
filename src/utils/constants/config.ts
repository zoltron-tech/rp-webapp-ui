import { env } from "@/lib/env";

export const JWT_COOKIE_NAME = "X-NW-AUTH-TOKEN";
export const REFERRAL_COOKIE_NAME = "X-NW-REFERRAL-USER";
export const SOCKET_URL = env.SOCKET_URL ?? "";
export const SUPPORT_EMAIL =
  env.SUPPORT_EMAIL_PUBLIC ?? "support@zoltron.tech";
export const THEME_COOKIE_NAME = "rp_theme";
export const AUTH_HEADER_NAME = "X-NW-AUTH-TOKEN";
export const CONTENT_TYPE_HEADER_NAME = "Content-Type";
export const MEDIA_JSON_HEADER_VALUE = "application/json";
export const __DEV__ = env.DEV;

export enum LOG_LEVELS {
  NONE,
  ERROR,
  WARN,
  INFO,
  LOG,
  DEBUG,
}

// Reading this through `@/lib/env` is what keeps it working in both builds:
// webpack only inlines `NEXT_PUBLIC_`-prefixed names, Vite only exposes
// `VITE_`-prefixed ones, and the seam holds one of each. The bug this comment
// used to describe — the unprefixed name alone leaving every browser-side call
// on the default — is the same class of mistake either way.
//
// Defaults to WARN rather than DEBUG because `Logger.debug` is called at all 206
// fetch sites — raise it to 5 (`NEXT_PUBLIC_LOG_LEVEL=5`) when tracing requests.
export const LOG_LEVEL = env.LOG_LEVEL || LOG_LEVELS.WARN;
