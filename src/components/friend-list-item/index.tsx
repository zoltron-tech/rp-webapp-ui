"use client";

import type { FC } from "react";
import { Button } from "@/components/common";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Friend } from "@/types";
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

  return (
    <S.CardWrapper onClick={onClick}>
      <S.CardBackground banner={friend.image || ""} />
      <S.Card>
        <AvatarNew
          src={friend.image ?? null}
          alt={friend.firstName}
          name={`${friend.firstName} ${friend.lastName}`}
          username={friend.username}
        />
        <S.Info>
          <S.Title>
            {friend.firstName} {friend.lastName}
          </S.Title>
          <S.UsernameStyled username={friend.username} />
        </S.Info>
        <S.ButtonContainer>
          <Button variant="primary" onClick={onClick}>
            View Profile
          </Button>
        </S.ButtonContainer>
      </S.Card>
    </S.CardWrapper>
  );
};

export default FriendListItem;
