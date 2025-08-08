"use client";

import { StoryBoard } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoryboardAction } from "../actions";
import * as S from "./styles";
import { ShouldRender, Username } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { MusesPill } from "@/components/muses-pill";
import StoryCardEvent from "@/components/story-event-card";
import { Flex } from "@novelist-world/ui";
import { TagsContainer } from "@/components/tags-container";
import { FaGlobeAmericas, FaUserFriends } from "react-icons/fa";
import { INITIAL_STORY_BOARD_EVENT } from "@/utils/constants";
import { useGlobalState } from "@/context/store/stores";

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
  const [loading, setLoading] = useState(true);
  const storyboardId = params?.slug as string;
  const { push } = useRouter();

  const isAdmin = () => {
    if (!storyboard || !user?.username) return false;

    return storyboard.members.some(
      (member) => member.username === user.username && member.isAdmin === true
    );
  };

  const fetchStoryboard = async () => {
    setLoading(true);
    const _storyboard = await getStoryboardAction(storyboardId);

    if (!_storyboard || "message" in _storyboard) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setStoryBoard(_storyboard);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyboard) return;

    fetchStoryboard();
  }, [authState]);

  return (
    <>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <S.Banner
        src={
          storyboard?.image && !storyboard.image.endsWith(".gif")
            ? storyboard.image
            : ""
        }
      />
      <S.SolidBackground></S.SolidBackground>
      <S.StoryContainer>
        <ShouldRender if={loading}>
          <PageLoader />
        </ShouldRender>
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
            marginTop: "25px",
            flexWrap: "wrap",
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
          {storyboard?.events &&
            storyboard?.events.map((event) => {
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
