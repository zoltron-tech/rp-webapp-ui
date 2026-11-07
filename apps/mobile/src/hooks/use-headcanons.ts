import {
  createHeadcanon,
  deleteHeadcanon,
  getHeadcanonCatalog,
  getHeadcanonSection,
  reorderHeadcanons,
  setHeadcanonHeart,
  setHeadcanonPinned,
  updateHeadcanon,
  updateMuseFacts,
  updateMuseTraits,
} from "@nw/api/endpoints/headcanon";
import { useApi } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import type {
  FactsRequest,
  Headcanon,
  HeadcanonCatalog,
  HeadcanonRequest,
  HeadcanonSection,
  MuseFacts,
  MuseTrait,
} from "@nw/types/headcanon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { isApiError, reasonCopy } from "@/lib/headcanons";

/**
 * A character's Headcanons section: the read, and every write the owner makes
 * to it, each patching the one cache entry both the profile and the Edit
 * character screen draw from.
 *
 * The section is keyed under the muse (`["muse", id, "headcanons"]`) so
 * leaving or deleting a character drops it with the rest. The catalogue is a
 * fixed list served by the backend; it is fetched once and kept.
 */

export const headcanonSectionKey = (museId: string) =>
  ["muse", museId, "headcanons"] as const;

const CATALOG_KEY = ["headcanon-catalog"] as const;

const isCatalog = (value: unknown): value is HeadcanonCatalog =>
  !!value && typeof value === "object" && "traits" in value;

