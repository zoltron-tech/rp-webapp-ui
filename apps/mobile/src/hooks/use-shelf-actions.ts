import {
  favoriteBook,
  reorderFavorites,
  shelveBook,
  unfavoriteBook,
  unshelveBook,
  unshelveBooks,
} from "@nw/api/endpoints/books";
import { useApi } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import {
  type BookStatus,
  type OpenLibraryBook,
  SHELF_REASON_COPY,
  type ShelfEntry,
  toShelfSnapshot,
} from "@nw/types/books";
import type { ErrorType } from "@nw/types/common";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { SHELF_ROOT } from "@/hooks/use-shelf";

/** What the signed-in novelist's shelf knows about a book: nothing, or its row. */
export type ViewerShelfState = Pick<
  ShelfEntry,
  "status" | "favoriteRank"
> | null;

const failed = <T>(
  result: T | ErrorType | null | undefined,
): result is ErrorType | null | undefined =>
  !result ||
  (typeof result === "object" &&
    "message" in result &&
    (result as ErrorType).message === API_MESSAGE.Error);

/**
 * The shelf writes, each on the signed-in novelist's own shelf whoever's card
 * the book came from (BOOKSHELF_PLAN.md §3.1). Web's `useShelfActions`, with an
 * alert where it has a toast.
 *
 * Every success refreshes every shelf in the cache. A write moves a book
 * between tabs, changes the counts and the teaser, and changes the "your
 * status" chip on anybody else's shelf you have open, so there is no one entry
 * to patch.
 *
 * `shelve` sends no spine colour: web samples it from the cover with a canvas,
 * which a phone does not have. Spines fall back to `spineColor`, and the
 * server keeps the first colour any web client sends for that book.
 */
export const useShelfActions = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: SHELF_ROOT }),
    [queryClient],
  );

  const explain = useCallback(
    (result: ErrorType | null | undefined, fallback: string) => {
      const copy = result?.reason ? SHELF_REASON_COPY[result.reason] : null;
      Alert.alert("Bookshelf", copy ?? fallback);
    },
    [],
  );

  /** Adds or moves a book. `doc` is what a first shelving snapshots. */
  const shelve = useCallback(
    async (
      doc: OpenLibraryBook,
      status: BookStatus,
    ): Promise<ShelfEntry | null> => {
      const result = await shelveBook(api, doc.key, {
        snapshot: toShelfSnapshot(doc),
        status,
      }).catch(() => null);
      if (failed(result)) {
        explain(result, "Couldn't update your bookshelf.");
        return null;
      }
      void refresh();
      return result;
    },
    [api, explain, refresh],
  );

  const unshelve = useCallback(
    async (olKey: string): Promise<boolean> => {
      const result = await unshelveBook(api, olKey).catch(() => null);
      if (failed(result)) {
        explain(result, "Couldn't remove the book.");
        return false;
      }
      void refresh();
      return true;
    },
    [api, explain, refresh],
  );

  /** Many at once. Answers how many left the shelf, or null on failure. */
  const unshelveMany = useCallback(
    async (olKeys: string[]): Promise<number | null> => {
      const result = await unshelveBooks(api, olKeys).catch(() => null);
      if (failed(result)) {
        explain(result, "Couldn't remove those books. Try again.");
        return null;
      }
      void refresh();
      return result.removed;
    },
    [api, explain, refresh],
  );

  const favorite = useCallback(
    async (olKey: string): Promise<ShelfEntry | null> => {
      const result = await favoriteBook(api, olKey).catch(() => null);
      if (failed(result)) {
        explain(result, "Couldn't add to favorites.");
        return null;
      }
      void refresh();
      return result;
    },
    [api, explain, refresh],
  );

  const unfavorite = useCallback(
    async (olKey: string): Promise<ShelfEntry | null> => {
      const result = await unfavoriteBook(api, olKey).catch(() => null);
      if (failed(result)) {
        explain(result, "Couldn't remove from favorites.");
        return null;
      }
      void refresh();
      return result;
    },
    [api, explain, refresh],
  );

  /** The whole favorites order. The caller draws it first and undoes on false. */
  const reorder = useCallback(
    async (olKeys: string[]): Promise<boolean> => {
      const result = await reorderFavorites(api, olKeys).catch(() => null);
      if (failed(result)) {
        explain(result, "Couldn't save the new order.");
        return false;
      }
      return true;
    },
    [api, explain],
  );

  return useMemo(
    () => ({ favorite, reorder, shelve, unfavorite, unshelve, unshelveMany }),
    [favorite, reorder, shelve, unfavorite, unshelve, unshelveMany],
  );
};
