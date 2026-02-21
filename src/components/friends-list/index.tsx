"use client";

import { Flex, ShouldRender } from "@novelist-world/ui";
import { VscVerifiedFilled } from "react-icons/vsc";
import type { Friend } from "@/types";
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
                <AvatarNew src={friend.image} alt={friend.username} />
                <Flex gap={"0.1rem"} justify="center">
                  <S.Name>
                    {friend.firstName} {friend.lastName}
                  </S.Name>
                  <ShouldRender if={friend?.isVerified === true}>
                    <VscVerifiedFilled size={12} color="rgb(28, 123, 201)" />
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
