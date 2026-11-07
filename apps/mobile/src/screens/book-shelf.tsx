import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  type OpenLibraryBook,
  type ShelfEntry,
  type ShelfSort,
  type ShelfSummary,
  shelfEntryToDoc,
} from "@nw/types/books";
import { useSession } from "@nw/features";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { BookCover } from "@/components/book-cover";
import { BookCard } from "@/components/bookshelf/book-card";
import { BookSheet } from "@/components/bookshelf/book-sheet";
import { Button } from "@/components/button";
import { EmptyScene } from "@/components/empty-feed";
import { EndOfList } from "@/components/end-of-list";
import { IconButton } from "@/components/icon-button";
import { LoadMore } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { SelectButton, SelectionBar } from "@/components/muse/media-selection";
import { SearchField } from "@/components/search-field";
import { Bone } from "@/components/skeleton";
import { Text } from "@/components/text";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import {
  type ShelfTab,
  shelfSummaryKey,
  useShelfPage,
  useShelfSummary,
} from "@/hooks/use-shelf";
import { useShelfActions } from "@/hooks/use-shelf-actions";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A novelist's whole bookshelf — web's `/@username/books` (BOOKSHELF_PLAN.md
 * §4.2).
 *
 * A component rather than a screen, as the muse list is: the Profile tab
 * mounts it for your own shelf, any other tab for somebody else's, so that
 * opening your own lights Profile rather than Home.
 *
 * Favorites face-out at the head, then every tab of the shelf as a paged
 * three-column grid of covers. The shelf endpoint is keyed by the novelist's
 * id, which the route carries when the profile pushed it and resolves from the
 * handle when it did not; until it has, the grid shows its skeleton.
 *
 * A cover opens the book's tray, which is where everything about one book
 * happens — and that tray always describes *your* shelf, so a visitor uses the
 * same one. On somebody else's shelf each card also says where the book sits on
 * yours, or offers to add it.
 *
 * No `removeClippedSubviews`: switching tabs replaces every cell, which is
 * exactly the structural change that crashed the muse list under Fabric.
 */

const COLUMNS = 3;
const GUTTER = space.sm;
/** Screen lengths before the end at which the next page is asked for. */
const END_REACHED_THRESHOLD = 1;
const FAVORITE_WIDTH = 84;

const TABS: { label: string; value: ShelfTab }[] = [
  { label: "All", value: "ALL" },
  { label: "Read", value: "READ" },
  { label: "Reading", value: "READING" },
  { label: "Want to read", value: "WANT_TO_READ" },
];

const SORTS: { label: string; value: ShelfSort }[] = [
  { label: "Recent", value: "shelved" },
  { label: "Title", value: "title" },
  { label: "Author", value: "author" },
  { label: "Year", value: "year" },
];

const EMPTY_TITLE: Record<ShelfTab, string> = {
  ALL: "No books yet",
  READ: "Nothing read yet",
  READING: "Nothing on the go",
  WANT_TO_READ: "Nothing on the list",
};

/** Owner: what to do about it. Visitor: whose shelf this is. */
const emptySubtitle = (
  status: ShelfTab,
  own: boolean,
  username: string,
): string => {
  if (own) {
    if (status === "ALL") {
      return "Your bookshelf is empty — add books from the Open World Library.";
    }
    if (status === "READ") {
      return "Nothing here yet — mark a book as Read from its card.";
    }
    if (status === "READING") {
      return "Nothing here yet — mark a book as Reading from its card.";
    }
    return "Nothing here yet — add a book as Want to read from its card.";
  }
  if (status === "ALL") return `${username} hasn't shelved any books yet.`;
  if (status === "READ") return `${username} hasn't read anything yet.`;
  if (status === "READING") {
    return `${username} isn't reading anything right now.`;
  }
  return `${username} has nothing on the wish list yet.`;
};

const countOf = (summary: ShelfSummary | null | undefined, tab: ShelfTab) => {
  if (!summary) return undefined;
  if (tab === "ALL") return summary.total;
  if (tab === "READ") return summary.counts.read;
  if (tab === "READING") return summary.counts.reading;
  return summary.counts.wantToRead;
};

const keyExtractor = (item: ShelfEntry) => item.olKey;

