"use client";

import classNames from "classnames";
import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaDiscord } from "react-icons/fa6";
import { FiCheck, FiCopy, FiExternalLink, FiUser, FiX } from "react-icons/fi";
import type { ShareMuseData, ShareMusePayload, SharePromptResult } from "@/lib/discord";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as DropS from "../profile-more-dropdown/styled";
import * as S from "./styled";

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

  useEffect(() => {
    if (open) setShareState({ status: "idle" });
  }, [open]);

  const [trayOpen, setTrayOpen] = useState(false);
  const [trayVisible, setTrayVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startY, setStartY] = useState(0);

  const museUrl =
    typeof window !== "undefined" && muse?.id
      ? `${window.location.origin}${ROUTES.Muse.View(muse.id)}`
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

  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, isMobile, onClose]);

  const handleCopyLink = () => {
    if (!museUrl) return;
    navigator.clipboard.writeText(museUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToDiscord = async () => {
    if (!museUrl || !muse || shareState.status === "sharing") return;
    setShareState({ status: "sharing" });
    try {
      const museData: ShareMuseData = {
        firstName: muse.firstName,
        lastName: muse.lastName,
        fandom: { name: muse.fandom.name },
        tags: muse.tags.map((t) => ({ label: t.label })),
        note: muse.note,
        image: muse.image,
        avatarSrc: muse.avatar?.src ?? null,
        cardBackgroundSrc: muse.cardBackground?.src ?? null,
        nicknames: muse.nicknames,
        extraAttributes: muse.extraAttributes,
        level: muse.level,
        useAccent: muse.useAccent,
        accent: muse.accent,
        pennedBy: {
          id: muse.pennedBy.id,
          username: muse.pennedBy.username,
          firstName: muse.pennedBy.firstName,
          lastName: muse.pennedBy.lastName,
          image: muse.pennedBy.image,
        },
      };
      const payload: ShareMusePayload = { museUrl, muse: museData, novelistUsername: novelist?.username ?? "" };
      const res = await fetch("/api/discord/share-muse", {
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

  const museName = muse
    ? [muse.firstName, muse.lastName].filter(Boolean).join(" ")
    : "";
  const accentColor = muse?.useAccent ? muse.accent : null;

  // ── Content: success / error / idle ─────────────────────────────────────
  let dialogContent: React.ReactNode;

  if (shareState.status === "success") {
    dialogContent = (
      <S.ResultState>
        <S.ResultIconWrap $ok={true}>
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
      </S.ResultState>
    );
  } else if (shareState.status === "error") {
    dialogContent = (
      <S.ResultState>
        <S.ResultIconWrap $ok={false}>
          <FiX />
        </S.ResultIconWrap>
        <S.ResultTitle>Couldn't share</S.ResultTitle>
        <S.ResultSubtitle>
          Something went wrong posting to Discord. Please try again.
        </S.ResultSubtitle>
        <S.RetryButton
          type="button"
          onClick={() => setShareState({ status: "idle" })}
        >
          Try again
        </S.RetryButton>
      </S.ResultState>
    );
  } else {
    dialogContent = (
      <>
        <S.MuseHeader>
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
        </S.MuseHeader>
        <S.Divider />
        <S.SubText>
          Share this muse in the NW Discord community and invite others to write
          alongside them.
        </S.SubText>
        <S.LinkBox>
          <S.LinkText
            href={museUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              handleCopyLink();
            }}
          >
            {museUrl}
          </S.LinkText>
          <S.CopyButton
            type="button"
            aria-label="Copy muse link"
            onClick={handleCopyLink}
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </S.CopyButton>
        </S.LinkBox>
        <S.DiscordButton
          type="button"
          onClick={handleShareToDiscord}
          disabled={shareState.status === "sharing"}
        >
          <FaDiscord aria-hidden="true" />
          {shareState.status === "sharing" ? "Sharing..." : "Share in Community"}
        </S.DiscordButton>
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
        role="dialog"
        aria-modal="true"
        aria-label="Share this Muse"
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
