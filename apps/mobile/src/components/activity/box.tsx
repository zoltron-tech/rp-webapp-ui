import { Ionicons } from "@expo/vector-icons";
import type { Activity } from "@nw/types/activity";
import { toFormattedDateFromUnix, wsrvImage } from "@nw/utils";
import { Image } from "@/components/image";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { memo } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { FeedClip, FeedImage } from "@/components/feed/feed-media";
import { HeartButton } from "@/components/heart-button";
import { RichText } from "@/components/rich-text";
import { sourceLinkLabel, useOpenSource } from "@/hooks/use-open-source";
import type { ReactionTarget } from "@/hooks/use-toggle-reaction";
import { useToggleReaction } from "@/hooks/use-toggle-reaction";
import { env } from "@/lib/env";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One entry in a novelist's activity feed.
 *
 * The native counterpart to `apps/web/src/components/activity-box`. Web's is
 * 743 lines because it is also a router, three share dialogs, a likers dialog,
 * a fullscreen image viewer and a hand-built video player. What is left when
 * those come out is what an activity actually *is*: who did it, what they did,
 * what it was to, and a heart.
 *
 * ## What navigates
 *
 * Web routes from four places on this card — the avatar, the name, the body
 * card and a "View threads" / "View character" / "View story" button. Here
 * the face and the name open the *source* (the muse or novelist who did the
 * thing, through `useOpenSource`, as web's `onAvatarClick`), and the body
 * opens the *target*, as web's `handleCardClick`:
 *
 * | Target | Goes to |
 * | --- | --- |
 * | MUSE | the character's page |
 * | PROMPT, COMMENT, REPLY | the prompt's page (`/prompt/:id`) |
 * | PROFILE | the source's profile |
 * | MEDIA (a picture) | the media viewer, through `onOpenMedia` |
 * | STORY_BOARD, STORY_BOARD_EVENT | the story on the web — no story page here yet |
 *
 * A clip's own tap plays it, so a video body does not route. The like count
 * opens who liked it, through `onShowLikers` — the screen owns the sheet, as
 * it owns the viewer, because a modal inside every cell of a list is a modal
 * mounted forty times.
 *
 * ## Drawn as a post
 *
 * The card is the prompt card's shape — same radius, same paddings, same
 * header of a face and two lines, same action row at the foot — so the home
 * feed, which deals activities between posts, reads as one stream and not two
 * kinds of card taking turns. What the activity is *about* fills the middle:
 *
 *  - a **prompt** is quoted, as rich text with a rule down its side;
 *  - **media** is the picture or the clip at its own shape, through the same
 *    `FeedMedia` pieces a post uses, so a clip is a still until tapped and its
 *    controls sit under it rather than under the heart (a fixed 220pt box used
 *    to clip them, and the action row landed on the seek bar);
 *  - a **character, story or profile** is its picture, large and centred over a
 *    blurred copy of itself so a portrait fills the width without gutters, and
 *    its title beneath.
 *
 * ## Which id the heart reacts to
 *
 * `target.id`, with the target type deciding `?targetType=`. Two of those
 * mappings are not what the type name suggests and both come from the backend
 * rather than from a preference:
 *
 *  - **PROMPT, COMMENT and REPLY** activities all point at the *parent
 *    prompt's* id (see `createActivityTarget` on the backend), so all three
 *    react as `PROMPT` and share that prompt's count with the thread screen.
 *  - **STORY_BOARD** activities point at the story's own id, so editing a story
 *    or one of its events hearts the story.
 *
 * Web works this out in the same place and the same way. Getting it wrong does
 * not error — it writes a reaction against an id nothing else reads.
 */

/** The three activity types whose target is really the parent prompt. */
const PROMPT_TYPES = ["PROMPT", "COMMENT", "REPLY"];
const STORY_TYPES = ["STORY_BOARD", "STORY_BOARD_EVENT"];

const VIDEO_EXTENSIONS = ["mp4", "mov", "quicktime"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif"];
const AUDIO_EXTENSIONS = ["mp3", "mpeg", "wav"];

type MediaKind = "audio" | "image" | "video" | null;

/**
 * What kind of file a URL points at.
 *
 * Ported from web's `getMediaTypeFromUrl` rather than guessed, because the
 * naive answer — read the extension off the end of the string — is wrong for
 * most of the URLs this app actually receives. Images come back through an
 * image proxy, and a proxied URL ends in the *proxy's* query string: the real
 * filename is inside `?url=`, and the output format may be stated separately in
 * `?output=`. Checking those two first is the whole difference between a media
 * activity rendering and a media activity falling back to a grey box.
 *
 * ⚠ Web keeps its own copy inside the component. This is the second, and the
 * two should become one in `@nw/utils` when web's activity box migrates — it is
 * pure string handling with nothing platform-specific in it.
 */
const mediaKindFromUrl = (url: string): MediaKind => {
  const fromExtension = (path: string): MediaKind => {
    const extension = path.split(".").pop()?.toLowerCase() ?? "";
    if (IMAGE_EXTENSIONS.includes(extension)) return "image";
    if (VIDEO_EXTENSIONS.includes(extension)) return "video";
    if (AUDIO_EXTENSIONS.includes(extension)) return "audio";
    return null;
  };

  try {
    const parsed = new URL(url);

    // Proxies (wsrv.nl and friends) advertise the output format they will
    // serve, which beats whatever the source file happened to be.
    const output = parsed.searchParams.get("output");
    if (output) {
      const kind = fromExtension(`.${output}`);
      if (kind) return kind;
    }

    // The real asset is encoded in `?url=`; its extension is the answer.
    const proxied = parsed.searchParams.get("url");
    if (proxied) {
      const kind = fromExtension(decodeURIComponent(proxied).split("?")[0]);
      if (kind) return kind;
    }

    return fromExtension(parsed.pathname);
  } catch {
    // Not a URL the parser accepts. Strip the query and hash by hand.
    return fromExtension(url.split("?")[0].split("#")[0]);
  }
};

interface Kind {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
}

/** Web's `getActivityKind`, minus the action label there is no action for. */
const kindFor = (targetType: string): Kind => {
  if (PROMPT_TYPES.includes(targetType))
    return { icon: "chatbubbles-outline", label: "Prompt" };
  if (targetType === "MEDIA") return { icon: "image-outline", label: "Media" };
  if (targetType === "MUSE")
    return { icon: "person-circle-outline", label: "Character" };
  if (STORY_TYPES.includes(targetType))
    return { icon: "book-outline", label: "Story" };
  if (targetType === "PROFILE")
    return { icon: "person-outline", label: "Profile" };
  return { icon: "sparkles-outline", label: "Activity" };
};

/** Which `?targetType=` the heart sends. See the note on the component. */
const reactionTargetFor = (targetType: string): ReactionTarget => {
  if (targetType === "MEDIA") return "media";
  if (PROMPT_TYPES.includes(targetType)) return "prompt";
  return targetType.toLowerCase() as ReactionTarget;
};

const ActivityBoxView = ({
  activity,
  onOpenMedia,
  onShowLikers,
}: {
  activity: Activity;
  /** A picture activity was tapped; the screen opens it full screen. */
  onOpenMedia?: (url: string) => void;
  /** The like count was tapped; the screen shows who. */
  onShowLikers?: (target: { count: number; id: string }) => void;
}) => {
  const theme = useAppTheme();
  const openSource = useOpenSource();
  const router = useRouter();

  const targetType = activity.target?.activityTargetType ?? "";
  const kind = kindFor(targetType);
  const isPrompt = PROMPT_TYPES.includes(targetType);
  const isMedia = targetType === "MEDIA";
  const url = activity.target?.url ?? "";
  const mediaKind = url ? mediaKindFromUrl(url) : null;

  const reaction = useToggleReaction({
    id: activity.target?.id ?? "",
    reacted: Boolean(activity.reacted),
    reactions: activity.reactionCount ?? 0,
    type: reactionTargetFor(targetType),
  });

  const when = activity.date ? toFormattedDateFromUnix(activity.date) : "";

  /** Web's `handleCardClick`, for the destinations this client has. */
  const openTarget = () => {
    const id = activity.target?.id;
    if (!id) return;
    if (targetType === "MUSE") {
      router.push({ params: { museId: id }, pathname: "/muse/[museId]" });
    } else if (isPrompt) {
      router.push({ params: { promptId: id }, pathname: "/prompt/[promptId]" });
    } else if (targetType === "PROFILE") {
      const username = activity.source?.urlProp;
      if (username) {
        router.push({ params: { username }, pathname: "/novelist/[username]" });
      }
    } else if (targetType === "STORY_BOARD") {
      void Linking.openURL(`${env.WEB_URL}/rp/story/${id}`);
    } else if (targetType === "STORY_BOARD_EVENT") {
      void Linking.openURL(`${env.WEB_URL}/rp/story/event/${id}`);
    } else if (isMedia && mediaKind === "image" && url) {
      onOpenMedia?.(url);
    }
  };

  // A clip plays on its own tap; everything else on the body routes.
  const bodyRoutes = !(isMedia && mediaKind !== "image");

  return (
    <View
      style={[
        styles.card,
        theme.material.card,
      ]}
    >
      {/* ── Who, and what they did ─────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={sourceLinkLabel(
            activity.source?.title,
            activity.source?.sourceType,
          )}
          accessibilityRole="link"
          onPress={() =>
            openSource(
              activity.source
                ? {
                    id: activity.source.id,
                    sourceType: activity.source.sourceType,
                    urlProp: activity.source.urlProp,
                  }
                : null,
            )
          }
          style={({ pressed }) => [styles.who, { opacity: pressed ? 0.6 : 1 }]}
        >
          {/* Web's double ring: the card's own colour, then the accent. */}
          <View style={[styles.ring, { borderColor: theme.accent.surfaceHover }]}>
            <Avatar
              name={activity.source?.title}
              size={AVATAR}
              image={activity.source?.avatar}
              uri={activity.source?.avatar?.src ?? activity.source?.image}
            />
          </View>

          <View style={styles.identity}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.text }]}
            >
              {activity.source?.title}
            </Text>

            {/*
              The verb and the date on one line, as a post's meta row puts the
              role and the date: "uploaded a new photo · 3 days ago".
            */}
            <View style={styles.metaRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.meta,
                  styles.metaVerb,
                  { color: theme.textGray },
                ]}
              >
                {activity.activityText}
              </Text>
              {when ? (
                // One unit, so a wrap takes the dot down with the date and
                // never leaves it hanging off the end of the verb.
                <View style={styles.metaWhen}>
                  <Text style={[styles.meta, { color: theme.textGray }]}>
                    ·
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.meta, { color: theme.textGray }]}
                  >
                    {when}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>

        {/*
          What kind of thing it was about, where a post keeps its menu — as a
          glyph. The sentence under the name already says the word ("updated a
          character"); spelling it out again beside it took the width that
          sentence needed, and pushed the date onto a second line.
        */}
        <View
          accessibilityLabel={kind.label}
          style={[
            styles.badge,
            {
              backgroundColor: theme.accent.tint,
              borderColor: theme.accent.surfaceHover,
            },
          ]}
        >
          <Ionicons
            color={theme.accent.textStrong}
            name={kind.icon}
            size={15}
          />
        </View>
      </View>

      {/* ── What ──────────────────────────────────────────────────────── */}
      <Pressable
        accessibilityHint={
          bodyRoutes ? `Opens the ${kind.label.toLowerCase()}` : undefined
        }
        accessibilityRole={bodyRoutes ? "link" : undefined}
        disabled={!bodyRoutes}
        onPress={openTarget}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <ActivityBody
          isMedia={isMedia}
          isPrompt={isPrompt}
          kind={kind}
          mediaKind={mediaKind}
          title={activity.target?.title ?? ""}
          url={url}
        />
      </Pressable>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      {/*
        The only control on the card, on the same line a post keeps its heart.
        Hidden when there is no target id, because a heart with nothing to
        react to is a button that fails silently.
      */}
      {activity.target?.id ? (
        <View style={styles.actions}>
          <HeartButton
            liked={reaction.reacted}
            likes={reaction.reactions}
            onPressCount={
              onShowLikers && reaction.reactions > 0 && activity.target?.id
                ? () =>
                    onShowLikers({
                      count: reaction.reactions,
                      id: activity.target.id,
                    })
                : undefined
            }
            onToggle={() => void reaction.toggle()}
          />
        </View>
      ) : null}
    </View>
  );
};

