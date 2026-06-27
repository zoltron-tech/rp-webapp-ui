"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { ActivityBox } from "@/components/activity-box";
import { ScrollJumpButton } from "@/components/common/scroll-jump-button";
import HomeTourGuide from "@/components/home-tour-guide";
import { LoadMore } from "@/components/load-more/page";
import { MusePreviewCard } from "@/components/muse-preview-card";
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
  // Rendered list — built once after all three sources are ready and appended
  // to on load-more. Positions are stable because we never re-interleave
  // existing items; only new pages are appended to the end.
  const [mixedFeed, setMixedFeed] = useState<FeedItem[]>([]);
  const feedHasMore = activitiesHasMore || explorePromptsHasMore;
  // Always true on mount: OOC posts are fetched fresh every visit, so we
  // always wait for all three sources before rendering the feed.
  const [feedInitializing, setFeedInitializing] = useState(true);
  // Prevents rebuilding the initial mixedFeed if the effect re-runs.
  const feedBuiltRef = useRef(false);
  // Prevents re-firing the carousel fetches if the effect dep array changes.
  const carouselFetchedRef = useRef(false);

  const [friendsMusesPage, setFriendsMusesPage] = useState(1);
  const [friendsMusesHasMore, setFriendsMusesHasMore] = useState(false);
  const [friendsMusesLoading, setFriendsMusesLoading] = useState(false);

  const [strangersPage, setStrangersPage] = useState(1);
  const [strangersHasMore, setStrangersHasMore] = useState(false);
  const [strangersLoading, setStrangersLoading] = useState(false);

  const [unknownMusesPage, setUnknownMusesPage] = useState(1);
  const [unknownMusesHasMore, setUnknownMusesHasMore] = useState(false);
  const [unknownMusesLoading, setUnknownMusesLoading] = useState(false);

  // Per-section initial-load flags — each section shows its own shimmer
  // while waiting for its first page of data, independently of the others.
  const [strangersInitialLoading, setStrangersInitialLoading] = useState(
    !cachedSuggestions,
  );
  const [unknownMusesInitialLoading, setUnknownMusesInitialLoading] =
    useState(true);
  const [friendsMusesInitialLoading, setFriendsMusesInitialLoading] =
    useState(true);

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
    try {
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
    } finally {
      if (page === 1) setStrangersInitialLoading(false);
    }
  };

  const fetchStrangerMuses = async (page = 1, append = false) => {
    try {
      const _muses = await getMusesAction(page, MUSES_PAGE_SIZE, "unknown");
      if (_muses && !("message" in _muses)) {
        setUnknownMuses((prev) =>
          append ? [...(prev ?? []), ..._muses] : _muses,
        );
        setUnknownMusesHasMore(_muses.length === MUSES_PAGE_SIZE);
      } else {
        setUnknownMusesHasMore(false);
      }
    } finally {
      if (page === 1) setUnknownMusesInitialLoading(false);
    }
  };

  const fetchFriendsMuses = async (page = 1, append = false) => {
    try {
      const _muses = await getMusesAction(page, MUSES_PAGE_SIZE, "friends");
      if (_muses && !("message" in _muses)) {
        setFriendsMuses((prev) =>
          append ? [...(prev ?? []), ..._muses] : _muses,
        );
        setFriendsMusesHasMore(_muses.length === MUSES_PAGE_SIZE);
      } else {
        setFriendsMusesHasMore(false);
      }
    } finally {
      if (page === 1) setFriendsMusesInitialLoading(false);
    }
  };

  const fetchFriendsMusesWithVideos = async () => {
    const _muses = await getMusesWithVideosAction(1, 20, "friends");
    if (_muses && !("message" in _muses)) setFriendsMusesWithVideos(_muses);
  };

  // ── Mixed feed hydration ─────────────────────────────────────────────────
  // Hydrate page 1 of each source. Prefer cache → in-flight prefetch → fresh
  // fetch. This dedupes against the login-triggered `prefetchAllFeeds`.

  const hydrateActivities = useCallback(async (): Promise<Activity[]> => {
    if (feedActivities.length > 0) return feedActivities;
    if (cachedActivities) {
      setFeedActivities(cachedActivities);
      setActivitiesHasMore(cachedActivities.length === ACTIVITIES_PAGE_SIZE);
      return cachedActivities;
    }
    const inflight = getInflightFeed<Activity[] | null>("homeActivities");
    const result = await (inflight ?? prefetchHomeActivities(setGlobalState));
    if (result) {
      setFeedActivities(result);
      setActivitiesHasMore(result.length === ACTIVITIES_PAGE_SIZE);
      return result;
    }
    setActivitiesHasMore(false);
    return [];
  }, [feedActivities.length, cachedActivities, setGlobalState]);

  const hydrateExplorePrompts = useCallback(async (): Promise<Prompt[]> => {
    if (feedExplorePrompts.length > 0) return feedExplorePrompts;
    if (cachedExplorePrompts) {
      setFeedExplorePrompts(cachedExplorePrompts);
      setExplorePromptsHasMore(
        cachedExplorePrompts.length === EXPLORE_PROMPTS_PAGE_SIZE,
      );
      return cachedExplorePrompts;
    }
    const inflight = getInflightFeed<Prompt[] | null>("explorePrompts");
    const result = await (inflight ?? prefetchExplorePrompts(setGlobalState));
    if (result) {
      setFeedExplorePrompts(result);
      setExplorePromptsHasMore(result.length === EXPLORE_PROMPTS_PAGE_SIZE);
      return result;
    }
    setExplorePromptsHasMore(false);
    return [];
  }, [feedExplorePrompts.length, cachedExplorePrompts, setGlobalState]);

  const hydrateOOCPosts = useCallback(async (): Promise<Prompt[]> => {
    if (feedOOCPosts.length > 0) return feedOOCPosts;
    if (cachedOOCPosts) {
      setFeedOOCPosts(cachedOOCPosts);
      return cachedOOCPosts;
    }
    const inflight = getInflightFeed<Prompt[] | null>("oocPosts");
    const result = await (inflight ?? prefetchOOCPosts(setGlobalState));
    if (result) {
      setFeedOOCPosts(result);
      return result;
    }
    return [];
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
    const newActivities =
      moreActivities && !("message" in moreActivities) ? moreActivities : [];
    const newPrompts =
      moreExplorePrompts && !("message" in moreExplorePrompts)
        ? moreExplorePrompts
        : [];

    if (newActivities.length > 0) {
      setActivitiesHasMore(newActivities.length === ACTIVITIES_PAGE_SIZE);
      setActivitiesPage(nextActivitiesPage);
    } else if (activitiesHasMore) {
      setActivitiesHasMore(false);
    }
    if (newPrompts.length > 0) {
      setExplorePromptsHasMore(newPrompts.length === EXPLORE_PROMPTS_PAGE_SIZE);
      setExplorePromptsPage(nextExplorePromptsPage);
    } else if (explorePromptsHasMore) {
      setExplorePromptsHasMore(false);
    }

    // Interleave ONLY the new-page items and append to the stable list.
    // OOC posts are unpaginated so they don't grow on load-more.
    const newItems = interleaveFeed(
      newActivities.filter((a) => !firstPagePromptIds.has(a.target.id)),
      newPrompts,
      [],
    );
    if (newItems.length > 0) {
      setMixedFeed((prev) => [...prev, ...newItems]);
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
    // Only proceed once the user is fully authenticated. Guarding strictly on
    // "LOGGED_IN" prevents a premature run during the initial "LOGGED_OUT"
    // render (before AuthProvider starts its check) from locking feedBuiltRef
    // and carouselFetchedRef before real data can be fetched.
    if (authState !== "LOGGED_IN") return;

    // Fire each carousel section independently so they populate as soon as
    // their own data arrives — not gated on the slowest sibling.
    // The ref prevents re-fetching if the effect re-runs due to dep changes.
    if (!carouselFetchedRef.current) {
      carouselFetchedRef.current = true;
      fetchStrangers();
      fetchStrangerMuses();
      fetchFriendsMuses();
      // Page-level loader can stop immediately — each section now has its
      // own shimmer that clears when its data arrives.
      stopPageLoading();
    }

    // Hydrate all three feed sources in parallel; build the feed once from the
    // returned data so positions are stable and firstPagePromptIds is accurate.
    //
    // feedBuiltRef is set synchronously (before any await) so that concurrent
    // re-runs of this effect — triggered when hydrateActivities or
    // hydrateExplorePrompts are recreated after their cache deps update —
    // cannot start a second parallel chain while the first is still in flight.
    if (!feedBuiltRef.current) {
      feedBuiltRef.current = true;
      Promise.all([
        hydrateActivities(),
        hydrateExplorePrompts(),
        hydrateOOCPosts(),
      ])
        .then(([activities, explorePrompts, oocPosts]) => {
          const promptIds = new Set([
            ...explorePrompts.map((p) => p.id),
            ...oocPosts.map((p) => p.id),
          ]);
          setFirstPagePromptIds(promptIds);
          setMixedFeed(
            interleaveFeed(
              activities.filter((a) => !promptIds.has(a.target.id)),
              explorePrompts,
              oocPosts,
            ),
          );
          setFeedInitializing(false);
        })
        .catch(() => {
          setFeedInitializing(false);
        });
    }
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
              <S.AddFriendButton
                onClick={() => routeToPage(ROUTES.Fellows)}
                title="Find novelists to connect with"
                aria-label="Find novelists"
              >
                <FiSearch size={18} />
              </S.AddFriendButton>
              {novelist === null ? (
                <S.SidebarShimmerList>
                  {[0, 1, 2, 3].map((i) => (
                    <S.SidebarShimmerItem key={i}>
                      <S.SidebarShimmerAvatar />
                      <S.SidebarShimmerName />
                    </S.SidebarShimmerItem>
                  ))}
                </S.SidebarShimmerList>
              ) : novelist.friends.length > 0 ? (
                novelist.friends.map((friend) => (
                  <SideBarFriendListItem
                    key={friend?.username}
                    novelist={friend}
                    isRequest={false}
                  />
                ))
              ) : (
                <>
                  <S.SubText></S.SubText>
                  <S.SubText></S.SubText>
                  <S.SubText>Add friends? Maybe...</S.SubText>
                </>
              )}
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
          {(friendsMusesInitialLoading ||
            (friendsMuses !== undefined && friendsMuses.length > 0)) && (
            <S.ContentContainer id="home-tour-step-2">
              <S.SubText>characters by your friends</S.SubText>
              <S.PartitionContainer>
                {friendsMusesInitialLoading ? (
                  [0, 1, 2, 3, 4].map((i) => <S.MuseCardShimmer key={i} />)
                ) : (
                  <>
                    {friendsMuses!.map((knownMuse) => (
                      <MusePreviewCard key={knownMuse?.id} muse={knownMuse} />
                    ))}
                    {friendsMusesHasMore && (
                      <S.NextPageCard
                        onClick={loadNextFriendsMuses}
                        disabled={friendsMusesLoading}
                        title="Load more characters"
                      >
                        {friendsMusesLoading ? (
                          <S.SpinnerRing />
                        ) : (
                          <>
                            <FaChevronRight size={24} />
                            <span>More</span>
                          </>
                        )}
                      </S.NextPageCard>
                    )}
                  </>
                )}
              </S.PartitionContainer>
            </S.ContentContainer>
          )}
          <S.ContentContainer id="home-tour-step-3">
            <S.SubText>Friend Suggestions</S.SubText>
            <S.PartitionContainer>
              {strangersInitialLoading ? (
                [0, 1, 2, 3].map((i) => <S.NovelistCardShimmer key={i} />)
              ) : (
                <>
                  {friendRequestCards.map((card) => (
                    <NovelistPreviewCard key={card.username} novelist={card} />
                  ))}
                  {strangers?.map((stranger) => (
                    <NovelistPreviewCard
                      key={stranger?.username}
                      novelist={stranger}
                    />
                  ))}
                  {strangersHasMore && (
                    <S.NextPageNovelistCard
                      onClick={loadNextStrangers}
                      disabled={strangersLoading}
                      title="Load more suggestions"
                    >
                      {strangersLoading ? (
                        <S.SpinnerRing />
                      ) : (
                        <>
                          <FaChevronRight size={24} />
                          <span>More</span>
                        </>
                      )}
                    </S.NextPageNovelistCard>
                  )}
                </>
              )}
            </S.PartitionContainer>
          </S.ContentContainer>
          <S.ContentContainer id="home-tour-step-4">
            <S.SubText>Public Characters out there</S.SubText>
            <S.PartitionContainer>
              {unknownMusesInitialLoading ? (
                [0, 1, 2, 3, 4].map((i) => <S.MuseCardShimmer key={i} />)
              ) : (
                <>
                  {unknownMuses?.map((unknownMuse) => (
                    <MusePreviewCard key={unknownMuse?.id} muse={unknownMuse} />
                  ))}
                  {unknownMusesHasMore && (
                    <S.NextPageCard
                      onClick={loadNextUnknownMuses}
                      disabled={unknownMusesLoading}
                      title="Load more characters"
                    >
                      {unknownMusesLoading ? (
                        <S.SpinnerRing />
                      ) : (
                        <>
                          <FaChevronRight size={24} />
                          <span>More</span>
                        </>
                      )}
                    </S.NextPageCard>
                  )}
                </>
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
