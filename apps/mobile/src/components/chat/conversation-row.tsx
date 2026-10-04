import { Ionicons } from "@expo/vector-icons";
import {
  type ConversationTarget,
  conversationPreview,
  getAttachmentKind,
  isDirectImageUrl,
} from "@nw/chat";
import type { Conversation } from "@nw/types";
import { toInboxTime, wsrvImage } from "@nw/utils";
import { memo } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { SwipeableRow } from "@/components/swipeable-row";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One conversation in the inbox.
 *
 * Pulled out of the screen because it now has enough to decide — a thumbnail, a
 * delivery state, a group face, an unread treatment — that leaving it inline
 * made the list's own logic hard to find. Memoised for the same reason the
 * message bubble is: the screen re-renders on every keystroke in the search
 * field, and a row that re-renders with it re-decodes its thumbnail.
 *
 * ## What a row has to answer
 *
 * Four questions, in the order people ask them: who, when, what was said, and
 * whether it needs me. The layout is built around that order rather than around
 * what fits — which is why the unread mark is at the trailing edge where the
 * eye finishes rather than beside the name where it started.
 *
 * ## The thumbnail
 *
 * A conversation whose last message was a picture is unrecognisable from the
 * words "Sent a GIF". The image itself is the memory, so when the last message
 * carries one it is shown, small, at the end of the row. Text conversations
 * keep the full width for their text.
 */

/** A face-sized avatar; the row is built to that height. */
/** Web's 46, on the even side. */
const AVATAR = 48;
/** The preview picture, at three device pixels per point. */
const THUMB_IMAGE = { fit: "cover", h: 132, w: 132 } as const;
/** The unread rule down a row's leading edge. */
const RAIL = 3;

/** The picture at the trailing edge, when the last message had one. */
const THUMB = 40;

/** The image URL of the last message, if it had exactly one worth showing. */
const lastImage = (conversation: Conversation): string | null => {
  const message = conversation.lastMessage;
  if (!message) return null;

  const attachment = message.attachments?.[0]?.url;
  if (attachment && isDirectImageUrl(attachment)) return attachment;

  // The GIF/sticker case: the CDN URL *is* the message body.
  const body = message.message?.trim() ?? "";
  if (/^https?:\/\/\S+$/i.test(body) && isDirectImageUrl(body)) return body;

  return null;
};

/** A glyph for a last message that is media but has no still to show. */
const mediaIcon = (
  conversation: Conversation,
): keyof typeof Ionicons.glyphMap | null => {
  const message = conversation.lastMessage;
  if (!message) return null;

  const body = message.message?.trim() ?? "";
  const url =
    message.attachments?.[0]?.url ??
    (/^https?:\/\/\S+$/i.test(body) ? body : null);
  if (!url) return null;

  const kind = getAttachmentKind(url);
  if (kind === "video") return "film";
  if (kind === "audio") return "musical-notes";
  if (kind === "image") return "image";
  return null;
};

