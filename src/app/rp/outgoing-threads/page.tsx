"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShouldRender } from "@/components/common";
import { PromptThreadCommentCard } from "@/components/outgoing-reply";
import StoryCard from "@/components/story-card";
import { useGlobalState } from "@/context/store/stores";
import type { PromptThreadComment } from "@/types";
import { INITIAL_STORY_BOARD } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { getOutgoingThreadsAction } from "./actions";
import * as S from "./styles";

export default function OutgoingThreadPage({}) {
  const [promptThreadComments, setPromptThreadComments] = useState<
    PromptThreadComment[] | null
  >(null);

  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const [_loading, setLoading] = useState(true);
  const { push } = useRouter();

  const fetchOutgoingThreads = async () => {
    setLoading(true);
    const _threads = await getOutgoingThreadsAction();

    if (!_threads || "message" in _threads) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setPromptThreadComments(_threads);
    setLoading(false);
  };

  useEffect(() => {
    if (authState === "LOADING" || promptThreadComments) return;

    fetchOutgoingThreads();
  }, [authState]);

  return (
    <S.Container>
      <S.Maintext>Your Threads</S.Maintext>
      <S.Subtext>These are your outgoing threads</S.Subtext>
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
