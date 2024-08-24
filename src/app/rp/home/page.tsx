"use client";

import { ShouldRender } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { useAuthContext } from "@/hooks";
import { Muse, Novelist, StoryBoard } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as S from "./styles";
import { StrangerCard } from "@/components/stranger-card/page";
import {
  getMusesAction,
  getRandomStories,
  getStrangerNovelistsAction,
} from "./actions";
import MuseCard from "@/components/muse-card";
import StoryCard from "@/components/story-card";
import { getFriendRequests } from "../novelists/actions";
import { FriendListItem } from "@/components/friend-list-item/page";

export default function HomePage() {
  const { state, user, novelist } = useAuthContext();
  const [strangers, setStrangers] = useState<Novelist[]>();
  const [friendRequests, setFriendRequests] = useState<Novelist[] | null>(null);
  const [storyboards, setStoryboards] = useState<StoryBoard[]>();
  const [unknownMuses, setUnknownMuses] = useState<Muse[]>();
  const [friendsMuses, setFriendsMuses] = useState<Muse[]>();
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

  const fetchNotifications = async () => {
    setLoading(true);
    const _friendRequests = await getFriendRequests();

    if (!_friendRequests || "message" in _friendRequests) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setFriendRequests(_friendRequests);
  };

  useEffect(() => {
    if (state === "LOADING") return;
    fetchStrangers();
    fetchStrangerMuses();
    fetchFriendsMuses();
    fetchRandomStories();
    fetchNotifications();
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
            <S.SubText>Read Stories</S.SubText>
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
          <S.ContentContainer>
            <S.SubText>Muses by your friends</S.SubText>
            <S.PartitionContainer>
              {friendsMuses &&
                friendsMuses.map((unknownMuse) => (
                  <MuseCard key={unknownMuse?.id} muse={unknownMuse}></MuseCard>
                ))}
            </S.PartitionContainer>
          </S.ContentContainer>
          <S.ContentContainer>
            <S.SubText>Friend Requests & Suggestions</S.SubText>
            <S.PartitionContainer>
              {friendRequests &&
                friendRequests.map((request) => (
                  <StrangerCard
                    key={request?.username}
                    novelist={request}
                    isRequest={true}
                  ></StrangerCard>
                ))}
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
            <S.SubText>Interact with new muses</S.SubText>
            <S.PartitionContainer>
              {unknownMuses &&
                unknownMuses.map((unknownMuse) => (
                  <MuseCard key={unknownMuse?.id} muse={unknownMuse}></MuseCard>
                ))}
            </S.PartitionContainer>
          </S.ContentContainer>
        </S.RightWrapperContainer>
      </S.ParentWrapperContainer>
    </>
  );
}
