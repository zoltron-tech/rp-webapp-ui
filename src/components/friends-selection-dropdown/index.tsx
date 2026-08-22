"use client";

import { Flex } from "@novelist-world/ui";
import type { Friend } from "@nw/types";
import { Checkbox } from "radix-ui";
import { type SetStateAction, useMemo, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { GiCheckMark } from "react-icons/gi";
import { IoSearch } from "react-icons/io5";
import { useGlobalState } from "@/context/store/stores";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styled";

interface FriendSelectionDropdownProps {
  selectedFriends: Friend[];
  setSelectedFriends: React.Dispatch<SetStateAction<Friend[]>>;
  /** Optional list of friends to choose from. Defaults to the novelist's friends. */
  friends?: Friend[];
}

export const FriendSelectionDropdown = ({
  selectedFriends,
  setSelectedFriends,
  friends,
}: FriendSelectionDropdownProps) => {
  const novelist = useGlobalState("novelist");
  const [search, setSearch] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && search === "" && selectedFriends.length > 0) {
      setSelectedFriends((prev) => prev.slice(0, -1));
    }
  };

  const toggleFriend = (friend: Friend) => {
    setSelectedFriends((prev) =>
      prev.some((f) => f.username === friend.username)
        ? prev.filter((f) => f.username !== friend.username)
        : [...prev, friend],
    );
  };

  const removeFriend = (username: string) => {
    setSelectedFriends((prev) => prev.filter((f) => f.username !== username));
  };

  const filteredFriends = useMemo(() => {
    const source = friends ?? novelist?.friends;
    if (!source) return [];
    return source.filter((friend) =>
      friend.username.toLowerCase().includes(search.toLowerCase()),
    );
  }, [friends, novelist?.friends, search]);

  return (
    <S.PositionContainer>
      {/* Selected chips + search */}
      <S.InputWrapper>
        <IoSearch />
        {selectedFriends.map((friend) => (
          <S.Chip key={friend.username}>
            <AvatarNew src={friend.image} alt={friend.username} />
            {friend.firstName}
            <S.RemoveButton onClick={() => removeFriend(friend.username)}>
              <FaXmark />
            </S.RemoveButton>
          </S.Chip>
        ))}

        <S.SearchInput
          placeholder={selectedFriends.length === 0 ? "Search friends..." : ""}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </S.InputWrapper>
      <S.List>
        {/* Friend list */}
        {filteredFriends.map((friend) => {
          const checked = selectedFriends.some(
            (f) => f.username === friend.username,
          );

          return (
            <S.Row key={friend.username}>
              <Flex>
                <AvatarNew src={friend.image} alt={friend.username} />
                <S.Name>
                  {friend.firstName} {friend.lastName}
                </S.Name>
              </Flex>
              <Flex>
                <Checkbox.Root
                  checked={checked}
                  onCheckedChange={() => toggleFriend(friend)}
                  className="checkbox-root"
                >
                  <Checkbox.Indicator className="checkbox-indicator">
                    <GiCheckMark />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </Flex>
            </S.Row>
          );
        })}

        {filteredFriends.length === 0 && (
          <S.EmptyState>No friends found</S.EmptyState>
        )}
      </S.List>
    </S.PositionContainer>
  );
};