/** Six ghost covers in the grid's own geometry. */
const ShelfGridSkeleton = ({ width }: { width: number }) => (
  <View style={styles.skeleton}>
    {Array.from({ length: 6 }, (_, index) => (
      <View key={index} style={[styles.ghost, { width }]}>
        <Bone height={Math.round(width * 1.5)} on="page" width={width} />
        <Bone height={12} on="page" width="90%" />
        <Bone height={10} on="page" width="60%" />
      </View>
    ))}
  </View>
);

/** One tab of the shelf, as a chip with its count. */
const TabChip = memo(function TabChip({
  active,
  count,
  label,
  onPress,
}: {
  active: boolean;
  count?: number;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active
          ? {
              backgroundColor: theme.accent.fill,
              borderColor: theme.accent.fill,
            }
          : {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.chipLabel,
          { color: active ? theme.accent.onFill : theme.text },
        ]}
      >
        {label}
      </Text>
      {count !== undefined ? (
        <Text
          style={[
            styles.chipCount,
            { color: active ? theme.accent.onFill : theme.textGray },
          ]}
        >
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
});

/**
 * The favorites, face-out and in their order. On your own shelf each has a pair
 * of arrows under it: a horizontal list is already a swipe, so a drag would
 * have to fight it for the same finger.
 */
const FavoritesShelf = ({
  editable,
  favorites,
  onMove,
  onOpen,
}: {
  editable: boolean;
  favorites: ShelfEntry[];
  onMove: (from: number, to: number) => void;
  onOpen: (entry: ShelfEntry) => void;
}) => {
  const theme = useAppTheme();
  const reorderable = editable && favorites.length > 1;

  return (
    <View style={styles.favorites}>
      <View style={styles.favoritesHead}>
        <Ionicons color={theme.textGray} name="heart" size={11} />
        <Text style={[styles.favoritesTitle, { color: theme.textGray }]}>
          Favorites
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.favoritesRow}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.favoritesScroller}
      >
        {favorites.map((entry, index) => (
          <View key={entry.olKey} style={styles.favorite}>
            <Pressable
              accessibilityLabel={entry.title}
              accessibilityRole="button"
              onPress={() => onOpen(entry)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <BookCover book={entry} width={FAVORITE_WIDTH} />
            </Pressable>
            {reorderable ? (
              <View style={styles.favoriteMoves}>
                <IconButton
                  accessibilityLabel={`Move ${entry.title} earlier`}
                  disabled={index === 0}
                  icon="chevron-back"
                  iconSize={14}
                  onPress={() => onMove(index, index - 1)}
                  size={30}
                  tone="surface"
                />
                <IconButton
                  accessibilityLabel={`Move ${entry.title} later`}
                  disabled={index === favorites.length - 1}
                  icon="chevron-forward"
                  iconSize={14}
                  onPress={() => onMove(index, index + 1)}
                  size={30}
                  tone="surface"
                />
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status: session } = useSession();
  const { width: screenWidth } = useWindowDimensions();
  const actions = useShelfActions();

  const [status, setStatus] = useState<ShelfTab>("ALL");
  const [sort, setSort] = useState<ShelfSort>("shelved");
  const [sortOpen, setSortOpen] = useState(false);
  const [filter, setFilter] = useState("");
  /** The book whose tray is open. */
  const [open, setOpen] = useState<ShelfEntry | null>(null);
  const [quickAdding, setQuickAdding] = useState<string | null>(null);
  // Select mode, your own shelf only: the keys chosen in the current tab.
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set());
  const [removing, setRemoving] = useState(false);

  const summary = useShelfSummary(novelistId);
  const page = useShelfPage(novelistId, status, sort);
  const pull = usePullToRefresh(() =>
    Promise.all([page.refetch(), summary.refetch()]),
  );

  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  const cellWidth = Math.floor(
    (screenWidth - space.md * 2 - GUTTER * (COLUMNS - 1)) / COLUMNS,
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage, items } = page;
  const favorites = summary.data?.favorites ?? NO_ENTRIES;
  const count = countOf(summary.data, status);

  // A filter has to see the whole tab, not just the pages scrolled so far.
  const filtering = filter.trim().length > 0;
  useEffect(() => {
    if (filtering && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, filtering, hasNextPage, isFetchingNextPage]);

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.authors.some((author) => author.toLowerCase().includes(query)),
    );
  }, [filter, items]);

  const changeTab = (next: ShelfTab) => {
    setStatus(next);
    setPicked(new Set());
  };

  const exitSelect = useCallback(() => {
    setSelecting(false);
    setPicked(new Set());
  }, []);

  /** Every book in this tab, pulling in the pages not yet loaded first. */
  const selectAll = async () => {
    let data = page.data;
    let more = hasNextPage;
    while (more) {
      const result = await fetchNextPage();
      if (result.isError) break;
      data = result.data;
      more = result.hasNextPage;
    }
    const all = (data?.pages ?? []).flatMap((p) => p?.items ?? []);
    setPicked(new Set(all.map((book) => book.olKey)));
  };

  const confirmRemovePicked = () => {
    const keys = [...picked];
    if (keys.length === 0) return;
    Alert.alert(
      keys.length === 1 ? "Remove this book?" : `Remove ${keys.length} books?`,
      "They leave your shelf, and your favorites if they are in them.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setRemoving(true);
            const removed = await actions.unshelveMany(keys);
            setRemoving(false);
            if (removed !== null) exitSelect();
          },
          style: "destructive",
          text: "Remove",
        },
      ],
    );
  };

  /** The order is drawn at once and put back if the server refuses it. */
  const moveFavorite = async (from: number, to: number) => {
    if (!novelistId || to < 0 || to >= favorites.length) return;
    const next = [...favorites];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    const key = shelfSummaryKey(novelistId);
    const before = queryClient.getQueryData<ShelfSummary | null>(key);
    queryClient.setQueryData<ShelfSummary | null>(key, (current) =>
      current ? { ...current, favorites: next } : current,
    );
    const saved = await actions.reorder(next.map((book) => book.olKey));
    if (!saved) queryClient.setQueryData(key, before);
  };

  const onShelfChange = useCallback(
    (olKey: string, entry: ShelfEntry | null) => {
      setOpen((current) =>
        current?.olKey === olKey && entry ? entry : current,
      );
    },
    [],
  );

  const openBook = useCallback(
    (olKey: string) => {
      if (selecting) {
        setPicked((current) => {
          const next = new Set(current);
          if (!next.delete(olKey)) next.add(olKey);
          return next;
        });
        return;
      }
      setOpen(items.find((book) => book.olKey === olKey) ?? null);
    },
    [items, selecting],
  );

  const canQuickAdd = session === "signed-in" && !own;

  const quickAdd = useCallback(
    async (olKey: string) => {
      const book = items.find((entry) => entry.olKey === olKey);
      if (!book) return;
      setQuickAdding(olKey);
      await actions.shelve(shelfEntryToDoc(book), "WANT_TO_READ");
      setQuickAdding(null);
    },
    [actions, items],
  );

  const renderItem = useCallback(
    ({ item }: { item: ShelfEntry }) => (
      <BookCard
        book={item}
        favorite={item.favoriteRank != null}
        onPress={openBook}
        onQuickAdd={canQuickAdd ? quickAdd : undefined}
        quickAdding={quickAdding === item.olKey}
        selected={selecting ? picked.has(item.olKey) : undefined}
        // Yours under All, where a tab is not saying it; theirs, your status.
        status={
          own ? (status === "ALL" ? item.status : null) : item.viewerStatus
        }
        width={cellWidth}
      />
    ),
    [
      canQuickAdd,
      cellWidth,
      openBook,
      own,
      picked,
      quickAdd,
      quickAdding,
      selecting,
      status,
    ],
  );

  const openPicker = useCallback(() => router.push("/books/search"), [router]);

  const sortItems: ActionItem[] = SORTS.map((option) => ({
    icon: option.value === sort ? "checkmark" : undefined,
    label: option.label,
    onPress: () => {
      setSort(option.value);
      setSortOpen(false);
    },
  }));

  const sortLabel = SORTS.find((option) => option.value === sort)?.label;

  // Hidden from this viewer: nothing about it, and no controls to go with it.
  if (summary.data === null) {
    return (
      <View style={styles.fill}>
        <EmptyScene
          scene="empty-shelf"
          subtitle={`${username}'s bookshelf isn't shared with you.`}
          title="Nothing to see here"
        />
      </View>
    );
  }

  const openDoc: OpenLibraryBook | null = open ? shelfEntryToDoc(open) : null;
  const viewerShelf = !open
    ? null
    : own
      ? { favoriteRank: open.favoriteRank, status: open.status }
      : open.viewerStatus
        ? { favoriteRank: null, status: open.viewerStatus }
        : null;

  const header = (
    <View style={styles.header}>
      {own ? (
        <Button
          icon="add"
          label="Add books"
          onPress={openPicker}
          variant="primary"
        />
      ) : null}

      {favorites.length > 0 ? (
        <FavoritesShelf
          editable={own}
          favorites={favorites}
          onMove={(from, to) => void moveFavorite(from, to)}
          onOpen={setOpen}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.chips}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroller}
      >
        {TABS.map((tab) => (
          <TabChip
            active={tab.value === status}
            count={countOf(summary.data, tab.value)}
            key={tab.value}
            label={tab.label}
            onPress={() => changeTab(tab.value)}
          />
        ))}
      </ScrollView>

      <View style={styles.tools}>
        <SearchField
          containerStyle={styles.filter}
          onChangeText={setFilter}
          placeholder="Filter by title or author"
          value={filter}
        />
        <Pressable
          accessibilityLabel={`Sort, ${sortLabel}`}
          accessibilityRole="button"
          onPress={() => setSortOpen(true)}
          style={({ pressed }) => [
            styles.sort,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Ionicons
            color={theme.textGray}
            name="swap-vertical-outline"
            size={16}
          />
          <Text
            numberOfLines={1}
            style={[styles.sortLabel, { color: theme.text }]}
          >
            {sortLabel}
          </Text>
        </Pressable>
      </View>

      {selecting ? (
        <SelectionBar
          busy={removing}
          count={picked.size}
          onCancel={exitSelect}
          onClear={() => setPicked(new Set())}
          onDelete={confirmRemovePicked}
          onSelectAll={() => void selectAll()}
          total={count ?? items.length}
        />
      ) : (
        <View style={styles.countRow}>
          <Text style={[styles.count, { color: theme.textGray }]}>
            {filtering
              ? `${visible.length} ${visible.length === 1 ? "match" : "matches"}`
              : count !== undefined
                ? `${count} ${count === 1 ? "book" : "books"}`
                : ""}
          </Text>
          {own && items.length > 0 ? (
            <SelectButton onPress={() => setSelecting(true)} />
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.fill}>
      <FlatList
        {...tabBarScroll}
        columnWrapperStyle={styles.row}
        contentContainerStyle={contentStyle}
        data={visible}
        initialNumToRender={12}
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty={
              filtering ? (
                "No books match that."
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
          hasNextPage && !filtering ? (
            <LoadMore
              busy={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
            />
          ) : items.length > 0 && !filtering ? (
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

      <BookSheet
        doc={openDoc}
        onClose={() => setOpen(null)}
        onShelfChange={onShelfChange}
        viewerShelf={viewerShelf}
      />

      <ActionMenu
        items={sortItems}
        onClose={() => setSortOpen(false)}
        title="Sort by"
        visible={sortOpen}
      />
    </View>
  );
};

/** One empty list, so "no favorites yet" is not a new array on every render. */
const NO_ENTRIES: ShelfEntry[] = [];

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  chipCount: { fontSize: fontSize.caption, fontWeight: "600" },
  chipLabel: { fontSize: fontSize.label, fontWeight: "600" },
  chipScroller: { marginHorizontal: -space.md },
  chips: { gap: space.sm, paddingHorizontal: space.md },
  content: { paddingHorizontal: space.md, paddingTop: space.md },
  count: { fontSize: fontSize.caption },
  countRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 30,
  },
  favorite: { gap: space.s, width: FAVORITE_WIDTH },
  favoriteMoves: { flexDirection: "row", justifyContent: "space-between" },
  favorites: { gap: space.sm },
  favoritesHead: { alignItems: "center", flexDirection: "row", gap: space.s },
  favoritesRow: { gap: space.m, paddingHorizontal: space.md },
  favoritesScroller: { marginHorizontal: -space.md },
  favoritesTitle: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  fill: { flex: 1 },
  filter: { flex: 1 },
  ghost: { gap: space.xs, marginBottom: space.md },
  header: { gap: space.m, marginBottom: space.md },
  pressed: { opacity: 0.75 },
  row: { gap: GUTTER },
  skeleton: { flexDirection: "row", flexWrap: "wrap", gap: GUTTER },
  sort: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.m,
  },
  sortLabel: { fontSize: fontSize.label, fontWeight: "600" },
  tools: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
