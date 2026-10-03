"use client";

import type { Prompt } from "@nw/types";
import { useCallback, useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoIosBookmarks } from "react-icons/io";
import { SiGhostery } from "react-icons/si";
import { BreadCrumb } from "@/components/breadcrumb";
import { ScrollJumpButton } from "@/components/common/scroll-jump-button";
import type { SegmentedTabOption } from "@/components/common/segmented-tabs";
import { novelistToSource } from "@/components/event-thread-input/helpers";
import { LoadMore } from "@/components/load-more/page";
import { Prompt as PromptComponent } from "@/components/prompt";
import { PromptComposeTrigger } from "@/components/prompt-compose-trigger";
import PromptInput from "@/components/prompt-input";
import { FullPagePromptInput } from "@/components/prompt-input/full-page-prompt-input";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import {
  FEED_PAGE_SIZES,
  getInflightFeed,
  prefetchExplorePrompts,
  prefetchOOCPosts,
} from "@/lib/feed-prefetch";
import { useSearchParams } from "@/lib/navigation";
import {
  type CustomEventType,
  EVENTS,
  type PromptCommentReplyUpdatedPayload,
  type PromptReactedPayload,
} from "@/utils/constants/custom-events";
import { getNewPromptsAction } from "../explore-prompts/actions";
import { getNewsFeedPageAction } from "../news-feed/actions";
import * as S from "./styles";

const PAGE_SIZE = FEED_PAGE_SIZES.explorePrompts;
const OOC_PAGE_SIZE = FEED_PAGE_SIZES.oocPosts;

type ExploreMode = "NEWSFEED" | "PROMPTS";

const EXPLORE_MODES: SegmentedTabOption<ExploreMode>[] = [
  { icon: <SiGhostery aria-hidden="true" />, label: "OOC", value: "NEWSFEED" },
  {
    icon: <IoIosBookmarks aria-hidden="true" />,
    label: "Prompts",
    value: "PROMPTS",
  },
];

const getModeFromTab = (tab: string | null): ExploreMode =>
  tab === "newsfeed" ? "NEWSFEED" : "PROMPTS";

const getScrollContainer = () => {
  // The document scrolls, not main.page-container (see rp/styles.ts).
  return document.scrollingElement as HTMLElement | null;
};

// Append a page while dropping any prompts already present. Offset pagination
// can return a row twice at a page boundary when a new prompt has been
// prepended (which shifts everything down by one), so we guard against
// duplicate React keys here.
const appendUnique = (existing: Prompt[] | null, page: Prompt[]): Prompt[] => {
  const seen = new Set((existing ?? []).map((p) => p.id));
  return [...(existing ?? []), ...page.filter((p) => !seen.has(p.id))];
};

