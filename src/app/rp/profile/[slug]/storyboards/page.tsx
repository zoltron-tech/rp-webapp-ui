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
  const [storyBoards, setStoryBoards] = useState<StoryBoard[] | null>(null);
  const { state, user, novelist } = useAuthContext();
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const [loading, setLoading] = useState(true);
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
    if (state === "LOADING" || storyBoards) return;

    fetchStoryboards();
  }, [state]);

  return (
    <S.Container>
      <S.Maintext>
        {isCurrentUser ? "Your" : username + "'s"} Stories
      </S.Maintext>
      <S.Subtext>
        {isCurrentUser
          ? "Stories created by you: " +
            storyBoards?.filter(
              (storyBoard) => storyBoard?.createdBy?.username == user?.username
            )?.length +
            "/" +
            novelist?.tier.storyBoardLimit
          : ""}
      </S.Subtext>
      <S.MuseListContainer>
        <ShouldRender if={isCurrentUser}>
          <StoryCard key={null} storyBoard={INITIAL_STORY_BOARD}></StoryCard>
        </ShouldRender>
        {storyBoards &&
          storyBoards.map((storyBoard) => {
            // Determine if this storyBoard is "owned"
            const isOwnBoard =
              storyBoard.createdBy?.username === user?.username;

            return (
              <StoryCard
                key={storyBoard.id}
                storyBoard={storyBoard}
                className={isOwnBoard ? "own" : ""}
              />
            );
          })}
      </S.MuseListContainer>
    </S.Container>
  );
}
