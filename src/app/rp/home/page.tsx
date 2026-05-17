"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { ActivityBox } from "@/components/activity-box";
import { ShouldRender } from "@/components/common";
import { ScrollJumpButton } from "@/components/common/scroll-jump-button";
import HomeTourGuide from "@/components/home-tour-guide";
import { LoadMore } from "@/components/load-more/page";
import MuseCard from "@/components/muse-card";
import { NovelistPreviewCard } from "@/components/novelist-preview-card";
import { Prompt as PromptComponent } from "@/components/prompt";
import { SideBarFriendListItem } from "@/components/sidebar-friend-list-item";
import VideoCard from "@/components/video-card";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import {
  FEED_PAGE_SIZES,
  getInflightFeed,
  prefetchExplorePrompts,
  prefetchHomeActivities,
  prefetchOOCPosts,
} from "@/lib/feed-prefetch";
import type {
  Muse,
  Novelist,
  NovelistWorldNotification,
  Prompt,
  StoryBoard,
} from "@/types";
import type { Activity } from "@/types/activity";
import { ROUTES } from "@/utils/constants/routes";
import { getNewPromptsAction } from "../explore-prompts/actions";
import {
  getFriendActivities,
  getMusesAction,
  getMusesWithVideosAction,
  getRandomStories,
  getStrangerNovelistsAction,
} from "./actions";
import * as S from "./styles";

const ACTIVITIES_PAGE_SIZE = FEED_PAGE_SIZES.homeActivities;
const EXPLORE_PROMPTS_PAGE_SIZE = FEED_PAGE_SIZES.explorePrompts;
const MUSES_PAGE_SIZE = 8;
const STRANGERS_PAGE_SIZE = 8;

/**
 * Discriminated feed item — lets us render activities, explore prompts and
 * OOC posts in a single list with the right component for each.
 */
type FeedItem =
  | { kind: "activity"; key: string; data: Activity }
  | { kind: "prompt"; key: string; data: Prompt }
  | { kind: "ooc"; key: string; data: Prompt };

/**
 * Mixing strategy: ROUND-ROBIN interleave of all three sources.
 *
 * Chosen because:
 *   1. It's deterministic and trivially debuggable.
 *   2. It doesn't require normalising timestamps across `Activity.date`
 *      (number) and `Prompt.createdOn` (string).
 *   3. It guarantees variety even when one source has many more items than
 *      the others — the user sees a mix immediately rather than long runs
 *      of one kind.
 *
 * Order per cycle: activity → explore prompt → OOC post.
 */
const interleaveFeed = (
  activities: Activity[],
  explorePrompts: Prompt[],
  oocPosts: Prompt[],
): FeedItem[] => {
  const out: FeedItem[] = [];
  const max = Math.max(
    activities.length,
    explorePrompts.length,
    oocPosts.length,
  );
  for (let i = 0; i < max; i++) {
    const a = activities[i];
    if (a) out.push({ data: a, key: `activity-${a.id}`, kind: "activity" });
    const p = explorePrompts[i];
    if (p) out.push({ data: p, key: `prompt-${p.id}`, kind: "prompt" });
    const o = oocPosts[i];
    if (o) out.push({ data: o, key: `ooc-${o.id}`, kind: "ooc" });
  }
  return out;
};

