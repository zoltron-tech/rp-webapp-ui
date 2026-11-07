import { Ionicons } from "@expo/vector-icons";
import type { Novelist } from "@nw/types";
import {
  type ShelfEntry,
  type ShelfSummary,
  shelfEntryToDoc,
} from "@nw/types/books";
import { useRouter } from "expo-router";
import {
  type ComponentProps,
  type ComponentType,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import {
  BookCover,
  BookSpine,
  useMarkerFill,
} from "@/components/book-cover";
import { BookSheet } from "@/components/bookshelf/book-sheet";
import { Button } from "@/components/button";
import { EmptyScene } from "@/components/empty-feed";
import { Text } from "@/components/text";
import { useShelfSummary } from "@/hooks/use-shelf";
import { border, fontSize, space, useAppTheme } from "@/theme";

/**
 * The bookshelf teaser on a novelist's profile (BOOKSHELF_PLAN.md §4.1, §5).
 *
 * After the fandoms and before the characters: books say who you are the way
 * fandoms do, and both sit above what you have made. One horizontal row, in
 * order and each part only when it has something: the favorites face-out,
 * the book being read with a ribbon, the rest of the recent shelvings as
 * spines on a plank. Under it, the way to the whole shelf, set as the
 * characters' "See all" is.
 *
 * ## What it says when it cannot say that
 *
 * Nothing while the summary loads — the section appears when it has
 * something, rather than the page jumping twice. Nothing at all when the
 * owner's privacy hides the shelf from this viewer (never a "private"
 * marker). A drawn empty state when the shelf is visible and empty, so the
 * feature is discoverable on every profile that may show it.
 *
 * A cover opens the book's tray; the owner's "Add" and "Add books" open the
 * picker. Hidden from the profile by its owner, the owner alone gets one quiet
 * line saying so, so their profile does not look broken to them.
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
  | { entry: ShelfEntry; kind: "spine" };

const keyOf = (item: RowItem) => `${item.kind}-${item.entry.olKey}`;

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

  return items;
};

const ReadingCover = memo(function ReadingCover({
  entry,
  onPress,
}: {
  entry: ShelfEntry;
  onPress: (entry: ShelfEntry) => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Reading: ${entry.title}`}
      accessibilityRole="button"
      onPress={() => onPress(entry)}
      style={styles.reading}
    >
      <BookCover book={entry} width={READING_WIDTH} />
      <Ribbon label="Reading" />
    </Pressable>
  );
});

/** The ribbon label's line, which is the tab's width once turned. */
const RIBBON_LINE = 14;

/**
 * Web's `RibbonChip`: a tab hanging from the cover's top edge, 8 in from the
 * right, its word running down it (`writing-mode: vertical-rl`). The word is
 * set on one line, measured, and turned a quarter clockwise about its centre,
 * the way `BookSpine` turns its title; the tab is as tall as the word is long.
 */
const Ribbon = ({ label }: { label: string }) => {
  const marker = useMarkerFill();
  // A first guess at "Reading" in 11pt bold, until the line is measured.
  const [length, setLength] = useState(50);

  return (
    <View
      pointerEvents="none"
      style={[styles.ribbon, { backgroundColor: marker }]}
    >
      <View style={{ height: length, width: RIBBON_LINE }}>
        <Text
          numberOfLines={1}
          onTextLayout={(event) => {
            const next = Math.ceil(event.nativeEvent.lines[0]?.width ?? 0);
            if (next > 0 && next !== length) setLength(next);
          }}
          style={[
            styles.ribbonLabel,
            {
              left: (RIBBON_LINE - RIBBON_BOX) / 2,
              top: (length - RIBBON_LINE) / 2,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};

/** The label's unturned box: wide enough for the word, centred in it. */
const RIBBON_BOX = 96;

export const BookshelfRow = ({
  Header,
  novelist,
  onOpen,
  own,
  SeeMore,
}: {
  /** The profile's own section header, so the row matches its neighbours. */
  Header: ComponentType<{
    action?: {
      icon?: ComponentProps<typeof Ionicons>["name"];
      label: string;
      onPress: () => void;
    };
    label: string;
  }>;
  novelist: Novelist;
  /** Opens the Books screen. */
  onOpen: () => void;
  own: boolean;
  /** The profile's "See all" link, so the way to the shelf matches the characters'. */
  SeeMore: ComponentType<{
    icon: ComponentProps<typeof Ionicons>["name"];
    label: string;
    onPress: () => void;
  }>;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const summary = useShelfSummary(novelist.id);
  const [open, setOpen] = useState<ShelfEntry | null>(null);

  const openPicker = useCallback(() => router.push("/books/search"), [router]);
  const headerAction = useMemo(
    () =>
      own
        ? { icon: "book-outline" as const, label: "Add", onPress: openPicker }
        : undefined,
    [openPicker, own],
  );

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
              <Pressable
                accessibilityLabel={item.entry.title}
                accessibilityRole="button"
                onPress={() => setOpen(item.entry)}
              >
                <BookCover book={item.entry} width={FAVORITE_WIDTH} />
              </Pressable>
            </View>
          );
        case "reading":
          return <ReadingCover entry={item.entry} onPress={setOpen} />;
        case "spine":
          return (
            <Pressable
              accessibilityLabel={item.entry.title}
              accessibilityRole="button"
              onPress={() => setOpen(item.entry)}
              style={styles.spine}
            >
              <BookSpine
                book={item.entry}
                favorite={item.entry.favoriteRank != null}
              />
            </Pressable>
          );
      }
    },
    [],
  );

  // Loading, failed, or hidden from this viewer: the section is simply absent.
  if (!summary.data) return null;

  // Hidden from the profile by its owner. Visitors see nothing at all.
  if (summary.data.showOnProfile === false) {
    if (!own) return null;
    return (
      <View style={[styles.hidden, styles.gutter]}>
        <Ionicons color={theme.textGray} name="eye-off-outline" size={14} />
        <Text style={[styles.hiddenText, { color: theme.textGray }]}>
          Your bookshelf is hidden from your profile.{" "}
          <Text
            accessibilityRole="link"
            onPress={() => router.push("/edit-profile/privacy")}
            style={{ color: theme.accent.text }}
          >
            Change in Profile privacy
          </Text>
        </Text>
      </View>
    );
  }

  const { total } = summary.data;
  const label = `Bookshelf · ${total} ${total === 1 ? "book" : "books"}`;

  if (total === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.gutter}>
          <Header action={headerAction} label={label} />
        </View>
        <EmptyScene
          action={
            own ? (
              <Button
                icon="add"
                label="Add books"
                onPress={openPicker}
                variant="primary"
              />
            ) : null
          }
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
        <Header action={headerAction} label={label} />
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

      <View style={styles.gutter}>
        <SeeMore icon="library" label="See the shelf" onPress={onOpen} />
      </View>

      <BookSheet
        doc={open ? shelfEntryToDoc(open) : null}
        onClose={() => setOpen(null)}
        viewerShelf={
          !open
            ? null
            : own
              ? { favoriteRank: open.favoriteRank, status: open.status }
              : open.viewerStatus
                ? { favoriteRank: null, status: open.viewerStatus }
                : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.lg,
  },
  hiddenText: { flex: 1, fontSize: fontSize.caption, lineHeight: 17 },
  favorite: { marginRight: space.xs },
  gutter: { paddingHorizontal: space.md },
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
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    elevation: 4,
    paddingBottom: 5,
    paddingHorizontal: 5,
    paddingTop: 8,
    position: "absolute",
    right: 8,
    shadowColor: "#000000",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    top: 0,
  },
  ribbonLabel: {
    color: "#ffffff",
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: fontSize.meta * 0.06,
    lineHeight: RIBBON_LINE,
    position: "absolute",
    textAlign: "center",
    transform: [{ rotate: "90deg" }],
    width: RIBBON_BOX,
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
