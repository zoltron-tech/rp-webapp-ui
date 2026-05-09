"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getNovelistAction } from "@/app/rp/novelists/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { FriendListItem } from "@/components/friend-list-item";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Friend } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

export default function FriendsListPage() {
  const params = useParams();
  const username = params?.slug as string;
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const userNovelist = useGlobalState("novelist");
  const isCurrentUser = user?.username === username;
  const { baseDataLoader, stopPageLoading } = usePageRouter();
  const [friends, setFriends] = useState<Friend[] | null>(null);

  useEffect(() => {
    if (authState === "LOADING" || friends) return;

    const fetchFriends = async () => {
      if (isCurrentUser && userNovelist) {
        setFriends(userNovelist.friends);
        stopPageLoading();
        return;
      }
      const novelist = await baseDataLoader(() => getNovelistAction(username));
      if (novelist) {
        setFriends(novelist.friends);
      }
    };

    fetchFriends();
  }, [authState]);

  return (
    <S.Container>
      <BreadCrumb label="Friends" username={username} />
      <S.Grid>
        {friends?.map((friend) => (
          <FriendListItem key={friend.id} friend={friend} />
        ))}
      </S.Grid>
      {friends !== null && friends.length === 0 && (
        <S.Empty>No friends yet.</S.Empty>
      )}
    </S.Container>
  );
}
