/**
 * The `@` in `/@username`.
 *
 * Profiles live at the root of the domain, next to the app's own routes. The
 * `@` is what keeps those two namespaces from ever intersecting: it is not a
 * legal username character, so no username can collide with a path the app
 * owns, no path the app owns can shadow a username, and neither can start to
 * once someone adds a page or drops a file in `public/`.
 *
 * That is the whole design. It replaces a reserved-word list
 * (`RESERVED_TOP_LEVEL_SEGMENTS`, deleted with this) and a per-request backend
 * lookup, both of which only ever narrowed the odds of a collision. A list has
 * to be maintained forever and fails silently when it isn't — the failure mode
 * being a novelist's profile quietly becoming unreachable, or a new page
 * quietly shadowing one. Facebook and Instagram both carry that list and that
 * risk; Mastodon, TikTok, Medium and Threads all use the `@` instead.
 *
 * The one cost is a character in the URL, which reads as "this is a person"
 * and is arguably worth having.
 */

export const HANDLE_PREFIX = "@";

/** Builds the handle segment for a username: `tokyo` → `@tokyo`. */
export const toHandle = (username: string) => `${HANDLE_PREFIX}${username}`;

/**
 * Whether a path segment is a profile handle rather than something else.
 *
 * Used by the route guard. A bare segment is not a handle — it is either a
 * legacy short link or a path that belongs to the app.
 */
export const isProfileHandle = (segment: string | undefined): boolean =>
  !!segment && segment.startsWith(HANDLE_PREFIX) && segment.length > 1;

/**
 * The username inside a handle: `@tokyo` → `tokyo`.
 *
 * Tolerates a bare name so a page rendered from an unexpected route shape
 * still asks the backend about the right novelist rather than about `@tokyo`.
 */
export const usernameFromHandle = (handle: string | undefined): string =>
  handle?.startsWith(HANDLE_PREFIX)
    ? handle.slice(HANDLE_PREFIX.length)
    : (handle ?? "");