export default function HomePage() {
  const [startTour, setStartTour] = useState(false);
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const cachedSuggestions = useGlobalState("friendSuggestions");
  const cachedActivities = useGlobalState("cachedHomeActivities");
  const cachedExplorePrompts = useGlobalState("cachedExplorePrompts");
  const cachedOOCPosts = useGlobalState("cachedOOCPosts");
  const notifications = useGlobalState("notifications");
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage, stopPageLoading } = usePageRouter();
  const [strangers, setStrangers] = useState<Novelist[] | undefined>(
    cachedSuggestions ?? undefined,
  );
  const [storyboards, setStoryboards] = useState<StoryBoard[]>();
  const [prompts, setPrompts] = useState<Prompt[]>();
  const [unknownMuses, setUnknownMuses] = useState<Muse[]>();
  const [friendsMuses, setFriendsMuses] = useState<Muse[]>();
  const [friendsMusesWithVideos, setFriendsMusesWithVideos] =
    useState<Muse[]>();

  // ── Mixed home feed state ────────────────────────────────────────────────
  // Three independent per-source buffers + per-source page counters so we can
  // paginate each independently. The rendered list is `mixedFeed`, derived
  // by round-robin interleaving (see `interleaveFeed`).
  // We snapshot from the global cache on mount so background polling can't
  // disrupt the visible feed (requirement #6 — updates land on next nav).
  const [feedActivities, setFeedActivities] = useState<Activity[]>(
    () => cachedActivities ?? [],
  );
  const [feedExplorePrompts, setFeedExplorePrompts] = useState<Prompt[]>(
    () => cachedExplorePrompts ?? [],
  );
  const [feedOOCPosts, setFeedOOCPosts] = useState<Prompt[]>(
    () => cachedOOCPosts ?? [],
  );
  // IDs of prompts fetched on the first page — activities whose target.id
  // matches one of these are hidden from the feed to avoid duplicates.
  const [firstPagePromptIds, setFirstPagePromptIds] = useState<Set<string>>(
    () =>
      new Set([
        ...(cachedExplorePrompts?.map((p) => p.id) ?? []),
        ...(cachedOOCPosts?.map((p) => p.id) ?? []),
      ]),
  );
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [explorePromptsPage, setExplorePromptsPage] = useState(1);
  const [activitiesHasMore, setActivitiesHasMore] = useState(true);
  const [explorePromptsHasMore, setExplorePromptsHasMore] = useState(true);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  // Derived list for rendering — activities whose target matches a first-page
  // prompt ID are filtered out to avoid showing duplicate content.
  const mixedFeed = useMemo(
    () =>
      interleaveFeed(
        feedActivities.filter((a) => !firstPagePromptIds.has(a.target.id)),
        feedExplorePrompts,
        feedOOCPosts,
      ),
    [feedActivities, feedExplorePrompts, feedOOCPosts, firstPagePromptIds],
  );
  const feedHasMore = activitiesHasMore || explorePromptsHasMore;
  // True on first visit (no cache) — the activity container shows shimmers
  // until all three feed sources have completed their initial hydration.
  const [feedInitializing, setFeedInitializing] = useState(
    !cachedActivities && !cachedExplorePrompts && !cachedOOCPosts,
  );

  const [friendsMusesPage, setFriendsMusesPage] = useState(1);
  const [friendsMusesHasMore, setFriendsMusesHasMore] = useState(false);
  const [friendsMusesLoading, setFriendsMusesLoading] = useState(false);

  const [strangersPage, setStrangersPage] = useState(1);
  const [strangersHasMore, setStrangersHasMore] = useState(false);
  const [strangersLoading, setStrangersLoading] = useState(false);

  const [unknownMusesPage, setUnknownMusesPage] = useState(1);
  const [unknownMusesHasMore, setUnknownMusesHasMore] = useState(false);
  const [unknownMusesLoading, setUnknownMusesLoading] = useState(false);

  const rightWrapRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    rightWrapRef.current?.scrollTo({ behavior: "smooth", top: 0 });
  };

  // Derive NovelistPreview-shaped cards from FRIEND_REQUEST notifications.
  // connection = "FRIEND_REQUEST_RECEIVED" makes the card show Accept/Decline.
  const friendRequestCards = useMemo(() => {
    if (!notifications) return [];
    return notifications
      .filter((n: NovelistWorldNotification) => n.type === "FRIEND_REQUEST")
      .map((n: NovelistWorldNotification) => {
        const nameParts = (n.source.title ?? "").trim().split(" ");
        return {
          connection: "FRIEND_REQUEST_RECEIVED" as const,
          firstName: nameParts[0] ?? "",
          id: n.source.id,
          image: n.source.image,
          isVerified: false,
          lastName: nameParts.slice(1).join(" ") || null,
          username: n.source.urlProp,
        };
      });
  }, [notifications]);

  const handleStartTour = () => {
    setStartTour(true);
  };

  const handleEndTour = () => {
    setStartTour(false);
  };

  const fetchStrangers = async (page = 1, append = false) => {
    if (page === 1 && cachedSuggestions) {
      setStrangersHasMore(cachedSuggestions.length === STRANGERS_PAGE_SIZE);
      return;
    }
    const _strangers = await getStrangerNovelistsAction(
      page,
      STRANGERS_PAGE_SIZE,
    );
    if (_strangers && !("message" in _strangers)) {
      setStrangers((prev) =>
        append ? [...(prev ?? []), ..._strangers] : _strangers,
      );
      setStrangersHasMore(_strangers.length === STRANGERS_PAGE_SIZE);
      if (page === 1) setGlobalState({ friendSuggestions: _strangers });
    } else {
      setStrangersHasMore(false);
    }
  };

  const fetchStrangerMuses = async (page = 1, append = false) => {
    const _muses = await getMusesAction(page, MUSES_PAGE_SIZE, "unknown");
    if (_muses && !("message" in _muses)) {
      setUnknownMuses((prev) =>
        append ? [...(prev ?? []), ..._muses] : _muses,
      );
      setUnknownMusesHasMore(_muses.length === MUSES_PAGE_SIZE);
    } else {
      setUnknownMusesHasMore(false);
    }
  };

  const fetchFriendsMuses = async (page = 1, append = false) => {
    const _muses = await getMusesAction(page, MUSES_PAGE_SIZE, "friends");
    if (_muses && !("message" in _muses)) {
      setFriendsMuses((prev) =>
        append ? [...(prev ?? []), ..._muses] : _muses,
      );
      setFriendsMusesHasMore(_muses.length === MUSES_PAGE_SIZE);
    } else {
      setFriendsMusesHasMore(false);
    }
  };

  const fetchFriendsMusesWithVideos = async () => {
    const _muses = await getMusesWithVideosAction(1, 20, "friends");
    if (_muses && !("message" in _muses)) setFriendsMusesWithVideos(_muses);
  };

  // ── Mixed feed hydration ─────────────────────────────────────────────────
  // Hydrate page 1 of each source. Prefer cache → in-flight prefetch → fresh
  // fetch. This dedupes against the login-triggered `prefetchAllFeeds`.

  const hydrateActivities = useCallback(async () => {
    if (feedActivities.length > 0) return;
    if (cachedActivities) {
      setFeedActivities(cachedActivities);
      setActivitiesHasMore(cachedActivities.length === ACTIVITIES_PAGE_SIZE);
      return;
    }
    const inflight = getInflightFeed<Activity[] | null>("homeActivities");
    const result = await (inflight ?? prefetchHomeActivities(setGlobalState));
    if (result) {
      setFeedActivities(result);
      setActivitiesHasMore(result.length === ACTIVITIES_PAGE_SIZE);
    } else {
      setActivitiesHasMore(false);
    }
  }, [feedActivities.length, cachedActivities, setGlobalState]);

  const hydrateExplorePrompts = useCallback(async () => {
    if (feedExplorePrompts.length > 0) return;
    if (cachedExplorePrompts) {
      setFeedExplorePrompts(cachedExplorePrompts);
      setExplorePromptsHasMore(
        cachedExplorePrompts.length === EXPLORE_PROMPTS_PAGE_SIZE,
      );
      setFirstPagePromptIds((prev) => {
        const next = new Set(prev);
        cachedExplorePrompts.forEach((p) => next.add(p.id));
        return next;
      });
      return;
    }
    const inflight = getInflightFeed<Prompt[] | null>("explorePrompts");
    const result = await (inflight ?? prefetchExplorePrompts(setGlobalState));
    if (result) {
      setFeedExplorePrompts(result);
      setExplorePromptsHasMore(result.length === EXPLORE_PROMPTS_PAGE_SIZE);
      setFirstPagePromptIds((prev) => {
        const next = new Set(prev);
        result.forEach((p) => next.add(p.id));
        return next;
      });
    } else {
      setExplorePromptsHasMore(false);
    }
  }, [feedExplorePrompts.length, cachedExplorePrompts, setGlobalState]);

  const hydrateOOCPosts = useCallback(async () => {
    if (feedOOCPosts.length > 0) return;
    if (cachedOOCPosts) {
      setFeedOOCPosts(cachedOOCPosts);
      setFirstPagePromptIds((prev) => {
        const next = new Set(prev);
        cachedOOCPosts.forEach((p) => next.add(p.id));
        return next;
      });
      return;
    }
    const inflight = getInflightFeed<Prompt[] | null>("oocPosts");
    const result = await (inflight ?? prefetchOOCPosts(setGlobalState));
    if (result) {
      setFeedOOCPosts(result);
      setFirstPagePromptIds((prev) => {
        const next = new Set(prev);
        result.forEach((p) => next.add(p.id));
        return next;
      });
    }
    // OOC posts are unpaginated → no `hasMore` flag.
  }, [feedOOCPosts.length, cachedOOCPosts, setGlobalState]);

  /**
   * Load more: fetch next page of each paginated source in parallel and
   * append. OOC posts are unpaginated so we skip them here.
   */
  const loadMoreFeed = async () => {
    if (feedLoadingMore || !feedHasMore) return;
    setFeedLoadingMore(true);
    const nextActivitiesPage = activitiesPage + 1;
    const nextExplorePromptsPage = explorePromptsPage + 1;
    const [moreActivities, moreExplorePrompts] = await Promise.all([
      activitiesHasMore
        ? getFriendActivities(
            nextActivitiesPage,
            ACTIVITIES_PAGE_SIZE,
            "friends",
          )
        : Promise.resolve(null),
      explorePromptsHasMore
        ? getNewPromptsAction(nextExplorePromptsPage, EXPLORE_PROMPTS_PAGE_SIZE)
        : Promise.resolve(null),
    ]);
    if (moreActivities && !("message" in moreActivities)) {
      setFeedActivities((prev) => [...prev, ...moreActivities]);
      setActivitiesHasMore(moreActivities.length === ACTIVITIES_PAGE_SIZE);
      setActivitiesPage(nextActivitiesPage);
    } else if (activitiesHasMore) {
      setActivitiesHasMore(false);
    }
    if (moreExplorePrompts && !("message" in moreExplorePrompts)) {
      setFeedExplorePrompts((prev) => [...prev, ...moreExplorePrompts]);
      setExplorePromptsHasMore(
        moreExplorePrompts.length === EXPLORE_PROMPTS_PAGE_SIZE,
      );
      setExplorePromptsPage(nextExplorePromptsPage);
    } else if (explorePromptsHasMore) {
      setExplorePromptsHasMore(false);
    }
    setFeedLoadingMore(false);
  };

  const loadNextFriendsMuses = async () => {
    setFriendsMusesLoading(true);
    const nextPage = friendsMusesPage + 1;
    await fetchFriendsMuses(nextPage, true);
    setFriendsMusesPage(nextPage);
    setFriendsMusesLoading(false);
  };

  const loadNextStrangers = async () => {
    setStrangersLoading(true);
    const nextPage = strangersPage + 1;
    await fetchStrangers(nextPage, true);
    setStrangersPage(nextPage);
    setStrangersLoading(false);
  };

  const loadNextUnknownMuses = async () => {
    setUnknownMusesLoading(true);
    const nextPage = unknownMusesPage + 1;
    await fetchStrangerMuses(nextPage, true);
    setUnknownMusesPage(nextPage);
    setUnknownMusesLoading(false);
  };

  useEffect(() => {
    if (authState === "LOADING") return;

    // Stop the page-level loader once the carousel sections are ready.
    // The activity feed loads independently below with its own skeleton UI.
    Promise.all([
      fetchStrangers(),
      fetchStrangerMuses(),
      fetchFriendsMuses(),
    ]).then(() => stopPageLoading());

    // Hydrate all three feed sources in parallel; hide the feed skeleton when done.
    Promise.all([
      hydrateActivities(),
      hydrateExplorePrompts(),
      hydrateOOCPosts(),
    ]).then(() => setFeedInitializing(false));
  }, [authState, hydrateActivities, hydrateExplorePrompts, hydrateOOCPosts]);

  return (
    <S.PageContainer>
      {/* <ShouldRender if={!startTour}>
        <S.Button onClick={handleStartTour}>Start Tour</S.Button>
      </ShouldRender>
      {startTour && (
        <HomeTourGuide
          start={startTour}
          setStartTour={setStartTour}
          onTourEnd={handleEndTour}
        />
      )} */}
      <S.ParentWrapperContainer>
        <S.LeftWrapperContainer>
          <S.ContentContainer className="friends-container">
            <S.SubText>Friends</S.SubText>
            <S.ListContainer id="home-tour-step-1">
              <ShouldRender
                if={friendsMuses === undefined || friendsMuses.length === 0}
              >
                <S.SubText></S.SubText>
                <S.SubText></S.SubText>
                <S.SubText>Add friends? Maybe...</S.SubText>
              </ShouldRender>
              <S.AddFriendButton
                onClick={() => routeToPage(ROUTES.Fellows)}
                title="Find novelists to connect with"
                aria-label="Find novelists"
              >
                <FiSearch size={18} />
              </S.AddFriendButton>
              {novelist?.friends.map((friend) => (
                <SideBarFriendListItem
                  key={friend?.username}
                  novelist={friend}
                  isRequest={false}
                />
              ))}
            </S.ListContainer>
          </S.ContentContainer>
        </S.LeftWrapperContainer>
        <S.RightWrapperContainer ref={rightWrapRef}>
          {/* <S.ContentContainer>
          <S.SubText>Videos by your friends</S.SubText>
          <S.PartitionContainer>
            {friendsMusesWithVideos?.map((friendMuseWithVideo) => (
              <VideoCard
                key={friendMuseWithVideo?.id}
                muse={friendMuseWithVideo}
              ></VideoCard>
            ))}
          </S.PartitionContainer>
        </S.ContentContainer> */}
          {/* <S.ContentContainer>
            <S.SubText>Dive into the Stories</S.SubText>
            <S.PartitionContainer>
              {storyboards?.map((storyBoard) => (
                <StoryCard
                  key={storyBoard?.id}
                  storyBoard={storyBoard}
                ></StoryCard>
              ))}
            </S.PartitionContainer>
          </S.ContentContainer> */}
          <ShouldRender
            if={friendsMuses !== undefined && friendsMuses.length > 0}
          >
            <S.ContentContainer id="home-tour-step-2">
              <S.SubText>characters by your friends</S.SubText>
              <S.PartitionContainer>
                {friendsMuses?.map((knownMuse) => (
                  <MuseCard key={knownMuse?.id} muse={knownMuse}></MuseCard>
                ))}
                {friendsMusesHasMore && (
                  <S.NextPageCard
                    onClick={loadNextFriendsMuses}
                    disabled={friendsMusesLoading}
                    title="Load more characters"
                  >
                    <FaChevronRight size={24} />
                    <span>More</span>
                  </S.NextPageCard>
                )}
              </S.PartitionContainer>
            </S.ContentContainer>
          </ShouldRender>
          <S.ContentContainer id="home-tour-step-3">
            <S.SubText>Friend Suggestions</S.SubText>
            <S.PartitionContainer>
              {friendRequestCards.map((card) => (
                <NovelistPreviewCard key={card.username} novelist={card} />
              ))}
              {strangers?.map((stranger) => (
                <NovelistPreviewCard
                  key={stranger?.username}
                  novelist={stranger}
                ></NovelistPreviewCard>
              ))}
              {strangersHasMore && (
                <S.NextPageNovelistCard
                  onClick={loadNextStrangers}
                  disabled={strangersLoading}
                  title="Load more suggestions"
                >
                  <FaChevronRight size={24} />
                  <span>More</span>
                </S.NextPageNovelistCard>
              )}
            </S.PartitionContainer>
          </S.ContentContainer>
          <S.ContentContainer id="home-tour-step-4">
            <S.SubText>Public Characters out there</S.SubText>
            <S.PartitionContainer>
              {unknownMuses?.map((unknownMuse) => (
                <MuseCard key={unknownMuse?.id} muse={unknownMuse}></MuseCard>
              ))}
              {unknownMusesHasMore && (
                <S.NextPageCard
                  onClick={loadNextUnknownMuses}
                  disabled={unknownMusesLoading}
                  title="Load more characters"
                >
                  <FaChevronRight size={24} />
                  <span>More</span>
                </S.NextPageCard>
              )}
            </S.PartitionContainer>
          </S.ContentContainer>
          {/* <S.ContentContainer>
          <S.SubText>Interactions</S.SubText>
          {prompts?.map((prompt) => (
            <PromptComponent key={prompt.id} prompt={prompt} />
          ))}
        </S.ContentContainer> */}
          <S.ActivityContainer>
            <S.SubText id="home-tour-step-5">
              Updates from your friends
            </S.SubText>
            {feedInitializing ? (
              <S.FeedShimmerList>
                {[0, 1, 2, 3, 4].map((i) => (
                  <S.FeedShimmerItem key={i}>
                    <S.ShimmerRow>
                      <S.ShimmerAvatar />
                      <S.ShimmerLines>
                        <S.ShimmerLine $width="48%" $height="13px" />
                        <S.ShimmerLine $width="72%" $height="11px" />
                      </S.ShimmerLines>
                    </S.ShimmerRow>
                    <S.ShimmerBlock $height={i % 2 === 0 ? "110px" : "64px"} />
                    <S.ShimmerLine $width="38%" $height="11px" />
                  </S.FeedShimmerItem>
                ))}
              </S.FeedShimmerList>
            ) : (
              <>
                {mixedFeed.map((item) => {
                  if (item.kind === "activity") {
                    return <ActivityBox key={item.key} activity={item.data} />;
                  }
                  return (
                    <PromptComponent
                      key={item.key}
                      prompt={item.data}
                      $noBorder
                    />
                  );
                })}
                <LoadMore
                  hasMore={feedHasMore}
                  loadingMore={feedLoadingMore}
                  onLoadMore={loadMoreFeed}
                />
              </>
            )}
          </S.ActivityContainer>
          <ScrollJumpButton direction="up" onClick={scrollToTop} />
        </S.RightWrapperContainer>
      </S.ParentWrapperContainer>
    </S.PageContainer>
  );
}
