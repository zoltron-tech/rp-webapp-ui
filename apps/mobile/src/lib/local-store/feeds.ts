import {
  getExplorePrompts,
  getNewsFeedPage,
  getOutgoingThreads,
} from "@nw/api/endpoints/feed";
import {
  getFriendActivities,
  getMuses,
  getRandomStories,
  getStrangerNovelists,
} from "@nw/api/endpoints/home";
import { queryKeys } from "@nw/features";
import type {
  Muse,
  Novelist,
  Prompt,
  PromptThreadComment,
  StoryBoard,
} from "@nw/types";
import type { Activity } from "@nw/types/activity";
import type { DataType } from "@nw/types/common";
import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";
import type { LocalStore } from "./db";
import { registerHydrator, seedQuery } from "./hydrate";
import { prefetchMedia } from "./media";

/**
 * The Home and Explore feeds in the store.
 *
 * Seven infinite queries, every one paged by number from 1: the discovery
 * feed's prompts and out-of-character posts (which Home reads too), your
 * friends' activity, the two character rails, the friend suggestions and the
 * story rail. Each is kept as its **first few pages**, as the cache holds
 * them — one row per page, the page's items as one `json` column — so a cold
 * start, or a start with no network at all, paints both tabs from disk.
 *
 * ## Short-lived, by design
 *
 * A feed is not an archive. `FEED_KEEP_PAGES` caps how deep a feed is kept
 * (three pages: the first screenful and a flick or two past it), and every
 * write **replaces the feed whole** — what the cache holds now is the feed,
 * and whatever was on disk before it is gone. Pages older than
 * `FEED_MAX_AGE_MS` are dropped at the next purge rather than shown; by then
 * the server's ordering has moved on and a stale page would mislead more
 * than an empty one. Nothing here grows: seven feeds, three pages each, at
 * most.
 *
 * ## Why pages rather than items
 *
 * The server decides the order of a feed, and the client's only handle on
 * that order is the page number it asked for. Storing items with a position
 * would be storing the same thing with an extra join; storing the page as
 * the cache holds it is what `seedQuery` can hand straight back as
 * `InfiniteData`, with `pageParams` counted off `1..n` so "load more" asks
 * for page `n + 1` as if the pages had been fetched this session.
 *
 * ## Media
 *
 * Every picture a page carries — authors' faces, the prompt's own picture,
 * character portraits, story covers — is queued for the media cache as the
 * page is written, so what the feed shows offline is complete. Videos are
 * left to the player (`media.ts` skips them).
 */

/** How many pages a feed keeps. Deeper pages are fetched live, never stored. */
export const FEED_KEEP_PAGES = 3;
/** Pages older than this are purged rather than shown. */
export const FEED_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type Api = Parameters<typeof getExplorePrompts>[0];
type Urls = (string | null | undefined)[];

interface FeedSpec<T = unknown> {
  /** The first `id` segment doubles as the hydrator prefix. */
  id: string;
  key: QueryKey;
  /** The page size the screen asks for; the background asks for the same. */
  pageSize: number;
  /** Pages the background refresh fetches — the feed's depth, or one for a rail. */
  refreshPages: number;
  fetch: (api: Api, page: number) => Promise<DataType<T[]>>;
  media: (item: T) => Urls;
}

const promptMedia = (prompt: Prompt): Urls => [
  prompt.source?.image,
  prompt.source?.avatar?.src,
  prompt.media,
];
const activityMedia = (activity: Activity): Urls => [
  activity.source?.image,
  activity.source?.avatar?.src,
  // A media activity's target *is* the picture; `media.ts` keeps videos out.
  activity.target?.activityTargetType === "MEDIA" ? activity.target.url : null,
];
const museMedia = (muse: Muse): Urls => [muse.image, muse.avatar?.src];
const novelistMedia = (novelist: Novelist): Urls => [
  novelist.image,
  novelist.avatar?.src,
];
const storyMedia = (story: StoryBoard): Urls => [story.image, story.avatar?.src];
const threadMedia = (thread: PromptThreadComment): Urls => [
  thread.source?.image,
  thread.source?.avatar?.src,
  thread.target?.image,
  thread.target?.avatar?.src,
  thread.media,
];

