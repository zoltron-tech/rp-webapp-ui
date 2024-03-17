"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { ShouldRender, Username } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { Muse } from "@/types";
import { useEffect, useState } from "react";
import { getMuseAction } from "../../muse/actions";
import * as S from "./styles";
import { Quote } from "@/components/novelist-card/styles";

export default function MuseProfilePage({}) {
  const params = useParams();
  const { state } = useAuthContext();
  const [muse, setMuse] = useState<Muse | null>(null);
  const [loading, setLoading] = useState(true);
  const username = params.slug as string;
  const { push } = useRouter();
  Logger.debug("params are:", params);

  const fetchMuse = async (museId: string) => {
    setLoading(true);
    const _muse = await getMuseAction(museId);

    if (!_muse || "message" in _muse) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setMuse(_muse);
  };

  useEffect(() => {
    if (state === "LOADING" || muse) return;

    fetchMuse(username);
  }, [state]);

  return (
    <>
      <ShouldRender if={loading && state !== "LOADING"}>
        <PageLoader />
      </ShouldRender>

      <S.Banner src={muse?.image || ""} />
      <S.SolidBackground></S.SolidBackground>
      <S.Content>
        <S.ContentLeft>
          <S.Avatar
            src={muse?.image || ""}
            alt="profile-picture"
            size={340}
          />
          <S.NameMobile>
            {muse?.firstName} {muse?.lastName}
          </S.NameMobile>
          <S.UsernameContainer>
            PENNED BY: <Username username={muse?.pennedBy} primary />
          </S.UsernameContainer>
          <S.NoteContainer>
            <Quote>{muse?.note}</Quote>
          </S.NoteContainer>
        </S.ContentLeft>
        <S.ContentRight>
          <S.Name>
            {muse?.firstName} {muse?.lastName}
          </S.Name>
        </S.ContentRight>
      </S.Content>
    </>
  );
}
