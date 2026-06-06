"use client";

import { useCallback, useState } from "react";
import { updateUserTheme } from "@/app/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import type { NWImage, UpdateNovelistPayload } from "@/types/novelist";
import type { Accent } from "@/types/theme";
import { updateUserNovelist } from "../../novelists/actions";
import { useProfileState, useProfileStoreSet } from "./profile.store";

type SaveResult = { ok: true } | { ok: false; message: string };

/**
 * Centralized save logic for all profile-edit sections.
 * Compares profile-store values against the global novelist/user
 * and only hits the API for the fields that actually changed.
 */
export function useProfileSave() {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const setProfileState = useProfileStoreSet();
  const { successToast } = useUIContext();

  const firstName = useProfileState("firstName");
  const lastName = useProfileState("lastName");
  const image = useProfileState("image");
  const avatar = useProfileState("avatar");
  const about = useProfileState("about");
  const note = useProfileState("note");
  const palette = useProfileState("palette");

  const [loading, setLoading] = useState(false);

  const saveNovelist = useCallback(async (): Promise<SaveResult> => {
    const payload: UpdateNovelistPayload = {
      about: about ?? "",
      avatar: avatar ?? undefined,
      firstName: (firstName ?? "").trim(),
      image: avatar?.src ?? image ?? undefined,
      lastName: (lastName ?? "").trim(),
      note: note ?? "",
    };

    setLoading(true);
    const response = await updateUserNovelist(payload, !novelist?.id);
    setLoading(false);

    // Error response is `{ message: API_MESSAGE.Error }` only — no other fields.
    if (!("firstName" in response)) {
      return { message: (response as { message: string }).message, ok: false };
    }

    setGlobalState({
      novelist: {
        ...response,
        friends: novelist?.friends ?? [],
        friendsCount: novelist?.friendsCount ?? 0,
        isVerified: novelist?.isVerified ?? false,
        museCount: novelist?.museCount ?? 0,
        muses: novelist?.muses ?? [],
      },
    });
    setProfileState({
      about: response.about || "",
      avatar: (response.avatar as NWImage | null) ?? null,
      firstName: response.firstName || "",
      image: response.image || "",
      lastName: response.lastName || "",
      note: response.note || "",
    });

    return { ok: true };
  }, [
    about,
    avatar,
    firstName,
    image,
    lastName,
    note,
    novelist,
    setGlobalState,
    setProfileState,
  ]);

  const saveTheme = useCallback(async (): Promise<SaveResult> => {
    setLoading(true);
    const response = await updateUserTheme({
      palette: Number(palette) as Accent,
      theme: 0,
    });
    setLoading(false);

    if (!("user" in response)) {
      return { message: response.message as string, ok: false };
    }

    setGlobalState({ user: response.user });
    setProfileState({ palette: Number(palette) as Accent });
    return { ok: true };
  }, [palette, setGlobalState, setProfileState]);

  /**
   * Save only the fields that actually differ from current global state.
   * Returns combined result; if any save fails, returns the failure.
   */
  const saveAll = useCallback(
    async (
      opts: { novelist?: boolean; theme?: boolean } = {
        novelist: true,
        theme: true,
      },
    ): Promise<SaveResult> => {
      const novelistDirty =
        opts.novelist &&
        ((firstName ?? "").trim() !== (novelist?.firstName ?? "") ||
          (lastName ?? "").trim() !== (novelist?.lastName ?? "") ||
          (about ?? "") !== (novelist?.about ?? "") ||
          (note ?? "") !== (novelist?.note ?? "") ||
          (image ?? "") !== (novelist?.image ?? "") ||
          avatar !== (novelist?.avatar ?? null));

      const themeDirty =
        opts.theme && Number(palette) !== Number(user?.palette ?? 0);

      if (novelistDirty) {
        const r = await saveNovelist();
        if (!r.ok) return r;
      }

      if (themeDirty) {
        const r = await saveTheme();
        if (!r.ok) return r;
      }

      if (novelistDirty || themeDirty) {
        successToast("Profile updated successfully.");
      }

      return { ok: true };
    },
    [
      about,
      avatar,
      firstName,
      image,
      lastName,
      note,
      novelist,
      palette,
      saveNovelist,
      saveTheme,
      successToast,
      user?.palette,
    ],
  );

  return { loading, saveAll, saveNovelist, saveTheme };
}
