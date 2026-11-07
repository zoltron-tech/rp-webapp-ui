import { useRouter } from "expo-router";
import { memo, useCallback, useRef } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import {
  NovelistCard,
  type NovelistCardPerson,
  NovelistCardShimmer,
} from "@/components/home/novelist-card";
import { RAIL_GAP, RAIL_PAD, useRailSnap } from "@/components/home/rail-snap";
import { SectionHeader } from "@/components/home/section-header";
import { useNovelistSuggestions } from "@/components/home/use-novelist-suggestions";
import { OfflineNotice } from "@/components/offline";
import { useOffline } from "@/lib/connectivity";
import { space, useAppTheme } from "@/theme";

/**
 * Web's "Friend suggestions" rail. Who is on it, and the card's `⋯`, are
 * `use-novelist-suggestions.tsx`, shared with the Fellows page; "See all" opens
 * that page. More cards load as the rail is flicked.
 *
 * ## One at a time
 *
 * Facebook's suggestions rail, not web's row of three: a card takes most of
 * the screen and sits in the middle, with the one before and the one after
 * peeking in at the sides, so there is always exactly one person being
 * considered. The geometry is `rail-snap.ts`, shared with the character
 * and story rails; this card is landscape, so it takes the larger share.
 *
 * Pressing any of a card's buttons moves the rail to the next card. The
 * decision on that person has been made — the request is sent, accepted,
 * declined — and the next one is what the thumb is looking for; leaving the
 * answered card in the middle would be a rail that has to be flicked after
 * every tap. The card itself keeps its new state (Requested, Message) in
 * case the reader scrolls back.
 */

/**
 * How much of the screen a card takes. What is left, split in two, is the
 * peek of each neighbour: 18% a side, about 68pt on a 375pt phone — enough
 * to read as a card and not enough to read. (0.72 until 2026-11-04, when the
 * user asked for slightly smaller cards; 240pt at 375 keeps the WIDE preset.)
 */
const CARD_SHARE = 0.64;
const SHIMMER = [0, 1];

const keyExtractor = (person: NovelistCardPerson) => person.id;
const Separator = () => <View style={styles.separator} />;

const NovelistRailView = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const { onChanged, openMore, people, query, sheets, status } =
    useNovelistSuggestions();
  const offline = useOffline();
  const list = useRef<FlatList<NovelistCardPerson>>(null);

  const snap = useRailSnap({ count: people.length, share: CARD_SHARE });
  const { cardWidth, offsets } = snap;

  /** A card's button was pressed: bring the next card into the middle. */
  const advance = useCallback(
    (id: string) => {
      const next = people.findIndex((person) => person.id === id) + 1;
      if (next <= 0 || next >= offsets.length) return;
      list.current?.scrollToOffset({ animated: true, offset: offsets[next] });
    },
    [offsets, people],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: NovelistCardPerson }) => (
      <NovelistCard
        onAction={advance}
        onChanged={onChanged}
        onMore={openMore}
        person={item}
        width={cardWidth}
      />
    ),
    [advance, cardWidth, onChanged, openMore],
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
          onPress: () => router.push("/fellows"),
        }}
        title="Friend suggestions"
      />
      {query.isPending && people.length === 0 && offline ? (
        <OfflineNotice compact what="rail" />
      ) : query.isPending && people.length === 0 ? (
        <View style={styles.shimmerRow}>
          {SHIMMER.map((i) => (
            <NovelistCardShimmer key={i} width={cardWidth} />
          ))}
        </View>
      ) : (
        <FlatList
          {...snap.listProps}
          contentContainerStyle={snap.contentContainerStyle}
          data={people}
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
          ref={list}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {sheets}
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
  separator: { width: RAIL_GAP },
  shimmerRow: {
    flexDirection: "row",
    gap: RAIL_GAP,
    overflow: "hidden",
    paddingHorizontal: RAIL_PAD,
  },
});
