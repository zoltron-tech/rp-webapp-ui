import { Ionicons } from "@expo/vector-icons";
import type { PromptThreadComment } from "@nw/types";
import { pluralize, toFormattedDateFromUnix } from "@nw/utils";
import { Image } from "@/components/image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, type ReactNode, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { RichText } from "@/components/rich-text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One outgoing thread, as web's `components/outgoing-reply` draws it.
 *
 * The shape is web's card: the two overlapping faces, the name with its "Your
 * reply" tag, the date and who it is with, the reply itself as a quote, and the
 * footer saying where the thread stands.
 *
 * ## Where it deliberately differs
 *
 * Web indents the content block and the footer by 48px, to sit them under the
 * avatar group. At 375px that is an eighth of the screen given to alignment, so
 * the indent is dropped and the block runs the full width of the card — the
 * same decision web itself makes at its 430px breakpoint for the footer.
 *
 * The "Your reply" tag is hidden below 430px on web. It is kept here: a phone
 * is the *only* place this card is read, so hiding the one word that says
 * whether you commented or replied would mean nobody ever sees it.
 *
 * ## One way in, and one status
 *
 * Web's card routes to the thread from three places — the unread badge, the
 * reply count and an "Open thread" button. Here the card is the way in, with a
 * chevron to say so: it has one destination, and a button on top of that was a
 * pill saying what tapping the card already does. Links inside the quote still
 * win their own taps.
 *
 * The status is said once, in the footer. The count badge said "1" beside a
 * line saying "1 new reply", and the concluded pill sat above "Thread
 * concluded". The accent rail is what finds a waiting thread in a column of
 * cards.
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
  const waiting = hasReplies && !thread.concluded;
  const statusColor = thread.concluded
    ? theme.success
    : waiting
      ? theme.accent.text
      : theme.textGray;
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

  /*
   * `parentId`, not `id`. The card is a comment *or* a reply; either way the
   * thread it belongs to is identified by the comment at its root, which is what
   * `parentId` holds and what web's `ROUTES.Thread.View` is given.
   */
  return (
    <Pressable
      accessibilityHint="Opens the thread"
      accessibilityLabel={`${typeLabel} with ${firstName(thread.target.name)}. ${replyText}.`}
      accessibilityRole="button"
      onPress={() => onOpen(thread.parentId)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.material.card.backgroundColor,
          // Web: `[data-has-replies]` takes the accent on the border and a 4px
          // accent rule down the left, so a thread waiting on you is findable
          // by colour alone in a column of cards.
          // At 1px the saturated step outlines the whole card; the rail carries it.
          borderColor: hasReplies
            ? theme.accent.surfaceHover
            : theme.material.edge,
          borderLeftColor: hasReplies
            ? theme.accent.solid
            : theme.material.edge,
          borderLeftWidth: hasReplies ? 4 : StyleSheet.hairlineWidth,
          opacity: (thread.concluded ? 0.72 : 1) * (pressed ? 0.8 : 1),
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
            <Text style={[styles.meta, { color: theme.textGray }]}>·</Text>
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
      </View>

      <Excerpt key={thread.id}>
        <RichText html={thread.text} maxBlocks={EXCERPT_BLOCKS} />

        {thread.media ? (
          <View style={styles.mediaBox}>
            {isVideo ? (
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
      </Excerpt>

      <View style={styles.footer}>
        <Ionicons
          color={statusColor}
          name={
            thread.concluded
              ? "checkmark-circle-outline"
              : "chatbubbles-outline"
          }
          size={14}
        />
        <Text
          style={[
            styles.footerLabel,
            waiting && styles.footerWaiting,
            { color: statusColor },
          ]}
        >
          {replyText}
        </Text>
        <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
      </View>
    </Pressable>
  );
};

/**
 * `thread` comes straight out of the query cache, so its identity is stable
 * between renders and this compares in one pointer check per row — provided
 * `onOpen` is stable too, which is why the list memoises it.
 */
export const OutgoingThreadCard = memo(OutgoingThreadCardView);

/** How much of a post a list of threads shows. */
const EXCERPT_HEIGHT = 168;
const EXCERPT_BLOCKS = 5;
const EXCERPT_FADE = 44;

/**
 * What was written, as a quote and as an excerpt.
 *
 * This is a list of threads, and a card in it used to draw its whole post: one
 * long reply was three screens of scrolling to reach the next thread. Now it
 * is capped, and fades out at the cap when there is more — the thread is
 * where the rest is read.
 *
 * A rule down the leading edge rather than a box in a box: the card is already
 * a frame.
 *
 * Whether it overflowed is measured, and the state is this component's own;
 * the card keys it by thread, so a recycled cell starts again.
 */
const Excerpt = ({ children }: { children: ReactNode }) => {
  const theme = useAppTheme();
  const [clipped, setClipped] = useState(false);
  const fade = theme.material.card.backgroundColor;

  return (
    <View style={[styles.excerpt, { borderLeftColor: theme.material.edge }]}>
      <View
        onLayout={(event) => {
          const over = event.nativeEvent.layout.height > EXCERPT_HEIGHT;
          if (over !== clipped) setClipped(over);
        }}
      >
        {children}
      </View>
      {clipped ? (
        <LinearGradient
          colors={[`${fade}00`, fade]}
          pointerEvents="none"
          style={styles.excerptFade}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarGroup: { height: PRIMARY_AVATAR, width: PRIMARY_AVATAR },
  card: {
    borderRadius: radius.card,
    borderWidth: border.edge,
    gap: space.ms,
    padding: space.m,
  },
  excerpt: {
    borderLeftWidth: 2,
    maxHeight: EXCERPT_HEIGHT,
    overflow: "hidden",
    paddingLeft: space.m,
  },
  excerptFade: {
    bottom: 0,
    height: EXCERPT_FADE,
    left: 0,
    position: "absolute",
    right: 0,
  },
  footer: { alignItems: "center", flexDirection: "row", gap: space.s },
  footerLabel: { flex: 1, fontSize: fontSize.caption, fontWeight: "500" },
  footerWaiting: { fontWeight: "700" },
  header: { alignItems: "center", flexDirection: "row", gap: space.ms },
  identity: { flex: 1, gap: space.xxs, minWidth: 0 },
  image: { height: 160, width: "100%" },
  mediaBox: { marginTop: space.sm, maxWidth: 220 },
  meta: { fontSize: fontSize.meta },
  metaRow: { alignItems: "center", flexDirection: "row", gap: 5 },
  metaTarget: { flexShrink: 1 },
  name: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "700" },
  nameRow: { alignItems: "center", flexDirection: "row", gap: space.s },
  targetAvatar: {
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: -3,
    position: "absolute",
    right: -3,
  },
  typeTag: {
    borderRadius: radius.xs,
    borderWidth: border.edge,
    fontSize: fontSize.meta,
    fontWeight: "600",
    letterSpacing: 0.2,
    overflow: "hidden",
    paddingHorizontal: 5,
    paddingVertical: space.xxs,
  },
  video: {
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: radius.sm,
    borderWidth: border.edge,
    gap: space.xs,
    height: 96,
    justifyContent: "center",
    width: "100%",
  },
  videoLabel: { fontSize: fontSize.meta, fontWeight: "600" },
});
