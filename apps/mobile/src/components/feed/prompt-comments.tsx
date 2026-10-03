import { Ionicons } from "@expo/vector-icons";
import { getPromptComments } from "@nw/api/endpoints/prompt";
import { queryKeys, useApi } from "@nw/features";
import type { Comment } from "@nw/types";
import { pluralize, toFormattedDate } from "@nw/utils";
import { transformComment } from "@nw/utils/image";
import { useQuery } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { CollapsibleRichText } from "@/components/collapsible-rich-text";
import { FeedMedia } from "@/components/feed/feed-media";
import { HeartButton } from "@/components/heart-button";
import { ListStatus } from "@/components/list-status";
import { Bone, SkeletonPulse } from "@/components/skeleton";
import { sourceLinkLabel, useOpenSource } from "@/hooks/use-open-source";
import { useToggleReaction } from "@/hooks/use-toggle-reaction";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The comments on one feed card — web's `PromptThreads` collapsible, without
 * the composer.
 *
 * ## Why the fetch is here rather than in the card
 *
 * Because this component is only mounted while the list is open, and the query
 * is inside it, the fetch *is* the expansion. Web hoists the same request into
 * every prompt on mount (`useGetComments`, called unconditionally from
 * `PromptThreads`) so it can draw two faces and a count in the collapsed
 * header. On a five-card page that is five requests before the reader has
 * touched anything, for a number the prompt already carries as `commentCount`.
 *
 * The cost of doing it this way is a beat of loading the first time a card is
 * opened. The query cache is what pays it back: collapsing unmounts this and
 * leaves the entry behind, so the second open is instant and revalidates behind
 * the paint.
 *
 * ## A comment is a doorway, drawn as one
 *
 * The first version drew each comment as a bordered card inside the bordered
 * card, with its own "Open →" pill. Boxes inside boxes is the thing a phone
 * feed has the least room for, and a pill on every row is forty pills. Now a
 * comment is a row: a small face, a name and a time on one line, the text,
 * and a footer with the heart, the reply count and a chevron. The whole row
 * is the target — it opens the thread — which is what the chevron promises
 * and what a reader expects of a row that looks like this. An accent rule
 * down the left is what says these hang off the post above them.
 *
 * ## Why the comment's own heart is not written back
 *
 * Unlike the prompt's, which the feed patches into its cache so it survives the
 * card being recycled. A comment is inside an entry this component owns and
 * re-reads on its next open, and the endpoint is unpaged — so the value the
 * hook settles on is replaced by an authoritative one on the next expansion
 * anyway. Patching it would be arithmetic for a fact that is about to be
 * re-fetched.
 */

/** Smaller than the card's face: several of these stack under one prompt. */
const AVATAR = 28;

/**
 * How many comments are drawn before the rest go behind a button.
 *
 * The endpoint is unpaged — it answers every comment on the prompt in one
 * response — so this is a *rendering* limit rather than a fetching one. A
 * popular prompt with forty comments inside a card in a scrolling feed is forty
 * rich-text documents mounted at once, several screens of them, in a list cell
 * the reader opened to see whether anybody had replied. Three is enough to
 * answer that; the rest are one tap away.
 */
const INITIAL_VISIBLE = 3;

