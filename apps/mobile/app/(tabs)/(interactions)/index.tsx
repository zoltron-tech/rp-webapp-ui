import { getOutgoingThreads } from "@nw/api/endpoints/feed";
import { queryKeys, useApi } from "@nw/features";
import type { PromptThreadComment } from "@nw/types";
import { pluralize } from "@nw/utils";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { EndOfList } from "@/components/end-of-list";
import {
  OutgoingThreadCardSkeleton,
  SkeletonRows,
} from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { OutgoingThreadCard } from "@/components/outgoing-thread-card";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { fontSize, space, type, useAppTheme } from "@/theme";
import { EmptyState, FeedSeparator, LoadMore } from "@/components/list-parts";

/**
 * Interactions — the threads this novelist has replied into.
 *
 * The native counterpart to `apps/web/src/app/rp/outgoing-threads`. Same
 * endpoint, same page size, same card, same header wording; see
 * `outgoing-thread-card.tsx` for where the card itself departs from web and
 * why.
 *
 * ## What is tappable
 *
 * Each card's "View thread" button, and nothing else — it pushes
 * `/threads/:parentId` inside this tab's own stack, so the tab bar stays put
 * and Interactions stays lit while the thread is read.
 *
 * The empty state keeps web's words and still drops its "Explore open
 * interactions" button: that one goes to the discovery feed, which does not
 * exist on native yet and would be the dead end this screen used to be full
 * of.
 *
 * ## Why the fetch is local rather than in `@nw/features`
 *
 * The same reason the novelist profile's is: every hook in that package has a
 * consumer on both clients, which is the rule that makes it a contract rather
 * than a guess. Web reads this endpoint through `useState` and a manual page
 * counter, so lifting a `useOutgoingThreads` now would be inventing an
 * interface for one caller. It moves up when the web page migrates and there
 * is a second caller to answer to. The query *key* is already shared, so the
 * cache entry is the one web will join.
 */

/** Web's `PAGE_SIZE`. Kept identical so both clients page in step. */
const PAGE_SIZE = 5;

/**
 * Fetch the next page a screen and a half early.
 *
 * Five cards is well under a phone screen, so waiting for the end of the list
 * would mean a visible stall on almost every scroll. This starts the request
 * while the reader is still in the middle of the page they have.
 */
const END_REACHED_THRESHOLD = 1.5;

export default function InteractionsScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();

  const query = useInfiniteQuery({
    /*
     * Derived from the last page's own parameter rather than `allPages.length`,
     * which is an accident of what the cache happens to be holding.
     */
    getNextPageParam: (
      lastPage: PromptThreadComment[],
      _all: PromptThreadComment[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<PromptThreadComment[]> => {
      const result = await getOutgoingThreads(api, pageParam, PAGE_SIZE);
      // `null` is a 404 — no threads, which is an empty list rather than a
      // failure. A `message` is a real error and worth retrying.
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.outgoingThreads(),
    staleTime: 60 * 1000,
  });

  // Memoised: `flat()` builds a new array on every render, and a fresh array
  // identity feeding a list's `data` prop is a re-render loop.
  const threads = useMemo(
    () => (query.data?.pages ?? []).flat(),
    [query.data],
  );

  // The pull spinner only for a pull, not for a background refetch.
  const pull = usePullToRefresh(query.refetch);

  // Stable, so the memoised card compares in one pointer check per row rather
  // than re-rendering the whole list on every parent render.
  const openThread = useCallback(
    (threadId: string) =>
      router.push({
        params: { threadId },
        pathname: "/threads/[threadId]",
      }),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: PromptThreadComment }) => (
      <OutgoingThreadCard onOpen={openThread} thread={item} />
    ),
    [openThread],
  );

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  /** Web's `headerSubtitle`, including its counting. */
  /** Whether anything here is waiting on a reply from you. */
  const waiting = threads.some((t) => t.replyCount > 0);

  const subtitle = query.isPending
    ? "Loading your threads…"
    : threads.length === 0
      ? "You're all caught up"
      : (() => {
          const active = threads.filter((t) => t.replyCount > 0).length;
          if (active === 0) return "No new replies right now";
          return `${active} active ${pluralize("thread", active)} with new replies`;
        })();

  /*
   * The header and footer are held rather than written inline. Both are plain
   * elements, so a fresh one per render is a reconcile rather than a remount —
   * but this component re-renders on every `isPending` / `isRefetching` /
   * `isFetchingNextPage` transition, and the footer's other arm is `EndOfList`,
   * which is forty-six `react-native-svg` nodes. Not re-walking that subtree
   * when only a refresh flag moved is worth two dependency arrays.
   *
   * The page header scrolls with the list rather than sitting above it. Five
   * cards do not fill a screen, and a pinned header over a short list spends
   * the scarcest thing on the screen saying what the tab bar already says.
   */
  const header = useMemo(
    () => (
      <View style={styles.header}>
        {/*
          The same head every feed has: what this list is, a rule, and the one
          line of news under it. The bar above already says "Interactions".
        */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.textGray }]}>
            Your threads
          </Text>
          <View
            style={[styles.rule, { backgroundColor: theme.material.edge }]}
          />
        </View>
        <Text
          style={[
            styles.headerSubtitle,
            { color: waiting ? theme.text : theme.textGray },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    ),
    [subtitle, theme, waiting],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const hasThreads = threads.length > 0;

  const footer = useMemo(() => {
    if (hasNextPage) {
      return (
        <LoadMore
          busy={isFetchingNextPage}
          onPress={() => void fetchNextPage()}
        />
      );
    }

    // Web has shown the dozing book at the foot of this list since it had one;
    // this said "That's everything." in grey. Same list, same moment, same
    // marker now.
    return hasThreads ? <EndOfList /> : null;
  }, [fetchNextPage, hasNextPage, hasThreads, isFetchingNextPage, theme]);

  return (
    <View style={styles.fill}>
      <FlashList
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        data={threads}
        ItemSeparatorComponent={FeedSeparator}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          query.isPending || query.error ? (
            <ListStatus
              error={query.error}
              loading={query.isPending}
              onRetry={() => void query.refetch()}
              skeleton={
                <SkeletonRows
                  count={4}
                  gap={space.ms}
                  render={() => <OutgoingThreadCardSkeleton />}
                />
              }
            />
          ) : (
            <EmptyState
              body="Nothing is running right now. Find a starter someone else has posted and reply to spark one."
              icon="chatbubbles-outline"
              title="No active interactions"
            />
          )
        }
        ListFooterComponent={footer}
        ListHeaderComponent={header}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        refreshing={pull.refreshing}
        renderItem={renderItem}
        onRefresh={pull.onRefresh}
      />
    </View>
  );
}

const keyExtractor = (item: PromptThreadComment) => item.id;

const styles = StyleSheet.create({
  content: { padding: space.md },
  end: {
    fontSize: fontSize.caption,
    paddingTop: space.md,
    textAlign: "center",
  },
  fill: { flex: 1 },
  header: { gap: space.xs, paddingBottom: space.m },
  headerRow: { alignItems: "center", flexDirection: "row", gap: space.m },
  headerSubtitle: { fontSize: fontSize.label, fontWeight: "500" },
  headerTitle: type.eyebrow,
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
});
