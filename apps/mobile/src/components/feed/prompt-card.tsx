import { Ionicons } from "@expo/vector-icons";
import type { Comment, Prompt } from "@nw/types";
import { pluralize, toFormattedDate } from "@nw/utils";
import { Image } from "@/components/image";
import type { ProfileSong } from "@nw/types/music";
import { memo, useCallback, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useCommentsReveal } from "@/animation/effects";
import { OUTBOX_ID_PREFIX } from "@/lib/local-store";
import { ProfileSongPill } from "@/components/profile-song";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { CollapsibleRichText } from "@/components/collapsible-rich-text";
import {
  COMMENT_OOC_PLACEHOLDERS,
  COMMENT_PLACEHOLDERS,
  ComposeTrigger,
} from "@/components/compose/compose-trigger";
import { FeedMedia } from "@/components/feed/feed-media";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { PromptComments } from "@/components/feed/prompt-comments";
import { HeartButton } from "@/components/heart-button";
import { FOLDED_BLOCKS } from "@/components/rich-text";
import { sourceLinkLabel, useOpenSource } from "@/hooks/use-open-source";
import { useToggleReaction } from "@/hooks/use-toggle-reaction";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { useGlobalState } from "@nw/store";

/**
 * One post in a feed — Explore's two tabs, and a novelist's prompts and
 * out-of-character posts on their profile. The native counterpart to web's
 * `components/prompt`.
 *
 * ## What was wrong with the first version
 *
 * It was faithful to web part for part, and web's card is laid out for a
 * 800px column. At 375pt the same parts became noise: a name row with a
 * bordered role pill, a meta row with a bordered privacy chip, a third row
 * for an "OUT OF CHARACTER" eyebrow, then a footer that mixed a sentence
 * ("3 novelists like this"), a text button ("Reply") and a chevron toggle
 * ("No comments ˅") in three different visual registers. Comments opened as
 * bordered cards inside the bordered card, each with its own pill button.
 * Every attachment sat in a fixed 240pt box with a grey gutter around it.
 *
 * ## What it is now
 *
 * Three levels of type and no more — name, one meta line, body — which is
 * the hierarchy every phone feed has settled on (X, Threads, Bluesky agree
 * on this and disagree on nearly everything else). The role and the privacy
 * moved *into* the meta line as words and a glyph with no boxes around them:
 * "Muse · 4 days ago · ⊕". A novelist speaking as themselves reads "Out of
 * character" there, which is what the eyebrow said in its own row.
 *
 * The footer is web's three buttons in one register — the heart, the
 * comments and share, a glyph and a number each on a 36pt target — and under
 * it web's comment trigger: your face beside a field that is not a field,
 * which opens the composer for a comment. The reader answers a post where
 * they read it, as on web. Counts are numbers, not sentences; the sentence is
 * on the accessibility label where a screen reader wants it.
 *
 * Attachments keep their own shape (`feed-media.tsx`). Long prompts fold at
 * six blocks with a Read more, and what is behind the fold is not laid out.
 *
 * The card is outlined, not elevated or filled — Material's own guidance for
 * a list of mixed, browsable content on a dark surface, where a shadow
 * disappears and a filled card is one more grey on grey.
 *
 * ## Nothing mutable lives in here
 *
 * Not whether the comments are open, not whether the text is unfolded, and
 * not the heart. All are held above the list and handed down, which is the
 * one rule a recycling list cannot be written without: FlashList keeps a pool
 * of mounted cells and re-binds data into them, so a `useState` here is state
 * belonging to a *slot* rather than to a prompt — the next prompt bound into
 * that slot would inherit it.
 *
 * ## What the screen owns
 *
 * The composer, the share sheet and the overflow menu are one instance each,
 * owned by the feed: a sheet mounted inside every cell of a recycling list is
 * a sheet mounted forty times. The card offers the reply field, a share
 * button and a ⋯ button and nothing else. Comments are fetched only when opened — see
 * `prompt-comments.tsx`.
 */

