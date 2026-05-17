"use client";

import classNames from "classnames";
import { type FC, useMemo, useState } from "react";
import { FaComments, FaImage, FaStreetView, FaUser } from "react-icons/fa6";
import { PiBookOpenUserDuotone } from "react-icons/pi";
import { useGlobalState } from "@/context/store/stores";
import { useNsfwCheck } from "@/hooks/use-nsfw-check";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Activity } from "@/types/activity";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDateFromUnix } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { RichTextRenderer } from "../rich-text-editor-input/rich-test-renderer";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  activity?: Activity | null;
};

const videoExtensions = ["mp4"];
const imageExtensions = ["jpg", "jpeg", "png", "gif"];
const audioExtensions = ["mp3", "mpeg", "wav"];

const getMediaTypeFromUrl = (url: string) => {
  const extension = url.split(".").pop() || "";
  if (videoExtensions.includes(extension)) return "video";
  if (imageExtensions.includes(extension)) return "image";
  if (audioExtensions.includes(extension)) return "audio";
  return null;
};

export const ActivityBox: FC<Props> = ({ activity, className, ...rest }) => {
  const { routeToPage } = usePageRouter();
  const user = useGlobalState("user");
  const mediaType = useMemo(
    () =>
      activity?.target.url ? getMediaTypeFromUrl(activity.target.url) : "",
    [activity],
  );

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

  const [nsfwRevealed, setNsfwRevealed] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageSrc =
    mediaType === "image" ? (activity?.target.url ?? null) : null;
  const isOwnActivity = activity?.source.urlProp === user?.username;
  const isNsfw = useNsfwCheck(imageSrc, isOwnActivity);
  const showNsfwOverlay = isNsfw === true && !nsfwRevealed;
  const showBlur = !!imageSrc && (isNsfw === null || showNsfwOverlay);

  Logger.info("activity rendered");

  if (!activity) return <></>;

  return (
    <S.ParentContainer>
      <S.HeaderContainer>
        <S.Avatar
          className="selectable"
          src={activity.source?.image || ""}
          alt={activity.source.title || "Avatar"}
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
        <ShouldRender
          if={
            Boolean(mediaType) ||
            !["PROMPT", "COMMENT", "REPLY"].includes(
              activity.target.activityTargetType,
            )
          }
        >
          <S.CardWrapper>
            <S.ImageWrapper>
              {mediaType === "image" && !imgError && (
                <S.CardBackground
                  banner={activity.target.url || ""}
                  className="image"
                  style={{
                    filter: showBlur ? "blur(20px)" : undefined,
                    transition: "filter 0.3s ease",
                  }}
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
              {showNsfwOverlay && (
                <S.NSFWOverlay>
                  <S.NSFWLabel>⚠️ Sensitive content</S.NSFWLabel>
                </S.NSFWOverlay>
              )}
            </S.ImageWrapper>
            {showNsfwOverlay && (
              <S.NSFWRevealButton
                type="button"
                className="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNsfwRevealed(true);
                }}
              >
                See anyway
              </S.NSFWRevealButton>
            )}
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
    </S.ParentContainer>
  );
};

export default ActivityBox;
