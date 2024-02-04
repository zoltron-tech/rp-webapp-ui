"use client";
import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";

import { MusesPill, PageLoader } from "@/components";
import { ShouldRender, Username } from "@/components/common";
import { Novelist } from "@/types";
import { useEffect, useState } from "react";
import { getNovelistAction } from "../../novelists/actions";
import * as S from "./styles";

export default function UserProfilePage({}) {
  const params = useParams();
  const { loading: loadingAuth, user } = useAuthContext();
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [loading, setLoading] = useState(true);
  const username = params.slug as string;
  const isCurrentUser = username === user?.username;
  const { push } = useRouter();
  Logger.log("params are:", params);

  const fetchNovelist = async (username: string) => {
    // fetch novelist by username
    setLoading(true);
    const _novelist = await getNovelistAction(username);
    if (!_novelist || "message" in _novelist) {
      // handle error
      return;
    }
    setLoading(false);
    setNovelist(_novelist);
  };

  const toEditProfile = () => {
    push(`/rp/profile/edit`);
  };

  useEffect(() => {
    if (!loadingAuth && !novelist) {
      fetchNovelist(username);
    }
  }, [loadingAuth]);

  return (
    <>
      <ShouldRender if={loading && !loadingAuth}>
        <PageLoader />
      </ShouldRender>
      <S.Banner src={novelist?.image || ""} />
      <S.SolidBackground></S.SolidBackground>
      <S.Content>
        <ShouldRender if={isCurrentUser}>
          <S.EditProfile onClick={toEditProfile}>Edit Profile</S.EditProfile>
        </ShouldRender>
        <S.ContentLeft>
          <S.Avatar>
            <img src={novelist?.image || ""} alt={""} />
          </S.Avatar>
          <S.NameMobile>
            {novelist?.firstName} {novelist?.lastName}
          </S.NameMobile>
          <S.UsernameContainer>
            <Username username={username} primary />
          </S.UsernameContainer>
          <S.NoteContainer>{novelist?.note}</S.NoteContainer>
        </S.ContentLeft>
        <S.ContentRight>
          <S.Name>
            {novelist?.firstName} {novelist?.lastName}
          </S.Name>
          <MusesPill novelist={novelist} />
        </S.ContentRight>
      </S.Content>
    </>
  );
}
