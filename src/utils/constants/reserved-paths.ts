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
 *
 * Note that `USERNAME_PATH_RE` below allows dots, so a filename like
 * `favicon-32x32.png` is a *valid* username shape. Anything served from the
 * root of `public/` therefore has to be listed here, or requesting it costs a
 * backend lookup (and up to a 2s timeout) before it falls through. The
 * middleware's `matcher` excludes some of these already; this set is the
 * second layer and the one the link-generating code also reads.
 */
export const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  "rp",
  "api",
  // Next's build output. Dead once the app is on Vite, whose asset directory
  // is "assets" — already listed below. Remove with the rest of Next.
  "_next",
  "robots.txt",
  "sitemap.xml",
  // Next's app/manifest.ts serves .webmanifest today; the static Vite build
  // serves .json. Both are listed so the set is correct before and after.
  "manifest.webmanifest",
  "manifest.json",
  // Directories under public/
  "icons",
  "images",
  "models",
  "animations",
  "assets",
  "promo",
  "public",
  // Service worker artefacts
  "sw.js",
  "workbox",
  "worker",
  // Files at the root of public/ — icons and friends. These moved out of
  // src/app/ so they are actually served; before that they were inert and
  // never reached the middleware at all.
  "favicon.ico",
  "apple-touch-icon.png",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "android-chrome-192x192.png",
  "android-chrome-384x384.png",
  "mstile-150x150.png",
  "browserconfig.xml",
  "safari-pinned-tab.svg",
  "og_image.png",
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
