"use client";

import { useCallback, useEffect, useState } from "react";
import { BreadCrumb } from "@/components/breadcrumb";
import { PromptThreadCommentCard } from "@/components/outgoing-reply";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { PromptThreadComment } from "@/types";
import { getOutgoingThreadsAction } from "./actions";
import * as S from "./styles";

export default function OutgoingThreadPage({}) {
  const user = useGlobalState("user");

  const [promptThreadComments, setPromptThreadComments] = useState<
    PromptThreadComment[] | null
  >(null);

  const authState = useGlobalState("authState");

  const { baseDataLoader } = usePageRouter();

  const fetchOutgoingThreads = useCallback(async () => {
    const _threads = await baseDataLoader(getOutgoingThreadsAction);
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
