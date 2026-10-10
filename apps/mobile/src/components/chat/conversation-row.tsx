import { Ionicons } from "@expo/vector-icons";
import { type ConversationTarget, conversationPreview } from "@nw/chat";
import {
  type InboxKind,
  inboxGroupFaces,
  inboxHue,
  inboxKind,
  inboxSpeaker,
  inboxThumbnail,
  isMuted,
} from "@nw/features";
import { mixColors } from "@nw/theme";
import type { Conversation } from "@nw/types";
import { toInboxTime, wsrvImage } from "@nw/utils";
import { Image } from "@/components/image";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import type { RowPlace } from "@/components/notification-row";
import { SwipeableRow } from "@/components/swipeable-row";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One conversation in the inbox.
 *
 * Drawn in the notification row's language, because the two lists sit a tab
 * apart and should read as one family. Who it is with is the face — two of
 * them, overlapped, for a group with no picture of its own. Where the thread
 * stands is the small coloured glyph on the face's corner, in the kind's own
 * colour (`@nw/features`, the table web reads too): blue for words, pink for a
 * GIF, grey for your own message still unread, green once it has been seen.
 * The glyph is the whole of it — a line of words saying the same thing above
 * every name made a full screen of rows read as clutter.
 *
 * Unread is a faint wash of that colour and a dot at the end, over the
 * section's panel — the same mark a notification carries.
 *
 * ## What a row has to answer
 *
 * Four questions, in the order people ask them: who, when, what was said, and
 * whether it needs me. The glyph answers the last one before any of the text
 * is read, which is why the delivery tick that used to sit in front of the
 * preview is gone: the green double tick on the face says it.
 *
 * ## The thumbnail
 *
 * A conversation whose last message was a picture is unrecognisable from the
 * words "Sent a GIF". The image itself is the memory, so when the last message
 * carries one it is shown, small, at the end of the row. Text conversations
 * keep the full width for their text.
 */

/** Web's 46. */
const AVATAR = 46;
/** Each of a group's two faces, overlapped on the diagonal. */
const PAIR = 32;
const MARK = 18;
/** The preview picture, at three device pixels per point. */
const THUMB_IMAGE = { fit: "cover", h: 132, w: 132 } as const;
/** The picture at the trailing edge, when the last message had one. */
const THUMB = 40;

/** The glyph for each kind. Web's twin is `conversation-card/kinds.tsx`. */
const ICONS: Record<InboxKind, keyof typeof Ionicons.glyphMap> = {
  blank: "create",
  bundle: "attach",
  clip: "film",
  gif: "happy",
  link: "link",
  picture: "image",
  seen: "checkmark-done",
  sent: "paper-plane",
  voice: "musical-notes",
  word: "chatbubble-ellipses",
};

