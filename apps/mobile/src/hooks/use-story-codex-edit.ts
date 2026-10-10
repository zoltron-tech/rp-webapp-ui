import {
  deleteCodexRelationship,
  deleteCodexTone,
  saveCodexRelationship,
  saveCodexTone,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi } from "@nw/features";
import {
  API_MESSAGE,
  type Codex,
  type CodexRelationship,
  type CodexTone,
} from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

/**
 * Writing to a story's codex: relationships and the tones they are drawn in.
 *
 * `use-story.ts` reads and nothing else, by design; this is the writing half
 * for the mesh. The codex is one query (`queryKeys.storyCodex`), so every
 * write patches that one cache entry the way web patches its local state:
 * the saved entity replaces the one with its id or is appended, a delete
 * drops it, and a retired tone also clears `toneId` on the relationships
 * that used it — which is what the server does on its side (the column is
 * nulled by the foreign key), so the cache matches without a refetch. A
 * failed delete refetches, since the optimistic removal has to be undone.
 *
 * Every call returns what happened rather than throwing: the saved entity or
 * `null`, `true` or `false`. The sheet decides what to say.
 */
export const useStoryCodexEdit = (storyId: string | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(0);
  const id = storyId ?? "";
  const key = queryKeys.storyCodex(id);

  const patch = useCallback(
    (update: (codex: Codex) => Codex) => {
      queryClient.setQueryData<Codex | null>(key, (codex) =>
        codex ? update(codex) : codex,
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

  const saveRelationship = useCallback(
    (relationship: CodexRelationship): Promise<CodexRelationship | null> =>
      track(async () => {
        if (!id) return null;
        const result = await saveCodexRelationship(api, id, relationship).catch(
          () => null,
        );
        if (!result || "message" in result) return null;
        const saved = result as CodexRelationship;
        patch((codex) => {
          const exists = codex.relationships.some((r) => r.id === saved.id);
          return {
            ...codex,
            relationships: exists
              ? codex.relationships.map((r) => (r.id === saved.id ? saved : r))
              : [...codex.relationships, saved],
          };
        });
        return saved;
      }),
    [api, id, patch, track],
  );

  const deleteRelationship = useCallback(
    (relationshipId: string): Promise<boolean> =>
      track(async () => {
        if (!id) return false;
        patch((codex) => ({
          ...codex,
          relationships: codex.relationships.filter(
            (r) => r.id !== relationshipId,
          ),
        }));
        const result = await deleteCodexRelationship(api, relationshipId).catch(
          () => null,
        );
        if (!result || result.message !== API_MESSAGE.Success) {
          void queryClient.invalidateQueries({ queryKey: key });
          return false;
        }
        return true;
      }),
    [api, id, key, patch, queryClient, track],
  );

  const saveTone = useCallback(
    (tone: CodexTone): Promise<CodexTone | null> =>
      track(async () => {
        if (!id) return null;
        const result = await saveCodexTone(api, id, tone).catch(() => null);
        if (!result || "message" in result) return null;
        const saved = result as CodexTone;
        patch((codex) => {
          const exists = codex.tones.some((t) => t.id === saved.id);
          return {
            ...codex,
            tones: exists
              ? codex.tones.map((t) => (t.id === saved.id ? saved : t))
              : [...codex.tones, saved],
          };
        });
        return saved;
      }),
    [api, id, patch, track],
  );

  const deleteTone = useCallback(
    (toneId: string): Promise<boolean> =>
      track(async () => {
        if (!id) return false;
        patch((codex) => ({
          ...codex,
          relationships: codex.relationships.map((r) =>
            r.toneId === toneId ? { ...r, toneId: null } : r,
          ),
          tones: codex.tones.filter((t) => t.id !== toneId),
        }));
        const result = await deleteCodexTone(api, toneId).catch(() => null);
        if (!result || result.message !== API_MESSAGE.Success) {
          void queryClient.invalidateQueries({ queryKey: key });
          return false;
        }
        return true;
      }),
    [api, id, key, patch, queryClient, track],
  );

  return useMemo(
    () => ({
      deleteRelationship,
      deleteTone,
      pending: pending > 0,
      saveRelationship,
      saveTone,
    }),
    [deleteRelationship, deleteTone, pending, saveRelationship, saveTone],
  );
};

export type StoryCodexEdit = ReturnType<typeof useStoryCodexEdit>;
