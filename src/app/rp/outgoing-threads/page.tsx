"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useCallback, useEffect, useState } from "react";
import { FcRight } from "react-icons/fc";
import { BreadCrumb } from "@/components/breadcrumb";
import { PromptThreadCommentCard } from "@/components/outgoing-reply";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { PromptThreadComment } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { getOutgoingThreadsAction } from "./actions";
import * as S from "./styles";

export default function OutgoingThreadPage({}) {
  const user = useGlobalState("user");

  const [promptThreadComments, setPromptThreadComments] = useState<
    PromptThreadComment[] | null
  >(null);

  const authState = useGlobalState("authState");

  const { baseDataLoader, routeToPage } = usePageRouter();

  const toExplorePromptsPage = () => {
    routeToPage(ROUTES.explorePrompts);
  };

  const fetchOutgoingThreads = useCallback(async () => {
    const _threads = await baseDataLoader(getOutgoingThreadsAction, true);
    if (!_threads) return;
    setPromptThreadComments(_threads);
  }, [baseDataLoader]);

  useEffect(() => {
    if (authState === "LOADING" || promptThreadComments) return;

    fetchOutgoingThreads();
  }, [authState]);

  return (
    <S.Container>
      <BreadCrumb label="Interactions" username={user?.username ?? ""} />

      <ShouldRender
        if={!promptThreadComments || promptThreadComments.length === 0}
      >
        <S.MessageContainer>
          <S.MessageText>
            You do not have anything active right now, but there is plenty to discover! ✨
            Why not explore starters posted by other people and spark a new interaction?
            <br />
            <S.HyperLink onClick={toExplorePromptsPage}>
              Explore Open Interactions {` `}
              <FcRight size={22} />
            </S.HyperLink>
          </S.MessageText>
        </S.MessageContainer>
      </ShouldRender>

      <S.StoryListContainer>
        {promptThreadComments?.map((thread) => {
          return (
            <PromptThreadCommentCard
              key={thread.id}
              promptThreadComment={thread}
            />
          );
        })}
      </S.StoryListContainer>
    </S.Container>
  );
}
