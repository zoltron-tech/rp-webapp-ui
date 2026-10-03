import {
  addMuseExtraAttribute,
  addMuseNickname,
  changeMuseFandom,
  deleteMuseSong,
  editMuseExtraAttribute,
  editMuseNickname,
  removeMuseAvatar,
  removeMuseCardBackground,
  removeMuseExtraAttribute,
  removeMuseNickname,
  removeMuseNote,
  setMuseAvatar,
  setMuseCardBackground,
  setMuseNote,
  setMusePrivacy,
  setMuseSong,
} from "@nw/api/endpoints/muse";
import { queryKeys, useApi, useSession } from "@nw/features";
import { API_MESSAGE, type Fandom, type Muse, type NWImage } from "@nw/types";
import type { ProfileSong } from "@nw/types/music";
import type { PrivacyLevel } from "@nw/types/prompt";
import { toCropFilter } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

/**
 * The owner's in-place edits to a character, each one written through the
 * same endpoint web's section calls and then written into the query cache.
 *
 * Web keeps the muse in component state and patches it with `onMuseUpdate`
 * after every save. Here the muse lives in react-query under
 * `queryKeys.muse(id)`, so a save patches that entry — and every section on
 * screen, the header title, the wallpaper, re-render from the one object.
 *
 * ## `false` means "tell the person"
 *
 * Every method resolves to `true` on success and `false` on any failure —
 * network, 4xx, a `{ message }` body — so a sheet can stay open and say so.
 * Nothing here alerts; the caller knows what the person was trying to do.
 *
 * ## The owner's own lists follow
 *
 * A muse's avatar and name appear on the owner's profile and character list
 * as well, so those entries are invalidated after a save rather than left
 * showing the old face until the next cold load.
 */

const failed = (result: unknown): boolean =>
  result === null ||
  result === undefined ||
  (typeof result === "object" && result !== null && "message" in result);

/** The filter values every crop dialog on web writes alongside a crop. */
const NEUTRAL_FILTERS = { blur: 0, brightness: 100, greyscale: 0 };

export interface CropState {
  scale: number;
  x: number;
  y: number;
}

export const useMuseEdit = (museId: string | null | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const session = useSession();
  const id = museId ?? "";

  const patch = useCallback(
    (updates: Partial<Muse>) => {
      queryClient.setQueryData<Muse | null>(queryKeys.muse(id), (muse) =>
        muse ? { ...muse, ...updates } : muse,
      );
      const username = session.novelist?.username;
      if (username) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.novelistMuses(username),
        });
      }
    },
    [id, queryClient, session.novelist?.username],
  );

  return useMemo(
    () => ({
      addAttribute: async (key: string, value: string) => {
        const result = await addMuseExtraAttribute(api, id, key, value);
        if (failed(result)) return false;
        patch({ extraAttributes: result as Record<string, string> });
        return true;
      },
      addNickname: async (nickname: string) => {
        const result = await addMuseNickname(api, id, nickname);
        if (failed(result)) return false;
        patch({ nicknames: result as string[] });
        return true;
      },
      changeFandom: async (fandom: Fandom) => {
        const result = await changeMuseFandom(api, id, fandom.id);
        if (failed(result)) return false;
        patch({ fandom: result as Fandom });
        return true;
      },
      editAttribute: async (oldKey: string, key: string, value: string) => {
        const result = await editMuseExtraAttribute(
          api,
          id,
          oldKey,
          key,
          value,
        );
        if (failed(result)) return false;
        patch({ extraAttributes: result as Record<string, string> });
        return true;
      },
      editNickname: async (previous: string, next: string) => {
        const result = await editMuseNickname(api, id, previous, next);
        if (failed(result)) return false;
        patch({ nicknames: result as string[] });
        return true;
      },
      /** Any field, for a caller that saved through another endpoint. */
      patch,
      removeAttribute: async (key: string) => {
        const result = await removeMuseExtraAttribute(api, id, key);
        if (failed(result)) return false;
        patch({ extraAttributes: result as Record<string, string> });
        return true;
      },
      removeAvatar: async () => {
        const result = await removeMuseAvatar(api, id);
        if (failed(result)) return false;
        patch({ avatar: null });
        return true;
      },
      removeCardBackground: async () => {
        const result = await removeMuseCardBackground(api, id);
        if (failed(result)) return false;
        patch({ cardBackground: null, useExtraImages: false });
        return true;
      },
      removeNickname: async (nickname: string) => {
        const result = await removeMuseNickname(api, id, nickname);
        if (failed(result)) return false;
        patch({ nicknames: result as string[] });
        return true;
      },
      removeNote: async () => {
        const result = await removeMuseNote(api, id);
        if (failed(result)) return false;
        patch({ note: "" });
        return true;
      },
      removeSong: async () => {
        const result = await deleteMuseSong(api, id);
        if (!result || result.message !== API_MESSAGE.Success) return false;
        patch({ featuredSong: null });
        return true;
      },
      /** The avatar, as web's `handleCropConfirm` builds it. */
      setAvatar: async (src: string, crop: CropState) => {
        const image: NWImage = {
          crop: toCropFilter(src, crop.x, crop.y, crop.scale),
          filterValues: NEUTRAL_FILTERS,
          src,
        };
        const result = await setMuseAvatar(api, id, image);
        if (failed(result)) return false;
        patch({ avatar: result as NWImage });
        return true;
      },
      /** The card background; saving one switches the muse to its extra images. */
      setCardBackground: async (src: string, crop: CropState) => {
        const image: NWImage = {
          crop: toCropFilter(src, crop.x, crop.y, crop.scale),
          filterValues: NEUTRAL_FILTERS,
          src,
        };
        const result = await setMuseCardBackground(api, id, image);
        if (failed(result)) return false;
        patch({ cardBackground: result as NWImage, useExtraImages: true });
        return true;
      },
      setNote: async (note: string) => {
        const result = await setMuseNote(api, id, note);
        if (failed(result)) return false;
        patch({ note: result as string });
        return true;
      },
      setPrivacy: async (privacy: PrivacyLevel) => {
        const result = await setMusePrivacy(api, id, privacy);
        if (failed(result)) return false;
        patch({ privacy: result as PrivacyLevel });
        return true;
      },
      setSong: async (song: ProfileSong) => {
        const result = await setMuseSong(api, id, {
          artist: song.artist ?? undefined,
          externalUrl: song.externalUrl ?? undefined,
          imageUrl: song.imageUrl ?? undefined,
          songId: song.songId ?? undefined,
          source: song.source,
          spotifyTrackId: song.spotifyTrackId ?? undefined,
          title: song.title,
          url: song.url ?? undefined,
        });
        if (failed(result)) return false;
        patch({ featuredSong: result as ProfileSong });
        return true;
      },
    }),
    [api, id, patch],
  );
};

export type MuseEdit = ReturnType<typeof useMuseEdit>;
