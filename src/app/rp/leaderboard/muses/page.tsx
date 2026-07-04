"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { HiUserAdd } from "react-icons/hi";
import { IoChevronBack } from "react-icons/io5";
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
  getMuseLeaderboardAction,
  type MuseLeaderboardEntry,
} from "../actions";
import { LeaderboardInfo } from "../leaderboard-info";
import * as S from "../styles";

const PAGE_SIZE = 20;
const MAX_TOTAL = 200;

export default function MuseLeaderboardPage() {
  const authState = useGlobalState("authState");
  const { routeToPage, stopPageLoading } = usePageRouter();
  const authResolved = useRef(false);

  const [entries, setEntries] = useState<MuseLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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

    getMuseLeaderboardAction(1, PAGE_SIZE).then((result) => {
      setLoading(false);
      if ("message" in result) {
        setError(true);
        return;
      }
      setEntries(result);
      setHasMore(result.length > 0 && result.length < MAX_TOTAL);
      setPage(1);
    });
  }, [authState]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    const result = await getMuseLeaderboardAction(next, PAGE_SIZE);
    setLoadingMore(false);
    if ("message" in result) return;
    const newTotal = entries.length + result.length;
    setEntries((prev) => [...prev, ...result]);
    setHasMore(result.length >= PAGE_SIZE && newTotal < MAX_TOTAL);
    setPage(next);
  }, [page, loadingMore, entries]);

  if (authState === "LOADING") return null;
  if (authState === "LOGGED_OUT" && !authResolved.current) return null;
  if (authState === "LOGGED_OUT") return null;

  return (
    <>
      <LeaderboardInfo
        type="muse"
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
      <S.Root>
        <S.Header>
          <S.BackButton type="button" onClick={() => routeToPage(ROUTES.Home)}>
            <IoChevronBack size={16} />
            Back
          </S.BackButton>
          <S.Eyebrow>Hall of Fame</S.Eyebrow>
          <S.TitleRow>
            <S.Title>Characters Leaderboard</S.Title>
            <S.InfoButton
              type="button"
              aria-label="About this leaderboard"
              onClick={() => setInfoOpen(true)}
            >
              i
            </S.InfoButton>
          </S.TitleRow>
          <S.Subtitle>
            The top characters on Novelist World ranked by XP earned.
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
            <span>✍️</span>
            No characters ranked yet — start writing!
          </S.EmptyState>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            {entries.slice(0, 3).length > 0 && (
              <S.TopThreeGroup>
                {entries.slice(0, 3).map((entry) => (
                  <MuseRow
                    key={entry.muse.id ?? `${entry.rank}`}
                    entry={entry}
                    inGroup
                    onClick={() =>
                      entry.muse.id
                        ? routeToPage(ROUTES.Muse.View(entry.muse.id))
                        : undefined
                    }
                  />
                ))}
              </S.TopThreeGroup>
            )}
            {entries.slice(3).length > 0 && (
              <S.List>
                {entries.slice(3).map((entry) => (
                  <MuseRow
                    key={entry.muse.id ?? `${entry.rank}`}
                    entry={entry}
                    onClick={() =>
                      entry.muse.id
                        ? routeToPage(ROUTES.Muse.View(entry.muse.id))
                        : undefined
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

function MuseRow({
  entry,
  inGroup,
  onClick,
}: {
  entry: MuseLeaderboardEntry;
  inGroup?: boolean;
  onClick: () => void;
}) {
  const { muse, rank, totalPoints, level } = entry;
  const rowAccent =
    muse.useAccent && muse.accent && muse.accent.trim() !== ""
      ? muse.accent
      : null;
  const fullName = muse.lastName
    ? `${muse.firstName} ${muse.lastName}`
    : muse.firstName;
  const fandomColor =
    muse.fandom?.color && muse.fandom.id !== "FANDOMLESS"
      ? muse.fandom.color
      : null;

  return (
    <S.Row
      $rank={rowAccent ? undefined : rank}
      $accent={inGroup ? undefined : rowAccent}
      $inGroup={inGroup}
      onClick={onClick}
    >
      <RankMarker rank={rank} inGroup={inGroup} />
      <S.AvatarWrapper $size={48}>
        {muse.image ? (
          <img src={muse.image} alt={muse.firstName} />
        ) : (
          <FaUser size={20} />
        )}
      </S.AvatarWrapper>
      <S.RowBody>
        <S.RowName>{fullName}</S.RowName>
        {muse.pennedBy && <S.RowSub>by @{muse.pennedBy.username}</S.RowSub>}
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
        {fandomColor && (
          <S.ChipRow>
            <S.FandomChip $color={fandomColor}>{muse.fandom.name}</S.FandomChip>
          </S.ChipRow>
        )}
      </S.RowBody>
    </S.Row>
  );
}
