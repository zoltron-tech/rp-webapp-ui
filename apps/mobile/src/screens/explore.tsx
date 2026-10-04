import { Ionicons } from "@expo/vector-icons";
import { getExplorePrompts, getNewsFeedPage } from "@nw/api/endpoints/feed";
import { queryKeys, useApi } from "@nw/features";
import type { Prompt } from "@nw/types";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  type ComponentProps,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { ComposeTrigger } from "@/components/compose/compose-trigger";
import { EndOfList } from "@/components/end-of-list";
import { PromptCard } from "@/components/feed/prompt-card";
import { SkeletonRows } from "@/components/list-skeletons";
import { ListStatus } from "@/components/list-status";
import { PromptCardSkeleton } from "@/components/skeleton";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePromptFeedActions } from "@/hooks/use-prompt-feed-actions";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useTabTop } from "@/hooks/use-tab-top";
import { dedupeById } from "@/lib/feed";
import { fontSize, space, type, useAppTheme } from "@/theme";
import { EmptyState, FeedSeparator, LoadMore } from "@/components/list-parts";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { Text } from "@/components/text";

/**
 * Explore — the discovery feed, in two halves.
 *
 * The native counterpart to `apps/web/src/app/rp/explore`. Same two endpoints,
 * same page sizes, same two labels, same card order; see
 * `components/feed/prompt-card.tsx` for where the card itself departs from web
 * and why.
 *
 * ## The two feeds
 *
 * **Prompts** are written in character, by somebody's muse, and are the thing
 * another writer picks up and answers. **OOC** posts are novelists speaking as
 * themselves. They are `GET /prompt/explore` and `GET /prompt/posts`, and they
 * page at five and eight respectively — web's `FEED_PAGE_SIZES`, kept identical
 * so both clients page in step.
 *
 * ## One list, two caches
 *
 * Web keeps both feeds mounted and hides the inactive one with `display: none`,
 * because each of its prompt cards owns a local store and unmounting one would
 * lose an optimistic reaction. That is the wrong trade on a phone: two live
 * lists is two sets of mounted cells, two sets of decoded images, and — since
 * they are absolutely the same width — twice the layout for one visible feed.
 *
 * So there is one list here, and the thing web was protecting is protected
 * differently: a heart is written back into the query cache the moment it
 * settles (`handleReacted` below, which is web's `handlePromptReacted` doing the
 * same job to its global cache). Switching tabs, scrolling a card out of a
 * recycling list and coming back, or leaving the screen entirely all now
 * preserve it, which is more than keeping the list mounted ever bought.
 *
 * ## Where the optimisations come from
 *
 * The same set the Interactions screen carries, for the same reasons: `FlashList`
 * rather than `FlatList`, a memoised `data` (a fresh `flat()` per render is a
 * re-render loop), `renderItem` and every callback it closes over hoisted and
 * stable so a memoised card compares in one pointer check, the header and footer
 * held so a refetch flag does not re-walk forty-six SVG nodes, and a next page
 * fetched a screen and a half early. See `MOBILE_LIST_PERFORMANCE_PLAN`.
 *
 * ## Writing, as well as reading
 *
 * The trigger at the top of the list opens the composer for a new prompt;
 * every card's Reply opens it for a comment; the ⋯ menu offers share, edit
 * and delete on your own posts and report on everyone else's. All of that —
 * the sheets, the open-card sets and the cache writes that keep a post you
 * just wrote at the top of the feed — is `usePromptFeedActions`, shared with
 * the Home feed, which draws the same cards.
 *
 * ## Why the fetch is local rather than in `@nw/features`
 *
 * The rule that package keeps is that every hook in it has a consumer on both
 * clients. Web reads these two endpoints through `useState`, a manual page
 * counter and a bespoke prefetch service, so lifting a `useExploreFeed` now
 * would be inventing an interface for one caller. The query *keys* are shared
 * already, so the cache entries are the ones web will join.
 */