const ConversationRowComponent = ({
  conversation,
  myUsername,
  onMarkRead,
  onOpen,
  onOpenDetails,
  onPrefetch,
  place = "only",
  target,
  unread,
}: {
  conversation: Conversation;
  myUsername: string | undefined;
  onMarkRead: (conversationId: string) => void;
  onOpen: (conversationId: string) => void;
  onOpenDetails: (conversationId: string) => void;
  /** Warm the thread as the finger lands, before the tap opens it. */
  onPrefetch?: (conversationId: string) => void;
  /** Where the row sits in its section's panel; see `RowPlace`. */
  place?: RowPlace;
  target: ConversationTarget | undefined;
  unread: boolean;
}) => {
  const theme = useAppTheme();

  // "Sent a GIF", not the CDN URL; the sentence, not the markup around it. No
  // length passed — `numberOfLines` ellipsises at whatever width the row
  // actually is, which no character count can guess.
  const { describes, text } = conversationPreview(conversation);
  const speaker = inboxSpeaker(conversation, myUsername, describes);

  const kind = inboxKind(conversation, myUsername);
  // No push and no sound for this one; the row says so, because nothing else does.
  const muted = isMuted(conversation.mutedUntil);
  const hue = inboxHue(kind);
  const thumb = inboxThumbnail(conversation);
  const name = target?.name || conversation.name;

  const panel = theme.material.card.backgroundColor;
  // The kind's colour, mixed toward the theme's text so an unread row's time
  // stays readable on a light page and a dark one alike.
  const tint = mixColors(hue, 0.62, theme.text);
  const wash = mixColors(hue, 0.12, panel);

  // A group's own picture when it has one; otherwise the people in it.
  const groupImage = conversation.isGroup ? target?.image : null;
  const groupFaces =
    conversation.isGroup && !groupImage
      ? inboxGroupFaces(conversation, myUsername)
      : [];

  return (
    <View
      style={[
        styles.slice,
        (place === "first" || place === "only") && styles.sliceTop,
        (place === "last" || place === "only") && styles.sliceBottom,
        { backgroundColor: panel, borderColor: theme.material.edge },
      ]}
    >
      <SwipeableRow
        leftAction={
          unread
            ? {
                background: theme.accent.surface,
                icon: "checkmark-done",
                label: "Read",
                onTrigger: () => onMarkRead(conversation.id),
                tint: theme.accent.text,
              }
            : undefined
        }
        rightAction={{
          background: theme.material.fillPressed,
          icon: "information-circle-outline",
          label: "Details",
          onTrigger: () => onOpenDetails(conversation.id),
          tint: theme.text,
        }}
      >
        <Pressable
          accessibilityHint={unread ? "Unread conversation" : undefined}
          accessibilityLabel={`${name}. ${speaker}${text}`}
          accessibilityRole="button"
          onLongPress={() => onOpenDetails(conversation.id)}
          onPress={() => onOpen(conversation.id)}
          // The finger is down for a good hundred milliseconds before the tap
          // completes; the first page of messages is fetched in that time, so
          // the conversation opens onto its messages rather than a spinner.
          onPressIn={() => onPrefetch?.(conversation.id)}
          style={({ pressed }) => [
            styles.row,
            {
              // Opaque in every state: the swipe actions sit under the row.
              backgroundColor: pressed
                ? mixColors(theme.text, 0.08, panel)
                : unread
                  ? wash
                  : panel,
            },
          ]}
        >
          <View style={styles.faces}>
            {groupFaces.length > 1 ? (
              <>
                <View style={[styles.faceBack, { borderColor: panel }]}>
                  <Avatar
                    image={groupFaces[1].avatar}
                    name={groupFaces[1].firstName}
                    size={PAIR}
                    uri={groupFaces[1].avatar?.src ?? groupFaces[1].image}
                  />
                </View>
                <View style={[styles.faceFront, { borderColor: panel }]}>
                  <Avatar
                    image={groupFaces[0].avatar}
                    name={groupFaces[0].firstName}
                    size={PAIR}
                    uri={groupFaces[0].avatar?.src ?? groupFaces[0].image}
                  />
                </View>
              </>
            ) : conversation.isGroup && !groupImage ? (
              // A group nobody has pictured, and whose members the list did
              // not send: a tinted glyph is honest about that.
              <View
                style={[
                  styles.groupAvatar,
                  {
                    backgroundColor: theme.material.fill,
                    borderColor: theme.material.edge,
                  },
                ]}
              >
                <Ionicons color={theme.accent.text} name="people" size={22} />
              </View>
            ) : (
              <Avatar
                name={name}
                size={AVATAR}
                uri={target?.image ?? conversation.image}
                username={target?.username}
              />
            )}
            {/* Where the thread stands, on the corner of who it is with. */}
            <View
              style={[
                styles.mark,
                { backgroundColor: hue, borderColor: panel },
              ]}
            >
              <Ionicons color="#ffffff" name={ICONS[kind]} size={10} />
            </View>
          </View>

          <View style={styles.body}>
            <Text
              numberOfLines={1}
              style={[
                styles.name,
                { color: theme.text, fontWeight: unread ? "700" : "600" },
              ]}
            >
              {name}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.preview,
                {
                  color: unread ? theme.text : theme.textGray,
                  fontWeight: unread ? "600" : "400",
                },
              ]}
            >
              {speaker}
              {text}
            </Text>
          </View>

          {thumb ? (
            <Image
              cachePolicy="memory-disk"
              contentFit="cover"
              recyclingKey={thumb}
              // The conversation's own thumbnail size, as the thread draws it.
              source={{ uri: wsrvImage(thumb, THUMB_IMAGE) }}
              style={[styles.thumb, { borderColor: theme.material.edge }]}
              transition={0}
            />
          ) : null}

          {/*
            When, and whether it is unread: a column of its own at the row's
            trailing edge, so the time sits in the same place on every row —
            a picture goes to its left rather than pushing it inward. Built
            to the body's two line heights, so the time reads level with the
            name and the dot level with the preview.
          */}
          <View style={styles.meta}>
            <Text
              style={[
                styles.time,
                {
                  color: unread ? tint : theme.textGray,
                  fontWeight: unread ? "700" : "400",
                },
              ]}
            >
              {toInboxTime(conversation.lastMessage?.createdAt)}
            </Text>
            <View style={styles.dotSlot}>
              {/* Muted and unread: both, the bell before the dot. */}
              {muted ? (
                <Ionicons
                  accessibilityLabel="Muted"
                  color={theme.textGray}
                  name="notifications-off-outline"
                  size={13}
                />
              ) : null}
              {unread ? (
                <View style={[styles.dot, { backgroundColor: hue }]} />
              ) : null}
            </View>
          </View>
        </Pressable>
      </SwipeableRow>
    </View>
  );
};

export const ConversationRow = memo(ConversationRowComponent);

const styles = StyleSheet.create({
  body: { flex: 1, gap: space.xxs, minWidth: 0 },
  dot: { borderRadius: radius.xs, height: 8, width: 8 },
  // The preview's line height, so the dot centres on that line.
  dotSlot: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    height: 17,
    justifyContent: "flex-end",
  },
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
  // Centred, so the presence ring grows around the face rather than pushing
  // it off the faces' shared left edge.
  faces: {
    alignItems: "center",
    height: AVATAR,
    justifyContent: "center",
    width: AVATAR,
  },
  groupAvatar: {
    alignItems: "center",
    borderRadius: AVATAR / 2,
    borderWidth: border.edge,
    height: AVATAR,
    justifyContent: "center",
    width: AVATAR,
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
  meta: { alignItems: "flex-end", gap: space.xxs },
  name: { fontSize: fontSize.body, lineHeight: 20 },
  preview: { fontSize: fontSize.caption, lineHeight: 17 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
  },
  /*
   * The row's slice of its section's panel: the first rounds the top, the last
   * rounds the bottom and closes the edge, the ones between are ruled apart.
   * The slice clips, so a swiped row slides out from under the panel's own
   * corners.
   */
  slice: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: border.edge,
    borderRightWidth: border.edge,
    marginHorizontal: space.md,
    overflow: "hidden",
  },
  sliceBottom: {
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
    borderBottomWidth: border.edge,
  },
  sliceTop: {
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderTopWidth: border.edge,
  },
  thumb: {
    backgroundColor: "transparent",
    borderRadius: radius.sm,
    borderWidth: border.edge,
    height: THUMB,
    width: THUMB,
  },
  // The name's line height, so the two share a line.
  time: { fontSize: fontSize.meta, lineHeight: 20 },
});
