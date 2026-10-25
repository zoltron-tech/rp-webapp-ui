import {
  type BookSearchMode,
  favoriteBook,
  getBookDetails,
  getProfilePrivacy,
  getShelf,
  getShelfSummary,
  getSuggestedBooks,
  reorderFavorites,
  searchBooks,
  setProfilePrivacy,
  shelveBook,
  unfavoriteBook,
  unshelveBook,
  unshelveBooks,
} from "@nw/api/endpoints/books";
import type {
  BookStatus,
  ProfilePrivacy,
  ShelfSort,
  ShelveRequest,
} from "@nw/types/books";
import { api, authedApi } from "@/lib/api";

// Picker — needs a signed-in novelist (the proxy carries our Open Library
// contact and cache; see BOOKSHELF_PLAN.md §1.2).
export const searchBooksAction = (
  query: string,
  mode: BookSearchMode,
  page: number,
  limit: number,
) => searchBooks(authedApi, query, mode, page, limit);

export const getSuggestedBooksAction = () => getSuggestedBooks(authedApi);

export const getBookDetailsAction = (olKey: string) =>
  getBookDetails(authedApi, olKey);

// Shelf reads are public under the owner's privacy, so they go out with
// whatever credential the viewer has (none for a signed-out visitor).
export const getShelfAction = (
  novelistId: string,
  status: BookStatus | "ALL",
  sort: ShelfSort,
  page: number,
  size: number,
) => getShelf(api, novelistId, status, sort, page, size);

export const getShelfSummaryAction = (novelistId: string) =>
  getShelfSummary(api, novelistId);

// Writes — always the caller's own shelf.
export const shelveBookAction = (olKey: string, request: ShelveRequest) =>
  shelveBook(authedApi, olKey, request);

export const unshelveBookAction = (olKey: string) =>
  unshelveBook(authedApi, olKey);

export const unshelveBooksAction = (olKeys: string[]) =>
  unshelveBooks(authedApi, olKeys);

export const favoriteBookAction = (olKey: string) =>
  favoriteBook(authedApi, olKey);

export const unfavoriteBookAction = (olKey: string) =>
  unfavoriteBook(authedApi, olKey);

export const reorderFavoritesAction = (olKeys: string[]) =>
  reorderFavorites(authedApi, olKeys);

export const getProfilePrivacyAction = () => getProfilePrivacy(authedApi);

export const setProfilePrivacyAction = (privacy: ProfilePrivacy) =>
  setProfilePrivacy(authedApi, privacy);
