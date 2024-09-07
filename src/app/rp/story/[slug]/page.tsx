"use client";

import { useAuthContext } from "@/hooks";
import { StoryBoard } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoryboardAction } from "../actions";
import * as S from "./styles";
import { ShouldRender } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { MusesPill } from "@/components/muses-pill";

export default function UserProfilePage({}) {
  const params = useParams();
  const { state: authState } = useAuthContext();
  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const storyboardId = params?.slug as string;
  const { push } = useRouter();

  const fetchStoryboard = async (museId: string) => {
    setLoading(true);
    const _storyboard = await getStoryboardAction(storyboardId);

    if (!_storyboard || "message" in _storyboard) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setStoryBoard(_storyboard);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyboard) return;

    fetchStoryboard(storyboardId);
  }, [authState]);

  return (
    <>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <S.Banner
        src={
          storyboard?.image && !storyboard.image.endsWith(".gif")
            ? storyboard.image
            : ""
        }
      />
      <S.SolidBackground></S.SolidBackground>
      <S.StoryContainer>
        <ShouldRender if={loading}>
          <PageLoader />
        </ShouldRender>
        <S.Avatar
          src={storyboard?.image || ""}
          alt="profile-picture"
          size={250}
        />
        <S.Name>{storyboard?.name}</S.Name>
        <S.PillContainer>
          <MusesPill
            title="WRITERS"
            pillType="MEMBERS"
            storyboard={storyboard}
            expandable={true}
          />
        </S.PillContainer>
      </S.StoryContainer>
    </>
  );
}
