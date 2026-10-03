import { getFriendsByUsername } from "@nw/api/endpoints/novelists";
import type { Friend } from "@nw/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

/**
 * A novelist's friends, a page at a time.
 *
 * The endpoint returns a bare array with no total, so "is there more" can only
 * be inferred from a full page coming back — the same rule the web page applies,
 * and the reason it lives here rather than being re-derived on each client.
 *
 * The cost of getting that rule wrong is a "Load more" that never stops, or a
 * list that silently truncates.
 *
 * ## Why twenty and not eight
 *
 * Eight was what the web friends page had always asked for, and it is the wrong
 * unit. The cost of this endpoint is almost entirely the *pipeline* rather than
 * the row count: `NovelistService.enrichNovelistOverviews` runs a blocked-id
 * filter, a novelist load, a user-service round trip for usernames, muses, muse
 * points, muse enrichment (a second user-service call), mutual-friend counts,
 * points, ranks, badges and connections — ten-odd queries and two cross-service
 * hops, whether it returns eight people or twenty.
 *
 * So eight bought a third of a phone screen for the whole of that bill, and a
 * tall screen needed two or three of them before the list even looked complete.
 */
export const FRIENDS_PAGE_SIZE = 20;

/**
 * How long a loaded friends list stays fresh.
 *
 * Longer than the client default of a minute, and the reason is specific to
 * infinite queries: when one goes stale, react-query refetches **every loaded
 * page**, not just the first. Four pages loaded and a minute elapsed meant four
 * sequential trips through the pipeline above, triggered by nothing more than
 * navigating back to the screen.
 *
 * Five minutes is what makes leaving a profile and coming back free. A friends
 * list is not a feed; people do not gain and lose friends by the minute.
 */
const FRIENDS_STALE_TIME = 5 * 60 * 1000;

/**
 * How long it survives once nothing is rendering it.
 *
 * A day, rather than the five-minute default, so the list is still there when
 * someone comes back to it — and so the persister has something to write. This
 * is the cache tier that makes re-opening the screen paint immediately instead
 * of showing a spinner over data we already had.
 */
const FRIENDS_GC_TIME = 24 * 60 * 60 * 1000;

const friendsQueryOptions = (
  api: ReturnType<typeof useApi>,
  username: string,
) => ({
  gcTime: FRIENDS_GC_TIME,
  /*
   * Derived from the *last page's* param rather than `allPages.length`.
   *
   * They agree today, and they stop agreeing the moment anything drops a page
   * from the front of the list. Counting the pages we happen to be holding is
   * an accident of the cache; incrementing the parameter we last asked for is
   * the actual contract with the endpoint.
   */
  getNextPageParam: (
    lastPage: Friend[],
    _allPages: Friend[][],
    lastPageParam: number,
  ) => (lastPage.length >= FRIENDS_PAGE_SIZE ? lastPageParam + 1 : undefined),
  initialPageParam: 1,
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getFriendsByUsername(api, username, pageParam, FRIENDS_PAGE_SIZE),
  queryKey: queryKeys.novelistFriends(username),
  staleTime: FRIENDS_STALE_TIME,
});

export const useNovelistFriends = (username: string | undefined) => {
  const api = useApi();

  const query = useInfiniteQuery({
    ...friendsQueryOptions(api, username ?? ""),
    enabled: Boolean(username),
  });

  // Memoised: `flat()` builds a new array on every render, and a fresh array
  // identity feeding an effect or a list's `data` prop is a re-render loop.
  const friends = useMemo(() => (query.data?.pages ?? []).flat(), [query.data]);

  /**
   * The usernames on this list, for presence registration.
   *
   * Memoised here rather than at each call site: it is one `map` over every
   * loaded friend, and a screen that built it inline paid for it on every
   * render — including the renders that presence itself caused.
   */
  const trackedUsernames = useMemo(
    () => friends.map((friend) => friend.username),
    [friends],
  );

  return {
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    friends,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isPending: query.isPending,
    refetch: () => {
      void query.refetch();
    },
    trackedUsernames,
  };
};

/**
 * Warms the first page of somebody's friends before anyone asks for it.
 *
 * Called when a profile opens, so that tapping through to the friends list
 * paints from cache rather than starting the request at the moment the screen
 * appears. This is the oldest trick in a native feed: the network round trip is
 * spent while the reader is still looking at something else.
 *
 * `prefetchInfiniteQuery` is a no-op when the data is already fresh, so calling
 * it on every profile open costs nothing after the first.
 */
export const usePrefetchNovelistFriends = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useCallback(
    (username: string | undefined) => {
      if (!username) return;
      void queryClient.prefetchInfiniteQuery({
        ...friendsQueryOptions(api, username),
        pages: 1,
      });
    },
    [api, queryClient],
  );
};
