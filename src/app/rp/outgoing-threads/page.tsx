"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useCallback, useEffect, useState } from "react";
import { FcRight } from "react-icons/fc";
import { BreadCrumb } from "@/components/breadcrumb";
import { LoadMore } from "@/components/load-more/page";
import { PromptThreadCommentCard } from "@/components/outgoing-reply";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { PromptThreadComment } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { getOutgoingThreadsAction } from "./actions";
import * as S from "./styles";

const PAGE_SIZE = 5;

export default function OutgoingThreadPage() {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");

  const { baseDataLoader, routeToPage } = usePageRouter();

  const [promptThreadComments, setPromptThreadComments] = useState<
    PromptThreadComment[] | null
  >(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const toExplorePromptsPage = () => {
    routeToPage(ROUTES.explorePrompts);
  };

  const fetchOutgoingThreads = useCallback(
    async (pageNumber: number, append = false) => {
      const _threads = await baseDataLoader(() =>
        getOutgoingThreadsAction(pageNumber, PAGE_SIZE),
      );

      if (!_threads || _threads.length === 0) {
        setHasMore(false);
        return;
      }

      setPromptThreadComments((prev) =>
        append ? [...(prev || []), ..._threads] : _threads,
      );
    },
    [baseDataLoader],
  );

  // Initial load
  useEffect(() => {
    if (authState === "LOADING" || promptThreadComments) return;

    fetchOutgoingThreads(1);
  }, [authState]);

  const loadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    await fetchOutgoingThreads(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <S.Container>
      <BreadCrumb label="Interactions" username={user?.username ?? ""} />

      <ShouldRender
        if={!promptThreadComments || promptThreadComments.length === 0}
      >
        <S.MessageContainer>
          <S.MessageText>
            You do not have anything active right now, but there is plenty to
            discover! ✨
            <br />
            Why not explore starters posted by other people and spark a new
            interaction?
            <br />
            <S.HyperLink onClick={toExplorePromptsPage}>
              Explore Open Interactions {` `}
              <FcRight size={22} />
            </S.HyperLink>
          </S.MessageText>
        </S.MessageContainer>
      </ShouldRender>

      <S.StoryListContainer>
        {promptThreadComments?.map((thread) => (
          <PromptThreadCommentCard
            key={thread.id}
            promptThreadComment={thread}
          />
        ))}

        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </S.StoryListContainer>
    </S.Container>
  );
}
