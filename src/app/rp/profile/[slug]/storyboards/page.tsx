"use client";

import { useAuthContext } from "@/hooks";
import { StoryBoard } from "@/types";
import { INITIAL_STORY_BOARD } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as S from "./styles";
import { ShouldRender } from "@/components/common";
import StoryCard from "@/components/story-card";
import { getAllStoryboardsByUsernameAction } from "@/app/rp/story/actions";

export default function MusesListPage({}) {
  const params = useParams();
  const [storyBoards, setMuses] = useState<StoryBoard[] | null>(null);
  const { state, user } = useAuthContext();
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const [loading, setLoading] = useState(true);
  const { push } = useRouter();
  Logger.debug("params are:", params);

  const fetchStoryboards = async () => {
    setLoading(true);
    const _muses = await getAllStoryboardsByUsernameAction(username);

    if (!_muses || "message" in _muses) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setMuses(_muses);
  };

  useEffect(() => {
    if (state === "LOADING" || storyBoards) return;

    fetchStoryboards();
  }, [state]);

  return (
    <S.Container>
      <S.MainSubtext>
        {isCurrentUser ? "Your" : username + "'s"} Stories
      </S.MainSubtext>
      <S.MuseListContainer>
        <ShouldRender if={isCurrentUser}>
          <StoryCard key={null} storyBoard={INITIAL_STORY_BOARD}></StoryCard>
        </ShouldRender>
        {storyBoards &&
          storyBoards.map((storyBoard) => (
            <StoryCard key={storyBoard?.id} storyBoard={storyBoard}></StoryCard>
          ))}
      </S.MuseListContainer>
    </S.Container>
  );
}
