import {
  type ClipItem,
  type GifItem,
  type StickerItem,
  searchClips,
  searchGifs,
  searchStickers,
} from "@nw/api/endpoints/community";
import { useApi } from "@nw/features";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

/**
 * Searching Klipy for GIFs, stickers and clips — one hook behind three grids.
 *
 * The three pickers used to be three near-identical `useEffect`s that differed
 * only in which endpoint they called and how its pages were numbered. Now the
 * page function is the only thing each picker supplies.
 *
 * ## Through react-query
 *
 * The first version held its results in component state and fetched on every
 * mount. That meant a fresh request — and a grid of skeleton tiles — every
 * time the tray was opened, for a trending list that had not changed since the
 * last time. Now each `(kind, query)` is a cached infinite query: reopening
 * the tray shows the last results at once and refreshes them quietly, typing
 * a query you typed a minute ago is instant, and paging is `fetchNextPage`
 * rather than a hand-rolled cursor.
 *
 * It also happens to be the robust choice on this runtime: react-query commits
 * through `useSyncExternalStore`, so a result landing from the network paints
 * without depending on the scheduler (see `scheduler-heartbeat.tsx`).
 *
 * ## While typing
 *
 * `placeholderData: keepPreviousData` keeps the last query's results on screen
 * while the next one loads — the grid never flashes empty between keystrokes,
 * and the tile you were about to tap does not vanish from under your thumb.
 * `loading` is true in that window, and the grid dims what it shows.
 *
 * ## Repeated pages
 *
 * Klipy's cursors sometimes hand back a page that overlaps the previous one,
 * most often in trending where the ranking moves under the cursor. Pages are
 * merged by id, and a page that adds nothing new is treated as the end,
 * whatever the cursor says — otherwise the grid asks for the same page on
 * every scroll to the bottom.
 */

export interface MediaPage<TItem, TCursor> {
  items: TItem[];
  next: TCursor | null;
}

export interface MediaSearch<TItem> {
  items: TItem[];
  /** True while the results on screen are not yet those of `query`. */
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  query: string;
  setQuery: (query: string) => void;
}

type MediaKind = "gif" | "sticker" | "clip";

/** Long enough that a fast typist sends one request, short enough to feel live. */
const DEBOUNCE_MS = 350;

/** Trending moves, but not by the minute. */
const STALE_MS = 5 * 60 * 1000;
/** Long enough to survive a conversation being opened and closed a few times. */
const GC_MS = 30 * 60 * 1000;

/** Thirty fills more than a screen of the grid at every phone width. */
const PAGE_SIZE = 30;

/** Every item across the pages, first occurrence of each id only. */
const flattenUnique = <TItem extends { id: string }>(
  pages: { items: TItem[] }[],
): TItem[] => {
  const seen = new Set<string>();
  const out: TItem[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
};

const useMediaSearch = <TItem extends { id: string }, TCursor>(
  kind: MediaKind,
  fetchPage: (
    query: string,
    cursor: TCursor | null,
  ) => Promise<MediaPage<TItem, TCursor>>,
): MediaSearch<TItem> => {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, DEBOUNCE_MS).trim();

  const result = useInfiniteQuery({
    gcTime: GC_MS,
    getNextPageParam: (
      lastPage: MediaPage<TItem, TCursor>,
      allPages: MediaPage<TItem, TCursor>[],
    ) => {
      if (lastPage.next === null) return undefined;
      // A page that only repeats what came before is the end.
      const earlier = new Set(
        allPages.slice(0, -1).flatMap((page) => page.items.map((i) => i.id)),
      );
      const grew = lastPage.items.some((item) => !earlier.has(item.id));
      return grew ? lastPage.next : undefined;
    },
    initialPageParam: null as TCursor | null,
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) =>
      fetchPage(debounced, pageParam as TCursor | null),
    queryKey: ["klipy", kind, debounced] as const,
    staleTime: STALE_MS,
  });

  const items = useMemo(
    () => flattenUnique(result.data?.pages ?? []),
    [result.data],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = result;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    hasMore: hasNextPage,
    items,
    // Either nothing has ever loaded for this query, or what is on screen is
    // the previous query's, kept while this one arrives.
    loading: result.isPending || result.isPlaceholderData,
    loadingMore: isFetchingNextPage,
    loadMore,
    query,
    setQuery,
  };
};

export const useGifSearch = (): MediaSearch<GifItem> => {
  const api = useApi();
  return useMediaSearch<GifItem, string>(
    "gif",
    useCallback(
      async (query, cursor) => {
        const page = await searchGifs(
          api,
          query,
          PAGE_SIZE,
          cursor ?? undefined,
        );
        return { items: page.items, next: page.next };
      },
      [api],
    ),
  );
};

export const useStickerSearch = (): MediaSearch<StickerItem> => {
  const api = useApi();
  return useMediaSearch<StickerItem, number>(
    "sticker",
    useCallback(
      async (query, cursor) => {
        const page = cursor ?? 1;
        const result = await searchStickers(api, query, PAGE_SIZE, page);
        return { items: result.items, next: result.hasNext ? page + 1 : null };
      },
      [api],
    ),
  );
};

export const useClipSearch = (): MediaSearch<ClipItem> => {
  const api = useApi();
  return useMediaSearch<ClipItem, number>(
    "clip",
    useCallback(
      async (query, cursor) => {
        const page = cursor ?? 1;
        const result = await searchClips(api, query, PAGE_SIZE, page);
        return { items: result.items, next: result.hasNext ? page + 1 : null };
      },
      [api],
    ),
  );
};
