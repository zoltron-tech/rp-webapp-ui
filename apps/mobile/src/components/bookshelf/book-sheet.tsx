import { Ionicons } from "@expo/vector-icons";
import { getBookDetails } from "@nw/api/endpoints/books";
import { useApi } from "@nw/features";
import {
  authorPhotoUrl,
  BOOK_STATUS_LABEL,
  type BookDetails,
  type BookStatus,
  docToBook,
  isFavoritable,
  type OpenLibraryBook,
  type ShelfEntry,
} from "@nw/types/books";
import { useQuery } from "@tanstack/react-query";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BookCover } from "@/components/book-cover";
import { Image } from "@/components/image";
import { BottomSheet } from "@/components/sheet";
import { Bone } from "@/components/skeleton";
import { Text } from "@/components/text";
import {
  useShelfActions,
  type ViewerShelfState,
} from "@/hooks/use-shelf-actions";
import { useA11ySettings } from "@/lib/a11y-settings";
import { openExternalLink } from "@/lib/safe-link";
import {
  AccentProvider,
  border,
  fontSize,
  radius,
  space,
  useAppTheme,
} from "@/theme";

/**
 * One book, in a tray — web's `BookDialog` on a phone, in the same order:
 *
 *  1. which book — cover, who wrote it, one quiet line of facts, and beside
 *     the cover, in the room under the author, the shelf control;
 *  2. what it is about — three lines of description;
 *  3. everything else, folded under "More details" until asked for.
 *
 * It used to lay all of Open Library's record out at once around a boxed
 * "Your bookshelf" panel, and the three choices that are the point of opening
 * a book here got lost among them.
 *
 * The facts at the top come with the card that opened it, so the tray is never
 * empty; the long text is fetched on open, by book (react-query), so a screen
 * re-rendering under the tray never fetches it again. The shelf control always
 * describes the **viewer's** shelf, whoever's card the book came from
 * (BOOKSHELF_PLAN.md §4.2).
 */

/** Long chip lists (The Hobbit has 60+ subjects) show this many, then "+N". */
const CHIP_LIMIT = 8;
const LIST_LIMIT = 4;
/** Enough to say what the book is; "Read more" has the rest. */
const DESCRIPTION_LINES = 3;
const BIO_LINES = 3;
const COVER = 92;

const STATUSES: BookStatus[] = ["WANT_TO_READ", "READING", "READ"];

const STATUS_ICON: Record<BookStatus, ComponentProps<typeof Ionicons>["name"]> =
  {
    READ: "checkmark-circle-outline",
    READING: "book-outline",
    WANT_TO_READ: "bookmark-outline",
  };

const EBOOK_LABEL: Record<
  NonNullable<OpenLibraryBook["ebookAccess"]>,
  string | null
> = {
  borrowable: "Borrowable ebook",
  no_ebook: null,
  printdisabled: "Ebook for print-disabled readers",
  public: "Free ebook",
};

/** "A · B · C +3 more" */
const joinSome = (items: string[], limit: number) =>
  items.slice(0, limit).join(" · ") +
  (items.length > limit ? ` +${items.length - limit} more` : "");

interface BookSheetProps {
  /** The book. `null` keeps the tray closed. */
  doc: OpenLibraryBook | null;
  /** When given, an author's name runs a search for their other books. */
  onAuthorPress?: (name: string) => void;
  onClose: () => void;
  /** After any write: the new row, or null once it has left the shelf. */
  onShelfChange?: (olKey: string, entry: ShelfEntry | null) => void;
  /** The signed-in novelist's own shelf row for this book, when known. */
  viewerShelf?: ViewerShelfState;
}

/** In the viewer's accent, on anybody's page: it is about their shelf. */
export const BookSheet = (props: BookSheetProps) => (
  <AccentProvider palette={undefined}>
    <BookSheetView {...props} />
  </AccentProvider>
);

