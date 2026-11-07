import {
  getPostsByNovelist,
  getPromptsByNovelist,
} from "@nw/api/endpoints/posts";
import { queryKeys, useApi } from "@nw/features";
import type { Prompt } from "@nw/types";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { ComposeTrigger } from "@/components/compose/compose-trigger";
import { EmptyFeed } from "@/components/empty-feed";
import { EndOfList } from "@/components/end-of-list";
import { PromptCard } from "@/components/feed/prompt-card";
import { SkeletonRows } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { PromptCardSkeleton } from "@/components/skeleton";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePromptFeedActions } from "@/hooks/use-prompt-feed-actions";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { space } from "@/theme";
import { FeedSeparator } from "@/components/list-parts";

/**
 * A novelist's prompts, or their out-of-character posts.
 *
 * Two feeds, one component, because the only things that differ are which
 * endpoint answers and what the empty state says. They are
 * `GET /prompt/posts/by/:id` and `GET /prompt/posts/muses/by/:id` — the same
 * shape, the same page size, and the same card.
 *
 * ## The same card as Explore
 *
 * The first version drew these with `ThreadPost` on a `FlatList`: a plain
 * card with a heart and a count, no comments, and a reaction that was
 * forgotten as soon as the row scrolled away. A profile feed and a discovery
 * feed are the same list of the same thing, and they now share `PromptCard`,
 * a recycling `FlashList`, opened comments, and a heart written back into
 * the query cache — see `explore.tsx` for the reasoning behind each. Everything
 * a card can do comes from `usePromptFeedActions`, as it does there.
 *
 * ## The two are not the same content, despite the endpoint names
 *
 * **Prompts** are written by the novelist's *muses* — in character, the thing
 * other writers pick up and answer. **OOC posts** are the novelist speaking as
 * themselves. Web calls the first tab "Posts" and the second "Prompts", which
 * reads backwards from the URLs; the labels here say which is which.
 *
 * ## Why it takes an id rather than a username
 *
 * Both endpoints are keyed by novelist id, not handle. Everything that opens
 * these screens has the novelist object in hand — your own from the session,
 * somebody else's from the profile that pushed the route — so the id travels as
 * a route param rather than being re-fetched from the handle.
 *
 * The cost is that a cold deep link into one of these routes has no id and
 * shows the empty state. That is the correct thing for it to do until these
 * routes are worth linking to from outside the app; typed routes are off and
 * nothing generates such a link today.
 *
 * ## Why the fetch is local rather than in `@nw/features`
 *
 * The same reason the profile's and the activity list's are: every hook in that
 * package has a consumer on both clients, which is the rule that makes it a
 * contract rather than a guess. Web reads these through `useState` and a manual
 * page counter. The query *keys* are shared already, so the cache entries are
 * the ones web will join.
 */

/** Web's `POST_PAGE_SIZE` on the profile page. Kept identical. */
const PAGE_SIZE = 20;

/**
 * Fetch the next page a screen early. Twenty cards with pictures is many
 * screens, and a threshold tuned for short rows would fire far too late.
 */
const END_REACHED_THRESHOLD = 1;

export type FeedKind = "posts" | "prompts";

const keyExtractor = (item: Prompt) => item.id;

export const PromptFeed = ({
  kind,
  novelistId,
  username,
}: {
  kind: FeedKind;
  /** Empty when the route was opened without one — see the note above. */
  novelistId: string;
  /** Whose feed this is, for the empty state's sentence. */
  username?: string;
}) => {
  const api = useApi();

  const actions = usePromptFeedActions();
  const { canAct, cardProps, expandedIds, novelist, openCompose, unfoldedIds } =
    actions;

  /** Your own list is also somewhere to write from, as it is on web. */
  const own = canAct && novelist?.id === novelistId;

  const queryKey =
    kind === "prompts"
      ? queryKeys.novelistPrompts(novelistId)
      : queryKeys.novelistPosts(novelistId);

  const query = useInfiniteQuery({
    enabled: Boolean(novelistId),
    /*
     * Derived from the last page's own parameter rather than `allPages.length`,
     * which is an accident of what the cache happens to be holding.
     */
    getNextPageParam: (
      lastPage: Prompt[],
      _all: Prompt[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Prompt[]> => {
      const fetch =
        kind === "prompts" ? getPromptsByNovelist : getPostsByNovelist;
      const result = await fetch(api, novelistId, pageParam, PAGE_SIZE);
      // `null` is a 404 — nothing posted yet, which is an empty list rather
      // than a failure. A `message` is a real error worth retrying.
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey,
  });

  // Memoised: `flat()` builds a new array on every render, and a fresh array
  // identity feeding a list's `data` prop is a re-render loop.
  // Written offline, waiting: at the head of your own list until sent.
  const queued = useMemo(
    () =>
      own
        ? actions.queuedPrompts.filter(
            (prompt) =>
              (prompt.source.sourceType === "MUSE") === (kind === "prompts"),
          )
        : [],
    [actions.queuedPrompts, kind, own],
  );
  const items = useMemo(
    () => [...queued, ...(query.data?.pages ?? []).flat()],
    [query.data, queued],
  );

  // The pull spinner only for a pull, not for a background refetch.
  const pull = usePullToRefresh(query.refetch);

  const renderItem = useCallback(
    ({ item }: { item: Prompt }) => (
      <PromptCard
        {...cardProps}
        expanded={expandedIds.has(item.id)}
        prompt={item}
        unfolded={unfoldedIds.has(item.id)}
      />
    ),
    [cardProps, expandedIds, unfoldedIds],
  );

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last row reachable under it.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  const { hasNextPage, isFetchingNextPage } = query;
  const hasItems = items.length > 0;

  // Held so a refetch flag does not re-walk `EndOfList`'s SVG.
  const footer = useMemo(() => {
    // The next page's ghost, in the separator's rhythm.
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingTop: space.ms }}>
          <PromptCardSkeleton />
        </View>
      );
    }
    if (!hasNextPage && hasItems) return <EndOfList />;
    return null;
  }, [hasItems, hasNextPage, isFetchingNextPage]);

  return (
    <View style={styles.fill}>
      <FlashList
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        data={items}
        ItemSeparatorComponent={FeedSeparator}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          own ? (
            <View style={styles.compose}>
              <ComposeTrigger
                avatarUri={novelist?.avatar?.src ?? novelist?.image}
                name={novelist?.firstName}
                onPress={openCompose}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <ListStatus
            empty={
              novelistId ? (
                <EmptyFeed kind={kind} username={username} />
              ) : (
                "Nothing to show here."
              )
            }
            error={query.error}
            loading={query.isPending && Boolean(novelistId)}
            onRetry={() => void query.refetch()}
            skeleton={
              <SkeletonRows
                count={3}
                gap={space.ms}
                render={() => <PromptCardSkeleton />}
              />
            }
          />
        }
        ListFooterComponent={footer}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        onRefresh={pull.onRefresh}
        refreshing={pull.refreshing}
        renderItem={renderItem}
      />

      {actions.sheets}
    </View>
  );
};

const styles = StyleSheet.create({
  compose: { paddingBottom: space.ms },
  content: { padding: space.md },
  fill: { flex: 1 },
});
