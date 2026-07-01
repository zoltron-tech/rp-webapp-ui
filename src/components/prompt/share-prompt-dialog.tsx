"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaDiscord } from "react-icons/fa6";
import { FiCheck, FiCopy, FiExternalLink, FiX } from "react-icons/fi";
import type { SharePromptPayload, SharePromptResult } from "@/lib/discord";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { ROUTES } from "@/utils/constants/routes";
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

  // Reset to idle each time the dialog opens
  useEffect(() => {
    if (open) setShareState({ status: "idle" });
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

  const handleCopyLink = () => {
    if (!promptUrl) return;
    navigator.clipboard.writeText(promptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToDiscord = async () => {
    if (!promptUrl || shareState.status === "sharing") return;
    setShareState({ status: "sharing" });
    try {
      const payload: SharePromptPayload = { promptUrl, prompt, novelistUsername: novelist?.username ?? "" };
      const res = await fetch("/api/discord/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as SharePromptResult;
        setShareState({ status: "success", messageUrl: data.messageUrl });
      } else {
        setShareState({ status: "error" });
      }
    } catch {
      errorToast("Failed to share to Discord. Please try again.");
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

  // ── Content: success / error / idle ─────────────────────────────────────
  let dialogContent: React.ReactNode;

  if (shareState.status === "success") {
    dialogContent = (
      <S.ShareResultState>
        <S.ShareResultIconWrap $ok={true}>
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
      </S.ShareResultState>
    );
  } else if (shareState.status === "error") {
    dialogContent = (
      <S.ShareResultState>
        <S.ShareResultIconWrap $ok={false}>
          <FiX />
        </S.ShareResultIconWrap>
        <S.ShareResultTitle>Couldn't share</S.ShareResultTitle>
        <S.ShareResultSubtitle>
          Something went wrong posting to Discord. Please try again.
        </S.ShareResultSubtitle>
        <S.ShareRetryButton
          type="button"
          onClick={() => setShareState({ status: "idle" })}
        >
          Try again
        </S.ShareRetryButton>
      </S.ShareResultState>
    );
  } else {
    dialogContent = (
      <>
        <S.ShareDialogTitle>Share this Prompt</S.ShareDialogTitle>
        <S.ShareDialogDescription>
          Copy the link or share it directly in the NW Discord community.
        </S.ShareDialogDescription>
        <S.ShareLinkBox>
          <S.ShareLinkText
            href={promptUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              handleCopyLink();
            }}
          >
            {promptUrl}
          </S.ShareLinkText>
          <S.ShareCopyButton
            type="button"
            aria-label="Copy prompt link"
            onClick={handleCopyLink}
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </S.ShareCopyButton>
        </S.ShareLinkBox>
        <S.ShareDiscordButton
          type="button"
          onClick={handleShareToDiscord}
          disabled={shareState.status === "sharing"}
        >
          <FaDiscord aria-hidden="true" />
          {shareState.status === "sharing" ? "Sharing..." : "Share in Community"}
        </S.ShareDiscordButton>
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
        role="dialog"
        aria-modal="true"
        aria-label="Share this Prompt"
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
