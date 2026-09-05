"use client";

import type { Badge } from "@nw/types/badge";
import { useCallback, useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";
import { TbAward, TbLock } from "react-icons/tb";
import {
  getMyBadgesAction,
  syncMyBadgesAction,
} from "@/app/rp/profile/badges/actions";
import { BadgeArtwork } from "@/components/badges";
import { BreadCrumb } from "@/components/breadcrumb";
import { ShouldRender } from "@/components/common";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import * as S from "./styles";

/** Roughly the size the grid cards render at, so the shimmer matches. */
const SKELETON_COUNT = 4;

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <S.Card $earned={badge.earned}>
      <BadgeArtwork
        code={badge.code}
        size={84}
        // A locked badge is a still, drained copy of the crest it will become —
        // the shape is the point, the motion is the reward.
        animated={badge.earned}
        muted={!badge.earned}
      />
      <S.CardTitle>{badge.title}</S.CardTitle>
      <S.CardText>
        {badge.earned ? badge.description : badge.requirement}
      </S.CardText>
      <S.CardStatus $earned={badge.earned}>
        {badge.earned ? (
          <>
            <FaCircleCheck /> Earned
          </>
        ) : (
          <>
            <TbLock /> Locked
          </>
        )}
      </S.CardStatus>
    </S.Card>
  );
}

export default function BadgesPage() {
  const user = useGlobalState("user");
  const { stopPageLoading } = usePageRouter();
  const { successToast, errorToast } = useUIContext();

  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  useEffect(() => {
    let cancelled = false;
    getMyBadgesAction().then((result) => {
      if (cancelled) return;
      setBadges(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const before = badges.filter((badge) => badge.earned).length;
    const result = await syncMyBadgesAction();
    setRefreshing(false);

    // An empty result means the call failed; keeping what is on screen beats
    // blanking a collection because one request did not land.
    if (result.length === 0) {
      errorToast("Could not check your badges. Please try again.");
      return;
    }

    setBadges(result);
    const after = result.filter((badge) => badge.earned).length;
    if (after > before) {
      successToast(
        after - before === 1
          ? "New badge earned!"
          : `${after - before} new badges earned!`,
      );
    } else {
      successToast("Badges are up to date.");
    }
  }, [badges, errorToast, successToast]);

  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <S.Container>
      <BreadCrumb label="Badges" username={user?.username ?? ""} />

      <S.InfoBox>
        <S.InfoIcon>
          <TbAward />
        </S.InfoIcon>
        <S.InfoText>
          <S.InfoTitle>Your badges</S.InfoTitle>
          <S.InfoDescription>
            Badges mark what you have done around Novelist World. Earned ones
            show on your profile and anywhere else Novelists see your name.
          </S.InfoDescription>
        </S.InfoText>
        <ShouldRender if={!loading && badges.length > 0}>
          <S.InfoCount>
            <S.InfoCountValue>
              {earnedCount}/{badges.length}
            </S.InfoCountValue>
            <S.InfoCountLabel>Earned</S.InfoCountLabel>
          </S.InfoCount>
        </ShouldRender>
      </S.InfoBox>

      <S.ToolBar>
        <S.SectionHeading>Collection</S.SectionHeading>
        <S.RefreshButton
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <FiRefreshCw />
          {refreshing ? "Checking…" : "Check for new badges"}
        </S.RefreshButton>
      </S.ToolBar>

      <S.Grid>
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <S.ShimmerCard key={index} />
            ))
          : badges.map((badge) => <BadgeCard key={badge.code} badge={badge} />)}
      </S.Grid>

      <ShouldRender if={!loading && badges.length === 0}>
        <S.Empty>
          No badges to show yet. Check back once there are more ways to earn
          them.
        </S.Empty>
      </ShouldRender>
    </S.Container>
  );
}
