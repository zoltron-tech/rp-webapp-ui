"use client";

import { useEffect, useState } from "react";
import { ActivityBox } from "@/components/activity-box";
import { ShouldRender } from "@/components/common";
import HomeTourGuide from "@/components/home-tour-guide";
import MuseCard from "@/components/muse-card";
import { Prompt as PromptComponent } from "@/components/prompt";
import { SideBarFriendListItem } from "@/components/sidebar-friend-list-item";
import { StrangerCard } from "@/components/stranger-card/page";
import VideoCard from "@/components/video-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type {
  Muse,
  Novelist,
  NovelistWorldNotification,
  Prompt,
  StoryBoard,
} from "@/types";
import type { Activity } from "@/types/activity";
import { getNewPromptsAction } from "../explore-prompts/actions";
import {
  getFriendActivities,
  getMusesAction,
  getMusesWithVideosAction,
  getRandomStories,
  getStrangerNovelistsAction,
} from "./actions";
import * as S from "./styles";

export default function HomePage() {
  const [startTour, setStartTour] = useState(false);
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const [strangers, setStrangers] = useState<Novelist[]>();
  const [_friendRequests, _setFriendRequests] = useState<
    NovelistWorldNotification[] | null
  >(null);
  const [storyboards, setStoryboards] = useState<StoryBoard[]>();
  const [prompts, setPrompts] = useState<Prompt[]>();
  const [unknownMuses, setUnknownMuses] = useState<Muse[]>();
  const [friendsMuses, setFriendsMuses] = useState<Muse[]>();
  const [friendsMusesWithVideos, setFriendsMusesWithVideos] =
    useState<Muse[]>();
  const [activities, setActivities] = useState<Activity[]>();
  const { baseDataLoader } = usePageRouter();

  const handleStartTour = () => {
    setStartTour(true);
  };

  const handleEndTour = () => {
    setStartTour(false);
  };

  const fetchStrangers = async () => {
    const _strangers = await getStrangerNovelistsAction(1, 20);

    if (_strangers && !("message" in _strangers)) setStrangers(_strangers);
  };

  const fetchStrangerMuses = async () => {
    const _muses = await getMusesAction(1, 20, "unknown");
    if (_muses && !("message" in _muses)) setUnknownMuses(_muses);
  };

  const fetchFriendsMuses = async () => {
    const _muses = await getMusesAction(1, 20, "friends");
    if (_muses && !("message" in _muses)) setFriendsMuses(_muses);
  };

  const fetchFriendsMusesWithVideos = async () => {
    const _muses = await getMusesWithVideosAction(1, 20, "friends");

    if (_muses && !("message" in _muses)) setFriendsMusesWithVideos(_muses);
  };

  const fetchFriendsActivities = async () => {
    const _activities = await getFriendActivities(1, 10, "friends");
    if (_activities && !("message" in _activities)) setActivities(_activities);
  };

  const fetchOpenPrompts = async () => {
    const _prompts = await getNewPromptsAction(1, 5);
    if (_prompts && !("message" in _prompts)) setPrompts(_prompts);
  };

  const fetchData = async () =>
    baseDataLoader(async () => {
      await Promise.all([
        fetchStrangers(),
        fetchStrangerMuses(),
        fetchFriendsMuses(),
        // fetchFriendsMusesWithVideos(),
        //fetchRandomStories(),
        fetchFriendsActivities(),
        // fetchOpenPrompts(),
      ]);

      return {
        success: true,
      }; // prevents error
    });

  useEffect(() => {
    if (authState === "LOADING") return;
    fetchData();
  }, [authState]);

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
                <S.SubText>No friends yet</S.SubText>
              </ShouldRender>
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
        <S.RightWrapperContainer>
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
              </S.PartitionContainer>
            </S.ContentContainer>
          </ShouldRender>
          <S.ContentContainer id="home-tour-step-3">
            <S.SubText>Friend Suggestions</S.SubText>
            <S.PartitionContainer>
              {strangers?.map((stranger) => (
                <StrangerCard
                  key={stranger?.username}
                  novelist={stranger}
                  isRequest={false}
                ></StrangerCard>
              ))}
            </S.PartitionContainer>
          </S.ContentContainer>
          <S.ContentContainer id="home-tour-step-4">
            <S.SubText>Public Characters out there</S.SubText>
            <S.PartitionContainer>
              {unknownMuses?.map((unknownMuse) => (
                <MuseCard key={unknownMuse?.id} muse={unknownMuse}></MuseCard>
              ))}
            </S.PartitionContainer>
          </S.ContentContainer>
          {/* <S.ContentContainer>
          <S.SubText>Interactions</S.SubText>
          {prompts?.map((prompt) => (
            <PromptComponent key={prompt.id} prompt={prompt} />
          ))}
        </S.ContentContainer> */}
          <S.ContentContainer>
            <S.SubText id="home-tour-step-5">
              Updates from your friends
            </S.SubText>
            {activities?.map((activity) => (
              <ActivityBox key={activity?.id} activity={activity}></ActivityBox>
            ))}
          </S.ContentContainer>
        </S.RightWrapperContainer>
      </S.ParentWrapperContainer>
    </S.PageContainer>
  );
}
