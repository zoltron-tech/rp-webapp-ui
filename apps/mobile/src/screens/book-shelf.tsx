import type { BookStatus, ShelfEntry } from "@nw/types/books";
import { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { BookCover } from "@/components/book-cover";
import { EmptyScene } from "@/components/empty-feed";
import { EndOfList } from "@/components/end-of-list";
import { LoadMore } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { type SegmentedTab, SegmentedTabs } from "@/components/segmented-tabs";
import { Bone } from "@/components/skeleton";
import { Text } from "@/components/text";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useShelfPage, useShelfSummary } from "@/hooks/use-shelf";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * A novelist's whole bookshelf — web's `/@username/books` (BOOKSHELF_PLAN.md
 * §4.2), read-only in phase 1.
 *
 * A component rather than a screen, as the muse list is: the Profile tab
 * mounts it for your own shelf, any other tab for somebody else's, so that
 * opening your own lights Profile rather than Home.
 *
 * Three statuses behind one segmented control, each a paged three-column
 * grid of covers. The shelf endpoint is keyed by the novelist's id, which the
 * route carries when the profile pushed it and resolves from the handle when
 * it did not; until it has, the grid shows its skeleton.
 *
 * No `removeClippedSubviews`: switching tabs replaces every cell, which is
 * exactly the structural change that crashed the muse list under Fabric.
 */

const COLUMNS = 3;
const GUTTER = space.sm;
/** Screen lengths before the end at which the next page is asked for. */
const END_REACHED_THRESHOLD = 1;

const TABS: readonly SegmentedTab<BookStatus>[] = [
  { label: "Read", value: "READ" },
  { label: "Reading", value: "READING" },
  { label: "Want to read", value: "WANT_TO_READ" },
];

const EMPTY_TITLE: Record<BookStatus, string> = {
  READ: "Nothing read yet",
  READING: "Nothing on the go",
  WANT_TO_READ: "Nothing on the list",
};

/** Owner: what to do about it. Visitor: whose shelf this is. */
const emptySubtitle = (
  status: BookStatus,
  own: boolean,
  username: string,
): string => {
  if (own) {
    if (status === "READ") {
      return "Nothing here yet — mark a book as Read from its card.";
    }
    if (status === "READING") {
      return "Nothing here yet — mark a book as Reading from its card.";
    }
    return "Nothing here yet — add a book as Want to read from its card.";
  }
  if (status === "READ") return `${username} hasn't read anything yet.`;
  if (status === "READING") {
    return `${username} isn't reading anything right now.`;
  }
  return `${username} has nothing on the wish list yet.`;
};

const keyExtractor = (item: ShelfEntry) => item.olKey;

/**
 * One book in the grid: the cover, the title, the first author, the year.
 *
 * TODO(phase 1b): a tap opens the book's detail sheet.
 */
const BookCard = memo(function BookCard({
  entry,
  width,
}: {
  entry: ShelfEntry;
  width: number;
}) {
  const theme = useAppTheme();
  return (
    <View accessibilityLabel={entry.title} style={[styles.card, { width }]}>
      <BookCover book={entry} width={width} />
      <Text numberOfLines={2} style={[styles.cardTitle, { color: theme.text }]}>
        {entry.title}
      </Text>
      {entry.authors[0] ? (
        <Text
          numberOfLines={1}
          style={[styles.cardAuthor, { color: theme.textGray }]}
        >
          {entry.authors[0]}
        </Text>
      ) : null}
      {entry.firstYear ? (
        <Text style={[styles.cardYear, { color: theme.textGray }]}>
          {entry.firstYear}
        </Text>
      ) : null}
    </View>
  );
});

/** Six ghost covers in the grid's own geometry. */
const ShelfGridSkeleton = ({ width }: { width: number }) => (
  <View style={styles.skeleton}>
    {Array.from({ length: 6 }, (_, index) => (
      <View key={index} style={[styles.card, { width }]}>
        <Bone height={Math.round(width * 1.5)} on="page" width={width} />
        <Bone height={12} on="page" width="90%" />
        <Bone height={10} on="page" width="60%" />
      </View>
    ))}
  </View>
);

export const BookShelf = ({
  novelistId,
  own,
  username,
}: {
  /** Undefined until the handle has resolved; the grid waits on it. */
  novelistId: string | undefined;
  own: boolean;
  username: string;
}) => {
  const theme = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [status, setStatus] = useState<BookStatus>("READ");

  const summary = useShelfSummary(novelistId);
  const page = useShelfPage(novelistId, status);
  const pull = usePullToRefresh(() =>
    Promise.all([page.refetch(), summary.refetch()]),
  );

  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  const cellWidth = Math.floor(
    (screenWidth - space.md * 2 - GUTTER * (COLUMNS - 1)) / COLUMNS,
  );

  const counts = summary.data?.counts;
  const count =
    counts === undefined
      ? undefined
      : status === "READ"
        ? counts.read
        : status === "READING"
          ? counts.reading
          : counts.wantToRead;

  const renderItem = useCallback(
    ({ item }: { item: ShelfEntry }) => (
      <BookCard entry={item} width={cellWidth} />
    ),
    [cellWidth],
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <SegmentedTabs onChange={setStatus} options={TABS} value={status} />
        {count !== undefined ? (
          <Text style={[styles.count, { color: theme.textGray }]}>
            {count} {count === 1 ? "book" : "books"}
          </Text>
        ) : null}
      </View>
    ),
    [count, status, theme.textGray],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage, items } = page;

  return (
    <View style={styles.fill}>
      <FlatList
        {...tabBarScroll}
        columnWrapperStyle={styles.row}
        contentContainerStyle={contentStyle}
        data={items}
        initialNumToRender={12}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty={
              page.hidden ? (
                "No books to show."
              ) : (
                <EmptyScene
                  scene="open-book"
                  subtitle={emptySubtitle(status, own, username)}
                  title={EMPTY_TITLE[status]}
                />
              )
            }
            error={page.error}
            loading={page.isPending}
            onRetry={() => void page.refetch()}
            skeleton={<ShelfGridSkeleton width={cellWidth} />}
          />
        }
        ListFooterComponent={
          hasNextPage ? (
            <LoadMore
              busy={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
            />
          ) : items.length > 0 ? (
            <EndOfList />
          ) : null
        }
        ListHeaderComponent={header}
        numColumns={COLUMNS}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        refreshControl={
          <RefreshControl
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
        renderItem={renderItem}
        windowSize={7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { gap: space.xs, marginBottom: space.md },
  cardAuthor: { fontSize: fontSize.caption },
  cardTitle: { fontSize: fontSize.label, fontWeight: "600", lineHeight: 17 },
  cardYear: { fontSize: fontSize.meta },
  content: { paddingHorizontal: space.md, paddingTop: space.md },
  count: { fontSize: fontSize.caption },
  fill: { flex: 1 },
  header: { gap: space.sm, marginBottom: space.md },
  row: { gap: GUTTER },
  skeleton: { flexDirection: "row", flexWrap: "wrap", gap: GUTTER },
});
