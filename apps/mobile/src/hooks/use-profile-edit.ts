import { updateUserTheme } from "@nw/api/endpoints/account";
import {
  addNote,
  deleteBanner,
  deleteNote,
  updateUserNovelist,
} from "@nw/api/endpoints/novelists";
import {
  deleteProfileSong,
  setProfileSong,
} from "@nw/api/endpoints/profile-song";
import { queryKeys, useApi, useSession } from "@nw/features";
import { API_MESSAGE, type NWImage, type User } from "@nw/types";
import type { ProfileSong } from "@nw/types/music";
import type {
  Novelist,
  NovelistNote,
  UpdateNovelistPayload,
} from "@nw/types/novelist";
import type { Accent } from "@nw/types/theme";
import { toCropFilter } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { CropState } from "@/hooks/use-muse-edit";

/**
 * The signed-in novelist's edits to their own profile — web's
 * `useProfileSave`, one write per control.
 *
 * Web stages every field in a page store and saves the lot behind one button.
 * Here each control writes as it is confirmed (a crop, a note, a swatch), the
 * way `useMuseEdit` does for a character, so there is no half-saved state to
 * warn about on the way out.
 *
 * The novelist lives in react-query under `queryKeys.session()`, and the
 * account (where the accent is) under `queryKeys.authUser()`. A save writes the
 * answer into those entries, so the menu, the Profile tab and the accent of
 * the whole app follow without a refetch — `SessionStoreBridge` projects both
 * into the store the theme reads.
 *
 * Every method resolves `true` on success and `false` on any failure, and
 * never alerts: the caller knows what the person was trying to do.
 */

const NEUTRAL_FILTERS = { blur: 0, brightness: 100, greyscale: 0 };

/** Swallows a thrown request into the same `false` a failed answer gets. */
const attempt = async (run: () => Promise<boolean>): Promise<boolean> => {
  try {
    return await run();
  } catch {
    return false;
  }
};

/**
 * What the crop editor opens on: the stored avatar with its crop, or — for a
 * profile that predates crops — the plain image URL, uncropped.
 */
export const existingAvatar = (
  avatar: NWImage | null | undefined,
  image: string | null | undefined,
): NWImage | null =>
  avatar?.src
    ? avatar
    : image
      ? ({ crop: null, src: image } as unknown as NWImage)
      : null;

type NovelistFields = Pick<
  UpdateNovelistPayload,
  "about" | "avatar" | "banner" | "firstName" | "image" | "lastName"
>;

export const useProfileEdit = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { novelist } = useSession();

  const patch = useCallback(
    (updates: Partial<Novelist>) => {
      queryClient.setQueryData<Novelist | string | null>(
        queryKeys.session(),
        (current) =>
          current && typeof current === "object"
            ? { ...current, ...updates }
            : current,
      );
      if (novelist?.username) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.profile(novelist.username),
        });
      }
    },
    [novelist?.username, queryClient],
  );

  /**
   * `PUT /novelist` takes the whole editable profile, so the unchanged fields
   * are sent back as they are — the same payload web builds.
   */
  const saveNovelist = useCallback(
    (changes: Partial<NovelistFields>) =>
      attempt(async () => {
        if (!novelist) return false;
        const next = {
          about: novelist.about ?? "",
          avatar: novelist.avatar ?? undefined,
          banner: novelist.banner,
          firstName: novelist.firstName ?? "",
          image: novelist.image,
          lastName: novelist.lastName ?? "",
          ...changes,
        };
        const payload: UpdateNovelistPayload = {
          ...next,
          firstName: next.firstName.trim(),
          image: next.avatar?.src ?? next.image,
          lastName: (next.lastName ?? "").trim(),
        };
        const result = await updateUserNovelist(api, payload);
        // The success body carries `message: undefined`, so web's test is the
        // one that holds: a novelist has a first name, an error does not.
        if (!("firstName" in result)) return false;
        const { message: _message, ...saved } = result as Novelist & {
          message?: string;
        };
        // The update answer is the bare profile; the counts, lists and badges
        // on the session came from a richer endpoint and are kept.
        patch({
          about: saved.about,
          avatar: saved.avatar,
          banner: saved.banner,
          firstName: saved.firstName,
          image: saved.image,
          lastName: saved.lastName,
        });
        return true;
      }),
    [api, novelist, patch],
  );

  return useMemo(
    () => ({
      removeBanner: () =>
        attempt(async () => {
          const result = await deleteBanner(api);
          if (result.message !== API_MESSAGE.Success) return false;
          patch({ banner: null });
          return true;
        }),
      removeNote: () =>
        attempt(async () => {
          const result = await deleteNote(api);
          if (result.message !== API_MESSAGE.Success) return false;
          patch({ note: null });
          return true;
        }),
      removeSong: () =>
        attempt(async () => {
          const result = await deleteProfileSong(api);
          if (result.message !== API_MESSAGE.Success) return false;
          queryClient.setQueryData(["profile-song", novelist?.id ?? ""], null);
          return true;
        }),
      saveNovelist,
      setAvatar: (src: string, crop: CropState) => {
        const avatar: NWImage = {
          crop: toCropFilter(src, crop.x, crop.y, crop.scale),
          filterValues: NEUTRAL_FILTERS,
          src,
        };
        return saveNovelist({ avatar, image: src });
      },
      setBanner: (src: string, crop: CropState) => {
        const banner: NWImage = {
          crop: toCropFilter(src, crop.x, crop.y, crop.scale),
          filterValues: NEUTRAL_FILTERS,
          src,
        };
        return saveNovelist({ banner });
      },
      setNote: (text: string, color: string | null, emoji: string | null) =>
        attempt(async () => {
          const result = await addNote(api, text, color, emoji);
          if ("message" in result) return false;
          patch({ note: result as NovelistNote });
          return true;
        }),
      /**
       * The accent, applied before the server answers: it repaints the whole
       * app, and a colour that waits a round trip reads as a tap that missed.
       * A failure puts the old one back.
       */
      setPalette: (palette: Accent) =>
        attempt(async () => {
          const key = queryKeys.authUser();
          const previous = queryClient.getQueryData<User | null>(key);
          if (previous) {
            queryClient.setQueryData<User>(key, { ...previous, palette });
          }
          const result = await updateUserTheme(api, { palette, theme: 0 });
          if (!("user" in result)) {
            if (previous) queryClient.setQueryData(key, previous);
            return false;
          }
          queryClient.setQueryData(key, result.user);
          patch({ palette });
          return true;
        }),
      setSong: (song: ProfileSong) =>
        attempt(async () => {
          const result = await setProfileSong(api, song);
          if ("message" in result) return false;
          queryClient.setQueryData(
            ["profile-song", novelist?.id ?? ""],
            result,
          );
          return true;
        }),
    }),
    [
      api,
      novelist?.id,
      novelist?.note?.emoji,
      patch,
      queryClient,
      saveNovelist,
    ],
  );
};

export type ProfileEdit = ReturnType<typeof useProfileEdit>;
