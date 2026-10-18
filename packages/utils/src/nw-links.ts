/**
 * Links back into Novelist World itself, read for what they point at.
 *
 * A message or post that carries `https://www.novelist.world/rp/muse/<id>` is
 * not sharing a web page, it is sharing a muse — and a client that knows that
 * can draw the muse instead of a bare URL. This module is the one place that
 * knows the URL shapes, so a new link kind (a story, a chapter) is added here
 * and every surface that embeds links picks it up.
 *
 * Two shapes are understood: `/rp/<kind>/<uuid>` for the app's own pages,
 * and `/@<username>` for a novelist's profile, which lives at the root of the
 * domain (see `profile-handle.ts` in the web app for why).
 *
 * Deliberately host-strict: only the production hosts, plus whatever hosts the
 * caller names (a client passes its own origin so local builds unfurl too).
 * Matching any host would let an unrelated site's `/rp/muse/<uuid>` path
 * trigger a fetch of a muse that was never linked.
 */

export type NovelistWorldLinkKind =
  | "muse"
  | "prompt"
  | "thread"
  | "novelist"
  | "story"
  | "chapter";

export type NovelistWorldLink = {
  kind: NovelistWorldLinkKind;
  /** A UUID for app pages; the username for a novelist profile. */
  id: string;
  /**
   * The URL as it appeared in the text, query and fragment included, for the
   * fallback anchor — a prompt link often carries `?threadOpen=true`, and a
   * card that opens the prompt should open it the way the link would have.
   */
  url: string;
};

const PRODUCTION_HOSTS = ["novelist.world", "www.novelist.world"];

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/** The characters a username may use — the same rule the signup form checks. */
const USERNAME = "[a-z0-9_.-]+";

/** Path segment → link kind, for the `/rp/<kind>/<uuid>` shape. */
const KINDS: Record<string, NovelistWorldLinkKind> = {
  muse: "muse",
  prompt: "prompt",
  /** `/rp/thread/<commentId>`: a comment and its replies, on a prompt. */
  thread: "thread",
  /** `/rp/story/event/<eventId>`: one chapter of a story. Listed before
   *  `story` so the alternation tries the longer path first. */
  "story/event": "chapter",
  /** `/rp/story/<storyboardId>`: a storyboard — a collaborative story. */
  story: "story",
};

/**
 * A link, anchored nowhere: `exec` it over free text.
 *
 * Group 1 is the host. For an app page, group 2 names the kind and group 3
 * the id; for a profile, group 4 is the username and group 5 any sub-page
 * (`/@tokyo/muses`) that followed it. Group 6 is the query and fragment.
 *
 * The id is a whole UUID, so a sentence that continues after the link keeps
 * its words. The tail is read greedily the way a URL scanner would, then
 * trimmed of the punctuation a sentence puts after a link.
 */
const linkPattern = (): RegExp =>
  new RegExp(
    `https?://([a-z0-9.-]+(?::[0-9]+)?)/(?:rp/(${Object.keys(KINDS).join("|")})/(${UUID})|@(${USERNAME})((?:/[\\w-]+)*))([?#][\\w\\-.~:/?#\\[\\]@!$&'()*+,;=%]*)?`,
    "gi",
  );

/** Characters a sentence puts right after a link, never part of its query. */
const TRAILING_PUNCTUATION = /[.,;:!?)\]'"»]+$/;

const hostAllowed = (host: string, extraHosts: readonly string[]): boolean => {
  const lower = host.toLowerCase();
  return (
    PRODUCTION_HOSTS.includes(lower) ||
    extraHosts.some((h) => h.toLowerCase() === lower)
  );
};

type Found = NovelistWorldLink & { start: number; end: number };

const readMatch = (
  match: RegExpExecArray,
  extraHosts: readonly string[],
): Found | null => {
  const [, host, segment, uuid, username, , tail = ""] = match;
  if (!host || !hostAllowed(host, extraHosts)) return null;

  let kind: NovelistWorldLinkKind | undefined;
  let id: string | undefined;
  if (username) {
    kind = "novelist";
    // A username's own trailing dot is a sentence's full stop far more often
    // than part of the name.
    id = username.replace(/\.+$/, "").toLowerCase();
  } else if (segment && uuid) {
    kind = KINDS[segment.toLowerCase()];
    id = uuid.toLowerCase();
  }
  if (!kind || !id) return null;

  const trimmedTail = tail.replace(TRAILING_PUNCTUATION, "");
  let length = match[0].length - (tail.length - trimmedTail.length);
  if (username && !tail) {
    // No query to trim: trim the full stop off the handle itself instead.
    const stripped = match[0].replace(TRAILING_PUNCTUATION, "");
    length = stripped.length;
  }
  return {
    end: match.index + length,
    id,
    kind,
    start: match.index,
    url: match[0].slice(0, length),
  };
};

/**
 * What a single URL points at, or null when it is not a Novelist World link
 * this module understands.
 */
export const parseNovelistWorldLink = (
  url: string,
  extraHosts: readonly string[] = [],
): NovelistWorldLink | null => {
  const match = linkPattern().exec(url.trim());
  if (!match || match.index !== 0) return null;
  const found = readMatch(match, extraHosts);
  if (!found) return null;
  return { id: found.id, kind: found.kind, url: found.url };
};

/**
 * Every Novelist World link in a piece of plain text, in order, with the
 * character span each one occupies so a renderer can cut it out of the text
 * it sits in. The same muse linked twice comes back twice: they are two
 * places in the text, even if they draw the same card.
 */
export const findNovelistWorldLinks = (
  text: string,
  extraHosts: readonly string[] = [],
): Found[] => {
  const found: Found[] = [];
  if (!text) return found;
  const pattern = linkPattern();
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match) {
    const link = readMatch(match, extraHosts);
    if (link) found.push(link);
    match = pattern.exec(text);
  }
  return found;
};

/** The distinct links in the text, first occurrence wins. */
export const uniqueNovelistWorldLinks = (
  text: string,
  extraHosts: readonly string[] = [],
): NovelistWorldLink[] => {
  const seen = new Set<string>();
  const unique: NovelistWorldLink[] = [];
  for (const link of findNovelistWorldLinks(text, extraHosts)) {
    const key = `${link.kind}:${link.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ id: link.id, kind: link.kind, url: link.url });
  }
  return unique;
};
