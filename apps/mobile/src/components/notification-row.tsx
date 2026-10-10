import { Ionicons } from "@expo/vector-icons";
import {
  isStoredNotification,
  notificationHue,
  notificationKicker,
  queryKeys,
  useNotificationReadState,
} from "@nw/features";
import { mixColors } from "@nw/theme";
import type { NovelistWorldNotification } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { useConnectionAction } from "@/hooks/use-connection";
import { notificationHref, notificationIcon } from "@/lib/notification-target";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { Button } from "@/components/button";

/**
 * One notification.
 *
 * Who did it is the face — two of them, overlapped, when the row stands for a
 * crowd ("Naga and 3 others"). What they did is the small coloured glyph on
 * the face's corner and the kicker above the sentence, both in the kind's own
 * colour: red for a like, blue for a comment, violet for a mention. The
 * sentence is the server's, shown as it comes, with the name in the text
 * colour and the action in the secondary one.
 *
 * Unread is a faint wash of that same colour and a dot at the end, over the
 * group's panel. The accent wash this replaces made three unread rows louder
 * than the rest of the screen put together; a wash in the row's own hue, at a
 * tenth, reads as a highlight on the row rather than an alarm.
 *
 * ## Where it goes
 *
 * `notificationHref` owns that, and returns `null` for the kinds this client
 * has no screen for yet (storyboards). A row with nowhere to go is drawn
 * without press feedback and without the chevron, rather than being a tap that
 * does nothing.
 *
 * ## The one row that does something in place
 *
 * A friend request is answered here, as it is on web: accept and decline beside
 * the text. `useConnectionAction` writes the result into every cached list this
 * person appears in, so the suggestion card in the home rail changes with it.
 * Answering removes the row through `onAnswered` — the notification itself
 * stays on the server, and re-reading the list after the fact would put a
 * request back that has already been dealt with.
 */

const AVATAR = 42;
/** Each of the two faces of a crowd, overlapped on the diagonal. */
const PAIR = 30;
const MARK = 18;

