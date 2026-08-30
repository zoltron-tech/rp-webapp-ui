export const JWT_COOKIE_NAME = "X-NW-AUTH-TOKEN";
export const REFERRAL_COOKIE_NAME = "X-NW-REFERRAL-USER";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "";
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@zoltron.tech";
export const THEME_COOKIE_NAME = "rp_theme";
export const AUTH_HEADER_NAME = "X-NW-AUTH-TOKEN";
export const CONTENT_TYPE_HEADER_NAME = "Content-Type";
export const MEDIA_JSON_HEADER_VALUE = "application/json";
export const __DEV__ =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export enum LOG_LEVELS {
  NONE,
  ERROR,
  WARN,
  INFO,
  LOG,
  DEBUG,
}

// Only `NEXT_PUBLIC_`-prefixed vars are inlined into the client bundle, so the
// unprefixed name alone left every browser-side call falling through to the
// default no matter what the environment said. Both are read: the prefixed one
// works everywhere, the bare one keeps any existing server-side config working.
//
// Defaults to WARN rather than DEBUG because `Logger.debug` is called at all 206
// fetch sites — raise it to 5 (`NEXT_PUBLIC_LOG_LEVEL=5`) when tracing requests.
export const LOG_LEVEL =
  process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL || LOG_LEVELS.WARN;
