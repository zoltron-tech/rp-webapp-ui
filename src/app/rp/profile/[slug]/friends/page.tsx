"use client";

import type { Friend } from "@nw/types";
import { useParams } from "@/lib/navigation";
import { usernameFromHandle } from "@/utils/constants/profile-handle";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { getFriendsByUsernameAction } from "@/app/rp/novelists/actions";
import { NoFriendsArt, NoMatchesArt } from "@/components/book-art";
import { BreadCrumb } from "@/components/breadcrumb";
import { FilterSearch } from "@/components/common";
import { LoadMore } from "@/components/load-more/page";
import { NovelistPreviewCard } from "@/components/novelist-preview-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
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
  // The route param is a handle (`@tokyo`), not a bare username.
  const username = usernameFromHandle(params?.handle as string);
  const user = useGlobalState("user");
  const isOwnProfile = user?.username === username;
  const { stopPageLoading, routeToPage } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);
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
      {!loading && friends.length === 0 && (
        <S.EmptyStateWrap>
          <NoFriendsArt />
          <S.EmptyStateTitle>No friends yet</S.EmptyStateTitle>
          <S.EmptyStateSubtitle>
            {isOwnProfile
              ? "Novelists you connect with will show up here."
              : `${username} hasn't connected with anyone yet.`}
          </S.EmptyStateSubtitle>
          {isOwnProfile && (
            <S.EmptyStateCta
              type="button"
              onClick={() => routeToPage(ROUTES.Fellows)}
            >
              Find fellow novelists
              <FiArrowRight size={14} />
            </S.EmptyStateCta>
          )}
        </S.EmptyStateWrap>
      )}
      {!loading && friends.length > 0 && displayedFriends.length === 0 && (
        <S.EmptyStateWrap>
          <NoMatchesArt />
          <S.EmptyStateTitle>No friends match your search</S.EmptyStateTitle>
          <S.EmptyStateSubtitle>
            Try a different name, or clear the search to see everyone.
          </S.EmptyStateSubtitle>
        </S.EmptyStateWrap>
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
