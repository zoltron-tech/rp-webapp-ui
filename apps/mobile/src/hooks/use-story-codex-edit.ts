import {
  deleteCodexCategory,
  deleteCodexEntry,
  deleteCodexGroup,
  deleteCodexRelationship,
  deleteCodexTone,
  deleteStoryCharacter,
  reorderCodexCategories,
  saveCodexCategory,
  saveCodexEntry,
  saveCodexGroup,
  saveCodexRelationship,
  saveCodexTone,
  saveStoryCharacter,
} from "@nw/api/endpoints/story";
import { queryKeys, useApi } from "@nw/features";
import {
  API_MESSAGE,
  type Codex,
  type CodexCategory,
  type CodexEntry,
  type CodexGroup,
  type CodexRelationship,
  type CodexTone,
  type StoryCharacter,
} from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

/** The saved one in place of the one with its id, or on the end. */
const upsert = <T extends { id: string | null }>(list: T[], saved: T): T[] =>
  list.some((item) => item.id === saved.id)
    ? list.map((item) => (item.id === saved.id ? saved : item))
    : [...list, saved];

/**
 * Writing to a story's codex: its entries, categories, characters and groups,
 * and the relationships and tones of the mesh.
 *
 * `use-story.ts` reads and nothing else, by design; this is the writing half.
 * The codex is one query (`queryKeys.storyCodex`), so every
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

  /** A save whose answer replaces, or joins, one list of the codex. */
  const saver = useCallback(
    <T extends { id: string | null }>(
      request: () => Promise<unknown>,
      apply: (codex: Codex, saved: T) => Codex,
    ): Promise<T | null> =>
      track(async () => {
        if (!id) return null;
        const result = await request().catch(() => null);
        if (!result || typeof result !== "object" || "message" in result) {
          return null;
        }
        const saved = result as T;
        patch((codex) => apply(codex, saved));
        return saved;
      }),
    [id, patch, track],
  );

  /** A delete: gone at once, and back from the server if it did not take. */
  const remover = useCallback(
    (
      request: () => Promise<{ message?: unknown } | null | undefined>,
      apply: (codex: Codex) => Codex,
    ): Promise<boolean> =>
      track(async () => {
        if (!id) return false;
        patch(apply);
        const result = await request().catch(() => null);
        if (!result || result.message !== API_MESSAGE.Success) {
          void queryClient.invalidateQueries({ queryKey: key });
          return false;
        }
        return true;
      }),
    [id, key, patch, queryClient, track],
  );

  const saveEntry = useCallback(
    (entry: CodexEntry) =>
      saver<CodexEntry>(
        () => saveCodexEntry(api, id, entry),
        (codex, saved) => ({
          ...codex,
          entries: upsert(codex.entries, saved),
        }),
      ),
    [api, id, saver],
  );

  const deleteEntry = useCallback(
    (entryId: string) =>
      remover(
        () => deleteCodexEntry(api, entryId),
        (codex) => ({
          ...codex,
          entries: codex.entries.filter((entry) => entry.id !== entryId),
        }),
      ),
    [api, remover],
  );

  const saveCategory = useCallback(
    (category: CodexCategory) =>
      saver<CodexCategory>(
        () => saveCodexCategory(api, id, category),
        (codex, saved) => ({
          ...codex,
          categories: upsert(codex.categories, saved),
        }),
      ),
    [api, id, saver],
  );

  const deleteCategory = useCallback(
    (categoryId: string) =>
      remover(
        () => deleteCodexCategory(api, categoryId),
        (codex) => ({
          ...codex,
          categories: codex.categories.filter(
            (category) => category.id !== categoryId,
          ),
        }),
      ),
    [api, remover],
  );

  /** The whole order, once: the server answers with the renumbered list. */
  const reorderCategories = useCallback(
    (orderedIds: string[]): Promise<boolean> =>
      track(async () => {
        if (!id) return false;
        const result = await reorderCodexCategories(api, id, orderedIds).catch(
          () => null,
        );
        if (!Array.isArray(result)) return false;
        patch((codex) => ({ ...codex, categories: result }));
        return true;
      }),
    [api, id, patch, track],
  );

  const saveGroup = useCallback(
    (group: CodexGroup) =>
      saver<CodexGroup>(
        () => saveCodexGroup(api, id, group),
        (codex, saved) => ({
          ...codex,
          groups: upsert(codex.groups ?? [], saved),
        }),
      ),
    [api, id, saver],
  );

  const deleteGroup = useCallback(
    (groupId: string) =>
      remover(
        () => deleteCodexGroup(api, groupId),
        (codex) => ({
          ...codex,
          groups: (codex.groups ?? []).filter((group) => group.id !== groupId),
        }),
      ),
    [api, remover],
  );

  const saveCharacter = useCallback(
    (character: StoryCharacter) =>
      saver<StoryCharacter>(
        () => saveStoryCharacter(api, id, character),
        (codex, saved) => ({
          ...codex,
          characters: upsert(codex.characters, saved),
        }),
      ),
    [api, id, saver],
  );

  const deleteCharacter = useCallback(
    (characterId: string) =>
      remover(
        () => deleteStoryCharacter(api, characterId),
        (codex) => ({
          ...codex,
          characters: codex.characters.filter(
            (character) => character.id !== characterId,
          ),
        }),
      ),
    [api, remover],
  );

  return useMemo(
    () => ({
      deleteCategory,
      deleteCharacter,
      deleteEntry,
      deleteGroup,
      deleteRelationship,
      deleteTone,
      pending: pending > 0,
      reorderCategories,
      saveCategory,
      saveCharacter,
      saveEntry,
      saveGroup,
      saveRelationship,
      saveTone,
    }),
    [
      deleteCategory,
      deleteCharacter,
      deleteEntry,
      deleteGroup,
      deleteRelationship,
      deleteTone,
      pending,
      reorderCategories,
      saveCategory,
      saveCharacter,
      saveEntry,
      saveGroup,
      saveRelationship,
      saveTone,
    ],
  );
};

export type StoryCodexEdit = ReturnType<typeof useStoryCodexEdit>;
