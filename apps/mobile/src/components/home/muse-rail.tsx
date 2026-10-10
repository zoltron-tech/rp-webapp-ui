import { getMuses } from "@nw/api/endpoints/home";
import { queryKeys, useApi } from "@nw/features";
import type { Muse } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { MuseCard, MuseCardShimmer } from "@/components/home/muse-card";
import { RAIL_GAP, RAIL_PAD, useRailSnap } from "@/components/home/rail-snap";
import { SectionHeader } from "@/components/home/section-header";
import { OfflineNotice } from "@/components/offline";
import { useOffline } from "@/lib/connectivity";
import { dedupeById } from "@/lib/feed";
import { space, useAppTheme } from "@/theme";

/**
 * A row of characters — web's "characters by your friends" and "public
 * characters out there" rails, on one component with the source as a prop.
 *
 * One character at a time, centred, with the next peeking in: the geometry
 * every home rail shares, see `rail-snap.ts`. A portrait card takes under
 * half the screen rather than the novelist card's seven tenths: at 1.75 to
 * one it is already the tallest thing in the feed, and at six tenths it was
 * a screen's worth of one character.
 *
 * ## Paging by scrolling, not by a card
 *
 * Web ends each rail with a "More" card that fetches the next page on click.
 * A rail on a phone is flicked, and a card that has to be reached and tapped
 * at the end of a flick is a tap nobody makes; the next page is fetched as the
 * end comes into view instead, the way the vertical feeds page. Web's page
 * size of eight is kept so both clients ask the server the same questions.
 *
 * ## Hidden when empty
 *
 * A reader with no friends has no friends' characters, and a rail with a
 * heading over nothing is a heading over nothing. Web hides this one too; the
 * strangers' rail is hidden here as well for the same reason.
 */

/** Web's `MUSES_PAGE_SIZE`. */
const PAGE_SIZE = 8;
/** The card's share of the screen; see the note above. */
const CARD_SHARE = 0.46;
const SHIMMER = [0, 1];

/** A muse the server sent has an id; the type allows null for drafts. */
type ListedMuse = Muse & { id: string };
const listed = (muse: Muse): muse is ListedMuse => Boolean(muse.id);

const keyExtractor = (muse: ListedMuse) => muse.id;
const Separator = () => <View style={styles.separator} />;

/** The rail's query, on its own so the screen can refresh it by prefix. */
export const useHomeMuses = (type: "friends" | "unknown") => {
  const api = useApi();

  return useInfiniteQuery({
    getNextPageParam: (
      lastPage: Muse[],
      _all: Muse[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Muse[]> => {
      const result = await getMuses(api, pageParam, PAGE_SIZE, type);
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.homeMuses(type),
    staleTime: 5 * 60 * 1000,
  });
};

const MuseRailView = ({
  title,
  type,
}: {
  title: string;
  type: "friends" | "unknown";
}) => {
  const theme = useAppTheme();
  const query = useHomeMuses(type);
  const offline = useOffline();

  const muses = useMemo(
    () =>
      dedupeById((query.data?.pages ?? []).map((page) => page.filter(listed))),
    [query.data],
  );
  const snap = useRailSnap({ count: muses.length, share: CARD_SHARE });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ListedMuse }) => (
      <MuseCard muse={item} width={snap.cardWidth} />
    ),
    [snap.cardWidth],
  );

  if (!query.isPending && muses.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {query.isPending && offline ? (
        <OfflineNotice compact what="rail" />
      ) : query.isPending ? (
        <View style={styles.shimmerRow}>
          {SHIMMER.map((i) => (
            <MuseCardShimmer key={i} width={snap.cardWidth} />
          ))}
        </View>
      ) : (
        <FlatList
          {...snap.listProps}
          contentContainerStyle={snap.contentContainerStyle}
          data={muses}
          horizontal
          // One and two slivers are on screen; the default ten is a page of
          // images decoded for a rail nobody has flicked yet.
          initialNumToRender={3}
          ItemSeparatorComponent={Separator}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={3}
          windowSize={3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={theme.accent.text} size="small" />
              </View>
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export const MuseRail = memo(MuseRailView);

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  section: { paddingBottom: space.md },
  separator: { width: RAIL_GAP },
  shimmerRow: {
    flexDirection: "row",
    gap: RAIL_GAP,
    overflow: "hidden",
    paddingHorizontal: RAIL_PAD,
  },
});
