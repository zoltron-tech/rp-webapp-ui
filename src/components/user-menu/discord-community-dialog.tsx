"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaDiscord } from "react-icons/fa6";
import { FiCheck, FiCopy, FiLink, FiX } from "react-icons/fi";
import discordLogo from "@/assets/images/NW-Discord-l.ogo.png";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styles";
import { env } from "@/lib/env";

interface DiscordCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  /** Optional extra content rendered below the Join button (e.g. a skip link). */
  footer?: React.ReactNode;
}

/** Invite dialog for the NW Community Discord server. Renders as a centered
 *  dialog on desktop and a slide-up tray on mobile. */
export const DiscordCommunityDialog: FC<DiscordCommunityDialogProps> = ({
  open,
  onClose,
  footer,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { errorToast } = useUIContext();

  const inviteUrl = env.DISCORD_INVITE_URL ?? "";
  const displayUrl = inviteUrl.replace(/^https?:\/\//, "");

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

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
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
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

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      errorToast("Couldn't copy the link. Please copy it manually.");
      return;
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
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
      <S.DiscordDialogImage src={discordLogo} alt="NW Community Discord" />
      <S.DiscordDialogTitle>Be a part of NW Community</S.DiscordDialogTitle>
      <S.DiscordDialogDescription>
        Connect & hangout with fellow novelists, get the latest app updates,
        share feedback and receive support; all in the Novelist World Discord
        server.
      </S.DiscordDialogDescription>
      {inviteUrl && (
        <S.DiscordInviteLinkRow>
          <S.DiscordInviteLinkBox>
            <FiLink aria-hidden="true" />
            <S.DiscordInviteLinkUrl title={inviteUrl}>
              {displayUrl}
            </S.DiscordInviteLinkUrl>
          </S.DiscordInviteLinkBox>
          <S.DiscordInviteCopyButton
            type="button"
            $copied={copied}
            onClick={handleCopyInvite}
            aria-label={copied ? "Invite link copied" : "Copy invite link"}
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? "Copied" : "Copy"}
          </S.DiscordInviteCopyButton>
          <S.DiscordSrAnnounce aria-live="polite">
            {copied ? "Invite link copied to clipboard" : ""}
          </S.DiscordSrAnnounce>
        </S.DiscordInviteLinkRow>
      )}
      <S.DiscordJoinButton
        type="button"
        onClick={() => {
          if (inviteUrl)
            window.open(inviteUrl, "_blank", "noopener,noreferrer");
        }}
        disabled={!inviteUrl}
      >
        <FaDiscord aria-hidden="true" />
        Join Server
      </S.DiscordJoinButton>
      {footer}
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
          <S.DiscordTrayContent>{dialogContent}</S.DiscordTrayContent>
        </DropS.MobileSheet>
      </DropS.MobilePortalRoot>,
      document.body,
    );
  }

  // ── Desktop: centered dialog ─────────────────────────────────────────────
  if (!open) return null;
  return createPortal(
    <>
      <S.DiscordDialogOverlay onClick={onClose} />
      <S.DiscordDialogContent
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Join NW Community on Discord"
        className={classNames([accent, theme])}
      >
        <S.DiscordDialogClose onClick={onClose} aria-label="Close">
          <FiX />
        </S.DiscordDialogClose>
        {dialogContent}
      </S.DiscordDialogContent>
    </>,
    document.body,
  );
};
