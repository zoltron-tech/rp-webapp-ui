"use client";

import type { Friend } from "@nw/types";
import type { FC } from "react";
import { Button } from "@/components/common";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type Props = {
  friend: Friend;
};

export const FriendListItem: FC<Props> = ({ friend }) => {
  const { routeToPage } = usePageRouter();

  const onClick = () => {
    routeToPage(ROUTES.Profile.View(friend.username).Index);
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <S.CardWrapper onClick={onClick}>
      <S.Card>
        <AvatarNew
          src={friend.image ?? null}
          alt={friend.firstName}
          name={`${friend.firstName} ${friend.lastName}`}
          username={friend.username}
          nwImage={friend.avatar}
        />
        <S.Info>
          <S.Title>
            {friend.firstName} {friend.lastName}
          </S.Title>
          <S.UsernameStyled username={friend.username} />
        </S.Info>
        <S.ButtonContainer>
          <Button variant="primary" onClick={() => onButtonClick}>
            View Profile
          </Button>
        </S.ButtonContainer>
      </S.Card>
    </S.CardWrapper>
  );
};

export default FriendListItem;
