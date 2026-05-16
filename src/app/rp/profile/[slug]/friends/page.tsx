"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getNovelistAction } from "@/app/rp/novelists/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { FilterSearch } from "@/components/common";
import { NovelistPreviewCard } from "@/components/novelist-preview-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Friend } from "@/types";
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
  const [search, setSearch] = useState("");

  const displayedFriends = useMemo(
    () =>
      !search
        ? friends
        : (friends?.filter((f) =>
            `${f.firstName ?? ""} ${f.lastName ?? ""} ${f.username}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          ) ?? null),
    [friends, search],
  );

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
      <FilterSearch
        value={search}
        onChange={setSearch}
        placeholder="Search friends..."
      />
      <S.Grid>
        {displayedFriends?.map((friend) => (
          <NovelistPreviewCard key={friend.id} novelist={friend} />
        ))}
      </S.Grid>
      {friends !== null && friends.length === 0 && (
        <S.Empty>No friends yet.</S.Empty>
      )}
      {friends !== null &&
        friends.length > 0 &&
        displayedFriends?.length === 0 && (
          <S.Empty>No friends match your search.</S.Empty>
        )}
    </S.Container>
  );
}
