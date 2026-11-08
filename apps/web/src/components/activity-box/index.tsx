"use client";

import type { Muse, Prompt, StoryBoard } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import { formatTime } from "@nw/utils";
import classNames from "classnames";
import {
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaComments,
  FaHeart,
  FaImage,
  FaPause,
  FaPlay,
  FaRegHeart,
  FaStreetView,
  FaUser,
} from "react-icons/fa6";
import { FiMaximize2, FiTrash2 } from "react-icons/fi";
import { IoIosShareAlt } from "react-icons/io";
import { PiBookOpenUserDuotone } from "react-icons/pi";
import { deleteActivityAction } from "@/app/rp/home/actions";
import { getMuseAction } from "@/app/rp/muse/actions";
import { getPromptAction } from "@/app/rp/prompt/actions";
import { getStoryboardAction } from "@/app/rp/story/actions";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useToggleLike } from "@/hooks/use-toggle-like";
import {
  type CustomEventType,
  EVENTS,
  type PromptReactedPayload,
  type StoryBoardReactedPayload,
} from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import { pluralize, toFormattedDateFromUnix } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import * as ChatPlayerS from "../common/chat-bubble/styles";
import { AppAlertDialog } from "../dialog";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import { VideoViewer } from "../image-viewer/VideoViewer";
import { MarkdownLite } from "../markdown-lite";
import { MuseEmbed } from "../muse-embed";
import { NovelistEmbed } from "../novelist-embed";
import { SharePromptDialog } from "../prompt/share-prompt-dialog";
import { ReactionLikersDialog } from "../reaction-likers-dialog";
import { RichTextRenderer } from "../rich-text-editor-input/rich-test-renderer";
import { ShareMuseDialog } from "../share-muse-dialog";
import { ShareStoryDialog } from "../share-story-dialog";
import { SourcePreview } from "../source-preview";
import * as S from "./styles";

const STORY_BOARD_TYPES = ["STORY_BOARD", "STORY_BOARD_EVENT"];

type Props = React.HTMLProps<HTMLDivElement> & {
  activity?: Activity | null;
  /**
   * The viewer deleted this activity (it was their own — the trash button
   * only shows when `activity.novelistId` is the signed-in novelist, and only
   * when this is given). The list drops it; the server already has.
   */
  onDeleted?: (activityId: string) => void;
};

const videoExtensions = ["mp4", "mov", "quicktime"];
const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "avif"];
const audioExtensions = ["mp3", "mpeg", "wav"];

const PROMPT_TYPES = ["PROMPT", "COMMENT", "REPLY"];

/** Contextual kind badge + primary action for an activity's target type. */
const getActivityKind = (
  activityTargetType: string,
): { label: string; icon: ReactNode; actionLabel: string } => {
  if (PROMPT_TYPES.includes(activityTargetType))
    return {
      actionLabel: "View threads",
      icon: <FaComments />,
      label: "Prompt",
    };
  if (activityTargetType === "MEDIA")
    return { actionLabel: "View media", icon: <FaImage />, label: "Media" };
  if (activityTargetType === "MUSE")
    return {
      actionLabel: "View character",
      icon: <FaStreetView />,
      label: "Character",
    };
  if (["STORY_BOARD", "STORY_BOARD_EVENT"].includes(activityTargetType))
    return {
      actionLabel: "View story",
      icon: <PiBookOpenUserDuotone />,
      label: "Story",
    };
  if (activityTargetType === "PROFILE")
    return { actionLabel: "View profile", icon: <FaUser />, label: "Profile" };
  return { actionLabel: "View", icon: <FaComments />, label: "Activity" };
};

