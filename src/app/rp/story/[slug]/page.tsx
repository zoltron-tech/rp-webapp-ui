"use client";

import { useAuthContext } from "@/hooks";
import { StoryBoard } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoryboardAction } from "../actions";
import * as S from "./styles";
import { ShouldRender, Username } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { MusesPill } from "@/components/muses-pill";
import StoryCardEvent from "@/components/story-event-card";
import { Container, Flex } from "@novelist-world/ui";
import { TagsContainer } from "@/components/tags-container";
import { FaLock } from "react-icons/fa6";
import { FaGlobeAmericas, FaUserFriends } from "react-icons/fa";

export default function UserProfilePage({}) {
  const params = useParams();
  const { state: authState } = useAuthContext();
  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const storyboardId = params?.slug as string;
  const { push } = useRouter();

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
          src={storyboard?.image || ""}
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
          EVENTS
        </S.SectionName>
        <Flex
          direction="row"
          gap={"1rem"}
          style={{
            marginTop: "25px",
            flexWrap: "wrap",
          }}
        >
          {storyboard?.events &&
            storyboard?.events.map((event) => {
              return (
                <StoryCardEvent key={event.id} event={event}>
                  {event.name}
                </StoryCardEvent>
              );
            })}
        </Flex>
      </S.StoryContainer>
    </>
  );
}
