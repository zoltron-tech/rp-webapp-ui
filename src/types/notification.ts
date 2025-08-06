import { ActivitySource } from "./activity";

export interface NovelistWorldNotification {
  id: string;
  source: ActivitySource;
  target: NotificationTarget;
  type: string;
  notificationText: string;
  isRead: boolean;
  date: number;
}

export interface NotificationTarget {
  urlProp: string;
}
