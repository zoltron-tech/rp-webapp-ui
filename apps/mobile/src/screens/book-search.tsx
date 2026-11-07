import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  type BookSearchMode,
  getSuggestedBooks,
  searchBooks,
} from "@nw/api/endpoints/books";
import { useApi } from "@nw/features";
import {
  type Book,
  docToBook,
  type OpenLibraryBook,
  type OpenLibrarySearchResult,
  SHELF_ERROR,
  type ShelfEntry,
  type ShelvedMarker,
  type SuggestedRow,
} from "@nw/types/books";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookCard } from "@/components/bookshelf/book-card";
import { BookSheet } from "@/components/bookshelf/book-sheet";
import { Button } from "@/components/button";
import { LoadMore } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { SearchField } from "@/components/search-field";
import { Bone } from "@/components/skeleton";
import { Text } from "@/components/text";
import { fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * The Open World Library: Open Library search, and the picker for a novelist's
 * bookshelf — web's `/rp/open-library` (BOOKSHELF_PLAN.md §4.3).
 *
 * Before any query it shows the suggested rows ("Because you write in …", then
 * trending) and your recent searches. After one, a grid that pages as it
 * scrolls, where web has Back and Next buttons. Tapping a book opens the same
 * tray the shelf uses, which is where it gets shelved.
 *
 * Fetches here, not in `@nw/features`, for that package's rule: web reaches
 * these through server actions.
 */

const PAGE_SIZE = 20;
const COLUMNS = 3;
const GUTTER = space.sm;
const RAIL_WIDTH = 104;
const DEBOUNCE_MS = 400;
const RECENT_LIMIT = 5;
const RECENT_KEY = "nw.openLibrary.recent";

const MODES: { id: BookSearchMode; label: string }[] = [
  { id: "all", label: "All" },
  { id: "title", label: "Title" },
  { id: "author", label: "Author" },
  { id: "subject", label: "Tag" },
];

const PLACEHOLDER: Record<BookSearchMode, string> = {
  all: "Search books, authors, tags...",
  author: "Search by author...",
  subject: "Search by tag (e.g. romance, dragons)...",
  title: "Search by title...",
};

const keyExtractor = (doc: OpenLibraryBook) => doc.key;

/** One book per document, so a card's `memo` holds across renders. */
const BOOKS = new WeakMap<OpenLibraryBook, Book>();
const bookOf = (doc: OpenLibraryBook): Book => {
  const cached = BOOKS.get(doc);
  if (cached) return cached;
  const book = docToBook(doc);
  BOOKS.set(doc, book);
  return book;
};

const RowSkeleton = () => (
  <View style={styles.rowGroup}>
    <Bone height={12} on="page" width="50%" />
    <View style={styles.railGhost}>
      {[0, 1, 2].map((index) => (
        <Bone
          height={Math.round(RAIL_WIDTH * 1.5)}
          key={index}
          on="page"
          width={RAIL_WIDTH}
        />
      ))}
    </View>
  </View>
);

export const BookSearchScreen = () => {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<BookSearchMode>("all");
  const [open, setOpen] = useState<OpenLibraryBook | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  /** What this session has changed; laid over what the server said. */
  const [changed, setChanged] = useState<Record<string, ShelvedMarker | null>>(
    {},
  );

  const query = useDebounce(input.trim(), DEBOUNCE_MS);
  const searching = query.length > 0;

  const cellWidth = Math.floor(
    (screenWidth - space.md * 2 - GUTTER * (COLUMNS - 1)) / COLUMNS,
  );

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => {
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        if (Array.isArray(parsed)) {
          setRecent(
            parsed
              .filter((item): item is string => typeof item === "string")
              .slice(0, RECENT_LIMIT),
          );
        }
      })
      // A convenience only: without it the row is simply empty.
      .catch(() => undefined);
  }, []);

  const writeRecent = useCallback((next: string[]) => {
    setRecent(next);
    void AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(
      () => undefined,
    );
  }, []);

  const search = useInfiniteQuery({
    enabled: searching,
    getNextPageParam: (
      lastPage: OpenLibrarySearchResult,
      _all: OpenLibrarySearchResult[],
      lastPageParam: number,
    ) =>
      lastPageParam * PAGE_SIZE < lastPage.numFound
        ? lastPageParam + 1
        : undefined,
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<OpenLibrarySearchResult> => {
      const result = await searchBooks(api, query, mode, pageParam, PAGE_SIZE);
      if (!result || "message" in result) {
        throw new Error(
          result?.reason === SHELF_ERROR.UpstreamUnavailable
            ? "Open Library is busy. Try again in a moment."
            : "Couldn't reach Open Library. Try again in a moment.",
        );
      }
      return result;
    },
    queryKey: ["books", "search", mode, query],
    staleTime: 5 * 60 * 1000,
  });

  // Written once a search has come back, so half-typed words never land here.
  const { isSuccess: searched } = search;
  useEffect(() => {
    if (!searched || !query) return;
    setRecent((current) => {
      const next = [
        query,
        ...current.filter((item) => item.toLowerCase() !== query.toLowerCase()),
      ].slice(0, RECENT_LIMIT);
      void AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
  }, [query, searched]);

  const suggested = useQuery({
    queryFn: async (): Promise<SuggestedRow[]> => {
      const result = await getSuggestedBooks(api);
      if (!result || "message" in result) return [];
      return result;
    },
    queryKey: ["books", "suggested"],
    staleTime: 60 * 60 * 1000,
  });

  // The same work can turn up on two of Open Library's pages.
  const docs = useMemo(() => {
    const seen = new Set<string>();
    return (search.data?.pages ?? [])
      .flatMap((page) => page.docs)
      .filter((doc) => {
        if (seen.has(doc.key)) return false;
        seen.add(doc.key);
        return true;
      });
  }, [search.data]);

  const shelved = useMemo(() => {
    const merged: Record<string, ShelvedMarker | null> = {};
    for (const page of search.data?.pages ?? []) {
      Object.assign(merged, page.shelved);
    }
    return { ...merged, ...changed };
  }, [changed, search.data]);

  const onShelfChange = useCallback(
    (olKey: string, entry: ShelfEntry | null) => {
      setChanged((current) => ({
        ...current,
        [olKey]: entry
          ? { favoriteRank: entry.favoriteRank, status: entry.status }
          : null,
      }));
    },
    [],
  );

  /** "by Julia Quinn" in the tray: her books, with the box saying why. */
  const searchAuthor = useCallback((name: string) => {
    setOpen(null);
    setMode("author");
    setInput(name);
  }, []);

  const openBook = useCallback(
    (olKey: string) => {
      const doc =
        docs.find((item) => item.key === olKey) ??
        suggested.data
          ?.flatMap((row) => row.docs)
          .find((item) => item.key === olKey);
      if (doc) setOpen(doc);
    },
    [docs, suggested.data],
  );

  const renderCell = useCallback(
    ({ item }: { item: OpenLibraryBook }) => (
      <BookCard
        book={bookOf(item)}
        onPress={openBook}
        status={shelved[item.key]?.status ?? null}
        width={cellWidth}
      />
    ),
    [cellWidth, openBook, shelved],
  );

  const renderRailItem = useCallback(
    ({ item }: { item: OpenLibraryBook }) => (
      <BookCard
        book={bookOf(item)}
        onPress={openBook}
        status={changed[item.key]?.status ?? null}
        width={RAIL_WIDTH}
      />
    ),
    [changed, openBook],
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = search;
  const total = search.data?.pages[0]?.numFound ?? 0;
  const modeLabel = MODES.find((item) => item.id === mode)?.label.toLowerCase();

  return (
    <View style={styles.fill}>
      <View style={styles.tools}>
        <SearchField
          autoCorrect={false}
          onChangeText={setInput}
          placeholder={PLACEHOLDER[mode]}
          returnKeyType="search"
          value={input}
        />
        <View style={styles.modes}>
          {MODES.map((item) => {
            const active = item.id === mode;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={item.id}
                onPress={() => setMode(item.id)}
                style={({ pressed }) => [
                  styles.mode,
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
                  style={[
                    styles.modeLabel,
                    { color: active ? theme.accent.onFill : theme.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {searching ? (
        <FlatList
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + space.lg },
          ]}
          data={docs}
          keyboardShouldPersistTaps="handled"
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <ListStatus
              empty={
                mode === "all" ? (
                  "No books found."
                ) : (
                  <View style={styles.noMatch}>
                    <Text style={[styles.hint, { color: theme.textGray }]}>
                      No {modeLabel} matches “{query}”.
                    </Text>
                    <Button
                      label="Search everything instead"
                      onPress={() => setMode("all")}
                    />
                  </View>
                )
              }
              error={search.error}
              loading={search.isPending}
              onRetry={() => void search.refetch()}
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
          ListHeaderComponent={
            total > 0 ? (
              <Text style={[styles.total, { color: theme.textGray }]}>
                {total.toLocaleString()} {total === 1 ? "book" : "books"}
              </Text>
            ) : null
          }
          numColumns={COLUMNS}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={1}
          renderItem={renderCell}
          windowSize={7}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.landing,
            { paddingBottom: insets.bottom + space.lg },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {recent.length > 0 ? (
            <View style={styles.recent}>
              <View style={styles.recentHead}>
                <Text style={[styles.rowLabel, { color: theme.textGray }]}>
                  Recent
                </Text>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={space.sm}
                  onPress={() => writeRecent([])}
                >
                  <Text style={[styles.clear, { color: theme.accent.text }]}>
                    Clear
                  </Text>
                </Pressable>
              </View>
              <View style={styles.recentChips}>
                {recent.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    key={item}
                    onPress={() => setInput(item)}
                    style={({ pressed }) => [
                      styles.mode,
                      {
                        backgroundColor: pressed
                          ? theme.material.fillPressed
                          : theme.material.fill,
                        borderColor: theme.material.edge,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.modeLabel, { color: theme.text }]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {suggested.isPending ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : suggested.data?.length ? (
            suggested.data.map((row) => (
              <View key={row.label} style={styles.rowGroup}>
                <Text style={[styles.rowLabel, { color: theme.textGray }]}>
                  {row.label}
                </Text>
                <FlatList
                  contentContainerStyle={styles.rail}
                  data={row.docs}
                  horizontal
                  keyExtractor={keyExtractor}
                  renderItem={renderRailItem}
                  showsHorizontalScrollIndicator={false}
                  style={styles.railScroller}
                />
              </View>
            ))
          ) : (
            <Text style={[styles.hint, { color: theme.textGray }]}>
              Type above to search Open Library.
            </Text>
          )}
        </ScrollView>
      )}

      <BookSheet
        doc={open}
        onAuthorPress={searchAuthor}
        onClose={() => setOpen(null)}
        onShelfChange={onShelfChange}
        viewerShelf={open ? (shelved[open.key] ?? null) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  clear: { fontSize: fontSize.caption, fontWeight: "600" },
  content: { paddingHorizontal: space.md },
  fill: { flex: 1 },
  hint: { fontSize: fontSize.body, textAlign: "center" },
  landing: { gap: space.lg, paddingHorizontal: space.md },
  mode: {
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  modeLabel: { fontSize: fontSize.label, fontWeight: "600" },
  modes: { flexDirection: "row", gap: space.sm },
  noMatch: { alignItems: "center", gap: space.m },
  rail: { gap: space.m, paddingHorizontal: space.md },
  railGhost: { flexDirection: "row", gap: space.m },
  railScroller: { marginHorizontal: -space.md },
  recent: { gap: space.sm },
  recentChips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  recentHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: { gap: GUTTER },
  rowGroup: { gap: space.sm },
  rowLabel: type.eyebrow,
  tools: { gap: space.m, padding: space.md },
  total: { fontSize: fontSize.caption, marginBottom: space.m },
});
