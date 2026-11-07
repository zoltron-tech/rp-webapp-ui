import { Ionicons } from "@expo/vector-icons";
import { getNovelist } from "@nw/api/endpoints/novelists";
import { deleteStoryBoardEvent } from "@nw/api/endpoints/story";
import { report } from "@nw/api/endpoints/thread";
import { queryKeys, useApi, useSession } from "@nw/features";
import {
  API_MESSAGE,
  PLACEHOLDER_LABELS,
  type StoryBoard,
  type StoryBoardEvent,
} from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { wsrvImage } from "@nw/utils";
import { Image } from "@/components/image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionMenu } from "@/components/action-menu";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { HeartButton } from "@/components/heart-button";
import { IconButton } from "@/components/icon-button";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import {
  Chip,
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { ChapterEditor } from "@/components/story/chapter-editor";
import {
  CharacterSheet,
  FaceAvatar,
  type StoryFace,
  useStoryFaces,
} from "@/components/story/character-sheet";
import { ShareStorySheet } from "@/components/share/share-story-sheet";
import { ReorderChaptersSheet } from "@/components/story/reorder-chapters-sheet";
import { StoryEditor } from "@/components/story/story-editor";
import { StoryMembersSheet } from "@/components/story/story-members-sheet";
import { StoryProse } from "@/components/story/story-prose";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import {
  useStory,
  useStoryCodex,
  useStoryMaps,
  useStoryTimeline,
} from "@/hooks/use-story";
import { useStoryWrite } from "@/hooks/use-story-edit";
import { useStoryReaction } from "@/hooks/use-story-reaction";
import { asColor, withAlpha } from "@/lib/color";
import { alertReportSent } from "@/lib/report";
import {
  fandomLabel,
  isStoryMember,
  plainText,
  STORY_COVER_ZOOM_MAX_PCT,
  storyAuthors,
} from "@/lib/story";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * A storyboard's front page — web's `/rp/story/:id`.
 *
 * Top to bottom the way web lays it out: the cover and what the story is,
 * its description, who writes it and who is in it, then the world — Codex,
 * Timelines and Map, each a screen of its own — and the chapters in reading
 * order. The heart is for everyone: tapping it toggles the like, tapping its
 * count shows who, as web's engagement row does.
 *
 * ## The story itself
 *
 * Web's `⋯` in the header, with web's rows: a member gets **Edit story** and
 * **Members**, its author **Delete story** as well; anyone else **Report**.
 * Edit opens the story editor over this page — the same form a new story is
 * made in from the stories shelf — and a save is written into the cache this
 * page draws from, so the hero changes without a refetch. Delete leaves the
 * page, since there is nothing left to show.
 *
 * ## Chapters, for a co-author
 *
 * The story's creator and its members (web's `isMember`) manage the chapters
 * from the Chapters section, as on web: add one — while the story is under
 * its creator's tier limit, which the heading counts against — reorder them,
 * and edit or delete any from the menu on its row. Web opens a preview of a
 * chapter with edit and delete in its corner; here the row opens the chapter
 * and the menu is the row's own button, so reading stays one tap.
 *
 * The codex, timeline and maps are fetched here as well as on their screens:
 * their counts are what make the three rows worth tapping, and the cache means
 * the screen they open paints at once.
 */

