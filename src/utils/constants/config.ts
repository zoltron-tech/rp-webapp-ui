export const JWT_COOKIE_NAME = "X-NW-AUTH-TOKEN";
export const THEME_COOKIE_NAME = "rp_theme";
export const AUTH_HEADER_NAME = "X-NW-AUTH-TOKEN";
export const CONTENT_TYPE_HEADER_NAME = "Content-Type";
export const MEDIA_JSON_HEADER_VALUE = "application/json";
export const __DEV__ = false;
process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export enum LOG_LEVELS {
  NONE,
  ERROR,
  WARN,
  INFO,
  LOG,
  DEBUG,
}

export const LOG_LEVEL = process.env.LOG_LEVEL || LOG_LEVELS.DEBUG;
