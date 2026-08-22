"use client";

import type { NovelistNote, NWImage, UpdateNovelistPayload } from "@nw/types/novelist";
import type { Accent } from "@nw/types/theme";
import { useCallback, useState } from "react";
import { updateUserTheme } from "@/app/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { API_MESSAGE } from "@/utils/constants";
import {
  addNoteAction,
  deleteBannerAction,
  deleteNoteAction,
  updateUserNovelist,
} from "../../novelists/actions";
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
  const banner = useProfileState("banner");
  const about = useProfileState("about");
  const noteObj = useProfileState("note");
  const palette = useProfileState("palette");

  const [loading, setLoading] = useState(false);

  const saveNovelist = useCallback(async (): Promise<SaveResult> => {
    const payload: UpdateNovelistPayload = {
      about: about ?? "",
      avatar: avatar ?? undefined,
      banner: banner,
      firstName: (firstName ?? "").trim(),
      image: avatar?.src ?? image ?? undefined,
      lastName: (lastName ?? "").trim(),
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
        level: novelist?.level ?? response.level,
        museCount: novelist?.museCount ?? 0,
        muses: novelist?.muses ?? [],
        totalPoints: novelist?.totalPoints ?? response.totalPoints,
      },
    });
    setProfileState({
      about: response.about || "",
      avatar: (response.avatar as NWImage | null) ?? null,
      banner: (response.banner as NWImage | null) ?? null,
      firstName: response.firstName || "",
      image: response.image || "",
      lastName: response.lastName || "",
      note: response.note ?? null,
    });

    return { ok: true };
  }, [
    about,
    avatar,
    banner,
    firstName,
    image,
    lastName,
    novelist,
    setGlobalState,
    setProfileState,
  ]);

  const deleteBanner = useCallback(async (): Promise<SaveResult> => {
    setLoading(true);
    const result = await deleteBannerAction();
    setLoading(false);

    if (result.message !== API_MESSAGE.Success) {
      return { message: result.message, ok: false };
    }

    setGlobalState({
      novelist: novelist ? { ...novelist, banner: null } : undefined,
    });
    setProfileState({ banner: null });
    return { ok: true };
  }, [novelist, setGlobalState, setProfileState]);

  const saveNote = useCallback(async (): Promise<SaveResult> => {
    let result: NovelistNote | { message: string };
    if (noteObj?.text?.trim()) {
      result = await addNoteAction(
        noteObj.text.trim(),
        noteObj.color ?? null,
        noteObj.emoji ?? null,
      );
    } else {
      result = await deleteNoteAction();
    }

    if ("message" in result && result.message !== "success") {
      return { message: result.message, ok: false };
    }

    const savedNote = "text" in result ? (result as NovelistNote) : null;
    setGlobalState({
      novelist: novelist ? { ...novelist, note: savedNote } : undefined,
    });
    setProfileState({ note: savedNote });
    return { ok: true };
  }, [noteObj, novelist, setGlobalState, setProfileState]);

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

    const newPalette = Number(palette) as Accent;
    setGlobalState({
      user: response.user,
      ...(novelist ? { novelist: { ...novelist, palette: newPalette } } : {}),
    });
    setProfileState({ palette: newPalette });
    return { ok: true };
  }, [novelist, palette, setGlobalState, setProfileState]);

  /**
   * Save only the fields that actually differ from current global state.
   * Returns combined result; if any save fails, returns the failure.
   */
  const saveAll = useCallback(
    async (
      opts: { novelist?: boolean; theme?: boolean; note?: boolean } = {
        note: true,
        novelist: true,
        theme: true,
      },
    ): Promise<SaveResult> => {
      const bannerDeleted =
        opts.novelist &&
        banner === null &&
        (novelist?.banner ?? null) !== null;

      const novelistDirty =
        opts.novelist &&
        ((firstName ?? "").trim() !== (novelist?.firstName ?? "") ||
          (lastName ?? "").trim() !== (novelist?.lastName ?? "") ||
          (about ?? "") !== (novelist?.about ?? "") ||
          (image ?? "") !== (novelist?.image ?? "") ||
          avatar !== (novelist?.avatar ?? null) ||
          (banner !== null && banner !== (novelist?.banner ?? null)));

      const noteDirty =
        opts.note !== false &&
        ((noteObj?.text ?? "") !== (novelist?.note?.text ?? "") ||
          (noteObj?.color ?? null) !== (novelist?.note?.color ?? null) ||
          (noteObj?.emoji ?? null) !== (novelist?.note?.emoji ?? null));

      const themeDirty =
        opts.theme && Number(palette) !== Number(user?.palette ?? 0);

      if (bannerDeleted) {
        const r = await deleteBanner();
        if (!r.ok) return r;
      }

      if (novelistDirty) {
        const r = await saveNovelist();
        if (!r.ok) return r;
      }

      if (noteDirty) {
        const r = await saveNote();
        if (!r.ok) return r;
      }

      if (themeDirty) {
        const r = await saveTheme();
        if (!r.ok) return r;
      }

      if (bannerDeleted || novelistDirty || noteDirty || themeDirty) {
        successToast("Profile updated successfully.");
      }

      return { ok: true };
    },
    [
      about,
      avatar,
      banner,
      firstName,
      image,
      lastName,
      noteObj,
      novelist,
      palette,
      deleteBanner,
      saveNovelist,
      saveNote,
      saveTheme,
      successToast,
      user?.palette,
    ],
  );

  return { loading, saveAll, saveNote, saveNovelist, saveTheme };
}