const COVER_WIDTH = 116;
const COVER_SIZE = { fit: "inside" as const, h: 900, w: 600 };

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
  const [sharing, setSharing] = useState(false);
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

  const api = useApi();
  const queryClient = useQueryClient();
  const { novelist, status } = useSession();
  const canWrite =
    status === "signed-in" && isStoryMember(data, novelist?.username);

  /*
   * How many chapters the story may hold is its creator's tier, whoever is
   * writing: the viewer's own when they created it, otherwise read off the
   * creator's profile — web's `creatorEventLimit`.
   */
  const creator = data?.createdBy?.username;
  const ownStory = Boolean(creator) && creator === novelist?.username;
  const creatorProfile = useQuery({
    enabled: canWrite && !ownStory && Boolean(creator),
    queryFn: async () => {
      const result = await getNovelist(api, creator as string);
      return result && !("message" in result) ? result : null;
    },
    queryKey: ["story-creator-tier", creator],
    staleTime: 5 * 60 * 1000,
  });
  const chapterLimit = ownStory
    ? (novelist?.tier?.eventLimit ?? null)
    : (creatorProfile.data?.tier?.eventLimit ?? null);
  const canAddChapter =
    canWrite && chapterLimit != null && chapters.length < chapterLimit;

  /** The chapter form: closed, a new chapter (`chapter: null`), or an edit. */
  const [editing, setEditing] = useState<{
    chapter: StoryBoardEvent | null;
  } | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  /** Kept after the menu closes: the chosen item runs once the sheet is gone. */
  const [menuFor, setMenuFor] = useState<StoryBoardEvent | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  /** The header's `⋯`, and what it opens. */
  const [storyMenu, setStoryMenu] = useState(false);
  const [editingStory, setEditingStory] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const write = useStoryWrite();

  /** The story's chapters, rewritten in the cache the page draws from. */
  const setChapters = useCallback(
    (update: (events: StoryBoardEvent[]) => StoryBoardEvent[]) => {
      if (!storyId) return;
      queryClient.setQueryData<StoryBoard | null>(
        queryKeys.story(storyId),
        (current) =>
          current ? { ...current, events: update(current.events) } : current,
      );
      // The timeline lists every chapter too, placed or not.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.storyTimeline(storyId),
      });
    },
    [queryClient, storyId],
  );

  const onChapterSaved = useCallback(
    (saved: StoryBoardEvent) => {
      setChapters((events) =>
        events.some((event) => event.id === saved.id)
          ? events.map((event) => (event.id === saved.id ? saved : event))
          : [...events, saved],
      );
      if (saved.id) {
        queryClient.setQueryData(queryKeys.storyChapter(saved.id), saved);
      }
    },
    [queryClient, setChapters],
  );

  const confirmDelete = useCallback(
    (chapter: StoryBoardEvent) => {
      const id = chapter.id;
      if (!id) return;
      Alert.alert(
        `Delete ${chapter.name}?`,
        "This permanently removes the chapter and all of its passages.",
        [
          { style: "cancel", text: "Cancel" },
          {
            onPress: async () => {
              const result = await deleteStoryBoardEvent(api, id).catch(
                () => ({ message: API_MESSAGE.Error }),
              );
              if (result.message !== API_MESSAGE.Success) {
                Alert.alert(
                  "Could not delete",
                  "The chapter was not deleted. Please try again.",
                );
                return;
              }
              setChapters((events) =>
                events.filter((event) => event.id !== id),
              );
            },
            style: "destructive",
            text: "Delete",
          },
        ],
      );
    },
    [api, setChapters],
  );
  const authors = useMemo(() => storyAuthors(data), [data]);

  const confirmDeleteStory = useCallback(() => {
    if (!storyId || !data) return;
    Alert.alert(
      `Delete ${data.name}?`,
      "This permanently removes the story, its chapters and all threads. Are you sure?",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const ok = await write.deleteStory(storyId);
            if (!ok) {
              Alert.alert(
                "Could not delete",
                "The story was not deleted. Please try again.",
              );
              return;
            }
            router.back();
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  }, [data, router, storyId, write]);

  const confirmReportStory = useCallback(() => {
    if (!storyId) return;
    Alert.alert(
      "Report this story?",
      "We strive to maintain a safe and welcoming community. If you notice any misconduct, please report it. Our team will review the issue and take appropriate action as quickly as possible.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const result = await report(api, storyId, "", "STORY_BOARD").catch(
              () => ({ message: API_MESSAGE.Error }),
            );
            if (result.message === API_MESSAGE.Success) {
              alertReportSent();
            } else {
              Alert.alert(
                "Could not report",
                "The report was not sent. Please try again.",
              );
            }
          },
          style: "destructive",
          text: "Report",
        },
      ],
    );
  }, [api, storyId]);

  const openChapter = (eventId: string) =>
    router.push({ params: { eventId }, pathname: "/story/chapter/[eventId]" });
  const openNovelist = (username: string) => {
    // A disabled author or co-author has no handle and no profile.
    if (!username) return;
    router.push({ params: { username }, pathname: "/novelist/[username]" });
  };

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
          empty={
            <EmptyScene
              aside="(Or it is private, or the link is wrong. Stories do love an unreliable narrator.)"
              scene="blank-storyboard"
              subtitle="No cliffhanger, no epilogue, not even a sequel hook. The author shut the book and took the whole shelf along."
              title="This story reached The End early"
            />
          }
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
      <Stack.Screen
        options={{
          headerRight:
            status === "signed-in"
              ? () => (
                  <Pressable
                    accessibilityLabel="Story options"
                    accessibilityRole="button"
                    hitSlop={space.sm}
                    onPress={() => setStoryMenu(true)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.6 : 1,
                      paddingHorizontal: space.md,
                    })}
                  >
                    <Ionicons
                      color={theme.text}
                      name="ellipsis-horizontal"
                      size={22}
                    />
                  </Pressable>
                )
              : undefined,
          title: data.name,
        }}
      />
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
                    {data.createdBy.isPlaceholder
                      ? PLACEHOLDER_LABELS.NOVELIST
                      : `@${data.createdBy.username}`}
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
          {/* Web's share, from its engagement row: the community tray. */}
          <IconButton
            accessibilityLabel="Share story"
            icon="share-social-outline"
            onPress={() => setSharing(true)}
            tone="material"
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
              {authors.map((author, index) => (
                <Pressable
                  accessibilityRole={author.isPlaceholder ? "text" : "link"}
                  disabled={author.isPlaceholder}
                  key={
                    author.isPlaceholder
                      ? `placeholder-${index}`
                      : author.username
                  }
                  onPress={() => openNovelist(author.username)}
                  style={({ pressed }) => [
                    styles.personRow,
                    pressed && { backgroundColor: theme.material.fillPressed },
                  ]}
                >
                  <Avatar
                    name={
                      author.isPlaceholder
                        ? PLACEHOLDER_LABELS.NOVELIST
                        : author.username
                    }
                    size={34}
                    uri={author.image}
                    username={
                      author.isPlaceholder ? undefined : author.username
                    }
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.personName, { color: theme.text }]}
                  >
                    {author.isPlaceholder
                      ? PLACEHOLDER_LABELS.NOVELIST
                      : `@${author.username}`}
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
            {canWrite ? (
              <SettingsRow
                icon="document-text-outline"
                label="Notes"
                onPress={() =>
                  router.push({
                    params: { storyId },
                    pathname: "/story/[storyId]/notes",
                  })
                }
                subtitle="A shared corkboard for the co-authors"
              />
            ) : null}
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
              icon="people-outline"
              label="Relationships"
              onPress={() =>
                router.push({
                  params: { storyId },
                  pathname: "/story/[storyId]/relationships",
                })
              }
              subtitle={
                codex.data
                  ? codex.data.relationships.length === 0
                    ? "Not mapped yet"
                    : `${codex.data.relationships.length} ${codex.data.relationships.length === 1 ? "relationship" : "relationships"} · ${(codex.data.groups ?? []).length} ${(codex.data.groups ?? []).length === 1 ? "group" : "groups"}`
                  : "How the characters stand toward each other"
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
              {canWrite && chapterLimit != null
                ? ` (${chapters.length} / ${chapterLimit})`
                : ""}
            </Text>
            {canWrite && (canAddChapter || chapters.length > 1) ? (
              <View style={styles.chapterActions}>
                {canAddChapter ? (
                  <PillButton
                    icon="add"
                    label="Add chapter"
                    onPress={() => setEditing({ chapter: null })}
                    tone="accent"
                  />
                ) : null}
                {chapters.length > 1 ? (
                  <PillButton
                    icon="swap-vertical"
                    label="Reorder"
                    onPress={() => setReorderOpen(true)}
                  />
                ) : null}
              </View>
            ) : null}
            {chapters.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textGray }]}>
                {canWrite
                  ? "No chapters yet. Add the first one and the story begins."
                  : "This story hasn't been written yet."}
              </Text>
            ) : (
              chapters.map((chapter, index) => (
                <ChapterRow
                  chapter={chapter}
                  key={chapter.id}
                  number={index + 1}
                  onMenu={
                    canWrite
                      ? () => {
                          setMenuFor(chapter);
                          setMenuVisible(true);
                        }
                      : undefined
                  }
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

      <ShareStorySheet
        onClose={() => setSharing(false)}
        story={data}
        visible={sharing}
      />

      <ActionMenu
        items={[
          {
            icon: "create-outline",
            label: "Edit chapter",
            onSelect: () => {
              if (menuFor) setEditing({ chapter: menuFor });
            },
          },
          { separator: true },
          {
            icon: "trash-outline",
            label: "Delete chapter",
            onSelect: () => {
              if (menuFor) confirmDelete(menuFor);
            },
            variant: "danger",
          },
        ]}
        onClose={() => setMenuVisible(false)}
        subtitle={menuFor?.name}
        title="Chapter"
        visible={menuVisible}
      />

      <ActionMenu
        items={
          canWrite
            ? [
                {
                  icon: "create-outline",
                  label: "Edit story",
                  onSelect: () => setEditingStory(true),
                },
                {
                  hint: `${data.members.length} ${data.members.length === 1 ? "member" : "members"}`,
                  icon: "people-outline",
                  label: "Members",
                  onSelect: () => setMembersOpen(true),
                },
                ...(ownStory
                  ? [
                      { separator: true },
                      {
                        icon: "trash-outline" as const,
                        label: "Delete story",
                        onSelect: confirmDeleteStory,
                        variant: "danger" as const,
                      },
                    ]
                  : []),
              ]
            : [
                {
                  icon: "flag-outline",
                  label: "Report story",
                  onSelect: confirmReportStory,
                  variant: "danger",
                },
              ]
        }
        onClose={() => setStoryMenu(false)}
        subtitle={data.name}
        title="Story"
        visible={storyMenu}
      />

      {storyId ? (
        <StoryMembersSheet
          creatorUsername={data.createdBy?.username}
          members={data.members}
          onClose={() => setMembersOpen(false)}
          onMembersChange={(members) => write.setMembers(storyId, members)}
          storyId={storyId}
          visible={membersOpen}
        />
      ) : null}

      {editingStory ? (
        <StoryEditor
          onClose={() => setEditingStory(false)}
          onDeleted={() => router.back()}
          onSaved={() => undefined}
          story={data}
        />
      ) : null}

      <ReorderChaptersSheet
        chapters={chapters}
        onClose={() => setReorderOpen(false)}
        onReordered={(events) => setChapters(() => events)}
        storyId={storyId}
        visible={reorderOpen}
      />

      {editing ? (
        <ChapterEditor
          chapter={editing.chapter}
          onClose={() => setEditing(null)}
          onSaved={onChapterSaved}
          storyId={storyId}
        />
      ) : null}
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
  onMenu,
  onPress,
}: {
  chapter: StoryBoardEvent;
  number: number;
  /** Given to a co-author: opens this chapter's edit and delete. */
  onMenu?: () => void;
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
      {onMenu ? (
        <IconButton
          accessibilityLabel={`Options for ${chapter.name}`}
          hitSlop={space.sm}
          icon="ellipsis-horizontal"
          iconSize={16}
          onPress={onMenu}
          size={32}
          tone="quiet"
        />
      ) : (
        <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.m,
    paddingTop: space.xs,
  },
  banner: { height: 180, left: 0, position: "absolute", right: 0, top: 0 },
  byline: { fontSize: fontSize.label },
  chapter: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    padding: space.sm,
    paddingRight: space.m,
  },
  chapterActions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  chapterCover: {
    aspectRatio: 2 / 3,
    borderRadius: radius.md,
    overflow: "hidden",
    width: 52,
  },
  chapterEyebrow: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  chapterName: { fontSize: fontSize.body, fontWeight: "700" },
  chapterNumberBig: { fontSize: fontSize.title, fontWeight: "700" },
  chapterPreview: { fontSize: fontSize.caption, lineHeight: 16 },
  chapterText: { flex: 1, gap: space.xxs, minWidth: 0 },
  cover: {
    aspectRatio: 2 / 3,
    borderCurve: "continuous",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    overflow: "hidden",
    width: COVER_WIDTH,
  },
  coverEmpty: { alignItems: "center", flex: 1, justifyContent: "center" },
  description: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    padding: space.md,
  },
  empty: { fontSize: fontSize.body, paddingHorizontal: space.xs },
  face: { alignItems: "center", gap: 3, width: 72 },
  faceName: { fontSize: fontSize.caption, fontWeight: "600" },
  facePool: { fontSize: fontSize.meta },
  faceRing: { borderRadius: radius.full, borderWidth: 2, padding: space.xxs },
  faces: { gap: space.sm, paddingHorizontal: space.xs },
  fandom: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.xs,
    flexDirection: "row",
    gap: 5,
    maxWidth: "100%",
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  fandomLabel: {
    color: "#fff",
    flexShrink: 1,
    fontSize: fontSize.meta,
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
  genreDot: { borderRadius: radius.xs, height: 7, width: 7 },
  genreLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.s,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  group: { gap: space.sm },
  groupTitle: {
    ...type.eyebrow,
    paddingHorizontal: space.xs,
  },
  hero: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.lg,
  },
  heroInfo: { flex: 1, gap: space.s, minWidth: 0, paddingBottom: space.xs },
  name: { fontSize: fontSize.h2, fontWeight: "700", lineHeight: 28 },
  personName: { flex: 1, fontSize: fontSize.body, fontWeight: "600" },
  personRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  sections: { gap: space.lg, paddingHorizontal: space.m, paddingTop: space.lg },
  stat: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: space.ms,
    paddingVertical: 5,
  },
  statLabel: { fontSize: fontSize.caption },
  statValue: { fontSize: fontSize.label, fontWeight: "700" },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.s,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
});
