import { Ionicons } from "@expo/vector-icons";
import type { NovelistWorldNotification } from "@nw/types";
import { useRouter } from "expo-router";
import { memo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import { useConnectionAction } from "@/hooks/use-connection";
import { notificationHref, notificationLook } from "@/lib/notification-target";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One notification.
 *
 * The row this replaces was a tinted card with the sentence in it and nothing
 * else: no name, no destination, and — because the whole card went accent while
 * unread — a list that looked like a stack of alerts rather than a feed of
 * things that happened. Three things changed.
 *
 * **It says who.** `source.title` is the person, `notificationText` is what
 * they did; the old row drew only the second, so half the list read "sent a
 * friend request." with a face beside it and no name anywhere. They are now one
 * line, the name in the text colour and the action in the secondary one, which
 * is the shape every notification list on a phone uses.
 *
 * **It says what kind.** A small glyph sits on the corner of the face —
 * a heart for a reaction, a speech bubble for a reply, a person for a friend
 * request — so the list can be read by shape before it is read by word.
 *
 * **Unread is a mark, not a wash.** A hairline rail down the leading edge and a
 * dot at the end, over a surface a single step above the page. The accent wash
 * made three unread rows louder than the rest of the screen put together.
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

const AVATAR = 44;
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

const NotificationRowView = ({
  notification,
  onAnswered,
}: {
  notification: NovelistWorldNotification;
  /** A friend request answered here: the row goes. */
  onAnswered?: (id: string) => void;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const action = useConnectionAction();

  const { source } = notification;
  const href = notificationHref(notification);
  const look = notificationLook(notification);
  const isRequest = notification.type === "FRIEND_REQUEST";

  const markTone =
    look.tone === "positive"
      ? theme.success
      : look.tone === "danger"
        ? theme.error
        : theme.accent.solid;

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
      accessibilityLabel={`${source?.title ?? "Someone"} ${notification.notificationText}`}
      accessibilityRole={href ? "button" : "text"}
      disabled={!href}
      onPress={() => href && router.push(href)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor:
            pressed && href ? theme.material.fillPressed : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {/* The unread rail: the leading edge of the row, not a wash over it. */}
      {notification.isRead ? null : (
        <View style={[styles.rail, { backgroundColor: theme.accent.solid }]} />
      )}

      <View>
        <Avatar
          image={source?.avatar}
          name={source?.title}
          size={AVATAR}
          uri={source?.avatar?.src ?? source?.image}
        />
        {/* What kind of thing happened, on the corner of who did it. */}
        <View
          style={[
            styles.mark,
            { backgroundColor: markTone, borderColor: theme.material.fill },
          ]}
        >
          <Ionicons color="#ffffff" name={look.icon} size={10} />
        </View>
      </View>

      <View style={styles.body}>
        <Text
          numberOfLines={3}
          style={[styles.text, { color: theme.textGray }]}
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
            <AnswerButton
              busy={running === "accept"}
              icon="checkmark"
              label="Accept"
              onPress={() => answer("accept", "Accepting")}
              tone="positive"
            />
            <AnswerButton
              busy={running === "reject"}
              icon="close"
              label="Decline"
              onPress={() => answer("reject", "Declining")}
              tone="quiet"
            />
          </View>
        ) : null}
      </View>

      <View style={styles.tail}>
        {notification.isRead ? null : (
          <View style={[styles.dot, { backgroundColor: theme.accent.solid }]} />
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

/** Accept / Decline, squared off to match the rest of the app's buttons. */
const AnswerButton = memo(
  ({
    busy,
    icon,
    label,
    onPress,
    tone,
  }: {
    busy: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    tone: "positive" | "quiet";
  }) => {
    const theme = useAppTheme();
    // A tonal pair rather than the signal green with white on it; see `Tones`.
    const fill =
      tone === "positive"
        ? theme.tones.positive.fill
        : theme.material.fillPressed;
    const ink = tone === "positive" ? theme.tones.positive.ink : theme.textGray;

    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        disabled={busy}
        hitSlop={space.xs}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: fill,
            borderColor:
              tone === "quiet" ? theme.material.edge : "transparent",
            opacity: pressed || busy ? 0.75 : 1,
          },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={ink} size="small" />
        ) : (
          <>
            <Ionicons color={ink} name={icon} size={13} />
            <Text style={[styles.buttonLabel, { color: ink }]}>{label}</Text>
          </>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: space.sm - 2,
    marginTop: space.sm,
  },
  body: { flex: 1, gap: 2, minWidth: 0 },
  button: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 5,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: space.sm + 2,
  },
  buttonLabel: { fontSize: 12, fontWeight: "700" },
  chevron: { opacity: 0.6 },
  dot: { borderRadius: 4, height: 8, width: 8 },
  mark: {
    alignItems: "center",
    borderRadius: MARK / 2,
    borderWidth: 2,
    bottom: -2,
    height: MARK,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    width: MARK,
  },
  name: { fontWeight: "700" },
  rail: {
    borderBottomLeftRadius: radius.md,
    borderTopLeftRadius: radius.md,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 3,
  },
  row: {
    alignItems: "flex-start",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 4,
    // Clipped, so the unread rail follows the corner rather than crossing it.
    overflow: "hidden",
    paddingHorizontal: space.sm + 4,
    paddingVertical: space.sm + 4,
  },
  tail: { alignItems: "center", gap: space.xs, paddingTop: 2 },
  text: { fontSize: fontSize.body, lineHeight: 20 },
  when: { fontSize: fontSize.caption },
});
