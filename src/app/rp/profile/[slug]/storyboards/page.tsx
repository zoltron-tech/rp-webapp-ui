"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllStoryboardsByUsernameAction } from "@/app/rp/story/actions";
import { ShouldRender } from "@/components/common";
import StoryCard from "@/components/story-card";
import { useGlobalState } from "@/context/store/stores";
import type { StoryBoard } from "@/types";
import { INITIAL_STORY_BOARD } from "@/utils/constants";
import { Logger } from "@/utils/services";
import * as S from "./styles";

export default function MusesListPage({}) {
  const params = useParams();
  const [storyBoards, setStoryBoards] = useState<StoryBoard[] | null>(null);

  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const [_loading, setLoading] = useState(true);
  const { push } = useRouter();
  Logger.debug("params are:", params);

  const fetchStoryboards = async () => {
    setLoading(true);
    const _storyboards = await getAllStoryboardsByUsernameAction(username);

    if (!_storyboards || "message" in _storyboards) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setStoryBoards(_storyboards);
    setLoading(false);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyBoards) return;

    fetchStoryboards();
  }, [authState]);

  return (
    <S.Container>
      <S.Maintext>
        {isCurrentUser ? "Your" : `${username}'s`} Stories
      </S.Maintext>
      <S.Subtext>
        {isCurrentUser
          ? "Stories created by you: " +
            storyBoards?.filter(
              (storyBoard) =>
                storyBoard?.createdBy?.username === user?.username,
            )?.length +
            "/" +
            novelist?.tier.storyBoardLimit
          : ""}
      </S.Subtext>
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
