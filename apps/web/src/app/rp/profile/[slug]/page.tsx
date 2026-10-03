"use client";

import { Flex } from "@novelist-world/ui";
import type { Fandom, Novelist, NWImage, Prompt, StoryBoard } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import type { ProfileSong } from "@nw/types/music";
import { ACCENT_MAP, type Accent } from "@nw/types/theme";
import classNames from "classnames";
import { Tooltip } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiHide } from "react-icons/bi";
import { BsPersonFillCheck, BsPersonFillUp, BsThreeDots } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import {
  FcAnswers,
  FcBusinessContact,
  FcCalendar,
  FcComments,
  FcConferenceCall,
  FcPortraitMode,
  FcReading,
  FcShare,
  FcTreeStructure,
} from "react-icons/fc";
import { GiCheckMark, GiCrossMark } from "react-icons/gi";
import { GoChevronRight } from "react-icons/go";
import { IoIosBookmarks, IoMdPersonAdd } from "react-icons/io";
import { IoPersonRemove, IoPulse } from "react-icons/io5";
import {
  MdOutlineAppBlocking,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RiFlagFill } from "react-icons/ri";
import { SiGhostery } from "react-icons/si";
import {
  getNoteEmojiRotate,
  NoteEmojiIcon,
} from "@/app/rp/profile/edit/note-emoji-set";
import { getProfileSongAction } from "@/app/rp/profile/edit/profile-song.actions";
import { ContactSupportForm } from "@/components";
import ActivityBox from "@/components/activity-box";
import { BadgeRow } from "@/components/badges";
import { OpenBookArt } from "@/components/book-art";
import {
  EmailVerifiedBadge,
  ShouldRender,
  Username,
} from "@/components/common";
import { AdminBadge } from "@/components/common/admin-badge";
import { useIsOnline } from "@/components/common/avatar-new";
import { NovelistAvatar } from "@/components/common/novelist-avatar";
import type { SegmentedTabOption } from "@/components/common/segmented-tabs";
import { AppAlertDialog } from "@/components/dialog";
import { ErrorBox } from "@/components/error-box";
import { novelistToSource } from "@/components/event-thread-input/helpers";
import { Image } from "@/components/image-viewer/styled";
import { LoadMore } from "@/components/load-more/page";
import { MiniProfileCard } from "@/components/mini-profile-card";
import MuseListItem from "@/components/muse-list-item";
import { AppDropdownMenuResponsive } from "@/components/profile-more-dropdown";
import { ProfileSongPlayer } from "@/components/profile-song";
import { Prompt as PromptComponent } from "@/components/prompt";
import { PromptComposeTrigger } from "@/components/prompt-compose-trigger";
import PromptInput from "@/components/prompt-input";
import { FullPagePromptInput } from "@/components/prompt-input/full-page-prompt-input";
import { AboutRichText } from "@/components/rich-text-editor-input/about-rich-text";
import { ShareProfileDialog } from "@/components/share-profile-dialog";
import StoryCard from "@/components/story-card";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { useParams } from "@/lib/navigation";
import { ScoreBadgeIcon } from "@/utils/badge-icons";
import { API_MESSAGE, SUPPORT_EMAIL } from "@/utils/constants";
import { usernameFromHandle } from "@/utils/constants/profile-handle";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import { mainVerseMuses } from "@/utils/muse";
import { isRichTextEmpty } from "@/utils/rich-text";
import { getConversationByUsernameAction } from "../../conversations/actions";
import { getUserActivities } from "../../home/actions";
import * as HomeS from "../../home/styles";
import { getNovelistAction } from "../../novelists/actions";
import { getAllStoryboardsByUsernameAction } from "../../story/actions";
import {
  acceptFriendRequest,
  blacklistUser,
  blockUser,
  cancelFriendRequest,
  deleteFriendRequest,
  reportProfile,
  sendFeedbackMessage,
  sendFriendRequest,
  unfriendNovelist,
} from "../actions";
import {
  getPostsByNovelistAction,
  getPromptsByNovelistAction,
} from "./posts/actions";
import * as S from "./styles";

/** Fandom chips shown before the "See all" toggle expands the row. */
const COLLAPSED_FANDOM_COUNT = 2;
const FANDOMLESS_ID = "FANDOMLESS";

/** The fandomless bucket's stored name is a full sentence — too long for a
 *  chip, so it gets a short label here. */
const fandomChipLabel = (fandom: Fandom) =>
  fandom.id === FANDOMLESS_ID ? "Fandomless" : fandom.name;

const POST_PAGE_SIZE = 20;
const ACTIVITY_PAGE_SIZE = 10;

function FeedShimmer() {
  return (
    <HomeS.FeedShimmerList style={{ alignSelf: "center", width: "95%" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <HomeS.FeedShimmerItem key={i}>
          <HomeS.ShimmerRow>
            <HomeS.ShimmerAvatar />
            <HomeS.ShimmerLines>
              <HomeS.ShimmerLine $width="48%" $height="13px" />
              <HomeS.ShimmerLine $width="72%" $height="11px" />
            </HomeS.ShimmerLines>
          </HomeS.ShimmerRow>
          <HomeS.ShimmerBlock $height={i % 2 === 0 ? "110px" : "64px"} />
          <HomeS.ShimmerLine $width="38%" $height="11px" />
        </HomeS.FeedShimmerItem>
      ))}
    </HomeS.FeedShimmerList>
  );
}

function EmptyFeed({
  tab,
  username,
}: {
  tab: "activities" | "posts" | "prompts";
  username: string;
}) {
  return (
    <S.EmptyFeedContainer>
      <OpenBookArt />
      <S.EmptyFeedTitle>
        {tab === "activities"
          ? "No recent activity"
          : tab === "prompts"
            ? "No prompts yet"
            : "No posts yet"}
      </S.EmptyFeedTitle>
      <S.EmptyFeedSubtitle>
        {tab === "activities"
          ? `${username}'s story is still unfolding. Check back soon.`
          : tab === "prompts"
            ? `${username}'s characters haven't posted any prompts yet.`
            : `${username} hasn't shared any posts yet. Their tale is yet to be written.`}
      </S.EmptyFeedSubtitle>
    </S.EmptyFeedContainer>
  );
}

