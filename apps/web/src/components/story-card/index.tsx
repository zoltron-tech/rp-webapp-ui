"use client";
import { handleOf } from "@nw/types";
import type { StoryBoard, StoryBoardEvent } from "@nw/types/story-board";
import classNames from "classnames";
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  FaArrowRight,
  FaGlobeAmericas,
  FaHeart,
  FaLock,
  FaRegHeart,
} from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiPlus, FiX } from "react-icons/fi";
import { GrEdit } from "react-icons/gr";
import { HiOutlineBookOpen, HiOutlineUserGroup } from "react-icons/hi2";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdOutlineTheaters } from "react-icons/md";
import { deleteStoryBoardAction } from "@/app/rp/story/actions";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE, INITIAL_STORY_BOARD } from "@/utils/constants";
import {
  type CustomEventType,
  EVENTS,
  type StoryBoardReactedPayload,
} from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { CoverImage, ShouldRender } from "../common";
import { AppAlertDialog } from "../dialog";
import * as DropS from "../profile-more-dropdown/styled";
import { ReactionLikersDialog } from "../reaction-likers-dialog";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  storyBoard?: StoryBoard | null;
  onDeleted?: (storyBoardId: string) => void;
};

const MEMBER_STACK_LIMIT = 5;

/* Rough character budget for the genre chip row so multiple short genres
   (e.g. "Drama", "Action") can share the row as chips before falling back
   to dots — long labels burn through the budget faster. */
const GENRE_CHIP_CHAR_BUDGET = 14;

/**
 * Horizontal, scrollable row of chapter cover tiles with left/right nav arrows.
 * The arrows appear only when there is content to scroll to and are hidden on
 * touch devices (which scroll the row by swiping).
 */
const ChaptersRail: FC<{
  events: StoryBoardEvent[];
  onChapterClick: (event: StoryBoardEvent) => void;
}> = ({ events, onChapterClick }) => {
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, events.length]);

  const scrollRail = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({
      behavior: "smooth",
      left: dir * Math.max(el.clientWidth * 0.8, 160),
    });
  };

  return (
    <S.ChapterRailWrap>
      <S.ChapterRailNav
        type="button"
        $side="left"
        $visible={canLeft}
        aria-label="Scroll chapters left"
        onClick={() => scrollRail(-1)}
      >
        <IoChevronBack />
      </S.ChapterRailNav>
      <S.ChapterRail ref={railRef}>
        {events.map((event, index) => (
          <S.ChapterTile
            key={event.id ?? index}
            type="button"
            title={event.name}
            onClick={() => onChapterClick(event)}
          >
            <CoverImage src={event.image} nwImage={event.avatar} />
            <S.ChapterTileScrim />
            <S.ChapterTileIndex>{index + 1}</S.ChapterTileIndex>
            <S.ChapterTileName>{event.name}</S.ChapterTileName>
          </S.ChapterTile>
        ))}
      </S.ChapterRail>
      <S.ChapterRailNav
        type="button"
        $side="right"
        $visible={canRight}
        aria-label="Scroll chapters right"
        onClick={() => scrollRail(1)}
      >
        <IoChevronForward />
      </S.ChapterRailNav>
    </S.ChapterRailWrap>
  );
};

