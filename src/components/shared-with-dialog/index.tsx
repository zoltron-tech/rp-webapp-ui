"use client";

import type { Friend } from "@nw/types";
import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronRight, FiX } from "react-icons/fi";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { ROUTES } from "@/utils/constants/routes";
import { EmailVerifiedBadge } from "../common";
import { AvatarNew } from "../common/avatar-new";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";

interface SharedWithDialogProps {
  friends: Friend[];
  open: boolean;
  onClose: () => void;
  /** Context line under the title. */
  description?: string;
}

/** Lists the friends a CUSTOM-privacy prompt is shared with. Renders as a
 *  centered dialog on desktop and a slide-up tray on mobile; each row
 *  navigates to that friend's profile. */
export const SharedWithDialog: FC<SharedWithDialogProps> = ({
  friends,
  open,
  onClose,
  description = "Only these friends can see this prompt.",
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { routeToPage } = usePageRouter();

  const dialogRef = useRef<HTMLDivElement>(null);

  // Mobile tray animation state (mirrors AppDropdownMenuMobile pattern)
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

  // Close on Escape
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

  // Move focus into the dialog when it opens (desktop)
  useEffect(() => {
    if (open && !isMobile) dialogRef.current?.focus();
  }, [open, isMobile]);

  const handleFriendClick = (username: string) => {
    if (isMobile) closeTray();
    else onClose();
    routeToPage(ROUTES.Profile.View(username).Index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) closeTray();
  };

  if (typeof document === "undefined") return null;

  const dialogContent = (
    <>
      <S.DialogHeader>
        <S.TitleRow>
          <S.DialogTitle>Shared with</S.DialogTitle>
          {friends.length > 0 && <S.CountBadge>{friends.length}</S.CountBadge>}
        </S.TitleRow>
        <S.DialogDescription>{description}</S.DialogDescription>
      </S.DialogHeader>

      {friends.length > 0 ? (
        // Contain touch gestures so scrolling the list doesn't swipe the tray closed
        <S.FriendList
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {friends.map((friend) => (
            <S.FriendRow
              key={friend.id}
              type="button"
              onClick={() => handleFriendClick(friend.username)}
              aria-label={`View ${friend.firstName}'s profile`}
            >
              <AvatarNew
                className="sharedWithAvatar"
                src={friend.image}
                alt={friend.username}
                nwImage={friend.avatar}
              />
              <S.FriendInfo>
                <S.FriendNameRow>
                  <S.FriendName>
                    {[friend.firstName, friend.lastName]
                      .filter(Boolean)
                      .join(" ")}
                  </S.FriendName>
                  {friend.isVerified && <EmailVerifiedBadge size={14} />}
                </S.FriendNameRow>
                <S.FriendUsername>@{friend.username}</S.FriendUsername>
              </S.FriendInfo>
              <FiChevronRight aria-hidden="true" />
            </S.FriendRow>
          ))}
        </S.FriendList>
      ) : (
        <S.EmptyText>No friends selected.</S.EmptyText>
      )}

      <S.DoneButton type="button" onClick={isMobile ? closeTray : onClose}>
        Done
      </S.DoneButton>
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
          <S.TrayContent>{dialogContent}</S.TrayContent>
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
        aria-label="Shared with"
        className={classNames([accent, theme])}
      >
        <S.DialogClose onClick={onClose} aria-label="Close">
          <FiX />
        </S.DialogClose>
        {dialogContent}
      </S.DialogContent>
    </>,
    document.body,
  );
};
