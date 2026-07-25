"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCheck,
  FiClock,
  FiMessageCircle,
  FiUser,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { getConversationByUsernameAction } from "@/app/rp/conversations/actions";
import { getReactionLikersAction } from "@/app/rp/novelists/actions";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteFriendRequest,
  sendFriendRequest,
} from "@/app/rp/profile/actions";
import { Button } from "@/components/common";
import { LoadMore } from "@/components/load-more/page";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { Friend } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "../common/avatar-new";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";

const PAGE_SIZE = 12;
const SKELETON_ROWS = 5;

interface ReactionLikersDialogProps {
  open: boolean;
  onClose: () => void;
  targetId: string;
  /** Count already known from the surrounding heart button — shown in the
   *  header immediately, before the list itself has loaded. */
  initialCount?: number;
}

/** Lists the novelists who reacted to a target (activity/story/prompt/media/etc),
 *  each row showing their connection status to the viewer with the matching
 *  action button. Follows the same desktop dialog / mobile tray shell as
 *  StoryboardMembersDialog. */
export const ReactionLikersDialog: FC<ReactionLikersDialogProps> = ({
  open,
  onClose,
  targetId,
  initialCount,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const currentNovelist = useGlobalState("novelist");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { routeToPage, baseDataLoader } = usePageRouter();
  const { errorToast, successToast } = useUIContext();

  const [likers, setLikers] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Mobile tray animation state (mirrors StoryboardMembersDialog).
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  const openTray = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setTrayVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTrayOpen(true));
    });
  };

  const closeTray = () => {
    setTrayOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setTrayVisible(false);
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (!isMobile) return;
    if (open) openTray();
    else if (trayVisible) closeTray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isMobile) closeTray();
      else onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile, onClose]);

  useEffect(() => {
    if (open && !isMobile) dialogRef.current?.focus();
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !targetId) return;
    let cancelled = false;
    setLoading(true);
    setPage(1);
    getReactionLikersAction(targetId, 1, PAGE_SIZE).then((data) => {
      if (cancelled) return;
      setLikers(data);
      setHasMore(data.length >= PAGE_SIZE);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, targetId]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await getReactionLikersAction(targetId, nextPage, PAGE_SIZE);
    setLikers((prev) => [...prev, ...data]);
    setHasMore(data.length >= PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleClose = () => {
    if (isMobile) closeTray();
    else onClose();
  };

  const patchConnection = (novelistId: string, next: string | null) => {
    setLikers((prev) =>
      prev.map((f) => (f.id === novelistId ? { ...f, connection: next } : f)),
    );
  };

  const handleProfileClick = (username: string) => {
    handleClose();
    routeToPage(ROUTES.Profile.View(username).Index);
  };

  const handleMessage = async (friend: Friend) => {
    if (messaging) return;
    setMessaging(friend.id);
    const conversation = await baseDataLoader(() =>
      getConversationByUsernameAction(friend.username),
    );
    setMessaging(null);
    if (conversation?.id) {
      handleClose();
      routeToPage(ROUTES.Conversation.View(conversation.id));
    } else {
      errorToast("Could not open conversation. Please try again.");
    }
  };

  const handleAddFriend = async (friend: Friend) => {
    if (pending) return;
    setPending(friend.id);
    const response = await sendFriendRequest(friend.id);
    setPending(null);
    if (response?.message === API_MESSAGE.Success) {
      patchConnection(friend.id, "FRIEND_REQUEST_SENT");
      successToast("Friend request sent");
    } else {
      errorToast("Could not send friend request. Please try again.");
    }
  };

  const handleCancelRequest = async (friend: Friend) => {
    if (pending) return;
    setPending(friend.id);
    const response = await cancelFriendRequest(friend.id);
    setPending(null);
    if (response?.message === API_MESSAGE.Success) {
      patchConnection(friend.id, null);
      successToast("Friend request cancelled");
    } else {
      errorToast("Could not cancel friend request. Please try again.");
    }
  };

  const handleAcceptRequest = async (friend: Friend) => {
    if (pending) return;
    setPending(friend.id);
    const response = await acceptFriendRequest(friend.id);
    setPending(null);
    if (response?.message === API_MESSAGE.Success) {
      patchConnection(friend.id, "FRIEND");
      successToast("Friend request accepted");
    } else {
      errorToast("Could not accept friend request. Please try again.");
    }
  };

  const handleDeclineRequest = async (friend: Friend) => {
    if (pending) return;
    setPending(friend.id);
    const response = await deleteFriendRequest(friend.id);
    setPending(null);
    if (response?.message === API_MESSAGE.Success) {
      patchConnection(friend.id, null);
      successToast("Friend request declined");
    } else {
      errorToast("Could not decline friend request. Please try again.");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) closeTray();
  };

  const renderRowActions = (friend: Friend) => {
    const isCurrentUser = currentNovelist?.username === friend.username;
    const isMessagingThis = messaging === friend.id;
    const isPendingThis = pending === friend.id;

    if (isCurrentUser) {
      return (
        <Button
          variant="secondary"
          size="sm"
          className="icon-only"
          onClick={() => handleProfileClick(friend.username)}
        >
          <FiUser />
        </Button>
      );
    }

    if (friend.connection === "FRIEND") {
      return (
        <>
          <Button
            variant="primary"
            size="sm"
            className={isMessagingThis ? "messaging" : undefined}
            onClick={() => handleMessage(friend)}
          >
            <FiMessageCircle />
            {isMessagingThis ? "Opening…" : "Message"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="icon-only"
            onClick={() => handleProfileClick(friend.username)}
          >
            <FiUser />
          </Button>
        </>
      );
    }

    if (friend.connection === "FRIEND_REQUEST_SENT") {
      return (
        <Button
          variant="negative"
          size="sm"
          className={isPendingThis ? "messaging" : "pending"}
          onClick={() => handleCancelRequest(friend)}
        >
          <FiClock />
          {isPendingThis ? "Cancelling…" : "Cancel"}
        </Button>
      );
    }

    if (friend.connection === "FRIEND_REQUEST_RECEIVED") {
      return (
        <>
          <Button
            variant="positive"
            size="sm"
            className="icon-only"
            disabled={isPendingThis}
            onClick={() => handleAcceptRequest(friend)}
          >
            <FiCheck />
          </Button>
          <Button
            variant="negative"
            size="sm"
            className="icon-only"
            disabled={isPendingThis}
            onClick={() => handleDeclineRequest(friend)}
          >
            <FiX />
          </Button>
        </>
      );
    }

    return (
      <Button
        variant="primary"
        size="sm"
        className={isPendingThis ? "messaging" : undefined}
        onClick={() => handleAddFriend(friend)}
      >
        <FiUserPlus />
        {isPendingThis ? "Sending…" : "Add Friend"}
      </Button>
    );
  };

  if (typeof document === "undefined") return null;

  const headerCount = initialCount ?? likers.length;

  const body = (
    <>
      {loading ? (
        <S.FriendList>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <S.ShimmerRow key={i}>
              <S.ShimmerCircle />
              <S.ShimmerInfo>
                <S.ShimmerLine $width="55%" />
                <S.ShimmerLine $width="35%" $height="9px" />
              </S.ShimmerInfo>
              <S.ShimmerButton />
            </S.ShimmerRow>
          ))}
        </S.FriendList>
      ) : likers.length > 0 ? (
        <S.FriendList
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {likers.map((friend) => (
            <S.FriendRow key={friend.id}>
              <AvatarNew
                className="likerAvatar"
                src={friend.image}
                alt={friend.username}
                nwImage={friend.avatar}
                onClick={() => handleProfileClick(friend.username)}
              />
              <S.FriendInfo
                type="button"
                onClick={() => handleProfileClick(friend.username)}
              >
                <S.FriendNameRow>
                  <S.FriendName>
                    {[friend.firstName, friend.lastName]
                      .filter(Boolean)
                      .join(" ")}
                  </S.FriendName>
                </S.FriendNameRow>
                <S.FriendUsername>@{friend.username}</S.FriendUsername>
              </S.FriendInfo>
              <S.RowActions>{renderRowActions(friend)}</S.RowActions>
            </S.FriendRow>
          ))}
        </S.FriendList>
      ) : (
        <S.EmptyText>No reactions yet.</S.EmptyText>
      )}
      {!loading && (
        <LoadMore
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      )}
    </>
  );

  // ── Mobile: slide-up tray ────────────────────────────────────────────────
  if (isMobile) {
    if (!trayVisible) return null;
    return createPortal(
      <DropS.MobilePortalRoot className={classNames([accent, theme])}>
        <DropS.MobileBackdrop $open={trayOpen} onClick={closeTray} />
        <DropS.MobileSheet
          $open={trayOpen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <DropS.DragHandle />
          <S.TrayContent>
            <S.MobileHeaderBar>
              <S.TitleRow>
                <S.DialogTitle>Reactions</S.DialogTitle>
                <S.CountBadge>{headerCount}</S.CountBadge>
              </S.TitleRow>
              <S.MobileConfirmButton
                type="button"
                aria-label="Close"
                onClick={closeTray}
              >
                <FiX size={16} />
              </S.MobileConfirmButton>
            </S.MobileHeaderBar>
            {body}
          </S.TrayContent>
        </DropS.MobileSheet>
      </DropS.MobilePortalRoot>,
      document.body,
    );
  }

  // ── Desktop: centered dialog ─────────────────────────────────────────────
  if (!open) return null;
  return createPortal(
    <>
      <S.DialogOverlay onClick={onClose} />
      <S.DialogContent
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Reactions"
        className={classNames([accent, theme])}
      >
        <S.DialogClose onClick={onClose} aria-label="Close">
          <FiX />
        </S.DialogClose>
        <S.DialogHeader>
          <S.TitleRow>
            <S.DialogTitle>Reactions</S.DialogTitle>
            <S.CountBadge>{headerCount}</S.CountBadge>
          </S.TitleRow>
        </S.DialogHeader>
        {body}
      </S.DialogContent>
    </>,
    document.body,
  );
};

export default ReactionLikersDialog;
