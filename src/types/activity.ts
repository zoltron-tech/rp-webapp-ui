import type { NWImage } from "./novelist";

export interface Activity {
  id: string;
  source: ActivitySource;
  target: ActivityTarget;
  activityText: string;
  date: number;
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
