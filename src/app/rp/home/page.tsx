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

export default function HomePage() {
  const { state, user, novelist: useNovelist } = useAuthContext();
  const [strangers, setStrangers] = useState<Novelist[]>();
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

  useEffect(() => {
    if (state === "LOADING") return;
    fetchStrangers();
    fetchStrangerMuses();
    fetchFriendsMuses();
    fetchRandomStories();
  }, [state]);

  return (
    <>
      <ShouldRender if={loading && state !== "LOADING"}>
        <PageLoader />
      </ShouldRender>
      <S.HeaderContainer>
        <S.ContentHeader>Dashboard</S.ContentHeader>
      </S.HeaderContainer>
      <S.HeaderContainer>
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
      </S.HeaderContainer>
      <S.HeaderContainer>
        <S.SubText>Muses by your friends</S.SubText>
        <S.PartitionContainer>
          {friendsMuses &&
            friendsMuses.map((unknownMuse) => (
              <MuseCard key={unknownMuse?.id} muse={unknownMuse}></MuseCard>
            ))}
        </S.PartitionContainer>
      </S.HeaderContainer>
      <S.HeaderContainer>
        <S.SubText>Add new novelists</S.SubText>
        <S.PartitionContainer>
          {strangers &&
            strangers.map((stranger) => (
              <StrangerCard
                key={stranger?.username}
                novelist={stranger}
              ></StrangerCard>
            ))}
        </S.PartitionContainer>
      </S.HeaderContainer>
      <S.HeaderContainer>
        <S.SubText>Interact with new muses</S.SubText>
        <S.PartitionContainer>
          {unknownMuses &&
            unknownMuses.map((unknownMuse) => (
              <MuseCard key={unknownMuse?.id} muse={unknownMuse}></MuseCard>
            ))}
        </S.PartitionContainer>
      </S.HeaderContainer>
    </>
  );
}
