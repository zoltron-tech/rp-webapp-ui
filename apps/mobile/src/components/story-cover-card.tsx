import { Ionicons } from "@expo/vector-icons";
import type { StoryBoard } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { Text } from "@/components/text";
import { useStoryReaction } from "@/hooks/use-story-reaction";
import { asColor } from "@/lib/color";
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
 * The cover, then what a shelf is read for: the title, where the story comes
 * from, and how it is doing. Web lays the same facts over the cover's corners and
 * adds every genre as a chip. On a two-column phone shelf that was nine items on
 * one tile, over the art that sells the story. The art is left alone now, and the
 * story page holds the rest. A cover carries a mark only when it is private,
 * because public is the normal case on a shelf.
 *
 * The heart toggles the like in place and the number opens who liked it. Both are
 * their own touch targets inside the card, so neither opens the story the card
 * itself leads to.
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

/**
 * Web's `STORY_COVER_ZOOM_MAX` (8×), as the crop stores it. Story covers zoom
 * further than avatars, so `CroppedImage`'s default limit would drop the crop of
 * a tightly framed cover.
 */

/** Bounded, never cropped: the stored crop is against the original's shape. */
const COVER_SIZE = { fit: "inside" as const, h: 900, w: 600 };

/** Radix `--tomato-9`, the heart's fill on web. */

const FANDOMLESS_COLOR = "#555";

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
  const lead = story.createdBy;
  const meta = [fandomLabel, story.genres?.[0]?.label]
    .filter(Boolean)
    .join(" · ");

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

        {story.isPublic ? null : (
          <View
            accessibilityLabel="Private"
            style={[styles.badge, styles.visibility]}
          >
            <Ionicons color="#fff" name="lock-closed" size={wide ? 14 : 12} />
          </View>
        )}
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

        <View style={styles.metaRow}>
          <View style={[styles.metaDot, { backgroundColor: fandomColor }]} />
          <Text
            numberOfLines={1}
            style={[styles.meta, { color: theme.textGray }]}
          >
            {meta}
          </Text>
        </View>

        <View style={styles.stats}>
          <Pressable
            accessibilityLabel={reaction.reacted ? "Remove like" : "Like"}
            accessibilityRole="button"
            accessibilityState={{ selected: reaction.reacted }}
            hitSlop={{ bottom: 12, left: 12, right: 4, top: 12 }}
            onPress={() => void reaction.toggle()}
          >
            <Ionicons
              color={reaction.reacted ? TOMATO : theme.textGray}
              name={reaction.reacted ? "heart" : "heart-outline"}
              size={16}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={`${likes} ${likes === 1 ? "like" : "likes"}${likes > 0 ? ", see who" : ""}`}
            accessibilityRole="button"
            disabled={!onShowLikers || likes === 0 || !story.id}
            hitSlop={{ bottom: 12, left: 4, right: 12, top: 12 }}
            onPress={() => story.id && onShowLikers?.(story.id, likes)}
          >
            <Text style={[styles.count, { color: theme.textGray }]}>
              {likes}
            </Text>
          </Pressable>
          {chapters > 0 ? (
            <View
              accessibilityLabel={`${chapters} ${chapters === 1 ? "chapter" : "chapters"}`}
              style={styles.chapters}
            >
              <Ionicons color={theme.textGray} name="book-outline" size={14} />
              <Text style={[styles.count, { color: theme.textGray }]}>
                {chapters}
              </Text>
            </View>
          ) : null}
          {lead ? (
            <View style={styles.lead}>
              <Avatar name={lead.username} size={20} uri={lead.image} />
            </View>
          ) : null}
        </View>
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
        <View
          style={[
            styles.bar,
            { backgroundColor: theme.material.fillPressed, width: "30%" },
          ]}
        />
      </View>
    </View>
  );
};

/** Chips straight on cover art or video: web's `MEDIA_CHIP`, no blur. */

const styles = StyleSheet.create({
  chapters: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginLeft: space.xs,
  },
  count: { fontSize: fontSize.caption, fontWeight: "600" },
  lead: { marginLeft: "auto" },
  meta: { flex: 1, fontSize: fontSize.caption },
  metaDot: { borderRadius: 4, height: 8, width: 8 },
  metaRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  stats: { alignItems: "center", flexDirection: "row", gap: 4, minHeight: 20 },
  visibility: { right: 8, top: 8 },
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
  bar: { borderRadius: radius.sm, height: 10 },
  card: {
    borderCurve: "continuous",
    borderRadius: radius.card,
    borderWidth: border.edge,
    flex: 1,
    overflow: "hidden",
  },
  cover: { aspectRatio: 2 / 3, overflow: "hidden", width: "100%" },
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
  /** Eleven-point chip type at the wide size: web's caption, 12. */
  // Web's card title: 12/700.
  title: { fontSize: fontSize.caption, fontWeight: "700" },
  titleWide: { fontSize: fontSize.lead },
});