/** Web's face at phone width (`prompt/styled.ts`). */
const AVATAR = 44;

/** Web's footer glyphs. */
const ACTION_ICON = 17;

/** Web folds a prompt at 100px; seven lines here, so a short post never folds. */
const FEED_COLLAPSED_HEIGHT = 168;

export type PromptReaction = { reacted: boolean; reactions: number };

export interface PromptCardProps {
  /** Whether this card's comments are open. Held by the screen — see above. */
  expanded: boolean;
  /** Whether a long body is shown in full. Held by the screen, likewise. */
  unfolded: boolean;
  /** Write a comment on this prompt. Omitted for a signed-out reader. */
  onCompose?: (prompt: Prompt) => void;
  /** The ⋯ menu. Omitted when there is nothing this viewer may do. */
  onMore?: (prompt: Prompt) => void;
  /** Takes a waiting post out of the outbox. Drawn only on a queued card. */
  onDiscardQueued?: (promptId: string) => void;
  /** A comment's ⋯ menu under this card. */
  onCommentMore?: (comment: Comment) => void;
  /** A comment's like count was tapped. */
  onShowCommentLikers?: (comment: Comment) => void;
  /** The privacy icon on a custom-privacy post: who it is shared with. */
  onShowSharedWith?: (prompt: Prompt) => void;
  /** Web's share button on the footer: the share sheet, for anyone. */
  onShare?: (prompt: Prompt) => void;
  /** Given a *comment* id — the root of the thread that comment opened. */
  onOpenThread: (threadId: string) => void;
  /**
   * The like count was tapped: show who. Web's `ReactionLikersDialog`, which
   * the screen owns for the same reason it owns the composer.
   */
  onShowLikers?: (prompt: Prompt) => void;
  /**
   * The heart, on its way back to whatever holds this prompt.
   *
   * A feed card is unmounted the moment it scrolls out of a recycling list, so
   * a reaction kept only inside `useToggleReaction` is forgotten before the
   * reader has finished the next card. The screen patches its query cache from
   * this, which is also what web does with its global cache.
   */
  onReacted: (promptId: string, next: PromptReaction) => void;
  /** Opens or closes this card's comments, by id. */
  onToggleComments: (promptId: string) => void;
  /** Opens or folds a long body, by id. */
  onUnfold: (promptId: string) => void;
  prompt: Prompt;
}

