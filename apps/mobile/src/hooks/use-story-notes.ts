import {
  deleteStoryNote,
  getStoryNotes,
  reorderStoryNotes,
  retractStoryNotePollVote,
  saveStoryNote,
  setStoryNoteFlags,
  voteOnStoryNotePoll,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi } from "@nw/features";
import { API_MESSAGE, type StoryNote, type StoryNoteFlags } from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

/**
 * A story's sticky notes, which only its members read or write.
 *
 * The list is held in board order, which is what a reorder rewrites. Pin,
 * archive and closing a poll go through the flags route, so a toggle never
 * resends a note's text or its ballot. Voting again moves the vote a co-author
 * already has: the server keeps it to one.
 */
export const useStoryNotes = (
  storyId: string | undefined,
  enabled: boolean,
) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(0);
  const id = storyId ?? "";
  const key = queryKeys.storyNotes(id);

  const query = useQuery({
    enabled: enabled && Boolean(storyId),
    queryFn: async (): Promise<StoryNote[]> => {
      const result = await getStoryNotes(api, id);
      if (!result) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result.filter((note) => note.id);
    },
    queryKey: key,
  });

  const track = useCallback(async <T>(work: () => Promise<T>): Promise<T> => {
    setPending((count) => count + 1);
    try {
      return await work();
    } finally {
      setPending((count) => count - 1);
    }
  }, []);

  /** In place if it was on the board; a new one goes to its head. */
  const merge = useCallback(
    (result: unknown): StoryNote | null => {
      if (!result || typeof result !== "object" || "message" in result) {
        return null;
      }
      const saved = result as StoryNote;
      queryClient.setQueryData<StoryNote[]>(key, (notes = []) =>
        notes.some((note) => note.id === saved.id)
          ? notes.map((note) => (note.id === saved.id ? saved : note))
          : [saved, ...notes],
      );
      return saved;
    },
    [key, queryClient],
  );

  const save = useCallback(
    (note: StoryNote) =>
      track(async () =>
        merge(await saveStoryNote(api, id, note).catch(() => null)),
      ),
    [api, id, merge, track],
  );

  const setFlags = useCallback(
    (noteId: string, flags: StoryNoteFlags) =>
      track(async () =>
        merge(await setStoryNoteFlags(api, noteId, flags).catch(() => null)),
      ),
    [api, merge, track],
  );

  const vote = useCallback(
    (noteId: string, optionId: string) =>
      track(async () =>
        merge(
          await voteOnStoryNotePoll(api, noteId, optionId).catch(() => null),
        ),
      ),
    [api, merge, track],
  );

  const retractVote = useCallback(
    (noteId: string) =>
      track(async () =>
        merge(await retractStoryNotePollVote(api, noteId).catch(() => null)),
      ),
    [api, merge, track],
  );

  const remove = useCallback(
    (noteId: string): Promise<boolean> =>
      track(async () => {
        const result = await deleteStoryNote(api, noteId).catch(() => null);
        if (result?.message !== API_MESSAGE.Success) return false;
        queryClient.setQueryData<StoryNote[]>(key, (notes = []) =>
          notes.filter((note) => note.id !== noteId),
        );
        return true;
      }),
    [api, key, queryClient, track],
  );

  /** The board's complete order: the server takes nothing less. */
  const reorder = useCallback(
    (ordered: StoryNote[]): Promise<boolean> =>
      track(async () => {
        const previous = queryClient.getQueryData<StoryNote[]>(key);
        queryClient.setQueryData(key, ordered);
        const result = await reorderStoryNotes(
          api,
          id,
          ordered.flatMap((note) => (note.id ? [note.id] : [])),
        ).catch(() => null);
        if (!Array.isArray(result)) {
          queryClient.setQueryData(key, previous);
          return false;
        }
        queryClient.setQueryData(
          key,
          result.filter((note) => note.id),
        );
        return true;
      }),
    [api, id, key, queryClient, track],
  );

  return useMemo(
    () => ({
      error: query.error,
      isPending: query.isPending,
      notes: query.data ?? [],
      pending: pending > 0,
      refetch: query.refetch,
      remove,
      reorder,
      retractVote,
      save,
      setFlags,
      vote,
    }),
    [
      pending,
      query.data,
      query.error,
      query.isPending,
      query.refetch,
      remove,
      reorder,
      retractVote,
      save,
      setFlags,
      vote,
    ],
  );
};

export type StoryNotes = ReturnType<typeof useStoryNotes>;
