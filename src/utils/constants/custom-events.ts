export const EVENTS = {
  MuseDeleted: "muse:deleted",
} as const;

export type MuseDeletedPayload = {
  id: string;
  name: string;
};

export type CustomEventType<T> = {
  detail: T;
};
