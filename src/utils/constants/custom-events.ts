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

export type PrivacyCustomAppliedPayload = {
  sharedWith: string[];
};

export type SongUpdatedPayload = {
  id: string;
  name: string;
  description?: string | null;
  tags?: any[];
};