const getMediaTypeFromUrl = (
  url: string,
): "video" | "image" | "audio" | null => {
  const checkExtension = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    if (imageExtensions.includes(ext)) return "image" as const;
    if (videoExtensions.includes(ext)) return "video" as const;
    if (audioExtensions.includes(ext)) return "audio" as const;
    return null;
  };

  try {
    const parsed = new URL(url);

    // Proxy URLs (wsrv.nl, imageproxy, etc.) advertise the output format
    // in an ?output= param (e.g. output=webp). Check that first.
    const output = parsed.searchParams.get("output");
    if (output) {
      const fromOutput = checkExtension(`.${output}`);
      if (fromOutput) return fromOutput;
    }

    // Proxy URLs encode the real asset path in a ?url= param.
    // Decode it and inspect the file extension of the underlying file.
    const proxied = parsed.searchParams.get("url");
    if (proxied) {
      const proxiedPath = decodeURIComponent(proxied).split("?")[0];
      const fromProxied = checkExtension(proxiedPath);
      if (fromProxied) return fromProxied;
    }

    // Direct URL: inspect the pathname, ignoring query string.
    return checkExtension(parsed.pathname);
  } catch {
    // Fallback for non-standard URL strings.
    const clean = url.split("?")[0].split("#")[0];
    return checkExtension(clean);
  }
};

