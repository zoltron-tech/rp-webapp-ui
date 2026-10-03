/**
 * Shared prefetch service for the three primary feed sources:
 *   - Explore Prompts (paginated)
 *   - OOC Posts / News Feed (paginated, page 1 only for prefetch)
 *   - Home Activities (paginated)
 *
 * Responsibilities:
 *   1. Issue silent (non-blocking) fetches and write results into the global store.
 *   2. Deduplicate concurrent callers via a module-level in-flight promise map —
 *      any route can attach to an in-flight prefetch instead of starting a new one.
 *   3. Provide a single entry point (`prefetchAllFeeds`) used by both the
 *      login flow and the background poller.
 *
 * The in-flight map is module-level (not in React state) because Promises
 * shouldn't be stored in the store and because we want any route or hook to
 * be able to await the same promise without prop drilling.
 */

import type { Prompt } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import type { StoreState } from "@nw/types/state";
import { getNewPromptsAction } from "@/app/rp/explore-prompts/actions";
import { getFriendActivities } from "@/app/rp/home/actions";
import { getNewsFeedPageAction } from "@/app/rp/news-feed/actions";

/** Per-source page sizes — keep in one place so home and explore stay in sync. */
export const FEED_PAGE_SIZES = {
  explorePrompts: 5,
  homeActivities: 10,
  oocPosts: 8,
} as const;

export type FeedKey = "explorePrompts" | "oocPosts" | "homeActivities";

type SetState = (value: Partial<StoreState>) => void;

const inflight: Partial<Record<FeedKey, Promise<unknown>>> = {};

/** Expose the live in-flight promise for a feed (or undefined if none). */
export const getInflightFeed = <T = unknown>(
  key: FeedKey,
): Promise<T> | undefined => inflight[key] as Promise<T> | undefined;

const isList = <T>(value: unknown): value is T[] =>
  Array.isArray(value) && (value.length === 0 || true);

const runOnce = <T>(key: FeedKey, factory: () => Promise<T>): Promise<T> => {
  const existing = inflight[key] as Promise<T> | undefined;
  if (existing) return existing;
  const p = factory().finally(() => {
    if (inflight[key] === p) delete inflight[key];
  });
  inflight[key] = p;
  return p;
};

/** Fetch page 1 of explore prompts and cache it. Dedupes concurrent callers. */
export const prefetchExplorePrompts = (
  setGlobalState: SetState,
): Promise<Prompt[] | null> =>
  runOnce("explorePrompts", async () => {
    const result = await getNewPromptsAction(1, FEED_PAGE_SIZES.explorePrompts);
    if (isList<Prompt>(result)) {
      setGlobalState({ cachedExplorePrompts: result });
      return result;
    }
    return null;
  });

/** Fetch page 1 of OOC posts (news feed) and cache. Dedupes concurrent callers. */
export const prefetchOOCPosts = (
  setGlobalState: SetState,
): Promise<Prompt[] | null> =>
  runOnce("oocPosts", async () => {
    const result = await getNewsFeedPageAction(1, FEED_PAGE_SIZES.oocPosts);
    if (isList<Prompt>(result)) {
      setGlobalState({ cachedOOCPosts: result });
      return result;
    }
    return null;
  });

/** Fetch page 1 of friend activities and cache. Dedupes concurrent callers. */
export const prefetchHomeActivities = (
  setGlobalState: SetState,
): Promise<Activity[] | null> =>
  runOnce("homeActivities", async () => {
    const result = await getFriendActivities(
      1,
      FEED_PAGE_SIZES.homeActivities,
      "friends",
    );
    if (isList<Activity>(result)) {
      setGlobalState({ cachedHomeActivities: result });
      return result;
    }
    return null;
  });

