import type { ActivitySource } from "./activity";

export interface NovelistWorldNotification {
  id: string;
  source: ActivitySource;
  target: NotificationTarget;
  type: string;
  notificationText: string;
  isRead: boolean;
  date: number;
  /** Cleared by opening the feed; drives the badge. Absent from an older server. */
  isSeen?: boolean;
  /** Distinct performers a grouped row stands for. The count is already in `notificationText`. */
  actorCount?: number;
  /** Up to three of the most recent performers, newest first, for stacked avatars. */
  actors?: ActivitySource[];
}

/** One page of the feed. `nextCursor` is null at the end. */
export interface NotificationFeed {
  items: NovelistWorldNotification[];
  nextCursor: string | null;
}

export interface NotificationCounts {
  /** What the badge shows. */
  unseen: number;
  unread: number;
}

export interface NotificationTarget {
  targetType: string;
  urlProp: string;
}

/**
 * One thing muted: a kind of notification (`REACTIONS`, `COMMENTS`,
 * `MENTIONS`, `REQUESTS`, `MUSE_CONNECTION`, `STORY`), every conversation
 * (`CHAT`) or one conversation (`C:<id>`). `until` null is until unmuted.
 */
export interface NotificationMute {
  key: string;
  until: string | null;
}
