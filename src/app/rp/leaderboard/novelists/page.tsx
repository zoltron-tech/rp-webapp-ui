"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HiUserAdd } from "react-icons/hi";
import { IoChevronBack } from "react-icons/io5";
import { AvatarNew } from "@/components/common/avatar-new";
import { InviteFriendsDialog } from "@/components/invite-friends-dialog";
import { LoadMore } from "@/components/load-more/page";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import {
  LevelBadgeIcon,
  RankTrophyIcon,
  XPBadgeIcon,
} from "@/utils/badge-icons";
import { ROUTES } from "@/utils/constants/routes";
import {
  getNovelistLeaderboardAction,
  getNovelistRankByIdAction,
  type NovelistLeaderboardEntry,
} from "../actions";
import { LeaderboardInfo } from "../leaderboard-info";
import * as S from "../styles";

const PAGE_SIZE = 20;
const MAX_TOTAL = 80;

export default function NovelistLeaderboardPage() {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const { routeToPage, stopPageLoading } = usePageRouter();
  const authResolved = useRef(false);

  const [entries, setEntries] = useState<NovelistLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ownRank, setOwnRank] = useState<NovelistLeaderboardEntry | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  useEffect(() => {
    if (authState === "LOADING" || authState === "LOGGED_IN") {
      authResolved.current = true;
      return;
    }
    if (authState === "LOGGED_OUT" && authResolved.current) {
      routeToPage(ROUTES.Login);
    }
  }, [authState, routeToPage]);

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;

    Promise.all([
      getNovelistLeaderboardAction(1, PAGE_SIZE),
      novelist?.id
        ? getNovelistRankByIdAction(novelist.id)
        : Promise.resolve({ message: "" }),
    ]).then(([listResult, rankResult]) => {
      setLoading(false);
      if ("message" in listResult) {
        setError(true);
      } else {
        setEntries(listResult);
        setHasMore(listResult.length > 0 && listResult.length < MAX_TOTAL);
        setPage(1);
      }
      if (!("message" in rankResult)) {
        setOwnRank(rankResult);
      }
    });
  }, [authState]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    const result = await getNovelistLeaderboardAction(next, PAGE_SIZE);
    setLoadingMore(false);
    if ("message" in result) return;
    const newTotal = entries.length + result.length;
    setEntries((prev) => [...prev, ...result]);
    setHasMore(result.length > 0 && newTotal < MAX_TOTAL);
    setPage(next);
  }, [page, loadingMore, entries]);

  if (authState === "LOADING") return null;
  if (authState === "LOGGED_OUT" && !authResolved.current) return null;
  if (authState === "LOGGED_OUT") return null;

  return (
    <>
      <S.Root>
        <S.Header>
          <S.BackButton type="button" onClick={() => routeToPage(ROUTES.Home)}>
            <IoChevronBack size={16} />
            Back
          </S.BackButton>
          <S.Eyebrow>Hall of Fame</S.Eyebrow>
          <S.TitleRow>
            <S.Title>Novelist Leaderboard</S.Title>
            <S.InfoButton
              type="button"
              aria-label="About this leaderboard"
              onClick={() => setInfoOpen(true)}
            >
              i
            </S.InfoButton>
          </S.TitleRow>
          <S.Subtitle>
            The top writers on Novelist World ranked by XP earned.
          </S.Subtitle>
          <S.InviteXPButton type="button" onClick={() => setInviteOpen(true)}>
            <HiUserAdd />
            Invite friends & earn more XP
          </S.InviteXPButton>
        </S.Header>

        {loading && <S.Spinner aria-label="Loading…" />}

        {!loading && error && (
          <S.ErrorText>
            Couldn&apos;t load the leaderboard right now. Try refreshing.
          </S.ErrorText>
        )}

        {!loading && !error && entries.length === 0 && (
          <S.EmptyState>
            <span>📖</span>
            No entries yet — be the first to earn XP!
          </S.EmptyState>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            {entries.slice(0, 3).length > 0 && (
              <S.TopThreeGroup>
                {entries.slice(0, 3).map((entry) => (
                  <NovelistRow
                    key={entry.novelist.id}
                    entry={entry}
                    isSelf={entry.novelist.username === user?.username}
                    inGroup
                    onClick={() =>
                      routeToPage(
                        ROUTES.Profile.View(entry.novelist.username).Index,
                      )
                    }
                  />
                ))}
              </S.TopThreeGroup>
            )}
            {entries.slice(3).length > 0 && (
              <S.List>
                {entries.slice(3).map((entry) => (
                  <NovelistRow
                    key={entry.novelist.id}
                    entry={entry}
                    isSelf={entry.novelist.username === user?.username}
                    onClick={() =>
                      routeToPage(
                        ROUTES.Profile.View(entry.novelist.username).Index,
                      )
                    }
                  />
                ))}
              </S.List>
            )}
            <S.LoadMoreWrap>
              <LoadMore
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
              />
            </S.LoadMoreWrap>
          </>
        )}
      </S.Root>

      <LeaderboardInfo
        type="novelist"
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />

      {ownRank && (
        <S.StickyFooter>
          <S.OwnRankCard
            onClick={() =>
              routeToPage(ROUTES.Profile.View(ownRank.novelist.username).Index)
            }
          >
            <RankMarker rank={ownRank.rank} />
            <AvatarNew
              src={ownRank.novelist.image}
              alt={ownRank.novelist.firstName}
              username={ownRank.novelist.username}
              nwImage={ownRank.novelist.avatar}
            />
            <S.RowBody>
              <S.OwnRankLabel>Your Rank</S.OwnRankLabel>
              <S.RowName>
                {ownRank.novelist.firstName}
                {ownRank.novelist.lastName
                  ? ` ${ownRank.novelist.lastName}`
                  : ""}
              </S.RowName>
              <S.ChipRow>
                <S.LevelChip>
                  <LevelBadgeIcon size={13} />
                  Lv. {ownRank.level}
                </S.LevelChip>
                <S.XPChip>
                  <XPBadgeIcon size={13} />
                  {ownRank.totalPoints.toLocaleString()} XP
                </S.XPChip>
              </S.ChipRow>
            </S.RowBody>
          </S.OwnRankCard>
        </S.StickyFooter>
      )}

      <InviteFriendsDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  );
}

