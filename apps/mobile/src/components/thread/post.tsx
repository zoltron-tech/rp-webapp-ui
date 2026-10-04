import { Ionicons } from "@expo/vector-icons";
import type { PromptSource } from "@nw/types";
import { toFormattedDate, wsrvImage } from "@nw/utils";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { ClipPlayer } from "@/components/chat/clip-player";
import { HeartButton } from "@/components/heart-button";
import { RichText } from "@/components/rich-text";
import { sourceLinkLabel, useOpenSource } from "@/hooks/use-open-source";
import type { ReactionTarget } from "@/hooks/use-toggle-reaction";
import { useToggleReaction } from "@/hooks/use-toggle-reaction";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { memo, useMemo } from "react";

/**
 * One post — the prompt a thread hangs off, the reply that opened it, any reply
 * under it, or a standalone prompt in a profile feed.
 *
 * Web draws these three as three separate blocks of JSX that happen to agree,
 * which is why its thread page is 1,216 lines and why the reply's dropdown and
 * the prompt's dropdown drifted into having different labels for the same act.
 * They are one component here. What differs between the three is a surface, a
 * tag and an indent, and all three follow from `variant`.
 *
 * ## The three surfaces, and why they are not the same
 *
 * The first version gave all three an identical card, which is what a thread
 * looks like when nothing knows what it is: a stack of grey rectangles that
 * happen to be in an order. Scrolled one at a time on a phone, that order is
 * the *only* thing carrying the structure, and it is invisible the moment the
 * top of the screen has passed.
 *
 * So the three read as what they are:
 *
 *  - **The prompt** is the topic, not part of the conversation. It sits on the
 *    recessed panel surface with an accent rule down its edge — the same rule
 *    the inbox uses for a thread waiting on you — so the origin of the thread
 *    is findable by colour after scrolling back up.
 *  - **The opening reply** is the first turn. Card surface, no rule.
 *  - **A reply** is subordinate to it, and says so with a small indent *and* a
 *    rule. The indent alone would be too weak to read at 375pt and the rule
 *    alone was too weak to notice; together they cost 14pt of width and are
 *    unmistakable.
 *  - **A post** is the fourth, and it is not part of a thread at all: it is one
 *    prompt in a profile's feed, where there is no structure for a tag or a
 *    rule to explain. So it has neither. It is the same card because it is the
 *    same thing — an author, a date, some markup, maybe a picture, and a heart
 *    — and a second component for it would be the drift this one exists to
 *    avoid.
 *
 * ## What it keeps from web
 *
 * The reading order — who wrote it and when, then the text, then the media,
 * then the heart — and the overflow menu at the top right, where web's
 * `DropdownMenuContainer` puts it. The date is `toFormattedDate`, the same
 * helper from `@nw/utils` web calls, so the two clients cannot phrase a date
 * differently.
 *
 * ## What it changes for a phone
 *
 * **The tag moved off the name line.** It used to share a row with the author's
 * name, which meant a long name and a tag competing for 200pt and both
 * truncating. It sits on the meta line now, in front of the date, where it is
 * read as a label on the post rather than as part of somebody's name.
 *
 * **Media is contained, not cropped.** `cover` in a fixed 200pt box takes the
 * middle out of every portrait, which for character art is the half that
 * matters. It is `contain` on a panel now, so what was posted is what shows.
 *
 * **Video plays.** Web renders a `<video controls>`; this uses `ClipPlayer`,
 * which the chat already draws attachments with, rather than the static
 * placeholder the outgoing card shows.
 */

/** Faces are 36pt here rather than the outgoing card's 44 — many of these stack. */
/** Web's 40 at phone width. */
const AVATAR = 40;

/**
 * The accent rule down the prompt, and the fainter one down a reply.
 *
 * Both sides of every block carry it — transparent where there is nothing to
 * say — so the avatars in a column of posts share one left edge. A rule that
 * only some blocks reserve space for is a column that steps sideways.
 */
const RULE = 3;

/** How far a reply is inset from the two blocks above it. */
const REPLY_INDENT = space.sm + 3;

export type PostVariant = "prompt" | "comment" | "reply" | "post";