const CommentRowView = ({
  comment,
  onOpenThread,
}: {
  comment: Comment;
  onOpenThread: (threadId: string) => void;
}) => {
  const theme = useAppTheme();
  const openSource = useOpenSource();

  const reaction = useToggleReaction({
    id: comment.id,
    reacted: comment.reacted,
    reactions: comment.reactions,
    type: "comment",
  });

  const when = useMemo(
    () => (comment.createdOn ? toFormattedDate(comment.createdOn) : ""),
    [comment.createdOn],
  );

  const replyLabel =
    comment.replyCount === 0
      ? "No replies"
      : `${comment.replyCount} ${pluralize("reply", comment.replyCount)}`;

  return (
    <Pressable
      accessibilityHint="Opens the thread"
      accessibilityLabel={`${comment.source?.name}, ${when}, ${replyLabel}`}
      accessibilityRole="button"
      onPress={() => onOpenThread(comment.id)}
      style={({ pressed }) => [
        styles.comment,
        {
          backgroundColor: pressed ? theme.material.fillPressed : "transparent",
          borderLeftColor: theme.accent.surfaceHover,
        },
      ]}
    >
      <View style={styles.header}>
        {/*
          Inside the row that opens the thread: a press on the face or the
          name is this one's and goes to the author instead.
        */}
        <Pressable
          accessibilityLabel={sourceLinkLabel(
            comment.source?.name,
            comment.source?.sourceType,
          )}
          accessibilityRole="link"
          hitSlop={space.xs}
          onPress={() =>
            openSource(
              comment.source
                ? {
                    id: comment.source.sourceId,
                    sourceType: comment.source.sourceType,
                    urlProp: comment.source.urlProp,
                  }
                : null,
            )
          }
          style={({ pressed }) => [styles.who, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Avatar
            name={comment.source?.name}
            size={AVATAR}
            image={comment.source?.avatar}
            uri={comment.source?.avatar?.src ?? comment.source?.image}
          />
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {comment.source?.name}
          </Text>
        </Pressable>
        <Text style={[styles.meta, { color: theme.textGray }]}>·</Text>
        <Text
          numberOfLines={1}
          style={[styles.meta, styles.when, { color: theme.textGray }]}
        >
          {when}
        </Text>
        {comment.concluded ? (
          <Ionicons
            accessibilityLabel="Concluded"
            color={theme.success}
            name="checkmark-circle"
            size={14}
          />
        ) : null}
      </View>

      <CollapsibleRichText
        fadeColor={theme.material.fill}
        html={comment.text}
      />

      {comment.media ? (
        <View style={styles.media}>
          <FeedMedia url={comment.media} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <HeartButton
          compact
          liked={reaction.reacted}
          likes={reaction.reactions}
          onToggle={() => void reaction.toggle()}
          size={18}
        />
        <View style={styles.replies}>
          <Ionicons
            color={theme.textGray}
            name="return-down-forward-outline"
            size={14}
          />
          <Text style={[styles.repliesLabel, { color: theme.textGray }]}>
            {replyLabel}
          </Text>
        </View>
        <View style={styles.spacer} />
        <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
      </View>
    </Pressable>
  );
};

/**
 * `comment` comes straight out of the query cache, so a row compares in one
 * pointer check — provided `onOpenThread` is stable, which it is: the screen
 * memoises it and the card passes it straight through.
 */
const CommentRow = memo(CommentRowView);

/**
 * A comment row's outline while the list loads: the rule, a face, a name, two
 * lines of text and the footer — so the rows land where the ghosts were.
 */
const CommentRowSkeleton = ({ index }: { index: number }) => {
  const theme = useAppTheme();
  return (
    <View
      style={[styles.comment, { borderLeftColor: theme.accent.surfaceHover }]}
    >
      <View style={styles.header}>
        <Bone circle height={AVATAR} />
        <Bone height={12} width={index % 2 === 0 ? "38%" : "30%"} />
      </View>
      <Bone height={12} />
      <Bone height={12} width={index % 2 === 0 ? "72%" : "58%"} />
      <View style={styles.footer}>
        <Bone height={14} width={36} />
        <Bone height={12} width={64} />
      </View>
    </View>
  );
};

export const PromptComments = ({
  expected,
  onOpenThread,
  promptId,
}: {
  /**
   * The prompt's `commentCount`, known before the list is: how many ghosts to
   * draw, and whether to draw any.
   */
  expected?: number;
  onOpenThread: (threadId: string) => void;
  promptId: string;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const [expanded, setExpanded] = useState(false);

  const query = useQuery({
    queryFn: async (): Promise<Comment[]> => {
      const result = await getPromptComments(api, promptId);
      // `null` is a 404 — nobody has commented, which is an empty list rather
      // than a failure. A `message` is a real error and worth retrying.
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      /*
       * The feed endpoints resize their images inside `@nw/api`; this one does
       * not, because its two web callers render at profile sizes. Doing it here
       * keeps a phone from decoding full-resolution S3 originals for a 28pt
       * face — the same fault `MOBILE_LIST_PERFORMANCE_PLAN` found in the
       * friends list.
       */
      for (const comment of result) transformComment(comment, "row");
      return result;
    },
    queryKey: queryKeys.promptComments(promptId),
    /*
     * Five minutes rather than the client's default minute. Re-opening a card
     * the reader collapsed a moment ago should paint, not spin, and a comment
     * list is not something that changes under you while you scroll a feed.
     */
    staleTime: 5 * 60 * 1000,
  });

  const comments = query.data ?? [];
  const hidden = Math.max(comments.length - INITIAL_VISIBLE, 0);
  const visible =
    expanded || hidden === 0 ? comments : comments.slice(0, INITIAL_VISIBLE);

  // The count on the card says what is coming. None: the empty line at once,
  // rather than a ghost that turns into it. Some: that many rows, up to what
  // the list would draw.
  if (query.isPending && expected !== undefined) {
    if (expected === 0) {
      return (
        <Text style={[styles.empty, { color: theme.textGray }]}>
          No threads on this one yet.
        </Text>
      );
    }
    return (
      <SkeletonPulse label="Loading threads" style={styles.list}>
        {Array.from(
          { length: Math.min(expected, INITIAL_VISIBLE) },
          (_, index) => (
            <CommentRowSkeleton index={index} key={index} />
          ),
        )}
      </SkeletonPulse>
    );
  }

  if (query.isPending || query.error) {
    return (
      <ListStatus
        error={query.error}
        loading={query.isPending}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (comments.length === 0) {
    return (
      <Text style={[styles.empty, { color: theme.textGray }]}>
        No threads on this one yet.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {visible.map((comment) => (
        <CommentRow
          comment={comment}
          key={comment.id}
          onOpenThread={onOpenThread}
        />
      ))}

      {hidden > 0 && !expanded ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={() => setExpanded(true)}
          style={({ pressed }) => [styles.more, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.moreLabel, { color: theme.accent.text }]}>
            {`Show ${hidden} more ${pluralize("thread", hidden)}`}
          </Text>
          <Ionicons color={theme.accent.text} name="chevron-down" size={14} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  comment: {
    borderLeftWidth: 2,
    borderRadius: radius.sm,
    gap: space.sm - 2,
    paddingLeft: space.sm + 2,
    paddingRight: space.xs,
    paddingVertical: space.xs,
  },
  empty: { fontSize: fontSize.caption, lineHeight: 17 },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm + 4,
  },
  header: { alignItems: "center", flexDirection: "row", gap: space.sm },
  list: { gap: space.sm },
  media: { maxWidth: 240 },
  meta: { fontSize: fontSize.caption },
  more: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    minHeight: 32,
    paddingLeft: space.sm + 4,
  },
  moreLabel: { fontSize: fontSize.label, fontWeight: "600" },
  name: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "600" },
  replies: { alignItems: "center", flexDirection: "row", gap: 3 },
  repliesLabel: { fontSize: fontSize.caption, fontWeight: "500" },
  spacer: { flex: 1 },
  when: { flexShrink: 1 },
  who: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: space.sm,
    minWidth: 0,
  },
});
