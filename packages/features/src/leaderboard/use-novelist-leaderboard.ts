import { getNovelistLeaderboard } from "@nw/api/endpoints/leaderboard";
import type { NovelistLeaderboardEntry } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

export const LEADERBOARD_PAGE_SIZE = 20;

/**
 * The leaderboard is capped rather than endless — the ranking stops meaning
 * anything a long way down, and the API will happily keep serving pages.
 */
export const LEADERBOARD_MAX_TOTAL = 80;

/**
 * The novelist leaderboard, paginated and capped.
 *
 * Both stopping rules are here rather than in a view: a short page means the
 * end of the data, and `LEADERBOARD_MAX_TOTAL` means the end of what is worth
 * showing. The web page had them spread across `loadMore` and the initial
 * fetch, which is how the two came to disagree about the first page.
 */
export const useNovelistLeaderboard = (options?: { enabled?: boolean }) => {
  const api = useApi();

  const query = useInfiniteQuery({
    enabled: options?.enabled ?? true,
    getNextPageParam: (
      lastPage: NovelistLeaderboardEntry[],
      allPages: NovelistLeaderboardEntry[][],
    ) => {
      const loaded = allPages.reduce((total, page) => total + page.length, 0);
      if (lastPage.length === 0 || loaded >= LEADERBOARD_MAX_TOTAL) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await getNovelistLeaderboard(
        api,
        pageParam,
        LEADERBOARD_PAGE_SIZE,
      );
      // The endpoint reports failure as `{ message }` rather than throwing.
      // react-query needs a thrown error to mark the query failed.
      if ("message" in result) {
        throw new Error(String(result.message));
      }
      return result;
    },
    queryKey: queryKeys.novelistLeaderboard(),
  });

  // Memoised for the same reason as `useNotifications` — `.flat()` returns a
  // new array every render, and a consumer that depends on it would spin.
  const entries = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

  return { ...query, entries };
};
