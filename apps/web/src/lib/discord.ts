import type { Prompt } from "@nw/types";

/**
 * The payloads the app sends when sharing into the community Discord.
 *
 * Types only. The embeds themselves — 500-odd lines of HTML parsing, colour
 * resolution, image sizing and Discord markdown — moved to the portfolio
 * service when the share endpoints did. Whoever holds the bot token decides
 * what gets posted with it, and a native client would otherwise have had to
 * reimplement all of it.
 *
 * The app still assembles the *data*, because it is the side that holds the
 * crop and sizing context needed to turn an image record into a URL — hence
 * the pre-resolved `*Src` fields below.
 */

/** What a successful share returns: a link to the posted message. */
export interface SharePromptResult {
  success: true;
  messageUrl: string;
}

export interface SharePromptPayload {
  promptUrl: string;
  prompt: Pick<Prompt, "source" | "text" | "media" | "createdOn">;
  novelistUsername: string;
}

/** Minimal muse data serialised from the frontend and sent to /api/discord/share-muse. */
export interface ShareMuseData {
  firstName: string;
  lastName: string;
  fandom: { name: string };
  tags: { label: string }[];
  note: string;
  image: string | null;
  /** Pre-resolved from NWImage.src — avatar portrait used as embed thumbnail. */
  avatarSrc: string | null;
  /** Pre-resolved from NWImage.src — card background used as full-width embed image. */
  cardBackgroundSrc: string | null;
  nicknames: string[] | null;
  extraAttributes: Record<string, string> | null;
  level: number;
  useAccent: boolean;
  accent: string | null;
  pennedBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    image: string;
  };
}

export interface ShareMusePayload {
  museUrl: string;
  muse: ShareMuseData;
  novelistUsername: string;
}

/** Minimal story data serialised from the frontend and sent to /api/discord/share-story. */
export interface ShareStoryData {
  name: string;
  description: string | null;
  image: string | null;
  /** Pre-resolved from NWImage.src — cover used as the embed thumbnail. */
  coverSrc: string | null;
  fandomName: string | null;
  genres: string[];
  isPublic: boolean;
  createdBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string | null;
    image: string;
  } | null;
}

export interface ShareStoryPayload {
  storyUrl: string;
  story: ShareStoryData;
  novelistUsername: string;
}

/** Minimal novelist data serialised from the frontend and sent to /api/discord/share-profile. */
export interface ShareProfileData {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  image: string | null;
  /** Pre-resolved from NWImage.src — avatar portrait used as embed thumbnail. */
  avatarSrc: string | null;
  /** Pre-resolved from NWImage.src — banner used as full-width embed image. */
  bannerSrc: string | null;
  /** Status note text, shown above the about blurb when present. */
  note: string | null;
  /** Rich-text about blurb (HTML). */
  about: string | null;
  /** ACCENT_MAP palette index — resolves the embed border colour. */
  palette: number | null;
  museCount: number;
  friendsCount: number;
  isVerified: boolean;
  createdAt: string | null;
  /** A few muses to spotlight on the embed. */
  muses: { id: string; name: string }[];
}

export interface ShareProfilePayload {
  profileUrl: string;
  profile: ShareProfileData;
  novelistUsername: string;
}

/** Minimal chapter data serialised from the frontend and sent to /api/discord/share-chapter. */
export interface ShareChapterData {
  name: string;
  description: string;
  image: string | null;
  /** Pre-resolved from NWImage.src — cover used as the embed thumbnail. */
  coverSrc: string | null;
  storyBoardName: string;
  storyBoardId: string;
}

export interface ShareChapterPayload {
  chapterUrl: string;
  chapter: ShareChapterData;
  novelistUsername: string;
}
