"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FcRight } from "react-icons/fc";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { LoadMore } from "@/components/load-more/page";
import { PromptThreadCommentCard } from "@/components/outgoing-reply";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { PromptThreadComment } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { pluralize } from "@/utils/helpers";
import { getOutgoingThreadsAction } from "./actions";
import * as S from "./styles";

const PAGE_SIZE = 5;

const ThreadCardShimmer = () => (
  <S.ShimmerCard>
    <S.ShimmerHeader>
      <S.ShimmerAvatar />
      <S.ShimmerArrow />
      <S.ShimmerAvatar />
      <S.ShimmerInfo>
        <S.ShimmerLine $width="35%" />
        <S.ShimmerLine $width="22%" $height={11} />
      </S.ShimmerInfo>
    </S.ShimmerHeader>
    <S.ShimmerSeparator />
    <S.ShimmerContentBlock>
      <S.ShimmerLine $width="90%" />
      <S.ShimmerLine $width="78%" />
      <S.ShimmerLine $width="55%" />
    </S.ShimmerContentBlock>
    <S.ShimmerFooter>
      <S.ShimmerLine $width="100px" $height={11} />
      <S.ShimmerPill $width="110px" />
    </S.ShimmerFooter>
  </S.ShimmerCard>
);

export default function OutgoingThreadPage() {
  const cachedOutgoingThreads = useGlobalState("cachedOutgoingThreads");
  const unreadReplyCount = useGlobalState("unreadReplyCount");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage, stopPageLoading } = usePageRouter();

  const [isLoading, setIsLoading] = useState(!cachedOutgoingThreads);
  const [promptThreadComments, setPromptThreadComments] = useState<
    PromptThreadComment[] | null
  >(cachedOutgoingThreads ?? null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const toExplorePromptsPage = () => {
    routeToPage(ROUTES.explorePrompts);
  };

  // Stop the full-page loader on mount; shimmers handle the loading state.
  useEffect(() => {
    stopPageLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOutgoingThreads = useCallback(
    async (pageNumber: number, append = false) => {
      const result = await getOutgoingThreadsAction(pageNumber, PAGE_SIZE);

      if (!result || "message" in result || result.length === 0) {
        setHasMore(false);
        if (!append) setIsLoading(false);
        return;
      }

      setPromptThreadComments((prev) =>
        append ? [...(prev || []), ...result] : result,
      );
      setHasMore(result.length >= PAGE_SIZE);

      if (!append) {
        setIsLoading(false);
        setGlobalState({ cachedOutgoingThreads: result });
      }
    },
    [setGlobalState],
  );

  // Always fetch page 1 on mount. Cached data (a small preview slice seeded
  // by the right sidebar) paints instantly so there's no shimmer, but it's
  // not a full page — only the fetch gives us the authoritative list and a
  // correct hasMore, so the Load more / end-of-list choice is right from the
  // start instead of after a wasted click.
  useEffect(() => {
    fetchOutgoingThreads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    await fetchOutgoingThreads(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const headerSubtitle = useMemo(() => {
    if (isLoading) return "Loading your threads…";
    if (!promptThreadComments || promptThreadComments.length === 0) {
      return "You're all caught up";
    }

    const activeCount = unreadReplyCount ?? 0;
    if (activeCount === 0) return "No new replies right now";

    return `${activeCount} active ${pluralize("thread", activeCount)} with new replies`;
  }, [isLoading, promptThreadComments, unreadReplyCount]);

  return (
    <S.Container>
      <S.PageHeader>
        <S.PageHeaderIcon>
          <HiOutlineChatBubbleLeftRight />
        </S.PageHeaderIcon>
        <S.PageHeaderText>
          <S.PageHeaderTitle>Interactions</S.PageHeaderTitle>
          <S.PageHeaderSubtitle>{headerSubtitle}</S.PageHeaderSubtitle>
        </S.PageHeaderText>
      </S.PageHeader>

      {isLoading ? (
        <S.InteractionsListContainer>
          {Array.from({ length: 4 }, (_, i) => (
            <ThreadCardShimmer key={i} />
          ))}
        </S.InteractionsListContainer>
      ) : (
        <>
          <ShouldRender
            if={!promptThreadComments || promptThreadComments.length === 0}
          >
            <S.MessageContainer>
              <S.MessageText>
                You do not have anything active right now, but there is plenty
                to discover! ✨
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

          <S.InteractionsListContainer>
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
              endMarker={!!promptThreadComments?.length}
            />
          </S.InteractionsListContainer>
        </>
      )}
    </S.Container>
  );
}
