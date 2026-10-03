import { Ionicons } from "@expo/vector-icons";
import type { StoryBoardEvent } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { HeartButton } from "@/components/heart-button";
import { ListStatus } from "@/components/list-status";
import { Chip, SettingsGroup, SettingsRow } from "@/components/settings";
import {
  CharacterSheet,
  FaceAvatar,
  type StoryFace,
  useStoryFaces,
} from "@/components/story/character-sheet";
import { StoryProse } from "@/components/story/story-prose";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import {
  useStory,
  useStoryCodex,
  useStoryMaps,
  useStoryTimeline,
} from "@/hooks/use-story";
import { useStoryReaction } from "@/hooks/use-story-reaction";
import { asColor, withAlpha } from "@/lib/color";
import { fandomLabel, plainText, storyAuthors } from "@/lib/story";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A storyboard's front page — web's `/rp/story/:id`, read-only.
 *
 * Top to bottom the way web lays it out: the cover and what the story is,
 * its description, who writes it and who is in it, then the world — Codex,
 * Timelines and Map, each a screen of its own — and the chapters in reading
 * order. Everything that edits the story (chapter overlays, reorder, delete,
 * share, report) is left out. The heart stays: liking is reading, not writing
 * — tapping it toggles the like, tapping its count shows who, as web's
 * engagement row does.
 *
 * The codex, timeline and maps are fetched here as well as on their screens:
 * their counts are what make the three rows worth tapping, and the cache means
 * the screen they open paints at once.
 */

const COVER_WIDTH = 116;
const COVER_SIZE = { fit: "inside" as const, h: 900, w: 600 };
const STORY_COVER_ZOOM_MAX_PCT = 800;

