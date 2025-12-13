"use client";

import { Flex } from "@novelist-world/ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGlobeAmericas, FaUserFriends } from "react-icons/fa";
import { ShouldRender, Username } from "@/components/common";
import { PageLoaderTypeWriter } from "@/components/layout/loader-2/PageLoaderTypewriter";
import { MusesPill } from "@/components/muses-pill";
import StoryCardEvent from "@/components/story-event-card";
import { TagsContainer } from "@/components/tags-container";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { StoryBoard } from "@/types";
import { INITIAL_STORY_BOARD_EVENT } from "@/utils/constants";
import { getStoryboardAction } from "../actions";
import * as S from "./styles";

const renderPrivacyIcon = (privacy: string | undefined) => {
  switch (privacy) {
    case "MEMBERS":
      return (
        <S.IconWrapper title="Friends Only">
          <FaUserFriends size={20} />
        </S.IconWrapper>
      );
    case "PUBLIC":
      return (
        <S.IconWrapper title="Public">
          <FaGlobeAmericas size={20} />
        </S.IconWrapper>
      );
    default:
      return null;
  }
};

export default function UserProfilePage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  const storyboardId = params?.slug as string;
  const { baseDataLoader } = usePageRouter();

  const isAdmin = () => {
    if (!storyboard || !user?.username) return false;

    return storyboard.members.some(
      (member) => member.username === user.username && member.isAdmin === true,
    );
  };

  const fetchStoryboard = async () => {
    const _storyboard = await baseDataLoader(() =>
      getStoryboardAction(storyboardId),
    );
    setStoryBoard(_storyboard);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyboard) return;

    fetchStoryboard();
  }, [authState]);

  return (
    <>
      <S.Banner
        src={
          storyboard?.image && !storyboard.image.endsWith(".gif")
            ? storyboard.image
            : ""
        }
      />
      <S.SolidBackground></S.SolidBackground>
      <S.StoryContainer>
        <S.Avatar
          src={storyboard?.image ?? null}
          alt="profile-picture"
          size={250}
        />
        <S.Name>
          {storyboard?.name}{" "}
          <S.VisibilityIcon>
            {renderPrivacyIcon(storyboard?.privacy)}
          </S.VisibilityIcon>
        </S.Name>
        <span>Created by:</span>{" "}
        <Username primary username={storyboard?.createdBy.username} />
        <S.PillContainer>
          <MusesPill
            title="Novelists"
            pillType="MEMBERS"
            storyboard={storyboard}
            expandable={true}
          />
        </S.PillContainer>
        <S.SectionName>
          <ShouldRender
            if={storyboard != null && storyboard?.events.length <= 0}
          >
            NO{" "}
          </ShouldRender>
          TAGS
        </S.SectionName>
        <TagsContainer tags={storyboard?.tags} />
        <S.SectionName>
          <ShouldRender
            if={storyboard != null && storyboard?.events.length <= 0}
          >
            NO{" "}
          </ShouldRender>
          CHAPTERS
        </S.SectionName>
        <Flex
          direction="row"
          gap={"1rem"}
          style={{
            flexWrap: "wrap",
            marginTop: "25px",
          }}
        >
          <ShouldRender
            if={
              isAdmin() &&
              novelist != null &&
              storyboard != null &&
              storyboard?.events.length < novelist?.tier.eventLimit
            }
          >
            <StoryCardEvent
              event={INITIAL_STORY_BOARD_EVENT}
              storyboardId={storyboardId}
              isCurrentUser={isAdmin()}
            ></StoryCardEvent>
          </ShouldRender>
          {storyboard?.events?.map((event) => {
            return (
              <StoryCardEvent
                key={event.id}
                event={event}
                storyboardId={storyboardId}
                isCurrentUser={isAdmin()}
              >
                {event.name}
              </StoryCardEvent>
            );
          })}
        </Flex>
      </S.StoryContainer>
    </>
  );
}
