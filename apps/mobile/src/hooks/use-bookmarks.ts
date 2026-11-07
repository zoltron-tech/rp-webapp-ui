import {
  deleteStoryboardEventBookmark,
  getBookmarkedEvents,
  getStoryboardEventBookmark,
  saveStoryboardEventBookmark,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi, useSession } from "@nw/features";
import { API_MESSAGE, type BookmarkedStoryBoardEvent } from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

/**
 * Where a reader stopped in a chapter. One bookmark per chapter, per reader:
 * the index of a passage in the chapter's reading order.
 *
 * Kept in the app rather than `@nw/features` for that package's stated rule:
 * web reaches these through server actions.
 */

/** Every bookmark you hold, most recently touched first. */
export const useBookmarks = () => {
  const api = useApi();
  const { status } = useSession();

  const query = useQuery({
    enabled: status === "signed-in",
    queryFn: async (): Promise<BookmarkedStoryBoardEvent[]> => {
      const result = await getBookmarkedEvents(api);
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.bookmarks(),
    staleTime: 5 * 60 * 1000,
  });

  const bookmarks = useMemo(
    () =>
      [...(query.data ?? [])].sort(
        (a, b) =>
          new Date(b.bookmark.modifiedAt ?? 0).getTime() -
          new Date(a.bookmark.modifiedAt ?? 0).getTime(),
      ),
    [query.data],
  );

  return { ...query, bookmarks };
};

/** Takes a bookmark off, from anywhere one is listed. */
export const useRemoveBookmark = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useCallback(
    async (eventId: string): Promise<boolean> => {
      const result = await deleteStoryboardEventBookmark(api, eventId).catch(
        () => null,
      );
      if (result?.message !== API_MESSAGE.Success) {
        Alert.alert(
          "Not removed",
          "Could not remove the bookmark. Please try again.",
        );
        return false;
      }
      queryClient.setQueryData(queryKeys.chapterBookmark(eventId), null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
      return true;
    },
    [api, queryClient],
  );
};

/** This chapter's bookmark: the saved passage, and the toggle a passage uses. */
export const useChapterBookmark = (eventId: string | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const signedIn = status === "signed-in";
  const remove = useRemoveBookmark();
  const [busy, setBusy] = useState(false);

  const query = useQuery({
    enabled: signedIn && Boolean(eventId),
    queryFn: () => getStoryboardEventBookmark(api, eventId ?? ""),
    queryKey: queryKeys.chapterBookmark(eventId ?? ""),
  });

  const saved = query.data?.threadIndex ?? null;

  /** Saves this passage, or clears it when it is already the saved one. */
  const toggle = useCallback(
    async (threadIndex: number) => {
      if (!eventId || busy) return;
      setBusy(true);
      if (saved === threadIndex) {
        await remove(eventId);
      } else {
        const result = await saveStoryboardEventBookmark(api, {
          storyBoardEventId: eventId,
          threadIndex,
        }).catch(() => null);
        if (result && "threadIndex" in result) {
          queryClient.setQueryData(queryKeys.chapterBookmark(eventId), result);
          void queryClient.invalidateQueries({
            queryKey: queryKeys.bookmarks(),
          });
        } else {
          Alert.alert(
            "Not saved",
            "Could not save the bookmark. Please try again.",
          );
        }
      }
      setBusy(false);
    },
    [api, busy, eventId, queryClient, remove, saved],
  );

  return { saved, signedIn, toggle };
};
