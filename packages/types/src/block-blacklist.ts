/**
 * Blacklist (a one-way mute) and block (a two-way wall), as the clients draw
 * them (BLOCK_BLACKLIST_PLAN.md at the repo root).
 *
 * Items the server still sends but the viewer should not read straight away
 * carry `hiddenReason`. The item travels whole — text, media, author — so a
 * "Show" needs no second fetch (B13); a reveal lasts for that item on that
 * view only (B12). A disabled author is a placeholder instead and never
 * carries a reason (X1).
 */

/** Why an item is drawn as a stub. Mirrors `HiddenReason.kt`. */
export type HiddenReason = "BLACKLISTED" | "BLOCKED";

/** Anything the server may flag for a stub. */
export type MaybeHidden =
  | { hiddenReason?: HiddenReason | null }
  | null
  | undefined;

/** True when the viewer should see a stub with "Show" instead of the item. */
export const isHiddenItem = (item: MaybeHidden): boolean =>
  item?.hiddenReason != null;

/** The connection status a profile carries once the caller blacklisted it (B3). */
export const CONNECTION_BLACKLISTED = "BLACKLISTED";

/** True for a profile, friend or overview the caller has blacklisted. */
export const isBlacklistedConnection = (
  person: { connection?: string | null } | null | undefined,
): boolean => person?.connection === CONNECTION_BLACKLISTED;

/**
 * How a stub names an author: "@handle" for a novelist, the character's own
 * name for a muse (that is who the words appear under).
 */
export const stubHandle = (
  source:
    | {
        sourceType?: string | null;
        name?: string | null;
        urlProp?: string | null;
      }
    | null
    | undefined,
): string => {
  if (!source) return "someone";
  if (source.sourceType === "NOVELIST" && source.urlProp)
    return `@${source.urlProp}`;
  return source.name || "someone";
};

/** What kind of item a stub stands in for; picks its noun. */
export type HiddenItemKind =
  | "comment"
  | "reply"
  | "thread"
  | "passage"
  | "connection";

const NOUN: Record<HiddenItemKind, string> = {
  comment: "Comment",
  connection: "Connection",
  passage: "Passage",
  reply: "Reply",
  thread: "Thread",
};

/**
 * The copy both clients use, one place so web and mobile never drift. Handles
 * arrive as shown ("@ada", see `handleOf`).
 */
export const BLOCK_BLACKLIST_COPY = {
  /** The confirm before blacklisting someone. */
  blacklistConfirm: {
    action: "Blacklist",
    heading: (handle: string) => `Blacklist ${handle}?`,
    text: (handle: string) =>
      `You'll stop seeing ${handle}'s posts, and their comments will be hidden behind a tap. Your chat with them moves to Archived, muted. They won't be told, and you can undo it any time.`,
  },
  blacklistedToast: (handle: string) => `${handle} is blacklisted`,
  /** The banner on a blacklisted novelist's profile (B3). */
  profileBanner: (handle: string) => `You've blacklisted ${handle}`,
  removeFromBlacklist: "Remove from blacklist",
  removedToast: (handle: string) => `${handle} is off your blacklist`,
  /** The one reveal over a blacklisted profile's posts and muses (B3). */
  hiddenSection: (handle: string) => `Hidden — you've blacklisted ${handle}`,
  show: "Show",
  /** "Comment from @ada hidden" (B11); "Thread with Lyra hidden" for a thread or connection. */
  stub: (kind: HiddenItemKind, handle: string) =>
    kind === "thread" || kind === "connection"
      ? `${NOUN[kind]} with ${handle} hidden`
      : `${NOUN[kind]} from ${handle} hidden`,
  /** A muse page reached by link whose novelist the viewer blacklisted (B4). */
  museHidden: {
    heading: "Character hidden",
    show: "Show character",
    text: (handle: string) =>
      `You blacklisted ${handle}, who writes this character.`,
  },
  /** The settings list (B15), above Blocked accounts. */
  blacklistedList: {
    empty: "You haven't blacklisted anyone.",
    heading: "Blacklisted novelists",
    hint: "Their posts stay out of your feeds and their comments sit behind a tap. They aren't told.",
  },
} as const;
