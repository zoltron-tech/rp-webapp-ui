"use client";

import { Flex } from "@novelist-world/ui";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FcCalendar } from "react-icons/fc";
import { GiCircleClaws, GiGoldShell, GiStarSwirl } from "react-icons/gi";
import {
  TbCircleLetterG,
  TbCircleLetterP,
  TbCircleLetterS,
  TbSquareRoundedLetterSFilled,
} from "react-icons/tb";
import { MusesPill } from "@/components";
import ActivityBox from "@/components/activity-box";
import { ButtonGroup, type ButtonInfo } from "@/components/button-group";
import { ShouldRender, Username } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import { PageLoader } from "@/components/layout";
import MuseListItem from "@/components/muse-list-item";
import PromptInput from "@/components/prompt-input";
import StoryCard from "@/components/story-card";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
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
  sendFriendRequest,
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
  const user = useGlobalState("user");
  const userNovelist = useGlobalState("novelist");
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [loading, setLoading] = useState(true);
  const username = params?.slug as string;
  const isCurrentUser = username === user?.username;
  const { activities, refetch: refetchAcitivities } =
    useGetActivities(username);
  const [storyBoards, setStories] = useState<StoryBoard[] | null>(null);
  const { push } = useRouter();
  const setGlobalState = useGlobalStoreSet();

  const handleButtonClick = () => {};

  const toTiersPage = () => {
    push(ROUTES.Tiers);
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
            <S.ButtonsContainer>
              <ButtonGroup
                buttons={
                  authState === "LOGGED_IN" && username !== user?.username
                    ? fetchAppropriateButtons(novelist?.connection)
                    : LoggedInSelfButtons
                }
              />
            </S.ButtonsContainer>
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