export const StoryCard: FC<Props> = ({
  storyBoard,
  onDeleted,
  className,
  ...rest
}) => {
  const { routeToPage } = usePageRouter();
  const user = useGlobalState("user");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { successToast, errorToast } = useUIContext();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;

  // Mobile preview tray animation state (mirrors StoryCardEvent).
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  // Desktop preview dialog state.
  const [dialogOpen, setDialogOpen] = useState(false);

  const [likersOpen, setLikersOpen] = useState(false);

  // Heart reaction — shared with any STORY_BOARD-target activity (editing
  // the story or one of its events reacts against this same story id).
  const [reacted, setReacted] = useState(Boolean(storyBoard?.reacted));
  const [reactionCount, setReactionCount] = useState(
    storyBoard?.reactions ?? 0,
  );

  useEffect(() => {
    setReacted(Boolean(storyBoard?.reacted));
    setReactionCount(storyBoard?.reactions ?? 0);
  }, [storyBoard?.reacted, storyBoard?.reactions]);

  const { toggleLike } = useToggleLike({
    id: storyBoard?.id ?? "",
    liked: reacted,
    type: "story_board",
  });

  const {
    on: onStoryBoardEvent,
    off: offStoryBoardEvent,
    emit: emitStoryBoardEvent,
  } = useCustomEvents(EVENTS.STORY_BOARD.base);

  // Stay in sync with other mounted cards for the same story (feed grid,
  // profile list, dialog/tray) and with the activity feed's heart button.
  useEffect(() => {
    const storyId = storyBoard?.id;
    if (!storyId) return;

    const handleStoryBoardReacted = (
      e: CustomEventType<StoryBoardReactedPayload>,
    ) => {
      if (e.detail.id !== storyId) return;
      setReacted(e.detail.reacted);
      setReactionCount(e.detail.reactions);
    };

    onStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, handleStoryBoardReacted);
    return () =>
      offStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, handleStoryBoardReacted);
  }, [storyBoard?.id, onStoryBoardEvent, offStoryBoardEvent]);

  const handleReact = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!storyBoard?.id) return;

    const nextReacted = !reacted;
    setReacted(nextReacted);
    setReactionCount((c) => Math.max(0, c + (nextReacted ? 1 : -1)));

    const result = await toggleLike();
    if ("reactions" in result) {
      setReactionCount(result.reactions);
      setReacted(result.reacted);
      emitStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, {
        id: storyBoard.id,
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
    if (!storyBoard?.id || reactionCount <= 0) return;
    setLikersOpen(true);
  };

  const isCreator =
    !!user?.username && storyBoard?.createdBy?.username === user.username;
  const isMember =
    isCreator ||
    (!!user?.username &&
      !!storyBoard?.members?.some(
        (member) => member.username === user.username,
      ));

  // Author + co-authors, de-duplicating the creator out of the member list.
  // Someone who disabled their account has no username and no picture: they
  // stay in the stack under the placeholder label, never matched to each other.
  const members = useMemo(() => {
    const creator = storyBoard?.createdBy;
    return [
      ...(creator
        ? [
            {
              image: creator.isPlaceholder ? null : creator.image,
              isPlaceholder: creator.isPlaceholder === true,
              username: creator.username,
            },
          ]
        : []),
      ...(storyBoard?.members ?? [])
        .filter((m) => m.isPlaceholder || m.username !== creator?.username)
        .map((m) => ({
          image: m.isPlaceholder ? null : m.image,
          isPlaceholder: m.isPlaceholder === true,
          username: m.username,
        })),
    ];
  }, [storyBoard]);

  const events = storyBoard?.events ?? [];
  const cast = storyBoard?.cast ?? [];
  const tags = storyBoard?.tags ?? [];
  const genres = storyBoard?.genres ?? [];
  const fandom = storyBoard?.fandom ?? null;
  const isFandomless = !fandom?.id || fandom.id === "FANDOMLESS";
  const fandomLabel = isFandomless
    ? "Original"
    : fandom?.name || fandom?.id?.replaceAll("_", " ");

  // As many genres as fit the char budget become chips (first one always
  // does); the rest fall back to a small color dot.
  const { genreChips, genreDots } = useMemo(() => {
    const chips: typeof genres = [];
    const dots: typeof genres = [];
    let usedChars = 0;
    genres.forEach((genre, index) => {
      const fits = usedChars + genre.label.length <= GENRE_CHIP_CHAR_BUDGET;
      if (index === 0 || fits) {
        chips.push(genre);
        usedChars += genre.label.length;
      } else {
        dots.push(genre);
      }
    });
    return { genreChips: chips, genreDots: dots };
  }, [genres]);

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

  const handleTrayTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTrayTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) closeTray();
  };

  const onAddClick = () => {
    routeToPage(ROUTES.Profile.Story.Create);
  };

  const onEditClick = () => {
    routeToPage(ROUTES.Profile.Story.Edit(storyBoard?.id || "").Index);
  };

  const onViewStory = () => {
    if (!storyBoard) return;
    routeToPage(ROUTES.Story.View(storyBoard.id || ""));
  };

  const onReadMoreClick = () => {
    closeTray();
    setDialogOpen(false);
    onViewStory();
  };

  const onChapterClick = (event: StoryBoardEvent) => {
    if (!event.id) return;
    closeTray();
    setDialogOpen(false);
    routeToPage(ROUTES.Story.Event.View(event.id));
  };

  const handleCardClick = () => {
    // The "Add New" placeholder keeps its original behaviour: straight to create.
    if (!storyBoard?.name) {
      onAddClick();
      return;
    }

    if (isMobile) {
      openTray();
      return;
    }

    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!storyBoard?.id) return;

    const response = await deleteStoryBoardAction(storyBoard.id);

    if (response.message === API_MESSAGE.Success) {
      successToast("Story deleted.");
      onDeleted?.(storyBoard.id);
    } else {
      errorToast("Could not delete the story. Please try again.");
    }
  };

  Logger.info("StoryCard rendered");

  if (!storyBoard) return null;

  const isNew = !storyBoard.name;
  const canManage = storyBoard !== INITIAL_STORY_BOARD && isMember;
  const canDelete = storyBoard !== INITIAL_STORY_BOARD && isCreator;
  const stackMembers = members.slice(0, MEMBER_STACK_LIMIT);
  const memberOverflow = members.length - stackMembers.length;

  // Shared detail body used by both the desktop dialog and the mobile tray.
  const renderDetails = () => (
    <>
      <S.PreviewMeta>
        <S.VisibilityBadge $public={storyBoard.isPublic}>
          {storyBoard.isPublic ? (
            <>
              <FaGlobeAmericas /> Public
            </>
          ) : (
            <>
              <FaLock /> Private
            </>
          )}
        </S.VisibilityBadge>

        <ShouldRender if={members.length > 0}>
          <S.CreatorsRow>
            <S.MemberStack>
              {stackMembers.map((member, index) => (
                <S.MemberStackAvatar
                  key={member.username || `placeholder-${index}`}
                  src={member.image ?? undefined}
                  alt={handleOf(member)}
                  title={handleOf(member)}
                />
              ))}
              {memberOverflow > 0 && (
                <S.MemberStackOverflow>+{memberOverflow}</S.MemberStackOverflow>
              )}
            </S.MemberStack>
            {/* <S.SectionLabel>
              {members.length === 1 ? "Creator" : "Creators"}
            </S.SectionLabel> */}
          </S.CreatorsRow>
        </ShouldRender>
      </S.PreviewMeta>

      <S.FandomChip title="Fandom">
        <MdOutlineTheaters />
        <b>{fandomLabel}</b>
      </S.FandomChip>

      <S.StatRow>
        <S.StatChip title="Chapters">
          <HiOutlineBookOpen />
          <b>{events.length}</b>
          {events.length === 1 ? "chapter" : "chapters"}
        </S.StatChip>
        <S.StatChip title="Co-authors">
          <HiOutlineUserGroup />
          <b>{members.length}</b>
          {members.length === 1 ? "author" : "authors"}
        </S.StatChip>
        <S.HeartStatChip
          type="button"
          $active={reacted}
          aria-label={reacted ? "Remove reaction" : "React"}
          aria-pressed={reacted}
          onClick={handleReact}
        >
          {reacted ? <FaHeart /> : <FaRegHeart />}
          <S.HeartCountText onClick={handleOpenLikers}>
            <b>{reactionCount}</b>
            {reactionCount === 1 ? "like" : "likes"}
          </S.HeartCountText>
        </S.HeartStatChip>
      </S.StatRow>

      <ShouldRender if={genres.length > 0}>
        <S.TagRow>
          {genres.map((genre) => (
            <S.GenrePill key={genre.id} $color={genre.color}>
              {genre.label}
            </S.GenrePill>
          ))}
        </S.TagRow>
      </ShouldRender>

      <ShouldRender if={tags.length > 0}>
        <S.TagRow>
          {tags.slice(0, 6).map((tag) => (
            <S.TagPill key={tag.id}>{tag.label}</S.TagPill>
          ))}
        </S.TagRow>
      </ShouldRender>

      <ShouldRender if={cast.length > 0}>
        <div>
          <S.SectionLabel>Cast</S.SectionLabel>
          <S.CastRow>
            {cast.map((member) => {
              // A placeholder muse has no avatar to fetch (its page is gone).
              const avatarSrc = member.isPlaceholder
                ? null
                : member.image || museAvatarUrl(member.id);
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
        </div>
      </ShouldRender>

      <div>
        <S.SectionLabel>Chapters</S.SectionLabel>
        {events.length > 0 ? (
          <ChaptersRail events={events} onChapterClick={onChapterClick} />
        ) : (
          <S.EmptyNote style={{ marginTop: 6 }}>No chapters yet.</S.EmptyNote>
        )}
      </div>
    </>
  );

  return (
    <S.CardWrapper
      className={classNames([className, { new: isNew }])}
      {...rest}
    >
      <ShouldRender if={canDelete}>
        <AppAlertDialog
          heading={`Delete ${storyBoard.name}?`}
          text="This permanently removes the story, its events and all threads. Are you sure?"
          open={showDeleteAlert}
          onOpenChange={setShowDeleteAlert}
          onConfirm={handleDelete}
          actionButtonLabel="Delete"
        />
      </ShouldRender>
      <S.Card
        className={classNames(["muse-card", { new: isNew }])}
        onClick={handleCardClick}
      >
        {isNew ? (
          <S.AddTileInner>
            <FiPlus />
            Add New
          </S.AddTileInner>
        ) : (
          <>
            <S.Cover>
              <CoverImage src={storyBoard.image} nwImage={storyBoard.avatar} />
              <S.CoverScrim />
              <S.CoverBadge
                $public={storyBoard.isPublic}
                title={storyBoard.isPublic ? "Public" : "Private"}
              >
                {storyBoard.isPublic ? <FaGlobeAmericas /> : <FaLock />}
                <span className="badge-label">
                  {storyBoard.isPublic ? "Public" : "Private"}
                </span>
              </S.CoverBadge>

              <ShouldRender if={stackMembers.length > 0}>
                <S.CoverAuthorsRail>
                  {stackMembers.map((member, index) => (
                    <S.CoverAuthorAvatar
                      key={member.username || `placeholder-${index}`}
                      src={member.image ?? undefined}
                      alt={handleOf(member)}
                      title={handleOf(member)}
                    />
                  ))}
                  {memberOverflow > 0 && (
                    <S.CoverAuthorOverflow>
                      +{memberOverflow}
                    </S.CoverAuthorOverflow>
                  )}
                </S.CoverAuthorsRail>
              </ShouldRender>

              <ShouldRender if={events.length > 0}>
                <S.CoverChapterBadge
                  title={`${events.length} ${
                    events.length === 1 ? "chapter" : "chapters"
                  }`}
                >
                  <HiOutlineBookOpen />
                  <span>{events.length}</span>
                </S.CoverChapterBadge>
              </ShouldRender>

              <S.CoverHeartBadge
                type="button"
                $active={reacted}
                aria-label={reacted ? "Remove reaction" : "React"}
                aria-pressed={reacted}
                title={`${reactionCount} ${
                  reactionCount === 1 ? "like" : "likes"
                }`}
                onClick={handleReact}
              >
                {reacted ? <FaHeart /> : <FaRegHeart />}
                <span onClick={handleOpenLikers}>{reactionCount}</span>
              </S.CoverHeartBadge>
            </S.Cover>
            <S.Info>
              <S.CardTitle>{storyBoard.name}</S.CardTitle>

              <S.CardFandom
                $color={isFandomless ? "#555" : fandom?.color || "#555"}
                title={fandomLabel}
              >
                {fandomLabel}
              </S.CardFandom>

              <ShouldRender if={genres.length > 0}>
                <S.CardGenreRow>
                  {genreChips.map((genre) => (
                    <S.GenrePill key={genre.id} $color={genre.color}>
                      {genre.label}
                    </S.GenrePill>
                  ))}
                  {genreDots.map((genre) => (
                    <S.GenreDot
                      key={genre.id}
                      $color={genre.color}
                      title={genre.label}
                    />
                  ))}
                </S.CardGenreRow>
              </ShouldRender>
            </S.Info>
          </>
        )}
      </S.Card>

      {/* Mobile: slide-up preview tray */}
      <ShouldRender if={trayVisible && typeof document !== "undefined"}>
        {createPortal(
          <DropS.MobilePortalRoot className={classNames([accent, theme])}>
            <DropS.MobileBackdrop $open={trayOpen} onClick={closeTray} />
            <S.TraySheet
              $open={trayOpen}
              onTouchStart={handleTrayTouchStart}
              onTouchEnd={handleTrayTouchEnd}
            >
              <S.TrayFrame>
                <S.TrayFrameGlow aria-hidden="true">
                  <CoverImage
                    src={storyBoard.image}
                    nwImage={storyBoard.avatar}
                  />
                </S.TrayFrameGlow>
                <S.TrayHero>
                  <CoverImage
                    src={storyBoard.image}
                    nwImage={storyBoard.avatar}
                  />
                  <S.TrayHeroScrim />
                  <S.TrayDragHandle />
                  <S.TrayHeaderActions>
                    <ShouldRender if={canManage}>
                      <S.TrayHeaderButton
                        type="button"
                        aria-label="Edit story"
                        title="Edit story"
                        onClick={() => {
                          closeTray();
                          onEditClick();
                        }}
                      >
                        <GrEdit />
                      </S.TrayHeaderButton>
                    </ShouldRender>
                    <ShouldRender if={canDelete}>
                      <S.TrayDeleteHeaderButton
                        type="button"
                        aria-label="Delete story"
                        title="Delete story"
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
                    <S.TrayEyebrow>Story</S.TrayEyebrow>
                    <S.TrayTitle>{storyBoard.name}</S.TrayTitle>
                  </S.TrayHeroText>
                </S.TrayHero>
              </S.TrayFrame>
              <S.TrayBody>{renderDetails()}</S.TrayBody>
              <S.TrayFooter>
                <S.TrayReadMoreButton type="button" onClick={onReadMoreClick}>
                  Read more
                  <FaArrowRight />
                </S.TrayReadMoreButton>
              </S.TrayFooter>
            </S.TraySheet>
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
                <CoverImage
                  src={storyBoard.image}
                  nwImage={storyBoard.avatar}
                />
              </S.DialogFrameGlow>
              <S.DialogContent
                role="dialog"
                aria-modal="true"
                aria-label={storyBoard.name}
              >
                <S.DialogHeaderActions>
                  <ShouldRender if={canManage}>
                    <S.DialogHeaderButton
                      type="button"
                      title="Edit story"
                      aria-label="Edit story"
                      onClick={() => {
                        setDialogOpen(false);
                        onEditClick();
                      }}
                    >
                      <GrEdit />
                    </S.DialogHeaderButton>
                  </ShouldRender>
                  <ShouldRender if={canDelete}>
                    <S.DialogDeleteHeaderButton
                      type="button"
                      title="Delete story"
                      aria-label="Delete story"
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
                  <CoverImage
                    src={storyBoard.image}
                    nwImage={storyBoard.avatar}
                  />
                </S.DialogCover>
                <S.DialogInfo>
                  <S.DialogHeading>
                    <S.DialogEyebrow>Story</S.DialogEyebrow>
                    <S.DialogTitle>{storyBoard.name}</S.DialogTitle>
                  </S.DialogHeading>
                  {renderDetails()}
                  <S.DialogActions>
                    <S.DialogReadMoreButton
                      type="button"
                      onClick={onReadMoreClick}
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

      <ReactionLikersDialog
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
        targetId={storyBoard?.id ?? ""}
        initialCount={reactionCount}
      />
    </S.CardWrapper>
  );
};

export default StoryCard;
