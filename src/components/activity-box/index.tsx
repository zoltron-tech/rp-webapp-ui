"use client";

import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { type FC, useMemo } from "react";
import { FaComments, FaStreetView, FaUser } from "react-icons/fa6";
import { PiBookOpenUserDuotone } from "react-icons/pi";
import type { Activity } from "@/types/activity";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDateFromUnix } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
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
  const { push } = useRouter();
  const mediaType = useMemo(
    () =>
      activity?.target.url ? getMediaTypeFromUrl(activity.target.url) : "",
    [activity],
  );

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    activity: Activity,
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    if (activity?.target.activityTargetType === "MUSE")
      push(ROUTES.Muse.View(activity.target.id));
    else if (
      ["PROMPT", "COMMENT", "REPLY"].includes(
        activity.target.activityTargetType,
      )
    )
      push(ROUTES.Prompt.View(activity.target.id));
    else if (activity?.target.activityTargetType === "STORY_BOARD")
      push(ROUTES.Story.View(activity.target.id));
    else if (activity?.target.activityTargetType === "PROFILE")
      push(ROUTES.Profile.View(activity.source.urlProp).Index);
  };

  const onAvatarClick = (
    e: React.MouseEvent<HTMLDivElement>,
    activity: Activity,
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    if (activity?.source.sourceType === "MUSE")
      push(ROUTES.Muse.View(activity.source.id));
    else if (activity?.source.sourceType === "NOVELIST")
      push(ROUTES.Profile.View(activity.source.urlProp).Index);
  };

  Logger.info("activity rendered");

  if (!activity) return <></>;

  return (
    <S.ParentContainer>
      <S.HeaderContainer>
        <Flex style={{ gap: "0.2em" }}>
          <S.Avatar
            src={activity.source?.image || ""}
            alt={""}
            size={50}
            onClick={(e) => onAvatarClick(e, activity)}
            hoverable
          />

          <S.SourceName onClick={(e) => onAvatarClick(e, activity)}>
            {" "}
            {activity.source.title}
          </S.SourceName>
          <S.ActivityText>{activity.activityText}</S.ActivityText>
        </Flex>
        <S.StyledDate>{toFormattedDateFromUnix(activity.date)}</S.StyledDate>
      </S.HeaderContainer>
      <Flex direction="column" align="center">
        <ShouldRender
          if={["PROMPT", "COMMENT", "REPLY"].includes(
            activity.target.activityTargetType,
          )}
        >
          <S.PromptText>
            {activity.target.title.length > 80
              ? `${activity.target.title.slice(0, 80)} ...`
              : activity.target.title}
          </S.PromptText>
          <ShouldRender if={activity.target.title.length > 80}>
            <S.ViewMoreText onClick={(e) => handleCardClick(e, activity)}>
              Read more...
            </S.ViewMoreText>
          </ShouldRender>
        </ShouldRender>
        <ShouldRender if={Boolean(mediaType)}>
          <S.CardWrapper>
            <ShouldRender if={mediaType === "image"}>
              <S.CardBackground
                banner={activity.target.url || ""}
                className="image"
              />
            </ShouldRender>
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
      </Flex>
      <ShouldRender
        if={["PROMPT", "COMMENT", "REPLY"].includes(
          activity.target.activityTargetType,
        )}
      >
        <S.FooterContainer>
          <FaComments />
          <S.PromptFooterText onClick={(e) => handleCardClick(e, activity)}>
            View Threads & Replies.
          </S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
      <ShouldRender if={["MUSE"].includes(activity.target.activityTargetType)}>
        <S.FooterContainer>
          <FaStreetView />
          <S.PromptFooterText onClick={(e) => handleCardClick(e, activity)}>
            View Muse.
          </S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
      <ShouldRender
        if={["STORY_BOARD", "STORY_BOARD_EVENT"].includes(
          activity.target.activityTargetType,
        )}
      >
        <S.FooterContainer>
          <PiBookOpenUserDuotone />
          <S.PromptFooterText onClick={(e) => handleCardClick(e, activity)}>
            View Story.
          </S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
      <ShouldRender
        if={["PROFILE"].includes(activity.target.activityTargetType)}
      >
        <S.FooterContainer>
          <FaUser />
          <S.PromptFooterText onClick={(e) => handleCardClick(e, activity)}>
            View Profile.
          </S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
    </S.ParentContainer>
  );
};

export default ActivityBox;
