import { getMuseDirectory } from "@nw/api/endpoints/muse";
import { useApi } from "@nw/features";
import type { Muse } from "@nw/types";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { FandomSearchBar, useFandomSearch } from "@/components/fandom-search";
import { MuseCard, MuseCardShimmer } from "@/components/home/muse-card";
import { EmptyState } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useTabTop } from "@/hooks/use-tab-top";
import { space } from "@/theme";

/**
 * The character directory: every character the reader may see, a page at a
 * time, alphabetically — web's `/rp/characters`, as its own tab.
 *
 * One field searches names and fandoms together ("jon" finds Jon Snow, "hp"
 * every Harry Potter character). While something is typed, the fandoms it
 * names are offered as chips under the field; tapping one pins it as a
 * filter and clears the text, so the grid becomes that fandom's characters.
 * Pinned fandoms combine (any of them), narrow whatever is typed next, and
 * come off with a second tap. The same rules as web; the server does the
 * matching (`GET /muse/directory`, `GET /fandom/search`).
 *
 * The field and the chips stay put above the grid, so a filter can be changed
 * from anywhere in a long list. Changing one keeps the old grid on screen,
 * dimmed, until the new first page lands, rather than flashing ghosts.
 */

const PAGE_SIZE = 24;
const GHOST_CARDS = 6;
/** Fetch the next page a screen and a half early, as the feeds do. */
const END_REACHED_THRESHOLD = 1.5;

const GUTTER = space.md;
const GAP = space.m;
/** A card narrower than this drops to fewer columns (wide type starts at 165). */
const MIN_CARD = 165;

/** A `null` page is a 404 — nothing there; a `message` is a real failure. */
const unwrap = <T,>(result: T[] | { message: unknown } | null): T[] => {
  if (result === null) return [];
  if ("message" in result) throw new Error(String(result.message));
  return result;
};

/** Only muses with an id reach the list (see `muses` below). */
const keyExtractor = (muse: Muse) => muse.id ?? "";

export const CharacterDirectoryScreen = () => {
  const api = useApi();
  const { width: windowWidth } = useWindowDimensions();
  const search = useFandomSearch();

  const directory = useInfiniteQuery({
    getNextPageParam: (last: Muse[], _all, lastPage: number) =>
      last.length >= PAGE_SIZE ? lastPage + 1 : undefined,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await getMuseDirectory(api, {
          fandoms: search.fandomIds,
          pageNumber: pageParam,
          pageSize: PAGE_SIZE,
          query: search.term,
        }),
      ),
    queryKey: ["muse-directory", search.term, search.fandomKey],
    staleTime: 60 * 1000,
  });

  const muses = useMemo(() => {
    const seen = new Set<string>();
    const out: Muse[] = [];
    for (const page of directory.data?.pages ?? [])
      for (const muse of page) {
        // A row with no id has nowhere to open; a repeat is a page boundary
        // that moved while the reader scrolled.
        if (!muse.id || seen.has(muse.id)) continue;
        seen.add(muse.id);
        out.push(muse);
      }
    return out;
  }, [directory.data]);

  // Two columns on a phone, more where they fit at the wide card size.
  const columns = Math.max(
    2,
    Math.floor((windowWidth - 2 * GUTTER + GAP) / (MIN_CARD + GAP)),
  );
  const cardWidth = Math.floor(
    (windowWidth - 2 * GUTTER - (columns - 1) * GAP) / columns,
  );

  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);
  const listRef = useRef<FlatList<Muse>>(null);
  useTabTop(listRef);

  const { onRefresh, refreshing } = usePullToRefresh(() => directory.refetch());

  const loadMore = () => {
    if (directory.hasNextPage && !directory.isFetchingNextPage)
      void directory.fetchNextPage();
  };

  const renderItem = useCallback(
    ({ item }: { item: Muse }) => <MuseCard muse={item} width={cardWidth} />,
    [cardWidth],
  );

  const filtering = search.filtering;
  // Filters changed and the new first page is still out: the old grid stays,
  // dimmed, rather than a flash of ghosts.
  const stale = directory.isPlaceholderData;

  const ghosts = (
    <View style={[styles.ghosts, { gap: GAP }]}>
      {Array.from({ length: GHOST_CARDS }, (_, index) => (
        <MuseCardShimmer key={index} width={cardWidth} />
      ))}
    </View>
  );

  return (
    <View style={styles.fill}>
      <FandomSearchBar
        placeholder="Search characters or fandoms…"
        search={search}
        style={styles.controls}
      />

      <FlatList
        {...tabBarScroll}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={[contentStyle, { gap: GAP }]}
        data={muses}
        key={columns}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          directory.isPending ? (
            ghosts
          ) : directory.error ? (
            <ListStatus
              error={directory.error}
              onRetry={() => void directory.refetch()}
            />
          ) : (
            <EmptyState
              body={
                filtering
                  ? "Try another name, or a different fandom."
                  : "Characters will appear here as novelists create them."
              }
              icon="people-outline"
              title={
                filtering ? "No characters match" : "No characters to show yet"
              }
            />
          )
        }
        ListFooterComponent={
          directory.isFetchingNextPage ? (
            <View style={styles.footer}>
              <ListStatus loading />
            </View>
          ) : null
        }
        numColumns={columns}
        onEndReached={loadMore}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        onRefresh={onRefresh}
        ref={listRef}
        refreshing={refreshing}
        renderItem={renderItem}
        style={stale ? styles.stale : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: GUTTER, paddingTop: space.xs },
  controls: {
    paddingBottom: space.sm,
    paddingHorizontal: GUTTER,
    paddingTop: space.sm,
  },
  fill: { flex: 1 },
  footer: { paddingVertical: space.md },
  ghosts: { flexDirection: "row", flexWrap: "wrap" },
  stale: { opacity: 0.55 },
});
