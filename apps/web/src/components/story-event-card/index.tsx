"use client";
import type { StoryBoardEvent } from "@nw/types/story-board";
import { truncate } from "@nw/utils";
import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaArrowRight } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import { GrEdit } from "react-icons/gr";
import { deleteStoryBoardEventAction } from "@/app/rp/story/actions";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { CoverImage, ShouldRender } from "../common";
import { AppAlertDialog } from "../dialog";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  event?: StoryBoardEvent | null;
  storyboardId: string;
  isCurrentUser?: boolean;
  onDeleted?: (eventId: string) => void;
  /** When provided, editing opens in place (overlay) instead of routing away. */
  onEdit?: (eventId: string) => void;
};

// Descriptions are stored as rich-text HTML; preview surfaces (card teaser,
// tray, dialog) only have room for a plain-text snippet, so strip tags before
// truncating instead of leaking raw markup like `<div style="...">`.
const stripHtml = (html: string) => {
  if (!html) return "";
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "");
  const container = document.createElement("div");
  container.innerHTML = html;
  return (container.textContent ?? "").replace(/\s+/g, " ").trim();
};

export const StoryCardEvent: FC<Props> = ({
  event,
  storyboardId,
  isCurrentUser,
  onDeleted,
  onEdit,
  className,
  ...rest
}) => {
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;

  // Mobile preview tray animation state (mirrors StoryboardMembersDialog).
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  // Desktop preview dialog state.
  const [dialogOpen, setDialogOpen] = useState(false);

  const openTray = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setTrayVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTrayOpen(true));
    });
  };

  const closeTray = () => {
    setTrayOpen(false);
    closeTimerRef.current = setTimeout(() => setTrayVisible(false), 300);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!trayVisible && !dialogOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (trayVisible) closeTray();
      if (dialogOpen) setDialogOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trayVisible, dialogOpen]);

  const onEventClick = (eventId: string) => {
    routeToPage(ROUTES.Story.Event.View(eventId));
  };

  const onReadMoreClick = (eventId: string) => {
    closeTray();
    setDialogOpen(false);
    onEventClick(eventId);
  };

  const handleCardClick = () => {
    if (isMobile) {
      openTray();
      return;
    }

    setDialogOpen(true);
  };

  const handleTrayTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTrayTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) closeTray();
  };

  const onEditClick = (eventId: string | null) => {
    if (eventId === null) return;
    if (onEdit) {
      onEdit(eventId);
      return;
    }
    routeToPage(ROUTES.Profile.Story.Edit(storyboardId).Event.Edit(eventId));
  };

  const handleDelete = async () => {
    if (!event?.id) return;

    const response = await deleteStoryBoardEventAction(event.id);

    if (response.message === API_MESSAGE.Success) {
      successToast("Chapter deleted.");
      onDeleted?.(event.id);
    } else {
      errorToast("Could not delete the chapter. Please try again.");
    }
  };

  Logger.info("StoryCard rendered");

  if (!event) return null;

  const canManage = !!isCurrentUser;

  return (
    <S.CardWrapper className={classNames([className])} {...rest}>
      <ShouldRender if={canManage}>
        <AppAlertDialog
          heading={`Delete ${event.name}?`}
          text="This permanently removes the chapter and all of its threads. Are you sure?"
          open={showDeleteAlert}
          onOpenChange={setShowDeleteAlert}
          onConfirm={handleDelete}
          actionButtonLabel="Delete"
        />
      </ShouldRender>
      <S.CardBackground>
        <CoverImage src={event.image} nwImage={event.avatar} />
      </S.CardBackground>
      <S.Card className="muse-card" onClick={handleCardClick}>
        <S.CardHeader>
          <S.MuseInfo>
            <S.Title>{event.name}</S.Title>
            <S.Description>
              {truncate(stripHtml(event.description), 100)}
            </S.Description>
          </S.MuseInfo>
        </S.CardHeader>
        <S.CardFooter>
          Read more...
          <FaArrowRight />
        </S.CardFooter>
      </S.Card>

      {/* Mobile: slide-up preview tray */}
      <ShouldRender if={trayVisible && typeof document !== "undefined"}>
        {createPortal(
          <DropS.MobilePortalRoot className={classNames([accent, theme])}>
            <DropS.MobileBackdrop $open={trayOpen} onClick={closeTray} />
            <DropS.MobileSheet
              $open={trayOpen}
              onTouchStart={handleTrayTouchStart}
              onTouchEnd={handleTrayTouchEnd}
            >
              <S.TrayFrame>
                <S.TrayFrameGlow aria-hidden="true">
                  <CoverImage src={event.image} nwImage={event.avatar} />
                </S.TrayFrameGlow>
                <S.TrayHero>
                  <CoverImage src={event.image} nwImage={event.avatar} />
                  <S.TrayHeroScrim />
                  <S.TrayDragHandle />
                <S.TrayHeaderActions>
                  <ShouldRender if={canManage}>
                    <S.TrayHeaderButton
                      type="button"
                      aria-label="Edit chapter"
                      title="Edit chapter"
                      onClick={() => {
                        closeTray();
                        onEditClick(event?.id);
                      }}
                    >
                      <GrEdit />
                    </S.TrayHeaderButton>
                    <S.TrayDeleteHeaderButton
                      type="button"
                      aria-label="Delete chapter"
                      title="Delete chapter"
                      onClick={() => setShowDeleteAlert(true)}
                    >
                      <FaRegTrashCan />
                    </S.TrayDeleteHeaderButton>
                  </ShouldRender>
                  <S.TrayCloseButton
                    type="button"
                    aria-label="Close"
                    onClick={closeTray}
                  >
                    <FiX size={18} />
                  </S.TrayCloseButton>
                </S.TrayHeaderActions>
                <S.TrayHeroText>
                  <S.TrayEyebrow>Chapter</S.TrayEyebrow>
                  <S.TrayTitle>{event.name}</S.TrayTitle>
                </S.TrayHeroText>
                </S.TrayHero>
              </S.TrayFrame>
              <S.TrayBody>
                <ShouldRender if={!!event.description}>
                  <S.TrayDescription>
                    {stripHtml(event.description)}
                  </S.TrayDescription>
                </ShouldRender>
                <S.TrayReadMoreButton
                  type="button"
                  onClick={() => onReadMoreClick(event?.id || "")}
                >
                  Read more
                  <FaArrowRight />
                </S.TrayReadMoreButton>
              </S.TrayBody>
            </DropS.MobileSheet>
          </DropS.MobilePortalRoot>,
          document.body,
        )}
      </ShouldRender>

      {/* Desktop: Netflix-style preview dialog */}
      <ShouldRender if={dialogOpen && typeof document !== "undefined"}>
        {createPortal(
          <div className={classNames([accent, theme])}>
            <S.DialogOverlay onClick={() => setDialogOpen(false)} />
            <S.DialogFrame>
              <S.DialogFrameGlow aria-hidden="true">
                <CoverImage src={event.image} nwImage={event.avatar} />
              </S.DialogFrameGlow>
              <S.DialogContent
                role="dialog"
                aria-modal="true"
                aria-label={event.name}
              >
                <S.DialogHeaderActions>
                  <ShouldRender if={canManage}>
                    <S.DialogHeaderButton
                      type="button"
                      title="Edit chapter"
                      aria-label="Edit chapter"
                      onClick={() => {
                        setDialogOpen(false);
                        onEditClick(event?.id);
                      }}
                    >
                      <GrEdit />
                    </S.DialogHeaderButton>
                    <S.DialogDeleteHeaderButton
                      type="button"
                      title="Delete chapter"
                      aria-label="Delete chapter"
                      onClick={() => setShowDeleteAlert(true)}
                    >
                      <FaRegTrashCan />
                    </S.DialogDeleteHeaderButton>
                  </ShouldRender>
                  <S.DialogClose
                    type="button"
                    aria-label="Close"
                    onClick={() => setDialogOpen(false)}
                  >
                    <FiX size={18} />
                  </S.DialogClose>
                </S.DialogHeaderActions>
                <S.DialogCover>
                  <CoverImage src={event.image} nwImage={event.avatar} />
                </S.DialogCover>
                <S.DialogInfo>
                <S.DialogHeading>
                  <S.DialogEyebrow>Chapter</S.DialogEyebrow>
                  <S.DialogTitle>{event.name}</S.DialogTitle>
                </S.DialogHeading>
                <ShouldRender if={!!event.description}>
                  <S.DialogDescription>
                    {truncate(stripHtml(event.description), 300)}
                  </S.DialogDescription>
                </ShouldRender>
                <S.DialogActions>
                  <S.DialogReadMoreButton
                    type="button"
                    onClick={() => onReadMoreClick(event?.id || "")}
                  >
                    Read more
                    <FaArrowRight />
                  </S.DialogReadMoreButton>
                </S.DialogActions>
              </S.DialogInfo>
              </S.DialogContent>
            </S.DialogFrame>
          </div>,
          document.body,
        )}
      </ShouldRender>
    </S.CardWrapper>
  );
};

export default StoryCardEvent;
