import { getNotificationFeed } from "@nw/api/endpoints/novelists";
import type { NotificationFeed } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

export const NOTIFICATIONS_PAGE_SIZE = 20;

const EMPTY_PAGE: NotificationFeed = { items: [], nextCursor: null };

/**
 * The notification list, paginated.
 *
 * By cursor, not by page number. A row that a new like or reply folds into
 * moves to the top, which shifts every row below it down a place: "page 2" then
 * repeats the last row of page 1. "Everything older than the last row I have"
 * cannot repeat or skip, whatever moved above it.
 *
 * The server also says outright when the list ends (`nextCursor` is null). The
 * old rule — a short page means the end — stopped early whenever a row whose
 * author no longer exists was left out of a full page.
 */
export const useNotifications = (options?: { enabled?: boolean }) => {
  const api = useApi();

  const query = useInfiniteQuery({
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage: NotificationFeed) =>
      lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const result = await getNotificationFeed(
        api,
        pageParam,
        NOTIFICATIONS_PAGE_SIZE,
      );
      // The endpoint's `DataType` is `ErrorType | T | null`. A null (its 404
      // behaviour) is "we do not know", which for a list page reads the same as
      // "nothing more"; an `{ message }` is a real failure and has to throw,
      // because that is the only thing react-query counts as one.
      if (result && "message" in result) {
        throw new Error(String(result.message));
      }
      return result ?? EMPTY_PAGE;
    },
    queryKey: queryKeys.notifications(),
  });

  /**
   * Every page flattened, which is what a list view actually renders.
   *
   * Memoised, and it matters: `.flatMap()` builds a new array on every render,
   * so an unmemoised value makes any consumer that puts it in a dependency
   * array spin. The web page mirrors this into the global store from a
   * `useEffect` — a fresh reference each render would set state, re-render, and
   * set again.
   *
   * De-duplicated by id: pages are fetched at different moments, and a row that
   * moved to the top between two of them is in both.
   */
  const notifications = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages ?? [])
      .flatMap((page) => page.items)
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
  }, [query.data]);

  return { ...query, notifications };
};
