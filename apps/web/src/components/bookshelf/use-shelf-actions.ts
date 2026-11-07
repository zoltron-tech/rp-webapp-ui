"use client";

import { API_MESSAGE } from "@nw/types";
import {
  BOOK_STATUS_LABEL,
  type BookStatus,
  type OpenLibraryBook,
  SHELF_REASON_COPY,
  type ShelfEntry,
  toShelfSnapshot,
} from "@nw/types/books";
import type { ErrorType } from "@nw/types/common";
import { useCallback } from "react";
import {
  favoriteBookAction,
  shelveBookAction,
  unfavoriteBookAction,
  unshelveBookAction,
} from "@/app/rp/books/actions";
import { useUIContext } from "@/hooks/use-ui-context";
import { extractSpineHex } from "./spine-color";

/** What the caller's shelf knows about one book: nothing, or its row. */
export type ViewerShelfState = Pick<
  ShelfEntry,
  "status" | "favoriteRank"
> | null;

export const failed = <T>(
  result: T | ErrorType | null | undefined,
): result is ErrorType | null | undefined =>
  !result ||
  (typeof result === "object" &&
    "message" in result &&
    (result as ErrorType).message === API_MESSAGE.Error);

export const STATUS_LABEL = BOOK_STATUS_LABEL;

/**
 * The four shelf writes, each returning the new row (or null once removed)
 * so the caller can patch its own list, with the plan's copy for the soft
 * caps. Every write is on the signed-in novelist's shelf — whose card it
 * came from is irrelevant (BOOKSHELF_PLAN.md §3.1).
 */
export function useShelfActions() {
  const { successToast, warningToast, errorToast } = useUIContext();

  const explain = useCallback(
    (result: ErrorType | null | undefined, fallback: string) => {
      const copy = result?.reason && SHELF_REASON_COPY[result.reason];
      if (copy) warningToast(copy);
      else errorToast(fallback);
    },
    [warningToast, errorToast],
  );

  /** Adds or moves a book. `doc` is needed the first time anyone shelves it. */
  const shelve = useCallback(
    async (
      doc: OpenLibraryBook,
      status: BookStatus,
      options: { quiet?: boolean } = {},
    ): Promise<ShelfEntry | null> => {
      const spineHex = doc.coverI ? await extractSpineHex(doc.coverI) : null;
      const result = await shelveBookAction(doc.key, {
        snapshot: toShelfSnapshot(doc),
        spineHex,
        status,
      });
      if (failed(result)) {
        explain(result, "Couldn't update your bookshelf.");
        return null;
      }
      if (!options.quiet) {
        successToast(
          status === "WANT_TO_READ"
            ? "Added to your bookshelf"
            : `Marked as ${STATUS_LABEL[status].toLowerCase()}`,
        );
      }
      return result;
    },
    [explain, successToast],
  );

  const unshelve = useCallback(
    async (olKey: string): Promise<boolean> => {
      const result = await unshelveBookAction(olKey);
      if (failed(result)) {
        explain(result, "Couldn't remove the book.");
        return false;
      }
      successToast("Removed from your bookshelf");
      return true;
    },
    [explain, successToast],
  );

  const favorite = useCallback(
    async (olKey: string): Promise<ShelfEntry | null> => {
      const result = await favoriteBookAction(olKey);
      if (failed(result)) {
        explain(result, "Couldn't add to favorites.");
        return null;
      }
      return result;
    },
    [explain],
  );

  const unfavorite = useCallback(
    async (olKey: string): Promise<ShelfEntry | null> => {
      const result = await unfavoriteBookAction(olKey);
      if (failed(result)) {
        explain(result, "Couldn't remove from favorites.");
        return null;
      }
      return result;
    },
    [explain],
  );

  return { favorite, shelve, unfavorite, unshelve };
}