const TAGS: Partial<Record<PostVariant, string>> = {
  comment: "Opening reply",
  prompt: "Prompt",
};

/**
 * Which `?targetType=` each variant's heart sends.
 *
 * A standalone post *is* a prompt as far as the reaction endpoint is concerned;
 * sending `POST` would write a reaction against a target type nothing reads.
 * The other three are their own names.
 */
const REACTION_TARGET: Record<PostVariant, ReactionTarget> = {
  comment: "comment",
  post: "prompt",
  prompt: "prompt",
  reply: "reply",
};

const ThreadPostView = ({
  author,
  commentCount,
  concluded = false,
  createdOn,
  flat = false,
  id,
  media,
  onMore,
  onShowLikers,
  reacted,
  reactions,
  text,
  variant,
}: {
  author: PromptSource;
  /**
   * Replies to this post, shown beside the heart.
   *
   * Feed posts only. Inside a thread the replies are on screen under the post
   * and counting them again says nothing; in a feed it is the one number that
   * tells you whether anybody answered. It is a label rather than a link —
   * there is no route from a prompt id to its thread, which takes a *comment*
   * id.
   */
  commentCount?: number;
  /** Draws the closed-thread chip beside the date. Only the opening reply has one. */
  concluded?: boolean;
  createdOn: string;
  /**
   * A message inside the conversation sheet rather than a card of its own:
   * no frame, no fill, no indent. Web's thread is one sheet with the messages
   * ruled apart inside it; a column of separate cards, each indented and
   * edged, read as a list of unrelated posts.
   */
  flat?: boolean;
  id: string;
  media?: string | null;
  /** Omitted when there is nothing this viewer may do — the menu is then hidden. */
  onMore?: () => void;
  /** The like count was tapped: show who. Omitted where nothing can be shown. */
  onShowLikers?: () => void;
  reacted: boolean;
  reactions: number;
  text: string;
  variant: PostVariant;
}) => {
  const theme = useAppTheme();
  // A `moment()` and its diffs, once per post rather than once per render.
  const when = useMemo(
    () => (createdOn ? toFormattedDate(createdOn) : ""),
    [createdOn],
  );
  const openSource = useOpenSource();

  const reaction = useToggleReaction({
    id,
    reacted,
    reactions,
    type: REACTION_TARGET[variant],
  });

  const isVideo = Boolean(media?.toLowerCase().endsWith("mp4"));
  const tag = TAGS[variant];
  const isPrompt = variant === "prompt";
  const isReply = variant === "reply";

  return (
    <View
      style={
        flat
          ? styles.flat
          : [
              styles.card,
              {
                backgroundColor: theme.material.card.backgroundColor,
                borderColor: theme.material.edge,
                borderLeftColor: isPrompt
                  ? theme.accent.solid
                  : isReply
                    ? theme.accent.surfaceHover
                    : "transparent",
              },
              isReply && { marginLeft: REPLY_INDENT },
            ]
      }
    >
      <View style={styles.header}>
        {/* The face and the name go to the author — muse page or profile. */}
        <Pressable
          accessibilityLabel={sourceLinkLabel(author.name, author.sourceType)}
          accessibilityRole="link"
          onPress={() =>
            openSource({
              id: author.sourceId,
              sourceType: author.sourceType,
              urlProp: author.urlProp,
            })
          }
          style={({ pressed }) => [styles.who, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Avatar
            name={author.name}
            size={AVATAR}
            image={author.avatar}
            uri={author.avatar?.src ?? author.image}
          />

          <View style={styles.identity}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.text }]}
            >
              {author.name}
            </Text>

            <View style={styles.metaRow}>
              {tag ? (
                <Text
                  style={[
                    styles.tag,
                    {
                      backgroundColor: isPrompt
                        ? theme.accent.tint
                        : theme.material.fillPressed,
                      borderColor: isPrompt
                        ? theme.accent.surfaceHover
                        : theme.material.edge,
                      color: isPrompt
                        ? theme.accent.textStrong
                        : theme.textGray,
                    },
                  ]}
                >
                  {tag.toUpperCase()}
                </Text>
              ) : null}

              <Text
                numberOfLines={1}
                style={[styles.meta, { color: theme.textGray }]}
              >
                {when}
              </Text>

              {concluded ? (
                <View style={styles.concluded}>
                  <Ionicons
                    color={theme.success}
                    name="checkmark-circle-outline"
                    size={12}
                  />
                  <Text
                    style={[styles.concludedLabel, { color: theme.success }]}
                  >
                    Concluded
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>

        {onMore ? (
          <Pressable
            accessibilityLabel="More options"
            accessibilityRole="button"
            // The glyph is 18pt; the target has to be 44, and padding the
            // pressable would push the row's own layout around.
            hitSlop={space.md}
            onPress={onMore}
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

      <RichText html={text} />

      {media ? (
        <View
          style={[
            styles.media,
            {
              backgroundColor: theme.glass.field,
              borderColor: theme.material.edge,
            },
          ]}
        >
          {isVideo ? (
            <ClipPlayer url={media} />
          ) : (
            <Image
              cachePolicy="memory-disk"
              contentFit="contain"
              recyclingKey={media}
              // Bounded to the screen, shape kept; the original was a
              // full-size decode per post.
              source={{ uri: wsrvImage(media, POST_IMAGE) }}
              style={styles.image}
              transition={0}
            />
          )}
        </View>
      ) : null}

      <View style={styles.footer}>
        <HeartButton
          liked={reaction.reacted}
          likes={reaction.reactions}
          onPressCount={
            onShowLikers && reaction.reactions > 0 ? onShowLikers : undefined
          }
          onToggle={() => void reaction.toggle()}
        />

        {commentCount !== undefined && commentCount > 0 ? (
          <View style={styles.replies}>
            <Ionicons
              color={theme.textGray}
              name="chatbubbles-outline"
              size={14}
            />
            <Text style={[styles.repliesLabel, { color: theme.textGray }]}>
              {commentCount}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

/**
 * Memoised: the thread screen holds the menu, the likers sheet, the composer
 * and the share sheet, and opening any of them re-rendered every post on the
 * page — rich text, media and all. The screen passes stable callbacks.
 */
export const ThreadPost = memo(ThreadPostView);

/** Three device pixels per point across a phone-width post. */
const POST_IMAGE = { fit: "inside", w: 1080 } as const;

const styles = StyleSheet.create({
  card: {
    // Reserved on every variant, coloured on two. See `RULE`.
    borderLeftWidth: RULE,
    borderRadius: radius.card,
    borderWidth: border.edge,
    gap: space.sm,
    padding: space.m,
  },
  concluded: { alignItems: "center", flexDirection: "row", gap: 3 },
  concludedLabel: { fontSize: fontSize.meta, fontWeight: "600" },
  flat: { gap: space.ms, paddingHorizontal: space.md, paddingVertical: space.md },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.md,
    justifyContent: "space-between",
  },
  header: { alignItems: "center", flexDirection: "row", gap: space.sm },
  identity: { flex: 1, gap: 3, minWidth: 0 },
  image: { height: "100%", width: "100%" },
  /*
   * A fixed box the picture is fitted inside rather than cropped to.
   *
   * 240 is about a third of the shortest supported screen — enough that a
   * portrait is legible without the post becoming the picture, and the panel
   * behind it means a picture narrower than the post sits on a surface rather
   * than a hole.
   */
  media: {
    borderRadius: radius.cardSm,
    borderWidth: border.edge,
    height: 240,
    overflow: "hidden",
  },
  meta: { flexShrink: 1, fontSize: fontSize.meta },
  metaRow: { alignItems: "center", flexDirection: "row", gap: space.s },
  more: { alignSelf: "flex-start" },
  name: { fontSize: fontSize.body, fontWeight: "700" },
  replies: { alignItems: "center", flexDirection: "row", gap: space.xs },
  repliesLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  tag: {
    borderRadius: radius.xs,
    borderWidth: border.edge,
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.3,
    overflow: "hidden",
    paddingHorizontal: 5,
    paddingVertical: space.xxs,
  },
  who: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: space.sm,
    minWidth: 0,
  },
});
