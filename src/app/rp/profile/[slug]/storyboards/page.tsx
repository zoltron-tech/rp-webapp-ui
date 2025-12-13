"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllStoryboardsByUsernameAction } from "@/app/rp/story/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { ShouldRender } from "@/components/common";
import StoryCard from "@/components/story-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { StoryBoard } from "@/types";
import { INITIAL_STORY_BOARD } from "@/utils/constants";
import { Logger } from "@/utils/services";
import * as S from "./styles";

export default function MusesListPage({}) {
  const params = useParams();
  const [storyBoards, setStoryBoards] = useState<StoryBoard[] | null>(null);

  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const { baseDataLoader } = usePageRouter();
  Logger.debug("params are:", params);

  const fetchStoryboards = async () => {
    const _storyboards = await baseDataLoader(() =>
      getAllStoryboardsByUsernameAction(username),
    );
    setStoryBoards(_storyboards);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyBoards) return;

    fetchStoryboards();
  }, [authState]);

  return (
    <S.Container>
      <BreadCrumb label="Stories" username={username} />
      <S.StoryListContainer>
        <ShouldRender if={isCurrentUser}>
          <StoryCard key={null} storyBoard={INITIAL_STORY_BOARD}></StoryCard>
        </ShouldRender>
        {storyBoards?.map((storyBoard) => {
          // Determine if this storyBoard is "owned"
          const isOwnBoard = storyBoard.createdBy?.username === user?.username;

          return (
            <StoryCard
              key={storyBoard.id}
              storyBoard={storyBoard}
              className={isOwnBoard ? "own" : ""}
            />
          );
        })}
      </S.StoryListContainer>
    </S.Container>
  );
}
