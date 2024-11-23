"use client";

import { FC, useMemo } from "react";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import classNames from "classnames";
import { Activity, ActivityTarget } from "@/types/activity";
import moment from "moment";
import { ShouldRender } from "../common";
import { FaComments } from "react-icons/fa6";
import { Flex } from "@novelist-world/ui";

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
  return "image";
};

export const ActivityBox: FC<Props> = ({ activity, className, ...rest }) => {
  const { push } = useRouter();
  const mediaType = useMemo(
    () =>
      activity?.target.url ? getMediaTypeFromUrl(activity.target.url) : "",
    [activity]
  );

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    activity: Activity
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    if (activity?.target.activityTargetType === "MUSE")
      push(`/rp/muse/${activity.target.id}`);
    else if (activity?.target.activityTargetType === "PROMPT")
      push(`/rp/prompt/${activity.target.id}`);
    else if (activity?.target.activityTargetType === "STORY_BOARD")
      push(`/rp/story/${activity.target.id}`);
    else if (activity?.target.activityTargetType === "PROFILE")
      push(`/rp/profile/${activity.source.urlProp}`);
  };

  const onAvatarClick = (
    e: React.MouseEvent<HTMLDivElement>,
    activity: Activity
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    if (activity?.source.activitySourceType === "MUSE")
      push(`/rp/muse/${activity.source.id}`);
    else if (activity?.source.activitySourceType === "NOVELIST")
      push(`/rp/profile/${activity.source.urlProp}`);
  };

  const toFormattedDate = (unixTime: number): string => {
    const date = moment.unix(unixTime);
    const now = moment();

    const units = [
      { name: "y", value: now.diff(date, "years") },
      { name: "mon", value: now.diff(date, "months") },
      { name: "d", value: now.diff(date, "days") },
      { name: "h", value: now.diff(date, "hours") },
      { name: "m", value: now.diff(date, "minutes") },
    ];

    const unit = units.find((u) => u.value > 0);
    return unit ? `${unit.value}${unit.name} ago` : "just now";
  };

  Logger.info("activity rendered");

  if (!activity) return <></>;

  return (
    <S.ParentContainer>
      <S.HeaderContainer>
        <Flex>
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
        <S.Date>{toFormattedDate(activity.date)}</S.Date>
      </S.HeaderContainer>
      <Flex direction="column" align="flex-start">
        <ShouldRender if={activity.target.activityTargetType === "PROMPT"}>
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
        <S.CardWrapper>
          <ShouldRender if={mediaType === "image" || !mediaType}>
            <S.CardBackground
              banner={activity.target.url || ""}
              className="image"
            />
          </ShouldRender>
          <ShouldRender if={mediaType === "video"}>
            <S.Video
              className="video"
              src={activity.target.url + "#t=0.3"}
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
            <ShouldRender if={activity.target.activityTargetType !== "PROMPT"}>
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
      </Flex>
      <ShouldRender if={activity.target.activityTargetType === "PROMPT"}>
        <S.FooterContainer>
          <FaComments />{" "}
          <S.PromptFooterText onClick={(e) => handleCardClick(e, activity)}>
            View Comments & Replies.
          </S.PromptFooterText>
        </S.FooterContainer>
      </ShouldRender>
    </S.ParentContainer>
  );
};

export default ActivityBox;