export default function StoryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();

  const story = useStory(storyId);
  const codex = useStoryCodex(storyId);
  const timeline = useStoryTimeline(storyId);
  const maps = useStoryMaps(storyId);

  const data = story.data;
  const faces = useStoryFaces(data?.cast, codex.data?.characters);
  const [openFace, setOpenFace] = useState<StoryFace | null>(null);
  const [likersOpen, setLikersOpen] = useState(false);
  // Before the early return below: a hook cannot wait for the story to load.
  const reaction = useStoryReaction({
    id: storyId ?? null,
    reacted: data?.reacted,
    reactions: data?.reactions,
  });

  const chapters = useMemo(
    () => [...(data?.events ?? [])].sort((a, b) => a.ordinal - b.ordinal),
    [data?.events],
  );
  const authors = useMemo(() => storyAuthors(data), [data]);

  const openChapter = (eventId: string) =>
    router.push({ params: { eventId }, pathname: "/story/chapter/[eventId]" });
  const openNovelist = (username: string) =>
    router.push({ params: { username }, pathname: "/novelist/[username]" });

  // Before the early return, and only for a pull: a refetch of a story opened
  // from the library's cache updates the page without a spinner over it.
  const pull = usePullToRefresh(() =>
    Promise.all([
      story.refetch(),
      codex.refetch(),
      timeline.refetch(),
      maps.refetch(),
    ]),
  );

  if (!data) {
    return (
      <View style={styles.fill}>
        <ListStatus
          empty="This story was deleted, or it is private."
          error={story.error}
          loading={story.isPending}
          onRetry={() => void story.refetch()}
        />
      </View>
    );
  }

  const coverSrc = wsrvImage(data.avatar?.src || data.image, COVER_SIZE);
  const bannerSrc =
    data.image && !data.image.toLowerCase().endsWith(".gif")
      ? wsrvImage(data.image, { fit: "inside", h: 400, w: 400 })
      : null;
  const genres = data.genres ?? [];
  const fandom = data.fandom;
  const entries = codex.data?.entries.length ?? 0;
  const placed =
    timeline.data?.events.filter((event) => event.timelineStart != null)
      .length ?? 0;
  const lanes = timeline.data?.lanes.length ?? 0;
  const mapCount = maps.data?.maps.length ?? 0;
  const pins =
    maps.data?.maps.reduce((sum, map) => sum + map.pins.length, 0) ?? 0;

  return (
    <View style={styles.fill}>
      <Stack.Screen options={{ title: data.name }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}
        refreshControl={
          <RefreshControl
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
      >
        {/* The cover, blurred into a wash behind the hero — web's Banner. */}
        <View style={styles.banner}>
          {bannerSrc ? (
            <Image
              blurRadius={24}
              contentFit="cover"
              source={{ uri: bannerSrc }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <LinearGradient
            colors={[withAlpha(theme.background, 0.35), theme.background]}
            locations={[0, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.hero}>
          <View
            style={[
              styles.cover,
              {
                backgroundColor: theme.material.fillPressed,
                borderColor: theme.material.edge,
              },
            ]}
          >
            {coverSrc ? (
              <CroppedImage
                crop={data.avatar?.crop}
                maxScalePct={STORY_COVER_ZOOM_MAX_PCT}
                style={StyleSheet.absoluteFill}
                uri={coverSrc}
              />
            ) : (
              <FallbackArt
                kind="story"
                seed={data.name}
                style={StyleSheet.absoluteFill}
              />
            )}
          </View>

          <View style={styles.heroInfo}>
            <Chip
              icon={data.isPublic ? "globe-outline" : "lock-closed"}
              label={data.isPublic ? "Public" : "Private"}
              tone={data.isPublic ? "accent" : "neutral"}
            />
            <Text style={[styles.name, { color: theme.text }]}>{data.name}</Text>
            {data.createdBy ? (
              <Pressable
                accessibilityRole="link"
                hitSlop={6}
                onPress={() => openNovelist(data.createdBy!.username)}
              >
                <Text style={[styles.byline, { color: theme.textGray }]}>
                  by{" "}
                  <Text style={{ color: theme.accent.text, fontWeight: "600" }}>
                    @{data.createdBy.username}
                  </Text>
                </Text>
              </Pressable>
            ) : null}
            {fandom?.id ? (
              <View
                style={[
                  styles.fandom,
                  {
                    backgroundColor:
                      fandom.id === "FANDOMLESS"
                        ? "#555"
                        : (asColor(fandom.color) ?? "#555"),
                  },
                ]}
              >
                <Ionicons color="#fff" name="film-outline" size={11} />
                <Text numberOfLines={1} style={styles.fandomLabel}>
                  {fandomLabel(fandom)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {genres.length > 0 ? (
          <View style={styles.genres}>
            {genres.map((genre) => {
              const color = asColor(genre.color) ?? theme.textGray;
              return (
                <View
                  key={genre.id}
                  style={[
                    styles.genre,
                    {
                      backgroundColor: withAlpha(color, 0.18),
                      borderColor: withAlpha(color, 0.4),
                    },
                  ]}
                >
                  <View style={[styles.genreDot, { backgroundColor: color }]} />
                  <Text style={[styles.genreLabel, { color }]}>
                    {genre.label}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.stats}>
          <Stat
            icon="book-outline"
            label={chapters.length === 1 ? "chapter" : "chapters"}
            value={chapters.length}
          />
          <Stat
            icon="people-outline"
            label={authors.length === 1 ? "author" : "authors"}
            value={authors.length}
          />
        </View>

        <View style={styles.actions}>
          <HeartButton
            emptyHint="Be the first to like this story"
            liked={reaction.reacted}
            likes={reaction.reactions}
            onPressCount={
              reaction.reactions > 0 ? () => setLikersOpen(true) : undefined
            }
            onToggle={() => void reaction.toggle()}
          />
        </View>

        <View style={styles.sections}>
          {data.description ? (
            <View
              style={[
                styles.description,
                {
                  backgroundColor: theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <StoryProse html={data.description} />
            </View>
          ) : null}

          {authors.length > 0 ? (
            <SettingsGroup title="Co-authors">
              {authors.map((author) => (
                <Pressable
                  accessibilityRole="link"
                  key={author.username}
                  onPress={() => openNovelist(author.username)}
                  style={({ pressed }) => [
                    styles.personRow,
                    pressed && { backgroundColor: theme.material.fillPressed },
                  ]}
                >
                  <Avatar
                    name={author.username}
                    size={34}
                    uri={author.image}
                    username={author.username}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.personName, { color: theme.text }]}
                  >
                    @{author.username}
                  </Text>
                  <Chip
                    label={
                      author.role === "creator"
                        ? "Author"
                        : author.role === "admin"
                          ? "Admin"
                          : "Co-author"
                    }
                    tone={author.role === "creator" ? "accent" : "neutral"}
                  />
                  <Ionicons
                    color={theme.textGray}
                    name="chevron-forward"
                    size={16}
                  />
                </Pressable>
              ))}
            </SettingsGroup>
          ) : null}

          {faces.length > 0 ? (
            <View style={styles.group}>
              <Text style={[styles.groupTitle, { color: theme.textGray }]}>
                Characters · {faces.length}
              </Text>
              <ScrollView
                contentContainerStyle={styles.faces}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {faces.map((face) => (
                  <Pressable
                    accessibilityLabel={face.name}
                    accessibilityRole="button"
                    key={`${face.refType}-${face.id}`}
                    onPress={() => setOpenFace(face)}
                    style={({ pressed }) => [
                      styles.face,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View
                      style={[
                        styles.faceRing,
                        {
                          borderColor:
                            asColor(face.accent) ?? theme.material.edge,
                        },
                      ]}
                    >
                      <FaceAvatar face={face} size={52} />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[styles.faceName, { color: theme.text }]}
                    >
                      {face.name}
                    </Text>
                    <Text style={[styles.facePool, { color: theme.textGray }]}>
                      {face.refType === "MUSE" ? "Character" : "Story"}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <SettingsGroup title="World">
            <SettingsRow
              icon="library-outline"
              label="Codex"
              onPress={() =>
                router.push({
                  params: { storyId },
                  pathname: "/story/[storyId]/codex",
                })
              }
              subtitle={
                codex.data
                  ? `${faces.length} ${faces.length === 1 ? "character" : "characters"} · ${entries} ${entries === 1 ? "entry" : "entries"}`
                  : "Places, items, lore and the cast"
              }
            />
            <SettingsRow
              icon="git-branch-outline"
              label="Timelines"
              onPress={() =>
                router.push({
                  params: { storyId },
                  pathname: "/story/[storyId]/timeline",
                })
              }
              subtitle={
                timeline.data
                  ? lanes === 0
                    ? "Not mapped yet"
                    : `${lanes} ${lanes === 1 ? "timeline" : "timelines"} · ${placed} of ${chapters.length} chapters placed`
                  : "When the chapters happen"
              }
            />
            <SettingsRow
              icon="map-outline"
              label="Map"
              onPress={() =>
                router.push({
                  params: { storyId },
                  pathname: "/story/[storyId]/map",
                })
              }
              subtitle={
                maps.data
                  ? mapCount === 0
                    ? "No maps yet"
                    : `${mapCount} ${mapCount === 1 ? "map" : "maps"} · ${pins} ${pins === 1 ? "pin" : "pins"}`
                  : "The world, with its places pinned"
              }
            />
          </SettingsGroup>

          <View style={styles.group}>
            <Text style={[styles.groupTitle, { color: theme.textGray }]}>
              {chapters.length === 0 ? "No chapters" : "Chapters"}
            </Text>
            {chapters.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textGray }]}>
                This story hasn't been written yet.
              </Text>
            ) : (
              chapters.map((chapter, index) => (
                <ChapterRow
                  chapter={chapter}
                  key={chapter.id}
                  number={index + 1}
                  onPress={() => chapter.id && openChapter(chapter.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <CharacterSheet
        codex={codex.data}
        face={openFace}
        faces={faces}
        onClose={() => setOpenFace(null)}
        onOpenMuse={(museId) => {
          setOpenFace(null);
          router.push({ params: { museId }, pathname: "/muse/[museId]" });
        }}
      />
      <LikersSheet
        count={reaction.reactions}
        onClose={() => setLikersOpen(false)}
        targetId={likersOpen && storyId ? storyId : null}
      />
    </View>
  );
}

const Stat = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
}) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons color={theme.accent.text} name={icon} size={14} />
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textGray }]}>{label}</Text>
    </View>
  );
};

/** One chapter in reading order — web's `StoryCardEvent`, as a row. */
const ChapterRow = ({
  chapter,
  number,
  onPress,
}: {
  chapter: StoryBoardEvent;
  number: number;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const preview = useMemo(() => plainText(chapter.description), [chapter]);
  const cover = wsrvImage(chapter.avatar?.src || chapter.image, {
    fit: "inside",
    h: 300,
    w: 200,
  });

  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chapter,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <View style={[styles.chapterCover, { backgroundColor: theme.material.fillPressed }]}>
        {cover ? (
          <CroppedImage
            crop={chapter.avatar?.crop}
            maxScalePct={STORY_COVER_ZOOM_MAX_PCT}
            style={StyleSheet.absoluteFill}
            uri={cover}
          />
        ) : (
          <>
            <FallbackArt
              kind="chapter"
              seed={`chapter-${number}`}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.coverEmpty}>
              <Text style={[styles.chapterNumberBig, { color: theme.text }]}>
                {number}
              </Text>
            </View>
          </>
        )}
      </View>
      <View style={styles.chapterText}>
        <Text style={[styles.chapterEyebrow, { color: theme.accent.text }]}>
          Chapter {number}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.chapterName, { color: theme.text }]}
        >
          {chapter.name}
        </Text>
        {preview ? (
          <Text
            numberOfLines={2}
            style={[styles.chapterPreview, { color: theme.textGray }]}
          >
            {preview}
          </Text>
        ) : null}
      </View>
      <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actions: { paddingHorizontal: space.md - 4, paddingTop: space.xs },
  banner: { height: 180, left: 0, position: "absolute", right: 0, top: 0 },
  byline: { fontSize: fontSize.label },
  chapter: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 4,
    padding: space.sm,
    paddingRight: space.sm + 4,
  },
  chapterCover: {
    aspectRatio: 2 / 3,
    borderRadius: radius.md,
    overflow: "hidden",
    width: 52,
  },
  chapterEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  chapterName: { fontSize: fontSize.body, fontWeight: "700" },
  chapterNumberBig: { fontSize: fontSize.title, fontWeight: "700" },
  chapterPreview: { fontSize: fontSize.caption, lineHeight: 16 },
  chapterText: { flex: 1, gap: 2, minWidth: 0 },
  cover: {
    aspectRatio: 2 / 3,
    borderCurve: "continuous",
    borderRadius: radius.md + 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    width: COVER_WIDTH,
  },
  coverEmpty: { alignItems: "center", flex: 1, justifyContent: "center" },
  description: {
    borderRadius: radius.md + 4,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
  },
  empty: { fontSize: fontSize.body, paddingHorizontal: space.xs },
  face: { alignItems: "center", gap: 3, width: 72 },
  faceName: { fontSize: fontSize.caption, fontWeight: "600" },
  facePool: { fontSize: 10 },
  faceRing: { borderRadius: radius.full, borderWidth: 2, padding: 2 },
  faces: { gap: space.sm, paddingHorizontal: space.xs },
  fandom: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 4,
    flexDirection: "row",
    gap: 5,
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  fandomLabel: {
    color: "#fff",
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  fill: { flex: 1 },
  genre: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  genreDot: { borderRadius: 4, height: 7, width: 7 },
  genreLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  group: { gap: space.sm },
  groupTitle: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: space.xs,
    textTransform: "uppercase",
  },
  hero: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.lg,
  },
  heroInfo: { flex: 1, gap: 6, minWidth: 0, paddingBottom: space.xs },
  name: { fontSize: fontSize.h2, fontWeight: "700", lineHeight: 28 },
  personName: { flex: 1, fontSize: fontSize.body, fontWeight: "600" },
  personRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm + 4,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  sections: { gap: space.lg, paddingHorizontal: space.sm + 4, paddingTop: space.lg },
  stat: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statLabel: { fontSize: fontSize.caption },
  statValue: { fontSize: fontSize.label, fontWeight: "700" },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
});
