"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowRight, FiCheck, FiCopy, FiX } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";
import * as DropS from "@/components/profile-more-dropdown/styled";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { ScoreBadgeIcon } from "@/utils/badge-icons";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

interface InviteFriendsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const InviteFriendsDialog: FC<InviteFriendsDialogProps> = ({
  open,
  onClose,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const user = useGlobalState("user");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { routeToPage } = usePageRouter();

  const [copied, setCopied] = useState(false);

  // Mobile tray animation state (mirrors SharePromptDialog pattern)
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  const inviteUrl =
    typeof window !== "undefined" && user?.username
      ? `${window.location.origin}${ROUTES.Login}?referralUser=${encodeURIComponent(user.username)}&register=1`
      : "";

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

  // Close on Escape (desktop)
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, isMobile, onClose]);

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewReferrals = () => {
    onClose();
    routeToPage(ROUTES.Profile.Referrals);
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
      <S.InviteIconWrap>
        <HiUserAdd />
      </S.InviteIconWrap>
      <S.InviteTitle>Invite Friends</S.InviteTitle>
      <S.InviteDescription>
        Share your link to grow your circle and unlock creative perks as you
        level up.
      </S.InviteDescription>
      <S.InviteXPNote>
        <ScoreBadgeIcon size={16} />
        People who join using your link will earn you points whenever they gain
        Score.
      </S.InviteXPNote>
      <S.InviteLinkBox>
        <S.InviteLinkText
          href={inviteUrl}
          onClick={(e) => {
            e.preventDefault();
            handleCopy();
          }}
        >
          {inviteUrl}
        </S.InviteLinkText>
        <S.InviteCopyButton
          type="button"
          aria-label="Copy invite link"
          onClick={handleCopy}
        >
          {copied ? <FiCheck /> : <FiCopy />}
        </S.InviteCopyButton>
      </S.InviteLinkBox>
      <S.InviteReferralsLink type="button" onClick={handleViewReferrals}>
        View your circle
        <FiArrowRight />
      </S.InviteReferralsLink>
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
          <S.InviteTrayContent>{dialogContent}</S.InviteTrayContent>
        </DropS.MobileSheet>
      </DropS.MobilePortalRoot>,
      document.body,
    );
  }

  // ── Desktop: centered dialog ─────────────────────────────────────────────
  if (!open) return null;
  return createPortal(
    <>
      <S.InviteDialogOverlay onClick={onClose} />
      <S.InviteDialogContent
        role="dialog"
        aria-modal="true"
        aria-label="Invite Friends"
        className={classNames([accent, theme])}
      >
        <S.InviteDialogClose onClick={onClose} aria-label="Close">
          <FiX />
        </S.InviteDialogClose>
        {dialogContent}
      </S.InviteDialogContent>
    </>,
    document.body,
  );
};
