import {
  deleteStoryMap,
  deleteStoryMapPin,
  saveStoryMap,
  saveStoryMapPin,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi } from "@nw/features";
import {
  API_MESSAGE,
  type StoryMap,
  type StoryMapPin,
  type StoryMaps,
} from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

/**
 * Writing a story's maps and their pins. The same contract as
 * `use-story-codex-edit.ts`: one cache entry patched in place, and every call
 * answers with what happened rather than throwing.
 *
 * A map's pins are its own list inside the payload, so a saved pin is laid into
 * the map it belongs to. A saved map keeps the pins already held: its answer may
 * not carry them.
 */
export const useStoryMapEdit = (storyId: string | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(0);
  const id = storyId ?? "";
  const key = queryKeys.storyMaps(id);

  const patch = useCallback(
    (update: (maps: StoryMap[]) => StoryMap[]) => {
      queryClient.setQueryData<StoryMaps | null>(key, (current) =>
        current ? { ...current, maps: update(current.maps) } : current,
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

  const saveMap = useCallback(
    (map: StoryMap): Promise<StoryMap | null> =>
      track(async () => {
        if (!id) return null;
        const result = await saveStoryMap(api, id, map).catch(() => null);
        if (!result || "message" in result) return null;
        const saved = result as StoryMap;
        patch((maps) =>
          maps.some((candidate) => candidate.id === saved.id)
            ? maps.map((candidate) =>
                candidate.id === saved.id
                  ? { ...saved, pins: saved.pins ?? candidate.pins }
                  : candidate,
              )
            : [...maps, { ...saved, pins: saved.pins ?? [] }],
        );
        return saved;
      }),
    [api, id, patch, track],
  );

  const deleteMap = useCallback(
    (mapId: string): Promise<boolean> =>
      track(async () => {
        patch((maps) => maps.filter((map) => map.id !== mapId));
        const result = await deleteStoryMap(api, mapId).catch(() => null);
        if (!result || result.message !== API_MESSAGE.Success) {
          void queryClient.invalidateQueries({ queryKey: key });
          return false;
        }
        return true;
      }),
    [api, key, patch, queryClient, track],
  );

  const savePin = useCallback(
    (mapId: string, pin: StoryMapPin): Promise<StoryMapPin | null> =>
      track(async () => {
        const result = await saveStoryMapPin(api, mapId, pin).catch(() => null);
        if (!result || "message" in result) return null;
        const saved = result as StoryMapPin;
        patch((maps) =>
          maps.map((map) =>
            map.id !== mapId
              ? map
              : {
                  ...map,
                  pins: map.pins.some((item) => item.id === saved.id)
                    ? map.pins.map((item) =>
                        item.id === saved.id ? saved : item,
                      )
                    : [...map.pins, saved],
                },
          ),
        );
        return saved;
      }),
    [api, patch, track],
  );

  const deletePin = useCallback(
    (pinId: string): Promise<boolean> =>
      track(async () => {
        patch((maps) =>
          maps.map((map) => ({
            ...map,
            pins: map.pins.filter((pin) => pin.id !== pinId),
          })),
        );
        const result = await deleteStoryMapPin(api, pinId).catch(() => null);
        if (!result || result.message !== API_MESSAGE.Success) {
          void queryClient.invalidateQueries({ queryKey: key });
          return false;
        }
        return true;
      }),
    [api, key, patch, queryClient, track],
  );

  return useMemo(
    () => ({
      deleteMap,
      deletePin,
      pending: pending > 0,
      saveMap,
      savePin,
    }),
    [deleteMap, deletePin, pending, saveMap, savePin],
  );
};

export type StoryMapEdit = ReturnType<typeof useStoryMapEdit>;
