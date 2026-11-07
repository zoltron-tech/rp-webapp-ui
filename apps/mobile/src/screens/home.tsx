import { getExplorePrompts, getNewsFeedPage } from "@nw/api/endpoints/feed";
import { getFriendActivities } from "@nw/api/endpoints/home";
import { queryKeys, useApi, useSession } from "@nw/features";
import type { Prompt } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityBox } from "@/components/activity/box";
import { EndOfList } from "@/components/end-of-list";
import { PromptCard } from "@/components/feed/prompt-card";
import { MuseRail } from "@/components/home/muse-rail";
import { NovelistRail } from "@/components/home/novelist-rail";
import { SectionHeader } from "@/components/home/section-header";
import { StoryRail } from "@/components/home/story-rail";
import { BookmarkCard } from "@/components/story/bookmark-card";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { ListStatus } from "@/components/list-status";
import { MediaViewer } from "@/components/muse/media-viewer";
import { FeedCardSkeleton } from "@/components/skeleton";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { useActivityShare } from "@/components/activity/use-activity-share";
import { usePromptFeedActions } from "@/hooks/use-prompt-feed-actions";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useTabTop } from "@/hooks/use-tab-top";
import { useOffline } from "@/lib/connectivity";
import { dedupeById, interleave } from "@/lib/feed";
import { space } from "@/theme";
import { EmptyState, FeedSeparator } from "@/components/list-parts";
import { ComposeTrigger } from "@/components/compose/compose-trigger";
import { CollapsingHeader } from "@/components/collapsing-header";

/**
 * Home — the news feed.
 *
 * The native counterpart to `apps/web/src/app/rp/home`. What is
 * here is the rest of that page: your friends' characters, the strangers the
 * server thinks you should meet, the public characters out there, and the
 * feed — your friends' activity, new in-character prompts and out-of-character
 * posts, dealt round-robin into one list, exactly as web deals them.
 *
 * ## Rails inside the feed, not stacked above it
 *
 * The head of the page is only the way in: search, the post trigger, and the
 * chapter you were reading. The feed starts straight after it, on a prompt.
 * The four rails — your friends' characters, friend suggestions, "Dive into
 * the Stories" and the public characters — are items *in* the feed, before
 * the 4th, 7th, 10th and 13th posts (`RAIL_SLOTS`), the way Instagram puts
 * "suggested for you" between posts. Web deals them at the same places. A
 * reader with a short feed gets the rest at the end, stacked.
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

type RailKind = "friends-muses" | "suggestions" | "stories" | "public-muses";

/**
 * Where the rails sit in the stream: each before the feed item at its index.
 * Web's Home (`apps/web/src/app/rp/home/page.tsx`) uses the same slots.
 */
const RAIL_SLOTS: readonly { at: number; rail: FeedItem }[] = (
  [
    [3, "friends-muses"],
    [6, "suggestions"],
    [9, "stories"],
    [12, "public-muses"],
  ] as const
).map(([at, rail]) => ({ at, rail: { key: `rail-${rail}`, kind: "rail", rail } }));

/**
 * The rows with each rail placed before the row at its index, and any rail
 * the feed is too short to reach at the end.
 */
