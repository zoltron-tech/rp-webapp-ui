import {
  getMuse,
  getMuseAboutSections,
  getMuseMedia,
  getMuseMediaMetadata,
} from "@nw/api/endpoints/muse";
import { getMuseConnectionsByMuse } from "@nw/api/endpoints/muse-connection";
import { getPromptsByMuse } from "@nw/api/endpoints/prompt";
import { queryKeys, useApi } from "@nw/features";
import type {
  Muse,
  MuseAboutSection,
  MuseConnectionGroup,
  Prompt,
} from "@nw/types";
import type { MediaMetadata } from "@nw/types/activity";
import type { DataType, ErrorType } from "@nw/types/common";
import { useQuery } from "@tanstack/react-query";

/**
 * A character, and the four lists its profile shows one section at a time.
 *
 * Web fetches these from `apps/web/src/app/rp/muse/[slug]/page.tsx` with
 * `useState` and a "fetched" ref per list, on the first visit to each section.
 * The same laziness here is `enabled`: a section's query is only switched on
 * once that section has been opened, so opening a profile costs one request
 * and reading the card costs nothing more — which matters on a screen whose
 * background is a full-bleed wallpaper already coming down the same pipe.
 *
 * ## Why these are local rather than in `@nw/features`
 *
 * That package's rule: every hook in it has a consumer on both clients. Web's
 * page does far more than fetch — it edits every one of these lists in place —
 * so lifting a read-only hook now would be inventing an interface for one
 * caller. The query *keys* are shared already, so the cache entries are the
 * ones web will join when its page migrates.
 *
 * ## `null` is not an error
 *
 * Every endpoint here answers 404 for "nothing yet", which `@nw/api` hands
 * back as `null`. That is an empty state, not a failure, and the two must not
 * collapse: one draws the scene, the other draws "Try again".
 */

const unwrap = <T>(result: DataType<T>, empty: T): T => {
  if (result === null) return empty;
  if (typeof result === "object" && "message" in result) {
    throw new Error(String((result as ErrorType).message));
  }
  return result as T;
};

export const useMuse = (museId: string | undefined) => {
  const api = useApi();

  return useQuery({
    enabled: Boolean(museId),
    queryFn: async (): Promise<Muse | null> => {
      const result = await getMuse(api, museId ?? "");
      if (result === null) return null;
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.muse(museId ?? ""),
  });
};

export const useMuseAboutSections = (
  museId: string | undefined,
  enabled: boolean,
) => {
  const api = useApi();

  return useQuery({
    enabled: enabled && Boolean(museId),
    queryFn: async (): Promise<MuseAboutSection[]> =>
      unwrap(await getMuseAboutSections(api, museId ?? ""), []),
    queryKey: queryKeys.museAboutSections(museId ?? ""),
  });
};

export const useMusePrompts = (
  museId: string | undefined,
  enabled: boolean,
) => {
  const api = useApi();

  return useQuery({
    enabled: enabled && Boolean(museId),
    queryFn: async (): Promise<Prompt[]> =>
      unwrap(await getPromptsByMuse(api, museId ?? ""), []),
    queryKey: queryKeys.musePrompts(museId ?? ""),
  });
};

export const useMuseMedia = (museId: string | undefined, enabled: boolean) => {
  const api = useApi();

  return useQuery({
    enabled: enabled && Boolean(museId),
    queryFn: async (): Promise<string[]> => {
      const result = await getMuseMedia(api, museId ?? "");
      return Array.isArray(result) ? result : [];
    },
    queryKey: queryKeys.museMedia(museId ?? ""),
  });
};

export const useMuseConnections = (
  museId: string | undefined,
  enabled: boolean,
) => {
  const api = useApi();

  return useQuery({
    enabled: enabled && Boolean(museId),
    queryFn: async (): Promise<MuseConnectionGroup[]> =>
      unwrap(await getMuseConnectionsByMuse(api, museId ?? ""), []),
    queryKey: queryKeys.museConnections(museId ?? ""),
  });
};

/** Captions and reactions for the gallery, fetched once the viewer opens. */
export const useMuseMediaMetadata = (
  museId: string | undefined,
  enabled: boolean,
) => {
  const api = useApi();

  return useQuery({
    enabled: enabled && Boolean(museId),
    queryFn: async (): Promise<MediaMetadata[]> => {
      const result = await getMuseMediaMetadata(api, museId ?? "");
      return Array.isArray(result) ? result : [];
    },
    queryKey: [...queryKeys.museMedia(museId ?? ""), "metadata"] as const,
  });
};
