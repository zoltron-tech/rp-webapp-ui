import { Ionicons } from "@expo/vector-icons";
import type { PromptThreadComment } from "@nw/types";
import { pluralize, toFormattedDateFromUnix } from "@nw/utils";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { RichText } from "@/components/rich-text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One outgoing thread, as web's `components/outgoing-reply` draws it.
 *
 * The shape is web's card, part for part: the two overlapping faces, the name
 * with its "Your reply" tag, the date and who it is with, the unread count or
 * the concluded pill, a rule, the reply itself in a sunken block, and the
 * footer counting replies.
 *
 * ## Where it deliberately differs
 *
 * Web indents the content block and the footer by 48px, to sit them under the
 * avatar group. At 375px that is an eighth of the screen given to alignment, so
 * the indent is dropped and the block runs the full width of the card — the
 * same decision web itself makes at its 430px breakpoint for the footer.
 *
 * The "Your reply" tag and the concluded label are hidden below 430px on web.
 * They are kept here: a phone is the *only* place this card is read, so hiding
 * the one word that says whether you commented or replied would mean nobody
 * ever sees it.
 *
 * ## One way in, not three
 *
 * Web's card routes to the thread from three places — the unread badge, the
 * reply count and an "Open thread" button. Now that `/threads/:id` exists, this
 * carries the button and only the button. The badge is a count and the reply
 * line is a status; making either of them a target as well would put three
 * hit areas for one destination on a card the width of a thumb, and the badge
 * in particular sits where a thumb rests while scrolling.
 */

/** Web's `AvatarGroup`: 52px, dropping to 40 under 430px. This is a phone. */
const PRIMARY_AVATAR = 44;
const TARGET_AVATAR = 26;

const firstName = (name: string | undefined) => (name ?? "").split(" ")[0];

