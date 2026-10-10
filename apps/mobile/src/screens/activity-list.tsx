import { getUserActivities } from "@nw/api/endpoints/home";
import { queryKeys, useApi } from "@nw/features";
import type { Activity } from "@nw/types/activity";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityBox } from "@/components/activity/box";
import { EmptyFeed } from "@/components/empty-feed";
import { EndOfList } from "@/components/end-of-list";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { SkeletonRows } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { MediaViewer } from "@/components/muse/media-viewer";
import { ActivityCardSkeleton } from "@/components/skeleton";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { space, useAppTheme } from "@/theme";

/**
 * Everything a novelist has done lately.
 *
 * A component rather than a screen, for the reason the friends and character
 * lists are: the Home tab mounts it for somebody else, the Profile tab for your
 * own, so opening your own activity lights Profile rather than Home.
 *
 * ## Why a `FlatList` and not a `FlashList`
 *
 * The friends list is a recycler because its rows are one fixed height and
 * there can be hundreds of them. These rows are not: a prompt activity is as
 * tall as its text, a media activity is 220pt of picture, and a muse activity
 * is one line. `FlashList` wants a size estimate to do its job and a wrong one
 * costs more than the recycling saves; a feed of ten-per-page mixed-height
 * cards is what `FlatList` is already good at.
 *
 * ## Why the fetch is local rather than in `@nw/features`
 *
 * The same reason the novelist profile's and the interactions list's are: every
 * hook in that package has a consumer on both clients, which is the rule that
 * makes it a contract rather than a guess. Web reads this endpoint through
 * `useState` and a manual page counter on its profile page, so lifting a
 * `useNovelistActivity` now would be inventing an interface for one caller. The
 * query *key* is shared already, so the cache entry is the one web will join.
 */

/** Web's `ACTIVITY_PAGE_SIZE` on the profile page. Kept identical. */
const PAGE_SIZE = 10;

export const ActivityList = ({ username }: { username: string }) => {
  const theme = useAppTheme();
  const api = useApi();

  const query = useInfiniteQuery({
    enabled: Boolean(username),
    /*
     * Derived from the last page's own parameter rather than `allPages.length`,
     * which is an accident of what the cache happens to be holding.
     */
    getNextPageParam: (
      lastPage: Activity[],
      _all: Activity[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Activity[]> => {
      const result = await getUserActivities(
        api,
        username,
        pageParam,
        PAGE_SIZE,
      );
      // `null` is a 404 — this novelist has done nothing yet, which is an empty
      // list rather than a failure. A `message` is a real error worth retrying.
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.novelistActivity(username),
  });

  // Memoised: `flat()` builds a new array on every render, and a fresh array
  // identity feeding a list's `data` prop is a re-render loop.
  const activities = useMemo(
    () => (query.data?.pages ?? []).flat(),
    [query.data],
  );

  // The one likers sheet and the one viewer for every card in the list; a
  // modal per cell would be a modal per recycle.
  const [likers, setLikers] = useState<{ count: number; id: string } | null>(
    null,
  );
  const [viewing, setViewing] = useState<string | null>(null);

  const renderItem = useCallback(
    ({ item }: { item: Activity }) => (
      <ActivityBox
        activity={item}
        onOpenMedia={setViewing}
        onShowLikers={setLikers}
      />
    ),
    [],
  );

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  return (
    <View style={styles.fill}>
      <FlatList
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        data={activities}
        // Tall media cards: three fill a screen, so ten was three screens of
        // pictures decoded before the first frame.
        initialNumToRender={4}
        keyExtractor={(item, index) => item.id ?? `activity-${index}`}
        maxToRenderPerBatch={3}
        windowSize={5}
        ListEmptyComponent={
          <ListStatus
            empty={<EmptyFeed kind="activities" username={username} />}
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
            skeleton={
              <SkeletonRows
                count={3}
                gap={space.ms}
                render={() => <ActivityCardSkeleton />}
              />
            }
          />
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityCardSkeleton />
          ) : !query.hasNextPage && activities.length > 0 ? (
            <EndOfList />
          ) : null
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        /*
         * Fetch a screen early rather than at the very end. These cards are
         * tall — ten of them is several screens — so a threshold tuned for
         * short rows would fire far too late and show a stall at the foot of
         * every page.
         */
        onEndReachedThreshold={0.6}
        renderItem={renderItem}
      />

      <LikersSheet
        count={likers?.count ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />

      <MediaViewer
        index={viewing ? 0 : null}
        isOwner={false}
        media={viewing ? [viewing] : []}
        metaByUrl={EMPTY_META}
        onCaption={async () => false}
        onChange={() => undefined}
        onClose={() => setViewing(null)}
        onDelete={() => undefined}
      />
    </View>
  );
};

const EMPTY_META = new Map();

const styles = StyleSheet.create({
  content: { gap: space.ms, padding: space.md },
  fill: { flex: 1 },
});
