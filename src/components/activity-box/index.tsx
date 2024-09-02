"use client";

import { FC, useMemo } from "react";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import classNames from "classnames";
import { Activity, ActivityTarget } from "@/types/activity";
import moment from "moment";
import { ShouldRender } from "../common";

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
    else if (activity?.target.activityTargetType === "STORY_BOARD")
      push(`/rp/story/${activity.target.id}`);
    else if (activity?.target.activityTargetType === "PROFILE")
      push(`/rp/profile/${activity.novelist.username}`);
  };

  const onAvatarClick = () => {
    if (!activity) return;
    push(`/rp/profile/${activity.novelist.username}`);
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
        <S.Avatar
          src={activity.novelist?.image || ""}
          alt={""}
          size={50}
          onClick={onAvatarClick}
          hoverable
        />
        <S.ActivityText>
          {activity.novelist.firstName} {activity.activityText}
        </S.ActivityText>
        <S.Date>{toFormattedDate(activity.date)}</S.Date>
      </S.HeaderContainer>
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
            src={activity.target.url  + "#t=0.3"}
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
        </S.Card>
      </S.CardWrapper>
    </S.ParentContainer>
  );
};

export default ActivityBox;