const PromptCardView = ({
  expanded,
  onCommentMore,
  onCompose,
  onDiscardQueued,
  onMore: onMoreProp,
  onOpenThread,
  onReacted,
  onShare,
  onShowCommentLikers,
  onShowLikers,
  onShowSharedWith,
  onToggleComments,
  onUnfold,
  prompt,
  unfolded,
}: PromptCardProps) => {
  const theme = useAppTheme();
  // The list fades and rises open, and fades closed before it unmounts.
  const comments = useCommentsReveal(expanded);
  // A post waiting in the outbox, drawn in its place. It has no id yet — no
  // heart, no thread, no menu, no comment — only the one thing that can be
  // done with it. See `local-store/outbox.ts`.
  const queued = prompt.id.startsWith(OUTBOX_ID_PREFIX);
  const onMore = queued ? undefined : onMoreProp;

  const { commentCount, createdOn, featuredSong, id, media, privacy, source } =
    prompt;

  /*
   * Bound to the id here rather than at the screen, so the screen's callback
   * stays one stable function for the whole list instead of one closure per
   * row. `id` is the only thing that changes, and it changes with the prompt.
   */
  const handleReacted = useCallback(
    (next: PromptReaction) => onReacted(id, next),
    [id, onReacted],
  );

  const reaction = useToggleReaction({
    id,
    onChange: handleReacted,
    reacted: prompt.reacted,
    reactions: prompt.reactions,
    type: "prompt",
  });

  const isMuse = source?.sourceType === "MUSE";

  /*
   * The face on the reply field is who the reply would come *from* — web's
   * `initialSelection` in `PromptThreads`: you, on an out-of-character post;
   * your first character on an in-character one, since only a character may
   * answer a character. The composer opens on the same choice.
   */
  // The store's copy, not `useSession()`: that is two query observers per
  // row, and every one of them re-rendered when the session settled.
  const me = useGlobalState("novelist");
  const replyAs = isMuse ? (me?.muses?.[0] ?? me) : me;
  const openSource = useOpenSource();

  // `moment()` and five diffs, once per prompt rather than once per render.
  const when = useMemo(
    () => (createdOn ? toFormattedDate(createdOn) : ""),
    [createdOn],
  );

  const privacyIcon = PRIVACY_ICON[privacy] ?? "earth-outline";
  const privacyLabel = PRIVACY_LABEL[privacy] ?? "Public";

  const commentSentence =
    commentCount > 0
      ? `${commentCount} ${pluralize("comment", commentCount)}`
      : "No comments";

  return (
    <View style={[styles.card, theme.material.card]}>
      {/* ── Who, and when ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* The face and the name go to whoever wrote it, as on web. */}
        <Pressable
          accessibilityLabel={sourceLinkLabel(
            source?.name,
            source?.sourceType,
            source?.isPlaceholder,
          )}
          accessibilityRole={source?.isPlaceholder ? "text" : "link"}
          onPress={() =>
            openSource(
              source
                ? {
                    id: source.sourceId,
                    isPlaceholder: source.isPlaceholder,
                    sourceType: source.sourceType,
                    urlProp: source.urlProp,
                  }
                : null,
            )
          }
          style={({ pressed }) => [styles.who, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Avatar
            name={source?.name}
            size={AVATAR}
            image={source?.avatar}
            uri={source?.avatar?.src ?? source?.image}
          />

          <View style={styles.identity}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.text }]}
            >
              {source?.name}
            </Text>

            <View
              accessibilityLabel={`${isMuse ? "Character" : "Out of character"}, ${when}, visible to ${privacyLabel}`}
              style={styles.metaRow}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.meta,
                  { color: isMuse ? theme.accent.text : theme.textGray },
                  isMuse && styles.metaRole,
                ]}
              >
                {isMuse ? "Character" : "Out of character"}
              </Text>
              <Text style={[styles.meta, { color: theme.textGray }]}>·</Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.meta,
                  styles.metaWhen,
                  { color: theme.textGray },
                ]}
              >
                {when}
              </Text>
              <Text style={[styles.meta, { color: theme.textGray }]}>·</Text>
              {onShowSharedWith &&
              privacy === "CUSTOM" &&
              prompt.sharedWith?.length ? (
                <Pressable
                  accessibilityLabel={`Shared with ${prompt.sharedWith.length}`}
                  accessibilityRole="button"
                  hitSlop={space.sm}
                  onPress={() => onShowSharedWith(prompt)}
                >
                  <Ionicons
                    color={theme.accent.text}
                    name={privacyIcon}
                    size={12}
                  />
                </Pressable>
              ) : (
                <Ionicons color={theme.textGray} name={privacyIcon} size={12} />
              )}
            </View>
          </View>
        </Pressable>

        {onMore ? (
          <Pressable
            accessibilityLabel="More options"
            accessibilityRole="button"
            hitSlop={space.md}
            onPress={() => onMore(prompt)}
            style={({ pressed }) => [
              styles.more,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons
              color={theme.textGray}
              name="ellipsis-horizontal"
              size={18}
            />
          </Pressable>
        ) : null}
      </View>

      {/* ── What ──────────────────────────────────────────────────────── */}
      {/*
        Folded by measured height, as web folds it, with the open state lent
        by the screen — a recycling cell cannot keep it. Six blocks is the
        layout budget behind the fold; see `CollapsibleRichText`.
      */}
      <CollapsibleRichText
        collapsedHeight={FEED_COLLAPSED_HEIGHT}
        expanded={unfolded}
        fadeColor={theme.material.card.backgroundColor}
        html={prompt.text}
        maxBlocks={FOLDED_BLOCKS}
        onToggle={() => onUnfold(id)}
      />

      {media ? <FeedMedia url={media} /> : null}

      {/*
        The song a prompt was posted with. A line until it is pressed, then
        the player: web mounts one per card, but a player per feed cell is a
        player per recycle, and most readers scroll past.
      */}
      {featuredSong ? <PromptSong key={id} song={featuredSong} /> : null}

      {/* ── Actions ───────────────────────────────────────────────────── */}
      {queued ? (
        <View style={[styles.actions, { borderTopColor: theme.material.edge }]}>
          <Ionicons
            color={theme.textGray}
            name="cloud-offline-outline"
            size={ACTION_ICON}
          />
          <Text style={[styles.actionCount, { color: theme.textGray }]}>
            Waiting for connection
          </Text>
          <View style={styles.spacer} />
          {onDiscardQueued ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => onDiscardQueued(prompt.id)}
            >
              <Text style={[styles.actionCount, { color: theme.error }]}>
                Don't send
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={[styles.actions, { borderTopColor: theme.material.edge }]}>
          {/*
          Web's sentence, and web's tap on it: "3 novelists like this" opens the
          list of who. The sentence yields width first — it can shorten to an
          ellipsis, the comment bubble and the share glyph cannot.
        */}
          <HeartButton
            liked={reaction.reacted}
            likes={reaction.reactions}
            onPressCount={
              onShowLikers && reaction.reactions > 0
                ? () => onShowLikers(prompt)
                : undefined
            }
            onToggle={() => void reaction.toggle()}
          />

          <Pressable
            accessibilityLabel={
              expanded ? "Hide comments" : `Show comments: ${commentSentence}`
            }
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            hitSlop={space.xs}
            onPress={() => onToggleComments(id)}
            style={({ pressed }) => [
              styles.action,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons
              color={expanded ? theme.accent.text : theme.textGray}
              name={expanded ? "chatbubble" : "chatbubble-outline"}
              size={ACTION_ICON}
            />
            {commentCount > 0 ? (
              <Text
                style={[
                  styles.actionCount,
                  { color: expanded ? theme.accent.text : theme.textGray },
                ]}
              >
                {commentCount}
              </Text>
            ) : null}
          </Pressable>

          <View style={styles.spacer} />

          {/* Web's third footer button. Share is for anyone, signed in or not. */}
          {onShare ? (
            <Pressable
              accessibilityLabel="Share this post"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => onShare(prompt)}
              style={({ pressed }) => [
                styles.action,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons
                color={theme.textGray}
                name="share-social-outline"
                size={ACTION_ICON}
              />
            </Pressable>
          ) : null}
        </View>
      )}

      {/*
        Web's comment trigger under the footer — your face beside a field that
        is not a field, which opens the composer for a comment. In the feed
        rather than only on the thread page, because a post you can answer
        right where you read it is what makes a feed a conversation.
      */}
      {onCompose && !queued && prompt.canInteract ? (
        <ComposeTrigger
          avatarImage={replyAs?.avatar}
          avatarUri={replyAs?.avatar?.src ?? replyAs?.image}
          compact
          label="Write a comment"
          name={replyAs?.firstName}
          onPress={() => onCompose(prompt)}
          placeholders={
            isMuse ? COMMENT_PLACEHOLDERS : COMMENT_OOC_PLACEHOLDERS
          }
        />
      ) : null}

      {/*
        Mounted only while open, which is what keeps the request lazy — the
        query inside it *is* the fetch. Keyed by the prompt so a recycled cell
        cannot hand one prompt's comment list to another.
      */}
      {comments.mounted ? (
        <Animated.View
          style={[
            styles.comments,
            { borderTopColor: theme.material.edge },
            comments.style,
          ]}
        >
          <PromptComments
            expected={commentCount}
            key={id}
            onMore={onCommentMore}
            onOpenThread={onOpenThread}
            onShowLikers={onShowCommentLikers}
            promptId={id}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

/**
 * `prompt` comes straight out of the query cache, so its identity is stable
 * between renders and this compares in one pointer check per row — provided
 * the callbacks are stable too, which is why the screen memoises all of them.
 * `expanded` and `unfolded` are booleans, so opening one card re-renders that
 * card and leaves every other one on screen alone.
 */
export const PromptCard = memo(PromptCardView);

/**
 * A prompt's song: a line until it is pressed, then the player. Its own
 * component, keyed by prompt, because a cell is re-bound to other prompts and
 * state held in the card would start the next prompt's song.
 */
const PromptSong = ({ song }: { song: ProfileSong }) => {
  const theme = useAppTheme();
  const [started, setStarted] = useState(false);

  if (started) return <ProfileSongPill autoStart song={song} />;

  return (
    <Pressable
      accessibilityLabel={`Play ${song.title}`}
      accessibilityRole="button"
      onPress={() => setStarted(true)}
      style={[
        styles.song,
        {
          backgroundColor: theme.glass.field,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {song.imageUrl ? (
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={song.imageUrl}
          source={{ uri: song.imageUrl }}
          style={styles.songArt}
          transition={0}
        />
      ) : (
        <View style={[styles.songArt, styles.songArtFallback]}>
          <Ionicons color={theme.accent.text} name="musical-notes" size={14} />
        </View>
      )}
      <View style={styles.songText}>
        <Text
          numberOfLines={1}
          style={[styles.songTitle, { color: theme.text }]}
        >
          {song.title}
        </Text>
        {song.artist ? (
          <Text
            numberOfLines={1}
            style={[styles.songArtist, { color: theme.textGray }]}
          >
            {song.artist}
          </Text>
        ) : null}
      </View>
      <Ionicons color={theme.accent.text} name="play" size={18} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    // 36 rather than 44: it sits inside a card in a scrolling list, and a
    // taller control would push every card down a row. `hitSlop` makes the
    // target up without costing the layout anything.
    minHeight: 36,
    paddingHorizontal: space.xs,
  },
  actionCount: {
    fontSize: fontSize.caption,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    // Web's footer: a rule over the actions, which is what separates what
    // was written from what you can do about it.
    borderTopWidth: border.edge,
    gap: space.m,
    marginTop: space.xs,
    paddingTop: space.xs,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: border.edge,
    gap: space.ms,
    // Web's card at phone width: 18 over the header, 14 at the sides.
    paddingBottom: space.m,
    paddingHorizontal: space.md - 2,
    paddingTop: 18,
  },
  comments: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space.ms,
  },
  header: { alignItems: "center", flexDirection: "row", gap: space.ms },
  identity: { flex: 1, gap: space.xxs, minWidth: 0 },
  meta: { fontSize: fontSize.meta },
  metaRole: { fontWeight: "600" },
  metaRow: { alignItems: "center", flexDirection: "row", gap: 5 },
  metaWhen: { flexShrink: 1 },
  more: { alignSelf: "flex-start", paddingTop: space.xxs },
  name: { fontSize: fontSize.body, fontWeight: "600", letterSpacing: -0.14 },
  song: {
    alignItems: "center",
    borderRadius: radius.cardSm,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.ms,
    padding: space.ms,
  },
  songArt: { borderRadius: 9, height: 44, width: 44 },
  songArtFallback: { alignItems: "center", justifyContent: "center" },
  songArtist: { fontSize: fontSize.caption },
  songText: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: fontSize.label, fontWeight: "600" },
  spacer: { flex: 1 },
  who: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: space.ms,
    minWidth: 0,
  },
});
