"use client";

import { useAuthContext } from "@/hooks";
import { useParams, useRouter } from "next/navigation";

import { MusesPill } from "@/components";
import { ButtonGroup, ButtonInfo } from "@/components/button-group";
import { Button, ShouldRender, Username } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { Quote } from "@/components/novelist-card/styles";
import { Novelist, StoryBoard } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { getNovelistAction } from "../../novelists/actions";

import { API_MESSAGE } from "@/utils/constants";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteFriendRequest,
  sendFriendRequest,
} from "../actions";
import * as S from "./styles";
import { Activity } from "@/types/activity";
import { getUserActivities } from "../../home/actions";
import ActivityBox from "@/components/activity-box";
import { getAllStoryboardsByUsernameAction } from "../../story/actions";
import StoryCard from "@/components/story-card";
import { TbSquareRoundedLetterSFilled } from "react-icons/tb";
import { FcCalendar } from "react-icons/fc";
import {
  TbCircleLetterS,
  TbCircleLetterG,
  TbCircleLetterP,
} from "react-icons/tb";
import { GiCircleClaws } from "react-icons/gi";
import { GiGoldShell } from "react-icons/gi";
import { GiStarSwirl } from "react-icons/gi";
import { RiUserAddLine } from "react-icons/ri";

import { Container, Flex } from "@novelist-world/ui";
import PromptInput from "@/components/prompt-input";
import { Z_INDEX } from "@/theme/geometry";
import { toFormattedDate } from "@/utils/helpers";
import MuseListItem from "@/components/muse-list-item/intex";

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

  return { activities, loading, error, refetch: fetchActivities };
};

export default function UserProfilePage({}) {
  const params = useParams();
  const { state, user, novelist: useNovelist } = useAuthContext();
  const [novelist, setNovelist] = useState<Novelist | null>(null);
  const [loading, setLoading] = useState(true);
  const username = params?.slug as string;
  const isCurrentUser = username === user?.username;
  const { activities, refetch: refetchAcitivities } =
    useGetActivities(username);
  const [storyBoards, setStories] = useState<StoryBoard[] | null>(null);
  const { push } = useRouter();

  const handleButtonClick = () => {};

  const toTiersPage = () => {
    push(`/rp/tiers`);
  };

  const toMusesPage = () => {
    push(`/rp/profile/${username}/muses`);
  };

  const toStoryBoardsPage = () => {
    push(`/rp/profile/${username}/storyboards`);
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
      onClick: handleAcceptFriendRequest,
      label: "Accept",
      variant: "positive",
    },
    {
      onClick: handleDeleteFriendRequest,
      label: "Decline",
      variant: "negative",
    },
    // { onClick: toMessagePage, label: "Message", variant: "action" },
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Story Boards", variant: "action" },
  ];

  const OutgoingRequestButtons: ButtonInfo[] = [
    {
      onClick: handleCancelFriendRequest,
      label: "Friend request sent",
      variant: "primary",
    },
    // { onClick: toMessagePage, label: "Message", variant: "action" },
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Stories", variant: "action" },
  ];

  const FriendButtons: ButtonInfo[] = [
    { onClick: handleButtonClick, label: "Friends", variant: "primary" },
    { onClick: toMessagePage, label: "Message", variant: "action" },
    // { onClick: toMusesPage, label: "Muses", variant: "action" },
    // { onClick: toStoryBoardsPage, label: "Stories", variant: "action" },
  ];

  const StrangerButtons: ButtonInfo[] = [
    {
      onClick: handleSendFriendRequest,
      label: "Add friend",
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
      push(`/rp/profile/edit`);
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
    if (state === "LOADING" || novelist) return;

    if (isCurrentUser && useNovelist) {
      setNovelist(useNovelist);
      fetchStoryboards();
      setLoading(false);
      return;
    }

    fetchNovelist(username);
    fetchStoryboards();
  }, [state]);

  return (
    <>
      <ShouldRender if={loading && state !== "LOADING"}>
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
              src={novelist?.image || ""}
              alt="profile-picture"
              size={250}
            />
            <S.AvatarMobile
              src={novelist?.image || ""}
              alt="profile-picture"
              size={130}
            />
            <S.ExtendedBadge
              tier={novelist?.tier.name || "standard"}
              className={`badge-${novelist?.tier.name?.toLowerCase()}`}
              onClick={toTiersPage}
            >
              {novelist?.tier.name == "STANDARD" && (
                <TbSquareRoundedLetterSFilled />
              )}
              {novelist?.tier.name == "SILVER" && <GiCircleClaws />}
              {novelist?.tier.name == "SILVER" && (
                <TbCircleLetterS className="letter" />
              )}
              {novelist?.tier.name == "GOLD" && <GiGoldShell />}
              {novelist?.tier.name == "GOLD" && (
                <TbCircleLetterG className="letter" />
              )}
              {novelist?.tier.name == "PREMIUM" && <GiStarSwirl />}
              {novelist?.tier.name == "PREMIUM" && (
                <TbCircleLetterP className="letter" />
              )}
            </S.ExtendedBadge>
            <S.ButtonsContainer>
              <ButtonGroup
                buttons={
                  state == "LOGGED_IN" && username !== user?.username
                    ? fetchAppropriateButtons(novelist?.connection)
                    : LoggedInSelfButtons
                }
              />
            </S.ButtonsContainer>
          </Flex>
          <S.ContentInner>
            <S.NameMobile>
              {novelist?.firstName} {novelist?.lastName}
            </S.NameMobile>
            <S.UsernameContainer>
              <Username username={username} primary />
            </S.UsernameContainer>
            <Flex>
              <S.InfoTextBold>{novelist?.friendsCount}</S.InfoTextBold>{" "}
              <S.InfoText> Friends </S.InfoText>
              <S.InfoTextBold>{novelist?.museCount}</S.InfoTextBold>{" "}
              <S.InfoText> Muses </S.InfoText>
              <FcCalendar />
              <S.InfoText>
                Joined {toFormattedDate(novelist?.createdAt)}
              </S.InfoText>
            </Flex>
            <S.NoteContainer>
              <Quote>{novelist?.note}</Quote>
            </S.NoteContainer>
            <S.SubText>
              {storyBoards?.length === 0
                ? "No Stories"
                : "Stories (" + storyBoards?.length + ")"}
            </S.SubText>
            <ShouldRender
              if={storyBoards && storyBoards?.length > 0 ? true : false}
            >
              <S.ContentContainer>
                <S.PartitionContainer>
                  {storyBoards &&
                    storyBoards.map((storyBoard) => (
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
                ? "No Muses"
                : "Muses (" + novelist?.museCount + ")"}
            </S.SubText>
            <ShouldRender
              if={novelist?.museCount && novelist.museCount > 0 ? true : false}
            >
              <S.MuseList>
                {novelist &&
                  novelist.muses
                    .slice(0, 3)
                    .map((muse) => (
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
                : state == "LOGGED_IN" && username === user?.username
                ? "Your Updates"
                : "Updates by " + username}
            </S.SubText>
            <S.ContentContainer>
              {state == "LOGGED_IN" && username === user?.username && (
                <PromptInput
                  type={"prompt"}
                  muses={novelist?.muses || []}
                  onSend={refetchAcitivities}
                />
              )}
              {activities &&
                activities.map((activity) => (
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
