import { Ionicons } from "@expo/vector-icons";
import { deleteStoryBoardEventThread } from "@nw/api/endpoints/story";
import { queryKeys, useApi, useSession } from "@nw/features";
import {
  API_MESSAGE,
  type StoryBoardEvent,
  type StoryBoardEventThread,
} from "@nw/types";
import { toFormattedDate, wsrvImage } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionMenu } from "@/components/action-menu";
import { ComposeTrigger } from "@/components/compose/compose-trigger";
import { CroppedImage } from "@/components/cropped-image";
import { GlassSurface } from "@/components/glass-surface";
import { IconButton } from "@/components/icon-button";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import { ProfileSongPill } from "@/components/profile-song";
import { PillButton } from "@/components/settings";
import { SoundCuesSheet } from "@/components/story/sound-cue-sheets";
import { useChapterBookmark } from "@/hooks/use-bookmarks";
import { useSoundscape } from "@/hooks/use-soundscape";
import { ShareChapterSheet } from "@/components/share/share-story-sheet";
import { Asterism } from "@/components/story/asterism";
import { PassageComposer } from "@/components/story/passage-composer";
import { StoryProse } from "@/components/story/story-prose";
import {
  useChapterSoundscape,
  useStory,
  useStoryChapter,
  useStoryChapterThreads,
  useStoryCharacters,
} from "@/hooks/use-story";
import {
  isStoryMember,
  STORY_COVER_ZOOM_MAX_PCT,
  storyClock,
  storyDate,
} from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A chapter, read — web's `/rp/story/event/:id` in its scrolling manuscript
 * mode.
 *
 * The title page (cover, "Chapter", the name, when and where), the overture
 * divider and the chapter's own description, then every passage in order with
 * the author's passage divider between them. Passages are fetched ten at a
 * time as the reader nears the end, and each renders its characters' dialog
 * lines in the design its author chose.
 *
 * Web's book mode is a two-page desktop spread and does not come across. The
 * chapter's featured song stays — it is part of reading it. At the foot, the
 * previous and next chapters, so a story can be read end to end without going
 * back to its page.
 *
 * ## Sound
 *
 * A chapter with cues offers a Sound button, off until pressed. The passage at
 * the top of the screen is the reader's position, which is what the cues are
 * ranges over (`use-soundscape.ts`). A story member also gets the cue sheet.
 *
 * ## Bookmarks
 *
 * Each passage has a bookmark beside its byline. The saved passage shows filled
 * and a button floats over the page to go back to it. `t` on the route opens at
 * a passage, which is how a bookmark card comes back: the pages up to it are
 * loaded first, because a passage that has not been fetched has nowhere to
 * scroll to.
 *
 * ## Writing
 *
 * A co-author — the story's creator or one of its members, web's `isMember` —
 * gets the "Add to passage" bar docked at the foot of the screen, and a menu
 * on every passage to edit or delete it. Web sets its composer into the last
 * page of the chapter, which on a phone is however far down the chapter
 * runs; the bar is where the thumb is from the first line to the last. Both
 * open `PassageComposer`. A new passage lands at the end of the chapter, so
 * the reader is taken there once it is in.
 */

/** The dock's rotating invitations; the first is web's own placeholder. */
const PASSAGE_PLACEHOLDERS = [
  "✍️ Continue the story…",
  "📖 Add to this chapter…",
  "🎭 What happens next?",
];

