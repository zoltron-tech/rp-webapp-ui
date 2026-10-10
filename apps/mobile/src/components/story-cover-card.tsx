import { Ionicons } from "@expo/vector-icons";
import type { StoryBoard } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { Text } from "@/components/text";
import { useStoryReaction } from "@/hooks/use-story-reaction";
import { asColor, withAlpha } from "@/lib/color";
import { STORY_COVER_ZOOM_MAX_PCT } from "@/lib/story";
import {
  border,
  fontSize,
  MEDIA_CHIP,
  radius,
  space,
  TOMATO,
  useAppTheme,
} from "@/theme";

/**
 * A story on a shelf — web's `StoryCard` face.
 *
 * Same cover and the same four corners: authors down the top-left, visibility
 * top-right, likes bottom-left, chapters bottom-right. Under it the title, the
 * fandom chip and the genre row.
 *
 * The likes corner is web's `CoverHeartBadge`: the heart toggles the like in
 * place and the number opens who liked it. Both are their own touch targets
 * inside the card, so neither opens the story the card itself leads to.
 *
 * ## Two sizes
 *
 * The card fills whatever cell it is given. On a shelf that is a half of
 * the screen; on the home rail it is six tenths, one story at a time with
 * the next peeking in (see `home/rail-snap.ts`). `wide` is the rail's
 * word for it: the title steps up to body size, the chips and the author
 * faces grow with it, and the genre row's character budget widens so
 * two real chips show before the rest fall back to dots. The shelf stays
 * compact — a title at 15 on a 170pt card is two lines of most names.
 */

/** Web's `MEMBER_STACK_LIMIT`. */
const MEMBER_STACK_LIMIT = 5;

/** Web's `GENRE_CHIP_CHAR_BUDGET`: genres past it shrink to a dot. */
const GENRE_CHIP_CHAR_BUDGET = 14;
/** The wide card has room for about one more chip. */
const GENRE_CHIP_CHAR_BUDGET_WIDE = 22;

/**
 * Web's `STORY_COVER_ZOOM_MAX` (8×), as the crop stores it. Story covers zoom
 * further than avatars, so `CroppedImage`'s default limit would drop the crop of
 * a tightly framed cover.
 */

/** Bounded, never cropped: the stored crop is against the original's shape. */
const COVER_SIZE = { fit: "inside" as const, h: 900, w: 600 };

/** Radix `--tomato-9`, the heart's fill on web. */

const FANDOMLESS_COLOR = "#555";

const scrimColors = [
  "rgba(0,0,0,0.4)",
  "transparent",
  "transparent",
  "rgba(0,0,0,0.55)",
] as const;
const scrimLocations = [0, 0.26, 0.58, 1] as const;

