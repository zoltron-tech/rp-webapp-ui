import type { Tag } from "@nw/types/common";

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
    OPEN_THREADS: "open-threads",
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
  STORY_BOARD: {
    base: "story-board",
    REACTED: "reacted",
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

export type StoryBoardReactedPayload = {
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
