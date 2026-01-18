"use client";

import { Flex } from "@novelist-world/ui";
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
                <S.Username>{friend.username}</S.Username>
              </Flex>
            </S.Row>
          );
        })}
      </S.List>
    </S.PositionContainer>
  );
};
