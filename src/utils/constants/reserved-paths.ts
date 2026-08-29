/**
 * The rules behind the short profile URL, `novelist.world/{username}`.
 *
 * `src/middleware.ts` turns a bare one-segment path into `/rp/profile/{name}`
 * when it looks like a username and the backend confirms that novelist exists.
 * Anything handing out a short link has to agree with the middleware about
 * what "looks like a username" means, or it will produce links that resolve
 * to nothing — so both sides read these, rather than each keeping a copy.
 */

/**
 * Top-level path segments that belong to the app itself and must never be
 * treated as a candidate username.
 */
export const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  "rp",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "icons",
  "sw.js",
  "workbox",
  "worker",
  "models",
  "animations",
  "assets",
  "public",
]);

/**
 * Same validation rule the sign-up form applies (see checkUsernameInvalidity):
 * 3–50 characters, letters / digits / underscore / dot / hyphen only.
 */
export const USERNAME_PATH_RE = /^[a-zA-Z0-9_.-]{3,50}$/;

/**
 * Whether `/{username}` will actually reach that novelist's profile.
 *
 * False for a name the middleware would refuse to treat as a username — one
 * that collides with a path the app owns, or that does not match the username
 * shape. Callers fall back to the full `/rp/profile/{username}` path, which
 * has no such conditions on it.
 */
export const canShortenProfilePath = (username: string): boolean =>
  USERNAME_PATH_RE.test(username) && !RESERVED_TOP_LEVEL_SEGMENTS.has(username);
