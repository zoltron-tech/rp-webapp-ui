"use client";

import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiHide } from "react-icons/bi";
import { BsPersonFillCheck, BsPersonFillUp, BsThreeDots } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import {
  FcAnswers,
  FcCalendar,
  FcComments,
  FcConferenceCall,
  FcReading,
  FcShare,
  FcSupport,
  FcTreeStructure,
} from "react-icons/fc";
import { GiCheckMark, GiCrossMark } from "react-icons/gi";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import { IoMdPersonAdd } from "react-icons/io";
import { IoPersonRemove } from "react-icons/io5";
import {
  MdOutlineAppBlocking,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RiFlagFill } from "react-icons/ri";
import { VscVerifiedFilled } from "react-icons/vsc";
import { ContactSupportForm } from "@/components";
import ActivityBox from "@/components/activity-box";
import { ShouldRender, Username } from "@/components/common";
import { NovelistAvatar } from "@/components/common/novelist-avatar";
import { AppAlertDialog } from "@/components/dialog";
import { novelistToSource } from "@/components/event-thread-input/helpers";
import { Image } from "@/components/image-viewer/styled";
import MuseListItem from "@/components/muse-list-item";
import ProfileFriendListItem from "@/components/profile-friend-list-item";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import PromptInput from "@/components/prompt-input";
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
  const [supportMessage, setSupportMessage] = useState("");
  const user = useGlobalState("user");
  const userNovelist = useGlobalState("novelist");
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const username = params?.slug as string;
  const isCurrentUser = username === user?.username;
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const listRef = useRef<HTMLDivElement>(null);
  const { activities, refetch: refetchAcitivities } =
    useGetActivities(username);
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;
  const [storyBoards, setStories] = useState<StoryBoard[] | null>(null);
  const setGlobalState = useGlobalStoreSet();
  const { successToast, warningToast, errorToast } = useUIContext();
  const { routeToPage, stopPageLoading, baseDataLoader } = usePageRouter();

  useEffect(() => {
    if (listRef.current) {
      if (showAllFriends) {
        setMaxHeight(`${listRef.current.scrollHeight}px`); // expand
      } else {
        const itemHeight = 60; // approx height of 1 friend item including margin
        const visibleCount = Math.min(3, novelist?.friends.length ?? 0);
        setMaxHeight(`${itemHeight * visibleCount}px`); // collapse to 3 items
      }
    }
  }, [showAllFriends, novelist?.friends, listRef]);

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

  const toggleFriends = () => setShowAllFriends((prev) => !prev);

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

  const toStoryBoardsPage = () => {
    routeToPage(ROUTES.Profile.View(username).Storyboards);
  };

  // TODO: GetConversationId from username and if not exists then open a dialogue to send a message which should create a new conversation in the backend.
  const toMessagePage = () => {
    //window.location.replace(`${process.env.RP_CHAT_URL}?id=${username}`);
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
                onClick: handleNotImplemented,
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

  useEffect(() => {
    if (authState === "UNINITIALIZED") {
      routeToPage(ROUTES.Onboarding);
      return;
    }

    if (authState === "LOADING" || novelist) return;

    if (isCurrentUser) {
      setNovelist(userNovelist);
      stopPageLoading();
      return;
    }

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
        heading={`Report ${username}?`}
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
                        icon: <FcSupport size={22} />,
                        label: `Contact support`,
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
                <VscVerifiedFilled size={20} color="rgb(28, 123, 201)" />
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
                !!(novelist?.friends && novelist.friends.length > 0)
              }
            >
              <Flex
                id="profile-tour-step-7"
                style={{ width: "100%" }}
                direction="column"
              >
                <S.SubText>{`Friends (${novelist?.friends.length})`}</S.SubText>

                <S.FriendList ref={listRef} maxHeight={maxHeight}>
                  {novelist?.friends.map((friend) => (
                    <ProfileFriendListItem key={friend.id} friend={friend} />
                  ))}
                </S.FriendList>

                {novelist?.friends !== undefined &&
                  novelist?.friends.length > 3 && (
                    <S.SeeMoreLink onClick={toggleFriends}>
                      <span>
                        {showAllFriends ? "Show less" : "Show all"}{" "}
                        {showAllFriends ? <GoChevronUp /> : <GoChevronDown />}
                      </span>
                    </S.SeeMoreLink>
                  )}
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
            <S.SubText>
              {activities?.length === 0
                ? "No Updates"
                : authState === "LOGGED_IN" && username === user?.username
                  ? "Your Updates"
                  : `Updates by ${username}`}
            </S.SubText>
            <S.ActivitiesContainer>
              {authState === "LOGGED_IN" &&
                username === user?.username &&
                novelist !== null && (
                  <>
                    {isMobile ? (
                      <S.AddPromptButton
                        type="button"
                        onClick={() =>
                          routeToPage(
                            ROUTES.Compose({
                              dropdownSelection: "ALL",
                              type: "prompt",
                            }),
                          )
                        }
                      >
                        + Add Prompt
                      </S.AddPromptButton>
                    ) : (
                      <PromptInput
                        type="prompt"
                        onSend={refetchAcitivities}
                        dropdownSelection="ALL"
                        initialSelection={novelistToSource(novelist)}
                      />
                    )}
                  </>
                )}
              {activities?.map((activity) => (
                <ActivityBox
                  key={activity?.id}
                  activity={activity}
                ></ActivityBox>
              ))}
            </S.ActivitiesContainer>
          </S.ContentInner>
        </S.ContentRight>
      </S.Content>
    </>
  );
}
