import { Tagged } from "./common";

export interface Activity extends Tagged {
  _tag: "Activity";
  id: string;
  source: ActivitySource;
  target: ActivityTarget;
  activityText: string;
  date: number;
}

export interface ActivityTarget extends Tagged {
  _tag: "ActivityTarget";
  id: string;
  title: string;
  activityTargetType: string;
  url: string;
}

export interface ActivitySource extends Tagged {
  _tag: "ActivitySource";
  id: string;
  title: string;
  activitySourceType: string;
  image: string;
  urlProp: string;
}