function FriendAvatarItem({
  friend,
}: {
  friend: {
    id: string;
    image: string;
    username: string;
    avatar?: NWImage | null;
  };
}) {
  const isOnline = useIsOnline(friend.username);
  return (
    <span className={friend.username && !isOnline ? "with-outline" : undefined}>
      <NovelistAvatar
        image={friend.image}
        name={friend.username}
        username={friend.username}
        avatar={friend.avatar}
      />
    </span>
  );
}

type FeedTabKey = "activities" | "posts" | "prompts";

// Posts are the novelist's own (OOC) updates, so they share Explore's icons.
const FEED_TABS: SegmentedTabOption<FeedTabKey>[] = [
  {
    icon: <IoPulse aria-hidden="true" />,
    label: "Activities",
    value: "activities",
  },
  { icon: <SiGhostery aria-hidden="true" />, label: "Posts", value: "posts" },
  {
    icon: <IoIosBookmarks aria-hidden="true" />,
    label: "Prompts",
    value: "prompts",
  },
];

const useGetActivities = (username: string) => {
  const [activities, setActivities] = useState<Activity[]>();
  const [error, setError] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { stopPageLoading, baseDataLoader } = usePageRouter();

  const fetchActivities = useCallback(async () => {
    const _activities =
      (await baseDataLoader(() =>
        getUserActivities(username, 1, ACTIVITY_PAGE_SIZE),
      )) ?? [];

    if (_activities && "message" in _activities) {
      stopPageLoading();
      setError(true);
      return;
    }
    stopPageLoading();
    setActivities(_activities);
    setHasMore(_activities.length >= ACTIVITY_PAGE_SIZE);
    setPage(1);
  }, [username]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await baseDataLoader(() =>
      getUserActivities(username, nextPage, ACTIVITY_PAGE_SIZE),
    );
    setLoadingMore(false);
    if (!data || "message" in data) return;
    setHasMore(data.length >= ACTIVITY_PAGE_SIZE);
    setActivities((prev) => [...(prev ?? []), ...data]);
    setPage(nextPage);
  }, [username, page, loadingMore]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    error,
    hasMore,
    loadingMore,
    loadMore,
    refetch: fetchActivities,
    stopPageLoading,
  };
};

