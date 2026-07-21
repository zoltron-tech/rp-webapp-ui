"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiCopy, FiLink, FiShare2, FiX } from "react-icons/fi";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { StoryBoard } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { CoverImage } from "../common";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";

interface ShareStoryDialogProps {
  storyboard: StoryBoard | null;
  open: boolean;
  onClose: () => void;
}

export const ShareStoryDialog: FC<ShareStoryDialogProps> = ({
  storyboard,
  open,
  onClose,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;
  const { errorToast } = useUIContext();

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  // Mobile tray animation state (mirrors AppDropdownMenuMobile pattern).
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  const storyUrl =
    typeof window !== "undefined" && storyboard?.id
      ? `${window.location.origin}${ROUTES.Story.View(storyboard.id)}`
      : "";
  const displayUrl = storyUrl.replace(/^https?:\/\//, "");
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

  const handleCopyLink = async () => {
    if (!storyUrl) return;
    try {
      await navigator.clipboard.writeText(storyUrl);
    } catch {
      errorToast("Couldn't copy the link. Please copy it manually.");
      return;
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!storyUrl) return;
    try {
      await navigator.share({ title: storyboard?.name ?? "", url: storyUrl });
    } catch {
      // User dismissed the share sheet — nothing to do.
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

  const fandom = storyboard?.fandom ?? null;
  const isFandomless = !fandom?.id || fandom.id === "FANDOMLESS";
  const fandomLabel = isFandomless
    ? "Original"
    : fandom?.name || fandom?.id?.replaceAll("_", " ");

  const dialogContent = (
    <>
      <S.DialogHeader>
        <S.DialogTitle>Share story</S.DialogTitle>
        <S.DialogDescription>
          Send {storyboard?.name || "this story"} to a friend or copy its
          link.
        </S.DialogDescription>
      </S.DialogHeader>

      <S.PreviewCard>
        <S.StoryCover>
          <CoverImage
            src={storyboard?.image ?? null}
            nwImage={storyboard?.avatar}
          />
        </S.StoryCover>
        <S.StoryInfo>
          <S.StoryName>{storyboard?.name}</S.StoryName>
          <S.StoryFandom>{fandomLabel}</S.StoryFandom>
        </S.StoryInfo>
      </S.PreviewCard>

      <S.LinkRow>
        <S.LinkBox>
          <FiLink aria-hidden="true" />
          <S.LinkUrl title={storyUrl}>{displayUrl}</S.LinkUrl>
        </S.LinkBox>
        <S.CopyButton
          type="button"
          $copied={copied}
          onClick={handleCopyLink}
          aria-label={copied ? "Link copied" : "Copy story link"}
        >
          {copied ? <FiCheck /> : <FiCopy />}
          {copied ? "Copied" : "Copy"}
        </S.CopyButton>
        <S.SrAnnounce aria-live="polite">
          {copied ? "Link copied to clipboard" : ""}
        </S.SrAnnounce>
      </S.LinkRow>

      {canNativeShare && (
        <S.Actions>
          <S.NativeButton type="button" onClick={handleNativeShare}>
            <FiShare2 aria-hidden="true" />
            More options
          </S.NativeButton>
        </S.Actions>
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
        aria-label="Share story"
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

export default ShareStoryDialog;
