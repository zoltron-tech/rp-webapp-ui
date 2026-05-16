"use client";

import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BiHide } from "react-icons/bi";
import { BsPersonFillCheck, BsPersonFillUp, BsThreeDots } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import {
  FcAnswers,
  FcBusinessContact,
  FcCalendar,
  FcComments,
  FcConferenceCall,
  FcReading,
  FcShare,
  FcTreeStructure,
} from "react-icons/fc";
import { GiCheckMark, GiCrossMark } from "react-icons/gi";
import { GoChevronRight } from "react-icons/go";
import { IoMdPersonAdd } from "react-icons/io";
import { IoPersonRemove } from "react-icons/io5";
import {
  MdOutlineAppBlocking,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RiFlagFill } from "react-icons/ri";
import { TfiLayoutListPost } from "react-icons/tfi";
import { ContactSupportForm } from "@/components";
import ActivityBox from "@/components/activity-box";
import {
  EmailVerifiedBadge,
  ShouldRender,
  Username,
} from "@/components/common";
import { AdminBadge } from "@/components/common/admin-badge";
import { useIsOnline } from "@/components/common/avatar-new";
import { NovelistAvatar } from "@/components/common/novelist-avatar";
import { AppAlertDialog } from "@/components/dialog";
import { novelistToSource } from "@/components/event-thread-input/helpers";
import { Image } from "@/components/image-viewer/styled";
import { MiniProfileCard } from "@/components/mini-profile-card";
import MuseListItem from "@/components/muse-list-item";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import { PromptComposeTrigger } from "@/components/prompt-compose-trigger";
import PromptInput from "@/components/prompt-input";
import { FullPagePromptInput } from "@/components/prompt-input/full-page-prompt-input";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import StoryCard from "@/components/story-card";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { Novelist, StoryBoard } from "@/types";
import type { Activity } from "@/types/activity";
import { ACCENT_MAP, type Accent } from "@/types/theme";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import { getConversationByUsernameAction } from "../../conversations/actions";
import { getUserActivities } from "../../home/actions";
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
import * as S from "./styles";

function FriendAvatarItem({
  friend,
}: {
  friend: { id: string; image: string; username: string };
}) {
  const isOnline = useIsOnline(friend.username);
  return (
    <span className={friend.username && !isOnline ? "with-outline" : undefined}>
      <NovelistAvatar
        image={friend.image}
        name={friend.username}
        username={friend.username}
      />
    </span>
  );
}

