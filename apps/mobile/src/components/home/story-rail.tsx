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
import { RAIL_GAP, RAIL_PAD, useRailSnap } from "@/components/home/rail-snap";
import { SectionHeader } from "@/components/home/section-header";
import { OfflineNotice } from "@/components/offline";
import {
  StoryCoverCard,
  StoryCoverCardShimmer,
} from "@/components/story-cover-card";
import { useOffline } from "@/lib/connectivity";
import { dedupeById } from "@/lib/feed";
import { space, useAppTheme } from "@/theme";

/**
 * A row of stories — web's "Dive into the Stories" rail on its home page.
 *
 * The same request and page size web makes (`/story/random`, sixteen), the
 * same card the library draws — at the rail's wide size — and the same
 * paging-by-scrolling the character rails use: the next page arrives as the
 * end comes into view. "See all" opens the library, which is the long form
 * of this list.
 *
 * One story at a time, centred, with the next peeking in: the geometry every
 * home rail shares, see `rail-snap.ts`. A cover is 2:3 with the title block
 * under it, so it takes the portrait share.
 *
 * A card opens its story; its heart and count work as they do on the shelf.
 * The likers sheet belongs to the rail rather than to each card.
 *
 * Hidden when there is nothing to show, like the character rails.
 */

/** Web's `STORIES_PAGE_SIZE` on the home page. */
const PAGE_SIZE = 16;
/** The card's share of the screen; see the note above. */
const CARD_SHARE = 0.6;
const SHIMMER = [0, 1];

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
  const offline = useOffline();

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
  const snap = useRailSnap({ count: stories.length, share: CARD_SHARE });

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
        style={({ pressed }) => [
          { width: snap.cardWidth },
          pressed && styles.pressed,
        ]}
      >
        <StoryCoverCard onShowLikers={showLikers} story={item} wide />
      </Pressable>
    ),
    [router, showLikers, snap.cardWidth],
  );

  if (!query.isPending && stories.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        action={{ label: "See all", onPress: () => router.push("/library") }}
        title="Dive into the Stories"
      />
      {query.isPending && offline ? (
        <OfflineNotice compact what="rail" />
      ) : query.isPending ? (
        <View style={styles.shimmerRow}>
          {SHIMMER.map((i) => (
            <View key={i} style={{ width: snap.cardWidth }}>
              <StoryCoverCardShimmer wide />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          {...snap.listProps}
          contentContainerStyle={snap.contentContainerStyle}
          data={stories}
          horizontal
          // One cover and two slivers are on screen; a page is sixteen
          // cropped images, and the default would build ten of them up front.
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
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  section: { paddingBottom: space.md },
  separator: { width: RAIL_GAP },
  shimmerRow: {
    flexDirection: "row",
    gap: RAIL_GAP,
    overflow: "hidden",
    paddingHorizontal: RAIL_PAD,
  },
});
