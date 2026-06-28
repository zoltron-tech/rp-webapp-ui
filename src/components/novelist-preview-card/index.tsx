"use client";

import { type FC, useState } from "react";
import { getConversationByUsernameAction } from "@/app/rp/conversations/actions";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteFriendRequest,
  sendFriendRequest,
} from "@/app/rp/profile/actions";
import { Button, EmailVerifiedBadge, ShouldRender } from "@/components/common";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { NWImage } from "@/types/novelist";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

const MAX_MUSES = 4;

type MusePreview = {
  id: string | null;
  firstName: string;
  lastName: string;
  image: string | null;
};

type NovelistPreview = {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string;
  image: string;
  avatar?: NWImage | null;
  isVerified: boolean;
  connection: string | null;
  muses?: MusePreview[];
  mutualFriendCount?: number;
};

type Props = {
  novelist: NovelistPreview;
  rank?: number;
};

export const NovelistPreviewCard: FC<Props> = ({ novelist, rank }) => {
  const rankTier =
    rank === 1 || rank === 2 || rank === 3 ? rank : undefined;
  const { routeToPage, baseDataLoader } = usePageRouter();
  const currentNovelist = useGlobalState("novelist");
  const setGlobalState = useGlobalStoreSet();
  const { errorToast, successToast } = useUIContext();
  const [messaging, setMessaging] = useState(false);
  const [connection, setConnection] = useState<string | null>(
    novelist.connection,
  );
  const [requestLoading, setRequestLoading] = useState(false);

  const isCurrentUser = currentNovelist?.username === novelist.username;
  const visibleMuses = novelist.muses?.slice(0, MAX_MUSES) ?? [];
  const extraMuses = (novelist.muses?.length ?? 0) - MAX_MUSES;

  const patchCachedConnection = (newConnection: string | null) => {
    setGlobalState((prev) => ({
      friendSuggestions:
        prev.friendSuggestions?.map((s) =>
          s.id === novelist.id ? { ...s, connection: newConnection } : s,
        ) ?? null,
    }));
  };
  const onVisitProfile = () => {
    routeToPage(ROUTES.Profile.View(novelist.username).Index);
  };

  const onVisitMuse = (museId: string) => {
    routeToPage(ROUTES.Muse.View(museId));
  };

  const onMessage = async () => {
    if (messaging) return;
    setMessaging(true);
    const conversation = await baseDataLoader(() =>
      getConversationByUsernameAction(novelist.username),
    );
    setMessaging(false);
    if (conversation?.id) {
      routeToPage(ROUTES.Conversation.View(conversation.id));
    } else {
      errorToast("Could not open conversation. Please try again.");
    }
  };

  const onAddFriend = async () => {
    if (requestLoading) return;
    setRequestLoading(true);
    const response = await sendFriendRequest(novelist.id);
    setRequestLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      setConnection("FRIEND_REQUEST_SENT");
      patchCachedConnection("FRIEND_REQUEST_SENT");
      successToast("Friend request sent");
    } else {
      errorToast("Could not send friend request. Please try again.");
    }
  };

  const onCancelRequest = async () => {
    if (requestLoading) return;
    setRequestLoading(true);
    const response = await cancelFriendRequest(novelist.id);
    setRequestLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      setConnection(null);
      patchCachedConnection(null);
      successToast("Friend request cancelled");
    } else {
      errorToast("Could not cancel friend request. Please try again.");
    }
  };

  const onAcceptRequest = async () => {
    if (requestLoading) return;
    setRequestLoading(true);
    const response = await acceptFriendRequest(novelist.id);
    setRequestLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      setConnection("FRIEND");
      patchCachedConnection("FRIEND");
      successToast("Friend request accepted");
    } else {
      errorToast("Could not accept friend request. Please try again.");
    }
  };

  const onDeclineRequest = async () => {
    if (requestLoading) return;
    setRequestLoading(true);
    const response = await deleteFriendRequest(novelist.id);
    setRequestLoading(false);
    if (response?.message === API_MESSAGE.Success) {
      setConnection(null);
      patchCachedConnection(null);
      successToast("Friend request declined");
    } else {
      errorToast("Could not decline friend request. Please try again.");
    }
  };

  const renderButton = () => {
    if (!currentNovelist) {
      return (
        <Button variant="primary" onClick={onVisitProfile}>
          View Profile
        </Button>
      );
    }

    if (isCurrentUser) {
      return (
        <Button variant="primary" onClick={onVisitProfile}>
          Open Profile
        </Button>
      );
    }

    if (connection === "FRIEND") {
      return (
        <Button
          variant="primary"
          className={messaging ? "messaging" : undefined}
          onClick={onMessage}
        >
          {messaging ? "Opening…" : "Message"}
        </Button>
      );
    }

    if (connection === "FRIEND_REQUEST_SENT") {
      return (
        <Button
          variant="negative"
          className={requestLoading ? "messaging" : undefined}
          onClick={onCancelRequest}
        >
          {requestLoading ? "Cancelling…" : "Cancel Request"}
        </Button>
      );
    }

    if (connection === "FRIEND_REQUEST_RECEIVED") {
      return (
        <>
          <Button
            variant="positive"
            className={requestLoading ? "messaging" : undefined}
            onClick={onAcceptRequest}
          >
            {requestLoading ? "…" : "Accept"}
          </Button>
          <Button
            variant="negative"
            className={requestLoading ? "messaging" : undefined}
            onClick={onDeclineRequest}
          >
            {requestLoading ? "…" : "Decline"}
          </Button>
        </>
      );
    }

    return (
      <Button
        variant="primary"
        className={requestLoading ? "messaging" : undefined}
        onClick={onAddFriend}
      >
        {requestLoading ? "Sending…" : "Add Friend"}
      </Button>
    );
  };

  const onGoToLeaderboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    routeToPage(ROUTES.Leaderboard.Novelists);
  };

  const card = (
    <S.CardWrapper $rank={rankTier}>
      {rankTier && (
        <S.RankTag $rank={rankTier} onClick={onGoToLeaderboard}>
          <S.RankTagEmoji>{S.RANK_EMOJI[rankTier]}</S.RankTagEmoji>
          <S.RankTagText>
            <S.RankTagOrdinal $rank={rankTier}>
              {S.RANK_ORDINAL[rankTier]}
            </S.RankTagOrdinal>
            <S.RankTagSub>rank</S.RankTagSub>
          </S.RankTagText>
        </S.RankTag>
      )}
      <S.AccentStrip $rank={rankTier} />
      <S.Body>
        <S.AvatarWrapper>
          <S.StyledAvatar
            src={novelist.image ?? null}
            alt={novelist.firstName}
            name={`${novelist.firstName} ${novelist.lastName ?? ""}`}
            username={novelist.username}
            className="selectable"
            onClick={onVisitProfile}
            nwImage={novelist.avatar}
          />
          <ShouldRender if={novelist.isVerified}>
            <S.VerifiedBadgeWrapper>
              <EmailVerifiedBadge size={12} />
            </S.VerifiedBadgeWrapper>
          </ShouldRender>
        </S.AvatarWrapper>

        <S.Info>
          <S.Title>
            {novelist.firstName} {novelist.lastName}
          </S.Title>
          <S.UsernameStyled username={novelist.username} />
          <ShouldRender if={(novelist.mutualFriendCount ?? 0) > 0}>
            <S.MutualCount>
              {novelist.mutualFriendCount}{" "}
              {novelist.mutualFriendCount === 1
                ? "mutual friend"
                : "mutual friends"}
            </S.MutualCount>
          </ShouldRender>
        </S.Info>

        <ShouldRender if={visibleMuses.length > 0} preserveSpace>
          <S.MusesRow>
            {visibleMuses.map((muse) => (
              <S.MuseAvatar
                key={muse.id ?? muse.firstName}
                src={muse.image ?? null}
                alt={muse.firstName}
                name={`${muse.firstName} ${muse.lastName}`}
                onClick={() => muse.id && onVisitMuse(muse.id)}
              />
            ))}
            <ShouldRender if={extraMuses > 0}>
              <S.MuseOverflow>+{extraMuses}</S.MuseOverflow>
            </ShouldRender>
          </S.MusesRow>
        </ShouldRender>

        <S.ButtonContainer>{renderButton()}</S.ButtonContainer>
      </S.Body>
    </S.CardWrapper>
  );

  if (rankTier) {
    return <S.RankFrame $rank={rankTier}>{card}</S.RankFrame>;
  }

  return card;
};
