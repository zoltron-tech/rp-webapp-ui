"use client";

import { useCallback, useEffect, useState } from "react";
import { BreadCrumb } from "@/components/breadcrumb";
import { LoadMore } from "@/components/load-more/page";
import { Prompt as PromptComponent } from "@/components/prompt";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Prompt } from "@/types";
import { getNewPromptsAction } from "./actions";
import * as S from "./styles";

const PAGE_SIZE = 5;

export default function ExplorePrompts() {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");

  const { baseDataLoader } = usePageRouter();

  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPrompts = useCallback(
    async (pageNumber: number, append = false) => {
      const _prompts = await baseDataLoader(() =>
        getNewPromptsAction(pageNumber, PAGE_SIZE),
      );

      if (!_prompts || _prompts.length === 0) {
        setHasMore(false);
        return;
      }

      setPrompts((prev) =>
        append ? [...(prev || []), ..._prompts] : _prompts,
      );
    },
    [baseDataLoader],
  );

  // Initial load
  useEffect(() => {
    if (authState === "LOADING" || prompts) return;

    fetchPrompts(1);
  }, [authState]);

  const loadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    await fetchPrompts(nextPage, true);

    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <S.Container>
      <BreadCrumb
        label="Explore Interactions"
        username={user?.username ?? ""}
      />

      <S.PromptListContainer>
        {prompts?.map((prompt) => (
          <PromptComponent key={prompt.id} prompt={prompt} />
        ))}

        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </S.PromptListContainer>
    </S.Container>
  );
}
