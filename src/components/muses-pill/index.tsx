import { Novelist, Muse } from "@/types";
import { PillType } from "@/types/pill-type";
import { FC } from "react";
import { ExpandablePill } from "../common";
import { useRouter } from "next/navigation";

import { Logger } from "@/utils/services";
import * as S from "./styles";

interface Props {
  novelist?: Novelist | null;
  muse?: Muse | null;
  pillType: PillType;
}

export const MusesPill: FC<Props> = ({ pillType, novelist, muse }) => {
  Logger.info("MusesPill rendered");
  const { push } = useRouter();

  const onAvatarClick = (username: string) => {
    push(`/rp/profile/${username}`);
  };

  const onMuseAvatarClick = (museId: string) => {
    if (museId) push(`/rp/muse/${museId}`);
  };

  const loadChildren = (slice = 0, className = "") => {
    switch (pillType) {
      case "MUSES":
        return novelist?.muses
          ?.slice(0, slice ? slice : novelist?.muses.length)
          .map((muse) => (
            <S.Avatar
              src={muse.image}
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
      default:
        <></>;
    }
  };

  return (
    <ExpandablePill
      tag={pillType}
      scrollableContent={loadChildren(8, "rotate")}
      expandedContent={
        <S.ExpandedContentInner>
          {loadChildren(0, "paddington")}
        </S.ExpandedContentInner>
      }
    />
  );
};