/**
 * Rank indicator: the detailed tiered trophy for the podium (top three),
 * the plain numbered medallion for everyone below.
 */
function RankMarker({ rank, inGroup }: { rank: number; inGroup?: boolean }) {
  if (rank <= 3) {
    return (
      <S.RankTrophyBadge $big={inGroup}>
        <RankTrophyIcon rank={rank} size={inGroup ? 38 : 26} />
      </S.RankTrophyBadge>
    );
  }
  return <S.RankBadge $rank={rank}>{rank}</S.RankBadge>;
}

function NovelistRow({
  entry,
  isSelf,
  inGroup,
  onClick,
}: {
  entry: NovelistLeaderboardEntry;
  isSelf: boolean;
  inGroup?: boolean;
  onClick: () => void;
}) {
  const { novelist, rank, totalPoints, level } = entry;

  return (
    <S.Row
      $rank={isSelf ? undefined : rank}
      $isSelf={isSelf}
      $inGroup={inGroup}
      onClick={onClick}
    >
      <RankMarker rank={rank} inGroup={inGroup} />
      <AvatarNew
        src={novelist.image}
        alt={novelist.firstName}
        username={novelist.username}
        nwImage={novelist.avatar}
      />
      <S.RowBody>
        <S.ChipRow style={{ marginBottom: 1 }}>
          <S.RowName>
            {novelist.firstName}
            {novelist.lastName ? ` ${novelist.lastName}` : ""}
          </S.RowName>
          {isSelf && <S.YouBadge>You</S.YouBadge>}
        </S.ChipRow>
        <S.RowSub>@{novelist.username}</S.RowSub>
        <S.ChipRow>
          <S.LevelChip>
            <LevelBadgeIcon size={13} />
            Lv. {level}
          </S.LevelChip>
          <S.XPChip>
            <XPBadgeIcon size={13} />
            {totalPoints.toLocaleString()} XP
          </S.XPChip>
        </S.ChipRow>
      </S.RowBody>
    </S.Row>
  );
}
