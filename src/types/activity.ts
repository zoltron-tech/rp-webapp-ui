import { Tagged } from "./common";
import { Novelist } from "./novelist";

export interface Activity extends Tagged {
  _tag: "Activity";
  id: string;
  novelist: Novelist;
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
