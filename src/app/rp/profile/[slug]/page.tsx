"use client";

import { Flex } from "@novelist-world/ui";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BiSolidMessage } from "react-icons/bi";
import { BsPersonFillCheck, BsPersonFillUp, BsThreeDots } from "react-icons/bs";
import { FcCalendar } from "react-icons/fc";
import { GiCheckMark, GiCrossMark } from "react-icons/gi";
import { IoMdPersonAdd } from "react-icons/io";
import { IoCopySharp, IoPersonRemove } from "react-icons/io5";
import { MdOutlineAppBlocking } from "react-icons/md";
import { RiFlagFill, RiShareBoxFill } from "react-icons/ri";
import { SiMdbook } from "react-icons/si";
import { MusesPill } from "@/components";
import ActivityBox from "@/components/activity-box";
import type { ButtonInfo } from "@/components/button-group";
import { ShouldRender, Username } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import { PageLoader } from "@/components/layout";
import MuseListItem from "@/components/muse-list-item";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import PromptInput from "@/components/prompt-input";
import StoryCard from "@/components/story-card";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Novelist, StoryBoard } from "@/types";
import type { Activity } from "@/types/activity";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import { getUserActivities } from "../../home/actions";
import { getNovelistAction } from "../../novelists/actions";
import { getAllStoryboardsByUsernameAction } from "../../story/actions";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteFriendRequest,
  reportProfile,
  sendFriendRequest,
  unfriendNovelist,
} from "../actions";
import ExpandableText from "./expandable-text";
import * as S from "./styles";

const useGetActivities = (username: string) => {
  const [activities, setActivities] = useState<Activity[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const _activities = (await getUserActivities(username, 1, 10)) ?? [];

    if (_activities && "message" in _activities) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(false);
    setActivities(_activities);
  }, [username]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, error, loading, refetch: fetchActivities };
};

