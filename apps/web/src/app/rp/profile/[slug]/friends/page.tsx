"use client";

import { FRIENDS_PAGE_SIZE, useNovelistFriends } from "@nw/features";
import { useParams } from "@/lib/navigation";
import { usernameFromHandle } from "@/utils/constants/profile-handle";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { NoFriendsArt, NoMatchesArt } from "@/components/book-art";
import { BreadCrumb } from "@/components/breadcrumb";
import { FilterSearch } from "@/components/common";
import { LoadMore } from "@/components/load-more/page";
import { NovelistPreviewCard } from "@/components/novelist-preview-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

/**
 * The page size now comes from `@nw/features`, which the native friends list
 * renders from as well. It was 8 here and would have been 8 again over there —
 * two constants that must agree is one constant waiting to disagree.
 */
const PAGE_SIZE = FRIENDS_PAGE_SIZE;

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
  const [search, setSearch] = useState("");

  // Paging, the end-of-list rule and the cache all live in the shared hook;
  // what stays here is this page's own chrome and its client-side search.
  const {
    fetchNextPage,
    friends,
    hasNextPage,
    isFetchingNextPage,
    isPending: loading,
  } = useNovelistFriends(username);

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
          hasMore={Boolean(hasNextPage)}
          loadingMore={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      )}
    </S.Container>
  );
}
