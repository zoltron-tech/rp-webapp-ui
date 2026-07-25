"use client";

import { Flex } from "@novelist-world/ui";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaGlobeAmericas, FaHeart, FaLock, FaRegHeart } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiShare2 } from "react-icons/fi";
import { GrEdit } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdOutlineTheaters } from "react-icons/md";
import { RiFlagFill } from "react-icons/ri";
import { RxDragHandleDots2 } from "react-icons/rx";
import { getNovelistAction } from "@/app/rp/novelists/actions";
import { reportAction } from "@/app/rp/thread/actions";
import { CoverImage, ShouldRender, Username } from "@/components/common";
import { Button as AddNewButtonStyle } from "@/components/common/add-new-button/styles";
import { AppAlertDialog } from "@/components/dialog";
import { EditStoryboardEventOverlay } from "@/components/edit-storyboard-event-card/edit-storyboard-event-overlay";
import { AppDropdownMenuResponsive } from "@/components/profile-more-dropdown";
import { ReactionLikersDialog } from "@/components/reaction-likers-dialog";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { ReorderStoryboardEventsOverlay } from "@/components/reorder-storyboard-events";
import { ShareStoryDialog } from "@/components/share-story-dialog";
import StoryCardEvent from "@/components/story-event-card";
import { StoryMembers } from "@/components/story-members";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useToggleLike } from "@/hooks/use-toggle-like";
import type { StoryBoard, StoryBoardEvent } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import {
  type CustomEventType,
  EVENTS,
  type StoryBoardReactedPayload,
} from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import { deleteStoryBoardAction, getStoryboardAction } from "../actions";
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
  // Event limits are the story's creator's, regardless of who is viewing or
  // co-authoring — resolved from the viewer's own tier when they are the
  // creator, otherwise fetched from the creator's profile.
  const [creatorEventLimit, setCreatorEventLimit] = useState<number | null>(
    null,
  );
  const storyboardId = params?.slug as string;
  const { baseDataLoader, routeToPage } = usePageRouter();

  // Chapter create/edit renders in place (dialog on desktop, tray on mobile).
  const [eventEditor, setEventEditor] = useState<{
    open: boolean;
    eventId: string | null;
  }>({ eventId: null, open: false });
  const [reorderOpen, setReorderOpen] = useState(false);
  const { successToast, errorToast } = useUIContext();

  // Engagement row actions: share dialog + delete/report confirm.
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [likersOpen, setLikersOpen] = useState(false);

  // Heart reaction — shared with StoryCard and any STORY_BOARD-target activity.
  const [reacted, setReacted] = useState(Boolean(storyboard?.reacted));
  const [reactionCount, setReactionCount] = useState(
    storyboard?.reactions ?? 0,
  );

  useEffect(() => {
    setReacted(Boolean(storyboard?.reacted));
    setReactionCount(storyboard?.reactions ?? 0);
  }, [storyboard?.reacted, storyboard?.reactions]);

  const { toggleLike } = useToggleLike({
    id: storyboardId ?? "",
    liked: reacted,
    type: "story_board",
  });

  const {
    on: onStoryBoardEvent,
    off: offStoryBoardEvent,
    emit: emitStoryBoardEvent,
  } = useCustomEvents(EVENTS.STORY_BOARD.base);

  useEffect(() => {
    if (!storyboardId) return;

    const handleStoryBoardReacted = (
      e: CustomEventType<StoryBoardReactedPayload>,
    ) => {
      if (e.detail.id !== storyboardId) return;
      setReacted(e.detail.reacted);
      setReactionCount(e.detail.reactions);
    };

    onStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, handleStoryBoardReacted);
    return () =>
      offStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, handleStoryBoardReacted);
  }, [storyboardId, onStoryBoardEvent, offStoryBoardEvent]);

  const onLike = async () => {
    if (!storyboardId) return;

    const nextReacted = !reacted;
    setReacted(nextReacted);
    setReactionCount((c) => Math.max(0, c + (nextReacted ? 1 : -1)));

    const result = await toggleLike();
    if ("reactions" in result) {
      setReactionCount(result.reactions);
      setReacted(result.reacted);
      emitStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, {
        id: storyboardId,
        reacted: result.reacted,
        reactions: result.reactions,
      });
    } else {
      setReacted(!nextReacted);
      setReactionCount((c) => Math.max(0, c + (nextReacted ? -1 : 1)));
    }
  };

  const handleOpenLikers = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reactionCount <= 0) return;
    setLikersOpen(true);
  };

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
    // Only a fresh creation (not an edit) should auto-close the overlay.
    const wasCreating = eventEditor.eventId === null;

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

    if (wasCreating) closeEventEditor();
  };

  const fandom = storyboard?.fandom ?? null;
  const isFandomless = !fandom?.id || fandom.id === "FANDOMLESS";
  const fandomLabel = isFandomless
    ? "Original"
    : fandom?.name || fandom?.id?.replaceAll("_", " ");
  const genres = storyboard?.genres ?? [];
  const cast = storyboard?.cast ?? [];

  const isMember = () => {
    if (!storyboard || !user?.username) return false;

    return (
      storyboard.createdBy?.username === user.username ||
      storyboard.members.some((member) => member.username === user.username)
    );
  };

  const onEditStoryClick = () => {
    routeToPage(ROUTES.Profile.Story.Edit(storyboardId).Index);
  };

  const handleDeleteStory = async () => {
    if (!storyboardId) return;

    const response = await deleteStoryBoardAction(storyboardId);
    if (response.message === API_MESSAGE.Success) {
      successToast("Story deleted.");
      onBackClick();
    } else {
      errorToast("Could not delete the story. Please try again.");
    }
  };

  const handleReportStory = async () => {
    if (!storyboardId) return;

    const response = await reportAction(storyboardId, "", "STORY_BOARD");
    if (response?.message === API_MESSAGE.Success) {
      successToast("Reported successfully.");
    } else {
      errorToast("There was an issue while reporting this story.");
    }
  };

  const dropdownItems = isMember()
    ? [
        {
          icon: <GrEdit />,
          label: "Edit story",
          onClick: onEditStoryClick,
        },
        { separator: true },
        {
          icon: <FaRegTrashCan />,
          label: "Delete story",
          onClick: () => setShowDeleteConfirm(true),
          variant: "danger" as const,
        },
      ]
    : [
        {
          icon: <RiFlagFill />,
          label: "Report story",
          onClick: () => setShowReportConfirm(true),
          variant: "danger" as const,
        },
      ];

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

  useEffect(() => {
    const creatorUsername = storyboard?.createdBy?.username;
    if (!creatorUsername) return;

    if (creatorUsername === user?.username) {
      setCreatorEventLimit(novelist?.tier.eventLimit ?? null);
      return;
    }

    let cancelled = false;
    getNovelistAction(creatorUsername).then((result) => {
      if (cancelled || !result || "message" in result) return;
      setCreatorEventLimit(result.tier.eventLimit);
    });
    return () => {
      cancelled = true;
    };
  }, [storyboard?.createdBy?.username, user?.username, novelist?.tier.eventLimit]);

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
            <S.MetaStack>
              <ShouldRender if={!!fandom?.id}>
                <S.FandomChip title="Fandom">
                  <MdOutlineTheaters />
                  <b>{fandomLabel}</b>
                </S.FandomChip>
              </ShouldRender>

              <ShouldRender if={genres.length > 0}>
                <S.GenreRow>
                  {genres.map((genre) => (
                    <S.GenrePill key={genre.id} $color={genre.color}>
                      {genre.label}
                    </S.GenrePill>
                  ))}
                </S.GenreRow>
              </ShouldRender>
            </S.MetaStack>
          </S.HeroInfo>
        </S.HeroRow>

        <ShouldRender if={!!storyboard?.description}>
          <S.DescriptionSection>
            <RichTextRenderer
              savedText={storyboard?.description ?? ""}
              overlayHidden
              disableCollapse
            />
          </S.DescriptionSection>
        </ShouldRender>

        <S.ActionRow>
          <S.HeartChip
            type="button"
            $active={reacted}
            aria-label={reacted ? "Remove reaction" : "React"}
            aria-pressed={reacted}
            onClick={onLike}
          >
            {reacted ? <FaHeart /> : <FaRegHeart />}
            <S.HeartCountText onClick={handleOpenLikers}>
              <b>{reactionCount}</b>
              {reactionCount === 1 ? "like" : "likes"}
            </S.HeartCountText>
          </S.HeartChip>

          <S.ShareButton
            type="button"
            onClick={() => setShowShareDialog(true)}
          >
            <FiShare2 />
            Share
          </S.ShareButton>

          <S.ActionRowSpacer />

          <AppDropdownMenuResponsive
            trigger={<BsThreeDots size={18} />}
            items={dropdownItems}
            variant="bordered"
          />
        </S.ActionRow>

        <StoryMembers storyboard={storyboard} />

        <ShouldRender if={cast.length > 0}>
          <S.CastSection>
            <S.SectionName>CAST</S.SectionName>
            <S.CastRow>
              {cast.map((member) => {
                const avatarSrc = member.image || museAvatarUrl(member.id);
                return (
                  <S.CastChip key={member.id} title={member.name}>
                    {avatarSrc ? (
                      <S.CastAvatar src={avatarSrc} alt={member.name} />
                    ) : (
                      <S.CastAvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </S.CastAvatarFallback>
                    )}
                    <S.CastName>{member.name}</S.CastName>
                  </S.CastChip>
                );
              })}
            </S.CastRow>
          </S.CastSection>
        </ShouldRender>

        <S.SectionHeaderRow>
          <S.SectionName>
            <ShouldRender
              if={storyboard != null && storyboard?.events.length <= 0}
            >
              NO{" "}
            </ShouldRender>
            CHAPTERS
            <ShouldRender if={isMember() && creatorEventLimit != null}>
              {" "}
              ({storyboard?.events.length ?? 0} / {creatorEventLimit})
            </ShouldRender>
          </S.SectionName>
          <ShouldRender if={isMember() && (storyboard?.events.length ?? 0) > 1}>
            <AddNewButtonStyle type="button" onClick={() => setReorderOpen(true)}>
              Reorder chapters
              <RxDragHandleDots2 size={18} />
            </AddNewButtonStyle>
          </ShouldRender>
          <ShouldRender
            if={
              isMember() &&
              creatorEventLimit != null &&
              storyboard != null &&
              storyboard.events.length < creatorEventLimit
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
      <ReorderStoryboardEventsOverlay
        open={reorderOpen}
        storyboardId={storyboardId}
        events={storyboard?.events ?? []}
        onClose={() => setReorderOpen(false)}
        onReordered={(events) =>
          setStoryBoard((prev) => (prev ? { ...prev, events } : prev))
        }
      />
      <ShareStoryDialog
        storyboard={storyboard}
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
      <AppAlertDialog
        heading={`Delete ${storyboard?.name}?`}
        text="This permanently removes the story, its events and all threads. Are you sure?"
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDeleteStory();
        }}
        actionButtonLabel="Delete"
      />
      <AppAlertDialog
        heading="Report this story?"
        text="We strive to maintain a safe and welcoming community. If you notice any misconduct, please report it. Our team will review the issue and take appropriate action as quickly as possible."
        open={showReportConfirm}
        onOpenChange={setShowReportConfirm}
        onConfirm={() => {
          setShowReportConfirm(false);
          handleReportStory();
        }}
        actionButtonLabel="Report"
      />
      <ReactionLikersDialog
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
        targetId={storyboardId ?? ""}
        initialCount={reactionCount}
      />
    </>
  );
}