const spec = <T>(feed: FeedSpec<T>): FeedSpec => feed as FeedSpec;

/** Web's page sizes (`FEED_PAGE_SIZES`, `ACTIVITIES_PAGE_SIZE`, the rails'). */
export const FEEDS: readonly FeedSpec[] = [
  spec<Prompt>({
    fetch: (api, page) => getExplorePrompts(api, page, 5),
    id: "explore/prompts",
    key: queryKeys.explorePrompts(),
    media: promptMedia,
    pageSize: 5,
    refreshPages: FEED_KEEP_PAGES,
  }),
  spec<Prompt>({
    fetch: (api, page) => getNewsFeedPage(api, page, 8),
    id: "explore/posts",
    key: queryKeys.oocPosts(),
    media: promptMedia,
    pageSize: 8,
    refreshPages: FEED_KEEP_PAGES,
  }),
  spec<Activity>({
    fetch: (api, page) => getFriendActivities(api, page, 10, "friends"),
    id: "home/activities",
    key: queryKeys.homeActivities(),
    media: activityMedia,
    pageSize: 10,
    refreshPages: FEED_KEEP_PAGES,
  }),
  spec<Muse>({
    fetch: (api, page) => getMuses(api, page, 8, "friends"),
    id: "home/muses/friends",
    key: queryKeys.homeMuses("friends"),
    media: museMedia,
    pageSize: 8,
    refreshPages: 1,
  }),
  spec<Muse>({
    fetch: (api, page) => getMuses(api, page, 8, "unknown"),
    id: "home/muses/unknown",
    key: queryKeys.homeMuses("unknown"),
    media: museMedia,
    pageSize: 8,
    refreshPages: 1,
  }),
  spec<Novelist>({
    fetch: (api, page) => getStrangerNovelists(api, page, 8),
    id: "home/suggestions",
    key: queryKeys.friendSuggestions(),
    media: novelistMedia,
    pageSize: 8,
    refreshPages: 1,
  }),
  spec<StoryBoard>({
    fetch: (api, page) => getRandomStories(api, page, 16),
    id: "home/stories",
    key: queryKeys.homeStories(),
    media: storyMedia,
    pageSize: 16,
    refreshPages: 1,
  }),
  // The Threads tab: the threads you have replied into. Opening one is
  // `interactions.ts`'s business; the list is a feed like the others.
  spec<PromptThreadComment>({
    fetch: (api, page) => getOutgoingThreads(api, page, 5),
    id: "outgoing-threads",
    key: queryKeys.outgoingThreads(),
    media: threadMedia,
    pageSize: 5,
    refreshPages: FEED_KEEP_PAGES,
  }),
];

const BY_ID = new Map(FEEDS.map((feed) => [feed.id, feed]));

const feedIdOf = (key: QueryKey): string | null =>
  key.every((part) => typeof part === "string") ? key.join("/") : null;

type Pages = InfiniteData<unknown[], number>;

const isPages = (value: unknown): value is Pages =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as Pages).pages) &&
  (value as Pages).pages.every(Array.isArray);

/** Writes `pages` as the whole of `feed`, replacing whatever it held. */
export const persistFeed = async (
  store: LocalStore,
  feed: FeedSpec,
  pages: unknown[][],
  fetchedAt: number,
): Promise<void> => {
  const kept = pages.slice(0, FEED_KEEP_PAGES);
  prefetchMedia(
    kept.flatMap((page) => page.flatMap((item) => feed.media(item))),
    "general",
  );
  await store.write(async () => {
    await store.db.runAsync("DELETE FROM feed_page WHERE feed = ?", feed.id);
    for (let index = 0; index < kept.length; index += 1) {
      await store.db.runAsync(
        "INSERT INTO feed_page (feed, page, json, fetched_at) VALUES (?, ?, ?, ?)",
        feed.id,
        index + 1,
        JSON.stringify(kept[index]),
        fetchedAt,
      );
    }
  });
};

