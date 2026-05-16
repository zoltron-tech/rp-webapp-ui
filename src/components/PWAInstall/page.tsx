"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      // Install accepted — prompt dismissed, no further action needed
    }
    setDeferredPrompt(null);
  };

  return (
    <S.PageContainer className={classNames([accent, theme])}>
      <S.MainHeading>Install Novelist World</S.MainHeading>
      <S.MainSubtext>
        Get the best experience by installing our app on your device.
      </S.MainSubtext>
      <S.Button onClick={handleInstall}>📱 Install App</S.Button>
    </S.PageContainer>
  );
}
