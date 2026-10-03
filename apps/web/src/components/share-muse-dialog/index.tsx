"use client";

import type { Muse } from "@nw/types";
import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaDiscord } from "react-icons/fa6";
import {
  FiAlertCircle,
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiLink,
  FiShare2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type {
  ShareMuseData,
  ShareMusePayload,
  SharePromptResult,
} from "@/lib/discord";
import { ROUTES } from "@/utils/constants/routes";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";
import { shareMuseToDiscord } from "@nw/api/endpoints/community";
import { api } from "@/lib/api";

interface ShareMuseDialogProps {
  muse: Muse | null;
  open: boolean;
  onClose: () => void;
}

type ShareState =
  | { status: "idle" }
  | { status: "sharing" }
  | { status: "success"; messageUrl: string }
  | { status: "error" };

export const ShareMuseDialog: FC<ShareMuseDialogProps> = ({
  muse,
  open,
  onClose,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const novelist = useGlobalState("novelist");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { errorToast } = useUIContext();

  const [copied, setCopied] = useState(false);
  const [shareState, setShareState] = useState<ShareState>({ status: "idle" });
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset transient state each time the dialog opens
  useEffect(() => {
    if (open) {
      setShareState({ status: "idle" });
      setCopied(false);
    }
  }, [open]);

  // Mobile tray animation state (mirrors AppDropdownMenuMobile pattern)
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  const museUrl =
    typeof window !== "undefined" && muse?.id
      ? `${window.location.origin}${ROUTES.Muse.View(muse.id)}`
      : "";
  const displayUrl = museUrl.replace(/^https?:\/\//, "");
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

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

  const handleCopyLink = async () => {
    if (!museUrl) return;
    try {
      await navigator.clipboard.writeText(museUrl);
    } catch {
      errorToast("Couldn't copy the link. Please copy it manually.");
      return;
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const museName = muse
    ? [muse.firstName, muse.lastName].filter(Boolean).join(" ")
    : "";

  const handleNativeShare = async () => {
    if (!museUrl) return;
    try {
      await navigator.share({ title: museName, url: museUrl });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  const handleShareToDiscord = async () => {
    if (!museUrl || !muse || shareState.status === "sharing") return;
    setShareState({ status: "sharing" });
    try {
      const museData: ShareMuseData = {
        accent: muse.accent,
        avatarSrc: muse.avatar?.src ?? null,
        cardBackgroundSrc: muse.cardBackground?.src ?? null,
        extraAttributes: muse.extraAttributes,
        fandom: { name: muse.fandom.name },
        firstName: muse.firstName,
        image: muse.image,
        lastName: muse.lastName,
        level: muse.level,
        nicknames: muse.nicknames,
        note: muse.note,
        pennedBy: {
          firstName: muse.pennedBy.firstName,
          id: muse.pennedBy.id,
          image: muse.pennedBy.image,
          lastName: muse.pennedBy.lastName,
          username: muse.pennedBy.username,
        },
        tags: muse.tags.map((t) => ({ label: t.label })),
        useAccent: muse.useAccent,
      };
      const payload: ShareMusePayload = {
        muse: museData,
        museUrl,
        novelistUsername: novelist?.username ?? "",
      };
      const result = await shareMuseToDiscord(api, payload);
      if (result && "messageUrl" in result) {
        setShareState({ messageUrl: result.messageUrl, status: "success" });
      } else {
        setShareState({ status: "error" });
      }
    } catch {
      setShareState({ status: "error" });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 50) closeTray();
  };

  if (typeof document === "undefined") return null;

  const accentColor = muse?.useAccent ? muse.accent : null;
  const isSharing = shareState.status === "sharing";

  // ── Content: success vs share form (errors show inline in the form) ─────
  let dialogContent: React.ReactNode;

  if (shareState.status === "success") {
    dialogContent = (
      <S.ResultState>
        <S.ResultIconWrap>
          <FiCheck />
        </S.ResultIconWrap>
        <S.ResultTitle>Shared to Discord!</S.ResultTitle>
        <S.ResultSubtitle>
          {muse?.firstName} is now live in the NW Community channel.
        </S.ResultSubtitle>
        <S.ViewButton
          href={shareState.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiExternalLink aria-hidden="true" />
          View message
        </S.ViewButton>
        <S.DoneButton type="button" onClick={isMobile ? closeTray : onClose}>
          Done
        </S.DoneButton>
      </S.ResultState>
    );
  } else {
    dialogContent = (
      <>
        <S.DialogHeader>
          <S.DialogTitle>Share muse</S.DialogTitle>
          <S.DialogDescription>
            Post {muse?.firstName || "this muse"} to the NW Discord community
            and invite others to write alongside them.
          </S.DialogDescription>
        </S.DialogHeader>

        <S.PreviewCard>
          {muse?.image ? (
            <S.MuseAvatar src={muse.image} alt={museName} />
          ) : (
            <S.MuseAvatarPlaceholder>
              <FiUser aria-hidden="true" />
            </S.MuseAvatarPlaceholder>
          )}
          <S.MuseInfo>
            <S.MuseName $color={accentColor}>{museName}</S.MuseName>
            <S.MuseFandom>{muse?.fandom.name}</S.MuseFandom>
          </S.MuseInfo>
        </S.PreviewCard>

        <S.LinkRow>
          <S.LinkBox>
            <FiLink aria-hidden="true" />
            <S.LinkUrl title={museUrl}>{displayUrl}</S.LinkUrl>
          </S.LinkBox>
          <S.CopyButton
            type="button"
            $copied={copied}
            onClick={handleCopyLink}
            aria-label={copied ? "Link copied" : "Copy muse link"}
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? "Copied" : "Copy"}
          </S.CopyButton>
          <S.SrAnnounce aria-live="polite">
            {copied ? "Link copied to clipboard" : ""}
          </S.SrAnnounce>
        </S.LinkRow>

        <S.Actions>
          <S.DiscordButton
            type="button"
            onClick={handleShareToDiscord}
            disabled={isSharing}
          >
            {isSharing ? (
              <S.Spinner aria-hidden="true" />
            ) : (
              <FaDiscord aria-hidden="true" />
            )}
            {isSharing ? "Sharing..." : "Share in Community"}
          </S.DiscordButton>
          {canNativeShare && (
            <S.NativeButton type="button" onClick={handleNativeShare}>
              <FiShare2 aria-hidden="true" />
              More options
            </S.NativeButton>
          )}
          {shareState.status === "error" && (
            <S.ErrorText role="alert">
              <FiAlertCircle aria-hidden="true" />
              Couldn't post to Discord. Please try again.
            </S.ErrorText>
          )}
        </S.Actions>
      </>
    );
  }

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
        aria-label="Share muse"
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
