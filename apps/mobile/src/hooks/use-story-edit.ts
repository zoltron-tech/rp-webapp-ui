import {
  deleteStoryBoard,
  getAllStoryboardsByUsername,
  updateStoryBoard,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi, useSession } from "@nw/features";
import { API_MESSAGE, type StoryBoard, type StoryBoardMember } from "@nw/types";
import {
  type InfiniteData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * A storyboard, written — web's `updateStoryBoardAction` and
 * `deleteStoryBoardAction`, and the list page they feed.
 *
 * ## Where a story is drawn from
 *
 * Four places, and a save has to reach all of them or the reader sees two
 * versions of one story: the story page (`queryKeys.story`), a novelist's
 * shelf (`novelistStories`), the library's pages and the home rail's. Web
 * gets away with refetching because every page is a fresh load; here the
 * shelf the reader came from is still mounted under the editor, so the saved
 * story is written straight into every entry that holds it, and a deleted
 * one is taken out of them.
 *
 * Other novelists' shelves — a co-author's — are only invalidated: they are
 * not on screen, and the next open refetches.
 */

const STALE = 60 * 1000;

/** Every storyboard a novelist created or co-writes — web's stories page. */
export const useNovelistStories = (username: string | undefined) => {
  const api = useApi();
  return useQuery({
    enabled: Boolean(username),
    queryFn: async (): Promise<StoryBoard[]> => {
      const result = await getAllStoryboardsByUsername(api, username ?? "");
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.novelistStories(username ?? ""),
    staleTime: STALE,
  });
};

export type StorySaveResult =
  | { story: StoryBoard }
  | { message: string; reason?: string };

export const useStoryWrite = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { novelist } = useSession();
  const me = novelist?.username;

  /** The saved story, written into every cache entry that holds it. */
  const patch = useCallback(
    (saved: StoryBoard) => {
      const id = saved.id;
      if (!id) return;
      queryClient.setQueryData<StoryBoard | null>(
        queryKeys.story(id),
        (current) => ({ ...(current ?? {}), ...saved }),
      );
      if (me) {
        queryClient.setQueryData<StoryBoard[]>(
          queryKeys.novelistStories(me),
          (list) =>
            list === undefined
              ? list
              : list.some((story) => story.id === id)
                ? list.map((story) => (story.id === id ? saved : story))
                : [saved, ...list],
        );
      }
      for (const key of [queryKeys.library(), queryKeys.homeStories()]) {
        queryClient.setQueryData<InfiniteData<StoryBoard[]>>(key, (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) =>
                  page.map((story) => (story.id === id ? saved : story)),
                ),
              }
            : data,
        );
      }
      // Co-authors' shelves, when they are next opened.
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "profile" &&
          query.queryKey[2] === "stories" &&
          query.queryKey[1] !== me,
      });
    },
    [me, queryClient],
  );

  const saveStory = useCallback(
    async (payload: StoryBoard): Promise<StorySaveResult> => {
      const response = await updateStoryBoard(api, payload).catch(
        () => ({ message: API_MESSAGE.Error }) as const,
      );
      if ("message" in response) {
        return {
          message: String(response.message),
          reason:
            "reason" in response && typeof response.reason === "string"
              ? response.reason
              : undefined,
        };
      }
      patch(response);
      return { story: response };
    },
    [api, patch],
  );

  /** The members list changed in the members sheet, kept in step everywhere. */
  const setMembers = useCallback(
    (storyId: string, members: StoryBoardMember[]) => {
      const current = queryClient.getQueryData<StoryBoard | null>(
        queryKeys.story(storyId),
      );
      const fromList = me
        ? queryClient
            .getQueryData<StoryBoard[]>(queryKeys.novelistStories(me))
            ?.find((story) => story.id === storyId)
        : undefined;
      const base = current ?? fromList;
      if (base) patch({ ...base, members });
    },
    [me, patch, queryClient],
  );

  const deleteStory = useCallback(
    async (storyId: string): Promise<boolean> => {
      const result = await deleteStoryBoard(api, storyId).catch(
        () => ({ message: API_MESSAGE.Error }) as const,
      );
      if (result.message !== API_MESSAGE.Success) return false;

      queryClient.removeQueries({ queryKey: queryKeys.story(storyId) });
      if (me) {
        queryClient.setQueryData<StoryBoard[]>(
          queryKeys.novelistStories(me),
          (list) => list?.filter((story) => story.id !== storyId),
        );
      }
      for (const key of [queryKeys.library(), queryKeys.homeStories()]) {
        queryClient.setQueryData<InfiniteData<StoryBoard[]>>(key, (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) =>
                  page.filter((story) => story.id !== storyId),
                ),
              }
            : data,
        );
      }
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "profile" &&
          query.queryKey[2] === "stories" &&
          query.queryKey[1] !== me,
      });
      return true;
    },
    [api, me, queryClient],
  );

  return { deleteStory, saveStory, setMembers };
};
