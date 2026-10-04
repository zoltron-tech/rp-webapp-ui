import { getExplorePrompts, getNewsFeedPage } from "@nw/api/endpoints/feed";
import { getFriendActivities } from "@nw/api/endpoints/home";
import { queryKeys, useApi, useSession } from "@nw/features";
import type { Prompt } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityBox } from "@/components/activity/box";
import { EndOfList } from "@/components/end-of-list";
import { PromptCard } from "@/components/feed/prompt-card";
import { MuseRail } from "@/components/home/muse-rail";
import { NovelistRail } from "@/components/home/novelist-rail";
import { SectionHeader } from "@/components/home/section-header";
import { StoryRail } from "@/components/home/story-rail";
import { ListStatus } from "@/components/list-status";
import { MediaViewer } from "@/components/muse/media-viewer";
import { FeedCardSkeleton } from "@/components/skeleton";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePromptFeedActions } from "@/hooks/use-prompt-feed-actions";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useTabTop } from "@/hooks/use-tab-top";
import { dedupeById, interleave } from "@/lib/feed";
import { space, useAppTheme } from "@/theme";
import { EmptyState, FeedSeparator } from "@/components/list-parts";
import { ComposeTrigger } from "@/components/compose/compose-trigger";

/**
 * Home — the news feed.
 *
 * The native counterpart to `apps/web/src/app/rp/home`, minus the friends
 * strip and the search it puts above everything (both still to come). What is
 * here is the rest of that page: your friends' characters, the strangers the
 * server thinks you should meet, the public characters out there, and the
 * feed — your friends' activity, new in-character prompts and out-of-character
 * posts, dealt round-robin into one list, exactly as web deals them.
 *
 * ## Rails inside the feed, not stacked above it
 *
 * Web puts three horizontal rails between the top of the page and the first
 * post. On a 667pt screen that is three screens of scrolling before the feed
 * begins, which is the wrong shape for a phone: Instagram and the rest put
 * "suggested for you" *between* posts, a few cards down, where it reads as
 * part of the stream. So the friends' characters — the rail a friend-driven
 * feed is most about — stay at the head, and the friend suggestions, web's
 * "Dive into the Stories" and the public characters are items *in* the feed,
 * after the third, fifth and seventh posts. A reader with an empty feed sees
 * them stacked, as on web.
 *
 * ## One list, three sources, stable order
 *
 * Each source is its own infinite query and pages independently — activities
 * by ten, prompts by five, posts by eight, web's sizes — and the list is built
 * page by page: page *n* of each, interleaved, after page *n − 1*. Nothing
 * already on screen moves when a page arrives, which is what a feed owes the
 * reader, and the build is a `useMemo` over the three caches rather than a
 * fourth copy of the data. Activities whose target is a prompt already in the
 * feed are dropped, as web's `firstPagePromptIds` drops them, so a friend's
 * new prompt is one card and not two.
 *
 * The prompts and posts read the *same* cache entries Explore reads
 * (`explorePrompts`, `oocPosts`) — same endpoints, same page sizes — so a heart
 * or a reply given here is already right on Explore, and one fetch serves both.
 * Everything a card can do comes from `usePromptFeedActions`, shared with
 * Explore for the same reason.
 *
 * ## Why a `FlatList`
 *
 * Rows here are every height a row can be — a one-line activity, a picture
 * activity, a prompt with a folded body, a rail of cards — and a recycler
 * that needs a size estimate does worse than the plain list with mixed heights;
 * see `activity-list.tsx` for the same call.
 */

/** Web's `FEED_PAGE_SIZES` and `ACTIVITIES_PAGE_SIZE`. */
const PAGE = { activities: 10, posts: 8, prompts: 5 } as const;

/** Where the rails sit in the stream, as an index into the feed. */
const SUGGESTIONS_AT = 3;
const STORIES_AT = 5;
const STRANGERS_AT = 7;

/** Fetch the next pages a screen and a half early; see `explore.tsx`. */
const END_REACHED_THRESHOLD = 1.5;

