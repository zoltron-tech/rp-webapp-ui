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
  FiX,
} from "react-icons/fi";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type {
  ShareChapterData,
  ShareChapterPayload,
  SharePromptResult,
} from "@/lib/discord";
import type { StoryBoardEvent } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { CoverImage } from "../common";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";

interface ShareChapterDialogProps {
  event: StoryBoardEvent | null;
  storyboardName: string;
  open: boolean;
  onClose: () => void;
}

type ShareState =
  | { status: "idle" }
  | { status: "sharing" }
  | { status: "success"; messageUrl: string }
  | { status: "error" };

export const ShareChapterDialog: FC<ShareChapterDialogProps> = ({
  event,
  storyboardName,
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

  useEffect(() => {
    if (open) {
      setCopied(false);
      setShareState({ status: "idle" });
    }
  }, [open]);

  // Mobile tray animation state (mirrors AppDropdownMenuMobile pattern).
  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  const chapterUrl =
    typeof window !== "undefined" && event?.id
      ? `${window.location.origin}${ROUTES.Story.Event.View(event.id)}`
      : "";
  const displayUrl = chapterUrl.replace(/^https?:\/\//, "");
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
    if (!chapterUrl) return;
    try {
      await navigator.clipboard.writeText(chapterUrl);
    } catch {
      errorToast("Couldn't copy the link. Please copy it manually.");
      return;
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!chapterUrl) return;
    try {
      await navigator.share({ title: event?.name ?? "", url: chapterUrl });
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

  const handleShareToDiscord = async () => {
    if (!chapterUrl || !event || shareState.status === "sharing") return;
    setShareState({ status: "sharing" });
    try {
      const chapterData: ShareChapterData = {
        coverSrc: event.avatar?.src ?? null,
        description: event.description,
        image: event.image,
        name: event.name,
        storyBoardId: event.storyBoardId,
        storyBoardName: storyboardName,
      };
      const payload: ShareChapterPayload = {
        chapter: chapterData,
        chapterUrl,
        novelistUsername: novelist?.username ?? "",
      };
      const res = await fetch("/api/discord/share-chapter", {
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

  if (typeof document === "undefined") return null;

  const isSharing = shareState.status === "sharing";

  let dialogContent: React.ReactNode;

  if (shareState.status === "success") {
    dialogContent = (
      <S.ResultState>
        <S.ResultIconWrap>
          <FiCheck />
        </S.ResultIconWrap>
        <S.ResultTitle>Shared to Discord!</S.ResultTitle>
        <S.ResultSubtitle>
          {event?.name} is now live in the NW Stories channel.
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
          <S.DialogTitle>Share chapter</S.DialogTitle>
          <S.DialogDescription>
            Post {event?.name || "this chapter"} to the NW Discord community,
            send it to a friend, or copy its link.
          </S.DialogDescription>
        </S.DialogHeader>

        <S.PreviewCard>
          <S.ChapterCover>
            <CoverImage src={event?.image ?? null} nwImage={event?.avatar} />
          </S.ChapterCover>
          <S.ChapterInfo>
            <S.ChapterName>{event?.name}</S.ChapterName>
            <S.ChapterStory>{storyboardName}</S.ChapterStory>
          </S.ChapterInfo>
        </S.PreviewCard>

        <S.LinkRow>
          <S.LinkBox>
            <FiLink aria-hidden="true" />
            <S.LinkUrl title={chapterUrl}>{displayUrl}</S.LinkUrl>
          </S.LinkBox>
          <S.CopyButton
            type="button"
            $copied={copied}
            onClick={handleCopyLink}
            aria-label={copied ? "Link copied" : "Copy chapter link"}
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
        aria-label="Share chapter"
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

export default ShareChapterDialog;