const ConversationRowComponent = ({
  conversation,
  myUsername,
  onMarkRead,
  onOpen,
  onOpenDetails,
  onPrefetch,
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
  target: ConversationTarget | undefined;
  unread: boolean;
}) => {
  const theme = useAppTheme();

  // "Sent a GIF", not the CDN URL; the sentence, not the markup around it. No
  // length passed — `numberOfLines` ellipsises at whatever width the row
  // actually is, which no character count can guess.
  const { describes, text } = conversationPreview(conversation);

  /*
   * Who spoke last, in front of the preview.
   *
   * Only for quoted text: "You: Sent a GIF" reads as a sentence someone typed,
   * whereas the description already says who did what. Skipped in a direct
   * conversation when the other person spoke, because their name is on the line
   * above in 700 weight.
   */
  const lastFromMe =
    Boolean(myUsername) &&
    conversation.lastMessage?.sender?.username === myUsername;
  const prefix = describes
    ? ""
    : lastFromMe
      ? "You: "
      : conversation.isGroup && conversation.lastMessage?.sender?.name
        ? `${conversation.lastMessage.sender.name.split(" ")[0]}: `
        : "";

  const thumb = lastImage(conversation);
  const icon = thumb ? null : mediaIcon(conversation);

  return (
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
        accessibilityLabel={`${target?.name || conversation.name}. ${prefix}${text}`}
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
            // Unread rows carry a wash of accent rather than only a dot. A
            // single 8pt mark at the far edge is easy to miss when scanning a
            // full screen of rows; a tinted band is not, and it survives being
            // seen out of the corner of the eye.
            backgroundColor: pressed
              ? theme.material.fillPressed
              : unread
                ? theme.accent.tint
                : theme.background,
            borderBottomColor: theme.material.edge,
            // Web's unread row: the wash, and a 3px rule down its leading
            // edge. Reserved on every row so the faces share one left edge.
            borderLeftColor: unread ? theme.accent.surfaceHover : "transparent",
          },
        ]}
      >
        {conversation.isGroup ? (
          // Groups have no one face. A tinted glyph is honest about that and
          // is instantly distinguishable from a person at a glance down the
          // list — the old row put a tiny icon beside the *name* instead,
          // where it was doing no work.
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
            name={target?.name ?? conversation.name}
            size={AVATAR}
            uri={target?.image ?? conversation.image}
            username={target?.username}
          />
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.name,
                { color: theme.text, fontWeight: unread ? "700" : "600" },
              ]}
            >
              {target?.name || conversation.name}
            </Text>
            <Text
              style={[
                styles.time,
                {
                  color: unread ? theme.accent.text : theme.textGray,
                  fontWeight: unread ? "700" : "400",
                },
              ]}
            >
              {toInboxTime(conversation.lastMessage?.createdAt)}
            </Text>
          </View>

          <View style={styles.previewRow}>
            {/*
              Delivery, on the last message if it was yours.

              The same question the thread answers with a tick under the bubble,
              asked from the list: has this been read, or is the silence just
              silence? Only for outgoing messages — a tick on someone else's
              message would be claiming something about them.
            */}
            {lastFromMe ? (
              <Ionicons
                color={
                  conversation.lastMessage?.isRead
                    ? theme.accent.text
                    : theme.textGray
                }
                name={
                  conversation.lastMessage?.isRead
                    ? "checkmark-done"
                    : "checkmark"
                }
                size={13}
              />
            ) : null}

            {icon ? (
              <Ionicons color={theme.textGray} name={icon} size={12} />
            ) : null}

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
              {prefix}
              {text}
            </Text>

            {unread ? (
              <View
                style={[
                  styles.unreadDot,
                  { backgroundColor: theme.accent.solid },
                ]}
              />
            ) : null}
          </View>
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
      </Pressable>
    </SwipeableRow>
  );
};

export const ConversationRow = memo(ConversationRowComponent);

const styles = StyleSheet.create({
  body: { flex: 1, gap: 3, minWidth: 0 },
  groupAvatar: {
    alignItems: "center",
    borderRadius: AVATAR / 2,
    borderWidth: border.edge,
    height: AVATAR,
    justifyContent: "center",
    width: AVATAR,
  },
  name: { flexShrink: 1, fontSize: fontSize.body },
  preview: { flex: 1, fontSize: fontSize.caption },
  previewRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: RAIL,
    flexDirection: "row",
    gap: space.m,
    paddingLeft: space.md - RAIL,
    paddingRight: space.md,
    paddingVertical: space.ms,
  },
  thumb: {
    backgroundColor: "transparent",
    borderRadius: radius.sm,
    borderWidth: border.edge,
    height: THUMB,
    width: THUMB,
  },
  time: { fontSize: fontSize.meta },
  titleRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  unreadDot: { borderRadius: radius.xs, height: 8, width: 8 },
});
