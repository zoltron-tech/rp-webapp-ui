"use client";

import { isCompactViewport } from "@nw/utils/platform";
import classNames from "classnames";
import { type FC, useMemo } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import appInstallLogo from "@/assets/images/NW-mobile-app-install-logo.png";
import * as S from "@/components/user-menu/styles";
import { useGlobalState } from "@/context/store/stores";
import { assetUrl } from "@/lib/asset";

interface InstallAppDialogProps {
  open: boolean;
  onClose: () => void;
}

export const InstallAppDialog: FC<InstallAppDialogProps> = ({
  open,
  onClose,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const isMobile = useMemo(() => isCompactViewport(), []);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <S.DiscordDialogOverlay onClick={onClose} />
      <S.DiscordDialogContent
        role="dialog"
        aria-modal="true"
        aria-label="Install Novelist World App"
        className={classNames([accent, theme])}
      >
        <S.DiscordDialogClose onClick={onClose} aria-label="Close">
          <FiX />
        </S.DiscordDialogClose>
        <S.DiscordDialogImage
          src={assetUrl(appInstallLogo)}
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
      </S.DiscordDialogContent>
    </>,
    document.body,
  );
};
