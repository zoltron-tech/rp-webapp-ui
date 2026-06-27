"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendsByUsernameAction } from "@/app/rp/novelists/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { FilterSearch } from "@/components/common";
import { LoadMore } from "@/components/load-more/page";
import { NovelistPreviewCard } from "@/components/novelist-preview-card";
import type { Friend } from "@/types";
import * as S from "./styles";

const PAGE_SIZE = 8;

function CardShimmer() {
  return (
    <S.ShimmerCard>
      <S.ShimmerStrip />
      <S.ShimmerBody>
        <S.ShimmerCircle />
        <S.ShimmerLine $width="65%" $height="13px" />
        <S.ShimmerLine $width="45%" $height="11px" />
        <S.ShimmerLine $width="80%" $height="28px" />
      </S.ShimmerBody>
    </S.ShimmerCard>
  );
}

export default function FriendsListPage() {
  const params = useParams();
  const username = params?.slug as string;
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFriendsByUsernameAction(username, 1, PAGE_SIZE).then((data) => {
      if (cancelled) return;
      setFriends(data);
      setHasMore(data.length >= PAGE_SIZE);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await getFriendsByUsernameAction(username, nextPage, PAGE_SIZE);
    setFriends((prev) => [...prev, ...data]);
    setHasMore(data.length >= PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, page, username]);

  const displayedFriends = useMemo(
    () =>
      !search
        ? friends
        : friends.filter((f) =>
            `${f.firstName ?? ""} ${f.lastName ?? ""} ${f.username}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          ),
    [friends, search],
  );

  return (
    <S.Container>
      <BreadCrumb label="Friends" username={username} />
      <FilterSearch
        value={search}
        onChange={setSearch}
        placeholder="Search friends..."
      />
      <S.Grid>
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <CardShimmer key={i} />
            ))
          : displayedFriends.map((friend) => (
              <NovelistPreviewCard key={friend.id} novelist={friend} />
            ))}
      </S.Grid>
      {!loading && friends.length === 0 && <S.Empty>No friends yet.</S.Empty>}
      {!loading && friends.length > 0 && displayedFriends.length === 0 && (
        <S.Empty>No friends match your search.</S.Empty>
      )}
      {!loading && !search && (
        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      )}
    </S.Container>
  );
}
