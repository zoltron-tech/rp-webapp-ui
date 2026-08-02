"use client";

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
  ShareProfileData,
  ShareProfilePayload,
  SharePromptResult,
} from "@/lib/discord";
import type { Novelist } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { mainVerseMuses } from "@/utils/muse";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";

interface ShareProfileDialogProps {
  novelist: Novelist | null;
  open: boolean;
  onClose: () => void;
}

type ShareState =
  | { status: "idle" }
  | { status: "sharing" }
  | { status: "success"; messageUrl: string }
  | { status: "error" };

/** How many muses get spotlighted in the Discord embed. */
const FEATURED_MUSE_LIMIT = 3;

export const ShareProfileDialog: FC<ShareProfileDialogProps> = ({
  novelist,
  open,
  onClose,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const currentNovelist = useGlobalState("novelist");
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

  const profileUrl =
    typeof window !== "undefined" && novelist?.username
      ? `${window.location.origin}${ROUTES.Profile.View(novelist.username).Index}`
      : "";
  const displayUrl = profileUrl.replace(/^https?:\/\//, "");
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
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch {
      errorToast("Couldn't copy the link. Please copy it manually.");
      return;
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const novelistName = novelist
    ? [novelist.firstName, novelist.lastName].filter(Boolean).join(" ")
    : "";

  const handleNativeShare = async () => {
    if (!profileUrl) return;
    try {
      await navigator.share({ title: novelistName, url: profileUrl });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  const handleShareToDiscord = async () => {
    if (!profileUrl || !novelist || shareState.status === "sharing") return;
    setShareState({ status: "sharing" });
    try {
      const profileData: ShareProfileData = {
        about: novelist.about,
        avatarSrc: novelist.avatar?.src ?? null,
        bannerSrc: novelist.banner?.src ?? null,
        createdAt: novelist.createdAt ?? null,
        firstName: novelist.firstName,
        friendsCount: novelist.friendsCount,
        id: novelist.id,
        image: novelist.image,
        isVerified: novelist.isVerified,
        lastName: novelist.lastName,
        museCount: novelist.museCount,
        muses: mainVerseMuses(novelist.muses)
          .filter((m): m is typeof m & { id: string } => !!m.id)
          .slice(0, FEATURED_MUSE_LIMIT)
          .map((m) => ({
            id: m.id,
            name: [m.firstName, m.lastName].filter(Boolean).join(" "),
          })),
        note: novelist.note?.text ?? null,
        palette: typeof novelist.palette === "number" ? novelist.palette : null,
        username: novelist.username,
      };
      const payload: ShareProfilePayload = {
        novelistUsername: currentNovelist?.username ?? "",
        profile: profileData,
        profileUrl,
      };
      const res = await fetch("/api/discord/share-profile", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as SharePromptResult;
        setShareState({ messageUrl: data.messageUrl, status: "success" });
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

  const isSharing = shareState.status === "sharing";
  const isOwnProfile = !!novelist?.id && novelist.id === currentNovelist?.id;
  // Avatar crop wins; fall back to the raw profile image when there isn't one
  const previewAvatarSrc = novelist?.avatar?.src || novelist?.image || "";

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
          {isOwnProfile ? "Your profile" : `@${novelist?.username}`} is now live
          in the NW Community channel.
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
          <S.DialogTitle>Share profile</S.DialogTitle>
          <S.DialogDescription>
            {isOwnProfile
              ? "Post your profile to the NW Discord community and invite others to write with you."
              : `Post ${novelist?.firstName || "this novelist"} to the NW Discord community so others can find them.`}
          </S.DialogDescription>
        </S.DialogHeader>

        <S.PreviewCard>
          {previewAvatarSrc ? (
            <S.ProfileAvatar src={previewAvatarSrc} alt={novelistName} />
          ) : (
            <S.ProfileAvatarPlaceholder>
              <FiUser aria-hidden="true" />
            </S.ProfileAvatarPlaceholder>
          )}
          <S.ProfileInfo>
            <S.ProfileName>{novelistName}</S.ProfileName>
            <S.ProfileUsername>@{novelist?.username}</S.ProfileUsername>
          </S.ProfileInfo>
        </S.PreviewCard>

        <S.LinkRow>
          <S.LinkBox>
            <FiLink aria-hidden="true" />
            <S.LinkUrl title={profileUrl}>{displayUrl}</S.LinkUrl>
          </S.LinkBox>
          <S.CopyButton
            type="button"
            $copied={copied}
            onClick={handleCopyLink}
            aria-label={copied ? "Link copied" : "Copy profile link"}
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
        aria-label="Share profile"
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

export default ShareProfileDialog;
