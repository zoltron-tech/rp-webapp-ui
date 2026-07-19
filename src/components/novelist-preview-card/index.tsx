"use client";

import { type FC, useState } from "react";
import {
  FiCheck,
  FiClock,
  FiFeather,
  FiMessageCircle,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
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
import { ACCENT_MAP } from "@/types/theme";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { mainVerseMuses } from "@/utils/muse";
import * as S from "./styles";

const MAX_MUSES = 4;

type MusePreview = {
  id: string | null;
  firstName: string;
  lastName: string;
  image: string | null;
  originalVerseId?: string | null;
};

type NovelistPreview = {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string;
  image: string;
  avatar?: NWImage | null;
  banner?: NWImage | null;
  palette?: number;
  isVerified: boolean;
  connection: string | null;
  muses?: MusePreview[];
  mutualFriendCount?: number;
};

type Props = {
  novelist: NovelistPreview;
};

export const NovelistPreviewCard: FC<Props> = ({ novelist }) => {
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
  const accent =
    ACCENT_MAP[novelist.palette as keyof typeof ACCENT_MAP] ?? ACCENT_MAP[0];
  const mainMuses = mainVerseMuses(novelist.muses);
  const visibleMuses = mainMuses.slice(0, MAX_MUSES);
  const extraMuses = mainMuses.length - MAX_MUSES;
  const museCount = mainMuses.length;
  const mutualCount = novelist.mutualFriendCount ?? 0;

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
          <S.BtnContent>
            <FiUser />
            View Profile
          </S.BtnContent>
        </Button>
      );
    }

    if (isCurrentUser) {
      return (
        <Button variant="primary" onClick={onVisitProfile}>
          <S.BtnContent>
            <FiUser />
            Open Profile
          </S.BtnContent>
        </Button>
      );
    }

    if (connection === "FRIEND") {
      return (
        <>
          <Button
            variant="primary"
            className={messaging ? "messaging" : undefined}
            onClick={onMessage}
          >
            <S.BtnContent>
              <FiMessageCircle />
              {messaging ? "Opening…" : "Message"}
            </S.BtnContent>
          </Button>
          <Button
            variant="secondary"
            className="icon-only"
            onClick={onVisitProfile}
          >
            <S.BtnContent>
              <FiUser />
            </S.BtnContent>
          </Button>
        </>
      );
    }

    if (connection === "FRIEND_REQUEST_SENT") {
      return (
        <Button
          variant="negative"
          className={requestLoading ? "messaging" : "pending"}
          onClick={onCancelRequest}
        >
          <S.BtnContent>
            <FiClock />
            {requestLoading ? "Cancelling…" : "Cancel Request"}
          </S.BtnContent>
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
            <S.BtnContent>
              <FiCheck />
              {requestLoading ? "…" : "Accept"}
            </S.BtnContent>
          </Button>
          <Button
            variant="negative"
            className={requestLoading ? "messaging" : undefined}
            onClick={onDeclineRequest}
          >
            <S.BtnContent>
              <FiX />
              {requestLoading ? "…" : "Decline"}
            </S.BtnContent>
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
        <S.BtnContent>
          <FiUserPlus />
          {requestLoading ? "Sending…" : "Add Friend"}
        </S.BtnContent>
      </Button>
    );
  };

  return (
    <S.CardWrapper className={accent}>
      <S.Banner
        $src={novelist.banner?.src ?? null}
        $x={novelist.banner?.crop?.x}
        $y={novelist.banner?.crop?.y}
        $scale={
          novelist.banner?.crop && novelist.banner.crop.width > 0
            ? novelist.banner.crop.width / 100
            : undefined
        }
      />
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
              <EmailVerifiedBadge size={15} />
            </S.VerifiedBadgeWrapper>
          </ShouldRender>
        </S.AvatarWrapper>

        <S.Info>
          <S.Title>
            {novelist.firstName} {novelist.lastName}
          </S.Title>
          <S.UsernameStyled username={novelist.username} />
        </S.Info>

        <S.StatsRow>
          <ShouldRender if={museCount > 0}>
            <S.Stat>
              <FiFeather />
              <b>{museCount}</b>&nbsp;muses
            </S.Stat>
          </ShouldRender>
          <ShouldRender if={museCount > 0 && mutualCount > 0}>
            <S.StatSep />
          </ShouldRender>
          <ShouldRender if={mutualCount > 0}>
            <S.Stat>
              <FiUsers />
              <b>{mutualCount}</b>&nbsp;mutual
            </S.Stat>
          </ShouldRender>
        </S.StatsRow>

        <S.MuseBlock>
          <S.MuseLabel>Muses</S.MuseLabel>
          <S.MuseContent>
            {visibleMuses.length > 0 ? (
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
            ) : (
              <S.MusesEmpty>No muses yet</S.MusesEmpty>
            )}
          </S.MuseContent>
        </S.MuseBlock>

        <S.ButtonContainer>{renderButton()}</S.ButtonContainer>
      </S.Body>
    </S.CardWrapper>
  );
};
