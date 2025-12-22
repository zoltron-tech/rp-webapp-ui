"use client";

import { useCallback, useEffect, useState } from "react";
import { BreadCrumb } from "@/components/breadcrumb";
import { Prompt as PromptComponent } from "@/components/prompt";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Prompt } from "@/types";
import { getNewsFeed } from "./actions";
import * as S from "./styles";

export default function NewsFeed({}) {
  const user = useGlobalState("user");

  const [prompts, setPrompts] = useState<Prompt[] | null>(null);

  const authState = useGlobalState("authState");

  const { baseDataLoader } = usePageRouter();

  const fetchNewPrompts = useCallback(async () => {
    const _threads = await baseDataLoader(getNewsFeed);
    if (!_threads) return;
    setPrompts(_threads);
  }, [baseDataLoader]);

  useEffect(() => {
    if (authState === "LOADING" || prompts) return;

    fetchNewPrompts();
  }, [authState]);

  return (
    <S.Container>
      <BreadCrumb label="Newsfeed" username={user?.username ?? ""} />

      <S.PromptListContainer>
        {prompts?.map((prompt) => {
          return <PromptComponent key={prompt.id} prompt={prompt} />;
        })}
      </S.PromptListContainer>
    </S.Container>
  );
}
