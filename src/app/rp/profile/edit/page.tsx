"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useEffect } from "react";
import { getNovelistRankByIdAction } from "@/app/rp/leaderboard/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import EditDataCard from "./edit-data-card";
import type { ProfileState } from "./profile.store";
import * as S from "./styled";

export default function EditProfilePage() {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const { stopPageLoading } = usePageRouter();

  // Stop any lingering full-page loader immediately — data is already in global state
  useEffect(() => {
    stopPageLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh own rank whenever edit profile is opened
  useEffect(() => {
    if (!novelist?.id) return;
    void getNovelistRankByIdAction(novelist.id).then((result) => {
      if (!("message" in result)) {
        setGlobalState({ novelistRank: result.rank });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novelist?.id]);

  return (
    <S.EditProfilePageRoot>
      <ShouldRender if={Boolean(user && novelist)}>
        <StoreProvider<ProfileState>
          storeId="profile"
          initial={{
            about: novelist?.about || "",
            avatar: novelist?.avatar ?? null,
            firstName: novelist?.firstName || "",
            image: novelist?.image || "",
            lastName: novelist?.lastName || "",
            note: novelist?.note || "",
            palette: user?.palette ?? 0,
            theme: "dark",
          }}
        >
          <EditDataCard />
        </StoreProvider>
      </ShouldRender>
    </S.EditProfilePageRoot>
  );
}
