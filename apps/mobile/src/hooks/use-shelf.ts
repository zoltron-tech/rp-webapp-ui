import { getShelf, getShelfSummary } from "@nw/api/endpoints/books";
import { useApi } from "@nw/features";
import type {
  BookStatus,
  ShelfEntry,
  ShelfPage,
  ShelfSummary,
} from "@nw/types/books";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * A novelist's bookshelf, read-only (BOOKSHELF_PLAN.md §5, phase 1).
 *
 * Two public reads keyed by the novelist's id, both answering 404 when the
 * owner's privacy hides the shelf from the viewer — `@nw/api` hands that back
 * as `null`, which is "show nothing", not a failure. A `message` is a real
 * error worth a retry. The two must not collapse: one omits the section, the
 * other draws "Try again".
 *
 * Kept in the app rather than `@nw/features` for that package's stated rule
 * (see `use-profile-song.ts`): web reaches these through server actions.
 */

/** Web's page size for the Books tab grid. */
export const SHELF_PAGE_SIZE = 24;

const shelfKey = (novelistId: string) => ["shelf", novelistId] as const;

/** `undefined` while loading, `null` when hidden from the viewer. */
export const useShelfSummary = (novelistId: string | undefined) => {
  const api = useApi();

  return useQuery({
    enabled: Boolean(novelistId),
    queryFn: async (): Promise<ShelfSummary | null> => {
      const result = await getShelfSummary(api, novelistId ?? "");
      if (result === null) return null;
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: [...shelfKey(novelistId ?? ""), "summary"],
    // A shelf changes when its owner shelves a book, not while someone else
    // is reading their profile.
    staleTime: 5 * 60_000,
  });
};

/**
 * One status of the shelf, paged — the Books screen's grid.
 *
 * Sort is pinned to "shelved" (newest first) until the sort control lands.
 * The server's pages are zero-based.
 */
export const useShelfPage = (
  novelistId: string | undefined,
  status: BookStatus,
) => {
  const api = useApi();

  const query = useInfiniteQuery({
    enabled: Boolean(novelistId),
    getNextPageParam: (lastPage: ShelfPage | null) =>
      lastPage && (lastPage.page + 1) * lastPage.size < lastPage.total
        ? lastPage.page + 1
        : undefined,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ShelfPage | null> => {
      const result = await getShelf(
        api,
        novelistId ?? "",
        status,
        "shelved",
        pageParam,
        SHELF_PAGE_SIZE,
      );
      if (result === null) return null;
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: [...shelfKey(novelistId ?? ""), status, "shelved"],
    staleTime: 5 * 60_000,
  });

  // Memoised: `flatMap` builds a new array each render, and a fresh identity
  // feeding a list's `data` is a re-render loop.
  const items = useMemo<ShelfEntry[]>(
    () => query.data?.pages.flatMap((page) => page?.items ?? []) ?? [],
    [query.data],
  );

  /** The shelf is hidden from the viewer: the first page answered 404. */
  const hidden = query.data?.pages[0] === null;

  return { ...query, hidden, items };
};
