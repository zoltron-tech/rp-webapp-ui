import type { FC } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse, Novelist, StoryBoard } from "@/types";
import type { PillType } from "@/types/pill-type";
import { ROUTES } from "@/utils/constants/routes";
import { mainVerseMuses } from "@/utils/muse";
import { Logger } from "@/utils/services";
import { ExpandablePill } from "../common";
import * as S from "./styles";

interface Props {
  title: string;
  novelist?: Novelist | null;
  muse?: Muse | null;
  storyboard?: StoryBoard | null;
  pillType: PillType;
  expandable: boolean;
}

export const MusesPill: FC<Props> = ({
  title,
  pillType,
  novelist,
  muse,
  storyboard,
  expandable,
}) => {
  Logger.info("MusesPill rendered");
  const { routeToPage } = usePageRouter();

  const onAvatarClick = (username: string) => {
    routeToPage(ROUTES.Profile.View(username).Index);
  };

  const onMuseAvatarClick = (museId: string) => {
    if (museId) routeToPage(ROUTES.Muse.View(museId));
  };

  const loadChildren = (slice = 0, className = "") => {
    switch (pillType) {
      case "MUSES":
        return mainVerseMuses(novelist?.muses)
          .slice(0, slice ? slice : undefined)
          .map((muse) => (
            <S.Avatar
              src={muse.image ?? null}
              alt={muse.firstName}
              size={65}
              key={muse.firstName}
              className={className}
              name={muse.firstName}
              onClick={() => onMuseAvatarClick(muse.id ? muse.id : "")}
              hoverable
            />
          ));
      case "FRIENDS":
        return novelist?.friends
          ?.slice(0, slice ? slice : novelist?.friends.length)
          .map((friend) => (
            <S.Avatar
              src={friend.image}
              alt={friend.username}
              size={65}
              key={friend.username}
              className={className}
              name={friend.username}
              onClick={() => onAvatarClick(friend.username)}
              hoverable
            />
          ));
      case "CONTACTS":
        return muse?.connections
          ?.slice(0, slice ? slice : muse?.connections.length)
          .map((connection) => (
            <S.Avatar
              src={connection.image}
              alt={connection.firstName}
              size={65}
              key={connection.firstName}
              className={className}
              name={connection.firstName}
              onClick={() =>
                onMuseAvatarClick(connection.id ? connection.id : "")
              }
              hoverable
            />
          ));
      case "MEMBERS":
        return storyboard?.members
          ?.slice(0, slice ? slice : storyboard?.members.length)
          .map((member) => (
            <S.Avatar
              src={member.image}
              alt={member.username}
              size={65}
              key={member.username}
              className={className}
              name={member.username}
              onClick={() => onAvatarClick(member.username)}
              hoverable
            />
          ));
      default:
        <></>;
    }
  };

  return (
    <ExpandablePill
      tag={title}
      scrollableContent={loadChildren(8, "rotate")}
      expandable={expandable}
      expandedContent={
        <S.ExpandedContentInner>
          {loadChildren(0, "paddington")}
        </S.ExpandedContentInner>
      }
    />
  );
};
