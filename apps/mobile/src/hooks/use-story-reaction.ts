import { queryKeys } from "@nw/features";
import type { StoryBoard } from "@nw/types";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useToggleReaction } from "@/hooks/use-toggle-reaction";

/**
 * The heart on a storyboard — web's `useToggleLike({ type: "story_board" })`.
 *
 * Web keeps every mounted card for the same story in step with a
 * `STORY_BOARD.REACTED` custom event. Here the story lives in two query cache
 * entries — the story page's own and the library's pages — so every value the
 * toggle settles on is written into both. A heart tapped on the story page is
 * already filled when the reader goes back to the shelf, and the other way
 * round, without a refetch.
 */
export const useStoryReaction = (
  story: Pick<StoryBoard, "id" | "reacted" | "reactions">,
) => {
  const queryClient = useQueryClient();
  const id = story.id ?? "";

  const onChange = useCallback(
    (next: { reacted: boolean; reactions: number }) => {
      if (!id) return;
      queryClient.setQueryData<StoryBoard | null>(
        queryKeys.story(id),
        (data) => (data ? { ...data, ...next } : data),
      );
      // Every paged list a story card is drawn from: the library shelf and
      // the home page's stories rail.
      for (const key of [queryKeys.library(), queryKeys.homeStories()]) {
        queryClient.setQueryData<InfiniteData<StoryBoard[]>>(key, (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) =>
                  page.map((candidate) =>
                    candidate.id === id ? { ...candidate, ...next } : candidate,
                  ),
                ),
              }
            : data,
        );
      }
    },
    [id, queryClient],
  );

  return useToggleReaction({
    id,
    onChange,
    reacted: Boolean(story.reacted),
    reactions: story.reactions ?? 0,
    type: "story_board",
  });
};
