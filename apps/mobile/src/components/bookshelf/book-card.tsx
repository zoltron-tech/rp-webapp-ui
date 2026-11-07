import { Ionicons } from "@expo/vector-icons";
import { BOOK_STATUS_LABEL, type Book, type BookStatus } from "@nw/types/books";
import { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { BookCover } from "@/components/book-cover";
import { SelectMark } from "@/components/muse/media-selection";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One book in a grid or a rail: the cover, the title, the first author, the
 * year. Web's `BookCard`, for the Books screen and the picker alike.
 *
 * Takes the book's key on its callbacks rather than a closure per card, so a
 * list hands every card the same two functions and `memo` holds.
 */
export const BookCard = memo(function BookCard({
  book,
  favorite = false,
  onPress,
  onQuickAdd,
  quickAdding = false,
  selected,
  status,
  width,
}: {
  book: Book;
  favorite?: boolean;
  onPress: (olKey: string) => void;
  /** "Add to my Bookshelf", on somebody else's shelf. */
  onQuickAdd?: (olKey: string) => void;
  quickAdding?: boolean;
  /** Set in select mode: whether this one is chosen. */
  selected?: boolean;
  /** A chip naming where this book sits on a shelf. */
  status?: BookStatus | null;
  width: number;
}) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        accessibilityLabel={book.title}
        accessibilityRole="button"
        accessibilityState={selected === undefined ? undefined : { selected }}
        onPress={() => onPress(book.olKey)}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <View>
          <BookCover book={book} favorite={favorite} width={width} />
          {selected === undefined ? null : (
            <SelectMark accent={theme.accent.solid} selected={selected} />
          )}
        </View>
        <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
          {book.title}
        </Text>
        {book.authors[0] ? (
          <Text
            numberOfLines={1}
            style={[styles.author, { color: theme.textGray }]}
          >
            {book.authors[0]}
          </Text>
        ) : null}
        {book.firstYear ? (
          <Text style={[styles.year, { color: theme.textGray }]}>
            {book.firstYear}
          </Text>
        ) : null}
      </Pressable>

      {status ? (
        <View
          style={[
            styles.chip,
            {
              backgroundColor: theme.accent.tint,
              borderColor: theme.accent.surfaceHover,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.chipLabel, { color: theme.accent.text }]}
          >
            {BOOK_STATUS_LABEL[status]}
          </Text>
        </View>
      ) : onQuickAdd ? (
        <Pressable
          accessibilityLabel={`Add ${book.title} to my bookshelf`}
          accessibilityRole="button"
          disabled={quickAdding}
          hitSlop={space.xs}
          onPress={() => onQuickAdd(book.olKey)}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          {quickAdding ? (
            <ActivityIndicator color={theme.accent.text} size="small" />
          ) : (
            <>
              <Ionicons color={theme.accent.text} name="add" size={12} />
              <Text
                numberOfLines={1}
                style={[styles.chipLabel, { color: theme.accent.text }]}
              >
                Add
              </Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  author: { fontSize: fontSize.caption },
  body: { gap: space.xs },
  card: { gap: space.xs, marginBottom: space.md },
  chip: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
    maxWidth: "100%",
    minHeight: 24,
    paddingHorizontal: space.sm,
  },
  chipLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  pressed: { opacity: 0.75 },
  title: { fontSize: fontSize.label, fontWeight: "600", lineHeight: 17 },
  year: { fontSize: fontSize.meta },
});
