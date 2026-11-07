import type { BookmarkedStoryBoardEvent } from "@nw/types";
import { useCallback } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import { BookmarkCard } from "@/components/story/bookmark-card";
import { useBookmarks, useRemoveBookmark } from "@/hooks/use-bookmarks";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { space } from "@/theme";

const keyExtractor = (item: BookmarkedStoryBoardEvent) =>
  item.bookmark.storyBoardEventId;

/**
 * Every chapter you have saved your place in — web's `/rp/bookmarks`. Opened
 * from the menu; its header is declared on the route in `app/_layout.tsx`.
 */
export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const query = useBookmarks();
  const remove = useRemoveBookmark();
  const pull = usePullToRefresh(query.refetch);

  const confirmRemove = useCallback(
    (bookmarked: BookmarkedStoryBoardEvent) =>
      Alert.alert(
        "Remove this bookmark?",
        `You'll lose your saved spot in "${bookmarked.event.name}". The chapter itself isn't affected.`,
        [
          { style: "cancel", text: "Cancel" },
          {
            onPress: () => void remove(bookmarked.bookmark.storyBoardEventId),
            style: "destructive",
            text: "Remove",
          },
        ],
      ),
    [remove],
  );

  const renderItem = useCallback(
    ({ item }: { item: BookmarkedStoryBoardEvent }) => (
      <BookmarkCard bookmarked={item} onRemove={confirmRemove} />
    ),
    [confirmRemove],
  );

  return (
    <View style={styles.fill}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.lg },
        ]}
        data={query.bookmarks}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty={
              <EmptyScene
                scene="open-book"
                subtitle="While reading a chapter, tap the bookmark on a passage to save your spot. Your saved chapters will appear here so you can pick up right where you left off."
                title="No bookmarks yet"
              />
            }
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
          />
        }
        onRefresh={pull.onRefresh}
        refreshing={pull.refreshing}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.m, padding: space.md },
  fill: { flex: 1 },
});
