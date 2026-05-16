"use client";

import { ShouldRender } from "@novelist-world/ui";
import { type FC, useEffect, useState } from "react";
import { getMuseAction } from "@/app/rp/muse/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
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

  const fetchData = async () => {
    if (!id) {
      stopPageLoading();
      return;
    }

    const response = await baseDataLoader(() => getMuseAction(id));
    if (response !== null) setMuse(response);
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    fetchData();
  }, [authState]);

  return (
    <S.AddEditMusePageRoot>
      <ShouldRender if={Boolean(novelist && (muse || id == null))}>
        <StoreProvider<MuseState>
          storeId="muse"
          initial={{
            accent: muse?.accent || null,
            cardBackground: muse?.cardBackground || null,
            extraAttributes: muse?.extraAttributes || null,
            fandom: muse?.fandom || FANDOMLESS,
            firstName: muse?.firstName || "",
            gender: null,
            id: muse?.id || "",
            image: muse?.image || "",
            lastName: muse?.lastName || "",
            nicknames: muse?.nicknames || [],
            note: muse?.note || "",
            privacy: muse?.privacy || "PUBLIC",
            story: muse?.story || "",
            useAccent: muse?.useAccent || false,
            useExtraImages: muse?.useExtraImages || false,
            wallpaper: muse?.wallpaper || null,
          }}
        >
          <EditMuseDataCard />
        </StoreProvider>
      </ShouldRender>
    </S.AddEditMusePageRoot>
  );
};

export default EditMuseForm;
