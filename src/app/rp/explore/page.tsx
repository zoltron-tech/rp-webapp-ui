"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoIosBookmarks } from "react-icons/io";
import { SiGhostery } from "react-icons/si";
import { BreadCrumb } from "@/components/breadcrumb";
import { ScrollJumpButton } from "@/components/common/scroll-jump-button";
import { LoadMore } from "@/components/load-more/page";
import { Prompt as PromptComponent } from "@/components/prompt";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Prompt } from "@/types";
import { getNewPromptsAction } from "../explore-prompts/actions";
import { getNewsFeed } from "../news-feed/actions";
import * as S from "./styles";

const PAGE_SIZE = 5;

type ExploreMode = "NEWSFEED" | "PROMPTS";

const getModeFromTab = (tab: string | null): ExploreMode =>
  tab === "newsfeed" ? "NEWSFEED" : "PROMPTS";

const getScrollContainer = () => {
  return document.querySelector("main.page-container") as HTMLElement | null;
};

export default function ExplorePage() {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { baseDataLoader } = usePageRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<ExploreMode>(
    getModeFromTab(searchParams?.get("tab") ?? null),
  );
  const [newsFeedPrompts, setNewsFeedPrompts] = useState<Prompt[] | null>(null);
  const [explorePrompts, setExplorePrompts] = useState<Prompt[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNewsFeedPrompts = useCallback(async () => {
    const _threads = await baseDataLoader(getNewsFeed);
    if (!_threads) return;
    setNewsFeedPrompts(_threads);
  }, [baseDataLoader]);

  const fetchExplorePrompts = useCallback(
    async (pageNumber: number, append = false) => {
      const _prompts = await baseDataLoader(() =>
        getNewPromptsAction(pageNumber, PAGE_SIZE),
      );

      if (!_prompts || _prompts.length === 0) {
        setHasMore(false);
        return;
      }

      setExplorePrompts((prev) =>
        append ? [...(prev || []), ..._prompts] : _prompts,
      );
    },
    [baseDataLoader],
  );

  useEffect(() => {
    setMode(getModeFromTab(searchParams?.get("tab") ?? null));
  }, [searchParams]);

  useEffect(() => {
    if (authState === "LOADING") return;

    if (mode === "NEWSFEED" && !newsFeedPrompts) {
      fetchNewsFeedPrompts();
    }

    if (mode === "PROMPTS" && !explorePrompts) {
      fetchExplorePrompts(1);
    }
  }, [
    authState,
    mode,
    newsFeedPrompts,
    explorePrompts,
    fetchNewsFeedPrompts,
    fetchExplorePrompts,
  ]);

  const loadMore = async () => {
    if (mode !== "PROMPTS" || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    await fetchExplorePrompts(nextPage, true);

    setPage(nextPage);
    setLoadingMore(false);
  };

  const scrollToTop = () => {
    const container = getScrollContainer();
    if (container) {
      container.scrollTo({ behavior: "smooth", top: 0 });
      return;
    }

    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const prompts = mode === "NEWSFEED" ? newsFeedPrompts : explorePrompts;

  return (
    <S.Container>
      <BreadCrumb label="Explore" username={user?.username ?? ""} />

      <S.ModeSwitcher role="tablist" aria-label="Explore mode">
        <S.ModeTabButton
          type="button"
          role="tab"
          aria-selected={mode === "NEWSFEED"}
          $active={mode === "NEWSFEED"}
          onClick={() => setMode("NEWSFEED")}
        >
          <SiGhostery size={20} />
          OOC
        </S.ModeTabButton>
        <S.ModeTabButton
          type="button"
          role="tab"
          aria-selected={mode === "PROMPTS"}
          $active={mode === "PROMPTS"}
          onClick={() => setMode("PROMPTS")}
        >
          <IoIosBookmarks size={20} />
          Prompts
        </S.ModeTabButton>
      </S.ModeSwitcher>

      <S.PromptListContainer>
        {prompts?.map((prompt) => (
          <PromptComponent key={prompt.id} prompt={prompt} />
        ))}

        {mode === "PROMPTS" && (
          <LoadMore
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
          />
        )}

        <ScrollJumpButton direction="up" onClick={scrollToTop} />
      </S.PromptListContainer>
    </S.Container>
  );
}
