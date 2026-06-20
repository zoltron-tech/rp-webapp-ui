import type { Tag } from "@/types/common";

export const EVENTS = {
  COMMENT: {
    base: "comment",
    DELETED: "deleted",
    UPDATED: "updated",
  },
  MUSE: {
    base: "muse",
    DELETED: "deleted",
  },
  PRIVACY: {
    CUSTOM: {
      APPLIED: "applied",
      base: "privacy.custom",
      REMOVED: "removed",
      SELECTION_CLEARED: "cleared",
    },
  },
  PROMPT: {
    base: "prompt",
    REACTED: "reacted",
    UPDATED: "updated",
  },
  REPLY: {
    base: "reply",
    DELETED: "deleted",
    UPDATED: "updated",
  },
  SONG: {
    base: "song",
    DELETED: "deleted",
    UPDATED: "updated",
  },
} as const;

export type MuseDeletedPayload = {
  id: string;
  name: string;
};

export type ItemDeletedPayload = {
  id: string;
};

export type CustomEventType<T> = {
  detail: T;
};

export type PromptCommentReplyUpdatedPayload = {
  id: string;
  text: string;
};

export type PromptReactedPayload = {
  id: string;
  reacted: boolean;
  reactions: number;
};

export type PrivacyCustomAppliedPayload = {
  sharedWith: string[];
};

export type SongUpdatedPayload = {
  id: string;
  name: string;
  description?: string | null;
  tags?: Tag[];
};
