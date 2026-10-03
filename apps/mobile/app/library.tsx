import { getRandomStories } from "@nw/api/endpoints/home";
import { queryKeys, useApi } from "@nw/features";
import type { StoryBoard } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EndOfList } from "@/components/end-of-list";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { ListStatus } from "@/components/list-status";
import { NovelistHeader } from "@/components/novelist-header";
import {
  StoryCoverCard,
  StoryCoverCardShimmer,
} from "@/components/story-cover-card";
import { dedupeById } from "@/lib/feed";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * `/rp/library` — every story the reader can see, as a shelf.
 *
 * The same request web's library page makes: `/story/random`, paged by twelve.
 * Public stories for everyone, and with a session the server folds in stories
 * the reader is a member of, private ones included.
 *
 * A card opens its story. Its heart toggles the like in place and its count
 * opens who liked it, as web's card does; the one likers sheet belongs to the
 * screen rather than to every cell.
 *
 * Opened from the menu, outside the tabs, for the reason the profile settings
 * are: it is a destination the bar has no tab for.
 */

/** Web's `PAGE_SIZE` on the library page. Kept identical. */
const PAGE_SIZE = 12;
const COLUMNS = 2;
const GUTTER = space.sm + 4;

type ListedStory = StoryBoard & { id: string };
type Placeholder = { id: string; placeholder: true };
type Item = ListedStory | Placeholder;

const listed = (story: StoryBoard): story is ListedStory => Boolean(story.id);

const PLACEHOLDERS: Placeholder[] = Array.from({ length: 6 }, (_, index) => ({
  id: `placeholder-${index}`,
  placeholder: true,
}));

const keyExtractor = (item: Item) => item.id;

export default function LibraryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [likers, setLikers] = useState<{ count: number; id: string } | null>(
    null,
  );
  const showLikers = useCallback(
    (storyId: string, count: number) => setLikers({ count, id: storyId }),
    [],
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
    queryKey: queryKeys.library(),
    staleTime: 5 * 60 * 1000,
  });

  // Random order can hand the same story to two pages.
  const stories = useMemo(
    () =>
      dedupeById((query.data?.pages ?? []).map((page) => page.filter(listed))),
    [query.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // A fixed width rather than `flex: 1`, so an odd story out keeps its column
  // instead of stretching across both.
  const cellWidth = (width - GUTTER * (COLUMNS + 1)) / COLUMNS;

  const renderItem = useCallback(
    ({ item }: { item: Item }) =>
      "placeholder" in item ? (
        <View style={{ width: cellWidth }}>
          <StoryCoverCardShimmer />
        </View>
      ) : (
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
            { width: cellWidth },
            pressed && styles.pressed,
          ]}
        >
          <StoryCoverCard onShowLikers={showLikers} story={item} />
        </Pressable>
      ),
    [cellWidth, router, showLikers],
  );

  return (
    <View style={styles.fill}>
      <NovelistHeader title="Library" />
      <FlatList<Item>
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.lg },
        ]}
        data={query.isPending ? PLACEHOLDERS : stories}
        initialNumToRender={6}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty="No stories to show yet."
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={theme.accent.text} />
            </View>
          ) : !query.isPending && !hasNextPage && stories.length > 0 ? (
            <EndOfList />
          ) : null
        }
        ListHeaderComponent={
          <Text style={[styles.subtitle, { color: theme.textGray }]}>
            Browse every story on Novelist World
          </Text>
        }
        numColumns={COLUMNS}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        renderItem={renderItem}
        windowSize={7}
      />
      <LikersSheet
        count={likers?.count ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: GUTTER, paddingHorizontal: GUTTER, paddingTop: space.sm },
  fill: { flex: 1 },
  footer: { alignItems: "center", paddingVertical: space.md },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  row: { gap: GUTTER },
  subtitle: { fontSize: fontSize.label },
});