/** Web's `FEED_PAGE_SIZES`. Kept identical so both clients page in step. */
const PAGE_SIZE = { NEWSFEED: 8, PROMPTS: 5 } as const;

/**
 * Fetch the next page a screen and a half early.
 *
 * Five cards is one to two screens, so waiting for the end of the list would
 * mean a visible stall on most scrolls. This starts the request while the reader
 * is still in the middle of the page they have.
 */
const END_REACHED_THRESHOLD = 1.5;

type ExploreMode = "NEWSFEED" | "PROMPTS";

/** Web's two tabs, in web's order: OOC first, then Prompts. */
const MODES: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: ExploreMode;
}[] = [
  { icon: "eye-off-outline", label: "OOC", value: "NEWSFEED" },
  { icon: "bookmarks-outline", label: "Prompts", value: "PROMPTS" },
];

const EMPTY: Record<ExploreMode, { body: string; title: string }> = {
  NEWSFEED: {
    body: "When novelists post as themselves, their posts land here.",
    title: "Nothing out of character yet",
  },
  PROMPTS: {
    body: "No open prompts right now. Post one of your own and someone will pick it up.",
    title: "No prompts to explore",
  },
};

/**
 * What each feed is, at its head.
 *
 * "OOC" and "Prompts" are the product's own words, and the switcher can only
 * afford one of them each. The line under the title is for the reader who does
 * not yet know which is which — the difference is who is speaking.
 */
const INTRO: Record<ExploreMode, { body: string; title: string }> = {
  NEWSFEED: {
    body: "Novelists speaking as themselves.",
    title: "Out of character",
  },
  PROMPTS: {
    body: "Openers from characters, waiting for someone to answer.",
    title: "Open prompts",
  },
};

const keyExtractor = (item: Prompt) => item.id;