/**
 * How much of the feed is built before it is needed.
 *
 * `FlatList`'s defaults mount ten rows on the first pass, then batches of ten
 * more until ten screens of rows exist — on this feed, sixteen prompt cards
 * and three rails inside the first two seconds of a cold start, all on the JS
 * thread the network responses and the tab bar are waiting behind. Four rows
 * fill the first screen; the rest arrive in small batches as the reader scrolls
 * toward them, well inside the end-reached threshold above.
 */
const INITIAL_ROWS = 4;
const BATCH_ROWS = 3;
const WINDOW_SCREENS = 5;

type FeedItem =
  | { kind: "activity"; key: string; data: Activity }
  | { kind: "prompt"; key: string; data: Prompt }
  | {
      kind: "rail";
      key: string;
      rail: "suggestions" | "stories" | "strangers";
    }
  | { kind: "skeleton"; key: string; variant: "prompt" | "activity" };

const RAIL_SUGGESTIONS: FeedItem = {
  key: "rail-suggestions",
  kind: "rail",
  rail: "suggestions",
};
const RAIL_STORIES: FeedItem = {
  key: "rail-stories",
  kind: "rail",
  rail: "stories",
};
const RAIL_STRANGERS: FeedItem = {
  key: "rail-strangers",
  kind: "rail",
  rail: "strangers",
};

/**
 * The page before the feed has answered.
 *
 * Ghost cards in the feed's own rhythm, with the rails already dealt in at
 * their places. Each rail fetches for itself and draws its own shimmer, so
 * none of them has any reason to wait for the posts — and handing the list
 * nothing until the posts arrived was hiding all three behind a spinner. The
 * rails keep the same keys they have in the real feed, so when the posts land
 * the list swaps the ghosts out around them without remounting a rail.
 */
const GHOST_POSTS = 7;
const SKELETON_ITEMS: FeedItem[] = (() => {
  const out: FeedItem[] = [];
  for (let index = 0; index < GHOST_POSTS; index += 1) {
    if (index === SUGGESTIONS_AT) out.push(RAIL_SUGGESTIONS);
    if (index === STORIES_AT) out.push(RAIL_STORIES);
    if (index === STRANGERS_AT) out.push(RAIL_STRANGERS);
    out.push({
      key: `ghost-${index}`,
      kind: "skeleton",
      variant: index % 3 === 1 ? "activity" : "prompt",
    });
  }
  if (STRANGERS_AT >= GHOST_POSTS) out.push(RAIL_STRANGERS);
  return out;
})();

const keyExtractor = (item: FeedItem) => item.key;
/** A `null` page is a 404 — nothing there; a `message` is a real failure. */
const unwrap = <T,>(result: T[] | { message: unknown } | null): T[] => {
  if (result === null) return [];
  if ("message" in result) throw new Error(String(result.message));
  return result;
};

const nextPage =
  (size: number) =>
  <T,>(lastPage: T[], _all: T[][], lastPageParam: number) =>
    lastPage.length >= size ? lastPageParam + 1 : undefined;

const STALE = 5 * 60 * 1000;

