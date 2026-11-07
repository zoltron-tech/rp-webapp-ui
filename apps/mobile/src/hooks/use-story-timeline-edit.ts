import {
  deleteStoryTimelineLane,
  deleteStoryTimelineMarker,
  reorderStoryTimelineLanes,
  saveStoryboardEventTimeline,
  saveStoryTimelineLane,
  saveStoryTimelineMarker,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi } from "@nw/features";
import {
  API_MESSAGE,
  type StoryBoardEvent,
  type StoryTimeline,
  type StoryTimelineLane,
  type StoryTimelineMarker,
} from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

/** Where a chapter sits. Null takes it off the timeline. */
export interface ChapterPlacement {
  end: number;
  isFlashback: boolean;
  laneId: string | null;
  start: number;
}

const upsert = <T extends { id: string | null }>(list: T[], saved: T): T[] =>
  list.some((item) => item.id === saved.id)
    ? list.map((item) => (item.id === saved.id ? saved : item))
    : [...list, saved];

/**
 * Writing a story's timelines. The same contract as `use-story-codex-edit.ts`.
 *
 * A placement takes the server's answer rather than the values sent, because
 * it clamps and normalises them. Deleting a timeline refetches: the server
 * moves that timeline's chapters off it, which is not in the answer.
 */
export const useStoryTimelineEdit = (storyId: string | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(0);
  const id = storyId ?? "";
  const key = queryKeys.storyTimeline(id);

  const patch = useCallback(
    (update: (timeline: StoryTimeline) => StoryTimeline) => {
      queryClient.setQueryData<StoryTimeline | null>(key, (current) =>
        current ? update(current) : current,
      );
    },
    [key, queryClient],
  );

  const track = useCallback(async <T>(work: () => Promise<T>): Promise<T> => {
    setPending((count) => count + 1);
    try {
      return await work();
    } finally {
      setPending((count) => count - 1);
    }
  }, []);

  const saveLane = useCallback(
    (lane: StoryTimelineLane): Promise<boolean> =>
      track(async () => {
        const result = await saveStoryTimelineLane(api, id, lane).catch(
          () => null,
        );
        if (!result || "message" in result) return false;
        const saved = result as StoryTimelineLane;
        patch((timeline) => ({
          ...timeline,
          lanes: upsert(timeline.lanes, saved),
        }));
        return true;
      }),
    [api, id, patch, track],
  );

  const deleteLane = useCallback(
    (laneId: string): Promise<boolean> =>
      track(async () => {
        const result = await deleteStoryTimelineLane(api, laneId).catch(
          () => null,
        );
        await queryClient.invalidateQueries({ queryKey: key });
        return result?.message === API_MESSAGE.Success;
      }),
    [api, key, queryClient, track],
  );

  const reorderLanes = useCallback(
    (orderedIds: string[]): Promise<boolean> =>
      track(async () => {
        const result = await reorderStoryTimelineLanes(
          api,
          id,
          orderedIds,
        ).catch(() => null);
        if (!Array.isArray(result)) return false;
        patch((timeline) => ({ ...timeline, lanes: result }));
        return true;
      }),
    [api, id, patch, track],
  );

  const saveMarker = useCallback(
    (marker: StoryTimelineMarker): Promise<boolean> =>
      track(async () => {
        const result = await saveStoryTimelineMarker(api, id, marker).catch(
          () => null,
        );
        if (!result || "message" in result) return false;
        const saved = result as StoryTimelineMarker;
        patch((timeline) => ({
          ...timeline,
          markers: upsert(timeline.markers, saved),
        }));
        return true;
      }),
    [api, id, patch, track],
  );

  const deleteMarker = useCallback(
    (markerId: string): Promise<boolean> =>
      track(async () => {
        patch((timeline) => ({
          ...timeline,
          markers: timeline.markers.filter((item) => item.id !== markerId),
        }));
        const result = await deleteStoryTimelineMarker(api, markerId).catch(
          () => null,
        );
        if (result?.message === API_MESSAGE.Success) return true;
        void queryClient.invalidateQueries({ queryKey: key });
        return false;
      }),
    [api, key, patch, queryClient, track],
  );

  const placeChapter = useCallback(
    (eventId: string, placement: ChapterPlacement | null): Promise<boolean> =>
      track(async () => {
        const result = await saveStoryboardEventTimeline(api, eventId, {
          isFlashback: placement?.isFlashback ?? false,
          laneId: placement?.laneId ?? null,
          timelineEnd: placement?.end ?? null,
          timelineStart: placement?.start ?? null,
        }).catch(() => null);
        if (!result || "message" in result) return false;
        const saved = result as StoryBoardEvent;
        patch((timeline) => ({
          ...timeline,
          events: timeline.events.map((event) =>
            event.id === saved.id ? { ...event, ...saved } : event,
          ),
        }));
        return true;
      }),
    [api, patch, track],
  );

  return useMemo(
    () => ({
      deleteLane,
      deleteMarker,
      pending: pending > 0,
      placeChapter,
      reorderLanes,
      saveLane,
      saveMarker,
    }),
    [
      deleteLane,
      deleteMarker,
      pending,
      placeChapter,
      reorderLanes,
      saveLane,
      saveMarker,
    ],
  );
};

export type StoryTimelineEdit = ReturnType<typeof useStoryTimelineEdit>;