export const ExploreScreen = () => {
  const theme = useAppTheme();
  const api = useApi();

  /** Web opens on Prompts unless `?tab=newsfeed` says otherwise. */
  const [mode, setMode] = useState<ExploreMode>("PROMPTS");

  const actions = usePromptFeedActions();
  const { canAct, cardProps, expandedIds, novelist, openCompose, unfoldedIds } =
    actions;

  const size = PAGE_SIZE[mode];
  const queryKey =
    mode === "PROMPTS" ? queryKeys.explorePrompts() : queryKeys.oocPosts();

  const query = useInfiniteQuery({
    /*
     * Derived from the last page's own parameter rather than `allPages.length`,
     * which is an accident of what the cache happens to be holding.
     */
    getNextPageParam: (
      lastPage: Prompt[],
      _all: Prompt[][],
      lastPageParam: number,
    ) => (lastPage.length >= size ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Prompt[]> => {
      const fetch = mode === "PROMPTS" ? getExplorePrompts : getNewsFeedPage;
      const result = await fetch(api, pageParam, size);
      // `null` is a 404 — nothing posted, which is an empty list rather than a
      // failure. A `message` is a real error and worth retrying.
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey,
    /*
     * Five minutes rather than the client's default minute. A discovery feed is
     * read in bursts — open it, scroll, open a thread, come back — and a stale
     * infinite query refetches *every loaded page*, so a minute means three
     * round trips for returning from a thread you tapped into.
     */
    staleTime: 5 * 60 * 1000,
  });

  // Memoised: `dedupe()` builds a new array on every render, and a fresh array
  // identity feeding a list's `data` prop is a re-render loop.
  const prompts = useMemo(
    () => dedupeById(query.data?.pages ?? []),
    [query.data],
  );

  // The pull spinner is for pulls, not for the refetch of a feed restored from
  // disk or filled by Home — that one updates the cards where they are.
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

  /*
   * Web's `PromptComposeTrigger`, at the head of the list rather than pinned:
   * it is the first thing on the feed and the thing you scroll past to read,
   * which is what a trigger for "write something" should be. Held so a
   * refetch flag does not rebuild it.
   */
  const header = useMemo(
    () => (
      <View style={styles.header}>
        {canAct ? (
          <ComposeTrigger
            avatarUri={novelist?.avatar?.src ?? novelist?.image}
            name={novelist?.firstName}
            onPress={openCompose}
          />
        ) : null}

        <View style={styles.intro}>
          <View style={styles.introRow}>
            <Text style={[styles.introTitle, { color: theme.textGray }]}>
              {INTRO[mode].title}
            </Text>
            <View
              style={[styles.rule, { backgroundColor: theme.material.edge }]}
            />
          </View>
          <Text style={[styles.introBody, { color: theme.textGray }]}>
            {INTRO[mode].body}
          </Text>
        </View>
      </View>
    ),
    [
      canAct,
      mode,
      novelist?.avatar?.src,
      novelist?.firstName,
      novelist?.image,
      openCompose,
      theme,
    ],
  );

  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  /** Tapping Explore while on Explore takes the feed back to the top. */
  const listRef = useRef<FlashListRef<Prompt>>(null);
  useTabTop(listRef);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const hasPrompts = prompts.length > 0;

  /*
   * Held rather than written inline. Both are plain elements, so a fresh one per
   * render is a reconcile rather than a remount — but this component re-renders
   * on every `isPending` / `isRefetching` / `isFetchingNextPage` transition, and
   * the footer's other arm is `EndOfList`, which is forty-six `react-native-svg`
   * nodes. Not re-walking that subtree when only a refresh flag moved is worth a
   * dependency array.
   */
  const footer = useMemo(() => {
    if (hasNextPage) {
      return (
        <LoadMore
          busy={isFetchingNextPage}
          onPress={() => void fetchNextPage()}
        />
      );
    }

    return hasPrompts ? <EndOfList /> : null;
  }, [fetchNextPage, hasNextPage, hasPrompts, isFetchingNextPage, theme]);

  return (
    <View style={styles.fill}>
      {/*
        Pinned above the list rather than scrolling with it, which is the one
        place this departs from the Interactions header.

        That screen's header is a title and a count — read once, then gone. This
        is a *control*, and the whole screen is one of its two answers. A filter
        that has to be scrolled back to is a filter nobody changes, and on a
        667pt screen "scrolled back to" can be several flicks up a feed.
      */}
      <View
        style={[
          styles.switcher,
          {
            // The header's own surface, so the title and the control under
            // it read as one bar with one edge, and the feed passes under it.
            backgroundColor: theme.glass.opaque,
            borderBottomColor: theme.glass.edge,
          },
        ]}
      >
        <SegmentedTabs
          onChange={(next) => {
            setMode(next);
            // The open sets are ids from the feed being left. Carrying
            // them over would open whichever cards of the *other* feed
            // happened to share an id — and hold their comment queries
            // open for a list nobody is reading.
            actions.reset();
          }}
          options={MODES}
          value={mode}
        />
      </View>

      <FlashList
        {...tabBarScroll}
        ref={listRef}
        contentContainerStyle={contentStyle}
        data={prompts}
        /*
         * The feed's identity, not just the list's. Switching tabs swaps every
         * row for an unrelated one, and a recycling list re-binds its pooled
         * cells by position — so without this the first OOC post would be drawn
         * into the cell still holding the first prompt's expanded comments.
         */
        extraData={mode}
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
                  count={3}
                  gap={space.ms}
                  render={() => <PromptCardSkeleton />}
                />
              }
            />
          ) : (
            <EmptyState
              body={EMPTY[mode].body}
              icon="compass-outline"
              title={EMPTY[mode].title}
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
        onRefresh={pull.onRefresh}
        refreshing={pull.refreshing}
        renderItem={renderItem}
      />

      {actions.sheets}
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: space.md },
  fill: { flex: 1 },
  header: { gap: space.md, paddingBottom: space.m },
  intro: { gap: space.xs },
  introBody: { fontSize: fontSize.caption, lineHeight: 17 },
  introRow: { alignItems: "center", flexDirection: "row", gap: space.m },
  introTitle: type.eyebrow,
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  switcher: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: space.ms,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
});
