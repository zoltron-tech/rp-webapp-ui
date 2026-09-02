"use client";

import { isCompactViewport } from "@nw/utils/platform";
import classNames from "classnames";
import { useNavigate } from "@/lib/navigation";
import { type FC, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import appInstallLogo from "@/assets/images/NW-mobile-app-install-logo.png";
import * as S from "@/components/user-menu/styles";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import * as L from "./styled";

export const InstallAppPrompt: FC = () => {
  const showInstallAppPrompt = useGlobalState("showInstallAppPrompt");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const setGlobalState = useGlobalStoreSet();
  const navigate = useNavigate();
  const isMobile = useMemo(() => isCompactViewport(), []);

  const handleSkip = useCallback(() => {
    setGlobalState({ showInstallAppPrompt: false });
    navigate(ROUTES.Onboarding);
  }, [navigate, setGlobalState]);

  if (!showInstallAppPrompt) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <S.DiscordDialogOverlay onClick={handleSkip} />
      <S.DiscordDialogContent
        role="dialog"
        aria-modal="true"
        aria-label="Install Novelist World App"
        className={classNames([accent, theme])}
      >
        <S.DiscordDialogClose onClick={handleSkip} aria-label="Close">
          <FiX />
        </S.DiscordDialogClose>
        <S.DiscordDialogImage
          src={appInstallLogo}
          alt="Install Novelist World"
        />
        <S.DiscordDialogTitle>
          Install Novelist World as App
        </S.DiscordDialogTitle>
        <S.DiscordDialogDescription>
          Add Novelist World to your home screen for the best experience:
        </S.DiscordDialogDescription>
        {isMobile ? (
          <ol
            style={{
              alignSelf: "flex-start",
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-small)",
              lineHeight: 1.8,
              margin: "0",
              paddingInlineStart: "20px",
            }}
          >
            <li>
              Tap the <strong>Share</strong> button in your browser toolbar.
            </li>
            <li>
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </li>
            <li>
              Tap <strong>Add</strong> to confirm.
            </li>
          </ol>
        ) : (
          <S.DiscordDialogDescription>
            Open Novelist World on your phone and follow the install
            instructions to add it to your home screen.
          </S.DiscordDialogDescription>
        )}
        <L.SkipButton type="button" onClick={handleSkip}>
          Skip for now
        </L.SkipButton>
      </S.DiscordDialogContent>
    </>,
    document.body,
  );
};