export default function UserProfilePage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const [showUnfriendAlert, setShowUnfriendAlert] = useState(false);
  const [showBlockAlert, setShowBlockAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const user = useGlobalState("user");
  const userNovelist = useGlobalState("novelist");
  const set = useGlobalStoreSet();
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [loading, setLoading] = useState(true);
  const username = params?.slug as string;
  const isCurrentUser = username === user?.username;
  const { activities, refetch: refetchAcitivities } =
    useGetActivities(username);
  const [storyBoards, setStories] = useState<StoryBoard[] | null>(null);
  const { push } = useRouter();
  const setGlobalState = useGlobalStoreSet();
  const { successToast, warningToast, errorToast } = useUIContext();

  const handleButtonClick = () => {};

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

  const toMusesPage = () => {
    push(ROUTES.Profile.View(username).Muses);
  };

  const toStoryBoardsPage = () => {
    push(ROUTES.Profile.View(username).Storyboards);
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

      set((prev) => {
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

    const response = await reportProfile(novelist.id);
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
    setLoading(true);
    const _muses = await getAllStoryboardsByUsernameAction(username);

    if (!_muses || "message" in _muses) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setStories(_muses);
  };

  const IncomingRequestButtons: ButtonInfo[] = [
    {
      label: "Accept",
      onClick: handleAcceptFriendRequest,
      variant: "positive",
    },
    {
      label: "Decline",
      onClick: handleDeleteFriendRequest,
      variant: "negative",
    },
    // { onClick: toMessagePage, label: "Message", variant: "action" },
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Story Boards", variant: "action" },
  ];

  const OutgoingRequestButtons: ButtonInfo[] = [
    {
      label: "Friend request sent",
      onClick: handleCancelFriendRequest,
      variant: "primary",
    },
    // { onClick: toMessagePage, label: "Message", variant: "action" },
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Stories", variant: "action" },
  ];

  const FriendButtons: ButtonInfo[] = [
    { label: "Friends", onClick: handleButtonClick, variant: "primary" },
    { label: "Message", onClick: toMessagePage, variant: "action" },
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Stories", variant: "action" },
  ];

  const StrangerButtons: ButtonInfo[] = [
    {
      label: "Add friend",
      onClick: handleSendFriendRequest,
      variant: "primary",
    },
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Stories", variant: "action" },
  ];

  const LoggedInSelfButtons: ButtonInfo[] = [
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Stories", variant: "action" },
  ];

  const fetchAppropriateButtons = (connection: string | null | undefined) => {
    if (!connection) return StrangerButtons;

    switch (connection) {
      case "FRIEND":
        return FriendButtons;
      case "FRIEND_REQUEST_SENT":
        return OutgoingRequestButtons;
      case "FRIEND_REQUEST_RECEIVED":
        return IncomingRequestButtons;
      default:
        return StrangerButtons;
    }
  };

  const renderConnectionDropdown = (
    connection: string | null | undefined,
    username: string,
  ) => {
    switch (connection) {
      case "FRIEND":
        return (
          <AppDropdownMenu
            trigger={<BsPersonFillCheck size={18} />}
            items={[
              {
                icon: <SiMdbook />,
                label: `Invite ${username} to a story`,
                onClick: handleNotImplemented,
              },
              {
                icon: <BiSolidMessage />,
                label: `Message ${username}`,
                onClick: handleNotImplemented,
              },
              {
                separator: true,
              },
              {
                icon: <IoPersonRemove />,
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
            trigger={<IoMdPersonAdd size={18} />}
            items={[
              {
                icon: <IoMdPersonAdd />,
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
    setLoading(true);
    const _novelist = await getNovelistAction(username);
    if (_novelist === null && isCurrentUser) {
      setGlobalState({ authState: "UNINITIALIZED" });
      push(ROUTES.Onboarding);
      return;
    }

    if (!_novelist || "message" in _novelist) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setNovelist(_novelist);
  };

  useEffect(() => {
    if (authState === "UNINITIALIZED") {
      push(ROUTES.Onboarding);
      return;
    }

    if (authState === "LOADING" || novelist) return;

    if (isCurrentUser) {
      setNovelist(userNovelist);
      fetchStoryboards();
      setLoading(false);
      return;
    }

    fetchNovelist(username);
    fetchStoryboards();
  }, [authState]);

  return (
    <>
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
        heading={`Block ${username}?`}
        text={`${username} will no longer be able to find you or view anything related to you or your characters. Are you sure you want to block ${username}?`}
        open={showBlockAlert}
        onOpenChange={setShowBlockAlert}
        onConfirm={handleNotImplemented}
        actionButtonLabel="Block"
      />
      <ShouldRender if={loading && authState !== "LOADING"}>
        <PageLoader />
      </ShouldRender>

      <S.Banner
        src={
          novelist?.image && !novelist.image.endsWith(".gif")
            ? novelist.image
            : ""
        }
      />
      <S.Content>
        <S.ContentRight>
          <Flex
            direction="row"
            justify="flex-start"
            style={{ marginBottom: "-70px", width: "90%" }}
          >
            <S.Avatar
              src={novelist?.image ?? null}
              alt={novelist?.firstName ?? "Avatar"}
            />
            <S.AvatarMobile
              src={novelist?.image ?? null}
              alt="profile-picture"
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
                <ShouldRender if={!isCurrentUser}>
                  <AppDropdownMenu
                    trigger={<BsThreeDots size={18} />}
                    items={[
                      {
                        icon: <IoCopySharp />,
                        label: `Copy username`,
                        onClick: handleCopyUsername,
                      },
                      {
                        icon: <RiShareBoxFill />,
                        label: `Share profile`,
                        onClick: handleShareProfile,
                      },
                      {
                        separator: true,
                      },
                      {
                        icon: <RiFlagFill />,
                        label: `Report ${username}`,
                        onClick: () => setShowReportAlert(true),
                        variant: "danger",
                      },
                      {
                        icon: <MdOutlineAppBlocking />,
                        label: `Block ${username}`,
                        onClick: () => setShowBlockAlert(true),
                        variant: "danger",
                      },
                    ]}
                  />
                </ShouldRender>
              </S.ProfileDropdownMenuContainer>
            </ShouldRender>
            <Flex>
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
              <Username username={username} primary />
            </S.UsernameContainer>
            <Flex>
              <S.InfoTextBold>{novelist?.friendsCount}</S.InfoTextBold>{" "}
              <S.InfoText> Friends </S.InfoText>
              <S.InfoTextBold>{novelist?.museCount}</S.InfoTextBold>{" "}
              <S.InfoText> Characters </S.InfoText>
              <FcCalendar />
              <S.InfoText>
                Joined {toFormattedDate(novelist?.createdAt)}
              </S.InfoText>
            </Flex>
            {/* <S.ButtonsContainer>
              <ButtonGroup
                buttons={
                  authState === "LOGGED_IN" && username !== user?.username
                    ? fetchAppropriateButtons(novelist?.connection)
                    : LoggedInSelfButtons
                }
              />
            </S.ButtonsContainer> */}
            <ShouldRender
              if={!!(novelist?.about && novelist?.about.length > 0)}
            >
              <S.SubText>About</S.SubText>
              <S.AboutContainer>
                <ExpandableText
                  text={novelist?.about ?? ""}
                  collapsedHeight={200}
                />
              </S.AboutContainer>
            </ShouldRender>
            <S.SubText>
              {novelist?.museCount === 0
                ? "No characters yet"
                : `Characters (${novelist?.museCount})`}
            </S.SubText>
            <ShouldRender
              if={!!(novelist?.museCount && novelist.museCount > 0)}
            >
              <S.MuseList>
                {novelist?.muses.slice(0, 3).map((muse) => (
                  <MuseListItem key={muse.id} muse={muse}></MuseListItem>
                ))}
              </S.MuseList>
              <S.SeeMoreLink onClick={toMusesPage}>see all...</S.SeeMoreLink>
            </ShouldRender>
            <S.MusePillContainer>
              <MusesPill
                title="FRIENDS"
                pillType="FRIENDS"
                novelist={novelist}
                expandable={true}
              />
            </S.MusePillContainer>
            <S.SubText>
              {storyBoards?.length === 0
                ? "No stories yet"
                : `Stories (${storyBoards?.length})`}
            </S.SubText>
            <ShouldRender if={!!(storyBoards && storyBoards?.length > 0)}>
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
            <S.ContentContainer>
              {authState === "LOGGED_IN" && username === user?.username && (
                <PromptInput
                  type={"prompt"}
                  muses={novelist?.muses || []}
                  onSend={refetchAcitivities}
                />
              )}
              {activities?.map((activity) => (
                <ActivityBox
                  key={activity?.id}
                  activity={activity}
                ></ActivityBox>
              ))}
            </S.ContentContainer>
          </S.ContentInner>
        </S.ContentRight>
      </S.Content>
    </>
  );
}
