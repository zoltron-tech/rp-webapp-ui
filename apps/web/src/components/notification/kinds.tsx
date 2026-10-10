import { type NotificationKind, notificationKind } from "@nw/features";
import type { NovelistWorldNotification } from "@nw/types";
import type { IconType } from "react-icons";
import {
  BsAt,
  BsBellFill,
  BsBookFill,
  BsBookmarkFill,
  BsChatLeftTextFill,
  BsHeartFill,
  BsLink45Deg,
  BsPersonCheckFill,
  BsPersonPlusFill,
  BsReplyFill,
  BsStars,
} from "react-icons/bs";

/**
 * The glyph for each kind. Everything else about a notification's look — its
 * kind, colour, kicker and section — is decided in `@nw/features`, where the
 * phone reads the same table.
 */
const ICONS: Record<NotificationKind, IconType> = {
  chapter: BsBookmarkFill,
  comment: BsChatLeftTextFill,
  friendAccepted: BsPersonCheckFill,
  friendRequest: BsPersonPlusFill,
  like: BsHeartFill,
  mention: BsAt,
  museRequest: BsLink45Deg,
  museUpdate: BsStars,
  other: BsBellFill,
  reply: BsReplyFill,
  story: BsBookFill,
};

export const notificationIcon = (
  notification: NovelistWorldNotification,
): IconType => ICONS[notificationKind(notification)];