export const StoryCoverCard = memo(function StoryCoverCard({
  onShowLikers,
  story,
  wide = false,
}: {
  /** The count was tapped. Owned by the screen: one sheet, not one per card. */
  onShowLikers?: (storyId: string, count: number) => void;
  story: StoryBoard;
  /** The rail's size; see "Two sizes" above. */
  wide?: boolean;
}) {
  const theme = useAppTheme();
  const budget = wide ? GENRE_CHIP_CHAR_BUDGET_WIDE : GENRE_CHIP_CHAR_BUDGET;

  // Author first, then co-authors without the author repeated.
  const members = useMemo(() => {
    const creator = story.createdBy;
    return [
      ...(creator
        ? [{ image: creator.image, username: creator.username }]
        : []),
      ...(story.members ?? [])
        .filter((member) => member.username !== creator?.username)
        .map((member) => ({ image: member.image, username: member.username })),
    ];
  }, [story.createdBy, story.members]);

  const genres = story.genres ?? [];
  const { genreChips, genreDots } = useMemo(() => {
    const chips: typeof genres = [];
    const dots: typeof genres = [];
    let usedChars = 0;
    genres.forEach((genre, index) => {
      if (index === 0 || usedChars + genre.label.length <= budget) {
        chips.push(genre);
        usedChars += genre.label.length;
      } else {
        dots.push(genre);
      }
    });
    return { genreChips: chips, genreDots: dots };
  }, [budget, genres]);

  const fandom = story.fandom ?? null;
  const isFandomless = !fandom?.id || fandom.id === "FANDOMLESS";
  const fandomLabel = isFandomless
    ? "Original"
    : fandom?.name || fandom?.id?.replace(/_/g, " ");
  const fandomColor = isFandomless
    ? FANDOMLESS_COLOR
    : (asColor(fandom?.color) ?? FANDOMLESS_COLOR);

  const chapters = story.events?.length ?? 0;
  const reaction = useStoryReaction(story);
  const likes = reaction.reactions;
  const stackMembers = members.slice(0, MEMBER_STACK_LIMIT);
  const memberOverflow = members.length - stackMembers.length;

  const coverSrc = wsrvImage(story.avatar?.src || story.image, COVER_SIZE);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <View
        style={[styles.cover, { backgroundColor: theme.material.fillPressed }]}
      >
        {coverSrc ? (
          <CroppedImage
            crop={story.avatar?.crop}
            maxScalePct={STORY_COVER_ZOOM_MAX_PCT}
            style={StyleSheet.absoluteFill}
            uri={coverSrc}
          />
        ) : (
          <FallbackArt
            kind="story"
            seed={story.name}
            style={StyleSheet.absoluteFill}
          />
        )}

        <LinearGradient
          colors={scrimColors}
          locations={scrimLocations}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />

        {stackMembers.length > 0 ? (
          <View style={styles.authors}>
            {stackMembers.map((member, index) => (
              <View
                key={member.username}
                style={[styles.author, index > 0 && styles.authorOverlap]}
              >
                <Avatar
                  name={member.username}
                  size={wide ? 30 : 24}
                  uri={member.image}
                />
              </View>
            ))}
            {memberOverflow > 0 ? (
              <View
                style={[
                  styles.author,
                  styles.authorOverlap,
                  styles.overflow,
                  wide && styles.overflowWide,
                ]}
              >
                <Text style={[styles.overflowLabel, wide && styles.metaWide]}>
                  +{memberOverflow}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View
          style={[
            styles.badge,
            styles.visibility,
            wide && styles.badgeWide,
            story.isPublic && { backgroundColor: theme.accent.solid },
          ]}
        >
          <Ionicons
            color="#fff"
            name={story.isPublic ? "globe-outline" : "lock-closed"}
            size={wide ? 12 : 10}
          />
          <Text style={[styles.badgeLabel, wide && styles.metaWide]}>
            {story.isPublic ? "Public" : "Private"}
          </Text>
        </View>

        <View style={[styles.badge, styles.likes, wide && styles.badgeWide]}>
          <Pressable
            accessibilityLabel={reaction.reacted ? "Remove like" : "Like"}
            accessibilityRole="button"
            accessibilityState={{ selected: reaction.reacted }}
            hitSlop={{ bottom: 8, left: 8, right: 4, top: 8 }}
            onPress={() => void reaction.toggle()}
          >
            <Ionicons
              color={reaction.reacted ? TOMATO : "#fff"}
              name={reaction.reacted ? "heart" : "heart-outline"}
              size={wide ? 16 : 13}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={`${likes} ${likes === 1 ? "like" : "likes"}${likes > 0 ? ", show who" : ""}`}
            accessibilityRole="button"
            disabled={!onShowLikers || likes === 0 || !story.id}
            hitSlop={{ bottom: 8, left: 4, right: 8, top: 8 }}
            onPress={() => story.id && onShowLikers?.(story.id, likes)}
          >
            <Text style={[styles.count, wide && styles.metaWide]}>{likes}</Text>
          </Pressable>
        </View>

        {chapters > 0 ? (
          <View
            accessibilityLabel={`${chapters} ${chapters === 1 ? "chapter" : "chapters"}`}
            style={[styles.badge, styles.chapters, wide && styles.badgeWide]}
          >
            <Ionicons
              color={theme.accent.solid}
              name="book-outline"
              size={wide ? 13 : 11}
            />
            <Text style={[styles.count, wide && styles.metaWide]}>
              {chapters}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.info, wide && styles.infoWide]}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            wide && styles.titleWide,
            { color: theme.text },
          ]}
        >
          {story.name}
        </Text>

        <View
          style={[
            styles.fandom,
            wide && styles.fandomWide,
            { backgroundColor: fandomColor },
          ]}
        >
          <View style={styles.fandomDot} />
          <Text
            numberOfLines={1}
            style={[styles.fandomLabel, wide && styles.metaWide]}
          >
            {fandomLabel}
          </Text>
        </View>

        {genres.length > 0 ? (
          <View style={styles.genres}>
            {genreChips.map((genre) => {
              const color = asColor(genre.color) ?? theme.textGray;
              return (
                <View
                  key={genre.id}
                  style={[
                    styles.genre,
                    wide && styles.genreWide,
                    {
                      backgroundColor: withAlpha(color, 0.18),
                      borderColor: withAlpha(color, 0.4),
                    },
                  ]}
                >
                  <View style={[styles.genreDot, { backgroundColor: color }]} />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.genreLabel,
                      wide && styles.metaWide,
                      { color },
                    ]}
                  >
                    {genre.label}
                  </Text>
                </View>
              );
            })}
            {genreDots.map((genre) => (
              <View
                accessibilityLabel={genre.label}
                key={genre.id}
                style={[
                  styles.genreOnlyDot,
                  { backgroundColor: asColor(genre.color) ?? theme.textGray },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
});

/** The card's outline while the first page loads. */
export const StoryCoverCardShimmer = ({ wide = false }: { wide?: boolean }) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <View
        style={[styles.cover, { backgroundColor: theme.material.fillPressed }]}
      />
      <View style={[styles.info, wide && styles.infoWide]}>
        <View
          style={[
            styles.bar,
            { backgroundColor: theme.material.fillPressed, width: "80%" },
          ]}
        />
        <View
          style={[
            styles.bar,
            { backgroundColor: theme.material.fillPressed, width: "45%" },
          ]}
        />
      </View>
    </View>
  );
};

/** Chips straight on cover art or video: web's `MEDIA_CHIP`, no blur. */

const styles = StyleSheet.create({
  author: {
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: radius.full,
    borderWidth: 2,
  },
  authorOverlap: { marginTop: -6 },
  authors: { alignItems: "center", left: 8, position: "absolute", top: 8 },
  badge: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
    position: "absolute",
  },
  badgeLabel: {
    color: "#fff",
    fontSize: fontSize.meta,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  /** The wide card's chips: a step more padding round a step more type. */
  badgeWide: { gap: 5, paddingHorizontal: 9, paddingVertical: 4 },
  bar: { borderRadius: radius.sm, height: 10 },
  card: {
    borderCurve: "continuous",
    borderRadius: radius.card,
    borderWidth: border.edge,
    flex: 1,
    overflow: "hidden",
  },
  chapters: { bottom: 8, right: 8 },
  count: { color: "#fff", fontSize: fontSize.meta, fontWeight: "600" },
  cover: { aspectRatio: 2 / 3, overflow: "hidden", width: "100%" },
  emptyCover: { alignItems: "center", flex: 1, justifyContent: "center" },
  fandom: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.xs,
    flexDirection: "row",
    gap: 5,
    maxWidth: "100%",
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 3,
  },
  fandomDot: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  fandomLabel: {
    color: "#fff",
    flexShrink: 1,
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  fandomWide: { paddingLeft: 9, paddingRight: 11, paddingVertical: 4 },
  genre: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 1,
    gap: space.xs,
    paddingHorizontal: 7,
    paddingVertical: space.xxs,
  },
  genreDot: { borderRadius: 3, height: 6, width: 6 },
  genreLabel: { flexShrink: 1, fontSize: fontSize.meta, fontWeight: "600" },
  genreOnlyDot: { borderRadius: radius.xs, height: 8, width: 8 },
  genres: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    overflow: "hidden",
  },
  genreWide: { paddingHorizontal: 9, paddingVertical: 3 },
  info: {
    gap: 7,
    paddingBottom: space.m,
    paddingHorizontal: space.ms,
    paddingTop: space.ms,
  },
  infoWide: {
    gap: 9,
    paddingBottom: space.md,
    paddingHorizontal: space.m,
    paddingTop: space.m,
  },
  likes: { bottom: 8, left: 8 },
  /** Eleven-point chip type at the wide size: web's caption, 12. */
  metaWide: { fontSize: fontSize.caption },
  overflow: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  overflowLabel: { color: "#fff", fontSize: fontSize.meta, fontWeight: "600" },
  overflowWide: { height: 30, width: 30 },
  // Web's card title: 12/700.
  title: { fontSize: fontSize.caption, fontWeight: "700" },
  titleWide: { fontSize: fontSize.lead },
  visibility: { right: 8, top: 8 },
});
