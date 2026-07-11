"use client";

import { Flex } from "@novelist-world/ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGlobeAmericas, FaLock } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { CoverImage, ShouldRender, Username } from "@/components/common";
import { Button as AddNewButtonStyle } from "@/components/common/add-new-button/styles";
import { EditStoryboardEventOverlay } from "@/components/edit-storyboard-event-card/edit-storyboard-event-overlay";
import StoryCardEvent from "@/components/story-event-card";
import { StoryMembers } from "@/components/story-members";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { StoryBoard, StoryBoardEvent } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { getStoryboardAction } from "../actions";
import * as S from "./styles";

const renderVisibilityChip = (isPublic: boolean | undefined) => {
  if (isPublic === undefined) return null;

  return isPublic ? (
    <S.VisibilityChip $public title="Published — anyone can read this story">
      <FaGlobeAmericas size={14} />
      Public
    </S.VisibilityChip>
  ) : (
    <S.VisibilityChip title="Members only">
      <FaLock size={14} />
      Private
    </S.VisibilityChip>
  );
};

export default function UserProfilePage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  const storyboardId = params?.slug as string;
  const { baseDataLoader, routeToPage } = usePageRouter();

  // Chapter create/edit renders in place (dialog on desktop, tray on mobile).
  const [eventEditor, setEventEditor] = useState<{
    open: boolean;
    eventId: string | null;
  }>({ eventId: null, open: false });

  const onBackClick = () => {
    routeToPage(ROUTES.Profile.View(user?.username || "").Storyboards);
  };

  const onAddChapterClick = () => {
    setEventEditor({ eventId: null, open: true });
  };

  const onEditChapter = (eventId: string) => {
    setEventEditor({ eventId, open: true });
  };

  const closeEventEditor = () => {
    setEventEditor((prev) => ({ ...prev, open: false }));
  };

  const handleEventSaved = (saved: StoryBoardEvent) => {
    setStoryBoard((prev) => {
      if (!prev) return prev;
      const exists = prev.events.some((e) => e.id === saved.id);
      return {
        ...prev,
        events: exists
          ? prev.events.map((e) => (e.id === saved.id ? saved : e))
          : [...prev.events, saved],
      };
    });
  };

  const isMember = () => {
    if (!storyboard || !user?.username) return false;

    return (
      storyboard.createdBy?.username === user.username ||
      storyboard.members.some((member) => member.username === user.username)
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
        <S.BackButton type="button" onClick={onBackClick} aria-label="Go back">
          <IoArrowBackOutline size={22} />
        </S.BackButton>
        {renderVisibilityChip(storyboard?.isPublic)}
        <S.HeroRow>
          <S.HeroCover>
            <CoverImage
              src={storyboard?.image ?? null}
              nwImage={storyboard?.avatar}
            />
          </S.HeroCover>
          <S.HeroInfo>
            <S.Name>{storyboard?.name}</S.Name>
            <S.CreatedByRow>
              <span>Author:</span>
              <Username primary className="mini medium" username={storyboard?.createdBy?.username} />
            </S.CreatedByRow>
          </S.HeroInfo>
        </S.HeroRow>
        <StoryMembers storyboard={storyboard} />
        <S.SectionHeaderRow>
          <S.SectionName>
            <ShouldRender
              if={storyboard != null && storyboard?.events.length <= 0}
            >
              NO{" "}
            </ShouldRender>
            CHAPTERS
          </S.SectionName>
          <ShouldRender
            if={
              isMember() &&
              novelist != null &&
              storyboard != null &&
              storyboard?.events.length < novelist?.tier.eventLimit
            }
          >
            <AddNewButtonStyle type="button" onClick={onAddChapterClick}>
              Add chapter
              <IoMdAdd size={18} />
            </AddNewButtonStyle>
          </ShouldRender>
        </S.SectionHeaderRow>
        <Flex
          direction="row"
          gap={"1rem"}
          style={{
            flexWrap: "wrap",
            marginTop: "25px",
          }}
        >
          {storyboard?.events?.map((event) => {
            return (
              <StoryCardEvent
                key={event.id}
                event={event}
                storyboardId={storyboardId}
                isCurrentUser={isMember()}
                onEdit={onEditChapter}
                onDeleted={(deletedId) =>
                  setStoryBoard((prev) =>
                    prev
                      ? {
                          ...prev,
                          events: prev.events.filter((e) => e.id !== deletedId),
                        }
                      : prev,
                  )
                }
              >
                {event.name}
              </StoryCardEvent>
            );
          })}
        </Flex>
      </S.StoryContainer>
      <EditStoryboardEventOverlay
        open={eventEditor.open}
        storyboardId={storyboardId}
        storyboardEventId={eventEditor.eventId}
        onClose={closeEventEditor}
        onSaved={handleEventSaved}
      />
    </>
  );
}
