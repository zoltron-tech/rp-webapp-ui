import { getStrangerNovelists } from "@nw/api/endpoints/home";
import { queryKeys, useApi, useNotifications, useSession } from "@nw/features";
import type { Novelist } from "@nw/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import {
  NOVELIST_CARD_WIDTH,
  NovelistCard,
  type NovelistCardPerson,
  NovelistCardShimmer,
} from "@/components/home/novelist-card";
import { SectionHeader } from "@/components/home/section-header";
import type { Connection } from "@/hooks/use-connection";
import { dedupeById } from "@/lib/feed";
import { space, useAppTheme } from "@/theme";

/**
 * Web's "Friend suggestions" rail.
 *
 * Two sources, in web's order: friend requests waiting on you first, read off
 * the notifications the app already has (`type === "FRIEND_REQUEST"`, drawn
 * with accept and decline), then the strangers the server suggests, paged by
 * eight as the rail is flicked. "See all" opens the novelist directory, which
 * is where the whole list of who else is here lives.
 *
 * ## Requests are not in any list cache
 *
 * A suggestion's button changes through the query cache — `useConnectionAction`
 * patches every friends page and, now, this rail's own pages. A request card is
 * built from a notification, which that patch does not reach, so the rail keeps
 * the confirmed connection for those in its own state and draws the card from
 * it: accept and the card says Message; decline and it goes.
 */

/** Web's `STRANGERS_PAGE_SIZE`. */
const PAGE_SIZE = 8;
const GAP = space.sm + 2;
const SHIMMER = [0, 1, 2];

const keyExtractor = (person: NovelistCardPerson) => person.id;
const Separator = () => <View style={styles.separator} />;

/** The rail's query, on its own so the screen can refresh it by prefix. */
export const useFriendSuggestions = (enabled = true) => {
  const api = useApi();

  return useInfiniteQuery({
    enabled,
    getNextPageParam: (
      lastPage: Novelist[],
      _all: Novelist[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Novelist[]> => {
      const result = await getStrangerNovelists(api, pageParam, PAGE_SIZE);
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.friendSuggestions(),
    staleTime: 5 * 60 * 1000,
  });
};

const NovelistRailView = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const { status } = useSession();
  const signedIn = status === "signed-in";
  const query = useFriendSuggestions(signedIn);
  const { notifications } = useNotifications({ enabled: signedIn });

  /** Connections the server has confirmed for people not in a list cache. */
  const [resolved, setResolved] = useState<Record<string, Connection>>({});
  const onChanged = useCallback((id: string, connection: Connection) => {
    setResolved((current) => ({ ...current, [id]: connection }));
  }, []);

  // Web's `friendRequestCards`: a card per FRIEND_REQUEST notification.
  const requests = useMemo<NovelistCardPerson[]>(() => {
    const out: NovelistCardPerson[] = [];
    const seen = new Set<string>();
    for (const n of notifications) {
      if (n.type !== "FRIEND_REQUEST" || !n.source?.id) continue;
      if (seen.has(n.source.id)) continue;
      seen.add(n.source.id);
      const connection = resolved[n.source.id] ?? "FRIEND_REQUEST_RECEIVED";
      // Declined: nothing left to do with this person here.
      if (connection === null) continue;
      const parts = (n.source.title ?? "").trim().split(" ");
      out.push({
        avatar: n.source.avatar,
        connection,
        firstName: parts[0] ?? "",
        id: n.source.id,
        image: n.source.image,
        lastName: parts.slice(1).join(" ") || null,
        username: n.source.urlProp,
      });
    }
    return out;
  }, [notifications, resolved]);

  const people = useMemo<NovelistCardPerson[]>(() => {
    const requested = new Set(requests.map((r) => r.id));
    const strangers = dedupeById(query.data?.pages ?? []).filter(
      (n) => !requested.has(n.id),
    );
    return [...requests, ...strangers];
  }, [query.data, requests]);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: NovelistCardPerson }) => (
      <NovelistCard onChanged={onChanged} person={item} />
    ),
    [onChanged],
  );

  // Hidden only once the session says there is no one to suggest to. While it
  // is still being asked for — a cold start opens the tabs on a stored token —
  // the query waits disabled, reads as pending, and the shimmer holds the
  // rail's place instead of the rail popping into the feed a moment later.
  if (status !== "signed-in" && status !== "loading") return null;
  if (!query.isPending && people.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        action={{
          label: "See all",
          onPress: () => router.push("/novelists"),
        }}
        title="Friend suggestions"
      />
      {query.isPending && people.length === 0 ? (
        <View style={styles.shimmerRow}>
          {SHIMMER.map((i) => (
            <NovelistCardShimmer key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.track}
          data={people}
          decelerationRate="fast"
          horizontal
          // A screen's worth of cards up front, not the default ten.
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
          snapToAlignment="start"
          snapToInterval={NOVELIST_CARD_WIDTH + GAP}
        />
      )}
    </View>
  );
};

export const NovelistRail = memo(NovelistRailView);

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  section: { paddingBottom: space.md },
  separator: { width: GAP },
  shimmerRow: {
    flexDirection: "row",
    gap: GAP,
    paddingHorizontal: space.md,
  },
  track: { paddingHorizontal: space.md },
});
