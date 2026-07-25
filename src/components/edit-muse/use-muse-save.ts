"use client";

import { useCallback, useState } from "react";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import type { CreateUpdateMuse, Fandom } from "@/types";
import { useMuseState, useMuseStoreSet } from "./muse.store";

type SaveResult = { ok: true; id: string } | { ok: false; message: string };

/**
 * Shared save hook for all muse editing sections.
 * Reads current muse state from the store and submits to the API.
 * Accepts an optional `privacyOverride` to handle PromptPrivacySelect's
 * form-managed state without a render-cycle timing issue.
 */
export function useMuseSave() {
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const image = useMuseState("image");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const note = useMuseState("note");
  const nicknames = useMuseState("nicknames");
  const story = useMuseState("story");
  const fandom = useMuseState("fandom");
  const privacy = useMuseState("privacy");
  const accent = useMuseState("accent");
  const useAccent = useMuseState("useAccent");
  const useExtraImages = useMuseState("useExtraImages");
  const extraAttributes = useMuseState("extraAttributes");
  const originalVerseId = useMuseState("originalVerseId");
  const setMuseState = useMuseStoreSet();
  const novelist = useGlobalState("novelist");
  const setGlobalState = useGlobalStoreSet();
  const { successToast } = useUIContext();

  const [loading, setLoading] = useState(false);

  const save = useCallback(
    async (privacyOverride?: string): Promise<SaveResult> => {
      const _accent = useAccent && accent?.trim() ? accent.trim() : null;
      const _privacy = privacyOverride ?? privacy ?? "PUBLIC";
      const isCreate = !id;

      const payload: CreateUpdateMuse = {
        accent: _accent,
        cardBackground: cardBackground ?? null,
        connections: [],
        extraAttributes: extraAttributes ?? null,
        // Backend expects the fandom ID string (same as the original form which
        // read `target.fandom.value` from the hidden input bound to `fandom.id`).
        fandom: (fandom?.id ?? "FANDOMLESS") as unknown as Fandom,
        firstName: firstName?.trim() ?? "",
        image: image ?? "",
        lastName: lastName?.trim() ?? "",
        nicknames: nicknames ?? [],
        note: note ?? "",
        // Only meaningful on create; the backend keeps verse lineage immutable
        // on update. Verse numbers are assigned server-side.
        originalVerseId: originalVerseId ?? null,
        privacy: _privacy,
        song: null,
        story: story ?? null,
        tags: null,
        useAccent,
        useExtraImages,
        video: null,
        wallpaper: wallpaper ?? null,
      };

      setLoading(true);
      const response = await updateMuseAction(id || null, payload);
      setLoading(false);

      if ("message" in response) {
        return { message: response.message as string, ok: false };
      }

      const savedId = response.id ?? id ?? "";
      setMuseState({ id: savedId });

      if (novelist) {
        const nextMuses = isCreate
          ? [...novelist.muses, response]
          : novelist.muses.map((m) => (m.id === savedId ? response : m));
        setGlobalState({
          novelist: {
            ...novelist,
            museCount: isCreate ? novelist.museCount + 1 : novelist.museCount,
            muses: nextMuses,
          },
        });
      }

      successToast("Data updated successfully.");
      return { id: savedId, ok: true };
    },
    [
      id,
      firstName,
      lastName,
      image,
      wallpaper,
      cardBackground,
      note,
      nicknames,
      story,
      fandom,
      privacy,
      accent,
      useAccent,
      useExtraImages,
      extraAttributes,
      originalVerseId,
      novelist,
      setGlobalState,
      setMuseState,
      successToast,
    ],
  );

  return { loading, save };
}
