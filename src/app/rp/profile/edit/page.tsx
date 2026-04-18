"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useEffect } from "react";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import EditDataCard from "./edit-data-card";
import type { ProfileState } from "./profile.store";
import * as S from "./styled";

export default function EditProfilePage() {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { stopPageLoading } = usePageRouter();

  useEffect(() => {
    if (authState === "LOGGED_IN") {
      stopPageLoading();
    }
  }, [authState, stopPageLoading]);

  return (
    <S.EditProfilePageRoot>
      <ShouldRender if={Boolean(user && novelist)}>
        <StoreProvider<ProfileState>
          storeId="profile"
          initial={{
            about: novelist?.about || "",
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
