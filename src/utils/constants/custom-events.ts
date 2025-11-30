export const EVENTS = {
  COMMENT: {
    base: "comment",
    DELETED: "deleted",
  },
  MUSE: {
    base: "muse",
    DELETED: "deleted",
  },
} as const;

export type MuseDeletedPayload = {
  id: string;
  name: string;
};

export type CommentDeletedPayload = {
  id: string;
};

export type CustomEventType<T> = {
  detail: T;
};
