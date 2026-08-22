"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { Muse } from "@nw/types";
import { useSearchParams } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { getMuseAction } from "@/app/rp/muse/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { FANDOMLESS } from "@/utils/constants";
import EditMuseDataCard from "./edit-muse-data-card";
import type { MuseState } from "./muse.store";
import * as S from "./styled";

export type EditMuseCardProps = {
  id?: string;
};

export const EditMuseForm: FC<EditMuseCardProps> = ({ id }) => {
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const [muse, setMuse] = useState<Muse>();
  const { baseDataLoader, stopPageLoading } = usePageRouter();
  const searchParams = useSearchParams();
  // Create-verse flow: /muses/create?originalVerseId=<museId> makes the new
  // muse an alternative verse of that muse. Ignored in edit mode.
  const originalVerseId = id ? null : searchParams?.get("originalVerseId");
  // Name + avatar of the muse this new verse belongs to, shown as a visual
  // cue on the create form so it's clear this isn't a brand-new character.
  const [verseParentMuse, setVerseParentMuse] = useState<Muse | null>(null);

  const fetchData = async () => {
    if (!id) {
      if (originalVerseId) {
        const parent = await baseDataLoader(() =>
          getMuseAction(originalVerseId),
        );
        if (parent !== null) setVerseParentMuse(parent);
      } else {
        stopPageLoading();
      }
      return;
    }

    const response = await baseDataLoader(() => getMuseAction(id));
    if (response !== null) setMuse(response);
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    fetchData();
  }, [authState]);

  // StoreProvider only reads `initial` on its first render (the underlying
  // store is a ref), so the parent-verse fetch must resolve *before* mounting
  // it — otherwise the pre-filled name would never make it into the store.
  const isReady = Boolean(
    novelist && (muse || (id == null && (!originalVerseId || verseParentMuse))),
  );

  return (
    <S.AddEditMusePageRoot>
      <ShouldRender if={isReady}>
        <StoreProvider<MuseState>
          storeId="muse"
          initial={{
            accent: muse?.accent || null,
            avatar: muse?.avatar || null,
            cardBackground: muse?.cardBackground || null,
            extraAttributes: muse?.extraAttributes || null,
            // Create-verse only: pre-fill from the parent muse's fandom, but
            // leave it changeable (unlike privacy) — the FandomSelect below
            // still lets the novelist pick a different one.
            fandom: muse?.fandom || verseParentMuse?.fandom || FANDOMLESS,
            featuredSong: muse?.featuredSong || null,
            // Create-verse only: pre-fill the name from the parent muse so the
            // novelist isn't retyping it; edit mode always uses the loaded muse.
            firstName: muse?.firstName || verseParentMuse?.firstName || "",
            gender: null,
            id: muse?.id || "",
            image: muse?.image || "",
            lastName: muse?.lastName || verseParentMuse?.lastName || "",
            nicknames: muse?.nicknames || [],
            note: muse?.note || "",
            originalVerseId: muse?.originalVerseId || originalVerseId || null,
            // Verses inherit privacy from their parent and can't change it.
            privacy: muse?.privacy || verseParentMuse?.privacy || "PUBLIC",
            story: muse?.story || "",
            useAccent: muse?.useAccent || false,
            useExtraImages: muse?.useExtraImages || false,
            wallpaper: muse?.wallpaper || null,
          }}
        >
          <EditMuseDataCard verseParentMuse={verseParentMuse} />
        </StoreProvider>
      </ShouldRender>
    </S.AddEditMusePageRoot>
  );
};

export default EditMuseForm;
