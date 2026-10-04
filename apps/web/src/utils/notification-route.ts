import type { NovelistWorldNotification } from "@nw/types";
import { ROUTES } from "@/utils/constants/routes";

/**
 * Where a notification leads, or `null` when it leads nowhere on this client.
 *
 * One table for the bell menu and the notifications page, which each carried
 * their own copy of the same ladder. The mobile app has the same table in
 * `apps/mobile/src/lib/notification-target.ts`.
 *
 * `source` is who did it; `target` is what they did it to. A friend request
 * (sent or accepted) goes to the other person's profile; everything else goes
 * to the thing.
 */

/** By what the target is — the only question a type the client has never heard of can answer. */
const byTargetKind = (notification: NovelistWorldNotification) => {
  const id = notification.target?.urlProp;
  if (!id) return null;

  switch (notification.target.targetType) {
    case "COMMENT":
    case "REPLY":
      return ROUTES.Thread.View(id);
    case "PROMPT":
      return ROUTES.Prompt.View(id);
    case "STORY_BOARD":
      return ROUTES.Story.View(id);
    case "STORY_BOARD_EVENT":
      return ROUTES.Story.Event.View(id);
    case "MUSE":
      return ROUTES.Muse.View(id);
    default:
      return null;
  }
};

export const notificationRoute = (
  notification: NovelistWorldNotification,
): string | null => {
  const id = notification.target?.urlProp;

  switch (notification.type) {
    case "FRIEND_REQUEST":
    case "FRIEND_REQUEST_ACCEPTED":
      return notification.source?.urlProp
        ? ROUTES.Profile.View(notification.source.urlProp).Index
        : null;
    case "MUSE_CONNECTION_REQUEST":
    case "MUSE_CONNECTION_UPDATE":
      return id ? ROUTES.Muse.View(id) : null;
    case "PROMPT_COMMENT":
    case "PROMPT_COMMENT_REPLY":
    case "REPLY":
      return id ? ROUTES.Thread.View(id) : null;
    case "STORYBOARD_UPDATE":
      return id ? ROUTES.Story.View(id) : null;
    case "STORYBOARD_EVENT_UPDATE":
      return id ? ROUTES.Story.Event.View(id) : null;
    default:
      // REACTION, and anything the server adds later: a new type still opens
      // its target when the target is a kind this client knows.
      return byTargetKind(notification);
  }
};
