"use client";

import { ShouldRender } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { useAuthContext } from "@/hooks";
import { Muse, Novelist, NovelistWorldNotification, StoryBoard } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as S from "./styles";
import { StrangerCard } from "@/components/stranger-card/page";
import {
  getFriendActivities,
  getMusesAction,
  getMusesWithVideosAction,
  getRandomStories,
  getStrangerNovelistsAction,
} from "./actions";
import MuseCard from "@/components/muse-card";
import StoryCard from "@/components/story-card";
import { getNotifications } from "../novelists/actions";
import { FriendListItem } from "@/components/friend-list-item/page";
import { Activity } from "@/types/activity";
import { ActivityBox } from "@/components/activity-box";
import VideoCard from "@/components/video-card";

export default function HomePage() {
  const { state, user, novelist } = useAuthContext();
  const [strangers, setStrangers] = useState<Novelist[]>();
  const [friendRequests, setFriendRequests] = useState<
    NovelistWorldNotification[] | null
  >(null);
  const [storyboards, setStoryboards] = useState<StoryBoard[]>();
  const [unknownMuses, setUnknownMuses] = useState<Muse[]>();
  const [friendsMuses, setFriendsMuses] = useState<Muse[]>();
  const [friendsMusesWithVideos, setFriendsMusesWithVideos] =
    useState<Muse[]>();
  const [activities, setActivities] = useState<Activity[]>();
  const [loading, setLoading] = useState(false);
  const { push } = useRouter();

  const fetchStrangers = async () => {
    setLoading(true);
    const _strangers = await getStrangerNovelistsAction(1, 20);

    if (!_strangers || "message" in _strangers) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setStrangers(_strangers);
  };

  const fetchStrangerMuses = async () => {
    setLoading(true);
    const _muses = await getMusesAction(1, 20, "unknown");

    if (!_muses || "message" in _muses) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setUnknownMuses(_muses);
  };

  const fetchRandomStories = async () => {
    setLoading(true);
    const _stories = await getRandomStories(1, 20);

    if (!_stories || "message" in _stories) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setStoryboards(_stories);
  };

  const fetchFriendsMuses = async () => {
    setLoading(true);
    const _muses = await getMusesAction(1, 20, "friends");

    if (!_muses || "message" in _muses) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setFriendsMuses(_muses);
  };

  const fetchFriendsMusesWithVideos = async () => {
    setLoading(true);
    const _muses = await getMusesWithVideosAction(1, 20, "friends");

    if (!_muses || "message" in _muses) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setFriendsMusesWithVideos(_muses);
  };

  const fetchFriendsActivities = async () => {
    setLoading(true);
    const _activities = await getFriendActivities(1, 10, "friends");

    if (!_activities || "message" in _activities) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setActivities(_activities);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    const _notification = await getNotifications();

    if (!_notification || "message" in _notification) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setFriendRequests(_notification);
  };

  useEffect(() => {
    if (state === "LOADING") return;
    fetchStrangers();
    fetchStrangerMuses();
    fetchFriendsMuses();
    fetchFriendsMusesWithVideos();
    fetchRandomStories();
    fetchNotifications();
    fetchFriendsActivities();
  }, [state]);

  return (
    <>
      <ShouldRender if={loading && state !== "LOADING"}>
        <PageLoader />
      </ShouldRender>
      <S.ParentWrapperContainer>
        <S.LeftWrapperContainer>
          <S.ContentContainer>
            <S.SubText>Friends</S.SubText>
            <S.ListContainer>
              <ShouldRender
                if={friendsMuses === undefined || friendsMuses.length == 0}
              >
                <S.SubText></S.SubText>
                <S.SubText></S.SubText>
                <S.SubText>No friends yet</S.SubText>
              </ShouldRender>
              {novelist &&
                novelist.friends.map((friend) => (
                  <FriendListItem
                    key={friend?.username}
                    novelist={friend}
                    isRequest={false}
                  ></FriendListItem>
                ))}
            </S.ListContainer>
          </S.ContentContainer>
        </S.LeftWrapperContainer>
        <S.RightWrapperContainer>
          <S.ContentContainer>
            <S.SubText>Vidoes by your friends</S.SubText>
            <S.PartitionContainer>
              {friendsMusesWithVideos &&
                friendsMusesWithVideos.map((friendMuseWithVideo) => (
                  <VideoCard
                    key={friendMuseWithVideo?.id}
                    muse={friendMuseWithVideo}
                  ></VideoCard>
                ))}
            </S.PartitionContainer>
          </S.ContentContainer>
          <S.ContentContainer>
            <S.SubText>Dive into the Stories</S.SubText>
            <S.PartitionContainer>
              {storyboards &&
                storyboards.map((storyBoard) => (
                  <StoryCard
                    key={storyBoard?.id}
                    storyBoard={storyBoard}
                  ></StoryCard>
                ))}
            </S.PartitionContainer>
          </S.ContentContainer>
          <ShouldRender
            if={friendsMuses !== undefined && friendsMuses.length > 0}
          >
            <S.ContentContainer>
              <S.SubText>characters by your friends</S.SubText>
              <S.PartitionContainer>
                {friendsMuses &&
                  friendsMuses.map((knownMuse) => (
                    <MuseCard key={knownMuse?.id} muse={knownMuse}></MuseCard>
                  ))}
              </S.PartitionContainer>
            </S.ContentContainer>
          </ShouldRender>
          <S.ContentContainer>
            <S.SubText>Friend Requests & Suggestions</S.SubText>
            <S.PartitionContainer>
              {strangers &&
                strangers.map((stranger) => (
                  <StrangerCard
                    key={stranger?.username}
                    novelist={stranger}
                    isRequest={false}
                  ></StrangerCard>
                ))}
            </S.PartitionContainer>
          </S.ContentContainer>
          <S.ContentContainer>
            <S.SubText>Meet New Characters</S.SubText>
            <S.PartitionContainer>
              {unknownMuses &&
                unknownMuses.map((unknownMuse) => (
                  <MuseCard key={unknownMuse?.id} muse={unknownMuse}></MuseCard>
                ))}
            </S.PartitionContainer>
          </S.ContentContainer>
          <S.ContentContainer>
            <S.SubText>Updates from your friends</S.SubText>
            {activities &&
              activities.map((activity) => (
                <ActivityBox
                  key={activity?.id}
                  activity={activity}
                ></ActivityBox>
              ))}
          </S.ContentContainer>
        </S.RightWrapperContainer>
      </S.ParentWrapperContainer>
    </>
  );
}
