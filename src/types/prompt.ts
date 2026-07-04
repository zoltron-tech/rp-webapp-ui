import type { Friend, NWImage } from "./novelist";

export type PrivacyLevel = "PUBLIC" | "FRIENDS" | "ONLY_ME" | "CUSTOM";

export interface Prompt {
  id: string;
  source: PromptSource;
  text: string;
  media: string;
  song: string;
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
  tyoe: "COMMENT" | "REPLY";
  parentId: string;
  source: PromptSource;
  target: PromptSource;
  text: string;
  media: string;
  createdOn: number;
  replyCount: number;
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
}

export type SubmitPromptInput = {
  source: PromptSource;
  text: string;
  media: string;
  promptId?: string;
  commentId?: string;
  privacy?: "PUBLIC" | "FRIENDS" | "ONLY_ME" | "CUSTOM";
  sharedWith?: Friend[];
};

export type SubmitPromptType = "prompt" | "comment" | "reply";