export const useHeadcanonCatalog = () => {
  const api = useApi();
  return useQuery({
    gcTime: Number.POSITIVE_INFINITY,
    queryFn: async (): Promise<HeadcanonCatalog> => {
      const result = await getHeadcanonCatalog(api);
      if (!isCatalog(result)) throw new Error("catalog");
      return result;
    },
    queryKey: CATALOG_KEY,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

/** Null when the viewer may not see the character (404). */
export const useHeadcanonSection = (
  museId: string | undefined,
  enabled: boolean,
) => {
  const api = useApi();
  return useQuery({
    enabled: enabled && Boolean(museId),
    queryFn: async (): Promise<HeadcanonSection | null> => {
      const result = await getHeadcanonSection(api, museId ?? "");
      if (result === null) return null;
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: headcanonSectionKey(museId ?? ""),
  });
};

/** What a write says back: nothing on success, or why it failed. */
export type WriteResult = { error: string | null; notice?: string };

const ok: WriteResult = { error: null };

export const useHeadcanonEdit = (museId: string) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const key = useMemo(() => headcanonSectionKey(museId), [museId]);

  const patch = useCallback(
    (fn: (section: HeadcanonSection) => HeadcanonSection) =>
      queryClient.setQueryData<HeadcanonSection | null>(key, (current) =>
        current ? fn(current) : current,
      ),
    [key, queryClient],
  );

  const current = useCallback(
    () => queryClient.getQueryData<HeadcanonSection | null>(key) ?? null,
    [key, queryClient],
  );

  const replaceCard = useCallback(
    (card: Headcanon) =>
      patch((s) => ({
        ...s,
        headcanons: s.headcanons.map((h) => (h.id === card.id ? card : h)),
      })),
    [patch],
  );

  const saveTraits = useCallback(
    async (traits: MuseTrait[]): Promise<WriteResult> => {
      const result = await updateMuseTraits(api, museId, {
        traits: traits.map((t) => ({ key: t.key, note: t.note })),
      });
      if (isApiError(result) || !Array.isArray(result)) {
        return {
          error: reasonCopy(
            result,
            "The traits could not be saved. Try again.",
          ),
        };
      }
      patch((s) => ({ ...s, traits: result }));
      return ok;
    },
    [api, museId, patch],
  );

  const saveFacts = useCallback(
    async (facts: MuseFacts): Promise<WriteResult> => {
      const request: FactsRequest = {
        blocks: facts.blocks.map((b) => ({ block: b.block, items: b.items })),
        thisOrThat: facts.blocks.some((b) => b.block === "THIS_OR_THAT")
          ? facts.thisOrThat
          : [],
      };
      const result = await updateMuseFacts(api, museId, request);
      if (isApiError(result) || !("blocks" in result)) {
        return {
          error: reasonCopy(
            result,
            "The quick facts could not be saved. Try again.",
          ),
        };
      }
      patch((s) => ({ ...s, facts: result }));
      return ok;
    },
    [api, museId, patch],
  );

  const saveCard = useCallback(
    async (
      editing: Headcanon | null,
      request: HeadcanonRequest,
    ): Promise<WriteResult> => {
      const result = editing
        ? await updateHeadcanon(api, editing.id, request)
        : await createHeadcanon(api, museId, request);
      if (isApiError(result) || !("id" in result)) {
        return {
          error: reasonCopy(
            result,
            "The headcanon could not be saved. Try again.",
          ),
        };
      }
      const elsewhere = Boolean(result.verseId && result.verseId !== museId);
      if (editing) {
        if (elsewhere) {
          // A card moved to another verse leaves this verse's list.
          patch((s) => ({
            ...s,
            headcanons: s.headcanons.filter((h) => h.id !== result.id),
          }));
          return { error: null, notice: "It now shows on its verse only." };
        }
        replaceCard(result);
        return ok;
      }
      if (elsewhere) {
        return { error: null, notice: "Saved to its verse." };
      }
      // New cards land on top of the unpinned ones, as the server orders them.
      patch((s) => {
        const pinned = s.headcanons.filter((h) => h.pinned);
        const rest = s.headcanons.filter((h) => !h.pinned);
        return { ...s, headcanons: [...pinned, result, ...rest] };
      });
      return ok;
    },
    [api, museId, patch, replaceCard],
  );

  const togglePin = useCallback(
    async (card: Headcanon): Promise<WriteResult> => {
      const result = await setHeadcanonPinned(api, card.id, !card.pinned);
      if (isApiError(result) || !("id" in result)) {
        return {
          error: reasonCopy(result, "The pin could not be changed. Try again."),
        };
      }
      replaceCard(result);
      // Where it lands among the others is the server's order.
      await queryClient.invalidateQueries({ queryKey: key });
      return ok;
    },
    [api, key, queryClient, replaceCard],
  );

  const removeCard = useCallback(
    async (card: Headcanon): Promise<WriteResult> => {
      const result = await deleteHeadcanon(api, card.id);
      if (
        !result ||
        !("message" in result) ||
        result.message !== API_MESSAGE.Success
      ) {
        return { error: "The headcanon could not be deleted. Try again." };
      }
      patch((s) => ({
        ...s,
        headcanons: s.headcanons.filter((h) => h.id !== card.id),
      }));
      return ok;
    },
    [api, patch],
  );

  /** Pins stay on top: a card only moves within its own group. */
  const move = useCallback(
    async (index: number, by: -1 | 1): Promise<WriteResult> => {
      const section = current();
      if (!section) return ok;
      const list = [...section.headcanons];
      const target = index + by;
      if (target < 0 || target >= list.length) return ok;
      if (list[index].pinned !== list[target].pinned) return ok;
      [list[index], list[target]] = [list[target], list[index]];
      const previous = section.headcanons;
      patch((s) => ({ ...s, headcanons: list }));
      const result = await reorderHeadcanons(
        api,
        museId,
        list.map((h) => h.id),
      );
      if (isApiError(result) || !Array.isArray(result)) {
        patch((s) => ({ ...s, headcanons: previous }));
        return { error: "The order could not be saved. Try again." };
      }
      patch((s) => ({ ...s, headcanons: result }));
      return ok;
    },
    [api, current, museId, patch],
  );

  /** Optimistic; put back if the server says no. */
  const heart = useCallback(
    async (card: Headcanon): Promise<WriteResult> => {
      const next = !card.hearted;
      const optimistic = {
        ...card,
        heartCount: Math.max(0, card.heartCount + (next ? 1 : -1)),
        hearted: next,
      };
      replaceCard(optimistic);
      const result = await setHeadcanonHeart(api, card.id, next);
      if (result && "hearted" in result) {
        replaceCard({
          ...optimistic,
          heartCount: result.heartCount,
          hearted: result.hearted,
        });
        return ok;
      }
      replaceCard(card);
      return { error: "The heart could not be saved. Try again." };
    },
    [api, replaceCard],
  );

  return {
    heart,
    move,
    removeCard,
    saveCard,
    saveFacts,
    saveTraits,
    togglePin,
  };
};

export type HeadcanonEdit = ReturnType<typeof useHeadcanonEdit>;