export default function ExplorePage() {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const cachedExplorePrompts = useGlobalState("cachedExplorePrompts");
  const cachedOOCPosts = useGlobalState("cachedOOCPosts");
  const setGlobalState = useGlobalStoreSet();
  const { baseDataLoader, stopPageLoading } = usePageRouter();
  const searchParams = useSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;
  const [composeOpen, setComposeOpen] = useState(false);

  const [mode, setMode] = useState<ExploreMode>(
    getModeFromTab(searchParams?.get("tab") ?? null),
  );
  // Hydrate from cached page 1 on mount. We snapshot on mount only so that
  // background polling cannot disrupt the visible feed (requirement #6).
  const [newsFeedPrompts, setNewsFeedPrompts] = useState<Prompt[] | null>(
    () => cachedOOCPosts,
  );
  const [explorePrompts, setExplorePrompts] = useState<Prompt[] | null>(
    () => cachedExplorePrompts,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [newsFeedPage, setNewsFeedPage] = useState(1);
  const [newsFeedHasMore, setNewsFeedHasMore] = useState(true);
  const [newsFeedLoadingMore, setNewsFeedLoadingMore] = useState(false);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  // Both fetchers prefer the shared prefetch service: if a prefetch is in
  // flight we attach to its promise; if page 1 is already cached we render
  // it immediately; otherwise we issue a fresh fetch.

  const fetchNewsFeedPrompts = useCallback(
    async (pageNumber: number, append = false) => {
      // Page 1: prefer cache / in-flight dedup, same as explorePrompts.
      if (pageNumber === 1 && !append) {
        if (cachedOOCPosts) {
          setNewsFeedPrompts(cachedOOCPosts);
          setNewsFeedHasMore(cachedOOCPosts.length === OOC_PAGE_SIZE);
          stopPageLoading();
          return;
        }
        const inflight = getInflightFeed<Prompt[] | null>("oocPosts");
        if (inflight) {
          const result = await inflight;
          if (result) {
            setNewsFeedPrompts(result);
            setNewsFeedHasMore(result.length === OOC_PAGE_SIZE);
          }
          stopPageLoading();
          return;
        }
        const result = await prefetchOOCPosts(setGlobalState);
        if (result) {
          setNewsFeedPrompts(result);
          setNewsFeedHasMore(result.length === OOC_PAGE_SIZE);
        }
        stopPageLoading();
        return;
      }

      // Pages 2+: fetch directly.
      const _prompts = await baseDataLoader(() =>
        getNewsFeedPageAction(pageNumber, OOC_PAGE_SIZE),
      );

      if (!_prompts || _prompts.length === 0) {
        setNewsFeedHasMore(false);
        return;
      }

      setNewsFeedHasMore(_prompts.length === OOC_PAGE_SIZE);
      setNewsFeedPrompts((prev) =>
        append ? appendUnique(prev, _prompts) : _prompts,
      );
    },
    [baseDataLoader, cachedOOCPosts, setGlobalState, stopPageLoading],
  );

  const fetchExplorePrompts = useCallback(
    async (pageNumber: number, append = false) => {
      // Page 1 has cache + in-flight dedup support; later pages always fetch.
      if (pageNumber === 1 && !append) {
        if (cachedExplorePrompts) {
          setExplorePrompts(cachedExplorePrompts);
          setHasMore(cachedExplorePrompts.length === PAGE_SIZE);
          stopPageLoading();
          return;
        }
        const inflight = getInflightFeed<Prompt[] | null>("explorePrompts");
        if (inflight) {
          const result = await inflight;
          if (result) {
            setExplorePrompts(result);
            setHasMore(result.length === PAGE_SIZE);
          }
          stopPageLoading();
          return;
        }
        const result = await prefetchExplorePrompts(setGlobalState);
        if (result) {
          setExplorePrompts(result);
          setHasMore(result.length === PAGE_SIZE);
        }
        stopPageLoading();
        return;
      }

      const _prompts = await baseDataLoader(() =>
        getNewPromptsAction(pageNumber, PAGE_SIZE),
      );

      if (!_prompts || _prompts.length === 0) {
        setHasMore(false);
        return;
      }

      setExplorePrompts((prev) =>
        append ? appendUnique(prev, _prompts) : _prompts,
      );
    },
    [baseDataLoader, cachedExplorePrompts, setGlobalState, stopPageLoading],
  );

  useEffect(() => {
    setMode(getModeFromTab(searchParams?.get("tab") ?? null));
  }, [searchParams]);

  // Keep both the visible feeds and the global cache in sync when a prompt is
  // reacted to, so the like persists after navigating away and back (the page
  // re-hydrates from the global cache on mount).
  const { on: onPromptEvent, off: offPromptEvent } = useCustomEvents(
    EVENTS.PROMPT.base,
  );

  useEffect(() => {
    const handlePromptReacted = (e: CustomEventType<PromptReactedPayload>) => {
      const { id, reacted, reactions } = e.detail;

      const applyReaction = (list: Prompt[] | null): Prompt[] | null =>
        list?.map((p) => (p.id === id ? { ...p, reacted, reactions } : p)) ??
        list;

      setNewsFeedPrompts((prev) => applyReaction(prev));
      setExplorePrompts((prev) => applyReaction(prev));
      setGlobalState((state) => ({
        cachedExplorePrompts: applyReaction(state.cachedExplorePrompts),
        cachedOOCPosts: applyReaction(state.cachedOOCPosts),
      }));
    };

    const handlePromptUpdated = (
      e: CustomEventType<PromptCommentReplyUpdatedPayload>,
    ) => {
      const { id, text } = e.detail;

      const applyText = (list: Prompt[] | null): Prompt[] | null =>
        list?.map((p) => (p.id === id ? { ...p, text } : p)) ?? list;

      setNewsFeedPrompts((prev) => applyText(prev));
      setExplorePrompts((prev) => applyText(prev));
      setGlobalState((state) => ({
        cachedExplorePrompts: applyText(state.cachedExplorePrompts),
        cachedOOCPosts: applyText(state.cachedOOCPosts),
      }));
    };

    onPromptEvent(EVENTS.PROMPT.REACTED, handlePromptReacted);
    onPromptEvent(EVENTS.PROMPT.UPDATED, handlePromptUpdated);

    return () => {
      offPromptEvent(EVENTS.PROMPT.REACTED, handlePromptReacted);
      offPromptEvent(EVENTS.PROMPT.UPDATED, handlePromptUpdated);
    };
  }, [onPromptEvent, offPromptEvent, setGlobalState]);

  useEffect(() => {
    if (authState === "LOADING") return;

    if (mode === "NEWSFEED") {
      if (newsFeedPrompts) {
        // Already hydrated from cache — clear the page loader set by navigation.
        stopPageLoading();
      } else {
        fetchNewsFeedPrompts(1);
      }
    }

    if (mode === "PROMPTS") {
      if (explorePrompts) {
        stopPageLoading();
      } else {
        fetchExplorePrompts(1);
      }
    }
  }, [
    authState,
    mode,
    newsFeedPrompts,
    explorePrompts,
    fetchNewsFeedPrompts,
    fetchExplorePrompts,
    stopPageLoading,
  ]);

  // Prepend a freshly posted prompt to the head of its feed (and the shared
  // cache, so it survives navigation) instead of reloading the whole list.
  // NOVELIST-sourced posts belong to the OOC/newsfeed; MUSE-sourced ones to
  // the explore prompts feed. Only lists that are already loaded are touched —
  // if a feed hasn't hydrated yet, its fetch will include the new post anyway.
  const handlePromptSent = useCallback(
    (prompt: Prompt) => {
      const prepend = (list: Prompt[] | null): Prompt[] | null =>
        list ? [prompt, ...list] : list;

      if (prompt.source.sourceType === "NOVELIST") {
        setNewsFeedPrompts((prev) => prepend(prev));
        setGlobalState((state) => ({
          cachedOOCPosts: prepend(state.cachedOOCPosts),
        }));
      } else {
        setExplorePrompts((prev) => prepend(prev));
        setGlobalState((state) => ({
          cachedExplorePrompts: prepend(state.cachedExplorePrompts),
        }));
      }
    },
    [setGlobalState],
  );

  const loadMore = async () => {
    if (mode !== "PROMPTS" || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    await fetchExplorePrompts(nextPage, true);

    setPage(nextPage);
    setLoadingMore(false);
  };

  const loadMoreNewsFeed = async () => {
    if (mode !== "NEWSFEED" || newsFeedLoadingMore) return;

    setNewsFeedLoadingMore(true);
    const nextPage = newsFeedPage + 1;

    await fetchNewsFeedPrompts(nextPage, true);

    setNewsFeedPage(nextPage);
    setNewsFeedLoadingMore(false);
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

      <S.ModeSwitcher>
        <S.ModeSegment
          options={EXPLORE_MODES}
          value={mode}
          onChange={setMode}
          ariaLabel="Explore mode"
        />
      </S.ModeSwitcher>

      {isMobile && authState === "LOGGED_IN" && novelist && (
        <PromptComposeTrigger
          avatarSrc={novelist.image}
          avatarAlt={novelist.username}
          avatarNwImage={novelist.avatar}
          onClick={() => setComposeOpen(true)}
        />
      )}

      {!isMobile && authState === "LOGGED_IN" && novelist && (
        <PromptInput
          type="prompt"
          dropdownSelection="ALL"
          initialSelection={novelistToSource(novelist)}
          onSend={handlePromptSent}
        />
      )}

      {authState === "LOGGED_IN" && prompts === null && (
        <S.FeedLoader>
          <AiOutlineLoading3Quarters />
        </S.FeedLoader>
      )}

      <S.PromptListContainer>
        {/* Both feeds stay mounted so each prompt's local store (including
            optimistic reactions) survives tab switches. The inactive feed is
            hidden via display:none rather than unmounted. */}
        <div
          style={{ display: mode === "NEWSFEED" ? "contents" : "none" }}
          role="tabpanel"
        >
          {newsFeedPrompts?.map((prompt) => (
            <PromptComponent key={prompt.id} prompt={prompt} />
          ))}

          <LoadMore
            hasMore={newsFeedHasMore}
            loadingMore={newsFeedLoadingMore}
            onLoadMore={loadMoreNewsFeed}
          />
        </div>

        <div
          style={{ display: mode === "PROMPTS" ? "contents" : "none" }}
          role="tabpanel"
        >
          {explorePrompts?.map((prompt) => (
            <PromptComponent key={prompt.id} prompt={prompt} />
          ))}

          <LoadMore
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
          />
        </div>

        <ScrollJumpButton direction="up" onClick={scrollToTop} />
      </S.PromptListContainer>

      <S.ComposeSheet $open={composeOpen}>
        <FullPagePromptInput
          type="prompt"
          dropdownSelection="ALL"
          initialSelection={novelist ? novelistToSource(novelist) : undefined}
          className="compose-fp-inner"
          onBack={() => setComposeOpen(false)}
          onSend={(prompt) => {
            handlePromptSent(prompt);
            setComposeOpen(false);
          }}
        />
      </S.ComposeSheet>
    </S.Container>
  );
}
