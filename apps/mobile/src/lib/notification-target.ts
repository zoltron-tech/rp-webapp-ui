import { type NotificationKind, notificationKind } from "@nw/features";
import type { NovelistWorldNotification } from "@nw/types";

/**
 * Where a notification leads, and what it looks like.
 *
 * The web app decides this inside its notification card, as a ladder of `if`s
 * over `type` and `target.targetType` (`components/notification/
 * notificaction-box.tsx`). The same table is here as data, for two reasons: a
 * row that is a `FlatList` cell should not carry a routing decision, and a
 * destination that does not exist on this client has to be *known* rather than
 * discovered by a tap that does nothing.
 *
 * ## What the payload gives us
 *
 * `source` is who did it — a novelist, addressed by `urlProp` (their username).
 * `target` is what they did it to: `targetType` names the kind and `urlProp`
 * the id. The two are not interchangeable, and which one a type routes by is
 * the whole content of this table. A friend request goes to the *sender's*
 * profile; everything else goes to the thing.
 *
 * ## What is not reachable yet
 *
 * Storyboards and storyboard events have no screen on this client (they are a
 * later phase), so those notifications resolve to `null` and their rows do not
 * pretend to be pressable. That is the reason this returns a destination rather
 * than taking a router: a row has to be able to ask before it draws.
 */

/** An `expo-router` push, in the shape `router.push` takes. */
export interface NotificationHref {
  params: Record<string, string>;
  pathname: string;
}

const thread = (id: string): NotificationHref => ({
  params: { threadId: id },
  pathname: "/threads/[threadId]",
});
const prompt = (id: string): NotificationHref => ({
  params: { promptId: id },
  pathname: "/prompt/[promptId]",
});
const muse = (id: string): NotificationHref => ({
  params: { museId: id },
  pathname: "/muse/[museId]",
});
const novelist = (username: string): NotificationHref => ({
  params: { username },
  pathname: "/novelist/[username]",
});

/**
 * A reaction carries the kind of thing it is on, which is the only place
 * `targetType` decides a route rather than `type`.
 */
const reactionHref = (
  targetType: string,
  id: string,
): NotificationHref | null => {
  if (targetType === "COMMENT" || targetType === "REPLY") return thread(id);
  if (targetType === "PROMPT") return prompt(id);
  // STORY_BOARD and STORY_BOARD_EVENT: no screen on this client yet.
  return null;
};

export const notificationHref = (
  notification: NovelistWorldNotification,
): NotificationHref | null => {
  const { source, target, type } = notification;
  const id = target?.urlProp;

  switch (type) {
    case "FRIEND_REQUEST":
    case "FRIEND_REQUEST_ACCEPTED":
      return source?.urlProp ? novelist(source.urlProp) : null;
    case "MUSE_CONNECTION_REQUEST":
    case "MUSE_CONNECTION_UPDATE":
      return id ? muse(id) : null;
    case "PROMPT_COMMENT":
    case "PROMPT_COMMENT_REPLY":
    case "REPLY":
      return id ? thread(id) : null;
    case "REACTION":
      return id ? reactionHref(target?.targetType ?? "", id) : null;
    default:
      // Anything the server adds later still opens *something* when its target
      // is a kind this client knows; otherwise the row stays inert.
      return id ? reactionHref(target?.targetType ?? "", id) : null;
  }
};

/**
 * The glyph on the corner of the face, by kind. The kind itself, its colour,
 * the kicker and the section a row falls in are decided in `@nw/features`,
 * where the web list reads the same table.
 */
export type NotificationIcon =
  | "at"
  | "book"
  | "bookmark"
  | "chatbubble"
  | "heart"
  | "link"
  | "notifications"
  | "person-add"
  | "person"
  | "return-down-forward"
  | "sparkles";

const ICONS: Record<NotificationKind, NotificationIcon> = {
  chapter: "bookmark",
  comment: "chatbubble",
  friendAccepted: "person",
  friendRequest: "person-add",
  like: "heart",
  mention: "at",
  museRequest: "link",
  museUpdate: "sparkles",
  other: "notifications",
  reply: "return-down-forward",
  story: "book",
};

export const notificationIcon = (
  notification: NovelistWorldNotification,
): NotificationIcon => ICONS[notificationKind(notification)];
