import { getNotifications } from "@nw/api/endpoints/novelists";
import type { NovelistWorldNotification } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApi } from "../api-context";
import { queryKeys } from "../keys";

export const NOTIFICATIONS_PAGE_SIZE = 20;

/**
 * The notification list, paginated.
 *
 * Replaces the hand-rolled version the web page carried: a `page` state, a
 * `hasMore` state, a `loadingMore` state, an `initialLoadDone` ref, and a
 * `fetchPage(page, append)` that wrote the result into the global store. All of
 * that is `useInfiniteQuery`'s job, and it is the same job on both clients.
 *
 * The one piece of real logic worth keeping is the end-of-list rule: the API
 * has no total, so a short page means the end. It lives in `getNextPageParam`.
 */
export const useNotifications = (options?: { enabled?: boolean }) => {
  const api = useApi();

  const query = useInfiniteQuery({
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage: NovelistWorldNotification[], allPages) =>
      lastPage.length < NOTIFICATIONS_PAGE_SIZE
        ? undefined
        : allPages.length + 1,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await getNotifications(
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
      return result ?? [];
    },
    queryKey: queryKeys.notifications(),
  });

  /**
   * Every page flattened, which is what a list view actually renders.
   *
   * Memoised, and it matters: `.flat()` builds a new array on every render, so
   * an unmemoised value makes any consumer that puts it in a dependency array
   * spin. The web page mirrors this into the global store from a `useEffect` —
   * a fresh reference each render would set state, re-render, and set again.
   */
  const notifications = useMemo(
    () => query.data?.pages.flat() ?? [],
    [query.data],
  );

  return { ...query, notifications };
};