/**
 * What the activity is *about*, which is a different shape per target type.
 *
 * Four cases, in the order web checks them: a prompt is its own text, media is
 * the media, anything else with a picture is a titled card, and anything else
 * is its title alone.
 */
const ActivityBody = ({
  isMedia,
  isPrompt,
  kind,
  mediaKind,
  title,
  url,
}: {
  isMedia: boolean;
  isPrompt: boolean;
  kind: Kind;
  mediaKind: MediaKind;
  title: string;
  url: string;
}) => {
  const theme = useAppTheme();

  // A prompt activity's "title" is the prompt's own markup, so it renders as
  // rich text rather than as a label.
  if (isPrompt) {
    return title ? (
      <View
        style={[
          styles.quote,
          {
            backgroundColor: theme.glass.field,
            borderLeftColor: theme.accent.surfaceHover,
          },
        ]}
      >
        <RichText html={title} />
      </View>
    ) : null;
  }

  if (isMedia) {
    return (
      <View style={styles.mediaGroup}>
        {mediaKind === "video" ? (
          // A still with a play glyph until tapped; the player's controls sit
          // under the picture, in a row of their own — see `feed-media.tsx`.
          <FeedClip key={url} url={url} />
        ) : mediaKind === "image" ? (
          <FeedImage key={url} src={url} />
        ) : (
          /*
           * Audio, and anything whose type could not be read. There is no
           * audio player on this app yet and inventing one inside a feed card
           * is not the place to add it, so it says what it is rather than
           * showing an empty frame.
           */
          <View
            style={[
              styles.placeholder,
              {
                backgroundColor: theme.glass.field,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons
              color={theme.textGray}
              name={
                mediaKind === "audio"
                  ? "musical-notes-outline"
                  : "image-outline"
              }
              size={28}
            />
            <Text style={[styles.placeholderLabel, { color: theme.textGray }]}>
              {mediaKind === "audio" ? "Audio" : "Media"}
            </Text>
          </View>
        )}

        {title ? (
          <Text style={[styles.caption, { color: theme.text }]}>{title}</Text>
        ) : null}
      </View>
    );
  }

  // A muse, a story, a profile: its picture, large and centred, then its name.
  return (
    <View
      style={[
        styles.target,
        {
          backgroundColor: theme.glass.field,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {mediaKind === "image" && url ? (
        <View style={styles.targetStage}>
          {/*
            The same picture twice: blurred and covering, so the stage is the
            picture's own colours rather than a grey box; then whole and
            centred on top, so nothing the author framed is cropped away.
          */}
          <Image
            blurRadius={30}
            cachePolicy="memory-disk"
            contentFit="cover"
            pointerEvents="none"
            recyclingKey={`${url}#backdrop`}
            // A small copy: it is only ever seen blurred, and blurring the
            // original meant decoding it a second time at full size.
            source={{ uri: wsrvImage(url, BACKDROP) }}
            style={StyleSheet.absoluteFill}
            transition={0}
          />
          <View pointerEvents="none" style={styles.targetVeil} />
          <Image
            cachePolicy="memory-disk"
            contentFit="contain"
            recyclingKey={url}
            source={{ uri: wsrvImage(url, STAGE) }}
            style={styles.targetImage}
            transition={0}
          />
        </View>
      ) : (
        <View style={[styles.targetStage, styles.targetStageEmpty]}>
          <Ionicons color={theme.textGray} name={kind.icon} size={36} />
        </View>
      )}

      <View style={styles.targetCaption}>
        <Ionicons color={theme.textGray} name={kind.icon} size={13} />
        <Text
          numberOfLines={2}
          style={[styles.targetTitle, { color: theme.text }]}
        >
          {/*
            Web draws an empty title as a "new" state with no words at all. A
            card with a picture and no label reads as broken on a phone, so the
            kind is the fallback — "Character", "Story" — which is at least
            true.
          */}
          {title || kind.label}
        </Text>
        <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
      </View>
    </View>
  );
};

/**
 * `activity` comes straight out of the query cache, so its identity is stable
 * between renders and this compares in one pointer check per row.
 */
export const ActivityBox = memo(ActivityBoxView);

/** The prompt card's own, so the two cards' faces line up in one feed. */
/** Web's 36, less the ring drawn round it here. */
const AVATAR = 36;

/** The stage picture, bounded to the screen; and its blurred backdrop. */
const STAGE = { fit: "inside", w: 1080 } as const;
const BACKDROP = { fit: "inside", q: 60, w: 240 } as const;

/** Tall enough for a portrait to read, short enough to keep the feed moving. */
const STAGE_HEIGHT = 200;

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    // The prompt card's rule: the row is the card's bottom edge, pulled in so
    // the target sits on the padding line rather than a row below it.
    marginTop: -space.xs,
  },
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  caption: { fontSize: fontSize.body, lineHeight: 21 },
  /* The prompt card's frame, so the two read as one kind of thing. */
  card: {
    borderRadius: radius.card,
    borderWidth: border.edge,
    gap: space.ms,
    paddingBottom: space.m,
    paddingHorizontal: space.md - 2,
    paddingTop: 18,
  },
  header: { alignItems: "center", flexDirection: "row", gap: space.ms },
  identity: { flex: 1, gap: space.xxs, minWidth: 0 },
  mediaGroup: { gap: space.sm },
  // Web's meta size. Montserrat is wider than the system face this row was
  // measured in, and at 12 "updated a character" no longer fit beside a date.
  meta: { fontSize: fontSize.meta },
  // Wraps: when the verb and the date do not fit beside the kind badge, the
  // date drops to a second line rather than the verb losing its last word.
  metaRow: {
    alignItems: "center",
    columnGap: 5,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaVerb: { flexShrink: 1 },
  metaWhen: { alignItems: "center", columnGap: 5, flexDirection: "row" },
  name: { fontSize: fontSize.body, fontWeight: "600", letterSpacing: -0.14 },
  ring: { borderRadius: radius.full, borderWidth: 1.5, padding: space.xxs },
  placeholder: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.xs,
    height: 120,
    justifyContent: "center",
  },
  placeholderLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  /* A prompt is quoted, not restated: the rule says the words are not the
     activity's own. */
  quote: {
    borderLeftWidth: 2,
    borderRadius: radius.sm,
    paddingHorizontal: space.ms,
    paddingVertical: space.sm,
  },
  target: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    overflow: "hidden",
  },
  targetCaption: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
  },
  targetImage: { height: "100%", width: "100%" },
  targetStage: {
    alignItems: "center",
    height: STAGE_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  targetStageEmpty: { height: 120 },
  targetTitle: { flex: 1, fontSize: fontSize.body, fontWeight: "600" },
  /* Quietens the blurred copy so the whole picture on top is what reads. */
  targetVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  who: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: space.ms,
    minWidth: 0,
  },
});