export const HomeScreen = () => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const signedIn = status === "signed-in";

  const activities = useInfiniteQuery({
    enabled: signedIn,
    getNextPageParam: nextPage(PAGE.activities),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Activity[]> =>
      unwrap(
        await getFriendActivities(api, pageParam, PAGE.activities, "friends"),
      ),
    queryKey: queryKeys.homeActivities(),
    staleTime: STALE,
  });

  const prompts = useInfiniteQuery({
    getNextPageParam: nextPage(PAGE.prompts),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Prompt[]> =>
      unwrap(await getExplorePrompts(api, pageParam, PAGE.prompts)),
    queryKey: queryKeys.explorePrompts(),
    staleTime: STALE,
  });

  const posts = useInfiniteQuery({
    getNextPageParam: nextPage(PAGE.posts),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Prompt[]> =>
      unwrap(await getNewsFeedPage(api, pageParam, PAGE.posts)),
    queryKey: queryKeys.oocPosts(),
    staleTime: STALE,
  });

  const actions = usePromptFeedActions();
  const {
    canAct,
    cardProps,
    expandedIds,
    novelist: me,
    openCompose,
    showLikers,
    unfoldedIds,
  } = actions;

  /** A picture from a media activity, opened full screen. */
  const [viewing, setViewing] = useState<string | null>(null);

  const items = useMemo<FeedItem[]>(() => {
    const a = activities.data?.pages ?? [];
    const p = prompts.data?.pages ?? [];
    const o = posts.data?.pages ?? [];

    // Every prompt on the page, so an activity about one is not a second card.
    const promptIds = new Set<string>();
    for (const page of [...p, ...o])
      for (const item of page) promptIds.add(item.id);

    const depth = Math.max(a.length, p.length, o.length);
    const feed: FeedItem[] = [];
    for (let i = 0; i < depth; i += 1) {
      feed.push(
        ...interleave<FeedItem>(
          (a[i] ?? [])
            .filter((item) => !promptIds.has(item.target?.id ?? ""))
            .map((item) => ({
              data: item,
              key: `activity-${item.id}`,
              kind: "activity" as const,
            })),
          (p[i] ?? []).map((item) => ({
            data: item,
            key: `prompt-${item.id}`,
            kind: "prompt" as const,
          })),
          (o[i] ?? []).map((item) => ({
            data: item,
            key: `post-${item.id}`,
            kind: "prompt" as const,
          })),
        ),
      );
    }
    const unique = dedupeById([
      feed.map((item) => ({ ...item, id: item.key })),
    ]) as (FeedItem & { id: string })[];

    // The rails, dealt in at their places — or at the end of a short feed.
    const out: FeedItem[] = [];
    let placedSuggestions = false;
    let placedStories = false;
    let placedStrangers = false;
    unique.forEach((item, index) => {
      if (index === SUGGESTIONS_AT) {
        out.push(RAIL_SUGGESTIONS);
        placedSuggestions = true;
      }
      if (index === STORIES_AT) {
        out.push(RAIL_STORIES);
        placedStories = true;
      }
      if (index === STRANGERS_AT) {
        out.push(RAIL_STRANGERS);
        placedStrangers = true;
      }
      out.push(item);
    });
    if (!placedSuggestions) out.push(RAIL_SUGGESTIONS);
    if (!placedStories) out.push(RAIL_STORIES);
    if (!placedStrangers) out.push(RAIL_STRANGERS);
    return out;
  }, [activities.data, prompts.data, posts.data]);

  const sources = [activities, prompts, posts];
  const feedPending = sources.every((q) => q.isPending || !q.isEnabled);
  const feedError =
    sources.every((q) => q.error || !q.isEnabled) &&
    sources.some((q) => q.error)
      ? (sources.find((q) => q.error)?.error ?? null)
      : null;
  const fetchingMore = sources.some((q) => q.isFetchingNextPage);
  const hasMore = sources.some((q) => q.hasNextPage);
  const postCount = items.filter((item) => item.kind !== "rail").length;

  // Plain functions: the list is the only reader and it is not memoised on
  // them, while the query objects they read change identity every render.
  const loadMore = () => {
    for (const q of sources) {
      if (q.hasNextPage && !q.isFetchingNextPage) void q.fetchNextPage();
    }
  };

  /** Everything on the page, again — the rails through their shared prefix. */
  const refreshAll = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["home"] }),
      prompts.refetch(),
      posts.refetch(),
    ]);

  /*
   * The pull spinner only for a pull. It used to follow every source's
   * `isRefetching`, so the refetch of a feed restored from disk — or of any
   * source gone stale — drew a spinner over a page that was already showing.
   */
  const { onRefresh: refresh, refreshing } = usePullToRefresh(refreshAll);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      switch (item.kind) {
        case "activity":
          return (
            <ActivityBox
              activity={item.data}
              onOpenMedia={setViewing}
              onShowLikers={showLikers}
            />
          );
        case "prompt":
          return (
            <PromptCard
              {...cardProps}
              expanded={expandedIds.has(item.data.id)}
              prompt={item.data}
              unfolded={unfoldedIds.has(item.data.id)}
            />
          );
        case "skeleton":
          return <FeedCardSkeleton variant={item.variant} />;
        case "rail":
          return (
            <View style={styles.rail}>
              {item.rail === "suggestions" ? (
                <NovelistRail />
              ) : item.rail === "stories" ? (
                <StoryRail />
              ) : (
                <MuseRail title="Public characters out there" type="unknown" />
              )}
            </View>
          );
      }
    },
    [cardProps, expandedIds, showLikers, unfoldedIds],
  );

  /*
   * Held rather than written inline. The header has a rail with its own list
   * and the footer's other arm is `EndOfList`, forty-six SVG nodes — neither
   * should re-walk because a refetch flag moved.
   */
  const header = useMemo(
    () => (
      <View style={styles.header}>
        {/*
          The way in to writing, at the top of the page you land on. Explore
          had it and Home did not, so the first thing the app offered a
          returning writer was other people's work and no pen.
        */}
        {canAct ? (
          <View style={styles.compose}>
            <ComposeTrigger
              avatarUri={me?.avatar?.src ?? me?.image}
              name={me?.firstName}
              onPress={openCompose}
            />
          </View>
        ) : null}
        <MuseRail title="Characters by your friends" type="friends" />
        {feedPending || postCount > 0 ? (
          <SectionHeader title="Updates from your friends" />
        ) : null}
      </View>
    ),
    [canAct, feedPending, me?.avatar?.src, me?.firstName, me?.image, openCompose, postCount],
  );

  const footer = useMemo(() => {
    // The next page's ghost, in the separator's rhythm, rather than a spinner
    // under the last card.
    if (fetchingMore) {
      return (
        <View style={styles.footerGhost}>
          <FeedCardSkeleton variant="prompt" />
        </View>
      );
    }
    if (!hasMore && postCount > 0) return <EndOfList />;
    return null;
  }, [fetchingMore, hasMore, postCount]);

  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  /** Tapping Home while on Home takes the feed back to the top. */
  const listRef = useRef<FlatList<FeedItem>>(null);
  useTabTop(listRef);

  return (
    <View style={styles.fill}>
      <FlatList
        {...tabBarScroll}
        ref={listRef}
        contentContainerStyle={contentStyle}
        // Ghosts while pending; nothing at all when every source failed, so
        // the retry below is shown instead of three rails over an empty feed.
        data={feedPending ? SKELETON_ITEMS : feedError ? [] : items}
        ItemSeparatorComponent={FeedSeparator}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          feedError ? (
            <ListStatus error={feedError} onRetry={refresh} />
          ) : (
            <EmptyState
              body="When your friends write, their updates land here. Find some novelists to follow along."
              icon="home-outline"
              title="Nothing here yet"
            />
          )
        }
        ListFooterComponent={footer}
        ListHeaderComponent={header}
        onEndReached={loadMore}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        onRefresh={refresh}
        refreshing={refreshing}
        renderItem={renderItem}
        initialNumToRender={INITIAL_ROWS}
        maxToRenderPerBatch={BATCH_ROWS}
        windowSize={WINDOW_SCREENS}
      />

      {actions.sheets}

      {/* One picture, read-only: no captions, no owner tools. */}
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
  // The feed's gutter. Posts sit inside it; rails and the header bleed back
  // out with `rail`/`header` and carry their own.
  content: {
    paddingBottom: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  fill: { flex: 1 },
  footerGhost: { paddingTop: space.ms },
  compose: { paddingBottom: space.m, paddingHorizontal: space.md },
  header: { gap: space.xs, marginHorizontal: -space.md },
  // A rail runs edge to edge inside the padded feed; it carries its own
  // gutters, so the card row can bleed past the posts' margins.
  // Air above and below: a rail is a change of subject in a column of posts,
  // and at the posts' own spacing it read as one more card.
  rail: { marginHorizontal: -space.md, paddingVertical: space.sm },
});
