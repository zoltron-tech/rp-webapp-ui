import type { NWImage } from "./novelist";

export interface Activity {
  id: string;
  source: ActivitySource;
  target: ActivityTarget;
  /**
   * The novelist whose doing this was — in their own name or through one of
   * their characters. The only one the server lets delete it.
   */
  novelistId?: string;
  activityText: string;
  date: number;
  /** Heart reaction count and whether the viewer reacted. PROMPT/COMMENT/REPLY share the
   * underlying prompt's own reactions; every other target type reacts at the activity level. */
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
