import type {
  BookDetails,
  BookStatus,
  OpenLibrarySearchResult,
  ProfilePrivacy,
  ShelfEntry,
  ShelfPage,
  ShelfSort,
  ShelfSummary,
  ShelveRequest,
  SuggestedRow,
} from "@nw/types/books";
import { olKeyId } from "@nw/types/books";
import type { DataType } from "@nw/types/common";
import type { ApiClient } from "../client";

const BOOKS = "/rp/portfolio/books";
const PRIVACY = "/rp/portfolio/novelist/privacy";

export type BookSearchMode = "all" | "title" | "author" | "subject";

// ── Picker (signed in) ─────────────────────────────────────────────────────

export const searchBooks = (
  api: ApiClient,
  query: string,
  mode: BookSearchMode,
  page: number,
  limit: number,
): Promise<DataType<OpenLibrarySearchResult>> => {
  const params = new URLSearchParams({
    limit: String(limit),
    mode,
    page: String(page),
    q: query,
  });
  return api.request<OpenLibrarySearchResult>(`${BOOKS}/search?${params}`, {
    catchErrors: true,
    label: "searchBooksAction",
    withReason: true,
  });
};

export const getSuggestedBooks = (
  api: ApiClient,
): Promise<DataType<SuggestedRow[]>> =>
  api.request<SuggestedRow[]>(`${BOOKS}/suggested`, {
    catchErrors: true,
    label: "getSuggestedBooksAction",
  });

export const getBookDetails = (
  api: ApiClient,
  olKey: string,
): Promise<DataType<BookDetails>> =>
  api.request<BookDetails>(`${BOOKS}/${olKeyId(olKey)}/details`, {
    catchErrors: true,
    label: "getBookDetailsAction",
    withReason: true,
  });

// ── Shelf reads (public under the owner's privacy) ─────────────────────────

/** Null when the shelf is hidden from the viewer (404), an error otherwise. */
export const getShelf = (
  api: ApiClient,
  novelistId: string,
  status: BookStatus | "ALL",
  sort: ShelfSort,
  page: number,
  size: number,
): Promise<DataType<ShelfPage>> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });
  // No status = the whole shelf.
  if (status !== "ALL") params.set("status", status);
  return api.requestNullable<ShelfPage>(
    `${BOOKS}/shelf/${novelistId}?${params}`,
    {
      catchErrors: true,
      label: "getShelfAction",
      notFound: "null",
    },
  );
};

export const getShelfSummary = (
  api: ApiClient,
  novelistId: string,
): Promise<DataType<ShelfSummary>> =>
  api.requestNullable<ShelfSummary>(`${BOOKS}/shelf/${novelistId}/summary`, {
    catchErrors: true,
    label: "getShelfSummaryAction",
    notFound: "null",
  });

// ── Shelf writes (always the caller's own shelf) ───────────────────────────

export const shelveBook = (
  api: ApiClient,
  olKey: string,
  request: ShelveRequest,
): Promise<DataType<ShelfEntry>> =>
  api.request<ShelfEntry>(`${BOOKS}/shelf/${olKeyId(olKey)}`, {
    body: request,
    catchErrors: true,
    label: "shelveBookAction",
    method: "PUT",
    withReason: true,
  });

export const unshelveBook = (
  api: ApiClient,
  olKey: string,
): Promise<DataType<{ message: string }>> =>
  api.request<{ message: string }>(`${BOOKS}/shelf/${olKeyId(olKey)}`, {
    catchErrors: true,
    label: "unshelveBookAction",
    method: "DELETE",
  });

/** Removes many at once; answers how many were actually on the shelf. */
export const unshelveBooks = (
  api: ApiClient,
  olKeys: string[],
): Promise<DataType<{ removed: number }>> =>
  api.request<{ removed: number }>(`${BOOKS}/shelf/remove`, {
    body: { olKeys },
    catchErrors: true,
    label: "unshelveBooksAction",
    method: "POST",
  });

export const favoriteBook = (
  api: ApiClient,
  olKey: string,
): Promise<DataType<ShelfEntry>> =>
  api.request<ShelfEntry>(`${BOOKS}/shelf/${olKeyId(olKey)}/favorite`, {
    catchErrors: true,
    label: "favoriteBookAction",
    method: "PUT",
    withReason: true,
  });

export const unfavoriteBook = (
  api: ApiClient,
  olKey: string,
): Promise<DataType<ShelfEntry>> =>
  api.requestNullable<ShelfEntry>(`${BOOKS}/shelf/${olKeyId(olKey)}/favorite`, {
    catchErrors: true,
    label: "unfavoriteBookAction",
    method: "DELETE",
    notFound: "null",
  });

export const reorderFavorites = (
  api: ApiClient,
  olKeys: string[],
): Promise<DataType<ShelfEntry[]>> =>
  api.request<ShelfEntry[]>(`${BOOKS}/shelf/favorites/order`, {
    body: { olKeys },
    catchErrors: true,
    label: "reorderFavoritesAction",
    method: "PUT",
    withReason: true,
  });

// ── Profile privacy ────────────────────────────────────────────────────────

export const getProfilePrivacy = (
  api: ApiClient,
): Promise<DataType<ProfilePrivacy>> =>
  api.request<ProfilePrivacy>(PRIVACY, {
    catchErrors: true,
    label: "getProfilePrivacyAction",
  });

export const setProfilePrivacy = (
  api: ApiClient,
  privacy: ProfilePrivacy,
): Promise<DataType<ProfilePrivacy>> =>
  api.request<ProfilePrivacy>(PRIVACY, {
    body: privacy,
    catchErrors: true,
    label: "setProfilePrivacyAction",
    method: "PUT",
  });