export default function UserProfilePage({}) {
  const params = useParams();
  const [startTour, setStartTour] = useState(false);
  const authState = useGlobalState("authState");
  const [showUnfriendAlert, setShowUnfriendAlert] = useState(false);
  const [showBlockAlert, setShowBlockAlert] = useState(false);
  const [showBlackListAlert, setShowBlackListAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const [showReportNWAlert, setShowReportNWAlert] = useState(false);
  const [showContactSupportAlert, setShowContactSupportAlert] = useState(false);
  const [showMiniCard, setShowMiniCard] = useState(false);
  const [showShareProfile, setShowShareProfile] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const user = useGlobalState("user");
  const userNovelist = useGlobalState("novelist");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const [scoreTooltipOpen, setScoreTooltipOpen] = useState(false);
  // The route param is a handle (`@tokyo`), not a bare username.
  const username = usernameFromHandle(params?.handle as string);
  const isCurrentUser = username === user?.username;
  const [novelist, setNovelist] = useState<Novelist | null>(
    username === user?.username ? userNovelist : null,
  );
  // The lookup came back empty: a mistyped handle, a blocked viewer, or a
  // failed request. Rendering the empty profile shell for that is worse than
  // saying so.
  const [profileMissing, setProfileMissing] = useState(false);
  const atMuseLimit =
    (novelist?.museCount ?? 0) >= (novelist?.tier.museLimit ?? 0);
  const [showAllFandoms, setShowAllFandoms] = useState(false);
  // Backend sends the distinct fandoms across all of this novelist's visible
  // muses; the muse list itself is trimmed to 3, so they can't be derived here.
  const fandoms = novelist?.fandoms ?? [];
  const visibleFandoms = showAllFandoms
    ? fandoms
    : fandoms.slice(0, COLLAPSED_FANDOM_COUNT);

  const {
    activities,
    refetch: refetchAcitivities,
    hasMore: hasMoreActivities,
    loadingMore: loadingMoreActivities,
    loadMore: loadMoreActivities,
  } = useGetActivities(username);
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;
  const [composeOpen, setComposeOpen] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTabKey>("activities");
  const [posts, setPosts] = useState<Prompt[] | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptPage, setPromptPage] = useState(1);
  const [hasMorePrompts, setHasMorePrompts] = useState(false);
  const [loadingMorePrompts, setLoadingMorePrompts] = useState(false);
  const [storyBoards, setStories] = useState<StoryBoard[] | null>(null);
  const [profileSong, setProfileSong] = useState<ProfileSong | null>(null);
  const setGlobalState = useGlobalStoreSet();
  const { successToast, warningToast, errorToast } = useUIContext();
  const { routeToPage, stopPageLoading, baseDataLoader } = usePageRouter();

  useEffect(() => {
    if (!novelist?.id) {
      setProfileSong(null);
      return;
    }
    getProfileSongAction(novelist.id).then(setProfileSong);
  }, [novelist?.id]);

  const mutualFriends = useMemo(() => {
    if (isCurrentUser) return [];

    const userFriendIds = new Set(userNovelist?.friends.map((f) => f.id));
    return novelist?.friends.filter((f) => userFriendIds.has(f.id));
  }, [novelist, userNovelist, isCurrentUser]);

  const profileAccent = useMemo(() => {
    if (typeof novelist?.palette !== "number") {
      return undefined;
    }

    const palette = novelist.palette as Accent;
    console.log("PROFILE ACCENT", { accent: ACCENT_MAP[palette], palette });
    return ACCENT_MAP[palette] ?? ACCENT_MAP[0];
  }, [novelist?.palette]);

  /*
   * The ambient light behind the page, in the novelist's accent rather than
   * the viewer's — the page is painted in their colours, so the light it sits
   * in should be theirs too.
   *
   * The canvas is PageContainer::before (rp/styles.ts), outside this page, and
   * it reads --ambient-* before the viewer's accent. The profile content
   * carries the novelist's accent class, so its computed --accent-a3 etc. are
   * already the resolved colours; they are copied onto the page container
   * while this profile is open and removed when it closes.
   */
  useEffect(() => {
    const content = document.getElementById("profile-tour-step-1");
    const page = content?.closest<HTMLElement>(".page-container");
    if (!content || !page) return;

    const computed = getComputedStyle(content);
    const vars: [target: string, source: string][] = [
      ["--ambient-a3", "--accent-a3"],
      ["--ambient-a2", "--accent-a2"],
      ["--ambient-bg", "--bg-1"],
    ];
    for (const [target, source] of vars) {
      const value = computed.getPropertyValue(source).trim();
      if (value) page.style.setProperty(target, value);
    }

    return () => {
      for (const [target] of vars) page.style.removeProperty(target);
    };
  }, [profileAccent, novelist?.id]);

  const hasAbout = !isRichTextEmpty(novelist?.about);

  const toFriendsPage = () => {
    routeToPage(ROUTES.Profile.View(username).Friends);
  };

  const handleStartTour = () => {
    setStartTour(true);
  };

  const handleEndTour = () => {
    setStartTour(false);
  };

  const handleCopyUsername = () => {
    if (username) {
      navigator.clipboard.writeText(username);
      successToast("Username copied to clipboard");
    }
  };

  const handleNotImplemented = () => {
    warningToast("This feature is coming soon!");
  };

  const handleExportMiniProfile = () => {
    setShowMiniCard(true);
  };

  const handleShareProfile = () => {
    setShowShareProfile(true);
  };

  const handleSendFeedbackMessage = async () => {
    const response = await sendFeedbackMessage(supportMessage.trim());
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Feedback sent successfully.`);
    } else {
      errorToast(
        `There was an issue while sending feedback Please contact at ${SUPPORT_EMAIL}.`,
      );
    }
  };

  const toMusesPage = () => {
    routeToPage(ROUTES.Profile.View(username).Muses);
  };

  const toCreateMusePage = () => {
    routeToPage(ROUTES.Profile.Muses.Create);
  };

  const toStoryBoardsPage = () => {
    routeToPage(ROUTES.Profile.View(username).Storyboards);
  };

  const toMessagePage = async () => {
    const conversation = await baseDataLoader(() =>
      getConversationByUsernameAction(username),
    );
    if (conversation?.id) {
      routeToPage(ROUTES.Conversation.View(conversation.id));
    } else {
      errorToast("Could not open conversation. Please try again.");
    }
  };

  const handleSendFriendRequest = async () => {
    if (!novelist?.id) return;

    const response = await sendFriendRequest(novelist.id);

    if (response?.message === API_MESSAGE.Success) {
      setNovelist((current) => {
        if (!current) return current;
        const copied = { ...current };

        copied.connection = "FRIEND_REQUEST_SENT";
        return copied;
      });

      successToast("Friend request sent");
    }
  };

  const handleBlockUser = async () => {
    if (!novelist?.id) return;

    const response = await blockUser(novelist.id);

    if (response?.message === API_MESSAGE.Success) {
      setNovelist((current) => {
        if (!current) return current;
        const copied = { ...current };

        copied.connection = "BLOCKED";
        return copied;
      });

      successToast("User blocked");
      routeToPage(ROUTES.Home);
    }
  };

  const handleBlackListUser = async () => {
    if (!novelist?.id) return;

    const response = await blacklistUser(novelist.id);

    if (response?.message === API_MESSAGE.Success) {
      setNovelist((current) => {
        if (!current) return current;
        const copied = { ...current };

        copied.connection = "BLACKLISTED";
        return copied;
      });

      successToast("User blacklisted");
      routeToPage(ROUTES.Home);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!novelist?.id) return;

    const response = await acceptFriendRequest(novelist.id);
    if (response?.message === API_MESSAGE.Success) {
      setNovelist((current) => {
        if (!current) return current;
        const copied = { ...current };

        copied.connection = "FRIEND";

        return copied;
      });

      successToast("Friend request accepted");
    }
  };

  const handleDeleteFriendRequest = async () => {
    if (!novelist?.id) return;

    const response = await deleteFriendRequest(novelist.id);
    if (response?.message === API_MESSAGE.Success) {
      setNovelist((current) => {
        if (!current) return current;
        const copied = { ...current };

        copied.connection = null;

        return copied;
      });

      successToast("Friend request rejected");
    }
  };

  const handleUnfriendNovelist = async () => {
    if (!novelist?.id) return;

    const response = await unfriendNovelist(novelist.id);
    if (response?.message === API_MESSAGE.Success) {
      setNovelist((current) => {
        if (!current) return current;
        const copied = { ...current };

        copied.connection = null;
        copied.friends = copied.friends.filter(
          (friend) => friend.username !== user?.username,
        );
        copied.friendsCount = Math.max(copied.friendsCount - 1, 0);

        return copied;
      });

      setGlobalState((prev) => {
        const prevNovelist = prev.novelist;
        if (!prevNovelist) return prev;
        const updatedFriends = prevNovelist.friends.filter(
          (friend) => friend.id !== novelist?.id,
        );
        const updatedNovelist = {
          ...prevNovelist,
          friends: updatedFriends,
          friendsCount: Math.max(prevNovelist.friendsCount - 1, 0),
        };
        return {
          novelist: updatedNovelist,
        };
      });

      successToast(`Unfriended ${novelist.username}`);
    } else {
      errorToast("There was an issue while unfriending.");
    }
  };

  const handleReportNovelist = async () => {
    if (!novelist?.id) return;

    const response = await reportProfile(novelist.id, "");
    if (response?.message === API_MESSAGE.Success) {
      setShowReportAlert(false);
      successToast(`Reported ${novelist.username}`);
    } else {
      errorToast("There was an issue while reporting this profile.");
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!novelist?.id) return;

    const response = await cancelFriendRequest(novelist.id);

    if (response?.message === API_MESSAGE.Success) {
      setNovelist((current) => {
        if (!current) return current;
        const copied = { ...current };

        copied.connection = null;

        return copied;
      });

      successToast("Friend request cancelled");
    }
  };

  const fetchStoryboards = async () => {
    const _storyboards = await baseDataLoader(() =>
      getAllStoryboardsByUsernameAction(username),
    );
    setStories(_storyboards);
  };

  const renderConnectionDropdown = (
    connection: string | null | undefined,
    username: string,
  ) => {
    if (username === "novelistworld") return null; // no dropdown for novelistworld profile
    switch (connection) {
      case "FRIEND":
        return (
          <AppDropdownMenuResponsive
            variant="bordered"
            trigger={<BsPersonFillCheck size={18} />}
            items={[
              {
                icon: <FcReading size={22} />,
                label: `Invite ${username} to a story`,
                onClick: handleNotImplemented,
              },
              {
                icon: <FcComments size={22} />,
                label: `Message ${username}`,
                onClick: toMessagePage,
              },
              {
                separator: true,
              },
              {
                icon: <IoPersonRemove size={18} />,
                label: `Unfriend ${username}`,
                onClick: () => setShowUnfriendAlert(true),
                variant: "danger",
              },
            ]}
          />
        );

      case "FRIEND_REQUEST_SENT":
        return (
          <AppDropdownMenuResponsive
            variant="bordered"
            trigger={<BsPersonFillUp size={18} />}
            items={[
              {
                icon: <GiCrossMark size={18} />,
                label: `Cancel friend request`,
                onClick: handleCancelFriendRequest,
                variant: "danger",
              },
            ]}
          />
        );

      case "FRIEND_REQUEST_RECEIVED":
        return (
          <AppDropdownMenuResponsive
            variant="bordered"
            trigger={<IoMdPersonAdd size={18} />}
            showUnread={true}
            items={[
              {
                icon: <GiCheckMark size={18} />,
                label: `Accept request from ${username}`,
                onClick: handleAcceptFriendRequest,
                variant: "positive",
              },
              {
                icon: <GiCrossMark size={18} />,
                label: `Reject request from ${username}`,
                onClick: handleDeleteFriendRequest,
                variant: "danger",
              },
            ]}
          />
        );

      default:
        return !isCurrentUser ? (
          <AppDropdownMenuResponsive
            variant="bordered"
            trigger={<IoMdPersonAdd size={18} />}
            items={[
              {
                icon: <IoMdPersonAdd size={22} />,
                label: `Add ${username}`,
                onClick: handleSendFriendRequest,
                variant: "positive",
              },
            ]}
          />
        ) : null;
    }
  };

  // Username whose data is currently loaded/loading. Navigating from one
  // profile to another reuses this component (same route, new param), so the
  // fetch effect must key off the param, not off a one-shot mount.
  const loadedUsername = useRef<string | null>(null);

  // Drop everything scoped to the previous novelist.
  const resetProfileState = () => {
    setNovelist(null);
    setProfileMissing(false);
    setProfileSong(null);
    setPosts(null);
    setPostPage(1);
    setHasMorePosts(false);
    setPrompts(null);
    setPromptPage(1);
    setHasMorePrompts(false);
    setStories(null);
    setFeedTab("activities");
    setShowAllFandoms(false);
  };

  // Keep local novelist in sync when global store updates (current user only)
  useEffect(() => {
    if (isCurrentUser && userNovelist) {
      setNovelist(userNovelist);
    }
  }, [userNovelist, isCurrentUser]);

  useEffect(() => {
    // Onboarding is for a signed-in novelist who has not built a profile yet.
    // A signed-out visitor reading someone else's profile is not that, and
    // bouncing them to onboarding makes every shared `/@username` link dead
    // for anyone who is not already a member.
    if (authState === "UNINITIALIZED" && user) {
      routeToPage(ROUTES.Onboarding);
      return;
    }

    if (authState === "LOADING") return;

    // Already have (or are fetching) this username's data.
    if (loadedUsername.current === username) return;

    const isFirstLoad = loadedUsername.current === null;
    loadedUsername.current = username;

    if (isCurrentUser) {
      // Data already in global store — no fetch needed
      if (!isFirstLoad) resetProfileState();
      setNovelist(userNovelist);
      stopPageLoading();
      return;
    }

    if (!isFirstLoad) resetProfileState();

    let cancelled = false;
    let settled = false;
    const load = async () => {
      const _novelist = await baseDataLoader(() => getNovelistAction(username));
      if (cancelled) return;
      if (!_novelist) {
        // No such novelist (or the fetch failed). That says nothing about the
        // viewer's own account, so it must not touch `authState` — doing so
        // used to send signed-out visitors to onboarding.
        setProfileMissing(true);
        stopPageLoading();
        return;
      }
      settled = true;
      setNovelist(_novelist);
    };
    load();
    //fetchStoryboards();

    return () => {
      cancelled = true;
      // `loadedUsername` is claimed before the fetch resolves, so two effect
      // runs for the same username can't both fetch. That claim has to be
      // released if this run is torn down before it settled, or the next run
      // sees "already loaded" and never fetches — leaving the profile empty
      // for good. StrictMode does exactly that on every mount in dev
      // (mount -> cleanup -> mount): run 1 claims the name and starts the
      // fetch, cleanup cancels it, run 2 bails on the claim, and the in-flight
      // response is discarded. Production doesn't double-invoke, which is why
      // this only ever showed up locally.
      if (!settled && loadedUsername.current === username) {
        loadedUsername.current = null;
      }
    };
  }, [authState, username, isCurrentUser]);

  // Fetch posts on demand when the Posts tab is first activated
  useEffect(() => {
    const id = novelist?.id;
    if (feedTab !== "posts" || posts !== null || !id) return;
    let cancelled = false;
    const load = async () => {
      setPostsLoading(true);
      const data = await baseDataLoader(() =>
        getPostsByNovelistAction(id, 1, POST_PAGE_SIZE),
      );
      if (cancelled) return;
      setPostsLoading(false);
      if (!data || "message" in data) return;
      setPosts(data);
      setHasMorePosts(data.length >= POST_PAGE_SIZE);
      setPostPage(1);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [feedTab, novelist?.id, posts]);

  const loadMorePosts = useCallback(async () => {
    const id = novelist?.id;
    if (loadingMorePosts || !id) return;
    setLoadingMorePosts(true);
    const nextPage = postPage + 1;
    const data = await baseDataLoader(() =>
      getPostsByNovelistAction(id, nextPage, POST_PAGE_SIZE),
    );
    setLoadingMorePosts(false);
    if (!data || "message" in data) return;
    setHasMorePosts(data.length >= POST_PAGE_SIZE);
    setPosts((prev) => [...(prev ?? []), ...data]);
    setPostPage(nextPage);
  }, [loadingMorePosts, novelist?.id, postPage]);

  // Fetch prompts (by the novelist's muses) on demand when the Prompts tab is first activated
  useEffect(() => {
    const id = novelist?.id;
    if (feedTab !== "prompts" || prompts !== null || !id) return;
    let cancelled = false;
    const load = async () => {
      setPromptsLoading(true);
      const data = await baseDataLoader(() =>
        getPromptsByNovelistAction(id, 1, POST_PAGE_SIZE),
      );
      if (cancelled) return;
      setPromptsLoading(false);
      if (!data || "message" in data) return;
      setPrompts(data);
      setHasMorePrompts(data.length >= POST_PAGE_SIZE);
      setPromptPage(1);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [feedTab, novelist?.id, prompts]);

  const loadMorePrompts = useCallback(async () => {
    const id = novelist?.id;
    if (loadingMorePrompts || !id) return;
    setLoadingMorePrompts(true);
    const nextPage = promptPage + 1;
    const data = await baseDataLoader(() =>
      getPromptsByNovelistAction(id, nextPage, POST_PAGE_SIZE),
    );
    setLoadingMorePrompts(false);
    if (!data || "message" in data) return;
    setHasMorePrompts(data.length >= POST_PAGE_SIZE);
    setPrompts((prev) => [...(prev ?? []), ...data]);
    setPromptPage(nextPage);
  }, [loadingMorePrompts, novelist?.id, promptPage]);

  if (profileMissing && !novelist) {
    return (
      <ErrorBox>
        No novelist called @{username}. The link may be mistyped, or the profile
        is no longer here.
      </ErrorBox>
    );
  }

  return (
    <>
      {/* {!startTour && (
        <button
          type="button"
          onClick={handleStartTour}
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--bg-6)",
            borderRadius: "6px",
            color: "var(--text)",
            cursor: "pointer",
            left: "12px",
            padding: "0.4rem 0.8rem",
            position: "fixed",
            top: "12px",
            zIndex: 11000,
          }}
        >
          Start Profile Tour
        </button>
      )}
      {startTour && (
        <ProfileTourGuide
          start={startTour}
          setStartTour={setStartTour}
          onTourEnd={handleEndTour}
        />
      )} */}
      {showMiniCard && novelist && (
        <MiniProfileCard
          novelist={novelist}
          onClose={() => setShowMiniCard(false)}
        />
      )}
      <ShareProfileDialog
        novelist={novelist}
        open={showShareProfile}
        onClose={() => setShowShareProfile(false)}
      />

      <AppAlertDialog
        heading={`Unfriend ${username}?`}
        text={`Are you sure you want to remove ${username} from your friends list?`}
        open={showUnfriendAlert}
        onOpenChange={setShowUnfriendAlert}
        onConfirm={handleUnfriendNovelist}
        actionButtonLabel="Unfriend"
      />
      <AppAlertDialog
        heading={`Report ${username}?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from ${username}, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportAlert}
        onOpenChange={setShowReportAlert}
        onConfirm={handleReportNovelist}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Really Bro?`}
        text={`Really man?`}
        body={
          <Image
            src={
              "https://rp-webapp-ui.s3.eu-central-1.amazonaws.com/deployments/block-nw-react.jpeg"
            }
            alt="nw"
          />
        }
        open={showReportNWAlert}
        onOpenChange={setShowReportNWAlert}
        onConfirm={() => setShowReportNWAlert(false)}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Block ${username}?`}
        text={`${username} will no longer be able to find you or view anything related to you or your characters. Are you sure you want to block ${username}?`}
        open={showBlockAlert}
        onOpenChange={setShowBlockAlert}
        onConfirm={handleBlockUser}
        actionButtonLabel="Block"
      />
      <AppAlertDialog
        heading={`Blacklist ${username}?`}
        text={`You will no longer be able to see content posted by ${username}. Are you sure you want to blacklist ${username}?`}
        open={showBlackListAlert}
        onOpenChange={setShowBlackListAlert}
        onConfirm={handleBlackListUser}
        actionButtonLabel="Blacklist"
      />
      <AppAlertDialog
        heading="Contact Support"
        text="Send a message to support. We will try to get back to you via in-app notifications."
        body={
          <ContactSupportForm
            message={supportMessage}
            setMessage={setSupportMessage}
          />
        }
        open={showContactSupportAlert}
        onOpenChange={setShowContactSupportAlert}
        onConfirm={async () => {
          if (!supportMessage.trim()) return; // validation
          await handleSendFeedbackMessage();
          setShowContactSupportAlert(false); // close dialog
          setSupportMessage(""); // reset message
        }}
        actionButtonLabel="Send message"
        actionColor="neutral"
        isConfirmDisabled={supportMessage.trim() === ""}
      />

      <S.Content
        id="profile-tour-step-1"
        className={classNames(profileAccent)}
        data-accent={profileAccent}
      >
        <S.ContentRight>
          <S.BannerSection
            $compact={!!novelist && !novelist.banner?.src}
            $hasBanner={!!novelist?.banner?.src}
          >
            <S.Banner
              $src={
                novelist?.banner?.src
                  ? novelist.banner.src
                  : novelist?.image && !novelist.image.endsWith(".gif")
                    ? novelist.image
                    : ""
              }
              $blurred={!novelist?.banner?.src}
              $x={novelist?.banner?.crop?.x}
              $y={novelist?.banner?.crop?.y}
              $scale={
                novelist?.banner?.crop && novelist.banner.crop.width > 0
                  ? novelist.banner.crop.width / 100
                  : undefined
              }
            />
            <ShouldRender if={authState === "LOGGED_IN"}>
              <S.ProfileDropdownMenuContainer>
                {renderConnectionDropdown(novelist?.connection, username)}
                <ShouldRender if={isCurrentUser}>
                  <AppDropdownMenuResponsive
                    variant="bordered"
                    trigger={<BsThreeDots size={18} />}
                    items={[
                      {
                        icon: <FcPortraitMode size={22} />,
                        label: "Edit profile",
                        onClick: () => routeToPage(ROUTES.Profile.Edit),
                      },
                      {
                        icon: <FcAnswers size={22} />,
                        label: `Copy username`,
                        onClick: handleCopyUsername,
                      },
                      {
                        icon: <FcShare size={22} />,
                        label: `Share profile`,
                        onClick: handleShareProfile,
                      },
                      {
                        icon: <FcBusinessContact size={22} />,
                        label: `Export novelist card`,
                        onClick: handleExportMiniProfile,
                      },
                    ]}
                  />
                </ShouldRender>
                <ShouldRender
                  if={!isCurrentUser && username !== "novelistworld"}
                >
                  <AppDropdownMenuResponsive
                    variant="bordered"
                    trigger={<BsThreeDots size={18} />}
                    items={[
                      {
                        icon: <FcAnswers size={22} />,
                        label: `Copy username`,
                        onClick: handleCopyUsername,
                      },
                      {
                        icon: <FcShare size={22} />,
                        label: `Share profile`,
                        onClick: handleShareProfile,
                      },
                      {
                        icon: <FcBusinessContact size={22} />,
                        label: `Export novelist card`,
                        onClick: handleExportMiniProfile,
                      },
                      {
                        separator: true,
                      },
                      {
                        icon: <RiFlagFill size={22} />,
                        label: `Report ${username}`,
                        onClick: () => setShowReportAlert(true),
                        variant: "danger",
                      },
                      {
                        icon: <BiHide size={22} />,
                        label: `Blacklist ${username}`,
                        onClick: () => setShowBlackListAlert(true),
                        variant: "danger",
                      },
                      {
                        icon: <MdOutlineAppBlocking size={22} />,
                        label: `Block ${username}`,
                        onClick: () => setShowBlockAlert(true),
                        variant: "danger",
                      },
                    ]}
                  />
                </ShouldRender>
                <ShouldRender
                  if={!isCurrentUser && username === "novelistworld"}
                >
                  <AppDropdownMenuResponsive
                    variant="bordered"
                    trigger={<BsThreeDots size={18} />}
                    items={[
                      {
                        icon: <FcAnswers size={22} />,
                        label: `Copy username`,
                        onClick: handleCopyUsername,
                      },
                      {
                        icon: <FcShare size={22} />,
                        label: `Share profile`,
                        onClick: handleShareProfile,
                      },
                      {
                        icon: <FcBusinessContact size={22} />,
                        label: `Export novelist card`,
                        onClick: handleExportMiniProfile,
                      },
                      {
                        icon: <FcComments size={22} />,
                        label: `Send message`,
                        onClick: () => setShowContactSupportAlert(true),
                      },
                      {
                        separator: true,
                      },
                      {
                        icon: <RiFlagFill size={22} />,
                        label: `Report ${username}`,
                        onClick: () => setShowReportNWAlert(true),
                        variant: "danger",
                      },
                    ]}
                  />
                </ShouldRender>
              </S.ProfileDropdownMenuContainer>
            </ShouldRender>
          </S.BannerSection>
          <S.ContentInner $hasBanner={!!novelist?.banner?.src}>
            <S.AvatarHeader>
              <S.AvatarWrap>
                <S.Avatar
                  src={novelist?.image ?? null}
                  alt={novelist?.firstName ?? "Avatar"}
                  username={novelist?.username}
                  nwImage={novelist?.avatar}
                />
                <S.AvatarMobile
                  src={novelist?.image ?? null}
                  alt="profile-picture"
                  username={novelist?.username}
                  nwImage={novelist?.avatar}
                />
                <ShouldRender
                  if={
                    username !== "novelistworld" &&
                    typeof novelist?.totalPoints === "number"
                  }
                >
                  <Tooltip.Provider delayDuration={200}>
                    <Tooltip.Root
                      open={scoreTooltipOpen}
                      onOpenChange={setScoreTooltipOpen}
                    >
                      <Tooltip.Trigger asChild>
                        <S.AvatarXpBadge
                          onClick={() => setScoreTooltipOpen((v) => !v)}
                        >
                          <ScoreBadgeIcon size={14} />
                          {novelist?.totalPoints?.toLocaleString()} XP
                        </S.AvatarXpBadge>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          sideOffset={4}
                          className={classNames([accent, theme])}
                          style={{
                            background: "var(--bg-2)",
                            border: "1px solid var(--glass-edge, var(--bg-6))",
                            borderRadius: "10px",
                            boxShadow: "0 12px 32px -12px rgb(0 0 0 / 0.7)",
                            color: "var(--text)",
                            fontSize: "12px",
                            maxWidth: "220px",
                            padding: "6px 10px",
                            userSelect: "none",
                            zIndex: 9999,
                          }}
                        >
                          XP reflects how active this Novelist is on the app.
                          <Tooltip.Arrow style={{ fill: "var(--bg-2)" }} />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </ShouldRender>
              </S.AvatarWrap>
              <ShouldRender if={Boolean(novelist?.note?.text)}>
                <S.NoteContainer $color={novelist?.note?.color ?? null}>
                  {novelist?.note?.text}
                  {novelist?.note?.emoji && (
                    <S.NoteEmoji
                      $rotate={getNoteEmojiRotate(novelist.note.emoji)}
                    >
                      <NoteEmojiIcon emojiKey={novelist.note.emoji} size={22} />
                    </S.NoteEmoji>
                  )}
                </S.NoteContainer>
              </ShouldRender>
            </S.AvatarHeader>
            <Flex id="profile-tour-step-2">
              <S.NameMobile>
                {novelist?.firstName} {novelist?.lastName}
              </S.NameMobile>
              {/* <S.ExtendedBadge
                tier={novelist?.tier.name || "standard"}
                className={`badge-${novelist?.tier.name?.toLowerCase()}`}
                onClick={toTiersPage}
              >
                {novelist?.tier.name === "STANDARD" && (
                  <TbSquareRoundedLetterSFilled />
                )}
                {novelist?.tier.name === "SILVER" && <GiCircleClaws />}
                {novelist?.tier.name === "SILVER" && (
                  <TbCircleLetterS className="letter" />
                )}
                {novelist?.tier.name === "GOLD" && <GiGoldShell />}
                {novelist?.tier.name === "GOLD" && (
                  <TbCircleLetterG className="letter" />
                )}
                {novelist?.tier.name === "PREMIUM" && <GiStarSwirl />}
                {novelist?.tier.name === "PREMIUM" && (
                  <TbCircleLetterP className="letter" />
                )}
              </S.ExtendedBadge> */}
            </Flex>
            <S.UsernameContainer>
              <Username username={username} primary />{" "}
              <ShouldRender if={novelist?.isVerified === true}>
                {novelist?.username === "novelistworld" ? (
                  <AdminBadge size={20} />
                ) : (
                  <EmailVerifiedBadge size={14} />
                )}
              </ShouldRender>
              {/* Earned badges sit with the handle rather than in the stats row:
                  they belong to the identity, and the row below is counts. */}
              <BadgeRow
                badges={novelist?.badges}
                size={20}
                ownerName={novelist?.firstName ?? username}
              />
            </S.UsernameContainer>
            <ShouldRender if={username !== "novelistworld"}>
              <S.StatsRow id="profile-tour-step-3">
                <Flex gap={"2px"}>
                  <FcTreeStructure size={"16px"} />
                  <S.InfoTextBold>{novelist?.friendsCount}</S.InfoTextBold>{" "}
                  <S.InfoText> Friends</S.InfoText>
                </Flex>
                <Flex gap={"2px"}>
                  <FcConferenceCall size={"16px"} />
                  <S.InfoTextBold>{novelist?.museCount}</S.InfoTextBold>{" "}
                  <S.InfoText> Characters</S.InfoText>
                </Flex>
                <Flex gap={"2px"}>
                  <FcCalendar size={"16px"} />
                  <S.InfoText>
                    {` `} Joined {toFormattedDate(novelist?.createdAt)}
                  </S.InfoText>
                </Flex>
              </S.StatsRow>
            </ShouldRender>
            <ShouldRender
              if={mutualFriends !== undefined && mutualFriends?.length > 0}
            >
              <Flex
                id="profile-tour-step-4"
                align="center"
                justify="flex-start"
                gap="0.2rem"
                style={{
                  boxSizing: "border-box",
                  paddingLeft: "60px",
                  width: "100%",
                }}
              >
                <S.InfoText>{`Mutual friends (${mutualFriends?.length})`}</S.InfoText>
                <S.MutualFriendsList>
                  {mutualFriends?.slice(0, 3).map((friend) => (
                    <NovelistAvatar
                      key={friend.id}
                      image={friend.image}
                      name={friend.username}
                      username={friend.username}
                      avatar={friend.avatar}
                    />
                  ))}
                </S.MutualFriendsList>
              </Flex>
            </ShouldRender>
            <ShouldRender if={Boolean(profileSong) || hasAbout}>
              <S.MediaStack $spotify={profileSong?.source === "SPOTIFY"}>
                {profileSong && (
                  <ProfileSongPlayer
                    song={profileSong}
                    block
                    flushBottom={hasAbout}
                  />
                )}
                <ShouldRender if={hasAbout}>
                  <S.AboutContainer
                    id="profile-tour-step-5"
                    $attachedTop={Boolean(profileSong)}
                  >
                    <AboutRichText
                      savedText={novelist?.about ?? ""}
                      collapsedHeight={100}
                    />
                  </S.AboutContainer>
                </ShouldRender>
              </S.MediaStack>
            </ShouldRender>
            {fandoms.length > 0 && (
              <S.FandomSection>
                <S.FandomEyebrow>{`Fandoms ${novelist?.firstName} writes in`}</S.FandomEyebrow>
                <S.FandomChipRow>
                  {visibleFandoms.map((fandom) => (
                    <S.ProfileFandomChip
                      key={fandom.id}
                      $color={fandom.color || "var(--accent)"}
                      title={fandom.name}
                    >
                      <span className="name">{fandomChipLabel(fandom)}</span>
                    </S.ProfileFandomChip>
                  ))}
                  {fandoms.length > COLLAPSED_FANDOM_COUNT && (
                    <S.FandomSeeAllChip
                      type="button"
                      aria-expanded={showAllFandoms}
                      onClick={() => setShowAllFandoms((prev) => !prev)}
                    >
                      {showAllFandoms
                        ? "See less"
                        : `See all (${fandoms.length})`}
                    </S.FandomSeeAllChip>
                  )}
                </S.FandomChipRow>
              </S.FandomSection>
            )}
            <ShouldRender
              if={!!(novelist?.museCount && novelist.museCount > 0)}
            >
              <Flex
                id="profile-tour-step-6"
                style={{ width: "100%" }}
                direction="column"
              >
                <S.MuseSectionHeader>
                  <span>{`Characters (${novelist?.museCount})`}</span>
                  <S.MuseSectionRule />
                  <ShouldRender if={isCurrentUser && !atMuseLimit}>
                    <S.AddMuseButton onClick={toCreateMusePage}>
                      <IoMdPersonAdd />
                      Add
                    </S.AddMuseButton>
                  </ShouldRender>
                </S.MuseSectionHeader>
                <S.MuseList>
                  {mainVerseMuses(novelist?.muses)
                    .slice(0, 3)
                    .map((muse) => (
                      <MuseListItem key={muse.id} muse={muse}></MuseListItem>
                    ))}
                </S.MuseList>
                <S.SeeMoreLink onClick={toMusesPage}>
                  <span>
                    <FaPeopleGroup />
                    See all characters
                    <MdOutlineKeyboardDoubleArrowRight />
                  </span>
                </S.SeeMoreLink>
              </Flex>
            </ShouldRender>
            <ShouldRender
              if={
                isCurrentUser &&
                novelist !== null &&
                !(novelist?.museCount && novelist.museCount > 0)
              }
            >
              <Flex style={{ width: "100%" }} direction="column">
                <S.SeeMoreLink onClick={toCreateMusePage}>
                  <span>
                    <IoMdPersonAdd />
                    Add a character
                    <MdOutlineKeyboardDoubleArrowRight />
                  </span>
                </S.SeeMoreLink>
              </Flex>
            </ShouldRender>
            <ShouldRender
              if={
                username !== "novelistworld" &&
                !!(novelist?.friendsCount && novelist.friendsCount > 0)
              }
            >
              <Flex
                id="profile-tour-step-7"
                style={{ marginBottom: "20px", width: "100%" }}
                direction="column"
              >
                <S.FriendsButton onClick={toFriendsPage}>
                  <S.FriendsButtonLabel>
                    {" "}
                    {`Friends (${novelist?.friendsCount})`}
                  </S.FriendsButtonLabel>
                  <S.FriendsAvatarStack>
                    {novelist?.friends.slice(0, 5).map((friend) => (
                      <FriendAvatarItem key={friend.id} friend={friend} />
                    ))}
                  </S.FriendsAvatarStack>
                  <GoChevronRight size={18} color="var(--text-secondary)" />
                </S.FriendsButton>
              </Flex>
            </ShouldRender>
            <ShouldRender if={!!(storyBoards && storyBoards?.length > 0)}>
              <S.SubText>{`Stories (${storyBoards?.length})`}</S.SubText>
              <S.ContentContainer>
                <S.PartitionContainer>
                  {storyBoards?.map((storyBoard) => (
                    <StoryCard
                      className="profile"
                      key={storyBoard?.id}
                      storyBoard={storyBoard}
                    ></StoryCard>
                  ))}
                </S.PartitionContainer>
              </S.ContentContainer>
              <S.SeeMoreLink onClick={toStoryBoardsPage}>
                see all...
              </S.SeeMoreLink>
            </ShouldRender>
          </S.ContentInner>
          {/* The feed lives on the canvas, not inside the profile sheet, so
              posts and activity cards aren't cards stacked inside a card. */}
          <S.FeedSection>
            {authState === "LOGGED_IN" &&
              username === user?.username &&
              novelist !== null && (
                <>
                  {isMobile ? (
                    <PromptComposeTrigger
                      avatarSrc={userNovelist?.image}
                      avatarAlt={userNovelist?.username ?? "You"}
                      avatarNwImage={userNovelist?.avatar}
                      onClick={() => setComposeOpen(true)}
                    />
                  ) : (
                    <PromptInput
                      type="prompt"
                      onSend={() => {
                        if (feedTab === "posts") setPosts(null);
                        else if (feedTab === "prompts") setPrompts(null);
                        else refetchAcitivities();
                      }}
                      dropdownSelection="ALL"
                      initialSelection={novelistToSource(novelist)}
                      defaultOpen={true}
                    />
                  )}
                </>
              )}
            <S.SubText>
              {authState === "LOGGED_IN" && username === user?.username
                ? "Your Updates"
                : `Updates by ${username}`}
            </S.SubText>
            <S.FeedTabBar
              options={FEED_TABS}
              value={feedTab}
              onChange={setFeedTab}
              ariaLabel="Profile updates"
            />
            <S.FeedBody>
            {feedTab === "activities" &&
              (activities === undefined ? (
                <FeedShimmer />
              ) : activities.length > 0 ? (
                <>
                  <S.ActivitiesContainer>
                    {activities.map((activity) => (
                      <ActivityBox key={activity?.id} activity={activity} />
                    ))}
                  </S.ActivitiesContainer>
                  <LoadMore
                    hasMore={hasMoreActivities}
                    loadingMore={loadingMoreActivities}
                    onLoadMore={loadMoreActivities}
                    endMarker={activities.length > 0}
                  />
                </>
              ) : (
                <EmptyFeed tab="activities" username={username} />
              ))}
            {feedTab === "posts" &&
              (postsLoading || posts === null ? (
                <FeedShimmer />
              ) : posts.length === 0 ? (
                <EmptyFeed tab="posts" username={username} />
              ) : (
                <>
                  <S.PostsContainer>
                    {posts.map((post) => (
                      <PromptComponent key={post.id} prompt={post} />
                    ))}
                  </S.PostsContainer>
                  <LoadMore
                    hasMore={hasMorePosts}
                    loadingMore={loadingMorePosts}
                    onLoadMore={loadMorePosts}
                    endMarker={posts.length > 0}
                  />
                </>
              ))}
            {feedTab === "prompts" &&
              (promptsLoading || prompts === null ? (
                <FeedShimmer />
              ) : prompts.length === 0 ? (
                <EmptyFeed tab="prompts" username={username} />
              ) : (
                <>
                  <S.PostsContainer>
                    {prompts.map((prompt) => (
                      <PromptComponent key={prompt.id} prompt={prompt} />
                    ))}
                  </S.PostsContainer>
                  <LoadMore
                    hasMore={hasMorePrompts}
                    loadingMore={loadingMorePrompts}
                    onLoadMore={loadMorePrompts}
                    endMarker={prompts.length > 0}
                  />
                </>
              ))}
            </S.FeedBody>
          </S.FeedSection>
        </S.ContentRight>
      </S.Content>

      {/* ── Mobile slide-up compose overlay ─────────────────────── */}
      <S.ComposeSheet $open={composeOpen}>
        <FullPagePromptInput
          type="prompt"
          dropdownSelection="ALL"
          initialSelection={
            userNovelist ? novelistToSource(userNovelist) : undefined
          }
          className="compose-fp-inner"
          onBack={() => setComposeOpen(false)}
          onSend={() => {
            if (feedTab === "posts") setPosts(null);
            else if (feedTab === "prompts") setPrompts(null);
            else refetchAcitivities();
            setComposeOpen(false);
          }}
        />
      </S.ComposeSheet>
    </>
  );
}