const dealRails = (rows: readonly FeedItem[]): FeedItem[] => {
  const out: FeedItem[] = [];
  rows.forEach((row, index) => {
    for (const slot of RAIL_SLOTS) if (slot.at === index) out.push(slot.rail);
    out.push(row);
  });
  for (const slot of RAIL_SLOTS)
    if (slot.at >= rows.length) out.push(slot.rail);
  return out;
};

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
  | { kind: "rail"; key: string; rail: RailKind }
  | { kind: "skeleton"; key: string; variant: "prompt" | "activity" };

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
const SKELETON_ITEMS: FeedItem[] = dealRails(
  Array.from({ length: GHOST_POSTS }, (_, index) => ({
    key: `ghost-${index}`,
    kind: "skeleton" as const,
    variant: index % 3 === 1 ? ("activity" as const) : ("prompt" as const),
  })),
);

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
  const { share: shareActivity, sheets: shareSheets } = useActivityShare();
  const {
    canAct,
    cardProps,
    expandedIds,
    novelist: me,
    openCompose,
    showLikers,
    unfoldedIds,
  } = actions;
  /** Written offline, waiting; at the head of the feed they belong to. */
  const queued = actions.queuedPrompts;

  /** A picture from a media activity, opened full screen. */
  const [viewing, setViewing] = useState<string | null>(null);

  const items = useMemo<FeedItem[]>(() => {
    const a = activities.data?.pages ?? [];
    const p = prompts.data?.pages ?? [];
    const o = posts.data?.pages ?? [];
    const queuedPrompts = queued.filter(
      (item) => item.source.sourceType === "MUSE",
    );
    const queuedPosts = queued.filter(
      (item) => item.source.sourceType !== "MUSE",
    );

    // Every prompt on the page, so an activity about one is not a second card.
    const promptIds = new Set<string>();
    for (const page of [...p, ...o])
      for (const item of page) promptIds.add(item.id);

    const depth = Math.max(
      a.length,
      p.length,
      o.length,
      queued.length > 0 ? 1 : 0,
    );
    const feed: FeedItem[] = [];
    for (let i = 0; i < depth; i += 1) {
      // Prompt, then update, then post: the feed opens on a prompt — the
      // thing a writer can answer — as web's does.
      feed.push(
        ...interleave<FeedItem>(
          [...(i === 0 ? queuedPrompts : []), ...(p[i] ?? [])].map((item) => ({
            data: item,
            key: `prompt-${item.id}`,
            kind: "prompt" as const,
          })),
          (a[i] ?? [])
            .filter((item) => !promptIds.has(item.target?.id ?? ""))
            .map((item) => ({
              data: item,
              key: `activity-${item.id}`,
              kind: "activity" as const,
            })),
          [...(i === 0 ? queuedPosts : []), ...(o[i] ?? [])].map((item) => ({
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
    return dealRails(unique);
  }, [activities.data, prompts.data, posts.data, queued]);

  const sources = [activities, prompts, posts];
  const feedPending = sources.every((q) => q.isPending || !q.isEnabled);
  // Nothing from disk and no network to ask: the offline scene, not ghosts
  // that would pulse until the signal returns. See `lib/connectivity.ts`.
  const offline = useOffline();
  const feedOffline = feedPending && offline && queued.length === 0;
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
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() }),
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
              onShare={shareActivity}
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
              {item.rail === "friends-muses" ? (
                <MuseRail title="Characters by your friends" type="friends" />
              ) : item.rail === "suggestions" ? (
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
        {/* Search lives in the header now: the magnifier beside the bell
            (`HeaderActions search`) opens `screens/global-search`. */}
        {canAct ? (
          <View style={styles.compose}>
            <ComposeTrigger
              avatarUri={me?.avatar?.src ?? me?.image}
              name={me?.firstName}
              onPress={openCompose}
            />
          </View>
        ) : null}
        <ContinueReading />
      </View>
    ),
    [
      canAct,
      me?.avatar?.src,
      me?.firstName,
      me?.image,
      openCompose,
    ],
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
      {/* The header leaves with the tab bar on scroll; see `CollapsingHeader`. */}
      <CollapsingHeader search>
        <FlatList
          {...tabBarScroll}
          ref={listRef}
          contentContainerStyle={contentStyle}
          // Ghosts while pending; nothing at all when every source failed or
          // the phone is offline with nothing saved, so the status below is
          // shown instead of three rails over an empty feed.
          data={
            feedPending && !feedOffline && queued.length === 0
              ? SKELETON_ITEMS
              : feedError || feedOffline
                ? []
                : items
          }
          ItemSeparatorComponent={FeedSeparator}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            feedError || feedOffline ? (
              <ListStatus
                error={feedError ?? undefined}
                loading={feedOffline}
                offlineWhat="feed"
                onRetry={refresh}
              />
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
      </CollapsingHeader>

      {actions.sheets}
      {shareSheets}

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

/** Web's Continue Reading: the chapter you touched last. */
const ContinueReading = memo(function ContinueReading() {
  const { bookmarks } = useBookmarks();
  const latest = bookmarks[0];
  if (!latest) return null;
  return (
    <>
      <SectionHeader title="Continue Reading" />
      <View style={styles.continue}>
        <BookmarkCard bookmarked={latest} />
      </View>
    </>
  );
});

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
  continue: { paddingBottom: space.m, paddingHorizontal: space.md },
  header: { gap: space.xs, marginHorizontal: -space.md },
  // A rail runs edge to edge inside the padded feed; it carries its own
  // gutters, so the card row can bleed past the posts' margins.
  // Air above and below: a rail is a change of subject in a column of posts,
  // and at the posts' own spacing it read as one more card.
  rail: { marginHorizontal: -space.md, paddingVertical: space.sm },
});
