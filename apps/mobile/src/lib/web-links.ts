/**
 * Where a link to the website lands in the app.
 *
 * Android App Links and iOS Universal Links hand the app the website's address,
 * and the app's routes are not the website's. Only what the phone is told to
 * open here is mapped (`app.json`). Everything else passes through untouched,
 * which is what keeps `novelistworld://` links and the dev client working.
 *
 * A pattern and not `URL`: React Native's `URL` does not implement `pathname`.
 */

const WEB_PATH = /^(?:[a-z][a-z0-9+.-]*:\/\/[^/?#]*)?(\/rp\/[^?#]*)(\?[^#]*)?/i;
const STORY_EVENT = /^\/rp\/story\/event\/([^/]+)\/?$/;
const STORY = /^\/rp\/story\/([^/]+)\/?$/;

/** One query parameter, as it was written. */
const param = (query: string, name: string): string | null =>
  new RegExp(`[?&]${name}=([^&]*)`).exec(query)?.[1] ?? null;

export const appPathFor = (path: string): string => {
  const match = WEB_PATH.exec(path);
  if (!match) return path;
  const [, pathname, query = ""] = match;

  const chapter = STORY_EVENT.exec(pathname)?.[1];
  if (chapter) return `/story/chapter/${chapter}`;
  const story = STORY.exec(pathname)?.[1];
  if (story) return `/story/${story}`;

  if (/^\/rp\/reset-password\/?$/.test(pathname)) {
    return `/reset-password${query}`;
  }
  if (/^\/rp\/verify-email\/?$/.test(pathname)) {
    return `/verify-email${query}`;
  }
  if (/^\/rp\/login\/?$/.test(pathname)) {
    const referral = param(query, "referralUser");
    return referral ? `/register?referralUser=${referral}` : "/login";
  }
  return path;
};
