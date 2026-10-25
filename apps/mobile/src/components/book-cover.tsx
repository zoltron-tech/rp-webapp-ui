import { type Book, bookCoverUrl } from "@nw/types/books";
import { memo } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { Image } from "@/components/image";
import { Text } from "@/components/text";
import { contrastRatio } from "@/lib/color";
import { border, fontSize, radius, useAppTheme } from "@/theme";

/**
 * A book as the shelf draws it (BOOKSHELF_PLAN.md §1.3).
 *
 * Face-out, it is the Open Library cover at 2:3 — or, when the work has no
 * cover, a generated "paper" cover: the title and first author on a page toned
 * in the book's spine colour, so a missing picture never leaves a hole.
 *
 * Standing, it is a **spine**: a tall narrow block filled with `spineHex` and
 * the title running down it in serif. No image per book, so a run of them is
 * cheap, and it is what makes the row read as a shelf rather than a grid.
 */

/** The spine's height, which the face-out covers stand level with. */
export const SPINE_HEIGHT = 110;

/** Spine widths by thickness bucket, in points. */
const SPINE_WIDTHS = { thick: 34, thin: 22, usual: 28 } as const;

/** Title in serif, as the plan asks: the system serif on each platform. */
const SERIF = Platform.select({ android: "serif", default: "Times New Roman" });

/** Dark ink for a light fill; the paper cover's ink in either theme. */
const INK_DARK = "#2a2520";
const INK_LIGHT = "#fdfaf4";

/** FNV-1a: a stable number from the Open Library key. */
const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const hex2 = (value: number) =>
  Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, "0");

/** HSL (0–360, 0–1, 0–1) to `#rrggbb`. */
const hslToHex = (h: number, s: number, l: number) => {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${hex2(f(0) * 255)}${hex2(f(8) * 255)}${hex2(f(4) * 255)}`;
};

/**
 * The spine's fill: what the owner's client extracted from the cover, else a
 * hue from the key at a fixed saturation and lightness — unique per book, and
 * inside the 25–65 % lightness band that keeps the title legible either way.
 */
export const spineColor = (book: Pick<Book, "olKey" | "spineHex">): string =>
  book.spineHex && /^#[0-9a-f]{6}$/i.test(book.spineHex)
    ? book.spineHex
    : hslToHex(hash(book.olKey) % 360, 0.42, 0.42);

/** A 600-page novel stands wider than a novella. Unknown reads as usual. */
export const spineWidth = (pagesMedian: number | null): number => {
  if (pagesMedian === null || pagesMedian <= 0) return SPINE_WIDTHS.usual;
  if (pagesMedian < 200) return SPINE_WIDTHS.thin;
  if (pagesMedian > 450) return SPINE_WIDTHS.thick;
  return SPINE_WIDTHS.usual;
};

/** Whichever ink reads better on this fill. */
const inkOn = (fill: string) =>
  contrastRatio(INK_LIGHT, fill) >= contrastRatio(INK_DARK, fill)
    ? INK_LIGHT
    : INK_DARK;

/**
 * A cover-less book, face-out: the title and first author on toned paper.
 * `width` sets the type scale, so the same card serves a thumbnail and a grid
 * cell.
 */
export const PaperCover = memo(function PaperCover({
  book,
  width,
}: {
  book: Book;
  width: number;
}) {
  const fill = spineColor(book);
  const ink = inkOn(fill);
  const compact = width < 80;

  return (
    <View
      style={[
        styles.paper,
        { backgroundColor: fill, padding: compact ? 6 : 10 },
      ]}
    >
      <View style={[styles.paperRule, { backgroundColor: ink }]} />
      <Text
        numberOfLines={compact ? 3 : 4}
        style={[
          styles.paperTitle,
          {
            color: ink,
            fontSize: compact ? fontSize.meta : fontSize.label,
            lineHeight: compact ? 13 : 16,
          },
        ]}
      >
        {book.title}
      </Text>
      {book.authors[0] ? (
        <Text
          numberOfLines={compact ? 1 : 2}
          style={[
            styles.paperAuthor,
            { color: ink, fontSize: compact ? 9 : fontSize.meta },
          ]}
        >
          {book.authors[0]}
        </Text>
      ) : null}
    </View>
  );
});

/**
 * A book face-out at 2:3, the cover or the paper stand-in. Fills its box:
 * give it a sized `style`.
 */
export const BookCover = memo(function BookCover({
  book,
  style,
  width,
}: {
  book: Book;
  style?: ViewStyle;
  width: number;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.cover,
        {
          borderColor: theme.material.edge,
          height: Math.round(width * 1.5),
          width,
        },
        style,
      ]}
    >
      {book.coverId ? (
        <Image
          accessibilityIgnoresInvertColors
          contentFit="cover"
          source={{ uri: bookCoverUrl(book.coverId, "M") }}
          style={StyleSheet.absoluteFill}
          transition={120}
        />
      ) : (
        <PaperCover book={book} width={width} />
      )}
    </View>
  );
});

/**
 * A book standing on the shelf.
 *
 * The title is one `Text` laid out as a horizontal line as long as the spine
 * is tall, then rotated a quarter turn clockwise about its centre — so it
 * reads top to bottom, as an English spine does. The layout box overflows
 * the spine before the transform, which is why the spine never clips.
 */
export const BookSpine = memo(function BookSpine({ book }: { book: Book }) {
  const fill = spineColor(book);
  const width = spineWidth(book.pagesMedian);
  const ink = inkOn(fill);
  const length = SPINE_HEIGHT - 14;

  return (
    <View
      accessibilityLabel={book.title}
      style={[
        styles.spine,
        { backgroundColor: fill, height: SPINE_HEIGHT, width },
      ]}
    >
      <View style={[styles.spineBand, { backgroundColor: ink }]} />
      <Text
        numberOfLines={1}
        style={[
          styles.spineTitle,
          {
            color: ink,
            // Centred unrotated, then turned: a box `length` wide and `width`
            // tall becomes one `width` wide and `length` tall.
            left: (width - length) / 2,
            lineHeight: width,
            top: (SPINE_HEIGHT - width) / 2,
            width: length,
          },
        ]}
      >
        {book.title}
      </Text>
      <View style={[styles.spineBandFoot, { backgroundColor: ink }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  cover: {
    borderRadius: radius.xs,
    borderWidth: border.edge,
    overflow: "hidden",
  },
  paper: {
    flex: 1,
    justifyContent: "flex-start",
  },
  paperAuthor: {
    fontStyle: "italic",
    marginTop: 4,
    opacity: 0.8,
  },
  paperRule: { height: 1, marginBottom: 6, opacity: 0.5, width: "40%" },
  paperTitle: { fontFamily: SERIF, fontWeight: "700" },
  spine: {
    borderRadius: 2,
    // The title's layout box is wider than the spine until it is turned.
    overflow: "visible",
  },
  spineBand: {
    height: 2,
    left: 4,
    opacity: 0.45,
    position: "absolute",
    right: 4,
    top: 5,
  },
  spineBandFoot: {
    bottom: 5,
    height: 2,
    left: 4,
    opacity: 0.45,
    position: "absolute",
    right: 4,
  },
  spineTitle: {
    fontFamily: SERIF,
    fontSize: fontSize.meta,
    fontWeight: "600",
    position: "absolute",
    textAlign: "center",
    transform: [{ rotate: "90deg" }],
  },
});
