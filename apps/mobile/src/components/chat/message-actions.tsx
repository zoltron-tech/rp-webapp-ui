import { Ionicons } from "@expo/vector-icons";
import { messagePreview, REACTION_OPTIONS } from "@nw/chat";
import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type { Message } from "@nw/types";
import * as Clipboard from "expo-clipboard";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { MessageThumb, messageMediaOf } from "@/components/chat/message-media";
import { BottomSheet } from "@/components/sheet";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * What a long press on a message offers.
 *
 * A phone has no hover, so the row of buttons web reveals beside a bubble has
 * nowhere to live — a long press and a sheet is the platform's answer, and the
 * one people already use for exactly this in every other messaging app.
 *
 * The reaction row is first and horizontal, because reacting is the action
 * taken most and the one that should cost the least travel. Your current
 * reaction is filled in, so the row is also the answer to "what did I already
 * say" — tapping it again is how you change your mind, since the server keeps
 * one reaction per person per message.
 *
 * The message sits at the top. Sheets that appear over a long list are easy to
 * open on the wrong row, and a sheet that does not say what it is about makes
 * that mistake silent. A GIF, sticker, picture or clip is shown as itself — a
 * thumbnail and its name — rather than as the CDN link it is sent as, which
 * said nothing about which of three GIFs in a row the sheet was for.
 */

/**
 * The reactions the sheet offers, taken from the shared vocabulary.
 *
 * The first twelve of web's picker, in web's order — position is how people
 * find "Haha" without reading, and two clients ordering these differently is
 * worse than two clients offering different sets. Twelve is about three
 * screenfuls of thumb travel in the row; the rest are rare enough that a
 * shorter row is worth more than reaching them.
 */
const REACTIONS = REACTION_OPTIONS.slice(0, 12);

/**
 * What to call a message that is one piece of media.
 *
 * Sharper than the shared summariser, which names every still "Photo": a
 * picker sticker is a Klipy `.webp` and read as a photo of Keanu Reeves rather
 * than the sticker it is. Albums keep the summariser's count.
 */
export const mediaLabel = (
  media: NonNullable<ReturnType<typeof messageMediaOf>>,
): string | null => {
  const { count, first, fromText } = media;
  if (count > 1) return null;
  if (first.kind === "video") return "Clip";
  if (/\.gif(\?|#|$)/i.test(first.url)) return "GIF";
  if (
    fromText &&
    /(^|\.)klipy\.com\//i.test(first.url.replace(/^https?:\/\//, ""))
  ) {
    return "Sticker";
  }
  return "Photo";
};

/** The excerpt's thumbnail: big enough to tell one GIF from the next. */
const THUMB_SIZE = 56;

interface Action {
  destructive?: boolean;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}

export const MessageActions = ({
  canReact,
  message,
  myReaction,
  onClose,
  onReact,
  onReply,
  onRetry,
}: {
  /** False while the socket is down: a reaction has no REST fallback. */
  canReact: boolean;
  /** Null closes the sheet. */
  message: Message | null;
  /** The reaction key this person already used on the message, if any. */
  myReaction?: string;
  onClose: () => void;
  onReact: (message: Message, reaction: string) => void;
  onReply: (message: Message) => void;
  /** Present only for a message that failed to send. */
  onRetry?: () => void;
}) => {
  const theme = useAppTheme();

  // The words, not the markup: a message copied out of a chat is pasted into
  // something that has no idea what `<div style="text-align: center">` means.
  const plain = message
    ? richTextToPlainText(parseRichText(message.message)).trim()
    : "";

  /*
   * What the excerpt says. Through the shared summariser, so a GIF reads
   * "GIF" here exactly as it does in the reply banner and a quoted bubble,
   * and a picture with a caption reads as its caption.
   */
  const preview = messagePreview(message, "noun");
  const media = messageMediaOf(message);
  // A message that is only media has no words to copy — its link is what
  // copying can usefully give you, and the label should say so.
  const linkOnly = Boolean(media) && preview.describes;

  const copy = () => {
    if (!message) return;
    void Clipboard.setStringAsync(
      linkOnly && media ? media.first.url : plain || message.message,
    );
    onClose();
  };

  const actions: Action[] = message
    ? [
        {
          icon: "arrow-undo-outline",
          label: "Reply",
          onPress: () => {
            onReply(message);
            onClose();
          },
        },
        linkOnly
          ? { icon: "link-outline", label: "Copy link", onPress: copy }
          : { icon: "copy-outline", label: "Copy text", onPress: copy },
        ...(onRetry
          ? [
              {
                icon: "refresh-outline" as const,
                label: "Try sending again",
                onPress: () => {
                  onRetry();
                  onClose();
                },
              },
            ]
          : []),
      ]
    : [];

  return (
    <BottomSheet
      maxHeightRatio={0.6}
      onClose={onClose}
      title="Message"
      visible={message !== null}
    >
      <View style={styles.body}>
        {message ? (
          <View
            style={[
              styles.excerpt,
              {
                backgroundColor: theme.material.fillTranslucent,
                borderLeftColor: theme.accent.solid,
              },
            ]}
          >
            <MessageThumb message={message} size={THUMB_SIZE} />
            <View style={styles.excerptText}>
              <Text
                numberOfLines={1}
                style={[styles.excerptAuthor, { color: theme.accent.text }]}
              >
                {message.sender?.name || message.sender?.username}
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.excerptBody, { color: theme.textGray }]}
              >
                {(media && preview.describes ? mediaLabel(media) : null) ||
                  preview.text ||
                  plain ||
                  "Message"}
              </Text>
            </View>
          </View>
        ) : null}

        {canReact && message ? (
          <ScrollView
            contentContainerStyle={styles.reactions}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {REACTIONS.map((option) => {
              const active = option.key === myReaction;
              return (
                <Pressable
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  key={option.key}
                  // The **key** goes out, never the glyph: web draws its own
                  // artwork from the key and would otherwise print the emoji
                  // raw. See `@nw/chat/reactions`.
                  onPress={() => {
                    onReact(message, option.key);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.reaction,
                    {
                      backgroundColor: active
                        ? theme.accent.tint
                        : pressed
                          ? theme.glass.fillPressed
                          : theme.material.fillTranslucent,
                      borderColor: active
                        ? theme.accent.solid
                        : theme.material.edgeTranslucent,
                      borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Text style={styles.reactionGlyph}>{option.emoji}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {actions.map((action) => (
          <Pressable
            accessibilityRole="button"
            key={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: pressed
                  ? theme.glass.fillPressed
                  : theme.material.fillTranslucent,
                borderColor: theme.material.edgeTranslucent,
              },
            ]}
          >
            <Ionicons
              color={action.destructive ? theme.error : theme.text}
              name={action.icon}
              size={20}
            />
            <Text
              style={[
                styles.actionLabel,
                { color: action.destructive ? theme.error : theme.text },
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.md,
  },
  actionLabel: { fontSize: fontSize.body, fontWeight: "600" },
  body: { gap: space.sm, paddingBottom: space.md, paddingHorizontal: space.md },
  excerpt: {
    alignItems: "center",
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  excerptAuthor: { fontSize: fontSize.caption, fontWeight: "700" },
  excerptBody: { fontSize: fontSize.caption },
  excerptText: { flex: 1, gap: 1 },
  reaction: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  reactionGlyph: { fontSize: fontSize.h2 },
  reactions: { gap: space.sm, paddingBottom: space.xs },
});
