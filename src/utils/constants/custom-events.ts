export const EVENTS = {
  MUSE: {
    base: "muse",
    DELETED: "deleted",
  },
} as const;

export type MuseDeletedPayload = {
  id: string;
  name: string;
};

export type CustomEventType<T> = {
  detail: T;
};