/** Drops pages past their age. Called by the refresh's purge step. */
export const purgeOldFeedPages = async (store: LocalStore): Promise<void> => {
  await store.write(() =>
    store.db.runAsync(
      "DELETE FROM feed_page WHERE fetched_at < ?",
      Date.now() - FEED_MAX_AGE_MS,
    ),
  );
};

/**
 * The first pages of `feed` from the server, for the background refresh.
 *
 * Stops at `refreshPages`, at a short page (the feed's end), at the first
 * failure, or when `outOfTime` says so — whatever came back before that is
 * still a correct prefix of the feed and is what gets written.
 */
export const fetchFeedPages = async (
  api: Api,
  feed: FeedSpec,
  outOfTime: () => boolean,
): Promise<unknown[][]> => {
  const pages: unknown[][] = [];
  for (let page = 1; page <= feed.refreshPages; page += 1) {
    if (outOfTime()) break;
    const result = await feed.fetch(api, page);
    if (result === null) {
      // A 404 is "nothing there": an empty page, and the end.
      pages.push([]);
      break;
    }
    if (!Array.isArray(result)) {
      if (pages.length === 0) throw new Error(`feed ${feed.id}: ${result.message}`);
      break;
    }
    pages.push(result);
    if (result.length < feed.pageSize) break;
  }
  return pages;
};

const hydrateFeeds = async (store: LocalStore, queryClient: QueryClient) => {
  const rows = await store.db.getAllAsync<{
    feed: string;
    fetched_at: number;
    json: string;
    page: number;
  }>(
    "SELECT feed, page, json, fetched_at FROM feed_page WHERE fetched_at >= ? ORDER BY feed, page",
    Date.now() - FEED_MAX_AGE_MS,
  );

  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = grouped.get(row.feed) ?? [];
    list.push(row);
    grouped.set(row.feed, list);
  }

  for (const [id, list] of grouped) {
    const feed = BY_ID.get(id);
    if (!feed) continue;
    const pages: unknown[][] = [];
    let oldestFetch = Number.POSITIVE_INFINITY;
    for (const row of list) {
      // Pages must run 1, 2, 3 — a gap would hand the cache a feed with a
      // hole in it and a `pageParams` that lies about what is loaded.
      if (row.page !== pages.length + 1) break;
      try {
        const parsed: unknown = JSON.parse(row.json);
        if (!Array.isArray(parsed)) break;
        pages.push(parsed);
        oldestFetch = Math.min(oldestFetch, row.fetched_at);
      } catch {
        break;
      }
    }
    if (pages.length === 0) continue;
    seedQuery(
      queryClient,
      feed.key,
      { pageParams: pages.map((_, index) => index + 1), pages } satisfies Pages,
      oldestFetch,
    );
  }
};

const persistByKey = async (
  store: LocalStore,
  key: QueryKey,
  data: unknown,
  updatedAt: number,
) => {
  const id = feedIdOf(key);
  const feed = id ? BY_ID.get(id) : undefined;
  if (!feed || !isPages(data)) return;
  await persistFeed(store, feed, data.pages, updatedAt);
};

// One pass over the table serves both prefixes; the second hydrator only persists.
registerHydrator({ hydrate: hydrateFeeds, persist: persistByKey, prefix: "explore" });
registerHydrator({ hydrate: async () => {}, persist: persistByKey, prefix: "home" });
registerHydrator({
  hydrate: async () => {},
  persist: persistByKey,
  prefix: "outgoing-threads",
});