export default function ChapterScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId, t } = useLocalSearchParams<{
    eventId: string;
    t?: string;
  }>();

  const chapter = useStoryChapter(eventId);
  const event = chapter.data;
  const story = useStory(event?.storyBoardId);
  const threads = useStoryChapterThreads(eventId);

  const api = useApi();
  const queryClient = useQueryClient();
  const { novelist, status } = useSession();
  const canWrite =
    status === "signed-in" && isStoryMember(story.data, novelist?.username);
  // The story's own characters speak in dialogs; only a writer needs them.
  const characters = useStoryCharacters(
    canWrite ? event?.storyBoardId : undefined,
  );

  const list = useRef<FlatList<StoryBoardEventThread>>(null);
  const soundscapeData = useChapterSoundscape(eventId);
  const soundCues = useMemo(
    () => soundscapeData.data?.cues ?? [],
    [soundscapeData.data?.cues],
  );
  const [topPassage, setTopPassage] = useState(0);
  const soundscape = useSoundscape({ cues: soundCues, position: topPassage });
  const [cueSheet, setCueSheet] = useState(false);
  // Stable for the list's life: it refuses a changed one.
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0]?.index;
      if (typeof first === "number") setTopPassage(first);
    },
  ).current;
  /** Whether the last ask was for a passage not measured yet. */
  const walking = useRef(false);
  const bookmark = useChapterBookmark(eventId);
  /** A passage to go to, once it has been loaded. */
  const [seekTo, setSeekTo] = useState<number | null>(() => {
    const index = t === undefined ? Number.NaN : Number(t);
    return Number.isInteger(index) && index >= 0 ? index : null;
  });
  const [dockHeight, setDockHeight] = useState(0);
  /** The composer: closed, a new passage (`thread: null`), or an edit. */
  const [composing, setComposing] = useState<{
    thread: StoryBoardEventThread | null;
  } | null>(null);
  /**
   * The passage whose menu it is. Kept after the menu closes: the chosen item
   * runs once the sheet has gone, and still needs to know which passage.
   */
  const [menuFor, setMenuFor] = useState<StoryBoardEventThread | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sharing, setSharing] = useState(false);
  const openMenu = useCallback((thread: StoryBoardEventThread) => {
    setMenuFor(thread);
    setMenuVisible(true);
  }, []);
  /** Set after a new passage: load to the chapter's end, then go there. */
  const [seekingEnd, setSeekingEnd] = useState(false);

  const passages = useMemo(
    () => (threads.data?.pages ?? []).flatMap((page) => page.threads),
    [threads.data],
  );
  const total = threads.data?.pages[0]?.totalCount ?? 0;

  const ordered = useMemo(
    () =>
      [...(story.data?.events ?? [])].sort((a, b) => a.ordinal - b.ordinal),
    [story.data?.events],
  );
  const position = ordered.findIndex((candidate) => candidate.id === eventId);
  const previous = position > 0 ? ordered[position - 1] : null;
  const next =
    position >= 0 && position < ordered.length - 1
      ? ordered[position + 1]
      : null;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = threads;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const refreshPassages = useCallback(async () => {
    // The cast is derived from the dialogs in the story's passages.
    if (event?.storyBoardId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.story(event.storyBoardId),
      });
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.storyChapterThreads(eventId),
    });
  }, [event?.storyBoardId, eventId, queryClient]);

  const onSaved = useCallback(
    (created: boolean) => {
      void refreshPassages().then(() => {
        if (created) setSeekingEnd(true);
      });
    },
    [refreshPassages],
  );

  const { isFetching } = threads;

  /**
   * Goes to a passage, by way of those before it.
   *
   * Passages are as tall as they are, so the list can only go to one it has
   * measured, and it measures the ones it renders. A far passage is reached by
   * going to the furthest one measured, which renders more, and asking again.
   * The last ask is repeated once for what moved as the final page laid out.
   */
  const scrollToPassage = useCallback(
    (index: number, settled = false): void => {
      walking.current = false;
      list.current?.scrollToIndex({ animated: false, index, viewPosition: 0 });
      if (walking.current) {
        setTimeout(() => scrollToPassage(index), SEEK_STEP_MS);
      } else if (!settled) {
        setTimeout(() => scrollToPassage(index, true), SEEK_SETTLE_MS);
      }
    },
    [],
  );

  const onScrollToIndexFailed = useCallback(
    (info: { highestMeasuredFrameIndex: number }) => {
      walking.current = true;
      list.current?.scrollToIndex({
        animated: false,
        index: Math.max(0, info.highestMeasuredFrameIndex),
        viewPosition: 0,
      });
    },
    [],
  );

  // Loads up to the passage, then goes there. A stale bookmark can point past
  // the end of a chapter that has since lost passages: it lands on the last.
  useEffect(() => {
    if (seekTo === null || isFetching || passages.length === 0) return;
    if (seekTo >= passages.length && hasNextPage) {
      void fetchNextPage();
      return;
    }
    setSeekTo(null);
    scrollToPassage(Math.min(seekTo, passages.length - 1));
  }, [
    fetchNextPage,
    hasNextPage,
    isFetching,
    passages.length,
    scrollToPassage,
    seekTo,
  ]);

  useEffect(() => {
    if (!seekingEnd || isFetching) return;
    if (hasNextPage) {
      void fetchNextPage();
      return;
    }
    setSeekingEnd(false);
    // Twice: the first lands on the list's estimate of its own length, the
    // second once the new passage has been measured.
    list.current?.scrollToEnd({ animated: true });
    const timer = setTimeout(
      () => list.current?.scrollToEnd({ animated: true }),
      450,
    );
    return () => clearTimeout(timer);
  }, [fetchNextPage, hasNextPage, isFetching, seekingEnd]);

  const confirmDelete = useCallback(
    (thread: StoryBoardEventThread) => {
      const id = thread.id;
      if (!id) return;
      Alert.alert("Delete this passage?", "This action is permanent.", [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const result = await deleteStoryBoardEventThread(api, id).catch(
              () => ({ message: API_MESSAGE.Error }),
            );
            if (result.message !== API_MESSAGE.Success) {
              Alert.alert(
                "Could not delete",
                "The passage was not deleted. Please try again.",
              );
              return;
            }
            void refreshPassages();
          },
          style: "destructive",
          text: "Delete",
        },
      ]);
    },
    [api, refreshPassages],
  );

  const goTo = (target: StoryBoardEvent) =>
    target.id &&
    router.replace({
      params: { eventId: target.id },
      pathname: "/story/chapter/[eventId]",
    });

  /** Past the first screen: where the jump buttons start to be useful. */
  const [farIn, setFarIn] = useState(false);
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = event.nativeEvent.contentOffset.y > JUMP_FROM;
      setFarIn((current) => (current === next ? current : next));
    },
    [],
  );

  const { saved: savedPassage, signedIn, toggle } = bookmark;
  const renderItem = useCallback(
    ({
      index,
      item,
    }: {
      index: number;
      item: StoryBoardEventThread;
    }) => (
      <Passage
        bookmarked={savedPassage === index}
        divider={event?.passageAsterism}
        index={index}
        onBookmark={signedIn ? toggle : undefined}
        onMenu={canWrite ? openMenu : undefined}
        thread={item}
      />
    ),
    [canWrite, event?.passageAsterism, openMenu, savedPassage, signedIn, toggle],
  );

  if (!event) {
    return (
      <View style={styles.fill}>
        <ListStatus
          empty={
            <EmptyScene
              aside="(Or it is private, or the link is wrong. Chapters get lost between drafts.)"
              scene="torn-thread"
              subtitle="Somewhere a novelist is muttering about pacing. The page numbers now skip, and everyone is politely pretending not to notice."
              title="This chapter was torn out"
            />
          }
          error={chapter.error}
          loading={chapter.isPending}
          onRetry={() => void chapter.refetch()}
        />
      </View>
    );
  }

  const cover = wsrvImage(event.avatar?.src || event.image, {
    fit: "inside",
    h: 900,
    w: 600,
  });
  const date = storyDate(event.eventTime);
  const clock = storyClock(event.eventTime);

  return (
    <View style={styles.fill}>
      <Stack.Screen
        options={{
          // Web's share, from the chapter header: the community tray.
          headerRight: () => (
            <Pressable
              accessibilityLabel="Share chapter"
              accessibilityRole="button"
              hitSlop={space.sm}
              onPress={() => setSharing(true)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                paddingHorizontal: space.md,
              })}
            >
              <Ionicons
                color={theme.text}
                name="share-social-outline"
                size={22}
              />
            </Pressable>
          ),
          title: story.data?.name ?? "Chapter",
        }}
      />
      <FlatList
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: canWrite
              ? dockHeight + space.lg
              : insets.bottom + space.xl,
          },
        ]}
        data={passages}
        initialNumToRender={4}
        keyExtractor={(item, index) => item.id ?? `passage-${index}`}
        ListFooterComponent={
          <View style={styles.footer}>
            {isFetchingNextPage || (threads.isPending && total === 0) ? (
              <ActivityIndicator color={theme.accent.text} />
            ) : null}
            {!threads.isPending && !hasNextPage ? (
              <>
                {passages.length === 0 ? (
                  <Text style={[styles.waiting, { color: theme.textGray }]}>
                    The story waits for its first words…
                  </Text>
                ) : (
                  <Text style={[styles.count, { color: theme.textGray }]}>
                    {total} {total === 1 ? "passage" : "passages"}
                  </Text>
                )}
                <View style={styles.pager}>
                  {previous ? (
                    <PagerCard
                      direction="previous"
                      label={previous.name}
                      number={position}
                      onPress={() => goTo(previous)}
                    />
                  ) : null}
                  {next ? (
                    <PagerCard
                      direction="next"
                      label={next.name}
                      number={position + 2}
                      onPress={() => goTo(next)}
                    />
                  ) : null}
                </View>
              </>
            ) : null}
            {threads.error && passages.length === 0 ? (
              <ListStatus
                error={threads.error}
                onRetry={() => void threads.refetch()}
              />
            ) : null}
          </View>
        }
        ListHeaderComponent={
          <View>
            <View style={styles.titlePage}>
              {cover ? (
                <View
                  style={[
                    styles.cover,
                    {
                      backgroundColor: theme.material.fillPressed,
                      borderColor: theme.material.edge,
                    },
                  ]}
                >
                  <CroppedImage
                    crop={event.avatar?.crop}
                    maxScalePct={STORY_COVER_ZOOM_MAX_PCT}
                    style={StyleSheet.absoluteFill}
                    uri={cover}
                  />
                </View>
              ) : null}
              <View style={styles.eyebrowRow}>
                <View
                  style={[styles.eyebrowRule, { backgroundColor: theme.accent.surface }]}
                />
                <Text style={[styles.eyebrow, { color: theme.accent.text }]}>
                  {position >= 0 ? `Chapter ${position + 1}` : "Chapter"}
                </Text>
                <View
                  style={[styles.eyebrowRule, { backgroundColor: theme.accent.surface }]}
                />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>
                {event.name}
              </Text>
              {date || event.location ? (
                <View style={styles.meta}>
                  {date ? (
                    <View style={styles.metaItem}>
                      <Ionicons
                        color={theme.textGray}
                        name="calendar-outline"
                        size={13}
                      />
                      <Text style={[styles.metaText, { color: theme.textGray }]}>
                        {date}
                        {clock ? ` · ${clock}` : ""}
                      </Text>
                    </View>
                  ) : null}
                  {event.location ? (
                    <View style={styles.metaItem}>
                      <Ionicons
                        color={theme.textGray}
                        name="location-outline"
                        size={13}
                      />
                      <Text style={[styles.metaText, { color: theme.textGray }]}>
                        {event.location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              {soundCues.length > 0 || canWrite ? (
                <View style={styles.soundRow}>
                  {soundCues.length > 0 ? (
                    <PillButton
                      icon={
                        soundscape.enabled
                          ? "volume-high-outline"
                          : "volume-mute-outline"
                      }
                      label={
                        soundscape.activeCount > 0
                          ? `Sound ${soundscape.activeCount}`
                          : "Sound"
                      }
                      onPress={soundscape.toggle}
                      tone={soundscape.enabled ? "accent" : "neutral"}
                    />
                  ) : null}
                  {canWrite ? (
                    <PillButton
                      icon="musical-notes-outline"
                      label="Sound cues"
                      onPress={() => setCueSheet(true)}
                      tone="neutral"
                    />
                  ) : null}
                </View>
              ) : null}
              {event.song ? (
                <View style={styles.song}>
                  <ProfileSongPill song={event.song} />
                </View>
              ) : null}
            </View>
            <Asterism value={event.overtureAsterism} />
            {event.description ? (
              <View style={styles.overture}>
                <StoryProse html={event.description} />
              </View>
            ) : null}
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={1.5}
        onScroll={onScroll}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onViewableItemsChanged={onViewableItemsChanged}
        scrollEventThrottle={200}
        viewabilityConfig={PASSAGE_VIEWABILITY}
        ref={list}
        renderItem={renderItem}
        windowSize={9}
      />

      {savedPassage !== null || farIn ? (
        <View
          style={[
            styles.bookmarkJump,
            {
              bottom:
                (canWrite ? dockHeight : insets.bottom) + space.md,
            },
          ]}
        >
          {farIn ? (
            <>
              <IconButton
                accessibilityLabel="Back to the top"
                icon="arrow-up"
                onPress={() =>
                  list.current?.scrollToOffset({ animated: true, offset: 0 })
                }
                size={36}
                tone="surface"
              />
              <IconButton
                accessibilityLabel="Go to the end"
                icon="arrow-down"
                // Past any passage there is: pages load up to the last one.
                onPress={() => setSeekTo(Number.MAX_SAFE_INTEGER)}
                size={36}
                tone="surface"
              />
            </>
          ) : null}
          {savedPassage !== null ? (
            <IconButton
              accessibilityLabel={`Go to your bookmark, passage ${savedPassage + 1}`}
              icon="bookmark"
              iconSize={18}
              onPress={() => setSeekTo(savedPassage)}
              size={44}
              tone="primary"
            />
          ) : null}
        </View>
      ) : null}

      {canWrite ? (
        <GlassSurface
          bordered="top"
          onLayout={({ nativeEvent }) =>
            setDockHeight(nativeEvent.layout.height)
          }
          style={[styles.dock, { paddingBottom: insets.bottom + space.sm }]}
          variant="bar"
        >
          <ComposeTrigger
            avatarImage={novelist?.avatar}
            avatarUri={novelist?.avatar?.src ?? novelist?.image}
            label="Add to passage"
            name={novelist?.firstName}
            onPress={() => setComposing({ thread: null })}
            placeholders={PASSAGE_PLACEHOLDERS}
          />
        </GlassSurface>
      ) : null}

      <ActionMenu
        items={[
          {
            icon: "create-outline",
            label: "Edit passage",
            onSelect: () => {
              if (menuFor) setComposing({ thread: menuFor });
            },
          },
          { separator: true },
          {
            icon: "trash-outline",
            label: "Delete passage",
            onSelect: () => {
              if (menuFor) confirmDelete(menuFor);
            },
            variant: "danger",
          },
        ]}
        onClose={() => setMenuVisible(false)}
        subtitle={menuFor?.author?.name}
        title="Passage"
        visible={menuVisible}
      />

      {composing ? (
        <PassageComposer
          eventId={eventId}
          onClose={() => setComposing(null)}
          onSaved={onSaved}
          storyCharacters={characters.data ?? []}
          thread={composing.thread}
        />
      ) : null}

      {canWrite && eventId ? (
        <SoundCuesSheet
          cues={soundCues}
          currentPassage={topPassage}
          eventId={eventId}
          onClose={() => setCueSheet(false)}
          passageCount={soundscapeData.data?.passageCount ?? passages.length}
          visible={cueSheet}
        />
      ) : null}

      <ShareChapterSheet
        chapter={event}
        onClose={() => setSharing(false)}
        story={story.data}
        visible={sharing}
      />
    </View>
  );
}

const Passage = ({
  bookmarked,
  divider,
  index,
  onBookmark,
  onMenu,
  thread,
}: {
  bookmarked: boolean;
  divider: string | null | undefined;
  /** Its place in the chapter, which is what a bookmark stores. */
  index: number;
  /** Given to a signed-in reader: saves this passage, or clears it. */
  onBookmark?: (index: number) => void;
  /** Given to a co-author: opens this passage's edit and delete. */
  onMenu?: (thread: StoryBoardEventThread) => void;
  thread: StoryBoardEventThread;
}) => {
  const theme = useAppTheme();
  return (
    <View>
      <Asterism tight value={divider} />
      <StoryProse
        design={thread.dialogDesign}
        html={thread.message}
        speakers={thread.museDialogAttrs}
      />
      <View style={styles.bylineRow}>
        <Text style={[styles.byline, { color: theme.textGray }]}>
          <Text style={{ color: theme.text, fontWeight: "600" }}>
            {thread.author?.name}
          </Text>
          {thread.createdAt ? `  ·  ${toFormattedDate(thread.createdAt)}` : ""}
        </Text>
        {onBookmark ? (
          <IconButton
            accessibilityLabel={
              bookmarked
                ? "Remove bookmark from this passage"
                : "Bookmark this passage"
            }
            color={bookmarked ? theme.accent.text : undefined}
            hitSlop={space.ms}
            icon={bookmarked ? "bookmark" : "bookmark-outline"}
            iconSize={16}
            onPress={() => onBookmark(index)}
            size={28}
            tone="quiet"
          />
        ) : null}
        {onMenu ? (
          <IconButton
            accessibilityLabel="Passage options"
            hitSlop={space.ms}
            icon="ellipsis-horizontal"
            iconSize={16}
            onPress={() => onMenu(thread)}
            size={28}
            tone="quiet"
          />
        ) : null}
      </View>
    </View>
  );
};

const PagerCard = ({
  direction,
  label,
  number,
  onPress,
}: {
  direction: "previous" | "next";
  label: string;
  number: number;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const isNext = direction === "next";
  return (
    <Pressable
      accessibilityLabel={`${isNext ? "Next" : "Previous"} chapter: ${label}`}
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pagerCard,
        isNext && styles.pagerNext,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {!isNext ? (
        <Ionicons color={theme.accent.text} name="chevron-back" size={18} />
      ) : null}
      <View style={[styles.pagerText, isNext && styles.alignEnd]}>
        <Text style={[styles.pagerEyebrow, { color: theme.accent.text }]}>
          {isNext ? "Next" : "Previous"} · Chapter {number}
        </Text>
        <Text
          numberOfLines={2}
          style={[
            styles.pagerLabel,
            { color: theme.text, textAlign: isNext ? "right" : "left" },
          ]}
        >
          {label}
        </Text>
      </View>
      {isNext ? (
        <Ionicons color={theme.accent.text} name="chevron-forward" size={18} />
      ) : null}
    </Pressable>
  );
};

/** A passage counts as read from the moment it is on screen. */
const PASSAGE_VIEWABILITY = { itemVisiblePercentThreshold: 1 };

/** How far down, in points, before the jump buttons show. */
const JUMP_FROM = 600;

/** The pauses in `scrollToPassage`: for a step to render, and for it to end. */
const SEEK_STEP_MS = 100;
const SEEK_SETTLE_MS = 400;

const styles = StyleSheet.create({
  alignEnd: { alignItems: "flex-end" },
  soundRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    justifyContent: "center",
  },
  bookmarkJump: {
    alignItems: "center",
    gap: space.sm,
    position: "absolute",
    right: space.md,
  },
  byline: { flex: 1, fontSize: fontSize.caption },
  bylineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.sm,
    minHeight: 28,
  },
  content: { paddingHorizontal: space.md + 2 },
  count: { fontSize: fontSize.caption, textAlign: "center" },
  cover: {
    aspectRatio: 2 / 3,
    borderCurve: "continuous",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    marginBottom: space.sm,
    overflow: "hidden",
    width: "52%",
  },
  dock: {
    bottom: 0,
    left: 0,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    position: "absolute",
    right: 0,
  },
  eyebrow: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  eyebrowRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  eyebrowRule: { height: 1, width: 28 },
  fill: { flex: 1 },
  footer: { gap: space.md, paddingTop: space.lg },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.md,
    justifyContent: "center",
  },
  metaItem: { alignItems: "center", flexDirection: "row", gap: space.xs },
  metaText: { fontSize: fontSize.caption },
  overture: { marginBottom: space.sm },
  pager: { gap: space.sm },
  pagerCard: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.md,
  },
  pagerEyebrow: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  pagerLabel: { fontSize: fontSize.body, fontWeight: "600" },
  pagerNext: { justifyContent: "flex-end" },
  pagerText: { flex: 1, gap: space.xxs },
  song: { alignSelf: "stretch", marginTop: space.sm },
  title: {
    fontSize: fontSize.display - 2,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
  },
  titlePage: { alignItems: "center", gap: space.sm, paddingTop: space.lg },
  waiting: { fontSize: fontSize.body, fontStyle: "italic", textAlign: "center" },
});
