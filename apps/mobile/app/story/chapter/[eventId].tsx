import { Ionicons } from "@expo/vector-icons";
import type { StoryBoardEvent, StoryBoardEventThread } from "@nw/types";
import { toFormattedDate, wsrvImage } from "@nw/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CroppedImage } from "@/components/cropped-image";
import { ListStatus } from "@/components/list-status";
import { ProfileSongPill } from "@/components/profile-song";
import { Asterism } from "@/components/story/asterism";
import { StoryProse } from "@/components/story/story-prose";
import {
  useStory,
  useStoryChapter,
  useStoryChapterThreads,
} from "@/hooks/use-story";
import { STORY_COVER_ZOOM_MAX_PCT, storyClock, storyDate } from "@/lib/story";
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
 * Web's book mode is a two-page desktop spread and does not come across; its
 * composer, passage editing, bookmarks and soundscape are the writing and
 * listening halves and are left out. The chapter's featured song stays — it is
 * part of reading it. At the foot, the previous and next chapters, so a story
 * can be read end to end without going back to its page.
 */


export default function ChapterScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const chapter = useStoryChapter(eventId);
  const event = chapter.data;
  const story = useStory(event?.storyBoardId);
  const threads = useStoryChapterThreads(eventId);

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

  const goTo = (target: StoryBoardEvent) =>
    target.id &&
    router.replace({
      params: { eventId: target.id },
      pathname: "/story/chapter/[eventId]",
    });

  const renderItem = useCallback(
    ({ item }: { item: StoryBoardEventThread }) => (
      <Passage divider={event?.passageAsterism} thread={item} />
    ),
    [event?.passageAsterism],
  );

  if (!event) {
    return (
      <View style={styles.fill}>
        <ListStatus
          empty="This chapter was deleted, or it is private."
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
      <Stack.Screen options={{ title: story.data?.name ?? "Chapter" }} />
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.xl },
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
        renderItem={renderItem}
        windowSize={9}
      />
    </View>
  );
}

const Passage = ({
  divider,
  thread,
}: {
  divider: string | null | undefined;
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
      <Text style={[styles.byline, { color: theme.textGray }]}>
        <Text style={{ color: theme.text, fontWeight: "600" }}>
          {thread.author?.name}
        </Text>
        {thread.createdAt ? `  ·  ${toFormattedDate(thread.createdAt)}` : ""}
      </Text>
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

const styles = StyleSheet.create({
  alignEnd: { alignItems: "flex-end" },
  byline: { fontSize: fontSize.caption, marginTop: space.sm },
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
