"use client";

import { Flex, ShouldRender } from "@novelist-world/ui";
import type { Friend } from "@/types";
import { EmailVerifiedBadge } from "../common";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styled";

interface FriendsListProps {
  friends: Friend[];
}

export const FriendsList = ({ friends }: FriendsListProps) => {
  return (
    <S.PositionContainer>
      <S.List>
        {/* Friend list */}
        {friends.map((friend) => {
          return (
            <S.Row key={friend.username}>
              <Flex>
                <AvatarNew
                  src={friend.image}
                  alt={friend.username}
                  nwImage={friend.avatar}
                />
                <Flex gap={"0.1rem"} justify="center">
                  <S.Name>
                    {friend.firstName} {friend.lastName}
                  </S.Name>
                  <ShouldRender if={friend?.isVerified === true}>
                    <EmailVerifiedBadge size={14} />
                  </ShouldRender>
                </Flex>
              </Flex>
            </S.Row>
          );
        })}
      </S.List>
    </S.PositionContainer>
  );
};
