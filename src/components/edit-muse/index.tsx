"use client";

import { ShouldRender } from "@novelist-world/ui";
import { type FC, useEffect, useState } from "react";
import { getMuseAction } from "@/app/rp/muse/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import type { Muse } from "@/types";
import { API_MESSAGE, FANDOMLESS } from "@/utils/constants";
import EditMuseDataCard from "./edit-muse-data-card";
import type { MuseState } from "./muse.store";
import * as S from "./styled";

const ErrorKeys = [API_MESSAGE.UncategorizedError] as const;
type ErrorKey = (typeof ErrorKeys)[number];

export type EditMuseCardProps = {
  id?: string;
};

export const EditMuseForm: FC<EditMuseCardProps> = ({ id }) => {
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const [muse, setMuse] = useState<Muse>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    if (!id) return;

    setLoading(true);

    const response = await getMuseAction(id);
    if (response && !("message" in response)) {
      setMuse(response);
    }
    setLoading(false);
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
            fandom: muse?.fandom || FANDOMLESS,
            firstName: muse?.firstName || "",
            gender: null,
            id: muse?.id || "",
            image: muse?.image || "",
            lastName: muse?.lastName || "",
            note: muse?.note || "",
            privacy: muse?.privacy || "PUBLIC",
            story: muse?.story || "",
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
