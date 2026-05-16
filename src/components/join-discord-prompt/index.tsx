"use client";

import classNames from "classnames";
import { type FC, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { FaDiscord } from "react-icons/fa6";
import { FiCheck, FiCopy, FiX } from "react-icons/fi";
import discordLogo from "@/assets/images/NW-Discord-l.ogo.png";
import * as L from "@/components/install-app-prompt/styled";
import * as S from "@/components/user-menu/styles";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";

export const JoinDiscordPrompt: FC = () => {
  const showJoinDiscordPrompt = useGlobalState("showJoinDiscordPrompt");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const setGlobalState = useGlobalStoreSet();
  const discordInviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "";
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleSkip = useCallback(() => {
    setGlobalState({ showJoinDiscordPrompt: false });
  }, [setGlobalState]);

  const handleCopyInvite = useCallback(() => {
    if (!discordInviteUrl) return;
    navigator.clipboard.writeText(discordInviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }, [discordInviteUrl]);

  if (!showJoinDiscordPrompt) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <S.DiscordDialogOverlay onClick={handleSkip} />
      <S.DiscordDialogContent
        role="dialog"
        aria-modal="true"
        aria-label="Join NW Community on Discord"
        className={classNames([accent, theme])}
      >
        <S.DiscordDialogClose onClick={handleSkip} aria-label="Close">
          <FiX />
        </S.DiscordDialogClose>
        <S.DiscordDialogImage
          src={discordLogo.src}
          alt="NW Community Discord"
        />
        <S.DiscordDialogTitle>be a part of NW Community</S.DiscordDialogTitle>
        <S.DiscordDialogDescription>
          Connect &amp; hangout with fellow novelists, get the latest app
          updates, share feedback and receive support; all in the Novelist World
          Discord server.
        </S.DiscordDialogDescription>
        {discordInviteUrl && (
          <S.DiscordInviteLinkBox>
            <S.DiscordInviteLinkText
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                handleCopyInvite();
              }}
            >
              {discordInviteUrl}
            </S.DiscordInviteLinkText>
            <S.DiscordInviteCopyButton
              type="button"
              aria-label="Copy invite link"
              onClick={handleCopyInvite}
            >
              {copiedInvite ? <FiCheck /> : <FiCopy />}
            </S.DiscordInviteCopyButton>
          </S.DiscordInviteLinkBox>
        )}
        <S.DiscordJoinButton
          type="button"
          onClick={() => {
            if (discordInviteUrl)
              window.open(discordInviteUrl, "_blank", "noopener,noreferrer");
          }}
          disabled={!discordInviteUrl}
        >
          <FaDiscord aria-hidden="true" />
          Join Server
        </S.DiscordJoinButton>
        <L.SkipButton type="button" onClick={handleSkip}>
          Skip for now
        </L.SkipButton>
      </S.DiscordDialogContent>
    </>,
    document.body,
  );
};