/** Same relative-time vocabulary the web notification card uses. */
export const relativeTime = (epochSeconds: number): string => {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - epochSeconds));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w`;
  return `${Math.floor(weeks / 52)}y`;
};

/**
 * Where a row sits in its group, which is what shapes it.
 *
 * The rows of one section are drawn as a single panel: the first rounds the
 * top, the last rounds the bottom and closes the edge, the ones between are
 * ruled apart. Each row draws its own slice, so the list stays a flat,
 * windowed list rather than a list of containers.
 */
export type RowPlace = "only" | "first" | "middle" | "last";

const NotificationRowView = ({
  notification,
  onAnswered,
  place = "only",
}: {
  place?: RowPlace;
  notification: NovelistWorldNotification;
  /** A friend request answered here: the row goes. */
  onAnswered?: (id: string) => void;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const action = useConnectionAction();
  const { markRead } = useNotificationReadState();
  const queryClient = useQueryClient();

  const { source } = notification;
  const href = notificationHref(notification);
  const hue = notificationHue(notification);
  const isRequest = notification.type === "FRIEND_REQUEST";
  // The latest performer is the row's source; a second face shows it is a crowd.
  const second = (notification.actors ?? []).find(
    (actor) => actor.id !== source?.id,
  );

  const panel = theme.material.card.backgroundColor;
  // The kind's colour, mixed toward the theme's text so the kicker stays
  // readable on a light page and a dark one alike.
  const kickerColor = mixColors(hue, 0.62, theme.text);
  const wash = mixColors(hue, 0.12, panel);

  const busy = action.isPending;
  const running = busy ? action.variables?.action : undefined;

  const answer = (name: "accept" | "reject", what: string) => {
    if (busy || !source?.id) return;
    action
      .mutateAsync({
        action: name,
        novelist: { id: source.id, username: source.urlProp },
      })
      .then(() => onAnswered?.(notification.id))
      .catch(() =>
        Alert.alert("Not saved", `${what} could not be completed. Try again.`),
      );
  };

  return (
    <Pressable
      accessibilityLabel={`${notificationKicker(notification)}. ${source?.title ?? "Someone"} ${notification.notificationText}`}
      accessibilityRole={href ? "button" : "text"}
      disabled={!href}
      onPress={() => {
        if (!href) return;
        // Opening a row is reading it. A pending request is cleared by
        // answering it instead; it has no stored row to mark.
        if (!notification.isRead && isStoredNotification(notification.type)) {
          void markRead(notification.id).then(() =>
            queryClient.invalidateQueries({
              queryKey: queryKeys.notifications(),
            }),
          );
        }
        router.push(href);
      }}
      style={({ pressed }) => [
        styles.row,
        (place === "first" || place === "only") && styles.rowTop,
        (place === "last" || place === "only") && styles.rowBottom,
        {
          backgroundColor:
            pressed && href
              ? theme.material.fillPressed
              : notification.isRead
                ? panel
                : wash,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <View style={styles.faces}>
        {second ? (
          <>
            <View style={[styles.faceBack, { borderColor: panel }]}>
              <Avatar name={second.title} size={PAIR} uri={second.image} />
            </View>
            <View style={[styles.faceFront, { borderColor: panel }]}>
              <Avatar
                image={source?.avatar}
                name={source?.title}
                size={PAIR}
                uri={source?.avatar?.src ?? source?.image}
              />
            </View>
          </>
        ) : (
          <Avatar
            image={source?.avatar}
            name={source?.title}
            size={AVATAR}
            uri={source?.avatar?.src ?? source?.image}
          />
        )}
        {/* What kind of thing happened, on the corner of who did it. */}
        <View
          style={[styles.mark, { backgroundColor: hue, borderColor: panel }]}
        >
          <Ionicons
            color="#ffffff"
            name={notificationIcon(notification)}
            size={10}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.kicker, { color: kickerColor }]}>
          {notificationKicker(notification)}
        </Text>

        <Text
          numberOfLines={3}
          style={[
            styles.text,
            { color: notification.isRead ? theme.textGray : theme.text },
          ]}
        >
          {source?.title ? (
            <Text style={[styles.name, { color: theme.text }]}>
              {source.title}
            </Text>
          ) : null}
          {source?.title ? " " : null}
          {notification.notificationText}
        </Text>

        <Text style={[styles.when, { color: theme.textGray }]}>
          {relativeTime(notification.date)}
        </Text>

        {isRequest ? (
          <View style={styles.actions}>
            <Button
              busy={running === "accept"}
              icon="checkmark"
              label="Accept"
              onPress={() => answer("accept", "Accepting")}
              hitSlop={space.xs}
              size="xs"
              variant="positive"
            />
            <Button
              busy={running === "reject"}
              icon="close"
              label="Decline"
              onPress={() => answer("reject", "Declining")}
              hitSlop={space.xs}
              size="xs"
              variant="quiet"
            />
          </View>
        ) : null}
      </View>

      <View style={styles.tail}>
        {notification.isRead ? null : (
          <View style={[styles.dot, { backgroundColor: hue }]} />
        )}
        {href ? (
          <Ionicons
            color={theme.textGray}
            name="chevron-forward"
            size={14}
            style={styles.chevron}
          />
        ) : null}
      </View>
    </Pressable>
  );
};

/**
 * `notification` comes straight out of the query cache, so its identity is
 * stable between renders and this compares in one pointer check per row.
 */
export const NotificationRow = memo(NotificationRowView);

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: space.s,
    marginTop: space.sm,
  },
  body: { flex: 1, gap: space.xxs, minWidth: 0 },
  chevron: { opacity: 0.6 },
  dot: { borderRadius: radius.xs, height: 8, width: 8 },
  // A ring in the panel's colour parts the front face from the one behind.
  faceBack: {
    borderRadius: PAIR / 2 + 1,
    borderWidth: 1,
    left: 0,
    opacity: 0.85,
    position: "absolute",
    top: 0,
  },
  faceFront: {
    borderRadius: PAIR / 2 + 2,
    borderWidth: 2,
    bottom: 0,
    position: "absolute",
    right: 0,
  },
  faces: { height: AVATAR, width: AVATAR },
  kicker: {
    fontSize: fontSize.eyebrow,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  mark: {
    alignItems: "center",
    borderRadius: MARK / 2,
    borderWidth: 2,
    bottom: -3,
    height: MARK,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    width: MARK,
  },
  name: { fontWeight: "700" },
  row: {
    alignItems: "flex-start",
    // A rule under every row but the group's last, which takes the panel's
    // own edge instead.
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: border.edge,
    borderRightWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    marginHorizontal: space.md,
    overflow: "hidden",
    paddingHorizontal: space.m,
    paddingVertical: space.m,
  },
  rowBottom: {
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
    borderBottomWidth: border.edge,
  },
  rowTop: {
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderTopWidth: border.edge,
  },
  tail: { alignItems: "center", gap: space.xs, paddingTop: space.m },
  text: { fontSize: fontSize.body, lineHeight: 20 },
  when: { fontSize: fontSize.caption },
});