export const ActivityBox: FC<Props> = ({
  activity,
  className,
  onDeleted,
  ...rest
}) => {
  const { routeToPage, baseDataLoader } = usePageRouter();
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const { successToast, errorToast } = useUIContext();
  // Only the novelist whose doing it was; the server refuses anyone else.
  const canDelete = Boolean(
    onDeleted && activity?.novelistId && novelist?.id === activity.novelistId,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mediaType = useMemo(
    () =>
      activity?.target.url ? getMediaTypeFromUrl(activity.target.url) : "",
    [activity],
  );

  const isMedia = activity?.target.activityTargetType === "MEDIA";
  // PROMPT/COMMENT/REPLY activities point at the parent prompt's own id (see
  // backend createActivityTarget), so hearting them hearts that prompt directly
  // and shares its reaction count instead of keeping a separate activity-level one.
  const isPromptFamily = PROMPT_TYPES.includes(
    activity?.target.activityTargetType ?? "",
  );
  // STORY_BOARD activities (editing the story or one of its events) point at
  // the story's own id, so hearting them hearts the story directly and shares
  // its reaction count, same as the prompt merge above.
  const isStoryBoard = activity?.target.activityTargetType === "STORY_BOARD";
  const isMuse = activity?.target.activityTargetType === "MUSE";
  const isStoryBoardFamily = STORY_BOARD_TYPES.includes(
    activity?.target.activityTargetType ?? "",
  );
  // Share dialogs need the full target object (Discord embed data, tags,
  // fandom, etc.), which the activity feed doesn't carry — fetched on demand.
  const canShare = isPromptFamily || isMuse || isStoryBoardFamily;
  const reactionType = isMedia
    ? "media"
    : isPromptFamily
      ? "prompt"
      : ((activity?.target.activityTargetType ?? "").toLowerCase() as
          | "muse"
          | "profile"
          | "story_board"
          | "story_board_event");

  const [viewerOpen, setViewerOpen] = useState(false);
  const [reacted, setReacted] = useState(Boolean(activity?.reacted));
  const [reactionCount, setReactionCount] = useState(
    activity?.reactionCount ?? 0,
  );
  const [likersOpen, setLikersOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMuse, setShareMuse] = useState<Muse | null>(null);
  const [shareStory, setShareStory] = useState<StoryBoard | null>(null);
  const [sharePrompt, setSharePrompt] = useState<Pick<
    Prompt,
    "source" | "text" | "media" | "createdOn"
  > | null>(null);

  // Re-sync when the activity data arrives or refreshes after mount.
  useEffect(() => {
    setReacted(Boolean(activity?.reacted));
    setReactionCount(activity?.reactionCount ?? 0);
  }, [activity?.reacted, activity?.reactionCount]);

  const { toggleLike } = useToggleLike({
    id: activity?.target.id ?? "",
    liked: reacted,
    type: reactionType,
  });
  // Ignore heart clicks while a like request is in flight, so overlapping
  // requests can't finish out of order.
  const reactPendingRef = useRef(false);

  const {
    on: onPromptEvent,
    off: offPromptEvent,
    emit: emitPromptEvent,
  } = useCustomEvents(EVENTS.PROMPT.base);

  const {
    on: onStoryBoardEvent,
    off: offStoryBoardEvent,
    emit: emitStoryBoardEvent,
  } = useCustomEvents(EVENTS.STORY_BOARD.base);

  // Stay in sync with the prompt's own like button (feed card, thread view, etc.)
  // since PROMPT-family activities share the same reaction rows.
  useEffect(() => {
    if (!isPromptFamily || !activity?.target.id) return;
    const targetId = activity.target.id;

    const handlePromptReacted = (e: CustomEventType<PromptReactedPayload>) => {
      if (e.detail.id !== targetId) return;
      setReacted(e.detail.reacted);
      setReactionCount(e.detail.reactions);
    };

    onPromptEvent(EVENTS.PROMPT.REACTED, handlePromptReacted);
    return () => offPromptEvent(EVENTS.PROMPT.REACTED, handlePromptReacted);
  }, [isPromptFamily, activity?.target.id, onPromptEvent, offPromptEvent]);

  // Same sync, for the story's own heart button (story card, dialog/tray).
  useEffect(() => {
    if (!isStoryBoard || !activity?.target.id) return;
    const targetId = activity.target.id;

    const handleStoryBoardReacted = (
      e: CustomEventType<StoryBoardReactedPayload>,
    ) => {
      if (e.detail.id !== targetId) return;
      setReacted(e.detail.reacted);
      setReactionCount(e.detail.reactions);
    };

    onStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, handleStoryBoardReacted);
    return () =>
      offStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, handleStoryBoardReacted);
  }, [isStoryBoard, activity?.target.id, onStoryBoardEvent, offStoryBoardEvent]);

  const handleReact = async () => {
    if (reactPendingRef.current) return;
    reactPendingRef.current = true;
    // Optimistic flip; a failure restores exactly this pre-click state.
    const previous = { reactionCount, reacted };
    const nextReacted = !reacted;
    setReacted(nextReacted);
    setReactionCount((c) => Math.max(0, c + (nextReacted ? 1 : -1)));

    const result = await toggleLike().catch(() => null);
    reactPendingRef.current = false;
    if (result && "reactions" in result) {
      setReactionCount(result.reactions);
      setReacted(result.reacted);
      // Feed lists (e.g. the home page's mixedFeed) hold this exact `activity`
      // object by reference, not a clone — without mutating it here, remounting
      // this card (e.g. navigating away and back) would read the stale
      // pre-reaction value straight off the object and appear to "revert"
      // until a full page reload refetches the feed from the backend.
      if (activity) {
        activity.reacted = result.reacted;
        activity.reactionCount = result.reactions;
      }
      if (isPromptFamily && activity?.target.id) {
        emitPromptEvent(EVENTS.PROMPT.REACTED, {
          id: activity.target.id,
          reacted: result.reacted,
          reactions: result.reactions,
        });
      }
      if (isStoryBoard && activity?.target.id) {
        emitStoryBoardEvent(EVENTS.STORY_BOARD.REACTED, {
          id: activity.target.id,
          reacted: result.reacted,
          reactions: result.reactions,
        });
      }
    } else {
      // Revert on error
      setReacted(previous.reacted);
      setReactionCount(previous.reactionCount);
      errorToast(nextReacted ? "Couldn't like this." : "Couldn't unlike this.");
    }
  };

  const handleOpenLikers = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reactionCount <= 0) return;
    setLikersOpen(true);
  };

  const handleDelete = async () => {
    if (!activity || deleting) return;
    setDeleting(true);
    const result = await deleteActivityAction(activity.id).catch(() => null);
    setDeleting(false);
    if (result?.message !== API_MESSAGE.Success) {
      errorToast("Couldn't delete that activity. Try again.");
      return;
    }
    successToast("Activity removed from your profile.");
    onDeleted?.(activity.id);
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const targetId = activity?.target.id;
    if (!targetId || shareLoading) return;

    setShareLoading(true);
    let opened = false;
    try {
      if (isPromptFamily) {
        const prompt = await baseDataLoader(() => getPromptAction(targetId));
        if (prompt) {
          setSharePrompt(prompt);
          setShareOpen(true);
          opened = true;
        }
      } else if (isMuse) {
        const muse = await baseDataLoader(() => getMuseAction(targetId));
        if (muse) {
          setShareMuse(muse);
          setShareOpen(true);
          opened = true;
        }
      } else if (isStoryBoardFamily) {
        const story = await baseDataLoader(() => getStoryboardAction(targetId));
        if (story) {
          setShareStory(story);
          setShareOpen(true);
          opened = true;
        }
      }
    } catch {
      // Network failure: fall through to the error toast below.
    } finally {
      setShareLoading(false);
    }
    if (!opened) errorToast("Couldn't load share preview.");
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    activity: Activity,
  ) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("button")) return;

    if (activity?.target.activityTargetType === "MUSE")
      routeToPage(ROUTES.Muse.View(activity.target.id));
    else if (
      ["PROMPT", "COMMENT", "REPLY"].includes(
        activity.target.activityTargetType,
      )
    )
      routeToPage(ROUTES.Prompt.View(activity.target.id));
    else if (activity?.target.activityTargetType === "STORY_BOARD")
      routeToPage(ROUTES.Story.View(activity.target.id));
    else if (activity?.target.activityTargetType === "STORY_BOARD_EVENT")
      routeToPage(ROUTES.Story.Event.View(activity.target.id));
    else if (activity?.target.activityTargetType === "PROFILE")
      routeToPage(ROUTES.Profile.View(activity.source.urlProp).Index);
  };

  // The author's avatar and name open a mini preview card, same as a post
  // header; the card's Visit profile button does the routing. A disabled
  // author's stand-in has nowhere to go, so it gets no preview.
  const [showSourcePreview, setShowSourcePreview] = useState(false);
  const source = activity?.source;
  let sourcePreview: ReactNode = null;
  if (source && !source.isPlaceholder) {
    if (source.sourceType === "MUSE" && source.id) {
      sourcePreview = (
        <MuseEmbed museId={source.id} preview fallbackName={source.title} />
      );
    } else if (source.sourceType === "NOVELIST" && source.urlProp) {
      sourcePreview = <NovelistEmbed username={source.urlProp} preview />;
    }
  }

  const onSourceNameClick = (e: React.MouseEvent) => {
    if (!sourcePreview) return;
    // The header sits in a card with its own click handling.
    e.stopPropagation();
    setShowSourcePreview(true);
  };

  const [imgError, setImgError] = useState(false);

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [videoError, setVideoError] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  // True until the user presses play for the first time; used to seek back to
  // 0 after the thumbnail seek so playback always starts from the beginning.
  const showingThumbnailRef = useRef(true);

  useEffect(() => {
    if (!videoElement || videoError) return;

    const onLoadedMetadata = () => {
      const dur = videoElement.duration || 0;
      setVideoDuration(dur);
      // Seek to a real frame instead of the typically-black very first one.
      if (dur > 0) videoElement.currentTime = Math.min(0.5, dur);
    };
    const onTimeUpdate = () => {
      setVideoCurrentTime(videoElement.currentTime || 0);
      setVideoProgress(
        videoElement.duration
          ? (videoElement.currentTime / videoElement.duration) * 100
          : 0,
      );
    };
    const onEnded = () => setVideoPlaying(false);
    const onPlay = () => setVideoPlaying(true);
    const onPause = () => setVideoPlaying(false);

    videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
    videoElement.addEventListener("timeupdate", onTimeUpdate);
    videoElement.addEventListener("ended", onEnded);
    videoElement.addEventListener("play", onPlay);
    videoElement.addEventListener("pause", onPause);

    return () => {
      videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
      videoElement.removeEventListener("timeupdate", onTimeUpdate);
      videoElement.removeEventListener("ended", onEnded);
      videoElement.removeEventListener("play", onPlay);
      videoElement.removeEventListener("pause", onPause);
    };
  }, [videoElement, videoError]);

  const onToggleVideoPlay = async () => {
    if (!videoElement) return;
    if (videoPlaying) {
      videoElement.pause();
      return;
    }
    if (showingThumbnailRef.current) {
      showingThumbnailRef.current = false;
      videoElement.currentTime = 0;
    }
    try {
      await videoElement.play();
      setVideoPlaying(true);
    } catch {
      setVideoPlaying(false);
    }
  };

  const onSeekVideo = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!videoElement || !videoDuration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
    videoElement.currentTime = videoDuration * percentage;
  };

  const onExpandVideo = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (videoElement && !videoElement.paused) videoElement.pause();
    setViewerOpen(true);
  };

  Logger.info("activity rendered");

  if (!activity) return <></>;

  const kind = getActivityKind(activity.target.activityTargetType);
  const handlePrimaryAction = (e: React.MouseEvent<HTMLElement>) => {
    if (isMedia) {
      setViewerOpen(true);
      return;
    }
    handleCardClick(e, activity);
  };

  return (
    <S.ParentContainer>
      <S.HeaderContainer>
        <S.AvatarWrap>
          {sourcePreview ? (
            <SourcePreview
              label={`Preview ${activity.source.title}`}
              preview={sourcePreview}
              open={showSourcePreview}
              onOpenChange={setShowSourcePreview}
            >
              <S.Avatar
                src={activity.source?.image || ""}
                alt={activity.source.title || "Avatar"}
                nwImage={activity.source?.avatar}
              />
            </SourcePreview>
          ) : (
            <S.Avatar
              src={activity.source?.image || ""}
              alt={activity.source.title || "Avatar"}
              nwImage={activity.source?.avatar}
            />
          )}
        </S.AvatarWrap>
        <S.SourceInfo>
          <S.SourceName onClick={onSourceNameClick}>
            {activity.source.title}
          </S.SourceName>
          <S.MetaLine>
            <S.MetaVerb>{activity.activityText}</S.MetaVerb>
            <S.MetaDot />
            <S.MetaDate>{toFormattedDateFromUnix(activity.date)}</S.MetaDate>
          </S.MetaLine>
        </S.SourceInfo>
        <S.KindBadge>
          {kind.icon}
          <span>{kind.label}</span>
        </S.KindBadge>
      </S.HeaderContainer>
      <S.Body>
        <ShouldRender
          if={["PROMPT", "COMMENT", "REPLY"].includes(
            activity.target.activityTargetType,
          )}
        >
          <S.PromptBody>
            <RichTextRenderer
              savedText={activity.target.title ?? ""}
              collapsedHeight={100}
              overlayHidden
            />
          </S.PromptBody>
        </ShouldRender>
        {/* MEDIA: full-width media at its natural aspect ratio. Clicking
            opens the fullscreen viewer (never navigates) — signalled by the
            zoom-in cursor and the expand badge. */}
        <ShouldRender if={Boolean(isMedia)}>
          <S.MediaFigure>
            {mediaType === "image" && !imgError && activity.target.url && (
              <S.MediaImageButton
                type="button"
                aria-label="View media fullscreen"
                onClick={() => setViewerOpen(true)}
              >
                <S.MediaImage
                  src={activity.target.url}
                  alt={activity.target.title || "Media"}
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
                <S.MediaExpandBadge>
                  <FiMaximize2 size={11} />
                  View
                </S.MediaExpandBadge>
              </S.MediaImageButton>
            )}
            {mediaType === "video" && !videoError && (
              <S.MediaVideoWrapper>
                <S.MediaVideoViewport onClick={onToggleVideoPlay}>
                  <S.MediaVideo
                    ref={setVideoElement}
                    src={activity.target.url}
                    preload="metadata"
                    playsInline
                    disablePictureInPicture
                    onError={() => setVideoError(true)}
                  />
                </S.MediaVideoViewport>
                <ChatPlayerS.AudioProgressRow>
                  <ChatPlayerS.AudioPlayButton
                    type="button"
                    onClick={onToggleVideoPlay}
                    aria-label={videoPlaying ? "Pause" : "Play"}
                  >
                    {videoPlaying ? <FaPause /> : <FaPlay />}
                  </ChatPlayerS.AudioPlayButton>
                  <ChatPlayerS.AudioTime>
                    {formatTime(videoCurrentTime)}
                  </ChatPlayerS.AudioTime>
                  <ChatPlayerS.AudioProgressBar onClick={onSeekVideo}>
                    <ChatPlayerS.AudioProgressFill
                      style={{ width: `${videoProgress}%` }}
                    />
                  </ChatPlayerS.AudioProgressBar>
                  <ChatPlayerS.AudioTime>
                    {formatTime(videoDuration)}
                  </ChatPlayerS.AudioTime>
                </ChatPlayerS.AudioProgressRow>
                <S.MediaExpandButton
                  type="button"
                  aria-label="Open fullscreen viewer"
                  onClick={onExpandVideo}
                >
                  <FiMaximize2 size={14} />
                </S.MediaExpandButton>
              </S.MediaVideoWrapper>
            )}
            {mediaType === "audio" && (
              <S.Audio className="audio" src={activity.target.url} controls />
            )}
            {(!activity.target.url ||
              (mediaType === "image" && imgError) ||
              (mediaType === "video" && videoError)) && (
              <S.MediaFallback>
                <FaImage size={48} />
              </S.MediaFallback>
            )}
          </S.MediaFigure>
        </ShouldRender>

        {/* Non-media targets (muse, profile, story…): navigational card.
            Prompt-family activities keep it only when they carry media. */}
        <ShouldRender
          if={
            !isMedia &&
            (Boolean(mediaType) ||
              !["PROMPT", "COMMENT", "REPLY"].includes(
                activity.target.activityTargetType,
              ))
          }
        >
          <S.CardWrapper>
            <S.ImageWrapper>
              {mediaType === "image" && !imgError && (
                <S.CardBackground
                  $banner={activity.target.url || ""}
                  className="image"
                />
              )}
              {mediaType === "image" && activity.target.url && (
                // biome-ignore lint/a11y/useAltText: hidden probe only
                <img
                  src={activity.target.url}
                  style={{ display: "none" }}
                  onError={() => setImgError(true)}
                />
              )}
              {(!activity.target.url || imgError) && (
                <S.FallbackImageIcon>
                  <FaImage size={56} />
                </S.FallbackImageIcon>
              )}
            </S.ImageWrapper>
            <ShouldRender if={mediaType === "video"}>
              <S.Video
                className="video"
                src={`${activity.target.url}#t=0.3`}
                controls
              ></S.Video>
            </ShouldRender>
            <ShouldRender if={mediaType === "audio"}>
              <S.Audio
                className="audio"
                src={activity.target.url}
                controls
              ></S.Audio>
            </ShouldRender>
            <S.Card
              className={classNames([
                "muse-card",
                {
                  new: !activity.target.title,
                },
              ])}
              onClick={(e) => handleCardClick(e, activity)}
            >
              <ShouldRender
                if={
                  !["PROMPT", "COMMENT", "REPLY"].includes(
                    activity.target.activityTargetType,
                  )
                }
              >
                <S.CardHeader>
                  <S.ActivityInfo>
                    <S.Title
                      className={classNames([
                        className,
                        {
                          new: !activity.target.title,
                        },
                      ])}
                      {...rest}
                    >
                      {activity.target.title}
                    </S.Title>
                  </S.ActivityInfo>
                </S.CardHeader>
              </ShouldRender>
            </S.Card>
          </S.CardWrapper>
        </ShouldRender>
        <ShouldRender if={Boolean(isMedia && activity.target.title)}>
          <S.MediaDescription>
            <MarkdownLite text={activity.target.title} />
          </S.MediaDescription>
        </ShouldRender>
      </S.Body>
      <S.ActionRow>
        <ShouldRender if={Boolean(activity.target.id)}>
          <S.ReactionGroup>
            <S.HeartButton
              type="button"
              $active={reacted}
              aria-label={reacted ? "Remove reaction" : "React"}
              aria-pressed={reacted}
              onClick={handleReact}
            >
              {reacted ? <FaHeart /> : <FaRegHeart />}
            </S.HeartButton>
            <ShouldRender if={reactionCount > 0}>
              <S.ReactionCount type="button" onClick={handleOpenLikers}>
                <span className="count-short">{reactionCount}</span>
                <span className="label-full">
                  {`${reactionCount} ${pluralize("novelist", reactionCount)} ${pluralize(
                    "like",
                    reactionCount === 1 ? 2 : 1,
                  )} this`}
                </span>
              </S.ReactionCount>
            </ShouldRender>
          </S.ReactionGroup>
        </ShouldRender>
        <S.PrimaryAction type="button" onClick={handlePrimaryAction}>
          {kind.icon}
          {kind.actionLabel}
        </S.PrimaryAction>
        <ShouldRender if={canShare || canDelete}>
          <S.SecondaryActions>
            <ShouldRender if={canShare}>
              <S.ShareButton
                type="button"
                onClick={handleShare}
                disabled={shareLoading}
                aria-label="Share"
              >
                <IoIosShareAlt />
              </S.ShareButton>
            </ShouldRender>
            <ShouldRender if={canDelete}>
              <S.ShareButton
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                disabled={deleting}
                aria-label="Delete activity"
              >
                <FiTrash2 />
              </S.ShareButton>
            </ShouldRender>
          </S.SecondaryActions>
        </ShouldRender>
      </S.ActionRow>
      <ShouldRender if={canDelete}>
        <AppAlertDialog
          closeOnConfirm
          heading="Delete this activity?"
          text="It leaves your profile and your friends' feeds. What it was about — the post, character, story or upload — stays."
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDelete}
          actionButtonLabel="Delete"
        />
      </ShouldRender>
      <ShouldRender if={Boolean(isMedia && mediaType === "video")}>
        <VideoViewer
          src={activity.target.url || ""}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      </ShouldRender>
      <ShouldRender if={Boolean(isMedia && mediaType !== "video")}>
        <AppImageViewer
          src={activity.target.url || ""}
          alt={activity.target.title || "Media"}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      </ShouldRender>
      <ShouldRender if={Boolean(sharePrompt)}>
        <SharePromptDialog
          promptId={activity.target.id ?? ""}
          prompt={
            sharePrompt as Pick<
              Prompt,
              "source" | "text" | "media" | "createdOn"
            >
          }
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      </ShouldRender>
      <ShareMuseDialog
        muse={shareMuse}
        open={shareOpen && isMuse}
        onClose={() => setShareOpen(false)}
      />
      <ShareStoryDialog
        storyboard={shareStory}
        open={shareOpen && isStoryBoardFamily}
        onClose={() => setShareOpen(false)}
      />
      <ReactionLikersDialog
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
        targetId={activity.target.id ?? ""}
        initialCount={reactionCount}
      />
    </S.ParentContainer>
  );
};

export default ActivityBox;