const useGetActivities = (username: string) => {
  const [activities, setActivities] = useState<Activity[]>();
  const [error, setError] = useState<boolean>(false);
  const { stopPageLoading, baseDataLoader } = usePageRouter();

  const fetchActivities = useCallback(async () => {
    const _activities =
      (await baseDataLoader(() => getUserActivities(username, 1, 10))) ?? [];

    if (_activities && "message" in _activities) {
      stopPageLoading();
      setError(true);
      return;
    }
    stopPageLoading();
    setActivities(_activities);
  }, [username]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, error, refetch: fetchActivities, stopPageLoading };
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
  const [supportMessage, setSupportMessage] = useState("");
  const user = useGlobalState("user");
  const userNovelist = useGlobalState("novelist");
  const username = params?.slug as string;
  const isCurrentUser = username === user?.username;
  const [novelist, setNovelist] = useState<Novelist | null>(
    username === user?.username ? userNovelist : null,
  );

  const { activities, refetch: refetchAcitivities } =
    useGetActivities(username);
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;
  const [composeOpen, setComposeOpen] = useState(false);
  const [storyBoards, setStories] = useState<StoryBoard[] | null>(null);
  const setGlobalState = useGlobalStoreSet();
  const { successToast, warningToast, errorToast } = useUIContext();
  const { routeToPage, stopPageLoading, baseDataLoader } = usePageRouter();

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
    if (username) {
      navigator.clipboard.writeText(
        `https://novelist.world/rp/profile/${username}`,
      );
      successToast("Profle link copied to clipboard");
    }
  };

  const handleSendFeedbackMessage = async () => {
    const response = await sendFeedbackMessage(supportMessage.trim());
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Feedback sent successfully.`);
    } else {
      errorToast(
        "There was an issue while sending feedback Please contact at support@zoltrontech.com.",
      );
    }
  };

  const toMusesPage = () => {
    routeToPage(ROUTES.Profile.View(username).Muses);
  };

  const toPostsPage = () => {
    routeToPage(ROUTES.Profile.View(username).Posts);
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
          <AppDropdownMenu
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
          <AppDropdownMenu
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
          <AppDropdownMenu
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
          <AppDropdownMenu
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

  const fetchNovelist = async (username: string) => {
    // fetch novelist by username
    const _novelist = await baseDataLoader(() => getNovelistAction(username));
    if (!_novelist || isCurrentUser) {
      setGlobalState({ authState: "UNINITIALIZED" });
      routeToPage(ROUTES.Onboarding);
      return;
    }

    setNovelist(_novelist);
  };

  // Keep local novelist in sync when global store updates (current user only)
  useEffect(() => {
    if (isCurrentUser && userNovelist) {
      setNovelist(userNovelist);
    }
  }, [userNovelist, isCurrentUser]);

  useEffect(() => {
    if (authState === "UNINITIALIZED") {
      routeToPage(ROUTES.Onboarding);
      return;
    }

    if (authState === "LOADING") return;

    if (isCurrentUser) {
      // Data already in global store — no fetch needed
      if (!novelist) setNovelist(userNovelist);
      stopPageLoading();
      return;
    }

    if (novelist) return;

    fetchNovelist(username);
    //fetchStoryboards();
  }, [authState]);

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

      <S.Banner
        src={
          novelist?.image && !novelist.image.endsWith(".gif")
            ? novelist.image
            : ""
        }
      />
      <S.Content
        id="profile-tour-step-1"
        className={classNames(profileAccent)}
        data-accent={profileAccent}
      >
        <S.ContentRight>
          <Flex
            direction="row"
            justify="flex-start"
            style={{ marginBottom: "-70px", overflow: "visible", width: "90%" }}
          >
            <S.Avatar
              src={novelist?.image ?? null}
              alt={novelist?.firstName ?? "Avatar"}
              username={novelist?.username}
            />
            <S.AvatarMobile
              src={novelist?.image ?? null}
              alt="profile-picture"
              username={novelist?.username}
            />
            <ShouldRender
              if={novelist?.note !== undefined && novelist?.note?.length > 0}
            >
              <S.NoteContainer>{novelist?.note}</S.NoteContainer>
            </ShouldRender>
          </Flex>
          <S.ContentInner>
            <ShouldRender if={authState === "LOGGED_IN"}>
              <S.ProfileDropdownMenuContainer>
                {renderConnectionDropdown(novelist?.connection, username)}
                <ShouldRender if={isCurrentUser}>
                  <AppDropdownMenu
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
                    ]}
                  />
                </ShouldRender>
                <ShouldRender
                  if={!isCurrentUser && username !== "novelistworld"}
                >
                  <AppDropdownMenu
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
                  <AppDropdownMenu
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
            </S.UsernameContainer>
            <ShouldRender if={username !== "novelistworld"}>
              <Flex id="profile-tour-step-3" align="flex-start">
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
              </Flex>
            </ShouldRender>
            <ShouldRender
              if={mutualFriends !== undefined && mutualFriends?.length > 0}
            >
              <Flex
                id="profile-tour-step-4"
                align="center"
                justify="flex-start"
                gap="0.5rem"
                style={{ paddingLeft: "2rem", width: "100%" }}
              >
                <S.InfoText>{`Mutual friends (${mutualFriends?.length})`}</S.InfoText>
                <S.MutualFriendsList>
                  {mutualFriends?.slice(0, 3).map((friend) => (
                    <NovelistAvatar
                      key={friend.id}
                      image={friend.image}
                      name={friend.username}
                      username={friend.username}
                    />
                  ))}
                </S.MutualFriendsList>
              </Flex>
            </ShouldRender>
            <ShouldRender
              if={!!(novelist?.about && novelist?.about.length > 0)}
            >
              <S.AboutContainer id="profile-tour-step-5">
                <RichTextRenderer
                  savedText={novelist?.about ?? ""}
                  collapsedHeight={100}
                />
              </S.AboutContainer>
            </ShouldRender>
            <ShouldRender
              if={!!(novelist?.museCount && novelist.museCount > 0)}
            >
              <Flex
                id="profile-tour-step-6"
                style={{ width: "100%" }}
                direction="column"
              >
                <S.SubText>{`Characters (${novelist?.museCount})`}</S.SubText>
                <S.MuseList>
                  {novelist?.muses.slice(0, 3).map((muse) => (
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
                  <GoChevronRight size={18} color="gray" />
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
            {authState === "LOGGED_IN" &&
              username === user?.username &&
              novelist !== null && (
                <>
                  {isMobile ? (
                    <PromptComposeTrigger
                      avatarSrc={userNovelist?.image}
                      avatarAlt={userNovelist?.username ?? "You"}
                      onClick={() => setComposeOpen(true)}
                    />
                  ) : (
                    <PromptInput
                      type="prompt"
                      onSend={refetchAcitivities}
                      dropdownSelection="ALL"
                      initialSelection={novelistToSource(novelist)}
                      defaultOpen={true}
                    />
                  )}
                </>
              )}
            <S.SeeMoreLink onClick={toPostsPage}>
              <span>
                <TfiLayoutListPost />
                See posts by {username}
                <MdOutlineKeyboardDoubleArrowRight />
              </span>
            </S.SeeMoreLink>
            <S.SubText>
              {activities?.length === 0
                ? ""
                : authState === "LOGGED_IN" && username === user?.username
                  ? "Your Updates"
                  : `Updates by ${username}`}
            </S.SubText>
            <ShouldRender
              if={activities !== undefined && activities?.length > 0}
            >
              <S.ActivitiesContainer>
                {activities?.map((activity) => (
                  <ActivityBox
                    key={activity?.id}
                    activity={activity}
                  ></ActivityBox>
                ))}
              </S.ActivitiesContainer>
            </ShouldRender>
          </S.ContentInner>
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
            refetchAcitivities();
            setComposeOpen(false);
          }}
        />
      </S.ComposeSheet>
    </>
  );
}
