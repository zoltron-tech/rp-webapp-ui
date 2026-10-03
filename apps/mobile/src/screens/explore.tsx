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
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import { fontSize, radius, space, useAppTheme } from "@/theme";

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
  mode: ExploreMode;
}[] = [
  { icon: "eye-off-outline", label: "OOC", mode: "NEWSFEED" },
  { icon: "bookmarks-outline", label: "Prompts", mode: "PROMPTS" },
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

const keyExtractor = (item: Prompt) => item.id;

const Separator = () => <View style={styles.separator} />;

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
    () =>
      canAct ? (
        <View style={styles.trigger}>
          <ComposeTrigger
            avatarUri={novelist?.avatar?.src ?? novelist?.image}
            name={novelist?.firstName}
            onPress={openCompose}
          />
        </View>
      ) : null,
    [
      canAct,
      novelist?.avatar?.src,
      novelist?.firstName,
      novelist?.image,
      openCompose,
    ],
  );

  // The bar floats over this list: `tabBarScroll` is what sizes it as the list
  // moves, and the content style is what keeps the last card reachable under it.
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
        <Pressable
          disabled={isFetchingNextPage}
          onPress={() => void fetchNextPage()}
          style={({ pressed }) => [
            styles.loadMore,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          {isFetchingNextPage ? (
            <ActivityIndicator color={theme.accent.text} size="small" />
          ) : null}
          <Text style={[styles.loadMoreLabel, { color: theme.accent.text }]}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Text>
        </Pressable>
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
            borderBottomColor: theme.material.edge,
          },
        ]}
      >
        {MODES.map((item) => {
          const active = mode === item.mode;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={item.mode}
              onPress={() => {
                if (item.mode === mode) return;
                setMode(item.mode);
                // The open sets are ids from the feed being left. Carrying
                // them over would open whichever cards of the *other* feed
                // happened to share an id — and hold their comment queries
                // open for a list nobody is reading.
                actions.reset();
              }}
              style={({ pressed }) => [
                styles.tab,
                {
                  // One tinted segment: the one you are on. Tinting both
                  // left two accent controls competing for the same glance.
                  backgroundColor: active
                    ? theme.accent.surfaceActive
                    : pressed
                      ? theme.material.fillPressed
                      : theme.material.fill,
                  borderColor: active
                    ? theme.accent.solid
                    : theme.material.edge,
                },
              ]}
            >
              <Ionicons
                color={active ? theme.accent.textStrong : theme.textGray}
                name={item.icon}
                size={16}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: active ? theme.accent.textStrong : theme.textGray,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
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
        ItemSeparatorComponent={Separator}
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
                  gap={space.sm + 2}
                  render={() => <PromptCardSkeleton />}
                />
              }
            />
          ) : (
            <View style={styles.empty}>
              <Ionicons
                color={theme.textGray}
                name="compass-outline"
                size={40}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {EMPTY[mode].title}
              </Text>
              <Text style={[styles.emptyBody, { color: theme.textGray }]}>
                {EMPTY[mode].body}
              </Text>
            </View>
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
  empty: {
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
  },
  emptyBody: {
    fontSize: fontSize.label,
    lineHeight: 19,
    textAlign: "center",
  },
  emptyTitle: { fontSize: fontSize.title, fontWeight: "700" },
  fill: { flex: 1 },
  loadMore: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    marginTop: space.sm,
    paddingVertical: space.md,
  },
  loadMoreLabel: { fontSize: fontSize.body, fontWeight: "600" },
  separator: { height: space.sm + 2 },
  switcher: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  tab: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: "row",
    gap: space.xs + 2,
    justifyContent: "center",
    // 36 rather than 44: two of these sit between the nav bar and the first
    // card, and every point they take is a point off a 667pt screen's feed.
    minHeight: 36,
    paddingHorizontal: space.sm,
  },
  tabLabel: {
    fontSize: fontSize.label,
    fontStyle: "italic",
    fontWeight: "600",
  },
  trigger: { paddingBottom: space.sm + 2 },
});
