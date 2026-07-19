"use client";

import classNames from "classnames";
import { type FC, useEffect, useMemo, useState } from "react";
import {
  FaComments,
  FaHeart,
  FaImage,
  FaRegHeart,
  FaStreetView,
  FaUser,
} from "react-icons/fa6";
import { FiMaximize2 } from "react-icons/fi";
import { PiBookOpenUserDuotone } from "react-icons/pi";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useToggleLike } from "@/hooks/use-toggle-like";
import type { Activity } from "@/types/activity";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDateFromUnix } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { MarkdownLite } from "../markdown-lite";
import { AppImageViewer } from "../image-viewer/AppImageViewer";
import { VideoViewer } from "../image-viewer/VideoViewer";
import { RichTextRenderer } from "../rich-text-editor-input/rich-test-renderer";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  activity?: Activity | null;
};

const videoExtensions = ["mp4"];
const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "avif"];
const audioExtensions = ["mp3", "mpeg", "wav"];

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

export const ActivityBox: FC<Props> = ({ activity, className, ...rest }) => {
  const { routeToPage } = usePageRouter();
  const user = useGlobalState("user");
  const mediaType = useMemo(
    () =>
      activity?.target.url ? getMediaTypeFromUrl(activity.target.url) : "",
    [activity],
  );

  const isMedia = activity?.target.activityTargetType === "MEDIA";
  const [viewerOpen, setViewerOpen] = useState(false);
  const [reacted, setReacted] = useState(Boolean(activity?.reacted));
  const [reactionCount, setReactionCount] = useState(
    activity?.reactionCount ?? 0,
  );

  // Re-sync when the activity data arrives or refreshes after mount.
  useEffect(() => {
    setReacted(Boolean(activity?.reacted));
    setReactionCount(activity?.reactionCount ?? 0);
  }, [activity?.reacted, activity?.reactionCount]);

  const { toggleLike } = useToggleLike({
    id: activity?.target.id ?? "",
    liked: reacted,
    type: "media",
  });

  const handleReact = async () => {
    // Optimistic flip
    const nextReacted = !reacted;
    setReacted(nextReacted);
    setReactionCount((c) => Math.max(0, c + (nextReacted ? 1 : -1)));

    const result = await toggleLike();
    if ("reactions" in result) {
      setReactionCount(result.reactions);
      setReacted(result.reacted);
    } else {
      // Revert on error
      setReacted(!nextReacted);
      setReactionCount((c) => Math.max(0, c + (nextReacted ? -1 : 1)));
    }
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
    else if (activity?.target.activityTargetType === "PROFILE")
      routeToPage(ROUTES.Profile.View(activity.source.urlProp).Index);
  };

  const onAvatarClick = (activity: Activity) => {
    if (activity?.source.sourceType === "MUSE")
      routeToPage(ROUTES.Muse.View(activity.source.id));
    else if (activity?.source.sourceType === "NOVELIST")
      routeToPage(ROUTES.Profile.View(activity.source.urlProp).Index);
  };

  const [imgError, setImgError] = useState(false);

  Logger.info("activity rendered");

  if (!activity) return <></>;

  return (
    <S.ParentContainer>
      <S.HeaderContainer>
        <S.Avatar
          src={activity.source?.image || ""}
          alt={activity.source.title || "Avatar"}
          nwImage={activity.source?.avatar}
          onClick={() => onAvatarClick(activity)}
        />
        <S.SourceInfo>
          <S.SourceName onClick={() => onAvatarClick(activity)}>
            {activity.source.title}
          </S.SourceName>
          <S.ActivityText>{activity.activityText}</S.ActivityText>
        </S.SourceInfo>
        <S.StyledDate>{toFormattedDateFromUnix(activity.date)}</S.StyledDate>
      </S.HeaderContainer>
      <S.Body>
        <ShouldRender
          if={["PROMPT", "COMMENT", "REPLY"].includes(
            activity.target.activityTargetType,
          )}
        >
          <RichTextRenderer
            savedText={activity.target.title ?? ""}
            collapsedHeight={100}
            overlayHidden
          />
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
            {mediaType === "video" && (
              <S.MediaVideoWrapper>
                <S.MediaVideo
                  src={`${activity.target.url}#t=0.3`}
                  controls
                  preload="metadata"
                />
                <S.MediaExpandButton
                  type="button"
                  aria-label="Open fullscreen viewer"
                  onClick={() => setViewerOpen(true)}
                >
                  <FiMaximize2 size={14} />
                </S.MediaExpandButton>
              </S.MediaVideoWrapper>
            )}
            {mediaType === "audio" && (
              <S.Audio className="audio" src={activity.target.url} controls />
            )}
            {(!activity.target.url ||
              (mediaType === "image" && imgError)) && (
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
                  banner={activity.target.url || ""}
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
      <ShouldRender
        if={["PROMPT", "COMMENT", "REPLY"].includes(
          activity.target.activityTargetType,
        )}
      >
        <S.FooterContainer onClick={(e) => handleCardClick(e, activity)}>
          <FaComments />
          <S.PromptFooterText>View Threads &amp; Replies.</S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
      <ShouldRender if={["MUSE"].includes(activity.target.activityTargetType)}>
        <S.FooterContainer onClick={(e) => handleCardClick(e, activity)}>
          <FaStreetView />
          <S.PromptFooterText>View Character.</S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
      <ShouldRender
        if={["STORY_BOARD", "STORY_BOARD_EVENT"].includes(
          activity.target.activityTargetType,
        )}
      >
        <S.FooterContainer onClick={(e) => handleCardClick(e, activity)}>
          <PiBookOpenUserDuotone />
          <S.PromptFooterText>View Story.</S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
      <ShouldRender
        if={["PROFILE"].includes(activity.target.activityTargetType)}
      >
        <S.FooterContainer onClick={(e) => handleCardClick(e, activity)}>
          <FaUser />
          <S.PromptFooterText>View Profile.</S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
      <ShouldRender if={Boolean(isMedia)}>
        <S.ReactionBar>
          <S.HeartButton
            type="button"
            $active={reacted}
            aria-label={reacted ? "Remove reaction" : "React"}
            aria-pressed={reacted}
            onClick={handleReact}
          >
            {reacted ? <FaHeart /> : <FaRegHeart />}
            <ShouldRender if={reactionCount > 0}>
              <S.ReactionCount>{reactionCount}</S.ReactionCount>
            </ShouldRender>
          </S.HeartButton>
        </S.ReactionBar>
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
    </S.ParentContainer>
  );
};

export default ActivityBox;
