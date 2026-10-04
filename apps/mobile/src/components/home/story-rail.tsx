import { getRandomStories } from "@nw/api/endpoints/home";
import { queryKeys, useApi } from "@nw/features";
import type { StoryBoard } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { SectionHeader } from "@/components/home/section-header";
import {
  StoryCoverCard,
  StoryCoverCardShimmer,
} from "@/components/story-cover-card";
import { dedupeById } from "@/lib/feed";
import { space, useAppTheme } from "@/theme";

/**
 * A row of stories — web's "Dive into the Stories" rail on its home page.
 *
 * The same request and page size web makes (`/story/random`, sixteen), the
 * same card the library draws, and the same paging-by-scrolling the character
 * rails use: the next page arrives as the end comes into view. "See all" opens
 * the library, which is the long form of this list.
 *
 * A card opens its story; its heart and count work as they do on the shelf.
 * The likers sheet belongs to the rail rather than to each card.
 *
 * Hidden when there is nothing to show, like the character rails.
 */

/** Web's `STORIES_PAGE_SIZE` on the home page. */
const PAGE_SIZE = 16;
/** Two cards and a sliver of the third on a 375pt phone: says "this scrolls". */
/** Web's 158. */
const STORY_CARD_WIDTH = 158;
const GAP = space.sm + 2;
const SHIMMER = [0, 1, 2];

type ListedStory = StoryBoard & { id: string };
const listed = (story: StoryBoard): story is ListedStory => Boolean(story.id);

const keyExtractor = (story: ListedStory) => story.id;
const Separator = () => <View style={styles.separator} />;

const StoryRailView = () => {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const [likers, setLikers] = useState<{ count: number; id: string } | null>(
    null,
  );

  const query = useInfiniteQuery({
    getNextPageParam: (
      lastPage: StoryBoard[],
      _all: StoryBoard[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<StoryBoard[]> => {
      const result = await getRandomStories(api, pageParam, PAGE_SIZE);
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.homeStories(),
    staleTime: 5 * 60 * 1000,
  });

  const stories = useMemo(
    () =>
      dedupeById((query.data?.pages ?? []).map((page) => page.filter(listed))),
    [query.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showLikers = useCallback(
    (storyId: string, count: number) => setLikers({ count, id: storyId }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListedStory }) => (
      <Pressable
        accessibilityLabel={item.name}
        accessibilityRole="link"
        onPress={() =>
          router.push({
            params: { storyId: item.id },
            pathname: "/story/[storyId]",
          })
        }
        style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
      >
        <StoryCoverCard onShowLikers={showLikers} story={item} />
      </Pressable>
    ),
    [router, showLikers],
  );

  if (!query.isPending && stories.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        action={{ label: "See all", onPress: () => router.push("/library") }}
        title="Dive into the Stories"
      />
      {query.isPending ? (
        <View style={styles.shimmerRow}>
          {SHIMMER.map((i) => (
            <View key={i} style={styles.cell}>
              <StoryCoverCardShimmer />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.track}
          data={stories}
          decelerationRate="fast"
          horizontal
          // Two and a bit covers are on screen; a page is sixteen cropped
          // images, and the default would build ten of them up front.
          initialNumToRender={3}
          ItemSeparatorComponent={Separator}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={3}
          windowSize={3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={theme.accent.text} size="small" />
              </View>
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={STORY_CARD_WIDTH + GAP}
        />
      )}
      <LikersSheet
        count={likers?.count ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />
    </View>
  );
};

export const StoryRail = memo(StoryRailView);

const styles = StyleSheet.create({
  cell: { width: STORY_CARD_WIDTH },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  section: { paddingBottom: space.md },
  separator: { width: GAP },
  shimmerRow: {
    flexDirection: "row",
    gap: GAP,
    overflow: "hidden",
    paddingHorizontal: space.md,
  },
  track: { paddingHorizontal: space.md },
});
