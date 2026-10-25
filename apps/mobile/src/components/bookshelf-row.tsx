import { Ionicons } from "@expo/vector-icons";
import type { Novelist } from "@nw/types";
import type { ShelfEntry, ShelfSummary } from "@nw/types/books";
import { type ComponentType, memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { BookCover, BookSpine, SPINE_HEIGHT } from "@/components/book-cover";
import { EmptyScene } from "@/components/empty-feed";
import { Text } from "@/components/text";
import { useShelfSummary } from "@/hooks/use-shelf";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The bookshelf teaser on a novelist's profile (BOOKSHELF_PLAN.md §4.1, §5).
 *
 * After the fandoms and before the characters: books say who you are the way
 * fandoms do, and both sit above what you have made. One horizontal row, in
 * order and each part only when it has something: the favorites face-out,
 * the book being read with a ribbon, the rest of the recent shelvings as
 * spines on a plank, then the way to the whole shelf.
 *
 * ## What it says when it cannot say that
 *
 * Nothing while the summary loads — the section appears when it has
 * something, rather than the page jumping twice. Nothing at all when the
 * owner's privacy hides the shelf from this viewer (never a "private"
 * marker). A drawn empty state when the shelf is visible and empty, so the
 * feature is discoverable on every profile that may show it.
 *
 * Read-only in phase 1: a cover is not yet a tap, and the owner's `+` and
 * "Add books" wait on the picker (1b).
 */

/** Face-out favorites on a phone — web shows six. */
const FAVORITE_COUNT = 4;
const FAVORITE_WIDTH = 68;
/** Each favorite leans over the one before it by this much. */
const FAVORITE_OVERLAP = 7;
const READING_WIDTH = 60;
/** The shelf board the books stand on. */
const PLANK_HEIGHT = 8;

type RowItem =
  | { entry: ShelfEntry; index: number; kind: "favorite" }
  | { entry: ShelfEntry; kind: "reading" }
  | { entry: ShelfEntry; kind: "spine" }
  | { kind: "more" };

const keyOf = (item: RowItem) =>
  item.kind === "more" ? "more" : `${item.kind}-${item.entry.olKey}`;

/**
 * The row's items from the summary: favorites first, one book being read,
 * then whatever recent shelvings are not already standing face-out.
 */
const itemsOf = (summary: ShelfSummary): RowItem[] => {
  const shown = new Set<string>();
  const items: RowItem[] = [];

  summary.favorites.slice(0, FAVORITE_COUNT).forEach((entry, index) => {
    shown.add(entry.olKey);
    items.push({ entry, index, kind: "favorite" });
  });

  const reading = summary.reading.find((entry) => !shown.has(entry.olKey));
  if (reading) {
    shown.add(reading.olKey);
    items.push({ entry: reading, kind: "reading" });
  }

  for (const entry of summary.recent) {
    if (shown.has(entry.olKey)) continue;
    shown.add(entry.olKey);
    items.push({ entry, kind: "spine" });
  }

  items.push({ kind: "more" });
  return items;
};

const ReadingCover = memo(function ReadingCover({
  entry,
}: {
  entry: ShelfEntry;
}) {
  const theme = useAppTheme();
  return (
    <View accessibilityLabel={`Reading: ${entry.title}`} style={styles.reading}>
      <BookCover book={entry} width={READING_WIDTH} />
      <View style={[styles.ribbon, { backgroundColor: theme.accent.solid }]}>
        <Text numberOfLines={1} style={styles.ribbonLabel}>
          Reading
        </Text>
      </View>
    </View>
  );
});

const SeeShelf = memo(function SeeShelf({ onPress }: { onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.more,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Text style={[styles.moreLabel, { color: theme.textGray }]}>
        See the shelf
      </Text>
      <Ionicons color={theme.textGray} name="arrow-forward" size={14} />
    </Pressable>
  );
});

export const BookshelfRow = ({
  Header,
  novelist,
  onOpen,
  own,
}: {
  /** The profile's own section header, so the row matches its neighbours. */
  Header: ComponentType<{ label: string }>;
  novelist: Novelist;
  /** Opens the Books screen. */
  onOpen: () => void;
  own: boolean;
}) => {
  const theme = useAppTheme();
  const summary = useShelfSummary(novelist.id);

  const items = useMemo(
    () => (summary.data ? itemsOf(summary.data) : []),
    [summary.data],
  );

  const renderItem = useCallback(
    ({ item }: { item: RowItem }) => {
      switch (item.kind) {
        case "favorite":
          return (
            <View
              style={[
                styles.favorite,
                {
                  marginLeft: item.index === 0 ? 0 : -FAVORITE_OVERLAP,
                  transform: [
                    { rotate: item.index % 2 === 0 ? "-1.5deg" : "1.5deg" },
                  ],
                  zIndex: FAVORITE_COUNT - item.index,
                },
              ]}
            >
              <BookCover book={item.entry} width={FAVORITE_WIDTH} />
            </View>
          );
        case "reading":
          return <ReadingCover entry={item.entry} />;
        case "spine":
          return (
            <View style={styles.spine}>
              <BookSpine book={item.entry} />
            </View>
          );
        case "more":
          return <SeeShelf onPress={onOpen} />;
      }
    },
    [onOpen],
  );

  // Loading, failed, or hidden from this viewer: the section is simply absent.
  // Hidden by privacy, or hidden from the profile by its owner.
  if (!summary.data || summary.data.showOnProfile === false) return null;

  const { total } = summary.data;
  const label = `Bookshelf · ${total} ${total === 1 ? "book" : "books"}`;

  if (total === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.gutter}>
          <Header label={label} />
        </View>
        <EmptyScene
          scene="empty-shelf"
          subtitle={
            own
              ? "Shelve the books that made you a writer."
              : `${novelist.username}'s bookshelf is waiting for its first story.`
          }
          title={own ? "Your bookshelf is empty" : "No books yet"}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.gutter}>
        <Header label={label} />
      </View>

      <View style={styles.shelf}>
        {/* The plank, under the books: they scroll across it. */}
        <View
          pointerEvents="none"
          style={[
            styles.plank,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        />
        <FlatList
          contentContainerStyle={styles.row}
          data={items}
          horizontal
          keyExtractor={keyOf}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  favorite: { marginRight: space.xs },
  gutter: { paddingHorizontal: space.md },
  more: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    marginBottom: (SPINE_HEIGHT - 32) / 2,
    marginLeft: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm - 1,
  },
  moreLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  plank: {
    borderRadius: 2,
    borderWidth: border.edge,
    bottom: 0,
    height: PLANK_HEIGHT,
    left: space.md,
    position: "absolute",
    right: space.md,
  },
  reading: { marginLeft: space.sm, marginRight: space.sm },
  ribbon: {
    borderRadius: 3,
    bottom: 6,
    left: -3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    position: "absolute",
    right: -3,
  },
  ribbonLabel: {
    color: "#ffffff",
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.4,
    textAlign: "center",
    textTransform: "uppercase",
  },
  row: {
    alignItems: "flex-end",
    paddingBottom: PLANK_HEIGHT,
    paddingHorizontal: space.md,
    // Room for a tilted favorite's top corner.
    paddingTop: space.xs,
  },
  section: { gap: space.sm, marginTop: space.lg },
  shelf: { position: "relative" },
  spine: { marginRight: 3 },
});
