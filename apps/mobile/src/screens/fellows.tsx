import { useCallback } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  NovelistCard,
  type NovelistCardPerson,
} from "@/components/home/novelist-card";
import { useNovelistSuggestions } from "@/components/home/use-novelist-suggestions";
import { LoadMore } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { space } from "@/theme";

/**
 * Everyone Home's suggestions rail has, as a list — web's `/rp/fellows`: friend
 * requests waiting on you, then novelists you have not met.
 *
 * On the rail a pressed button moves to the next card. Here the next card is
 * already on screen, so a card just takes its new state and stays.
 */

const keyExtractor = (person: NovelistCardPerson) => person.id;
const noop = () => undefined;

export const FellowsScreen = () => {
  const { width } = useWindowDimensions();
  const { onChanged, openMore, people, query, sheets } =
    useNovelistSuggestions();
  const pull = usePullToRefresh(query.refetch);
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);
  const cardWidth = width - space.md * 2;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const renderItem = useCallback(
    ({ item }: { item: NovelistCardPerson }) => (
      <NovelistCard
        onAction={noop}
        onChanged={onChanged}
        onMore={openMore}
        person={item}
        width={cardWidth}
      />
    ),
    [cardWidth, onChanged, openMore],
  );

  return (
    <View style={styles.fill}>
      <FlatList
        contentContainerStyle={contentStyle}
        data={people}
        initialNumToRender={6}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty="No novelists to suggest right now. Check back soon."
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
          />
        }
        ListFooterComponent={
          hasNextPage ? (
            <LoadMore
              busy={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
            />
          ) : null
        }
        onRefresh={pull.onRefresh}
        {...tabBarScroll}
        refreshing={pull.refreshing}
        renderItem={renderItem}
      />
      {sheets}
    </View>
  );
};

const styles = StyleSheet.create({
  content: { gap: space.m, paddingHorizontal: space.md, paddingTop: space.md },
  fill: { flex: 1 },
});
