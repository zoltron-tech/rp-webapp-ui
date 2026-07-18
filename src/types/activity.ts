import type { NWImage } from "./novelist";

export interface Activity {
  id: string;
  source: ActivitySource;
  target: ActivityTarget;
  activityText: string;
  date: number;
  /** MEDIA activities only: heart reaction count and whether the viewer reacted. */
  reactionCount?: number;
  reacted?: boolean;
}

export interface MediaMetadata {
  id: string;
  mediaUrl: string;
  museId: string;
  description: string | null;
  isVideo: boolean;
  reactionCount: number;
  reacted: boolean;
  modifiedAt: number;
}

export interface ActivityTarget {
  id: string;
  title: string;
  activityTargetType: string;
  url: string;
}

export interface ActivitySource {
  id: string;
  title: string;
  sourceType: string;
  image: string;
  avatar?: NWImage | null;
  urlProp: string;
}
