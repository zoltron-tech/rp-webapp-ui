"use client";

import { FC } from "react";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import classNames from "classnames";
import { Activity, ActivityTarget } from "@/types/activity";
import moment from "moment";

type Props = React.HTMLProps<HTMLDivElement> & {
  activity?: Activity | null;
};

export const ActivityBox: FC<Props> = ({ activity, className, ...rest }) => {
  const { push } = useRouter();

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    activityTarget: ActivityTarget
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;
    push(`/rp/muse/${activityTarget.id}`);
  };

  const onAvatarClick = () => {
    if (!activity) return;
    push(`/rp/profile/${activity.novelist.username}`);
  };

  const toFormattedDate = (unixTime: number): string => {
    const date = moment.unix(unixTime);
    const today = moment();

    if (date.isSame(today, "day")) {
      // Return only the time if the date is today
      return date.format("LT"); // 'LT' is locale-specific time format (e.g., 12:30 PM)
    } else if (date.isSame(today, "year")) {
      // Return only the month and day if it's the same year
      return date.format("MMMM D"); // e.g., 'August 23'
    } else {
      // Return the full date if it's not the same year
      return date.format("LL"); // 'LL' is locale-specific date format (e.g., August 23, 2024)
    }
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
        <S.CardBackground banner={activity.target.url || ""} />
        <S.Card
          className={classNames([
            "muse-card",
            {
              new: !activity.target.title,
            },
          ])}
          onClick={(e) => handleCardClick(e, activity.target)}
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
