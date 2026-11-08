import type { HiddenReason } from "./block-blacklist";
import type { Book } from "./books";
import type { ProfileSong } from "./music";
import type { Friend, NWImage } from "./novelist";

export type PrivacyLevel = "PUBLIC" | "FRIENDS" | "ONLY_ME" | "CUSTOM";

export interface Prompt {
  id: string;
  source: PromptSource;
  text: string;
  media: string;
  song: string;
  /** Optional rich featured song attached to the prompt (NW Library / Spotify). */
  featuredSong: ProfileSong | null;
  privacy: PrivacyLevel;
  createdOn: string;
  canInteract: boolean;
  reacted: boolean;
  commentCount: number;
  reactions: number;
  sharedWith: Friend[];
}

export interface PromptThreadComment {
  id: string;
  type: "COMMENT" | "REPLY";
  parentId: string;
  source: PromptSource;
  target: PromptSource;
  text: string;
  media: string;
  createdOn: number;
  replyCount: number;
  concluded: boolean;
  /** Viewer blacklisted the author: draw a stub with "Show" (BLOCK_BLACKLIST_PLAN.md B11). */
  hiddenReason?: HiddenReason | null;
}

export interface Comment {
  id: string;
  prompt: Prompt | null;
  promptId: string;
  source: PromptSource;
  text: string;
  media: string;
  replies: Reply[];
  replyCount: number;
  createdOn: string;
  reactions: number;
  reacted: boolean;
  /** Author-set flag closing the thread: no new replies, hidden reply count. */
  concluded: boolean;
  /** Whether the requesting novelist owns the prompt this comment was made on. */
  isPromptOwner: boolean;
  /** Viewer blacklisted the author: draw a stub with "Show" (BLOCK_BLACKLIST_PLAN.md B11). */
  hiddenReason?: HiddenReason | null;
}

export interface Reply {
  id: string;
  commentId: string;
  source: PromptSource;
  text: string;
  media: string;
  createdOn: string;
  reactions: number;
  reacted: boolean;
  /** Viewer blacklisted the author: draw a stub with "Show" (BLOCK_BLACKLIST_PLAN.md B11). */
  hiddenReason?: HiddenReason | null;
}

export interface PromptSource {
  sourceId: string;
  name: string;
  image: string;
  sourceType: "NOVELIST" | "MUSE";
  urlProp: string;
  /** Avatar with crop/position data. Present for NOVELIST sources that have
   *  configured an avatar. Falls back to `image` when absent. */
  avatar?: NWImage | null;
  /** Whether the source has an active accent color. For MUSE: the accent hex
   *  string; for NOVELIST: the palette key as a string (resolved via ACCENT_MAP). */
  useAccent?: boolean;
  accent?: string | null;
  /**
   * A disabled novelist's stand-in (ACCOUNT_DISABLE_PLAN.md §3.3): the real
   * id, the placeholder label as the name, no image or link. Draw it with
   * `PlaceholderAvatar` and never route to it.
   */
  isPlaceholder?: boolean;
}

export interface IceBreaker {
  sourceId: string;
  source: PromptSource;
  message: string;
  color?: string | null;
  createdOn: string;
  /** The novelist who owns this ice breaker's source (itself, for a
   *  NOVELIST source; the muse's owner, for a MUSE source) — the reply
   *  target when starting/continuing a conversation. */
  ownerNovelistId: string;
  /**
   * ICE_BREAKER (default): a line someone wrote. READING: a "currently
   * reading" shelf entry shown in the same rail — `sourceId` is the shelf
   * row's id, `source` is the reader, `book` is set. Replies carry the
   * same `repliedTo.type` either way.
   */
  kind?: IceBreakerKind;
  book?: Book | null;
}

export type IceBreakerKind = "ICE_BREAKER" | "READING";

export type SubmitPromptInput = {
  source: PromptSource;
  text: string;
  media: string;
  promptId?: string;
  commentId?: string;
  privacy?: "PUBLIC" | "FRIENDS" | "ONLY_ME" | "CUSTOM";
  sharedWith?: Friend[];
  /** Only carried when posting a prompt (never comments/replies). */
  featuredSong?: ProfileSong | null;
};

export type SubmitPromptType = "prompt" | "comment" | "reply";