const BookSheetView = ({
  doc,
  onAuthorPress,
  onClose,
  onShelfChange,
  viewerShelf = null,
}: BookSheetProps) => {
  const api = useApi();

  // Held through the slide out, so the tray does not empty as it leaves.
  const last = useRef(doc);
  if (doc) last.current = doc;
  const shown = doc ?? last.current;

  const details = useQuery({
    enabled: doc !== null,
    queryFn: async (): Promise<BookDetails> => {
      const result = await getBookDetails(api, doc?.key ?? "");
      if (!result || "message" in result) throw new Error("no details");
      return result;
    },
    queryKey: ["book", doc?.key ?? "", "details"],
    staleTime: 60 * 60 * 1000,
  });

  return (
    <BottomSheet
      fill
      ignoreKeyboard
      maxHeightRatio={0.88}
      onClose={onClose}
      title={shown?.title ?? ""}
      visible={doc !== null}
    >
      {shown ? (
        <ScrollView contentContainerStyle={styles.body}>
          <BookBody
            details={details.data ?? null}
            doc={shown}
            error={details.isError}
            key={shown.key}
            loading={details.isPending}
            onAuthorPress={onAuthorPress}
            onClose={onClose}
            onShelfChange={onShelfChange}
            viewerShelf={viewerShelf}
          />
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
};

const BookBody = ({
  details,
  doc,
  error,
  loading,
  onAuthorPress,
  onClose,
  onShelfChange,
  viewerShelf,
}: {
  details: BookDetails | null;
  doc: OpenLibraryBook;
  error: boolean;
  loading: boolean;
  onAuthorPress?: (name: string) => void;
  onClose: () => void;
  onShelfChange?: (olKey: string, entry: ShelfEntry | null) => void;
  viewerShelf: ViewerShelfState;
}) => {
  const theme = useAppTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  // One line of facts under the author: rating, year and length. The rest
  // of what Open Library knows lives under "More details".
  const facts = [
    details?.firstPublishDate ?? doc.firstPublishYear?.toString(),
    doc.numberOfPagesMedian &&
      `${doc.numberOfPagesMedian.toLocaleString()} pages`,
  ].filter(Boolean) as string[];
  const rated = Boolean(doc.ratingsCount && doc.ratingsAverage);

  const editions = [
    doc.editionCount && `${doc.editionCount.toLocaleString()} editions`,
    doc.ebookAccess && EBOOK_LABEL[doc.ebookAccess],
  ].filter(Boolean) as string[];

  const readers = [
    [doc.wantToReadCount, "want to read"],
    [doc.currentlyReadingCount, "reading"],
    [doc.alreadyReadCount, "read"],
  ].filter(([count]) => count) as [number, string][];

  const author = details?.author;

  const hasMore =
    Boolean(details?.firstSentence) ||
    Boolean((details?.subjects ?? doc.subject)?.length) ||
    Boolean((details?.people ?? doc.person)?.length) ||
    Boolean((details?.places ?? doc.place)?.length) ||
    Boolean((details?.times ?? doc.time)?.length) ||
    editions.length > 0 ||
    Boolean(doc.publisher?.length) ||
    readers.length > 0 ||
    Boolean(author?.name) ||
    Boolean(details?.links?.length);

  return (
    <>
      <View style={styles.top}>
        <BookCover book={docToBook(doc)} quality="L" width={COVER} />
        <View style={styles.summary}>
          {doc.subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: theme.textGray }]}
            >
              {doc.subtitle}
            </Text>
          ) : null}
          {doc.authorName?.length ? (
            <Text
              numberOfLines={2}
              style={[styles.authors, { color: theme.text }]}
            >
              by{" "}
              {doc.authorName.map((name, index) => (
                <Text key={name}>
                  {index > 0 ? ", " : ""}
                  {onAuthorPress ? (
                    <Text
                      accessibilityHint="Searches for their other books"
                      accessibilityRole="link"
                      onPress={() => onAuthorPress(name)}
                      style={{ color: theme.accent.text }}
                    >
                      {name}
                    </Text>
                  ) : (
                    name
                  )}
                </Text>
              ))}
            </Text>
          ) : null}
          {rated || facts.length > 0 ? (
            <View style={styles.facts}>
              {rated ? (
                <View
                  accessibilityLabel={`Rated ${doc.ratingsAverage?.toFixed(1)} out of 5`}
                  style={styles.rating}
                >
                  <Ionicons color={theme.accent.text} name="star" size={12} />
                  <Text style={[styles.ratingValue, { color: theme.text }]}>
                    {doc.ratingsAverage?.toFixed(1)}
                  </Text>
                </View>
              ) : null}
              {facts.map((fact, index) => (
                <Text
                  key={fact}
                  style={[styles.meta, { color: theme.textGray }]}
                >
                  {index > 0 || rated ? "·  " : ""}
                  {fact}
                </Text>
              ))}
            </View>
          ) : null}

          <ShelfControl
            doc={doc}
            onRemoved={onClose}
            onShelfChange={onShelfChange}
            viewerShelf={viewerShelf}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <Bone height={12} />
          <Bone height={12} />
          <Bone height={12} width="70%" />
        </View>
      ) : null}
      {error ? (
        <Text style={[styles.meta, { color: theme.textGray }]}>
          Couldn't load the full description right now.
        </Text>
      ) : null}

      {details?.description ? (
        <Prose lines={DESCRIPTION_LINES} text={details.description} />
      ) : null}

      {hasMore ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: moreOpen }}
          hitSlop={space.xs}
          onPress={() => setMoreOpen((open) => !open)}
          style={({ pressed }) => [
            styles.moreToggle,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Text style={[styles.moreLabel, { color: theme.textGray }]}>
            {moreOpen ? "Fewer details" : "More details"}
          </Text>
          <Ionicons
            color={theme.textGray}
            name={moreOpen ? "chevron-up" : "chevron-down"}
            size={14}
          />
        </Pressable>
      ) : null}

      {moreOpen ? (
        <View style={[styles.more, { borderTopColor: theme.material.edge }]}>
          {details?.firstSentence ? (
            <Section title="First sentence">
              <Text style={[styles.quote, { color: theme.text }]}>
                {details.firstSentence}
              </Text>
            </Section>
          ) : null}

          <Chips items={details?.subjects ?? doc.subject} title="Tags" />
          <Chips items={details?.people ?? doc.person} title="Characters" />
          <Chips items={details?.places ?? doc.place} title="Places" />
          <Chips items={details?.times ?? doc.time} title="Time periods" />

          {editions.length > 0 || doc.publisher?.length ? (
            <Section title="Editions">
              {editions.length > 0 ? (
                <Text style={[styles.meta, { color: theme.textGray }]}>
                  {editions.join(" · ")}
                </Text>
              ) : null}
              {doc.publisher?.length ? (
                <Text style={[styles.meta, { color: theme.textGray }]}>
                  {joinSome(doc.publisher, LIST_LIMIT)}
                </Text>
              ) : null}
            </Section>
          ) : null}

          {readers.length > 0 ? (
            <Section title="On Open Library">
              <Text style={[styles.meta, { color: theme.textGray }]}>
                {readers
                  .map(([count, label]) => `${count.toLocaleString()} ${label}`)
                  .join(" · ")}
              </Text>
            </Section>
          ) : null}

          {author?.name ? (
            <Section title="About the author">
              <View style={styles.authorRow}>
                {author.photoId ? (
                  <Image
                    contentFit="cover"
                    source={{ uri: authorPhotoUrl(author.photoId) }}
                    style={styles.authorPhoto}
                  />
                ) : null}
                <View style={styles.authorText}>
                  <Text style={[styles.authorName, { color: theme.text }]}>
                    {author.name}
                  </Text>
                  {author.birthDate || author.deathDate ? (
                    <Text style={[styles.meta, { color: theme.textGray }]}>
                      {author.birthDate ?? "?"}
                      {author.deathDate ? ` – ${author.deathDate}` : ""}
                    </Text>
                  ) : null}
                </View>
              </View>
              {author.bio ? (
                <Prose lines={BIO_LINES} text={author.bio} />
              ) : null}
            </Section>
          ) : null}

          {details?.links?.length ? (
            <Section title="Links">
              {details.links.map((link) => (
                <Text
                  accessibilityRole="link"
                  key={link.url}
                  onPress={() => void openExternalLink(link.url)}
                  style={[styles.link, { color: theme.accent.text }]}
                >
                  {link.title}
                </Text>
              ))}
            </Section>
          ) : null}
        </View>
      ) : null}

      {/* The link is the credit: it names the source and takes you there. */}
      <Pressable
        accessibilityRole="link"
        hitSlop={space.sm}
        onPress={() =>
          void openExternalLink(`https://openlibrary.org${doc.key}`)
        }
        style={({ pressed }) => [styles.footer, pressed && styles.pressed]}
      >
        <Text style={[styles.footerLabel, { color: theme.textGray }]}>
          View on Open Library
        </Text>
        <Ionicons color={theme.textGray} name="open-outline" size={12} />
      </Pressable>
    </>
  );
};

