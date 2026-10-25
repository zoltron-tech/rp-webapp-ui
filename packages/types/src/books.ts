import type { PrivacyLevel } from "./prompt";

/** Where a book sits on a novelist's shelf (BOOKSHELF_PLAN.md §1.5). */
export type BookStatus = "READ" | "READING" | "WANT_TO_READ";

/** A snapshotted Open Library work, as the shelf shows it. */
export type Book = {
  olKey: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  coverId: number | null;
  firstYear: number | null;
  subjects: string[];
  pagesMedian: number | null;
  spineHex: string | null;
};

export type ShelfEntry = Book & {
  /** Stable row id — what a chat reply to a "currently reading" entry references. */
  id: string;
  status: BookStatus;
  /** Null = not a favorite. Dense 1-based rank. */
  favoriteRank: number | null;
  shelvedAt: string | null;
  /** Signed-in non-owner viewers only: the viewer's own status for this book. */
  viewerStatus?: BookStatus | null;
};

export type ShelfCounts = {
  read: number;
  reading: number;
  wantToRead: number;
};

export type ShelfSummary = {
  total: number;
  counts: ShelfCounts;
  favorites: ShelfEntry[];
  reading: ShelfEntry[];
  recent: ShelfEntry[];
  /** Owner only. */
  privacy?: PrivacyLevel;
  /** False = hidden from the profile by its owner; the teaser renders nothing. */
  showOnProfile?: boolean;
};

export type ShelfPage = {
  items: ShelfEntry[];
  total: number;
  page: number;
  size: number;
};

export type ShelfSort = "shelved" | "title" | "author" | "year";

/**
 * The trimmed Open Library search document the picker shows and sends back
 * as `snapshot` on first shelve. camelCase mirror of Open Library's fields.
 */
export type OpenLibraryBook = {
  key: string;
  title: string;
  subtitle?: string | null;
  authorName?: string[] | null;
  authorKey?: string[] | null;
  firstPublishYear?: number | null;
  coverI?: number | null;
  subject?: string[] | null;
  editionCount?: number | null;
  ratingsAverage?: number | null;
  ratingsCount?: number | null;
  wantToReadCount?: number | null;
  currentlyReadingCount?: number | null;
  alreadyReadCount?: number | null;
  numberOfPagesMedian?: number | null;
  publisher?: string[] | null;
  language?: string[] | null;
  person?: string[] | null;
  place?: string[] | null;
  time?: string[] | null;
  ebookAccess?: "no_ebook" | "printdisabled" | "borrowable" | "public" | null;
};

export type ShelvedMarker = {
  status: BookStatus;
  favoriteRank: number | null;
};

export type OpenLibrarySearchResult = {
  numFound: number;
  docs: OpenLibraryBook[];
  /** The caller's shelf status for any doc already shelved, keyed by `key`. */
  shelved: Record<string, ShelvedMarker>;
};

export type SuggestedRow = {
  label: string;
  docs: OpenLibraryBook[];
};

export type BookLink = { title: string; url: string };

export type BookAuthor = {
  name: string | null;
  bio: string | null;
  birthDate: string | null;
  deathDate: string | null;
  photoId: number | null;
};

/** Long-form detail fetched live on dialog open (never snapshotted). */
export type BookDetails = {
  description: string | null;
  firstSentence: string | null;
  firstPublishDate: string | null;
  subjects: string[];
  people: string[];
  places: string[];
  times: string[];
  links: BookLink[];
  author: BookAuthor | null;
};

export type ShelveRequest = {
  status: BookStatus;
  snapshot?: OpenLibraryBook;
  spineHex?: string | null;
};

/** The three profile-level knobs (BOOKSHELF_PLAN.md §1.4). */
export type ProfilePrivacyLevel = Extract<
  PrivacyLevel,
  "PUBLIC" | "FRIENDS" | "ONLY_ME"
>;

export type ProfilePrivacy = {
  shelf: ProfilePrivacyLevel;
  about: ProfilePrivacyLevel;
  muses: ProfilePrivacyLevel;
  /** Show the bookshelf section on the profile at all. Independent of `shelf`. */
  shelfOnProfile: boolean;
};

/** Error reasons the shelf endpoints answer with (BaseResponseModel.message). */
export const SHELF_ERROR = {
  FavoritesFull: "FAVORITES_FULL",
  InvalidOrder: "INVALID_ORDER",
  NotFavoritable: "NOT_FAVORITABLE",
  NotOnShelf: "NOT_ON_SHELF",
  ShelfFull: "SHELF_FULL",
  SnapshotRequired: "SNAPSHOT_REQUIRED",
  UpstreamUnavailable: "UPSTREAM_UNAVAILABLE",
} as const;

export const FAVORITES_CAP = 20;
export const SHELF_CAP = 1000;

/** A book may only be a favorite once it has been opened. */
export const isFavoritable = (status: BookStatus) => status !== "WANT_TO_READ";

/**
 * Cover by cover id — the id route has no rate limit (ISBN lookups do).
 * `default=false` makes a missing cover a 404 instead of a blank 1×1 image,
 * so an `onError` fallback actually fires.
 */
export const bookCoverUrl = (coverId: number, size: "S" | "M" | "L" = "M") =>
  `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`;

export const authorPhotoUrl = (photoId: number) =>
  `https://covers.openlibrary.org/a/id/${photoId}-M.jpg`;

/** `/works/OL27482W` → `OL27482W`, the form that travels in our API paths. */
export const olKeyId = (olKey: string) => olKey.replace(/^\/?works\//, "");

/** The snapshot shape a shelf entry needs, from a search document. */
export const toShelfSnapshot = (doc: OpenLibraryBook): OpenLibraryBook => ({
  authorKey: doc.authorKey,
  authorName: doc.authorName,
  coverI: doc.coverI,
  firstPublishYear: doc.firstPublishYear,
  key: doc.key,
  numberOfPagesMedian: doc.numberOfPagesMedian,
  subject: doc.subject,
  subtitle: doc.subtitle,
  title: doc.title,
});

/** A shelf entry viewed as a search document, so one dialog serves both. */
export const shelfEntryToDoc = (entry: Book): OpenLibraryBook => ({
  authorName: entry.authors,
  coverI: entry.coverId,
  firstPublishYear: entry.firstYear,
  key: entry.olKey,
  numberOfPagesMedian: entry.pagesMedian,
  subject: entry.subjects,
  subtitle: entry.subtitle,
  title: entry.title,
});
