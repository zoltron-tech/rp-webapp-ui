"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { FiArrowRight } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";
import { getReferredNovelistsAction } from "@/app/rp/profile/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import {
  EmailVerifiedBadge,
  FilterSearch,
  ShouldRender,
} from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { InviteFriendsDialog } from "@/components/invite-friends-dialog";
import { LoadMore } from "@/components/load-more/page";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Friend } from "@/types";
import {
  RankTrophyIcon,
  ScoreBadgeIcon,
} from "@/utils/badge-icons";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

const PAGE_SIZE = 8;

function RowShimmer() {
  return (
    <S.ShimmerRow>
      <S.ShimmerCircle />
      <S.ShimmerBody>
        <S.ShimmerLine $width="45%" $height="14px" />
        <S.ShimmerLine $width="30%" $height="11px" />
      </S.ShimmerBody>
      <S.ShimmerLine $width="90px" $height="22px" />
    </S.ShimmerRow>
  );
}

function ReferralRow({
  referral,
  onClick,
}: {
  referral: Friend;
  onClick: () => void;
}) {
  return (
    <S.Row onClick={onClick}>
      <S.RankSlot>
        {referral.rank && <RankTrophyIcon rank={referral.rank} size={24} />}
      </S.RankSlot>
      <AvatarNew
        src={referral.image}
        alt={referral.firstName}
        username={referral.username}
        nwImage={referral.avatar}
      />
      <S.Info>
        <S.NameRow>
          <S.Name>
            {referral.firstName} {referral.lastName}
          </S.Name>
          <ShouldRender if={referral.isVerified}>
            <EmailVerifiedBadge size={13} />
          </ShouldRender>
        </S.NameRow>
        <S.Username>@{referral.username}</S.Username>
      </S.Info>
      <S.ChipRow>
        <S.ScoreChip>
          <ScoreBadgeIcon size={13} />
          {referral.totalPoints.toLocaleString()} Score
        </S.ScoreChip>
      </S.ChipRow>
    </S.Row>
  );
}

export default function ReferralsListPage() {
  const user = useGlobalState("user");
  const { stopPageLoading, routeToPage } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);
  const [referrals, setReferrals] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReferredNovelistsAction(1, PAGE_SIZE).then((data) => {
      if (cancelled) return;
      setReferrals(data);
      setHasMore(data.length >= PAGE_SIZE);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await getReferredNovelistsAction(nextPage, PAGE_SIZE);
    setReferrals((prev) => [...prev, ...data]);
    setHasMore(data.length >= PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, page]);

  const displayedReferrals = useMemo(
    () =>
      !search
        ? referrals
        : referrals.filter((f) =>
            `${f.firstName ?? ""} ${f.lastName ?? ""} ${f.username}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          ),
    [referrals, search],
  );

  return (
    <S.Container>
      <BreadCrumb label="Your Circle" username={user?.username ?? ""} />
      <S.InfoBox>
        <S.InfoIcon>
          <BsPeopleFill />
        </S.InfoIcon>
        <S.InfoText>
          <S.InfoTitle>Grow your circle</S.InfoTitle>
          <S.InfoDescription>
            Novelists who join using your referral link show up here — and you
            earn bonus XP every time they write. Invite more to boost through
            the levels and unlock creative perks.
          </S.InfoDescription>
          <S.InfoLink type="button" onClick={() => routeToPage(ROUTES.Levels)}>
            Learn how leveling up earns you rewards
            <FiArrowRight />
          </S.InfoLink>
        </S.InfoText>
        <ShouldRender if={!loading && referrals.length > 0}>
          <S.InfoCount>
            <S.InfoCountValue>
              {referrals.length}
              {hasMore ? "+" : ""}
            </S.InfoCountValue>
            <S.InfoCountLabel>Recruited</S.InfoCountLabel>
          </S.InfoCount>
        </ShouldRender>
      </S.InfoBox>
      <S.InviteButton type="button" onClick={() => setInviteOpen(true)}>
        <HiUserAdd size={18} />
        Invite Friends
      </S.InviteButton>
      <FilterSearch
        value={search}
        onChange={setSearch}
        placeholder="Search referrals..."
      />
      <S.List>
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <RowShimmer key={i} />
            ))
          : displayedReferrals.map((referral) => (
              <ReferralRow
                key={referral.id}
                referral={referral}
                onClick={() =>
                  routeToPage(ROUTES.Profile.View(referral.username).Index)
                }
              />
            ))}
      </S.List>
      {!loading && referrals.length === 0 && (
        <S.Empty>
          No one has joined with your referral link yet. Share it to grow your
          circle!
        </S.Empty>
      )}
      {!loading && referrals.length > 0 && displayedReferrals.length === 0 && (
        <S.Empty>No referrals match your search.</S.Empty>
      )}
      {!loading && !search && (
        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      )}
      <InviteFriendsDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </S.Container>
  );
}
