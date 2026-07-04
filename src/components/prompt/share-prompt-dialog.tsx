"use client";

import classNames from "classnames";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
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
import type { SharePromptPayload, SharePromptResult } from "@/lib/discord";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import { AvatarNew } from "../common/avatar-new";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";

interface SharePromptDialogProps {
  promptId: string;
  prompt: SharePromptPayload["prompt"];
  open: boolean;
  onClose: () => void;
}

type ShareState =
  | { status: "idle" }
  | { status: "sharing" }
  | { status: "success"; messageUrl: string }
  | { status: "error" };

/** Collapse the prompt's HTML body into a short plain-text excerpt for the
 *  preview card. */
const toPlainText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

export const SharePromptDialog: FC<SharePromptDialogProps> = ({
  promptId,
  prompt,
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

  const promptUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${ROUTES.Prompt.View(promptId)}`
      : "";
  const displayUrl = promptUrl.replace(/^https?:\/\//, "");
  const previewText = useMemo(() => toPlainText(prompt.text), [prompt.text]);
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
    if (!promptUrl) return;
    try {
      await navigator.clipboard.writeText(promptUrl);
    } catch {
      errorToast("Couldn't copy the link. Please copy it manually.");
      return;
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!promptUrl) return;
    try {
      await navigator.share({
        title: `Prompt by ${prompt.source.name}`,
        url: promptUrl,
      });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  const handleShareToDiscord = async () => {
    if (!promptUrl || shareState.status === "sharing") return;
    setShareState({ status: "sharing" });
    try {
      const payload: SharePromptPayload = {
        novelistUsername: novelist?.username ?? "",
        prompt,
        promptUrl,
      };
      const res = await fetch("/api/discord/share", {
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

  // ── Content: success vs share form (errors show inline in the form) ─────
  let dialogContent: React.ReactNode;

  if (shareState.status === "success") {
    dialogContent = (
      <S.ShareResultState>
        <S.ShareResultIconWrap>
          <FiCheck />
        </S.ShareResultIconWrap>
        <S.ShareResultTitle>Shared to Discord!</S.ShareResultTitle>
        <S.ShareResultSubtitle>
          The prompt is now live in the NW Community channel.
        </S.ShareResultSubtitle>
        <S.ShareViewButton
          href={shareState.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiExternalLink aria-hidden="true" />
          View message
        </S.ShareViewButton>
        <S.ShareDoneButton
          type="button"
          onClick={isMobile ? closeTray : onClose}
        >
          Done
        </S.ShareDoneButton>
      </S.ShareResultState>
    );
  } else {
    dialogContent = (
      <>
        <S.ShareDialogHeader>
          <S.ShareDialogTitle>Share prompt</S.ShareDialogTitle>
          <S.ShareDialogDescription>
            Post it to the NW Discord community or copy its link.
          </S.ShareDialogDescription>
        </S.ShareDialogHeader>

        <S.SharePreviewCard>
          <AvatarNew
            className="sharePreviewAvatar"
            src={prompt.source.image}
            alt={prompt.source.name}
            nwImage={prompt.source.avatar}
          />
          <S.SharePreviewBody>
            <S.SharePreviewMeta>
              <S.SharePreviewName>{prompt.source.name}</S.SharePreviewName>
              <S.SharePreviewDate dateTime={prompt.createdOn}>
                {toFormattedDate(prompt.createdOn)}
              </S.SharePreviewDate>
            </S.SharePreviewMeta>
            {previewText && (
              <S.SharePreviewText>{previewText}</S.SharePreviewText>
            )}
          </S.SharePreviewBody>
          {prompt.media && (
            <S.SharePreviewThumb
              src={prompt.media}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </S.SharePreviewCard>

        <S.ShareLinkRow>
          <S.ShareLinkBox>
            <FiLink aria-hidden="true" />
            <S.ShareLinkUrl title={promptUrl}>{displayUrl}</S.ShareLinkUrl>
          </S.ShareLinkBox>
          <S.ShareCopyButton
            type="button"
            $copied={copied}
            onClick={handleCopyLink}
            aria-label={copied ? "Link copied" : "Copy prompt link"}
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? "Copied" : "Copy"}
          </S.ShareCopyButton>
          <S.ShareSrAnnounce aria-live="polite">
            {copied ? "Link copied to clipboard" : ""}
          </S.ShareSrAnnounce>
        </S.ShareLinkRow>

        <S.ShareActions>
          <S.ShareDiscordButton
            type="button"
            onClick={handleShareToDiscord}
            disabled={isSharing}
          >
            {isSharing ? (
              <S.ShareSpinner aria-hidden="true" />
            ) : (
              <FaDiscord aria-hidden="true" />
            )}
            {isSharing ? "Sharing..." : "Share in Community"}
          </S.ShareDiscordButton>
          {canNativeShare && (
            <S.ShareNativeButton type="button" onClick={handleNativeShare}>
              <FiShare2 aria-hidden="true" />
              More options
            </S.ShareNativeButton>
          )}
          {shareState.status === "error" && (
            <S.ShareErrorText role="alert">
              <FiAlertCircle aria-hidden="true" />
              Couldn't post to Discord. Please try again.
            </S.ShareErrorText>
          )}
        </S.ShareActions>
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
          <S.ShareTrayContent>{dialogContent}</S.ShareTrayContent>
        </DropS.MobileSheet>
      </DropS.MobilePortalRoot>,
      document.body,
    );
  }

  // ── Desktop: centered dialog ─────────────────────────────────────────────
  if (!open) return null;
  return createPortal(
    <>
      <S.ShareDialogOverlay onClick={onClose} />
      <S.ShareDialogContent
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Share prompt"
        className={classNames([accent, theme])}
      >
        <S.ShareDialogClose onClick={onClose} aria-label="Close">
          <FiX />
        </S.ShareDialogClose>
        {dialogContent}
      </S.ShareDialogContent>
    </>,
    document.body,
  );
};