type Busy = "favorite" | "remove" | null;

/** The track's inset around the three options and the thumb. */
const TRACK_PAD = 3;
const SLIDE_MS = 280;

/**
 * The viewer's shelf for this book: one track of three choices with a
 * highlight that slides to the chosen one, then — once the book is on the
 * shelf — the heart and Remove in one slim row under it.
 *
 * Only one status can hold, so it is one control, not three buttons. A tap
 * moves the highlight at once and saves behind it (optimistic): writes are
 * queued so they reach the server in the order tapped, a tap superseded
 * before its turn is never sent, a tap back to what the server already has
 * sends nothing, and a failure slides back to what the server last confirmed
 * (the hook's alert says why). The slide runs on the native driver.
 *
 * Favorites are Read and Reading only, and the two moves that would lose a
 * favorite ask first (BOOKSHELF_PLAN.md §1.5).
 */
const ShelfControl = ({
  doc,
  onRemoved,
  onShelfChange,
  viewerShelf,
}: {
  doc: OpenLibraryBook;
  /** The book left the shelf; the tray has nothing left to say about it. */
  onRemoved: () => void;
  onShelfChange?: (olKey: string, entry: ShelfEntry | null) => void;
  viewerShelf: ViewerShelfState;
}) => {
  const theme = useAppTheme();
  const { reduceMotion } = useA11ySettings();
  const { favorite, shelve, unfavorite, unshelve } = useShelfActions();
  // A local mirror, so the control answers at once whether or not the screen
  // feeds `viewerShelf` back.
  const [shelf, setShelf] = useState<ViewerShelfState>(viewerShelf);
  const [busy, setBusy] = useState<Busy>(null);
  /** A status write is queued or in flight: the heart and Remove wait. */
  const [saving, setSaving] = useState(false);

  /** What the server last confirmed — where a failed move slides back to. */
  const confirmed = useRef<ViewerShelfState>(viewerShelf);
  /** Status writes, one after another, in the order they were tapped. */
  const queue = useRef<Promise<void>>(Promise.resolve());
  /** The latest tap; an older one still waiting its turn is dropped. */
  const latest = useRef(0);

  // By value: screens build `viewerShelf` as a fresh object on every render,
  // and following its identity would snap the highlight back to the old
  // status whenever the screen re-rendered mid-save.
  const shelfStatus = viewerShelf?.status ?? null;
  const shelfRank = viewerShelf?.favoriteRank ?? null;
  useEffect(() => {
    const next = shelfStatus
      ? { favoriteRank: shelfRank, status: shelfStatus }
      : null;
    setShelf(next);
    confirmed.current = next;
  }, [shelfStatus, shelfRank]);

  const isFavorite = shelf?.favoriteRank != null;

  const apply = (entry: ShelfEntry | null) => {
    const next = entry
      ? { favoriteRank: entry.favoriteRank, status: entry.status }
      : null;
    confirmed.current = next;
    setShelf(next);
    onShelfChange?.(doc.key, entry);
  };

  const run = async (key: Busy, task: () => Promise<void>) => {
    if (busy || saving) return;
    setBusy(key);
    try {
      await task();
    } finally {
      setBusy(null);
    }
  };

  const moveTo = (status: BookStatus) => {
    const ticket = ++latest.current;
    setSaving(true);
    // The highlight moves now. A favorite stays one only where it may.
    setShelf((current) => ({
      favoriteRank: isFavoritable(status)
        ? (current?.favoriteRank ?? null)
        : null,
      status,
    }));

    queue.current = queue.current.then(async () => {
      // Superseded while it waited: the newer tap is the one that counts.
      if (ticket !== latest.current) return;
      // Tapped back to what the server already has: nothing to write.
      if (confirmed.current?.status === status) {
        setShelf(confirmed.current);
        setSaving(false);
        return;
      }
      const entry = await shelve(doc, status);
      if (ticket !== latest.current) {
        // Another tap is queued behind this one; it will settle the view.
        if (entry)
          confirmed.current = {
            favoriteRank: entry.favoriteRank,
            status: entry.status,
          };
        return;
      }
      if (entry) apply(entry);
      else setShelf(confirmed.current);
      setSaving(false);
    });
  };

  const setStatus = (status: BookStatus) => {
    if (busy || shelf?.status === status) return;
    if (isFavorite && !isFavoritable(status)) {
      Alert.alert(
        "Move to Want to read?",
        "Only books you've read or are reading can be favorites, so it leaves your favorites.",
        [
          { style: "cancel", text: "Cancel" },
          { onPress: () => moveTo(status), text: "Move" },
        ],
      );
      return;
    }
    moveTo(status);
  };

  const toggleFavorite = () =>
    run("favorite", async () => {
      if (!shelf) return;
      const result = isFavorite
        ? await unfavorite(doc.key)
        : await favorite(doc.key);
      if (result) apply(result);
    });

  const remove = () =>
    run("remove", async () => {
      if (await unshelve(doc.key)) {
        apply(null);
        onRemoved();
      }
    });

  const confirmRemove = () => {
    if (!isFavorite) {
      void remove();
      return;
    }
    Alert.alert(
      "Remove this favorite?",
      "It leaves your shelf and your favorites.",
      [
        { style: "cancel", text: "Cancel" },
        { onPress: () => void remove(), style: "destructive", text: "Remove" },
      ],
    );
  };

  // ── The sliding highlight ────────────────────────────────────────────────
  const [trackWidth, setTrackWidth] = useState(0);
  const optionWidth =
    trackWidth > 0 ? (trackWidth - TRACK_PAD * 2) / STATUSES.length : 0;
  const activeIndex = shelf ? STATUSES.indexOf(shelf.status) : -1;
  const slide = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(activeIndex < 0 ? 0 : 1)).current;
  /** Where the thumb sat last; the first placement and a reveal do not slide. */
  const placed = useRef<number | null>(null);

  useEffect(() => {
    if (optionWidth === 0) return;
    if (activeIndex < 0) {
      Animated.timing(reveal, {
        duration: 150,
        toValue: 0,
        useNativeDriver: true,
      }).start();
      placed.current = null;
      return;
    }
    const x = activeIndex * optionWidth;
    if (placed.current === null || reduceMotion) {
      // Appears where it lands rather than sliding in from the left.
      slide.setValue(x);
      Animated.timing(reveal, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slide, {
        duration: SLIDE_MS,
        easing: Easing.bezier(0.3, 0.7, 0.2, 1),
        toValue: x,
        useNativeDriver: true,
      }).start();
    }
    placed.current = activeIndex;
  }, [activeIndex, optionWidth, reduceMotion, reveal, slide]);

  const onTrackLayout = (event: LayoutChangeEvent) =>
    setTrackWidth(event.nativeEvent.layout.width);

  return (
    <View
      accessibilityLabel="Your bookshelf"
      accessible={false}
      style={styles.shelf}
    >
      <View
        onLayout={onTrackLayout}
        style={[
          styles.track,
          {
            backgroundColor: theme.material.fillPressed,
            borderColor: theme.material.edge,
          },
        ]}
      >
        {optionWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                backgroundColor: theme.accent.fill,
                borderColor: theme.accent.text,
                opacity: reveal,
                transform: [{ translateX: slide }],
                width: optionWidth,
              },
            ]}
          />
        ) : null}
        {STATUSES.map((status) => {
          const active = shelf?.status === status;
          return (
            <Pressable
              accessibilityLabel={BOOK_STATUS_LABEL[status]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              disabled={busy !== null}
              key={status}
              onPress={() => setStatus(status)}
              style={({ pressed }) => [
                styles.option,
                pressed && !active && styles.pressed,
              ]}
            >
              <Ionicons
                color={active ? theme.accent.onFill : theme.accent.text}
                name={STATUS_ICON[status]}
                size={16}
              />
              <Text
                numberOfLines={2}
                style={[
                  styles.optionLabel,
                  { color: active ? theme.accent.onFill : theme.textGray },
                ]}
              >
                {BOOK_STATUS_LABEL[status]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {shelf ? (
        <View style={styles.shelfRow}>
          {isFavoritable(shelf.status) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: busy === "favorite",
                disabled: busy !== null || saving,
                selected: isFavorite,
              }}
              disabled={busy !== null || saving}
              hitSlop={space.xs}
              onPress={() => void toggleFavorite()}
              style={({ pressed }) => [
                styles.heart,
                {
                  backgroundColor: isFavorite
                    ? theme.accent.tint
                    : theme.material.fill,
                  borderColor: isFavorite
                    ? theme.accent.surfaceHover
                    : theme.material.edge,
                },
                pressed && styles.pressed,
              ]}
            >
              {busy === "favorite" ? (
                <ActivityIndicator color={theme.accent.text} size="small" />
              ) : (
                <Ionicons
                  color={theme.accent.text}
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={14}
                />
              )}
              <Text
                numberOfLines={1}
                style={[styles.heartLabel, { color: theme.accent.text }]}
              >
                {isFavorite ? "Favorite" : "Add to favorites"}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="Remove from your bookshelf"
            accessibilityRole="button"
            accessibilityState={{
              busy: busy === "remove",
              disabled: busy !== null || saving,
            }}
            disabled={busy !== null || saving}
            hitSlop={space.xs}
            onPress={confirmRemove}
            style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
          >
            {busy === "remove" ? (
              <ActivityIndicator color={theme.textGray} size="small" />
            ) : (
              <Ionicons color={theme.textGray} name="trash-outline" size={14} />
            )}
            <Text style={[styles.removeLabel, { color: theme.textGray }]}>
              Remove
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

/** Long prose clamped to a few lines, with a toggle when it needs one. */
const Prose = ({ lines, text }: { lines: number; text: string }) => {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);
  // Rough: anything under ~60 characters a line can't need the toggle.
  const long = text.length > lines * 60 || text.split("\n").length > lines;
  return (
    <View style={styles.prose}>
      <Text
        numberOfLines={open || !long ? undefined : lines}
        style={[styles.proseText, { color: theme.text }]}
      >
        {text}
      </Text>
      {long ? (
        <Text
          accessibilityRole="button"
          onPress={() => setOpen((value) => !value)}
          style={[styles.link, { color: theme.accent.text }]}
        >
          {open ? "Show less" : "Read more"}
        </Text>
      ) : null}
    </View>
  );
};

const Section = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textGray }]}>
        {title}
      </Text>
      {children}
    </View>
  );
};

const Chips = ({
  items,
  title,
}: {
  items?: string[] | null;
  title: string;
}) => {
  const theme = useAppTheme();
  if (!items?.length) return null;
  const labels = items.slice(0, CHIP_LIMIT);
  if (items.length > CHIP_LIMIT) labels.push(`+${items.length - CHIP_LIMIT}`);
  return (
    <Section title={title}>
      <View style={styles.chips}>
        {labels.map((item) => (
          <View
            key={item}
            style={[
              styles.chip,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.chipLabel, { color: theme.text }]}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
};

const styles = StyleSheet.create({
  authorName: { fontSize: fontSize.body, fontWeight: "600" },
  authorPhoto: { borderRadius: radius.full, height: 44, width: 44 },
  authorRow: { alignItems: "center", flexDirection: "row", gap: space.m },
  authors: { fontSize: fontSize.label, fontWeight: "700", lineHeight: 18 },
  authorText: { flex: 1 },
  body: { gap: space.md, paddingBottom: space.xl, paddingHorizontal: space.md },
  chip: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    maxWidth: "100%",
    paddingHorizontal: space.ms,
    paddingVertical: space.xs,
  },
  chipLabel: { fontSize: fontSize.caption },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  facts: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.s,
  },
  footer: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: space.xs,
    paddingVertical: space.xs,
  },
  footerLabel: { fontSize: fontSize.meta },
  heart: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    flexShrink: 1,
    gap: space.xs,
    minHeight: 30,
    paddingHorizontal: space.ms,
  },
  heartLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  link: { fontSize: fontSize.label, fontWeight: "600" },
  loading: { gap: space.sm },
  meta: { fontSize: fontSize.caption, lineHeight: 17 },
  more: { borderTopWidth: border.edge, gap: space.md, paddingTop: space.m },
  moreLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  moreToggle: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    minHeight: 32,
    paddingHorizontal: space.m,
  },
  option: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 2,
    paddingVertical: space.s,
  },
  optionLabel: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    lineHeight: 13,
    textAlign: "center",
  },
  pressed: { opacity: 0.7 },
  prose: { gap: space.xs },
  proseText: { fontSize: fontSize.body, lineHeight: 21 },
  quote: { fontSize: fontSize.body, fontStyle: "italic", lineHeight: 21 },
  rating: { alignItems: "center", flexDirection: "row", gap: 3 },
  ratingValue: { fontSize: fontSize.caption, fontWeight: "700" },
  remove: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    marginLeft: "auto",
    minHeight: 30,
  },
  removeLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  section: { gap: space.s },
  sectionTitle: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  /** Under the author and facts, beside the cover. */
  shelf: { gap: space.s, marginTop: space.xs },
  shelfRow: { alignItems: "center", flexDirection: "row", gap: space.s },
  subtitle: { fontSize: fontSize.caption, fontStyle: "italic" },
  summary: { flex: 1, gap: space.xs, minWidth: 0 },
  thumb: {
    borderRadius: radius.field - TRACK_PAD,
    borderWidth: 1,
    bottom: TRACK_PAD,
    left: TRACK_PAD,
    position: "absolute",
    top: TRACK_PAD,
  },
  top: { flexDirection: "row", gap: space.m },
  track: {
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    padding: TRACK_PAD,
  },
});
