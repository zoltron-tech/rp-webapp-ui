"use client";

import { ShouldRender } from "@novelist-world/ui";
import { type FC, useEffect, useState } from "react";
import { getSongAction } from "@/app/rp/profile/[slug]/music/action";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Song } from "@/types/music";
import EditMusicDataCard from "./edit-music-data-card";
import type { MusicState } from "./music.store";
import * as S from "./styled";

export type EditMusicCardProps = {
  id?: string;
};

export const EditMusicForm: FC<EditMusicCardProps> = ({ id }) => {
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const [song, setSong] = useState<Song>();
  const { baseDataLoader, stopPageLoading } = usePageRouter();

  const fetchData = async () => {
    if (!id) {
      stopPageLoading();
      return;
    }

    const response = await baseDataLoader(() => getSongAction(id));
    if (response !== null) setSong(response);
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    fetchData();
  }, [authState]);

  return (
    <S.AddEditMusicPageRoot>
      <ShouldRender if={Boolean(novelist && (song || id == null))}>
        <StoreProvider<MusicState>
          storeId="music"
          initial={{
            description: song?.description || "",
            id: song?.id || null,
            name: song?.name || "",
            tags: song?.tags || [],
            url: song?.url || "",
          }}
        >
          <EditMusicDataCard />
        </StoreProvider>
      </ShouldRender>
    </S.AddEditMusicPageRoot>
  );
};

export default EditMusicForm;
