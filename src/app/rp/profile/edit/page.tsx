"use client";

import { ShouldRender } from "@novelist-world/ui";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { API_MESSAGE } from "@/utils/constants";
import EditDataCard from "./edit-data-card";
import type { ProfileState } from "./profile.store";
import * as S from "./styled";

const ErrorKeys = [API_MESSAGE.UncategorizedError] as const;
type ErrorKey = (typeof ErrorKeys)[number];

export default function EditProfilePage() {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");

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