const OutgoingThreadCardView = ({
  onOpen,
  thread,
}: {
  /** Given the thread's root comment id — see the footer for why not `id`. */
  onOpen: (threadId: string) => void;
  thread: PromptThreadComment;
}) => {
  const theme = useAppTheme();

  const hasReplies = thread.replyCount > 0;
  const typeLabel = thread.type === "REPLY" ? "Your reply" : "Your comment";

  const replyText = thread.concluded
    ? "Thread concluded"
    : thread.replyCount === 0
      ? "No new replies"
      : `${thread.replyCount} new ${pluralize("reply", thread.replyCount)}`;

  const isVideo = Boolean(thread.media?.toLowerCase().endsWith("mp4"));

  /*
   * Held rather than written inline. `expo-image` compares `source` by value
   * before it does anything, so a fresh literal is not a re-fetch — but it is a
   * fresh prop on every render of a card that is otherwise pointer-stable, and
   * the point of `memo` above is that nothing in this subtree changes identity
   * when the list re-renders around it.
   */
  const mediaSource = useMemo(
    () => (thread.media ? { uri: thread.media } : null),
    [thread.media],
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.material.fill,
          // Web: `[data-has-replies]` takes the accent on the border and a 4px
          // accent rule down the left, so a thread waiting on you is findable
          // by colour alone in a column of cards.
          borderColor: hasReplies ? theme.accent.solid : theme.material.edge,
          borderLeftColor: hasReplies
            ? theme.accent.solid
            : theme.material.edge,
          borderLeftWidth: hasReplies ? 4 : StyleSheet.hairlineWidth,
          opacity: thread.concluded ? 0.72 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        {/*
          The two faces: who wrote it, and who it was written to, the second
          tucked into the first's bottom-right behind a ring in the card's own
          colour so the overlap reads as depth rather than a collision.
        */}
        <View style={styles.avatarGroup}>
          <Avatar
            name={thread.source.name}
            size={PRIMARY_AVATAR}
            image={thread.source.avatar}
            uri={thread.source.avatar?.src ?? thread.source.image}
          />
          <View
            style={[
              styles.targetAvatar,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.fill,
              },
            ]}
          >
            <Avatar
              name={thread.target.name}
              size={TARGET_AVATAR}
              image={thread.target.avatar}
              uri={thread.target.avatar?.src ?? thread.target.image}
            />
          </View>
        </View>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.text }]}
            >
              {firstName(thread.source.name)}
            </Text>
            <Text
              style={[
                styles.typeTag,
                {
                  backgroundColor: theme.material.fillPressed,
                  borderColor: theme.material.edge,
                  color: theme.textGray,
                },
              ]}
            >
              {typeLabel.toUpperCase()}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textGray }]}>
              {toFormattedDateFromUnix(thread.createdOn)}
            </Text>
            <Text style={[styles.meta, { color: theme.textGray }]}>➺</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.meta,
                styles.metaTarget,
                { color: theme.textGray },
              ]}
            >
              with {firstName(thread.target.name)}
            </Text>
          </View>
        </View>

        {thread.concluded ? (
          <View
            style={[
              styles.concluded,
              {
                backgroundColor: theme.material.fillPressed,
                borderColor: theme.success,
              },
            ]}
          >
            <Ionicons
              color={theme.success}
              name="checkmark-circle-outline"
              size={13}
            />
            <Text style={[styles.concludedLabel, { color: theme.success }]}>
              Concluded
            </Text>
          </View>
        ) : hasReplies ? (
          <View
            style={[styles.unread, { backgroundColor: theme.accent.solid }]}
          >
            <Text style={styles.unreadLabel}>
              {thread.replyCount > 9 ? "9+" : String(thread.replyCount)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />

      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.glass.field,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <RichText html={thread.text} />

        {thread.media ? (
          <View style={styles.mediaBox}>
            {isVideo ? (
              // No player: nothing on this card is interactive yet, and a video
              // that cannot be played is better shown as what it is.
              <View
                style={[styles.video, { borderColor: theme.material.edge }]}
              >
                <Ionicons color={theme.textGray} name="videocam" size={20} />
                <Text style={[styles.videoLabel, { color: theme.textGray }]}>
                  Video
                </Text>
              </View>
            ) : (
              <Image
                cachePolicy="memory-disk"
                contentFit="contain"
                recyclingKey={thread.media}
                source={mediaSource}
                style={styles.image}
                transition={0}
              />
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Ionicons color={theme.textGray} name="chatbubbles-outline" size={14} />
        <Text style={[styles.footerLabel, { color: theme.textGray }]}>
          {replyText}
        </Text>

        {/*
          `parentId`, not `id`. The card is a comment *or* a reply; either way
          the thread it belongs to is identified by the comment at its root,
          which is what `parentId` holds and what web's `ROUTES.Thread.View`
          is given.
        */}
        <Pressable
          accessibilityLabel="View thread"
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={() => onOpen(thread.parentId)}
          style={({ pressed }) => [
            styles.open,
            {
              backgroundColor: pressed
                ? theme.accent.surfaceHover
                : theme.accent.surface,
              borderColor: theme.accent.surfaceHover,
            },
          ]}
        >
          <Text style={[styles.openLabel, { color: theme.accent.textStrong }]}>
            View thread
          </Text>
          <Ionicons
            color={theme.accent.textStrong}
            name="arrow-forward"
            size={13}
          />
        </Pressable>
      </View>
    </View>
  );
};

/**
 * `thread` comes straight out of the query cache, so its identity is stable
 * between renders and this compares in one pointer check per row — provided
 * `onOpen` is stable too, which is why the list memoises it.
 */
export const OutgoingThreadCard = memo(OutgoingThreadCardView);

const styles = StyleSheet.create({
  avatarGroup: { height: PRIMARY_AVATAR, width: PRIMARY_AVATAR },
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
    padding: space.sm + 2,
  },
  concluded: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  concludedLabel: { fontSize: 11, fontWeight: "600" },
  content: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.sm + 2,
  },
  footer: { alignItems: "center", flexDirection: "row", gap: space.xs + 2 },
  footerLabel: { flex: 1, fontSize: fontSize.caption, fontWeight: "500" },
  header: { alignItems: "center", flexDirection: "row", gap: space.sm + 2 },
  identity: { flex: 1, gap: 2, minWidth: 0 },
  image: { height: 160, width: "100%" },
  mediaBox: { marginTop: space.sm, maxWidth: 220 },
  meta: { fontSize: 11 },
  metaRow: { alignItems: "center", flexDirection: "row", gap: 5 },
  metaTarget: { flexShrink: 1 },
  name: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "700" },
  nameRow: { alignItems: "center", flexDirection: "row", gap: space.xs + 2 },
  open: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 4,
    // 32 rather than 44: it sits inside a card in a scrolling list, where a
    // taller control would push every card down a row. `hitSlop` makes up the
    // difference without costing the layout anything.
    minHeight: 32,
    paddingHorizontal: space.sm + 2,
  },
  openLabel: { fontSize: 11, fontWeight: "700" },
  rule: { height: StyleSheet.hairlineWidth, width: "100%" },
  targetAvatar: {
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: -3,
    position: "absolute",
    right: -3,
  },
  typeTag: {
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.2,
    overflow: "hidden",
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  unread: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    height: 24,
    justifyContent: "center",
    minWidth: 24,
  },
  unreadLabel: { color: "#fff", fontSize: 11, fontWeight: "700" },
  video: {
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    height: 96,
    justifyContent: "center",
    width: "100%",
  },
  videoLabel: { fontSize: 11, fontWeight: "600" },
});
