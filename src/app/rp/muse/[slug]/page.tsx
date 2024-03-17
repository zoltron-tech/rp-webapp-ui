"use client";

import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { ShouldRender, Username, Avatar } from "@/components/common";
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

  const onAuthorAvatarClick = () => {
    const username = muse?.pennedBy?.username;
    if (username) push(`/rp/profile/${username}`);
  };

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
          <S.Avatar src={muse?.image || ""} alt="profile-picture" size={340} />
          <S.NameMobile>
            {muse?.firstName} {muse?.lastName}
          </S.NameMobile>
          <S.AuthorContainer>
            <Avatar
              src={muse?.pennedBy?.image || ""}
              alt="profile-picture"
              size={80}
              hoverable
              onClick={onAuthorAvatarClick}
            />
            <S.UsernameContainer>
              <span>PENNED BY:</span>
              <Username username={muse?.pennedBy?.username} primary />
            </S.UsernameContainer>
          </S.AuthorContainer>
          <S.NoteContainer>
            <Quote>{muse?.note}</Quote>
          </S.NoteContainer>
        </S.ContentLeft>
        <S.ContentRight>
          <S.Name>
            {muse?.firstName} {muse?.lastName}
          </S.Name>
          <S.InfoContainer>
            <S.InfoItem>
              <S.InfoLabel>First Name:</S.InfoLabel>
              <S.InfoValue>{muse?.firstName}</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Last Name:</S.InfoLabel>
              <S.InfoValue>{muse?.lastName}</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Fandom:</S.InfoLabel>
              <S.InfoValue>{muse?.fandom}</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Date of Birth:</S.InfoLabel>
              <S.InfoValue>
                {muse?.dateOfBirth.year}-{muse?.dateOfBirth.month}-
                {muse?.dateOfBirth.day}
              </S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Species:</S.InfoLabel>
              <S.InfoValue>{muse?.species}</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Hometown:</S.InfoLabel>
              <S.InfoValue>{muse?.hometown}</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Relationship Status:</S.InfoLabel>
              <S.InfoValue>{muse?.relationshipStatus}</S.InfoValue>
            </S.InfoItem>
          </S.InfoContainer>
        </S.ContentRight>
      </S.Content>
    </>
  );
}
